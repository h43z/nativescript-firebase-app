var firebase = require('nativescript-plugin-firebase')
var appSettings = require("application-settings")
var Observable = require('data/observable')
var utilsModule = require("utils/utils")
var observableModule = require("data/observable")
var frameModule = require('ui/frame')

var viewModel
function loaded(args){
  var page = args.object
  viewModel = Observable.fromObject({
    name: '',
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

function goToPlace(){
  firebase.update(`/places/${appSettings.getString('city')}/${viewModel.name}`, {
    timestamp: firebase.ServerValue.TIMESTAMP  
  })  

  frameModule.topmost().navigate({
    moduleName: 'views/place/place',
    context: {
      place: viewModel.name,
      autostay: true
    }
  })
}

exports.goToPlace = goToPlace
exports.loaded = loaded

