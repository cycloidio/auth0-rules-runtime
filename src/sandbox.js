const fs = require('fs')
const path = require('path')
const vm = require('vm')
const { extend: auth0Extend } = require('auth0-authz-rules-api')
const runtime = require('./runtime')

module.exports = exec

/**
 * Executes the Auth0 rule contained in the script file with the provided
 * user and context object and optionally adding the configuration to the
 * global scope of the sandbox where the rule is actually executed.
 *
 * @param {string} ruleScriptPath - The path to the script which contains the
 *      Auth0 rule. The path can be absolute or relative. Relative paths are
 *      resolved from the Node process current working directory
 *      @see process.pwd()
 * @param {Object} user - The user data to pass to the rule.
 *      @see {@link https://auth0.com/docs/user-profile/user-profile-structure}
 *      and the specified JSON schema in json-schemas/rule-user-profile.json
 * @param {Object} context - The context data to pass to the rule.
 *      @see {@link https://auth0.com/docs/rules/context}
 *      and the specified JSON schema in json-schemas/rule-ctx.json
 * @param {Object} [configuration] - Key and values settings which are specified
 *      through the Rules UI. The value must be strings.
 * @returns {Promise} - Which rejects when there is any error out of the rule,
 *      for example, if you provided an invalid user or context or configuration
 *      object
 *      The promise resolve with an object with the data passed to the callback
 *      that the rule must call.
 *      The resolved object has an `error` property when the callback is called
 *      with an error. This object is the result of stringifying to JSON the
 *      original Error instance and parsed back to a JS Object. Otherwise the
 *      resolved object has an `user` an `
 *      - {Object} [error]: The property exists when the callback is called with
 *              an error. This object is the result of stringifying to JSON the
 *              original Error instance and parsed back to a JS Object.
 *      - {Object} [user]: The property exists when the callback is called
 *              without an error. It contains the value of the user object
 *              passed to the callback.
 *      - {Object} [context]: The property exists when the callback is called
 *              without an error. It contains the value of the context object
 *              passed to the callback.
 */
function exec (ruleScriptPath, user, context, configuration = {}) {
  try {
    verifyConfigurationObj(configuration)
  } catch (e) {
    return Promise.reject(e)
  }

  if (!path.isAbsolute(ruleScriptPath)) {
    ruleScriptPath = path.resolve(process.cwd(), ruleScriptPath)
  }

  let ruleCode
  try {
    ruleCode = fs.readFileSync(ruleScriptPath, 'utf8')
  } catch (e) {
    e.message = `Error reading the rule script. ${e.message}`
    return Promise.reject(e)
  }

  ruleCode = normalizeRequires(ruleCode)

  let auth0Env = {}
  auth0Extend(auth0Env)

  const sandbox = Object.assign(auth0Env, {
    require,
    runtime,
    configuration,
    ruleUser: user,
    ruleContext: context
  }, global)

  // Run the rule in the sandbox and return the result, which is the
  // promise returned by the runtime function
  return vm.runInNewContext(
    `runtime(${ruleCode}, ruleUser, ruleContext)`,
    sandbox
  )
}

function verifyConfigurationObj (config) {
  for (let [key, value] of Object.entries(config)) {
    if (typeof value !== 'string') {
      throw new Error(
        `Invalid configuration object. ${key} doesn't have a value of 'string' type`
      )
    }
  }
}

function normalizeRequires (ruleCode) {
  const regExp = /require\('.+(@[\d.]+)'\)/g
  const regExpVersion = /@[\d.]+/

  let ruleParts = []
  let chunk
  while ((chunk = regExp.exec(ruleCode)) !== null) {
    const requireCall = chunk[0].replace(regExpVersion, '')
    const [ before, after ] = ruleCode.split(chunk[0])
    ruleParts.push(before, requireCall, after)
  }

  if (ruleParts.length === 0) {
    return ruleCode
  }

  return ruleParts.join('')
}
