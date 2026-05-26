import type { SubcategoryStory } from './types';

export const federatedMessagingStory: SubcategoryStory = {
	subcategoryId: 'federated-messaging',
	tagline:
		"Federated chat for an era that wanted walled gardens — the protocol that powered everyone before everyone left",
	sections: [
		{
			type: 'narrative',
			title: 'The Federated Dream',
			text: `In 1999, instant messaging was a mess. AOL Instant Messenger, ICQ, MSN Messenger, and Yahoo! Messenger were the dominant players, and they were *deliberately* incompatible. AOL spent years patching its servers to actively block third-party clients. If you wanted to message someone on AIM and you used Yahoo, you had to install Yahoo too. Both.\n\nJeremie Miller — a developer in St. Louis — looked at this and asked the obvious question: *why doesn\'t messaging work like email?* Email is **federated**. You don\'t need a Gmail account to email someone with a Gmail address. Any mail server can talk to any other mail server. Your address is \`you@your-server.com\`, and the routing just works.\n\nMiller\'s answer was **Jabber** (1999) — an open, federated, XML-based messaging protocol where users had addresses like \`alice@jabber.org\` and any server could talk to any other server. In 2002, the IETF standardized it as **[[xmpp|XMPP]]** (Extensible Messaging and Presence Protocol) in [[rfc:6120|RFCs 6120 and 6121]].\n\nFor a brief, glorious decade, XMPP looked like it might win. **Google Talk** launched in 2005 on XMPP and federated with other XMPP servers. **Facebook Chat** ran on XMPP from 2008. **WhatsApp** used a modified XMPP for its core messaging through at least 2014. **HipChat**, **GroupMe**, the original **Cisco Jabber** (it kept the name), Zoom\'s chat — all XMPP. At one point in the early 2010s, XMPP carried more messages than any other open protocol on the internet.\n\nThen, one by one, every major provider turned off federation. Google Talk dropped XMPP federation in 2014. Facebook Chat became Facebook Messenger and went proprietary. WhatsApp closed its XMPP-derived protocol to outside servers. The walled gardens won.\n\nThis is the story of how a protocol can be technically successful, used by billions, and still lose.`
		},
		{
			type: 'pioneers',
			title: 'The Federation Architects',
			people: [
				{
					name: 'Jeremie Miller',
					years: '–',
					title: 'Inventor of Jabber/XMPP',
					org: 'Jabber.org / Jabber, Inc. / Anaerobic',
					contribution:
						"Started Jabber in 1998 as a side project to build an open alternative to AIM/ICQ. The original Jabber server (jabberd, written in C) launched in 2000. Miller co-founded Jabber, Inc. (commercial Jabber, eventually acquired by Cisco in 2008). The IETF standardized the protocol as [[xmpp|XMPP]] in 2002 ([[rfc:6120|RFC 3920/3921]], updated in 2011 to [[rfc:6120|RFC 6120/6121]]). After XMPP, Miller worked on TeleHash and a series of decentralized-protocol projects."

				},
				{
					name: 'Peter Saint-Andre',
					years: '–',
					title: 'XSF Executive Director / Spec Editor',
					org: 'XMPP Standards Foundation',
					contribution:
						"Edited the major [[xmpp|XMPP]] specifications for nearly two decades, including the 2011 RFC 6120/6121/6122 update. Saint-Andre also led the XMPP Extensions Process (XEPs) — the document series that defines the dozens of optional protocol extensions (group chat, pub/sub, file transfer, voice, video). Most production XMPP deployments are 95% extensions and 5% core; without the XEP discipline, XMPP would have fragmented years earlier than it did."
				},
				{
					name: 'Matthew Hodgson',
					years: '–',
					title: 'Co-founder of Matrix',
					org: 'Element / Matrix.org Foundation',
					contribution:
						"Co-founded Matrix in 2014 as a deliberate response to XMPP\\'s perceived limitations: XMPP\\'s session-oriented architecture and complex spec sprawl. Matrix\\'s decentralized event-graph model and HTTP-based federation are essentially \"what XMPP could have been if designed in 2014 instead of 1999.\" Matrix isn\\'t XMPP, but it\\'s the spiritual successor — the same federation-instead-of-walled-gardens bet, made one more time."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1999,
					title: 'Jabber Begins',
					description:
						"Jeremie Miller starts the Jabber project. The first design goal: messaging that works the way email works — anyone can run a server, any server can federate with any other."
				},
				{
					year: 2000,
					title: 'jabberd 1.0',
					description:
						'The first production Jabber server ships. Jabber.org becomes the reference deployment.'
				},
				{
					year: 2002,
					title: 'IETF Adopts XMPP',
					description:
						'The IETF chartereds the XMPP Working Group. Jabber becomes the basis for what will be [[xmpp|XMPP]] — Extensible Messaging and Presence Protocol.'
				},
				{
					year: 2004,
					title: 'RFC 3920/3921 — XMPP Core + IM',
					description:
						'The first XMPP RFCs publish. XML streams, JID addressing (\`local@domain/resource\`), presence subscriptions, message stanzas.'
				},
				{
					year: 2005,
					title: 'Google Talk Launches on XMPP',
					description:
						"Google ships Talk as an XMPP-federated service. Any XMPP user could chat with any Google Talk user. For the next decade Google Talk is the protocol\'s flagship deployment."
				},
				{
					year: 2008,
					title: 'Facebook Chat Goes XMPP',
					description:
						"Facebook ships chat using XMPP. Federation is one-way (you could connect from external XMPP clients, but Facebook Chat users couldn\'t message outside)."
				},
				{
					year: 2009,
					title: 'WhatsApp Uses Modified XMPP',
					description:
						"WhatsApp\'s server is a modified ejabberd (Erlang XMPP server). The protocol on the wire is XMPP-derived through at least the 2014 Facebook acquisition era, eventually drifting into a proprietary binary protocol."
				},
				{
					year: 2011,
					title: 'RFC 6120/6121 — XMPP Refresh',
					description:
						"The current XMPP specification, edited by Peter Saint-Andre. Cleans up TLS requirements, internationalization (JIDs in Unicode), and stream features."
				},
				{
					year: 2014,
					title: 'Google Drops XMPP Federation',
					description:
						"Google Talk becomes Hangouts. XMPP federation is removed. The single largest source of cross-server messages on the federated XMPP network disappears overnight."
				},
				{
					year: 2014,
					title: 'Matrix Begins',
					description:
						"Matthew Hodgson and Amandine Le Pape start Matrix as an HTTP-based, decentralized chat protocol. Explicitly positioned as \"what we wish XMPP looked like in 2014.\""
				},
				{
					year: 2017,
					title: 'WhatsApp Goes Fully Proprietary',
					description:
						"The last vestiges of WhatsApp\'s XMPP heritage are replaced by a fully proprietary binary protocol. The largest deployment of an XMPP-derived protocol is no longer XMPP."
				},
				{
					year: 2024,
					title: 'EU Digital Markets Act',
					description:
						"The DMA names \"gatekeeper\" platforms (WhatsApp, Messenger, iMessage) and requires they offer interoperability APIs. The protocol details are unclear; XMPP and Matrix are both being discussed as candidate bridges. The federated dream gets a regulatory comeback."
				}
			]
		},
		{
			type: 'comparison',
			title: 'XMPP, Matrix, and the Walled Gardens',
			axes: ['Federation', 'Wire format', 'Encryption', 'Mobile-first?', 'Status in 2025'],
			rows: [
				{
					label: '[[xmpp|XMPP]]',
					values: [
						'Federated by design',
						'XML stanzas over long-lived TCP/TLS',
						'OMEMO (Signal-protocol-based) or OTR; not mandatory',
						'No — designed for desktop XMPP clients',
						"Still running in niches (gaming, IoT, smart-home); near-zero consumer presence"
					]
				},
				{
					label: 'Matrix',
					values: [
						'Federated; designed in 2014 for federation-first',
						'JSON events over HTTPS',
						'Megolm (Signal-derived); on by default in newer clients',
						'Yes — designed for modern mobile clients',
						"Active growth — used by Element, governments (France, Germany), some Discord-alt communities"
					]
				},
				{
					label: 'WhatsApp / Messenger / iMessage',
					values: [
						'None (walled gardens)',
						'Proprietary binary protocols',
						'Signal Protocol (WhatsApp, Messenger), Apple\'s own (iMessage)',
						'Yes — phone-number-first identity',
						"Billions of users; effectively the messaging layer of mobile"
					]
				}
			],
			note: "The walled gardens won the consumer market. The federated protocols ([[xmpp|XMPP]], Matrix) still matter for governments, IoT, and any context where one party doesn\'t want to depend on Meta\'s servers."
		},
		{
			type: 'animated-sequence',
			title: 'Cross-Server Message Routing',
			definition: `sequenceDiagram
    participant A as alice
    participant SA as example.com Server
    participant DNS as DNS
    participant SB as foo.org Server
    participant B as bob
    Note over A,B: Alice on example.com messages Bob on foo.org
    A->>SA: message to bob at foo.org saying hi
    SA->>DNS: SRV query for _xmpp-server._tcp.foo.org
    DNS-->>SA: xmpp.foo.org on port 5269
    SA->>SB: open server-to-server stream on port 5269
    SB-->>SA: stream features, TLS, dialback verification
    SA->>SB: forward Alice message to Bob
    SB->>B: deliver message from Alice
    Note over A,B: No central authority — just two servers and DNS`,
			caption:
				"This is the federation pattern email pioneered and XMPP brought to chat. Any server can speak to any other server using only DNS — no central authority issues credentials, no platform brokers the connection. Beautiful in theory; commercially fragile in practice.",
			steps: {
				0: '**Federation in action.** Alice is on example.com\'s XMPP server, Bob is on foo.org\'s. Neither server is a "platform" — they\'re run by different operators, and any other organization could run a third without asking permission.',
				1: 'Alice\'s client sends a `<message>` stanza to her own server, addressed to `bob@foo.org`.',
				2: 'Server SA does not know foo.org\'s address. It asks **DNS for the SRV record** `_xmpp-server._tcp.foo.org`. (SRV records let the operator point service traffic at a specific host and port without affecting the main hostname.)',
				3: 'DNS replies with `xmpp.foo.org:5269` — the canonical XMPP server-to-server port. (Client-to-server is 5222; server-to-server is 5269.)',
				4: 'SA **opens an XML stream to SB**. The first time these two servers talk, a stream is established and reused for all subsequent messages between them.',
				5: 'SB responds with **stream features, TLS, and dialback verification**. Dialback is XMPP\'s lightweight "are you really example.com?" check — uses DNS itself to validate.',
				6: 'SA **forwards Alice\'s message** to SB, properly tagged with the sender domain so SB can verify and route.',
				7: 'SB **delivers the message** to Bob\'s connected client (or queues it if Bob is offline).',
				8: '**No central authority.** ICANN does not bless XMPP servers. There is no Meta, no platform. The whole interaction relied only on DNS and the two servers agreeing on a common protocol — exactly the email model.'
			}
		},
		{
			type: 'callout',
			title: 'Why the Walled Gardens Won',
			text: `Federation is the right architecture and it lost. Why?\n\n**Spam and abuse.** Email federates — and the operational cost is the entire anti-spam industry. Every mail server runs SpamAssassin, SPF, DKIM, DMARC, blocklists, reputation scoring. Running a federated chat server means rebuilding that infrastructure. Walled gardens have to police only inside their own walls.\n\n**Mobile push.** Mobile OSes (iOS, Android) heavily restrict background services. A federated chat client can\'t maintain a long-lived XMPP connection — the OS will kill it. Push notifications require a server that *the OS trusts*, which means going through Apple\'s APNs or Google\'s FCM, which means the chat provider has to operate a centralized service anyway. Federation\'s "any server" promise hits the mobile wall.\n\n**End-to-end encryption is harder to federate.** Signal Protocol-style E2EE requires the sender to know each recipient\'s current device keys. In a federated system, fetching keys means trusting the other server to tell the truth. In a walled garden, the central server controls the key directory and the trust is implicit.\n\n**Network effects.** Once WhatsApp has your friends, you can\'t leave without losing them. Federation requires every server operator to coordinate; a walled garden requires only the one operator. The walled gardens scaled faster than federation could compete.\n\nThe technical merit of XMPP was never the question. The economics, the operational complexity, and the mobile platforms killed it.`
		},
		{
			type: 'narrative',
			title: 'The Failure Mode',
			text: `[[xmpp|XMPP]]\'s failure mode wasn\'t a protocol-level bug — it was **extensibility without governance**. The core protocol is small; everything interesting happens in XEPs (XMPP Extension Proposals). Group chat (MUC, XEP-0045) is a XEP. File transfer (Jingle, XEP-0166). End-to-end encryption (OMEMO, XEP-0384). Pub/sub (XEP-0060). Voice and video (XEP-0167).\n\nThis was meant to be a feature — pick the XEPs you need; ignore the rest. In practice, it meant every client supported a *different subset* of XEPs. Sending a file from Pidgin to Adium might work; from Conversations to Gajim might not. From a corporate Cisco Jabber client to anything else, almost never. The "extensible" in the name created interoperability fragmentation that walled gardens, by their nature, didn\'t have.\n\nMatrix\'s answer is to fold more functionality into the core spec and version it deliberately. Whether that strategy avoids the same fragmentation over a long horizon is the open question of the federated chat world.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **EU Digital Markets Act interop** — the DMA names WhatsApp and Messenger as gatekeepers required to offer messaging interoperability to third parties. The technical protocol is being argued; [[xmpp|XMPP]] and Matrix are both in the conversation as candidate bridges. The first time in 20 years that regulation rather than market forces is pushing federation forward.\n- **Matrix in government** — France\'s government chat (Tchap), Germany\'s healthcare messaging (TI-Messenger), and the German Bundeswehr have all standardized on Matrix. Sovereignty concerns are driving uptake where US-based walled gardens are politically unacceptable.\n- **XMPP for IoT and gaming** — the protocol that powers Zoom\'s chat, every major MMO backend (League of Legends, World of Warcraft chat), Sony PlayStation Network messaging, and most XMPP-IoT smart-home stacks. The consumer-chat market is gone; the infrastructure market remains.\n- **Bridges between worlds** — Beeper (acquired by Automattic) and matrix.org bridges aim to be one app that talks to WhatsApp, iMessage, SMS, Telegram, Signal, and Matrix simultaneously. The federation-as-aggregation-layer approach when federation-as-protocol failed.\n- **The unsexy truth**: federated chat lost the consumer market and probably won\'t get it back. The interesting frontier is *interoperability bridges* and *sovereign-government deployments*, not the federated dream returning to displace WhatsApp.`
		}
	]
};
