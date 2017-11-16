const SimpleCore = require('simplerdf-core')
const SimpleFetch = require('..')

const Simple = SimpleCore.extend(SimpleFetch)

const context = {
  height: 'http://dbpedia.org/property/height'
}

const instance = new Simple(context)

instance.fetch('http://dbpedia.org/resource/Eiffel_Tower', {
  headers: {
    accept: 'application/ld+json'
  }
}).then(function (res) {
  console.log('height of the Eiffel Tower: ' + res.simple.height)
}).catch((err) => {
  console.error(err.stack || err.message)
})
