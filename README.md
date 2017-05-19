# Auth0 Rules Runtime

It's a wrapper of [webtask-runtime](https://github.com/auth0/webtask-runtime) for helping to write tests for [Auth0 rules](https://auth0.com/docs/rules).

## Considerations

This tool has been developed with NodeJS v7 and we don't think to add support for previous versions.

## Install

`npm install auth0-rules-runtime --save-dev`

NOTE _Yarn_ cannot be used because this tool run in NodeJS v7 (maybe in other previous version if it supports JS2015, but we haven't tried) and we use _auth0-authz-rules-api@^1.0.8_ NPM module for injecting the globals which the Auht0 rules can access, and through it we get a transient dependency (_tedious@~0.1.4_) which specifies that it doesn't support Node v7, so yarn rejects the installation.

We expect that this module won't affect in the rule testing, if you have a use case that it happens, please open an issue.

## How to use

This module exports just the next function:

```js
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
function exec (ruleScriptPath, user, context, configuration = {})
```

Example

```js
const ruleRt = require('auth0-rules-runtime')
const user = { /* Valid Auth0 user profile object */ }
const context = { /* Valid Auth0 context object */ }

run('rules/my-rule.js', user, context)
.then((result) => {
  if (result.error) {
    console.log(`An error has been returned to the callback. ${result.error.message}`)
    return
  }

  const userJSON = JSON.stringify(result.user)
  const ctxJSON = JSON.stringify(result.context)
  console.log(`Rule executed successfull. User: ${userJSON} | Ctx: ${ctxJSON}`)
})
.catch((e) => {
  if (e instanceof SchemaValiationError) {
    console.log(`There is an error in an entity object: ${e.message}`)
    console.log(e.validationErrors)
    return
  }

  console.log(`Oh no there is an Error: ${e.message}`)
})

```

**NOTE** if your rules use external dependencies (`require(...)`), they have to be installed by you in your local.

On the other hand, Auht0 rules can require a specific module version with the syntax `require('module@x.x.x')`, where `module` is the name of the NPM module to require and the `x.x.x`, the version to install. Because, such syntax is specific of the Auth0 rules, this module rewrite those `require` calls in the rules to normal ones, before running them, hence it's you responsibility to install the correct version, of each module that your rules use.

## Auth0 references

* [Rules](https://auth0.com/docs/rules)
* [Context Argument Properties in Rules](https://auth0.com/docs/rules/context)
* [Structure of the User Profile](https://auth0.com/docs/user-profile/user-profile-structure)

## Acknowledgements

We would like to give thanks to the creators and their contributors to the following projects

* [tawawa/auth0-rules-testharness](https://github.com/tawawa/auth0-rules-testharness) because it helped us to find the [repository which has the modules required to run Auth0 rules](https://github.com/auth0/auth0-authz-rules-api)
* [maxbeatty/auth0-rule-sandbox](https://github.com/maxbeatty/auth0-rule-sandbox) because brought to us the idea of running the rules in a sandbox using the [Node vm standard module](https://nodejs.org/api/vm.html)


## License

The MIT License (MIT) Copyright (c) 2017 cycloid.io Read the LICENSE file for more information.
