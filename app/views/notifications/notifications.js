var firebase = require("nativescript-plugin-firebase")
var frameModule = require('ui/frame')
var appSettings = require("application-settings")
var Observable = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray
var notifications = require("../../notifications").getModel

var path
var listener

function navigatedTo(args) {
  var page = args.object

  var viewModel = Observable.fromObject({
    notifications: new ObservableArray()
  })

  notifications.read()

  page.bindingContext = viewModel

  var onQueryEvent = function(result){
    if(result.type === 'ChildAdded'){
      viewModel.notifications.unshift({
        key: result.key,
        profileUrl: result.value.profileUrl,
        timestamp: result.value.timestamp,
        place: result.value.place,
        type: result.value.type,
        text: result.value.text
      }) 
    }
  }

  firebase.query(
    onQueryEvent,
    `/notifications/${appSettings.getString('clientId')}/`,
    {
      singleEvent: false,
      orderBy: {
        type: firebase.QueryOrderByType.CHILD,
        value: 'timestamp' 
      },    
      limit: {
        type: firebase.QueryLimitType.LAST,
        value: 20
      }
    }
  ).then(listenerWrapper => {
    path = listenerWrapper.path
    listener = listenerWrapper.listeners
  })

}

function onNavigatingFrom(){
  firebase.removeEventListeners(listener, path)
}

function goToPlace(args){
  frameModule.topmost().navigate({
    moduleName: 'views/place/place',
    context: {
      place: args.view.bindingContext.place
    }
  })
}

exports.goToPlace = goToPlace
exports.navigatedTo = navigatedTo
exports.onNavigatingFrom = onNavigatingFrom

