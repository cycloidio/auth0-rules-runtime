function (user, context, cb) {
  cb(null, user, Object.assign(context, { configuration }))
}
