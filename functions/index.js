const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.notify = functions.database.ref('/notifications/{to}/{key}').onCreate(event => {
  if(!event.data.val())
    return 

  const pushToken = event.data.child('pushToken').val()
  const type = event.data.child('type').val()
  const place = event.data.child('place').val()
  const timestamp = event.data.child('timestamp').val()
  const profileUrl = event.data.child('profileUrl').val()

  const payload = {
    android: {
      notification: {
        title: 'Notification',
        body: place,
        sound: 'isntit.mp3'
      },
    },
    data: {
      place: place,
      type: type.toString(),
      profileUrl: profileUrl,
      timestamp: timestamp.toString()
    },
    token: pushToken
  }

  return admin.messaging().send(payload)
})
