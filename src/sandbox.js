const fs = require('fs')
const path = require('path')
const vm = require('vm')
const { extend: auth0Extend } = require('auth0-authz-rules-api')
const runtime = require('./runtime')

module.exports = exec

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
