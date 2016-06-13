var simpleFetch = require('..')

var context = {
  height: 'http://dbpedia.org/property/height'
}

simpleFetch('http://dbpedia.org/resource/Eiffel_Tower', {context: context}).then(function (res) {
  console.log('height of the Eiffel Tower: ' + res.simple.height)
}).catch(function (err) {
  console.error(err.stack || err.message)
})
