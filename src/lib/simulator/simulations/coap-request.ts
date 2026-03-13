import type { SimulationConfig } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createCoAPLayer } from '../layers/coap';

export const coapRequest: SimulationConfig = {
	protocolId: 'coap',
	title: 'CoAP — Constrained RESTful Request',
	description:
		'See how CoAP brings REST to IoT devices. Like HTTP but over UDP with a compact 4-byte header, CoAP uses confirmable messages for reliability and supports resource observation for server push — all designed for constrained networks.',
	tier: 'client',
	actors: [
		{ id: 'sensor', label: 'IoT Sensor', icon: 'device', position: 'left' },
		{ id: 'server', label: 'CoAP Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'resource',
			label: 'Resource',
			type: 'text',
			defaultValue: '/temperature',
			placeholder: 'e.g. /humidity'
		}
	],
	steps: [
		{
			id: 'con-get',
			label: 'CON GET',
			description:
				'The sensor sends a Confirmable GET request to read the temperature resource. CON messages must be acknowledged — if no ACK arrives, the sender retransmits with exponential backoff. The compact 4-byte header keeps overhead minimal for constrained 6LoWPAN networks.',
			fromActor: 'sensor',
			toActor: 'server',
			duration: 800,
			highlight: ['Type', 'Code', 'Options'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49700, dstPort: 5683 }),
				createCoAPLayer({
					version: 1,
					type: 'CON (0)',
					tokenLen: 4,
					code: '0.01 GET',
					messageId: '0x7D34',
					options: 'Uri-Path: /temperature, Accept: application/json',
					payload: ''
				})
			]
		},
		{
			id: 'ack-content',
			label: 'ACK 2.05 Content',
			description:
				'The server responds with an ACK carrying the requested data (piggybacked response). Code 2.05 is the CoAP equivalent of HTTP 200 OK. The Message ID matches the request, confirming receipt. Max-Age tells the client how long to cache this value before re-fetching.',
			fromActor: 'server',
			toActor: 'sensor',
			duration: 800,
			highlight: ['Code', 'Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 5683, dstPort: 49700 }),
				createCoAPLayer({
					version: 1,
					type: 'ACK (2)',
					tokenLen: 4,
					code: '2.05 Content',
					messageId: '0x7D34',
					options: 'Content-Format: application/json, Max-Age: 60',
					payload: '{"value": 22.5, "unit": "C"}'
				})
			]
		},
		{
			id: 'con-put',
			label: 'CON PUT',
			description:
				'The sensor updates a resource on the server using PUT. CoAP methods mirror HTTP: GET reads, PUT updates, POST creates, DELETE removes. This RESTful design means developers familiar with HTTP can easily work with CoAP-based IoT systems.',
			fromActor: 'sensor',
			toActor: 'server',
			duration: 800,
			highlight: ['Code', 'Options', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 17 }),
				createUDPLayer({ srcPort: 49700, dstPort: 5683 }),
				createCoAPLayer({
					version: 1,
					type: 'CON (0)',
					tokenLen: 4,
					code: '0.03 PUT',
					messageId: '0x7D35',
					options: 'Uri-Path: /led, Content-Format: text/plain',
					payload: 'ON'
				})
			]
		},
		{
			id: 'ack-changed',
			label: 'ACK 2.04 Changed',
			description:
				'The server confirms the resource was updated successfully. Code 2.04 Changed is the CoAP equivalent of HTTP 204 No Content. The empty payload is typical for update confirmations — the client already knows what it sent. CoAP\'s simplicity makes it ideal for battery-powered sensors.',
			fromActor: 'server',
			toActor: 'sensor',
			duration: 600,
			highlight: ['Code', 'Message ID'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 17 }),
				createUDPLayer({ srcPort: 5683, dstPort: 49700 }),
				createCoAPLayer({
					version: 1,
					type: 'ACK (2)',
					tokenLen: 4,
					code: '2.04 Changed',
					messageId: '0x7D35',
					options: '',
					payload: ''
				})
			]
		}
	]
};
