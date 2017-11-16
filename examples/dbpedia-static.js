const SimpleFetch = require('..')

const context = {
  height: 'http://dbpedia.org/property/height'
}

SimpleFetch.fetch('http://dbpedia.org/resource/Eiffel_Tower', {
  context: context,
  headers: {
    accept: 'application/ld+json'
  }
}).then(function (res) {
  console.log('height of the Eiffel Tower: ' + res.simple.height)
}).catch((err) => {
  console.error(err.stack || err.message)
})
