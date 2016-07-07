var rdfFetch = require('rdf-fetch/lite')
var SimpleRDF = require('simplerdf/dist/lite')

function simpleFetch (url, options) {
  options = options || {}
  options.rdfFetch = options.rdfFetch || simpleFetch.defaults.rdfFetch

  if (options.body) {
    options.body = options.body.graph()
  }

  return options.rdfFetch(url, options).then(function (res) {
    if (res.graph) {
      res.simple = new SimpleRDF(options.context || simpleFetch.defaults.context, url, res.graph)
    }

    return res
  })
}

simpleFetch.defaults = {
  rdfFetch: rdfFetch
}

module.exports = simpleFetch
