var appSettings = require('application-settings')
var Observable = require('data/observable')
var utilsModule = require("utils/utils")
var observableModule = require("data/observable")
var firebase = require('nativescript-plugin-firebase')
var frameModule = require('ui/frame')

var viewModel
function loaded(args){
  var page = args.object
  viewModel = Observable.fromObject({
    description: appSettings.getString('description'),
    length: appSettings.getString('description').length
  })


  var text = page.getViewById('text') 
  text.focus()

  if(text.android){
    var imm = utilsModule.ad.getInputMethodManager()
    if(imm){
      imm.toggleSoftInput(android.view.inputmethod.InputMethodManager.SHOW_IMPLICIT, 0)
    }
  }

  page.bindingContext = viewModel
}

function save(){
  if(viewModel.description.length){
    appSettings.setString('description', viewModel.description)
    updateCurrentPlace()
  }
  frameModule.topmost().goBack()
}

function updateCurrentPlace(){
  // update description in current place by leaving and joining again
  const place = appSettings.getString('place')
  const city = appSettings.getString('city')
  const clientId = appSettings.getString('clientId')

  if(city){
    firebase.remove(`/visitors/${city}/${place}/${clientId}`)
    firebase.update(`/visitors/${city}/${place}/${clientId}`,{
      image: appSettings.getString('profileUrl'),
      description: appSettings.getString('description'),
      pushToken: appSettings.getString('pushToken'),
      timestamp: firebase.ServerValue.TIMESTAMP
    })
  }
}

exports.loaded = loaded
exports.save = save
