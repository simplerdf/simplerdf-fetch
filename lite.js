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
      var context = options.context || simpleFetch.defaults.context
      var iri = res.headers.get('Content-Location') || url

      res.simple = new SimpleRDF(context, iri, res.graph)
    }

    return res
  })
}

simpleFetch.defaults = {
  rdfFetch: rdfFetch
}

module.exports = simpleFetch
