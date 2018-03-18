var geolocation = require('nativescript-geolocation')
var Observable = require('data/observable')
var http = require('http')
var appSettings = require('application-settings')
var firebase = require('nativescript-plugin-firebase')
var frameModule = require('ui/frame')

viewModel = Observable.fromObject({
  geolocation: null
})

if(!appSettings.getString('city')){
  geolocation.getCurrentLocation({
    desiredAccuracy: 1,
    timeout: 0
  }).then(loc => {
    getCityName(loc.latitude, loc.longitude)
  }, e =>  {
    console.log('Error: ' + e.message)
    frameModule.topmost().navigate({
      moduleName: 'views/cities/cities'
    })
  })
}

function getCityName(lat, lng){
  http.request({
    url: `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}`,
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  }).then(response => {
    result = response.content.toJSON()
    var items = result.results[1].address_components
    for(var i = 0; i < items.length; i++){
      var item = items[i]
      if(item.types[0] === 'locality'){
        var city = item.short_name.toLowerCase()
        viewModel.geolocation = city
        firebase.update(`/cities/${city}`, true)
        console.log('location is', city)
        return
      }
    }
  }, e => {
    console.log('Error occurred ' + e)
    frameModule.topmost().navigate({
      moduleName: 'views/cities/cities'
    })
  })
}

exports.getModel = viewModel  
