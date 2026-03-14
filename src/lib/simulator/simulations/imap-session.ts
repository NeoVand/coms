import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createIMAPLayer } from '../layers/imap';

export const imapSession: SimulationConfig = {
	protocolId: 'imap',
	title: 'IMAP — Email Retrieval',
	description:
		'Watch how your email client reads messages from the server. Unlike POP3 which downloads and deletes, IMAP keeps mail on the server — every device sees the same inbox, same folders, same read/unread state.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Mail Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'IMAP Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'mailbox',
			label: 'Mailbox',
			type: 'text',
			defaultValue: 'INBOX',
			placeholder: 'e.g. INBOX, Drafts, Sent'
		}
	],
	steps: [
		{
			id: 'greeting',
			label: '* OK Ready',
			description:
				'The IMAP server sends an untagged greeting immediately upon TLS connection. The * prefix means this is an untagged response — not associated with any client command. The greeting confirms the server supports IMAP4rev2.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Tag', 'Response Status', 'Response Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 993, dstPort: 49200, flags: 'PSH,ACK' }),
				createIMAPLayer({
					tag: '*',
					command: '',
					arguments: '',
					responseStatus: 'OK',
					responseData: 'IMAP4rev2 server ready'
				})
			]
		},
		{
			id: 'login',
			label: 'A001 LOGIN',
			description:
				'The client authenticates with a tagged LOGIN command. The tag "A001" uniquely identifies this command — the server\'s response will include the same tag, allowing IMAP to pipeline multiple commands without confusion. In production, SASL authentication (PLAIN, OAUTH2) is preferred over LOGIN.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Tag', 'Command', 'Arguments'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49200, dstPort: 993, flags: 'PSH,ACK' }),
				createIMAPLayer({
					tag: 'A001',
					command: 'LOGIN',
					arguments: 'user@example.com ********',
					responseStatus: '',
					responseData: ''
				})
			]
		},
		{
			id: 'login-ok',
			label: 'A001 OK',
			description:
				'The server confirms authentication with a tagged OK response. The tag "A001" matches the LOGIN command, confirming which command succeeded. The client now has access to the user\'s mailboxes.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Tag', 'Response Status', 'Response Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 993, dstPort: 49200, flags: 'PSH,ACK' }),
				createIMAPLayer({
					tag: 'A001',
					command: '',
					arguments: '',
					responseStatus: 'OK',
					responseData: 'LOGIN completed'
				})
			]
		},
		{
			id: 'select',
			label: 'A002 SELECT',
			description:
				'The client selects a mailbox to work with. SELECT opens INBOX in read-write mode (EXAMINE would open it read-only). The server will respond with the mailbox state — how many messages exist, which are recent, what flags are available.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Tag', 'Command', 'Arguments'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49200, dstPort: 993, flags: 'PSH,ACK' }),
				createIMAPLayer({
					tag: 'A002',
					command: 'SELECT',
					arguments: 'INBOX',
					responseStatus: '',
					responseData: ''
				})
			]
		},
		{
			id: 'select-response',
			label: 'A002 OK',
			description:
				'The server returns the complete mailbox state: 47 messages exist, 2 are recent (new since last check), and the available flags for messages. The UIDVALIDITY value ensures the client\'s cached UIDs are still valid — if it changes, the client must re-sync everything.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Tag', 'Response Status', 'Response Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 993, dstPort: 49200, flags: 'PSH,ACK' }),
				createIMAPLayer({
					tag: 'A002',
					command: '',
					arguments: '',
					responseStatus: 'OK',
					responseData: '47 EXISTS, 2 RECENT, FLAGS (\\Seen \\Flagged \\Deleted \\Draft)'
				})
			]
		},
		{
			id: 'fetch',
			label: 'A003 FETCH',
			description:
				'The client requests the newest message\'s envelope (sender, subject, date) and body text. IMAP can fetch specific parts of messages — just headers, just the text body, or individual MIME attachments — without downloading the entire message. This is one of IMAP\'s key advantages over POP3.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Tag', 'Command', 'Arguments'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49200, dstPort: 993, flags: 'PSH,ACK' }),
				createIMAPLayer({
					tag: 'A003',
					command: 'FETCH',
					arguments: '47 (ENVELOPE BODY[TEXT])',
					responseStatus: '',
					responseData: ''
				})
			]
		},
		{
			id: 'fetch-response',
			label: 'A003 OK',
			description:
				'The server returns the message data with the matching tag. The ENVELOPE contains structured metadata (date, subject, from, to) while BODY[TEXT] contains the message body. The mail stays on the server — other devices will see it too, with the \\Seen flag now set.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1200,
			highlight: ['Tag', 'Response Status', 'Response Data'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 993, dstPort: 49200, flags: 'PSH,ACK' }),
				createIMAPLayer({
					tag: 'A003',
					command: '',
					arguments: '',
					responseStatus: 'OK',
					responseData: 'Subject: Meeting Tomorrow, From: alice@example.com'
				})
			]
		}
	]
};
