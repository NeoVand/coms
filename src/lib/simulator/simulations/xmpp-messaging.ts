import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createXMPPLayer } from '../layers/xmpp';

export const xmppMessaging: SimulationConfig = {
	protocolId: 'xmpp',
	title: 'XMPP — Chat Messaging',
	description:
		'Follow an XMPP session from stream negotiation to sending a chat message. XMPP uses XML stanzas over a persistent TCP connection — the same protocol that powers billions of messages in WhatsApp, Google Talk, and Jabber.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'XMPP Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'recipient',
			label: 'Recipient',
			type: 'text',
			defaultValue: 'bob@example.com',
			placeholder: 'e.g. bob@example.com'
		}
	],
	steps: [
		{
			id: 'stream-open',
			label: 'Stream Open',
			description:
				'The client opens an XML stream to the server. This is not a complete XML document — it is the opening tag of a long-lived stream. The server responds with its own stream header, establishing a bidirectional XML pipe. All subsequent stanzas flow within this stream.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Stanza Type', 'Namespace'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52900, dstPort: 5222, flags: 'PSH,ACK' }),
				createXMPPLayer({
					stanzaType: '<stream:stream>',
					from: 'alice@example.com',
					to: 'example.com',
					id: '',
					namespace: 'jabber:client',
					body: 'xmlns:stream="http://etherx.jabber.org/streams", version="1.0"'
				})
			]
		},
		{
			id: 'stream-features',
			label: 'Stream Features',
			description:
				'The server announces its capabilities in a <stream:features> element. This includes required authentication mechanisms (SASL), optional TLS encryption (STARTTLS), and resource binding. The client must complete these features in order before the stream is fully negotiated.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Stanza Type', 'Body'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 5222, dstPort: 52900, flags: 'PSH,ACK' }),
				createXMPPLayer({
					stanzaType: '<stream:features>',
					from: 'example.com',
					to: '',
					id: '',
					namespace: 'jabber:client',
					body: '<mechanisms><mechanism>SCRAM-SHA-1</mechanism><mechanism>PLAIN</mechanism></mechanisms>'
				})
			]
		},
		{
			id: 'sasl-auth',
			label: 'SASL Auth',
			description:
				'The client authenticates using SASL (Simple Authentication and Security Layer). SCRAM-SHA-1 is the preferred mechanism — it provides mutual authentication without sending the password in plain text. On success, the server sends a <success> element and the stream is reset.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Stanza Type', 'Namespace'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52900, dstPort: 5222, flags: 'PSH,ACK' }),
				createXMPPLayer({
					stanzaType: '<auth>',
					from: '',
					to: '',
					id: '',
					namespace: 'urn:ietf:params:xml:ns:xmpp-sasl',
					body: 'mechanism="SCRAM-SHA-1", [base64 credentials]'
				})
			]
		},
		{
			id: 'bind-resource',
			label: 'Bind Resource',
			description:
				'After authentication, the client binds a resource to create a full JID (alice@example.com/laptop). The resource part allows multiple devices to connect simultaneously under the same account. The server assigns the resource and returns the full JID.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Stanza Type', 'ID', 'Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52900, dstPort: 5222, flags: 'PSH,ACK' }),
				createXMPPLayer({
					stanzaType: '<iq type="set">',
					from: '',
					to: '',
					id: 'bind-1',
					namespace: 'urn:ietf:params:xml:ns:xmpp-bind',
					body: '<bind><resource>laptop</resource></bind>'
				})
			]
		},
		{
			id: 'message',
			label: 'Message',
			description:
				'The client sends a chat message to bob@example.com. The <message> stanza is one of three core XMPP stanza types (along with <presence> and <iq>). The server routes it based on the "to" attribute — if Bob is on another server, XMPP federation delivers it via server-to-server streams.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Stanza Type', 'To', 'Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52900, dstPort: 5222, flags: 'PSH,ACK' }),
				createXMPPLayer({
					stanzaType: '<message type="chat">',
					from: 'alice@example.com/laptop',
					to: 'bob@example.com',
					id: 'msg-1',
					namespace: 'jabber:client',
					body: '<body>Hey Bob, are you free for lunch?</body>'
				})
			]
		}
	]
};
