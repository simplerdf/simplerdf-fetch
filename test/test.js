/* global describe, it */

const assert = require('assert')
const nock = require('nock')
const rdf = require('rdf-ext')
const Simple = require('simplerdf-core')
const SimpleFetch = require('..')

describe('simplerdf-fetch', () => {
  it('should have a defaults object', () => {
    assert.equal(typeof SimpleFetch.defaults, 'object')
  })

  describe('static', () => {
    it('should return a Promise object', () => {
      const result = SimpleFetch.fetch('http://example.org/', {
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

      return SimpleFetch.fetch(null, {rdfFetch: touch}).then(() => {
        assert.equal(touched, true)
      })
    })

    it('should use the rdfFetch given in defaults', () => {
      let touched = false

      function touch () {
        touched = true

        return Promise.resolve({})
      }

      const defaultRdfFetch = SimpleFetch.defaults.rdfFetch

      SimpleFetch.defaults.rdfFetch = touch

      return SimpleFetch.fetch().then(() => {
        assert.equal(touched, true)

        SimpleFetch.defaults.rdfFetch = defaultRdfFetch
      })
    })

    it('should send the SimpleRDF object given on options.body', () => {
      nock('http://example.org')
        .post('/send-body')
        .reply(200, function (url, body) {
          assert.equal(body.trim(), '<http://example.org/subject> <http://example.org/predicate> "object" .')

          return [200, '', {'Content-Type': 'application/n-triples'}]
        })

      const simple = new Simple({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')
      simple.predicate = 'object'

      const headers = {
        'Content-Type': 'application/n-triples'
      }

      return SimpleFetch.fetch('http://example.org/send-body', {
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

      return SimpleFetch.fetch('http://example.org/receive-body').then((res) => {
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

      return SimpleFetch.fetch('http://example.org/context-options', {
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

      SimpleFetch.defaults.context = {predicate: 'http://example.org/predicate'}

      return SimpleFetch.fetch('http://example.org/context-options').then((res) => {
        assert.deepEqual(res.simple.context()._json, {predicate: 'http://example.org/predicate'})

        SimpleFetch.defaults.context = null
      })
    })

    it('should support N-Triples', () => {
      nock('http://example.org')
        .post('/n-triples')
        .reply(200, function (url, body) {
          assert.deepEqual(this.req.headers['content-type'], ['application/n-triples'])

          return [200, body, {'Content-Type': 'application/n-triples'}]
        })

      const simple = new Simple({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')
      simple.predicate = 'object'

      const headers = {
        'Content-Type': 'application/n-triples'
      }

      return SimpleFetch.fetch('http://example.org/n-triples', {
        method: 'post',
        headers: headers,
        body: simple
      }).then((res) => {
        assert.equal(res.headers.get('content-type'), 'application/n-triples')

        assert.equal(
          res.simple.graph().toCanonical().trim(),
          '<http://example.org/subject> <http://example.org/predicate> "object" .'
        )
      })
    })

    it('should support JSON-LD', () => {
      nock('http://example.org')
        .post('/json-ld')
        .reply(200, function (url, body) {
          assert.deepEqual(this.req.headers['content-type'], ['application/ld+json'])

          return [200, body, {'Content-Type': 'application/ld+json'}]
        })

      const simple = new Simple({predicate: 'http://example.org/predicate'}, 'http://example.org/subject')
      simple.predicate = 'object'

      const headers = {
        'Content-Type': 'application/ld+json'
      }

      return SimpleFetch.fetch('http://example.org/json-ld', {
        method: 'post',
        headers: headers,
        body: simple
      }).then((res) => {
        assert.equal(res.headers.get('content-type'), 'application/ld+json')

        assert.equal(
          res.simple.graph().toCanonical().trim(),
          '<http://example.org/subject> <http://example.org/predicate> "object" .'
        )
      })
    })
  })

  describe('instance', () => {
    it('should be a constructor', () => {
      assert.equal(typeof SimpleFetch, 'function')
    })

    it('should use the constructor given in options', () => {
      const CustomClass = Simple.extend(SimpleFetch)
      const instance = new CustomClass({}, null, null, {
        rdfFetch: () => Promise.resolve({
          headers: {
            get: () => null
          },
          dataset: () => {
            return Promise.resolve(rdf.dataset())
          }
        })
      })

      return instance.fetch().then((res) => {
        const plugins = res.simple._plugins.map(p => p.name).sort()

        assert.deepEqual(plugins, ['SimpleFetch', 'SimpleRDF'])
      })
    })
  })
})
