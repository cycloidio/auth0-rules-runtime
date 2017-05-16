/* eslint-env mocha */

describe('runtime exports a function which', () => {
  it("returns a rejected promise if the user object doesn't fulfil the JSON schema")
  it("returns a rejected promise if the context object doesn't fulfil the JSON schema")
  it('calls the rule with an exact copy of the provided user and context object')
  it('returns an resolved promise with an object which has an error property if the rule calls the callback with an error')
  it('returns a resolved promise with an object which has the user and context property that the rule has used')
})
