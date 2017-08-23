/* global describe, it */

const assert = require('assert')
const formats = require('rdf-fetch').defaults.formats
const nock = require('nock')
const rdf = require('rdf-ext')
const simpleFetch = require('..')
const simpleFetchLite = require('../lite')
const SimpleRDF = require('simplerdf-core')

describe('simplerdf-fetch', () => {
  describe('lite', () => {
    it('should be a function', () => {
      assert.equal(typeof simpleFetchLite, 'function')
    })

    it('should have a defaults object', () => {
      assert.equal(typeof simpleFetchLite.defaults, 'object')
    })

    it('should return a Promise object', () => {
      let result = simpleFetchLite('http://example.org/', {
        formats: {
          parsers: {
            list: () => {
              return []
            }
          }
        }
      })

      assert.equal(typeof result, 'object')
      assert.equal(typeof result.then, 'function')
    })

    it('should use the rdfFetch given in options', () => {
      let touched = false

      function touch () {
        touched = true

        return Promise.resolve({})
      }

      return simpleFetchLite(null, {rdfFetch: touch}).then(() => {
        assert.equal(touched, true)
      })
    })

    it('should use the rdfFetch given in defaults', () => {
      let touched = false

      function touch () {
        touched = true

        return Promise.resolve({})
      }

      const defaultRdfFetch = simpleFetchLite.defaults.rdfFetch

      simpleFetchLite.defaults.rdfFetch = touch

      return simpleFetchLite().then(() => {
        assert.equal(touched, true)

        simpleFetchLite.defaults.rdfFetch = defaultRdfFetch
      })
    })

    it('should send the SimpleRDF object given on options.body', () => {
      nock('http://example.org')
        .post('/send-body')
        .reply(200, function (url, body) {
          assert.equal(body.trim(), '<http://example.org/subject> <http://example.org/predicate> "object" .')
        })

      const customFormats = {
        parsers: new rdf.Parsers({
          'application/n-triples': formats.parsers['application/n-triples']
        }),
        serializers: new rdf.Serializers({
          'application/n-triples': formats.serializers['application/n-triples']
        })
      }

      let simple = new SimpleRDF({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')

      simple.predicate = 'object'

      return simpleFetchLite('http://example.org/send-body', {
        formats: customFormats,
        method: 'post',
        body: simple
      })
    })

    it('should receive the SimpleRDF object', () => {
      nock('http://example.org')
        .get('/receive-body')
        .reply(200, function (url, body) {
          return [200, '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
            'Content-Type': 'application/n-triples'
          }]
        })

      const customFormats = {
        parsers: new rdf.Parsers({
          'application/n-triples': formats.parsers['application/n-triples']
        }),
        serializers: new rdf.Serializers({
          'application/n-triples': formats.serializers['application/n-triples']
        })
      }

      return simpleFetchLite('http://example.org/receive-body', {formats: customFormats}).then((res) => {
        const graphString = res.simple.graph().toString().trim()

        assert.equal(graphString, '<http://example.org/subject> <http://example.org/predicate> "object" .')
      })
    })

    it('should use the context given in options for the received SimpleRDF object', () => {
      nock('http://example.org')
        .get('/context-options')
        .reply(200, function (url, body) {
          return [200, '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
            'Content-Type': 'application/n-triples'
          }]
        })

      const customFormats = {
        parsers: new rdf.Parsers({
          'application/n-triples': formats.parsers['application/n-triples']
        }),
        serializers: new rdf.Serializers({
          'application/n-triples': formats.serializers['application/n-triples']
        })
      }

      const options = {
        formats: customFormats,
        context: {
          predicate: 'http://example.org/predicate'
        }
      }

      return simpleFetchLite('http://example.org/context-options', options).then((res) => {
        assert.deepEqual(res.simple.context()._json, {predicate: 'http://example.org/predicate'})
      })
    })

    it('should use the context given in defaults for the received SimpleRDF object', () => {
      nock('http://example.org')
        .get('/context-options')
        .reply(200, function (url, body) {
          return [200, '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
            'Content-Type': 'application/n-triples'
          }]
        })

      const customFormats = {
        parsers: new rdf.Parsers({
          'application/n-triples': formats.parsers['application/n-triples']
        }),
        serializers: new rdf.Serializers({
          'application/n-triples': formats.serializers['application/n-triples']
        })
      }

      simpleFetchLite.defaults.context = {predicate: 'http://example.org/predicate'}

      return simpleFetchLite('http://example.org/context-options', {formats: customFormats}).then((res) => {
        assert.deepEqual(res.simple.context()._json, {predicate: 'http://example.org/predicate'})

        simpleFetchLite.defaults.context = null
      })
    })

    it('should set the SimpleRDF IRI to the request URL', () => {
      nock('http://example.org')
        .get('/iri-request-url')
        .reply(200, function (url, body) {
          return [200, '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
            'Content-Type': 'application/n-triples'
          }]
        })

      const customFormats = {
        parsers: new rdf.Parsers({
          'application/n-triples': formats.parsers['application/n-triples']
        }),
        serializers: new rdf.Serializers({
          'application/n-triples': formats.serializers['application/n-triples']
        })
      }

      return simpleFetchLite('http://example.org/iri-request-url', {formats: customFormats}).then((res) => {
        assert.equal(res.simple.iri().toString(), 'http://example.org/iri-request-url')
      })
    })

    it('should set the SimpleRDF IRI to the Content-Location header value', () => {
      nock('http://example.org')
        .get('/iri-content-location')
        .reply(200, function (url, body) {
          return [
            200,
            '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
              'Content-Location': 'http://example.org/iri',
              'Content-Type': 'application/n-triples'
            }
          ]
        })

      const customFormats = {
        parsers: new rdf.Parsers({
          'application/n-triples': formats.parsers['application/n-triples']
        }),
        serializers: new rdf.Serializers({
          'application/n-triples': formats.serializers['application/n-triples']
        })
      }

      return simpleFetchLite('http://example.org/iri-content-location', {formats: customFormats}).then((res) => {
        assert.equal(res.simple.iri().toString(), 'http://example.org/iri')
      })
    })
  })

  describe('standard', () => {
    it('should be a function', () => {
      assert.equal(typeof simpleFetch, 'function')
    })

    it('should have a defaults object', () => {
      assert.equal(typeof simpleFetch.defaults, 'object')
    })

    it('should return a Promise object', () => {
      const result = simpleFetch('http://example.org/', {
        rdfFetch: () => {
          return Promise.resolve({})
        }
      })

      assert.equal(typeof result, 'object')
      assert.equal(typeof result.then, 'function')
    })

    it('should use the rdfFetch given in options', () => {
      let touched = false

      function touch () {
        touched = true

        return Promise.resolve({})
      }

      return simpleFetch(null, {rdfFetch: touch}).then(() => {
        assert.equal(touched, true)
      })
    })

    it('should use the rdfFetch given in defaults', () => {
      let touched = false

      function touch () {
        touched = true

        return Promise.resolve({})
      }

      const defaultRdfFetch = simpleFetch.defaults.rdfFetch

      simpleFetch.defaults.rdfFetch = touch

      return simpleFetch().then(() => {
        assert.equal(touched, true)

        simpleFetch.defaults.rdfFetch = defaultRdfFetch
      })
    })

    it('should send the SimpleRDF object given on options.body', () => {
      nock('http://example.org')
        .post('/send-body')
        .reply(200, function (url, body) {
          assert.equal(body.trim(), '<http://example.org/subject> <http://example.org/predicate> "object" .')

          return [200, '', {'Content-Type': 'application/n-triples'}]
        })

      const simple = new SimpleRDF({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')
      simple.predicate = 'object'

      const headers = {
        'Content-Type': 'application/n-triples'
      }

      return simpleFetch('http://example.org/send-body', {
        method: 'post',
        headers: headers,
        body: simple
      })
    })

    it('should receive the SimpleRDF object', () => {
      nock('http://example.org')
        .get('/receive-body')
        .reply(200, function (url, body) {
          return [200, '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
            'Content-Type': 'application/n-triples'
          }]
        })

      return simpleFetch('http://example.org/receive-body').then((res) => {
        const graphString = res.simple.graph().toString().trim()

        assert.equal(graphString, '<http://example.org/subject> <http://example.org/predicate> "object" .')
      })
    })

    it('should use the context given in options for the received SimpleRDF object', () => {
      nock('http://example.org')
        .get('/context-options')
        .reply(200, function (url, body) {
          return [200, '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
            'Content-Type': 'application/n-triples'
          }]
        })

      return simpleFetch('http://example.org/context-options', {
        context: {
          predicate: 'http://example.org/predicate'
        }
      }).then((res) => {
        assert.deepEqual(res.simple.context()._json, {predicate: 'http://example.org/predicate'})
      })
    })

    it('should use the context given in defaults for the received SimpleRDF object', () => {
      nock('http://example.org')
        .get('/context-options')
        .reply(200, function (url, body) {
          return [200, '<http://example.org/subject> <http://example.org/predicate> "object" .\n', {
            'Content-Type': 'application/n-triples'
          }]
        })

      simpleFetch.defaults.context = {predicate: 'http://example.org/predicate'}

      return simpleFetch('http://example.org/context-options').then((res) => {
        assert.deepEqual(res.simple.context()._json, {predicate: 'http://example.org/predicate'})

        simpleFetch.defaults.context = null
      })
    })
  })
})
