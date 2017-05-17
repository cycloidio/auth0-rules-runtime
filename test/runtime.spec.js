/* eslint-env mocha */
const chai = require('chai')
const dirtyChai = require('dirty-chai')
const expect = chai.expect
const runtime = require('../src/runtime')
const { SchemaValidationError } = require('../src/errors')

chai.use(dirtyChai)

describe('runtime exports a function which', () => {
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

  const echoRule = function (user, ctx, cb) {
    cb(null, user, ctx)
  }

  it("returns a rejected promise if the user object doesn't fulfil the JSON schema", () => {
    // This user doesn't have last_ip and name properties
    const user = Object.assign({}, validUser)
    delete user.last_ip
    delete user.name

    return runtime(echoRule, user, validCtx).then(
      () => {
        throw new Error('Promise should be rejected')
      },
      (e) => {
        expect(e).to.be.instanceOf(SchemaValidationError)
        expect(e.message).to.match(/invalid user object/i)
        expect(e.validationErrors).to.have.length(2)
      })
  })

  it("returns a rejected promise if the context object doesn't fulfil the JSON schema", () => {
    // This context doesn't have connection and request.geoip properties
    const ctx = Object.assign({}, validCtx)
    ctx.request = Object.assign({}, validCtx.request)
    delete ctx.connection
    delete ctx.request.geoip

    return runtime(echoRule, validUser, ctx).then(
      () => {
        throw new Error('Promise should be rejected')
      },
      (e) => {
        expect(e).to.be.instanceOf(SchemaValidationError)
        expect(e.message).to.match(/invalid context object/i)
        expect(e.validationErrors).to.have.length(2)
      })
  })

  it('calls the rule with an exact copy of the provided user and context object', () => {
    return runtime(echoRule, validUser, validCtx).then(
      (r) => {
        expect(r).not.to.have.property('error')
        expect(r).to.have.property('user').and.not.to.be.equal(validUser)
        expect(r.user).and.to.be.deep.equal(validUser)
        expect(r).to.have.property('context').and.not.to.be.equal(validCtx)
        expect(r.context).and.to.be.deep.equal(validCtx)
      },
      (e) => {
        throw new Error(`Expected promise to b resolved, but got error: ${e.message}`)
      }
    )
  })

  it('returns an resolved promise with an object which has an error property if the rule calls the callback with an error', () => {
    const rErr = new Error(`Return this error ${Math.random()}`)
    const rule = function (user, ctx, cb) { cb(rErr) }

    return runtime(rule, validUser, validCtx).then(
      (r) => {
        expect(r).not.to.have.property('user')
        expect(r).not.to.have.property('context')
        expect(r).to.have.property('error').and.to.be.deep.equal(
          JSON.parse(JSON.stringify(rErr))
        )
      },
      (e) => {
        throw new Error(`Expected promise to b resolved, but got error: ${e.message}`)
      }
    )
  })

  it('returns a resolved promise with an object which has the user and context property that the rule has used', () => {
    const name = `Cycloid ${Math.random()}`
    const connection = `test ${Math.random()}`
    const rule = function (user, ctx, cb) { cb(null, { name }, { connection }) }

    return runtime(rule, validUser, validCtx).then(
      (r) => {
        expect(r).not.to.have.property('error')
        expect(r).to.have.property('user').and.to.be.deep.equal({ name })
        expect(r).to.have.property('context').and.to.be.deep.equal({ connection })
      },
      (e) => {
        throw new Error(`Expected promise to b resolved, but got error: ${e.message}`)
      }
    )
  })
})
