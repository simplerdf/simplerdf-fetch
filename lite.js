const rdfFetch = require('rdf-fetch-lite')
const SimpleRDF = require('simplerdf-core')

function simpleFetch (url, options) {
  options = options || {}
  options.rdfFetch = options.rdfFetch || simpleFetch.defaults.rdfFetch

  if (options.body) {
    options.body = options.body.graph().toStream()
  }

  return options.rdfFetch(url, options).then((res) => {
    if (!res.dataset) {
      return res
    }

    return res.dataset().then((dataset) => {
      let context = options.context || simpleFetch.defaults.context
      let iri = res.headers.get('Content-Location') || url

      res.simple = new SimpleRDF(context, iri, dataset)

      return res
    })
  })
}

simpleFetch.defaults = {
  rdfFetch: rdfFetch
}

module.exports = simpleFetch
