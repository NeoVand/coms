import type { CategoryStory } from './types';

export const asyncIotStory: CategoryStory = {
	categoryId: 'async-iot',
	tagline: 'Billions of devices, talking without waiting — the quiet revolution',
	sections: [
		{
			type: 'narrative',
			title: 'Oil Pipelines in the Desert',
			text: `Somewhere in a remote oil field, a sensor measures pipeline pressure. The data needs to reach a monitoring station hundreds of miles away, over a satellite link that drops packets and costs per byte. It's 1999, and Andy Stanford-Clark at {{ibm|IBM}} has a problem: [[http1]] is too heavy, [[tcp]] connections are too chatty, and {{bandwidth|bandwidth}} is precious. Together with Arlen Nipper of Arcom, he designs a protocol so lightweight it can run on the most constrained devices imaginable. They call it [[mqtt|MQTT]] — a {{mqtt-publish|publish}}-{{mqtt-subscribe|subscribe}} protocol with a tiny 2-byte header overhead. A sensor publishes data to a {{topic|topic}}; any number of subscribers can listen. The broker handles all the routing. It was designed for a world that didn't exist yet — the Internet of Things.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/IBM_system_360.JPG/500px-IBM_system_360.JPG',
			alt: 'An IBM System/360 mainframe computer, representing the enterprise computing environment that drove message queuing development',
			caption:
				"Enterprise mainframes like the {{ibm|IBM}} System/360 drove the need for reliable message queuing — connecting business systems that couldn't afford to lose a single transaction.",
			credit: 'Photo: Waelder / CC BY-SA 2.5, via Wikimedia Commons'
		},
		{
			type: 'pioneers',
			title: 'The Messaging Pioneers',
			people: [
				{
					name: 'Andy Stanford-Clark',
					years: '1966–',
					title: 'Co-inventor of MQTT',
					org: 'IBM',
					contribution:
						'Co-created [[mqtt|MQTT]] with Arlen Nipper (then at Arcom) for IoT telemetry over unreliable networks. An {{ibm|IBM}} Distinguished Engineer, he helped open-source the protocol and shepherd it through OASIS standardization.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Andy_Stanford-Clark_%284995549809%29.jpg/330px-Andy_Stanford-Clark_%284995549809%29.jpg'
				},
				{
					name: 'Arlen Nipper',
					years: '',
					title: 'Co-inventor of MQTT',
					org: 'Arcom / Eurotech / Cirrus Link',
					contribution:
						"Brought embedded systems and SCADA expertise to [[mqtt|MQTT]]'s design. Co-founded Cirrus Link Solutions to commercialize [[mqtt|MQTT]] for industrial IoT."
				}
			]
		},
		{
			type: 'diagram',
			definition: `graph TD
  P1[Sensor A] -->|{{mqtt-publish|publish}}| B((Broker))
  P2[Sensor B] -->|{{mqtt-publish|publish}}| B
  P3[Sensor C] -->|{{mqtt-publish|publish}}| B
  B -->|{{mqtt-subscribe|subscribe}}| S1[Dashboard]
  B -->|{{mqtt-subscribe|subscribe}}| S2[Alert System]
  B -->|{{mqtt-subscribe|subscribe}}| S3[Database]`,
			caption:
				'The {{mqtt-publish|publish}}-{{mqtt-subscribe|subscribe}} pattern: publishers and subscribers are fully decoupled through a central broker.'
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1993,
					title: 'IBM MQ Series Released',
					description:
						"{{ibm|IBM}}'s commercial message queuing middleware establishes the enterprise messaging market. Reliable, but proprietary and expensive."
				},
				{
					year: 1999,
					title: 'MQTT Created',
					description:
						'Stanford-Clark and Nipper design [[mqtt|MQTT]] for oil pipeline telemetry over satellite links. Lightweight, {{mqtt-publish|publish}}-{{mqtt-subscribe|subscribe}}, minimal overhead.',
					protocolId: 'mqtt'
				},
				{
					year: 1999,
					title: 'Jabber (XMPP) Created',
					description:
						'Jeremie Miller creates an open instant messaging protocol. Jabber would become [[xmpp|XMPP]], powering {{google|Google}} Talk, Facebook Chat, and billions of messages.',
					protocolId: 'xmpp'
				},
				{
					year: 2003,
					title: 'AMQP Conceived at JPMorgan',
					description:
						"John O'Hara begins designing an open messaging protocol to break free of proprietary middleware vendor lock-in.",
					protocolId: 'amqp'
				},
				{
					year: 2006,
					title: 'AMQP 0-8 Published',
					description:
						'The first public [[amqp|AMQP]] specification. A wire-level protocol that any client can implement to talk to any broker.',
					protocolId: 'amqp'
				},
				{
					year: 2007,
					title: 'RabbitMQ Created',
					description:
						"Alexis Richardson's Rabbit Technologies builds the first major [[amqp|AMQP]] broker. It becomes the most popular open-source {{broker|message broker}}.",
					protocolId: 'amqp'
				}
			]
		},
		{
			type: 'narrative',
			title: "Wall Street's Messaging Problem",
			text: `While [[mqtt|MQTT]] was solving IoT telemetry and [[xmpp]] was revolutionizing instant messaging — powering Jabber, and later {{google|Google}} Talk and Facebook Chat — a different messaging crisis was unfolding on Wall Street. JPMorgan Chase was spending hundreds of millions on proprietary messaging middleware — TIBCO, {{ibm|IBM}} MQ, {{microsoft|Microsoft}} MSMQ — with no interoperability between them. John O'Hara saw the absurdity: why should the wire format be proprietary? In 2003, he began designing [[amqp]], the Advanced Message Queuing Protocol.\n\n[[amqp]] was ambitious: a complete wire-level protocol with exchanges, queues, bindings, and sophisticated routing. Unlike [[mqtt]], which was minimal by design, [[amqp|AMQP]] tried to be comprehensive. This made it powerful for enterprise messaging but complex to implement. The creation of RabbitMQ in 2007 gave [[amqp|AMQP]] its killer app — a robust, open-source broker that could handle millions of messages per second.\n\nFor developers who wanted something even simpler, [[stomp|STOMP]] emerged in 2009 — a text-based protocol so simple you could debug it with telnet. Where [[amqp|AMQP]] was the enterprise heavyweight and [[mqtt|MQTT]] the IoT specialist, [[stomp|STOMP]] was the developer-friendly option for web applications, often running over [[websockets]].`
		},
		{
			type: 'pioneers',
			title: 'The Enterprise Architects',
			people: [
				{
					name: "John O'Hara",
					years: '',
					title: 'Creator of AMQP',
					org: 'JPMorgan Chase',
					contribution:
						'Conceived [[amqp|AMQP]] to break vendor lock-in in financial messaging. Convinced major banks and tech companies to collaborate on an open standard.'
				},
				{
					name: 'Pieter Hintjens',
					years: '1962–2016',
					title: 'Messaging Visionary',
					org: 'iMatix',
					contribution:
						'Built the first open-source [[amqp|AMQP]] broker (OpenAMQ) at iMatix and later created ZeroMQ, a brokerless messaging library. A passionate open-source advocate, though he grew critical of [[amqp|AMQP]]\'s complexity and eventually left the workgroup.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Pieter_Hintjens_at_EuroPython2014_%28cropped%29.jpg/330px-Pieter_Hintjens_at_EuroPython2014_%28cropped%29.jpg'
				},
				{
					name: 'Alexis Richardson',
					years: '',
					title: 'RabbitMQ Co-founder',
					org: 'Rabbit Technologies / Pivotal',
					contribution:
						'Co-founded the company behind RabbitMQ, the most widely deployed [[amqp|AMQP]] broker. Later became CEO of Weaveworks, bringing messaging patterns to cloud-native.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Alexis_richardson.jpg/330px-Alexis_richardson.jpg'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2009,
					title: 'STOMP 1.0 Formalized',
					description:
						'The Simple Text Oriented Messaging Protocol provides a human-readable alternative to binary messaging protocols.',
					protocolId: 'stomp'
				},
				{
					year: 2010,
					title: 'MQTT Released as Royalty-Free',
					description:
						'{{ibm|IBM}} and Eurotech release [[mqtt|MQTT]] 3.1 as royalty-free, enabling widespread adoption beyond industrial use cases.',
					protocolId: 'mqtt'
				},
				{
					year: 2011,
					title: 'Apache Kafka Open-Sourced',
					description:
						'{{linkedin|LinkedIn}} open-sources its distributed event streaming platform. [[kafka|Kafka]] redefines messaging: an immutable, replayable log instead of transient queues.',
					protocolId: 'kafka'
				},
				{
					year: 2012,
					title: 'Eclipse Paho & Mosquitto',
					description:
						"The Eclipse Foundation adopts [[mqtt|MQTT]] client libraries and the Mosquitto broker, cementing [[mqtt|MQTT]]'s open-source ecosystem.",
					protocolId: 'mqtt'
				},
				{
					year: 2012,
					title: 'AMQP 1.0 Ratified by OASIS',
					description:
						'The [[amqp|AMQP]] standard matures, though the 1.0 wire format differs significantly from the 0-9-1 version used by RabbitMQ.',
					protocolId: 'amqp'
				},
				{
					year: 2014,
					title: 'CoAP Published — RFC 7252',
					description:
						"The Constrained Application Protocol brings [[rest|REST]]-like semantics to tiny devices that can't run {{http-method|HTTP}}.",
					protocolId: 'coap'
				},
				{
					year: 2019,
					title: 'MQTT v5.0 Released',
					description:
						'Major upgrade with shared subscriptions, message expiry, reason codes, and {{topic|topic}} aliases. [[mqtt|MQTT]] grows up.',
					protocolId: 'mqtt'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The IoT Explosion',
			text: `The Internet of Things turned [[mqtt|MQTT]] from a niche protocol into a global standard. Smart homes, industrial sensors, connected cars, agricultural monitors — billions of devices needed to send small messages reliably over constrained networks. [[mqtt]] was built for exactly this.\n\nBut some devices are even more constrained — 8-bit microcontrollers with kilobytes of {{ram|RAM}}, running on coin-cell batteries. For these, even [[mqtt]] over [[tcp]] was too heavy. [[coap|CoAP]] was designed as the {{http-method|HTTP}} of the constrained world: it uses [[udp]] instead of [[tcp|TCP]], supports GET/PUT/POST/DELETE like [[rest|REST]], but with a compact binary format. A [[coap|CoAP]] message can be as small as 4 bytes. It even supports {{coap-observe|observe}} — a lightweight subscription mechanism — and can be proxied to {{http-method|HTTP}}, bridging the constrained and web worlds.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Raspberry_Pi_3_Model_B.JPG/500px-Raspberry_Pi_3_Model_B.JPG',
			alt: 'A Raspberry Pi 3 Model B single-board computer, one of the devices powering the IoT revolution',
			caption:
				'Devices like the Raspberry Pi brought [[mqtt|MQTT]] from oil pipelines to maker workshops — running Mosquitto brokers on $35 hardware and connecting billions of IoT sensors.',
			credit: 'Photo: Jose.gil / CC BY-SA 4.0, via Wikimedia Commons'
		},
		{
			type: 'narrative',
			title: 'The Event Streaming Revolution',
			text: `Traditional message brokers like [[amqp]] and [[mqtt]] treat messages as transient: once consumed, they're gone. [[kafka]] inverted this model entirely. Created at {{linkedin|LinkedIn}} in 2011 by Jay Kreps, Neha Narkhede, and Jun Rao, [[kafka|Kafka]] treats messages as an immutable, ordered log that consumers can replay at will. A consumer can read from the beginning, skip ahead, or maintain multiple read positions independently.\n\nThis seemingly simple change unlocked an entirely new architecture: event sourcing. Instead of storing current state in a database and publishing notifications as a side effect, systems could treat the event stream itself as the source of truth. [[kafka]] now processes trillions of messages per day across companies like Netflix, Uber, and Airbnb — forming the backbone of modern data infrastructure.`
		},
		{
			type: 'diagram',
			definition: `graph TD
  subgraph [[kafka|Kafka]]["[[kafka|Kafka]] Log"]
    K1[Producer] --> K2[Append-Only Log]
    K2 -->|"{{offset|offset}} 0"| K3[Consumer A]
    K2 -->|"{{offset|offset}} 42"| K4[Consumer B]
    K2 -->|"replay"| K5[Consumer C]
  end
  subgraph Traditional["Traditional Queue"]
    TQ1[Producer] --> TQ2[Queue]
    TQ2 -->|"consumed → deleted"| TQ3[Consumer]
  end
  [[kafka|Kafka]] ~~~ Traditional`,
			caption:
				"Traditional queues delete messages after consumption. [[kafka|Kafka]]'s immutable log lets multiple consumers read independently and replay at will."
		},
		{
			type: 'pioneers',
			title: 'The Constrained Network Experts',
			people: [
				{
					name: 'Zach Shelby',
					years: '',
					title: 'CoAP Editor',
					org: 'Sensinode / ARM',
					contribution:
						'Primary editor of the [[coap|CoAP]] specification ([[rfc:7252|RFC 7252]]) and co-founder of the {{ietf|IETF}} CoRE Working Group, bridging web standards and IoT.'
				},
				{
					name: 'Carsten Bormann',
					years: '',
					title: 'CoAP Co-editor',
					org: 'Universitat Bremen',
					contribution:
						'Co-edited the [[coap|CoAP]] specification and co-created CBOR, the efficient binary {{serialization|serialization}} format used throughout the IoT ecosystem.'
				},
				{
					name: 'Roger Light',
					years: '',
					title: 'Creator of Mosquitto',
					org: 'Eclipse Foundation / Cedalo',
					contribution:
						'Created Mosquitto, the most widely deployed open-source [[mqtt|MQTT]] broker — running on everything from Raspberry Pis to production servers.'
				}
			]
		},
		{
			type: 'callout',
			title: 'The Pub/Sub Pattern',
			text: "The {{mqtt-publish|publish}}-{{mqtt-subscribe|subscribe}} pattern — where senders don't know their receivers and receivers don't know their senders — dates back to academic research in the 1980s. It journeyed from Wall Street trading floors (TIBCO) to IoT sensors ([[mqtt|MQTT]]) to cloud-native microservices ([[amqp]], NATS, [[kafka]]). Today, it's one of the most important patterns in distributed systems, decoupling producers and consumers at global scale."
		}
	]
};
