function SchemaValiationError (message, valErrorsList) {
  this.message = message
  this.validationErrors = valErrorsList
}

SchemaValiationError.prototype = Object.create(Error.prototype)

module.exports = {
  SchemaValiationError
}
