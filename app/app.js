/*
In NativeScript, the app.js file is the entry point to your application.
You can use this file to perform app-level initialization, but the primary
purpose of the file is to pass control to the app’s first module.
*/

require('./bundle-config')
var application = require('application')
var firebase = require('nativescript-plugin-firebase')
var appSettings = require('application-settings')
var imageCache = require('nativescript-image-cache')
var notifications = require('./notifications').getModel

if(!appSettings.getString('description'))
  appSettings.setString('description', 'Hi I\'m new here :)')

if(!appSettings.getString('profileUrl'))
  appSettings.setString('profileUrl', '~/images/avatar.png')

firebase.init({
  storageBucket: 'gs://nativescript-firebase-testapp.appspot.com/',
  onMessageReceivedCallback: message => {
    if(message.foreground){
      notifications.add(true)
    }else{
      // don't play sound if coming from background
      notifications.add(false)
    }
  },
  onPushTokenReceivedCallback: token => {
    firebase.update(`/users/${appSettings.getString('clientId')}/pushToken`, token)
    appSettings.setString('pushToken', token)
  }
}).then(
  instance => {
    console.log('firebase.init done')

    firebase.login({
      type: firebase.LoginType.ANONYMOUS
    }).then(result => {
      appSettings.setString('clientId', result.uid)

      firebase.getCurrentPushToken().then(token => {
        firebase.update(`/users/${appSettings.getString('clientId')}`, {
          pushToken: token,
          lastOnline: firebase.ServerValue.TIMESTAMP
        })
        appSettings.setString('pushToken', token)
      })
    }, 
      errorMessage => {
        console.log(errorMessage)
      })
  },
  error => {
    console.log('firebase.init error: ' + error)
  }
)

if(application.android){
  application.on('launch', () => {
    imageCache.initialize()
  })
}

application.start({
  moduleName: 'views/main/main'
  // moduleName: 'views/test/test'
})

/*
Do not place any code after the application has been started as it will not
be executed on iOS.
*/
