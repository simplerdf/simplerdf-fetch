# simplerdf-fetch

[Fetch](https://fetch.spec.whatwg.org/) plugin for SimpleRDF to send and receive SimpleRDF objects.
This package comes out of the box with support for the most common formats.
See [rdf-formats-common](https://www.npmjs.com/package/rdf-formats-common) for more details.

## Usage

`simplerdf-fetch` uses the same API as [Fetch](https://fetch.spec.whatwg.org/), but supports some additional properties or uses them in a different way.
It contains a static `.fetch` method and can be also used as a SimpleRDF plugin.
If it's used as a plugin, the SimpleRDF objects are extended by a `.fetch` method.
The same class will be used to create the response SimpleRDF object. 

Request options:

- `body`: A SimpleRDF object which should be sent as body of the request.
  The object will be serialized by `rdf-fetch`.
- `context`: The context for the SimpleRDF object
- `formats`: A formats object with parsers and serializers
- `simpleFactory`: Factory function which will be called to create the response SimpleRDF object
- `Simple`: Constructor which will be used for the response SimpleRDF object.
  If `simpleFactory` is given, this property will be ignored.

Response options:

- `simple`: Parsed response body as SimpleRDF object

### Examples

The examples folder contains examples how to send and receive SimpleRDF objects.
