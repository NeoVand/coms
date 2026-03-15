import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createSOAPLayer } from '../layers/soap';

function httpRequestLayer(
	method: string,
	path: string,
	contentType: string,
	extra?: Record<string, string>
) {
	return {
		name: 'HTTP Request',
		abbreviation: 'HTTP',
		osiLayer: 7 as const,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Method',
				bits: 0,
				value: method,
				editable: false,
				description: `HTTP method — ${method}`
			},
			{
				name: 'Path',
				bits: 0,
				value: path,
				editable: false,
				description: 'Request path on the SOAP service'
			},
			{
				name: 'Version',
				bits: 0,
				value: 'HTTP/1.1',
				editable: false,
				description: 'Protocol version'
			},
			{
				name: 'Host',
				bits: 0,
				value: 'services.example.com',
				editable: false,
				description: 'SOAP service hostname'
			},
			{
				name: 'Content-Type',
				bits: 0,
				value: contentType,
				editable: false,
				description: 'MIME type — SOAP uses text/xml or application/soap+xml'
			},
			...(extra?.soapAction
				? [
						{
							name: 'SOAPAction',
							bits: 0,
							value: extra.soapAction,
							editable: false,
							description:
								'HTTP header identifying the SOAP operation — required by SOAP 1.1'
						}
					]
				: [])
		]
	};
}

function httpResponseLayer(status: string, contentType: string, statusColor: string) {
	return {
		name: 'HTTP Response',
		abbreviation: 'HTTP',
		osiLayer: 7 as const,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Version',
				bits: 0,
				value: 'HTTP/1.1',
				editable: false,
				description: 'Protocol version'
			},
			{
				name: 'Status',
				bits: 0,
				value: status,
				editable: false,
				description: `HTTP status — ${status}`,
				color: statusColor
			},
			{
				name: 'Content-Type',
				bits: 0,
				value: contentType,
				editable: false,
				description: 'Response content type'
			}
		]
	};
}

export const soapRequest: SimulationConfig = {
	protocolId: 'soap',
	title: 'SOAP Web Service Call',
	description:
		'See how SOAP wraps remote procedure calls in XML envelopes. The flow covers WSDL discovery, request construction, and fault handling — the full lifecycle of an enterprise web service call.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'SOAP Client', icon: 'browser', position: 'left' },
		{ id: 'service', label: 'SOAP Service', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'operation',
			label: 'SOAP Operation',
			type: 'select',
			defaultValue: 'GetUser',
			options: ['GetUser', 'CreateOrder', 'GetInventory']
		}
	],
	steps: [
		{
			id: 'wsdl-request',
			label: 'WSDL Discovery',
			description:
				'Client requests the WSDL document to discover available operations, message formats, and endpoint addresses. WSDL is the machine-readable contract that describes the entire service.',
			fromActor: 'client',
			toActor: 'service',
			duration: 800,
			highlight: ['Method', 'Path'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 51400, dstPort: 80, flags: 'PSH,ACK' }),
				httpRequestLayer('GET', '/UserService?wsdl', 'text/xml')
			]
		},
		{
			id: 'wsdl-response',
			label: 'WSDL Document',
			description:
				'Service returns the WSDL — an XML document describing operations (GetUser, CreateUser), their input/output message schemas, binding style (document/literal), and the endpoint URL.',
			fromActor: 'service',
			toActor: 'client',
			duration: 1000,
			highlight: ['Status', 'Content-Type'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({ srcPort: 80, dstPort: 51400, flags: 'PSH,ACK' }),
				httpResponseLayer('200 OK', 'text/xml', '#22c55e')
			]
		},
		{
			id: 'soap-envelope',
			label: 'SOAP Request',
			description:
				'Client constructs a SOAP envelope and sends it via HTTP POST. The envelope wraps the operation name and parameters in a structured XML body, with the SOAPAction header identifying the intent.',
			fromActor: 'client',
			toActor: 'service',
			duration: 800,
			highlight: ['Body', 'SOAPAction'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 51400, dstPort: 80, flags: 'PSH,ACK' }),
				httpRequestLayer('POST', '/UserService', 'text/xml; charset=utf-8', {
					soapAction: '"http://example.com/GetUser"'
				}),
				createSOAPLayer({
					body: 'GetUser(id: 42)',
					namespace: 'http://example.com/users',
					soapAction: 'http://example.com/GetUser'
				})
			]
		},
		{
			id: 'soap-response',
			label: 'SOAP Response',
			description:
				'Service processes the request, executes the operation, and returns the result wrapped in a SOAP response envelope. The Body contains the serialized return value.',
			fromActor: 'service',
			toActor: 'client',
			duration: 1000,
			highlight: ['Body', 'Status'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({ srcPort: 80, dstPort: 51400, flags: 'PSH,ACK' }),
				httpResponseLayer('200 OK', 'text/xml; charset=utf-8', '#22c55e'),
				createSOAPLayer({
					body: 'GetUserResponse(name: "Alice", email: "alice@...")',
					namespace: 'http://example.com/users'
				})
			]
		},
		{
			id: 'soap-fault-request',
			label: 'Invalid Request',
			description:
				'Client sends a request with an invalid parameter to demonstrate SOAP fault handling. Unlike REST (which uses HTTP status codes), SOAP has its own structured error mechanism.',
			fromActor: 'client',
			toActor: 'service',
			duration: 800,
			highlight: ['Body', 'SOAPAction'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 51400, dstPort: 80, flags: 'PSH,ACK' }),
				httpRequestLayer('POST', '/UserService', 'text/xml; charset=utf-8', {
					soapAction: '"http://example.com/GetUser"'
				}),
				createSOAPLayer({
					body: 'GetUser(id: -1)',
					namespace: 'http://example.com/users',
					soapAction: 'http://example.com/GetUser'
				})
			]
		},
		{
			id: 'soap-fault',
			label: 'SOAP Fault',
			description:
				'Service returns a SOAP Fault — the structured error format with faultcode, faultstring, and detail. The HTTP status is 500, but the real error information lives in the SOAP Fault element inside the envelope body.',
			fromActor: 'service',
			toActor: 'client',
			duration: 1000,
			highlight: ['Body', 'Status'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({ srcPort: 80, dstPort: 51400, flags: 'PSH,ACK' }),
				httpResponseLayer(
					'500 Internal Server Error',
					'text/xml; charset=utf-8',
					'#ef4444'
				),
				createSOAPLayer({
					body: 'Fault(code: "Client", string: "Invalid user ID")',
					header: 'faultactor: http://example.com/UserService'
				})
			]
		}
	]
};
