const runtime = require('webtask-runtime')
const jsonValidator = require('ajv')({ allErrors: true, useDefaults: true })
const { SchemaValiationError } = require('./errors')
const schemaUser = require('./json-schemas/rules-user-profile.json')
const schemaCtx = require('./json-schemas/rules-ctx.json')

const userValidate = jsonValidator.compile(schemaUser)
const ctxValidate = jsonValidator.compile(schemaCtx)

module.exports = run

function run (ruleFn, ruleUser, ruleContext) {
  if (!userValidate(ruleUser)) {
    return Promise.reject(
      new SchemaValiationError('Invalid user object', userValidate.errors)
    )
  }

  if (!ctxValidate(ruleContext)) {
    return Promise.reject(
      new SchemaValiationError('Invalid context object', ctxValidate.errors)
    )
  }

  let user, context
  try {
    // Copy user and context to avoid modifications on the values passed
    // by parameter
    user = jsDataObjCopy(ruleUser)
    context = jsDataObjCopy(ruleContext)
  } catch (e) {
    return Promise.reject(
      new Error(`Invalid rule user or context data object. ${e.message}`)
    )
  }

  return new Promise(function (resolve, reject) {
    runtime.simulate(
      wrapRule(ruleFn), { secrets: { user, context } }, unwrapResponse(resolve, reject)
    )
  })
}

function jsDataObjCopy (obj) {
  return JSON.parse(JSON.stringify(obj))
}

function wrapRule (ruleFn) {
  return function webtask (ctx, cb) {
    ruleFn(ctx.secrets.user, ctx.secrets.context, function (err, user, context) {
      if (err) {
        cb(null, { ruleError: err })
        return
      }

      cb(null, { ruleUser: user, ruleContext: context })
    })
  }
}

function unwrapResponse (resolve, reject) {
  return function responseCallback (res) {
    let payload
    try {
      payload = JSON.parse(res.payload)
    } catch (e) {
      // Catch JSON parse errors
      e.message = `Error parsing the response payload. ${e.message}`
      reject(e)
      return
    }

    // Error in the webtask runtime
    if (payload.error) {
      const rawErr = payload.error
      const err = new Error(rawErr.message)

      for (let f in rawErr) {
        err[f] = rawErr[f]
      }

      reject(err)
      return
    }

    if (payload.ruleError) {
      resolve({
        error: payload.ruleError
      })
      return
    }

    resolve({
      user: payload.ruleUser,
      context: payload.ruleContext
    })
  }
}
