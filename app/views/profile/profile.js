var imagepicker = require("nativescript-imagepicker")
var appSettings = require('application-settings')
var firebase = require('nativescript-plugin-firebase')
var Observable = require('data/observable')
var frameModule = require('ui/frame')
var ObservableArray = require('data/observable-array').ObservableArray
var ImageCropper = require("nativescript-imagecropper").ImageCropper
var imageSource = require("tns-core-modules/image-source")
var fs = require("tns-core-modules/file-system")

var viewModel

function loaded(args){
  var page = args.object
  viewModel = Observable.fromObject({
    image: appSettings.getString('profileUrl'),
    description: appSettings.getString('description') || "",
    isLoading: false
  })
  page.bindingContext = viewModel
}

function chooseImage(){
  var context = imagepicker.create({ mode: "single" })

  context
    .authorize()
    .then(() => {
      return context.present()
    })
    .then(selection => {
      selection.forEach(selected => {

        var folder = fs.knownFolders.temp();
        var path = fs.path.join(folder.path, "temp.jpeg");

        selected.getImage()
          .then(imgSrc => {
            var imageCropper = new ImageCropper()
            imageCropper.show(imgSrc,{width: 640, height: 640, lockSquare: true}).then((args) => {
              if(args.image !== null){
                args.image.saveToFile(path, "jpeg", 70)
                fileUpload(path)
              }
            }).catch(function(e){
              console.dir(e)
            })
          })
      })
    }).catch(error => {
      console.log(error)
    })
}

function fileUpload(path){
  var clientId = appSettings.getString('clientId')
  var remotePath =`images/uploads/${clientId}${Date.now()}`

  firebase.uploadFile({
    remoteFullPath: remotePath,
    localFullPath: path,
    onProgress: status => {
      viewModel.isLoading = true
    }
  }).then(uploadedFile => {
    viewModel.image = uploadedFile.url
    viewModel.isLoading = false
    appSettings.setString('profileUrl', uploadedFile.url)
    updateCurrentPlace()
  }, error => {
    console.log("File upload error: " + error)
  })
}

function goToEditDescription(){
  frameModule.topmost().navigate({
    moduleName: 'views/description/description'
  })
}

exports.loaded = loaded
exports.chooseImage = chooseImage
exports.goToEditDescription = goToEditDescription

function updateCurrentPlace(){
  // update profilepic in current place by leaving and joining again
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
