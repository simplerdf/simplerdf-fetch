const rdfFetch = require('rdf-fetch')
const SimpleFetchLite = require('simplerdf-fetch-lite')

class SimpleFetch extends SimpleFetchLite {
  init (context, iri, graph, options) {
    this._options.rdfFetch = options.rdfFetch || SimpleFetch.defaults.rdfFetch
  }

  fetch (url, options) {
    options = options || {}
    options.simpleFactory = this.create
    options.context = options.context || this.context()
    options.rdfFetch = options.rdfFetch || this._options.rdfFetch

    return SimpleFetch.fetch(url, options)
  }

  static fetch (url, options) {
    options = options || {}
    options.rdfFetch = options.rdfFetch || SimpleFetch.defaults.rdfFetch
    options.formats = options.formats || rdfFetch.defaults.formats
    options.context = options.context || SimpleFetch.defaults.context

    return SimpleFetchLite.fetch(url, options)
  }
}

SimpleFetch.defaults = {
  rdfFetch: rdfFetch
}

module.exports = SimpleFetch
