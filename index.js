var rdfFetch = require('rdf-fetch')
var simpleFetchLite = require('./lite')

function simpleFetch (url, options) {
  options = options || {}
  options.rdfFetch = options.rdfFetch || simpleFetch.defaults.rdfFetch
  options.formats = options.formats || rdfFetch.defaults.formats
  options.context = options.context || simpleFetch.defaults.context

  return simpleFetchLite(url, options)
}

simpleFetch.defaults = {
  rdfFetch: rdfFetch
}

module.exports = simpleFetch
