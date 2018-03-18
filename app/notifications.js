var Observable = require('data/observable')
var firebase = require('nativescript-plugin-firebase')
var appSettings = require('application-settings')
var sound = require('nativescript-sound')
var bing = sound.create('~/sounds/isntit.mp3')

viewModel = Observable.fromObject({
  newNotification: false,
  counter: 0,
  read: function(){
    this.newNotification = false
    appSettings.setBoolean('notification', false)
  },
  add: function(withSound){
    this.counter++
    this.newNotification = true
    if(withSound)
      bing.play()
  }
})

exports.getModel = viewModel  
