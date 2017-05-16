function SchemaValidationError (message, valErrorsList) {
  this.message = message
  this.validationErrors = valErrorsList
}

SchemaValidationError.prototype = Object.create(Error.prototype)

module.exports = {
  SchemaValidationError
}
