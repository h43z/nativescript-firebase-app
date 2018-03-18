var firebase = require('nativescript-plugin-firebase')
var appSettings = require('application-settings')
var Observable = require('data/observable')
var sound = require('nativescript-sound')

var bing = sound.create('~/sounds/unconvinced.mp3')
var callback
var viewModel
var page

function notify(args){

  firebase.push(`/notifications/${viewModel.visitor.key}`, {
    from: appSettings.getString('clientId'),
    type: args.object.col,
    text: args.object.text,
    pushToken: viewModel.visitor.pushToken,
    place: viewModel.place,
    profileUrl: appSettings.getString('profileUrl'),
    timestamp: firebase.ServerValue.TIMESTAMP
  })

  bing.play()
  setTimeout(() => {
    page.closeModal()
  }, 500)
}

function shownModally(args) {
  page = args.object 
  viewModel = args.context
  closeCallback = args.closeCallback
  page.bindingContext = viewModel
}

exports.notify = notify
exports.shownModally = shownModally
