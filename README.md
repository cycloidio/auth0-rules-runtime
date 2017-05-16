# Auth0 Rules Runtime

It pretends to be a simple wrapper of [webtask-runtime](https://github.com/auth0/webtask-runtime) for helping to write tests for [Auth0 rules](https://auth0.com/docs/rules)

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
