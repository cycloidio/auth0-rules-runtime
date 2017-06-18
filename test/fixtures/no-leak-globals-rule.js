function (user, context, cb) {
  var unaccessible = []

  try {
    unaccessible.push(!(companyName !== undefined))
  } catch (_) {
    // It's expected to have an error here because companyName shouldn't be
    // bound to the global scope
    unaccessible.push(true)
  }

  try {
    unaccessible.push(!(firm !== undefined))
  } catch (_) {
    // It's expected to have an error here because companyName shouldn't be
    // bound to the global scope
    unaccessible.push(true)
  }

  try {
    unaccessible.push(!(__runtime !== undefined))
  } catch (_) {
    // It's expected to have an error here because companyName shouldn't be
    // bound to the global scope
    unaccessible.push(true)
  }

  try {
    unaccessible.push(!(__ruleUser !== undefined))
  } catch (_) {
    // It's expected to have an error here because companyName shouldn't be
    // bound to the global scope
    unaccessible.push(true)
  }

  try {
    unaccessible.push(!(__ruleContext !== undefined))
  } catch (_) {
    // It's expected to have an error here because companyName shouldn't be
    // bound to the global scope
    unaccessible.push(true)
  }

  cb(null, {
    accessible: [
      !!process, !!Buffer, !!setTimeout, !!setImmediate, !!console, !!clearTimeout
    ],
    unaccessible: unaccessible,
    context
  })
}
