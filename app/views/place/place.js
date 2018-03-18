var firebase = require("nativescript-plugin-firebase")
var appSettings = require("application-settings")
var Observable = require("data/observable")
var ObservableArray = require("data/observable-array").ObservableArray
var frameModule = require('ui/frame')
var application = require("application")
var notifications = require("../../notifications").getModel

var listener
var path
var place
var viewModel
var page

function registerPlaceListener(city, place){
  firebase.addChildEventListener(result => {
    if(result.type === 'ChildRemoved'){
      for(var i = 0; i < viewModel.visitors.length; i++){
        var visitor = viewModel.visitors.getItem(i)
        if(visitor.key === result.key)
          viewModel.visitors.splice(i, 1)
      }
    }

    if(result.type === 'ChildAdded'){
      let pos = 1
      if(result.key == appSettings.getString('clientId')){
        pos = 0
      }

      viewModel.visitors.splice(pos,0, {
        key: result.key,
        image: result.value.image,
        description: result.value.description,
        pushToken: result.value.pushToken,
        shortDescription: result.value.description.substring(0, 200),
        me: result.key == appSettings.getString('clientId')
      })
    }

  }, `/visitors/${city}/${place}/`).then(listenerWrapper => {
    path = listenerWrapper.path
    listener = listenerWrapper.listeners
  })
}

function onLoaded(args) {
  page = args.object

  viewModel = Observable.fromObject({
    visitors: new ObservableArray(),
    place: page.navigationContext.place,
    demo: page.navigationContext.demo,
    currentPlace: appSettings.getString('place'),
    notification: appSettings.getBoolean('notification')
  })

  page.bindingContext = viewModel

  if(viewModel.demo){
    registerPlaceListener('demo', viewModel.place)
  }else{
    registerPlaceListener(appSettings.getString('city'), viewModel.place)
  }

  if(page.navigationContext.autostay)
    stay()

  notifications.on('propertyChange', propertyChangeData => {
    console.log(propertyChangeData.propertyName + " has been changed and the new value is: " + propertyChangeData.value)
    viewModel.notification = true
    appSettings.setBoolean('notification', true)
  })

}

function onNavigatingFrom(){
  firebase.removeEventListeners(listener, path)
}

function goToHi(args){
  var visitor = viewModel.visitors.getItem(args.index)
  page.showModal('modals/hi/hi', {
    visitor: visitor,
    place: viewModel.place
  }, _ => {}, false)
}

function stay(){

  if(viewModel.demo){
    var dialogs = require("ui/dialogs")
    dialogs.alert({
      title: "🤖 Sorry human!",
      message: "This demo place one is for computer generated only. But you can enter another one or create a new place.",
      okButtonText: "🆗🆒"
    }).then(() =>{
        console.log("Dialog closed!")
    })
    return
  }

  let clientId = appSettings.getString('clientId')
  let currentPlace = viewModel.currentPlace
  let place = viewModel.place 
  let city = appSettings.getString('city')

  if(currentPlace){
    // leave the current place
    firebase.remove(`/visitors/${city}/${currentPlace}/${clientId}`)
  }

  if(currentPlace == place){
    // now in no place
    appSettings.setString('place', '')
    viewModel.currentPlace = ''
  }else{
    // joining this place
    appSettings.setString('place', viewModel.place)
    viewModel.currentPlace = viewModel.place

    firebase.update(`/visitors/${city}/${place}/${clientId}`, {
      image: appSettings.getString('profileUrl'),
      description: appSettings.getString('description'),
      pushToken: appSettings.getString('pushToken'),
      timestamp: firebase.ServerValue.TIMESTAMP
    })

    page.getViewById("listview").scrollToIndex(0)
  }
}

function goToNotifications(){
  frameModule.topmost().navigate({
    moduleName: 'views/notifications/notifications'
  })

  appSettings.setBoolean('notification', false)
  viewModel.notification = false
}

function itemTemplateSelector(item, index){
  if(item.me)
    return 'me'

  return 'other'
}

exports.onLoaded = onLoaded
exports.onNavigatingFrom = onNavigatingFrom
exports.onUnloaded = onNavigatingFrom
exports.itemTap = goToHi
exports.stay = stay
exports.goToNotifications = goToNotifications
exports.itemTemplateSelector = itemTemplateSelector
