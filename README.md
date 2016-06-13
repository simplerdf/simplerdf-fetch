# simplerdf-fetch

Uses [Fetch](https://fetch.spec.whatwg.org/) to send and receive SimpleRDF objects over HTTP.

## Usage

Load the module:

    var simpleFetch = require('simplerdf-fetch')

Fetch RDF Data from `url`.
For the receiving data `context` is used as SimpleRDF context.
Optional `body` can be assigned with a SimpleRDF object which should be sent.
`res.simple` contains the SimpleRDF object built from the response data.
Other properties can be used according to the [Fetch Standard](https://fetch.spec.whatwg.org/).

    simpleFetch(url, {context: context, body: body}).then(function (res) {
       // res.simple
    })

## Examples

The examples folder contains examples how to send and receive SimpleRDF objects.
