import type { Protocol } from '../types';

export const coap: Protocol = {
	id: 'coap',
	name: 'Constrained Application Protocol',
	abbreviation: 'CoAP',
	categoryId: 'async-iot',
	port: 5683,
	year: 2014,
	rfc: 'RFC 7252',
	oneLiner: 'HTTP for tiny devices — [[rest|REST]] semantics over [[udp|UDP]] for constrained IoT.',
	overview: `[[coap|CoAP]] brings the familiar [[rest|REST]] model (GET, POST, PUT, DELETE) to the world of constrained IoT devices — think microcontrollers with 10KB of RAM on lossy, low-power wireless networks. It runs over [[udp|UDP]] instead of [[tcp|TCP]], uses a compact binary format, and adds built-in support for resource observation (subscribe to changes).

The design mirrors [[http1|HTTP]] closely enough that translating between [[coap|CoAP]] and [[http1|HTTP]] is straightforward, enabling IoT devices to integrate with web infrastructure through simple {{gateway|proxies}}. But unlike [[http1|HTTP]], [[coap|CoAP]] supports {{multicast|multicast}} (discover all devices on a network), observation (a GET with an Observe option that lets clients receive push notifications when a resource changes), and block-wise transfer (for large payloads on constrained links).

For security, [[coap|CoAP]] relies on {{dtls|DTLS}} (Datagram [[tls|TLS]]) — the [[udp|UDP]] equivalent of [[tls|TLS]] — to provide {{encryption|encryption}}, authentication, and integrity. DTLS is defined as [[coap|CoAP]]'s primary security mechanism in the specification (RFC 7252), with the secure port being 5684.

[[coap|CoAP]] is widely used in smart buildings, industrial automation, and city infrastructure where devices have extreme resource constraints but still need web-like interaction patterns.`,
	howItWorks: [
		{
			title: 'UDP-based messaging',
			description:
				"[[coap|CoAP]] runs over [[udp|UDP]] — no [[tcp|TCP]] {{handshake|handshake}} needed. Messages are tiny binary packets (4-byte base header). Confirmable messages get ACKs; non-confirmable don't."
		},
		{
			title: 'REST methods',
			description:
				'Supports GET, POST, PUT, DELETE just like HTTP. URIs identify resources. {{content-negotiation|Content negotiation}} works via options (like HTTP headers but binary-encoded).'
		},
		{
			title: 'Observe pattern',
			description:
				'Client sends GET with an "Observe" option. Server then pushes notifications whenever the resource changes — like [[websockets|WebSockets]] but for constrained devices.'
		},
		{
			title: 'Resource discovery',
			description:
				'Devices expose /.well-known/core listing all their resources. Supports {{multicast|multicast}} discovery — find all temperature sensors on the network in one query.'
		}
	],
	useCases: [
		'Smart building automation (lighting, HVAC)',
		'Industrial sensor networks',
		'Smart city infrastructure (parking, waste)',
		'Wearable health devices',
		'Agricultural monitoring systems'
	],
	codeExample: {
		language: 'python',
		code: `import asyncio
from aiocoap import Context, Message, GET, PUT

async def main():
    context = await Context.create_client_context()

    # GET request — like HTTP but over UDP
    request = Message(code=GET,
        uri='coap://sensor.local/temperature')
    response = await context.request(request).response
    print(f"Temperature: {response.payload.decode()} C")

    # PUT request — update a resource
    request = Message(code=PUT,
        uri='coap://light.local/brightness',
        payload=b'75')
    response = await context.request(request).response
    print(f"Set brightness: {response.code}")

asyncio.run(main())`,
		caption:
			'[[coap|CoAP]] uses [[rest|REST]]-like methods (GET, PUT) over [[udp|UDP]] — designed for constrained IoT devices',
		alternatives: [
			{
				language: 'javascript',
				code: `const coap = require('coap');

// GET request to a CoAP sensor
const req = coap.request('coap://sensor.local/temperature');

req.on('response', (res) => {
  console.log('Temperature:', res.payload.toString());

  // Observe — get notified of changes
  const observe = coap.request({
    hostname: 'sensor.local',
    pathname: '/temperature',
    observe: true
  });
  observe.on('response', (res) => {
    res.on('data', (d) => console.log('Update:', d.toString()));
  });
  observe.end();
});
req.end();`
			},
			{
				language: 'cli',
				code: `# GET a resource from a CoAP server
coap-client -m get coap://sensor.local/temperature

# PUT — update a resource
coap-client -m put -e "75" \\
  coap://light.local/brightness

# Observe a resource (get push notifications)
coap-client -m get -s 60 -B 60 \\
  coap://sensor.local/temperature

# Discover resources on a device
coap-client -m get coap://sensor.local/.well-known/core`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'GET Request',
						code: `CoAP Message (UDP):
  Version: 1
  Type: Confirmable (CON)
  Token Length: 4
  Code: 0.01 (GET)
  Message ID: 0x7D34
  Token: 0xFA4B2C01

  Options:
    Uri-Host: "sensor.local"
    Uri-Path: "temperature"
    Accept: application/json (50)

  Wire bytes:
    44 01 7d 34 fa 4b 2c 01
    39 73 65 6e 73 6f 72 2e
    6c 6f 63 61 6c ...`
					},
					{
						title: '2.05 Content Response',
						code: `CoAP Message (UDP):
  Version: 1
  Type: Acknowledgement (ACK)
  Token Length: 4
  Code: 2.05 (Content)
  Message ID: 0x7D34
  Token: 0xFA4B2C01

  Options:
    Content-Format: application/json (50)
    Max-Age: 30

  Payload Marker: 0xFF
  Payload:
    {"temp": 22.5, "unit": "C"}`
					}
				]
			}
		]
	},
	performance: {
		latency: 'No connection setup (UDP) — single RTT for confirmable, zero for non-confirmable',
		throughput: 'Low throughput by design — optimized for small, infrequent messages',
		overhead: '4-byte base header. Total message often under 100 bytes.'
	},
	connections: ['udp', 'tls'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Constrained_Application_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc7252'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Arduino_Uno_-_R3.jpg/500px-Arduino_Uno_-_R3.jpg',
		alt: 'Arduino Uno microcontroller board, representative of the constrained IoT devices CoAP was designed for',
		caption:
			'An Arduino Uno — the kind of constrained device [[coap|CoAP]] was designed for. With limited RAM and processing power, these microcontrollers need a protocol lighter than HTTP. [[coap|CoAP]] delivers [[rest|REST]] semantics in as little as 4 bytes of header.',
		credit: 'Photo: SparkFun Electronics / CC BY 2.0, via Wikimedia Commons'
	}
};
