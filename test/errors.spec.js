/* eslint-env mocha */
const { expect } = require('chai')
const { SchemaValidationError } = require('../src/errors')

describe('SchemaValidationError', () => {
  const message = `The message ${Math.random()}`
  const errValLists = []

  before(() => {
    const nErrs = Math.ceil(Math.random() * 10)
    for (let n = 0; n < nErrs; n++) {
      errValLists.push(`Validation error #${n} (${Math.random()})`)
    }
  })

  it('inherits from Error type', () => {
    const vErr = new SchemaValidationError(message, errValLists)
    expect(vErr).to.be.instanceOf(Error)
  })

  it('has a message property', () => {
    const vErr = new SchemaValidationError(message, errValLists)
    expect(vErr).to.have.property('message', message)
  })

  it('has a list to store details about Schema validation error descriptions', () => {
    const vErr = new SchemaValidationError(message, errValLists)
    expect(vErr).to.have.property('validationErrors').to.deep.equal(errValLists)
  })
})
