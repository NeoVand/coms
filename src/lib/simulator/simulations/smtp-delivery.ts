import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createSMTPLayer } from '../layers/smtp';

export const smtpDelivery: SimulationConfig = {
	protocolId: 'smtp',
	title: 'SMTP — Email Delivery',
	description:
		'Follow an email from sender to server. SMTP is a text-based, command-response protocol where each step has a clear human-readable exchange — making it one of the most debuggable protocols on the internet.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Mail Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'Mail Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'recipient',
			label: 'Recipient',
			type: 'text',
			defaultValue: 'user@example.com',
			placeholder: 'e.g. user@example.com'
		}
	],
	steps: [
		{
			id: 'greeting',
			label: '220 Ready',
			description:
				'The mail server sends a greeting banner immediately upon TCP connection. The 220 code indicates the service is ready. This banner often reveals the server software and version, which is useful for debugging but can also be a security concern.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Response Code', 'Response Text'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 587, dstPort: 49300, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: '',
					parameter: '',
					responseCode: '220',
					responseText: 'mail.example.com ESMTP ready',
					body: ''
				})
			]
		},
		{
			id: 'ehlo',
			label: 'EHLO',
			description:
				'The client identifies itself with EHLO (Extended HELLO), which replaced the older HELO command. The server responds with a list of supported extensions like STARTTLS, AUTH mechanisms, and maximum message size.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Command', 'Parameter'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49300, dstPort: 587, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: 'EHLO',
					parameter: 'client.example.com',
					responseCode: '',
					responseText: '',
					body: ''
				})
			]
		},
		{
			id: 'ehlo-response',
			label: '250 OK',
			description:
				'The server confirms the EHLO and lists its capabilities. STARTTLS support means the connection can be upgraded to encrypted. AUTH PLAIN LOGIN lists supported authentication methods. PIPELINING allows sending multiple commands without waiting for each response.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Response Code', 'Response Text'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 587, dstPort: 49300, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: '',
					parameter: '',
					responseCode: '250',
					responseText: 'STARTTLS, AUTH PLAIN LOGIN, PIPELINING, SIZE 52428800',
					body: ''
				})
			]
		},
		{
			id: 'mail-from',
			label: 'MAIL FROM',
			description:
				'The client specifies the envelope sender address. This is separate from the "From:" header in the email body — the envelope address is used for bounce handling. SPF validation checks whether the sending server is authorized for this domain.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Command', 'Parameter'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49300, dstPort: 587, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: 'MAIL FROM',
					parameter: '<alice@example.com>',
					responseCode: '',
					responseText: '',
					body: ''
				})
			]
		},
		{
			id: 'rcpt-to',
			label: 'RCPT TO',
			description:
				'The client specifies the recipient. The server validates the address exists and that the client is authorized to send to it. Multiple RCPT TO commands can be sent for multiple recipients. A 250 response means the server accepts responsibility for delivery.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Command', 'Parameter'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49300, dstPort: 587, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: 'RCPT TO',
					parameter: '<user@example.com>',
					responseCode: '',
					responseText: '',
					body: ''
				})
			]
		},
		{
			id: 'data-command',
			label: 'DATA',
			description:
				'The client sends the bare DATA command and then must WAIT — SMTP DATA is two-phase (RFC 5321 §3.3). It cannot send the message content until the server grants permission with a 354 reply.',
			fromActor: 'client',
			toActor: 'server',
			duration: 700,
			highlight: ['Command'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49300, dstPort: 587, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: 'DATA',
					parameter: '',
					responseCode: '',
					responseText: '',
					body: ''
				})
			]
		},
		{
			id: 'data-354',
			label: '354 Start mail input',
			description:
				'The server replies 354, telling the client to go ahead and stream the message, ending with a line containing only a single period (<CRLF>.<CRLF>). A server that receives content before it has sent 354 rejects it.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Response Code', 'Response Text'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 587, dstPort: 49300, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: '',
					parameter: '',
					responseCode: '354',
					responseText: 'Start mail input; end with <CRLF>.<CRLF>',
					body: ''
				})
			]
		},
		{
			id: 'data-body',
			label: 'Message body',
			description:
				'Now permitted, the client streams the message — headers (From, To, Subject), a blank line, then the body — terminated by a line containing only a period.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Body'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49300, dstPort: 587, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: '',
					parameter: '',
					responseCode: '',
					responseText: '',
					body: 'Subject: Hello!\\nFrom: alice@example.com\\nTo: user@example.com\\n\\nHi, this is a test email.\\n.'
				})
			]
		},
		{
			id: 'queued',
			label: '250 Queued',
			description:
				"The server accepts the message for delivery and returns a queue ID. The 250 code means the server has taken responsibility for delivering this email. The message will now be relayed to the recipient's mail server by looking up MX records in DNS.",
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Response Code', 'Response Text'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 587, dstPort: 49300, flags: 'PSH,ACK' }),
				createSMTPLayer({
					command: '',
					parameter: '',
					responseCode: '250',
					responseText: '2.0.0 Ok: queued as ABC123DEF',
					body: ''
				})
			]
		}
	]
};
