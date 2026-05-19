import type { Protocol } from '../types';

export const soap: Protocol = {
	id: 'soap',
	name: 'SOAP',
	abbreviation: 'SOAP',
	categoryId: 'web-api',
	port: 80,
	year: 1998,
	rfc: undefined, // W3C standard, not RFC
	oneLiner:
		'{{xml|XML}}-based messaging for enterprise web services — structured envelopes, strict schemas, and built-in error handling.',
	overview: `[[soap|SOAP]] is a messaging protocol that wraps remote procedure calls in structured {{xml|XML}} envelopes. Originally "Simple Object Access Protocol," the {{w3c|W3C}} dropped the acronym expansion in [[soap|SOAP]] 1.2 (2003) — it's now just "[[soap|SOAP]]." Developed by Dave Winer, Don Box, and others at {{microsoft|Microsoft}} in 1998, it became the backbone of enterprise web services throughout the 2000s. Services describe themselves using {{wsdl|WSDL}} (Web Services Description Language) — a machine-readable {{xml|XML}} contract that defines available operations, message formats, and endpoint URLs. Where [[rest|REST]] embraces simplicity and convention, [[soap|SOAP]] enforces formality and precision.

Every [[soap|SOAP]] message is an {{xml|XML}} Envelope containing an optional {{header|Header}} and a required Body. The Header carries metadata — authentication tokens, routing information, transaction IDs, WS-Addressing headers — while the Body contains the actual operation and its parameters. [[soap|SOAP]] messages travel over [[http1|HTTP]] POST (most commonly), though the {{protocol|protocol}} is transport-agnostic and can also run over [[smtp|SMTP]], JMS, or raw [[tcp|TCP]]. In [[soap|SOAP]] 1.1, the Content-Type is \`text/xml\` and a separate \`SOAPAction\` {{header|HTTP header}} identifies the intended operation. [[soap|SOAP]] 1.2 changed this: it uses \`application/soap+xml\` and embeds the action in the Content-Type parameter instead.

[[soap|SOAP]] remains deeply embedded in banking, healthcare, government, and insurance systems where its strengths {{matter|matter}} most: {{wsdl|WSDL}} provides formal contracts that both sides can validate at compile time, WS-Security handles {{encryption|encryption}} and signing at the message level (beyond what [[tls|TLS]] offers), WS-ReliableMessaging guarantees delivery, and WS-AtomicTransaction coordinates distributed commits. For new projects, [[rest|REST]], [[grpc|gRPC]], and [[graphql|GraphQL]] have largely replaced [[soap|SOAP]] — but the protocol still processes trillions of dollars in financial transactions every year.`,
	howItWorks: [
		{
			title: 'WSDL discovery',
			description:
				'Client fetches the {{wsdl|WSDL}} document from the service endpoint (typically at ?{{wsdl|wsdl}}). The {{wsdl|WSDL}} describes all available operations, their input/output message schemas, data types, and the endpoint URL — everything needed to generate client code.'
		},
		{
			title: 'Envelope construction',
			description:
				'Client builds an {{xml|XML}} [[soap|SOAP]] Envelope containing an optional Header (authentication, routing, transaction context) and a Body with the operation name and parameters. The SOAPAction {{header|HTTP header}} is set to identify the target operation.'
		},
		{
			title: 'HTTP POST',
			description:
				'The complete {{xml|XML}} envelope is sent as an HTTP POST request with Content-Type: text/xml ([[soap|SOAP]] 1.1) or application/soap+xml ([[soap|SOAP]] 1.2). Unlike [[rest|REST]], [[soap|SOAP]] always uses POST regardless of whether the operation reads or writes data.'
		},
		{
			title: 'Response or Fault',
			description:
				'Server processes the request and returns a [[soap|SOAP]] response envelope containing the result in the Body. If an error occurs, the server returns a [[soap|SOAP]] Fault element with a fault code, fault string, and optional detail — the [[soap|SOAP]] equivalent of HTTP error status codes.'
		}
	],
	useCases: [
		'Enterprise financial systems and banking APIs (SWIFT, payment gateways)',
		'Healthcare data exchange (HL7, insurance claims processing)',
		'Government and regulatory reporting systems',
		'Legacy enterprise application integration (ERP, CRM)',
		'Web services requiring formal contracts and strict schema validation'
	],
	codeExample: {
		language: 'python',
		code: `from zeep import Client

# WSDL auto-generates Python methods
client = Client('https://example.com/service?wsdl')

# Call a SOAP operation like a normal function
result = client.service.GetUser(userId=42)
print(result.name)    # "Alice Chen"
print(result.email)   # "alice@example.com"

# SOAP fault handling
try:
    client.service.DeleteUser(userId=9999)
except Exception as e:
    print(f"SOAP Fault: {e}")`,
		caption:
			'[[soap|SOAP]] with zeep — the library reads the {{wsdl|WSDL}} and generates typed Python methods automatically.',
		alternatives: [
			{
				language: 'javascript',
				code: `import soap from 'soap';

// Create client from WSDL
const client = await soap.createClientAsync(
  'https://example.com/service?wsdl'
);

// Call a SOAP operation
const [result] = await client.GetUserAsync({
  userId: 42
});
console.log(result.name);   // "Alice Chen"
console.log(result.email);  // "alice@example.com"

// List all available operations
console.log(Object.keys(client.describe()));`
			},
			{
				language: 'cli',
				code: `# Send a SOAP request with curl
curl -X POST https://example.com/service \\
  -H "Content-Type: text/xml" \\
  -H "SOAPAction: GetUser" \\
  -d '<?xml version="1.0"?>
<soap:Envelope
  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
  xmlns:srv="http://example.com/service">
  <soap:Body>
    <srv:GetUser>
      <srv:userId>42</srv:userId>
    </srv:GetUser>
  </soap:Body>
</soap:Envelope>'

# Fetch the WSDL to see available operations
curl https://example.com/service?wsdl`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'SOAP Request Envelope',
						code: `POST /service HTTP/1.1\nHost: example.com\nContent-Type: text/xml; charset=utf-8\nSOAPAction: "http://example.com/service/GetUser"\n\n<?xml version="1.0" encoding="UTF-8"?>\n<soap:Envelope\n  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"\n  xmlns:srv="http://example.com/service">\n  <soap:Header>\n    <srv:AuthToken>Bearer eyJhbGc...</srv:AuthToken>\n  </soap:Header>\n  <soap:Body>\n    <srv:GetUser>\n      <srv:userId>42</srv:userId>\n    </srv:GetUser>\n  </soap:Body>\n</soap:Envelope>`
					},
					{
						title: 'SOAP Response Envelope',
						code: `HTTP/1.1 200 OK\nContent-Type: text/xml; charset=utf-8\n\n<?xml version="1.0" encoding="UTF-8"?>\n<soap:Envelope\n  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <GetUserResponse>\n      <user>\n        <id>42</id>\n        <name>Alice Chen</name>\n        <email>alice@example.com</email>\n        <role>admin</role>\n      </user>\n    </GetUserResponse>\n  </soap:Body>\n</soap:Envelope>`
					},
					{
						title: 'SOAP Fault',
						code: `HTTP/1.1 500 Internal Server Error\nContent-Type: text/xml; charset=utf-8\n\n<?xml version="1.0" encoding="UTF-8"?>\n<soap:Envelope\n  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n  <soap:Body>\n    <soap:Fault>\n      <faultcode>soap:Client</faultcode>\n      <faultstring>User not found</faultstring>\n      <detail>\n        <errorCode>USR_404</errorCode>\n        <message>No user with ID 9999</message>\n      </detail>\n    </soap:Fault>\n  </soap:Body>\n</soap:Envelope>`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Same as HTTP — one request-response round trip. XML parsing adds 1-5ms overhead compared to JSON.',
		throughput:
			'XML payloads are 2-10x larger than equivalent JSON, reducing effective throughput.',
		overhead:
			'Heavy — XML envelopes, namespace declarations, and schema validation. A simple "hello" operation may produce 500+ bytes of XML.'
	},
	connections: ['http1', 'json-rpc', 'tcp', 'tls', 'rest', 'grpc', 'graphql'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/[[soap|SOAP]]',
		official: 'https://www.w3.org/TR/soap12/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/IBM_System_360_at_USDA.jpg/500px-IBM_System_360_at_USDA.jpg',
		alt: 'IBM System/360 mainframe at the USDA Data Processing Center in 1966',
		caption:
			'The IBM System/360 at the USDA (1966). Mainframes like these laid the groundwork for enterprise computing — the world that [[soap|SOAP]] was built to serve, wrapping remote procedure calls in {{xml|XML}} for cross-platform interoperability.',
		credit: 'Photo: U.S. Department of Agriculture / Public Domain, via Wikimedia Commons'
	}
};
