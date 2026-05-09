import type { Protocol } from '../types';

export const xmpp: Protocol = {
	id: 'xmpp',
	name: 'Extensible Messaging and Presence Protocol',
	abbreviation: 'XMPP',
	categoryId: 'async-iot',
	port: 5222,
	year: 1999,
	rfc: 'RFC 6120',
	oneLiner:
		'The open, XML-based messaging protocol born as Jabber — federated chat before it was cool.',
	overview: `In January 1999, Jeremie Miller was tired of juggling four different instant messaging clients for four different walled-garden services. So he built Jabber — an open, federated messaging system where anyone could run a server and talk to anyone on any other server. That system became XMPP, and its ideas about federation and open standards shaped the future of messaging.

XMPP uses persistent {{xml|XML}} streams between {{client-server|clients and servers}} over [[tcp|TCP]]. Messages, presence updates ("Alice is online"), and IQ (info/query) stanzas flow as XML fragments over these streams. The {{protocol|protocol}} is designed to be extensible — hundreds of XEPs (XMPP Extension Protocols) add capabilities from file transfer and multi-user chat to IoT device management.

Google Talk, the early versions of WhatsApp, Facebook Messenger (originally), and Apple's iChat (their desktop chat client) all used XMPP at some point. iChat supported XMPP federation briefly, though Apple's later iMessage system uses a completely proprietary push notification service (APNs). While many moved to proprietary protocols for scale, XMPP remains the backbone of countless enterprise chat systems, IoT platforms, and the federated messaging movement.`,
	howItWorks: [
		{
			title: 'TCP connection + stream negotiation',
			description:
				'Client opens a [[tcp|TCP]] connection to the server on port 5222, then opens an XML stream. The server responds with its own stream header, and they negotiate [[tls|TLS]] and authentication.'
		},
		{
			title: 'Authentication and resource binding',
			description:
				'Client authenticates via SASL (typically SCRAM-SHA-1). After auth, the client binds a "resource" to distinguish multiple devices for the same account.'
		},
		{
			title: 'Stanza exchange',
			description:
				'Three types of XML stanzas flow: <message> for chat, <presence> for online/offline status, and <iq> (info/query) for request-response interactions.'
		},
		{
			title: 'Server-to-server federation',
			description:
				'When alice@server-a.com messages bob@server-b.com, Server A connects to Server B on port 5269 using [[tls|TLS]]. Messages route between federated servers just like email.'
		},
		{
			title: 'Extensions (XEPs)',
			description:
				'The base protocol is minimal. Hundreds of XEPs add features: multi-user chat, HTTP file upload, message carbons, end-to-end encryption (OMEMO), and more.'
		}
	],
	useCases: [
		'Enterprise instant messaging (Cisco Jabber, Zoom Chat backend)',
		'IoT device communication and management',
		'Federated social messaging (Conversations, Dino)',
		'Real-time collaboration and presence systems',
		'Gaming chat and notification infrastructure'
	],
	codeExample: {
		language: 'python',
		code: `import slixmpp

class ChatBot(slixmpp.ClientXMPP):
    def __init__(self, jid, password):
        super().__init__(jid, password)
        self.add_event_handler("session_start", self.start)
        self.add_event_handler("message", self.on_message)

    async def start(self, event):
        self.send_presence()  # I'm online
        self.send_message(
            mto="bob@example.com",
            mbody="Hey Bob, XMPP still rocks!")

    def on_message(self, msg):
        if msg["type"] == "chat":
            print(f"{msg['from']}: {msg['body']}")

bot = ChatBot("alice@example.com", "secret")
bot.connect()
bot.process()`,
		caption: 'XMPP client — connect, announce presence, and send messages as XML stanzas',
		alternatives: [
			{
				language: 'javascript',
				code: `const { client, xml } = require('@xmpp/client');

const xmpp = client({
  service: 'xmpp://chat.example.com:5222',
  username: 'alice',
  password: 'secret'
});

xmpp.on('online', (address) => {
  console.log('Connected as', address.toString());
  xmpp.send(xml('presence')); // I'm online

  xmpp.send(
    xml('message', { to: 'bob@example.com', type: 'chat' },
      xml('body', {}, 'Hey Bob, XMPP still rocks!')
    )
  );
});

xmpp.on('stanza', (stanza) => {
  if (stanza.is('message') && stanza.getChild('body')) {
    const from = stanza.attrs.from;
    const body = stanza.getChildText('body');
    console.log(from + ': ' + body);
  }
});

xmpp.start().catch(console.error);`
			},
			{
				language: 'cli',
				code: `# Send a message using sendxmpp
echo "Hello Bob!" | sendxmpp -t bob@example.com

# Connect interactively with profanity
profanity -a alice@example.com

# Test XMPP server connectivity
nmap -sV -p 5222 chat.example.com

# Check SRV DNS records for XMPP
dig _xmpp-client._tcp.example.com SRV +short`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Stream Open',
						code: `Client → Server:
  <?xml version='1.0'?>
  <stream:stream
    to='example.com'
    xmlns='jabber:client'
    xmlns:stream='http://etherx.jabber.org/streams'
    version='1.0'>

Server → Client:
  <?xml version='1.0'?>
  <stream:stream
    from='example.com'
    id='session_42'
    xmlns='jabber:client'
    xmlns:stream='http://etherx.jabber.org/streams'
    version='1.0'>

  <stream:features>
    <mechanisms xmlns='urn:ietf:params:xml:ns:xmpp-sasl'>
      <mechanism>PLAIN</mechanism>
      <mechanism>SCRAM-SHA-1</mechanism>
    </mechanisms>
  </stream:features>`
					},
					{
						title: 'Message Stanza',
						code: `Client → Server:
  <message
    to='bob@example.com'
    from='alice@example.com/laptop'
    type='chat'
    id='msg-001'>
    <body>Hey Bob, are you there?</body>
    <active xmlns='http://jabber.org/protocol/chatstates'/>
  </message>

Server → Recipient:
  <message
    to='bob@example.com/phone'
    from='alice@example.com/laptop'
    type='chat'
    id='msg-001'>
    <body>Hey Bob, are you there?</body>
  </message>`
					},
					{
						title: 'Presence Stanza',
						code: `Client → Server (go online):
  <presence>
    <show>chat</show>
    <status>Available for messages</status>
    <priority>10</priority>
  </presence>

Server → Contacts (broadcast):
  <presence
    from='alice@example.com/laptop'
    to='bob@example.com'>
    <show>chat</show>
    <status>Available for messages</status>
  </presence>`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Near-instant over persistent TCP connections. Presence updates propagate in milliseconds.',
		throughput:
			'ejabberd handles 2+ million concurrent connections. XML overhead is the main cost.',
		overhead:
			'XML stanzas are verbose compared to binary protocols. Compression and WebSocket transport help.'
	},
	connections: ['tcp', 'tls', 'websockets'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/XMPP',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc6120',
		official: 'https://xmpp.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/JabberNetwork.svg/500px-JabberNetwork.svg.png',
		alt: 'Diagram of the XMPP/Jabber federated network showing multiple servers interconnected with clients on each server',
		caption:
			'XMPP federation — just like email, anyone can run their own XMPP server and communicate with users on any other server. This decentralized architecture means no single company controls the network.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
	}
};
