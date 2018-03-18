var Observable = require('data/observable')

exports.onLoaded = (args) => {
  var viewModel = Observable.fromObject({
    string: 'AAA',
  })

  args.object.bindingContext = viewModel

  //setTimeout(() => {
  //  viewModel.string = 'BBBBBBBBBBBBB' 
  //},4000)

  //setTimeout(() => {
  //  viewModel.string = 'CCCC' 
  //},5500)
}


