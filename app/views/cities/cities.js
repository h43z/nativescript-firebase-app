var firebase = require('nativescript-plugin-firebase')
var appSettings = require('application-settings')
var Observable = require('data/observable')
var frameModule = require('ui/frame')
var ObservableArray = require('data/observable-array').ObservableArray

var clientId = appSettings.getString('clientId')
var listener
var path
var viewModel


function onNavigatedTo(args) {
  var page = args.object

  viewModel = Observable.fromObject({
    cities: new ObservableArray()
  })

  var onQueryEvent = function(result){
    if(result.type === 'ChildAdded'){
      viewModel.cities.push(result.key) 
    }
  }

  firebase.query(
    onQueryEvent,
    `/cities`,
    {
      singleEvent: false,
      orderBy: {
        type: firebase.QueryOrderByType.KEY
      }
    }
  ).then(listenerWrapper => {
    path = listenerWrapper.path
    listener = listenerWrapper.listeners
  })
  page.bindingContext = viewModel
}

function onNavigatingFrom(){
  firebase.removeEventListeners(listener, path)
}

function visit(args){
  viewModel.city = appSettings.setString('city', args.view.bindingContext)
  frameModule.topmost().navigate({
    moduleName: 'views/main/main',
    clearHistory: true
  })
}

exports.onNavigatedTo = onNavigatedTo
exports.onNavigatingFrom = onNavigatingFrom
exports.visit = visit
