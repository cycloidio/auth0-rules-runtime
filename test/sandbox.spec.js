/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
const sandbox = require('../src/sandbox')

chai.use(dirtyChai)

describe('sandbox exports a function which', () => {
  const echoRulePath = 'test/fixtures/echo-rule.js'
  const globalsAccessRulePath = 'test/fixtures/globals-access-rule.js'
  const copyConfigToCtxRulePath = 'test/fixtures/copy-config-to-context-rule.js'
  const validUser = {
    blocked: false,
    email: 'something@null.com',
    email_verified: true,
    identities: [
      {
        provider: 'github',
        user_id: 1731633,
        connection: 'github',
        isSocial: true
      }
    ],
    last_ip: '8.8.8.8',
    last_login: '2017-03-02T09:37:57.139Z',
    logins_count: 10,
    name: 'Cycloid',
    nickname: 'cycloid',
    picture: 'https://avatars2.githubusercontent.com/u/1731633?v=3',
    created_at: '1970-01-01T13:11:34.478Z',
    updated_at: '2017-04-11T13:11:34.478Z',
    user_id: 'github|1731578'
  }
  const validCtx = {
    clientID: 'the-id',
    clientName: 'cycloid-service',
    connection: 'auth0',
    connectionStrategy: 'auth0',
    protocol: 'oidc-basic-profile',
    sessionID: 'session-id',
    request: {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/56.0.2924.87 Safari/537.36',
      ip: '188.6.125.49',
      hostname: 'mydomain.auth0.com',
      geoip:
      {
        country_code: 'GR',
        country_code3: 'GRC',
        country_name: 'Greece',
        city_name: 'Athens',
        latitude: 136.9733,
        longitude: 125.7233,
        time_zone: 'Europe/Athens',
        continent_code: 'EU'
      }
    }
  }

  it('returns a rejected promise if the configuration object is an object with only string values', () => {
    const config = { name: 'Cycloid', nested: { valid: false } }

    return sandbox(echoRulePath, validUser, validCtx, config).then(
      () => {
        throw new Error('Promise should be rejected')
      },
      (e) => {
        expect(e).to.have.property('message').and.to.match(/invalid configuration object/i)
      }
    )
  })

  it("returns a rejected promise if the script of the rule doesn't exist", () => {
    return sandbox('script/does-not-exist.js', validUser, validCtx).then(
      () => {
        throw new Error('Promise should be rejected')
      },
      (e) => {
        expect(e).to.have.property('message').and.to.match(/^error reading the rule script./i)
      }
    )
  })

  it('injects into the global context of the rule the same modules than Auth0', () => {
    return sandbox(globalsAccessRulePath, validUser, validCtx).then(
      (r) => {
        expect(r.user).to.have.property('shouldBeAllTrue').and.to.have.length(6)
        expect(r.user.shouldBeAllTrue).to.be.deep.equal(Array(6).fill(true))
      },
      (e) => {
        throw new Error(`Expected promise to b resolved, but got error: ${e.message}`)
      }
    )
  })

  it('sets into the rule global context the provided configuration object', () => {
    const config = { key: `${Math.random()}` }
    return sandbox(copyConfigToCtxRulePath, validUser, validCtx, config).then(
      (r) => {
        expect(r.context).to.have.property('configuration').and.to.be.deep.equal(config)
      },
      (e) => {
        throw new Error(`Expected promise to b resolved, but got error: ${e.message}`)
      }
    )
  })

  it('calls the runtime with the rule in the script and with the passed user and context objects', () => {
    return sandbox(echoRulePath, validUser, validCtx).then(
      (r) => {
        expect(r).not.to.have.property('error')
        expect(r).to.have.property('user').and.to.be.deep.equal(validUser)
        expect(r).to.have.property('context').and.to.be.deep.equal(validCtx)
      },
      (e) => {
        throw new Error(`Expected promise to b resolved, but got error: ${e.message}`)
      }
    )
  })
})
