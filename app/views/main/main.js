var firebase = require('nativescript-plugin-firebase')
var appSettings = require('application-settings')
var Observable = require('data/observable')
var frameModule = require('ui/frame')
var ObservableArray = require('data/observable-array').ObservableArray
var notifications = require('../../notifications').getModel
var geolocation = require('../../geolocation').getModel

var viewModel
var listener
var path
var page

notifications.on('propertyChange', propertyChangeData => {
  viewModel.notification = true
  appSettings.setBoolean('notification', true)
})

geolocation.on('propertyChange', propertyChangeData => {
  if(!appSettings.getString('city')){
    viewModel.city = propertyChangeData.value 
    viewModel.geoLocating = false
    registerCityListener(viewModel.city)
    page.getViewById('city-label').requestLayout()
  }
})

viewModel = Observable.fromObject({
  places: new ObservableArray(),
  profileUrl: null, 
  place: null,
  city: null,
  notification: false,
  geoLocating: appSettings.getString('city') ? false : true
})

function registerCityListener(city){
  appSettings.setString('city', city)

  if(path && listener){
    firebase.removeEventListeners(listener, path)
    viewModel.places = new ObservableArray()
  }

  viewModel.places.splice(0, 0,{
    name: "Demo Place 😱",
    demo:  true
  })

  firebase.addChildEventListener(result => {
    if(result.type === 'ChildRemoved'){
      var index = viewModel.places.indexOf(result.key)
      viewModel.places.splice(index, 1)
    }

    if(result.type === 'ChildAdded'){
      if(result.value.position){
        viewModel.places.splice(result.value.position, 0,{
          name: result.key,
          verified:  true
        })
      }else{
        viewModel.places.push({
          name: result.key,
          verified:  false
        })
      }
    }

  }, `/places/${city}`).then(listenerWrapper => {
    path = listenerWrapper.path
    listener = listenerWrapper.listeners
  })
}

function onNavigatedTo(args) {
  page = args.object
  if(!args.isBackNavigation && appSettings.getString('city')){
    registerCityListener(appSettings.getString('city'))
  }

  // resize the labels...arrrg whyy!!
  page.getViewById('place-label').requestLayout()
  page.getViewById('city-label').requestLayout()

  viewModel.place = appSettings.getString('place')
  viewModel.city = appSettings.getString('city')
  viewModel.profileUrl = appSettings.getString('profileUrl')
  viewModel.notification = appSettings.getBoolean('notification')
  page.bindingContext = viewModel
}

function join(args){
  frameModule.topmost().navigate({
    moduleName: 'views/place/place',
    context: {
      place: args.view.bindingContext.name,
      demo: args.view.bindingContext.demo
    }
  })
}

function goToProfile(){
  frameModule.topmost().navigate({
    moduleName: 'views/profile/profile',
    transition: {
      name: 'slideLeft',
      duration: 230,
      curve: 'easeIn'
    }
  })
}

function goToPlace(){
  frameModule.topmost().navigate({
    moduleName: 'views/place/place',
    context: {
      place: viewModel.place
    }
  })
}

function goToNotifications(){
  appSettings.setBoolean('notification', false)
  viewModel.notification = false
  frameModule.topmost().navigate({
    moduleName: 'views/notifications/notifications',
  })
}

function goToAddPlace(){
  frameModule.topmost().navigate({
    moduleName: 'views/addplace/addplace',
    backstackVisible: false,
    transition: {
      name: 'slideTop',
      duration: 230,
      curve: 'easeIn'
    }
  })
}

function goToCities(){
  frameModule.topmost().navigate({
    moduleName: 'views/cities/cities'
  })
}

function itemTemplateSelector(item, index){
  return "verified"
}

exports.join = join
exports.goToPlace = goToPlace
exports.goToCities = goToCities
exports.goToProfile = goToProfile
exports.goToAddPlace = goToAddPlace
exports.onNavigatedTo = onNavigatedTo
exports.goToNotifications = goToNotifications
exports.itemTemplateSelector = itemTemplateSelector
