function (user, context, cb) {
  cb(null, {
    shouldBeAllTrue: [
      !!mongo, !!mysql, !!postgres, !!async, !!jwt, !!_
    ],
    context
  })
}
