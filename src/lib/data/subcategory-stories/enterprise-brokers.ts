import type { SubcategoryStory } from './types';

export const enterpriseBrokersStory: SubcategoryStory = {
	subcategoryId: 'enterprise-brokers',
	tagline:
		'Decoupling producers from consumers at scale — queues, immutable logs, and the wire formats that talk to them',
	sections: [
		{
			type: 'narrative',
			title: 'Two Philosophies, One Family',
			text: `In 1992, IBM shipped MQSeries — software that let one program send a message to another *without either knowing about the other*. The producer wrote to a queue; the consumer read from it; the broker in the middle handled persistence, ordering, and failure. This idea — **message-oriented middleware** — was strange to most programmers in an era when "calling a function" still meant calling a function on the same machine. By 2005 it was running global banks, airlines, and stock exchanges.\n\nEnterprise messaging splits into two philosophies:\n\n- **Queues** — a message goes in, one consumer takes it out, it's gone. This is the MQSeries model, standardized as **[[amqp|AMQP]]** ([[rfc:0|0-9-1 in 2008, 1.0 in 2011]]). RabbitMQ is the dominant open-source implementation. The mental model: a worker pool draining a backlog.\n- **Logs** — a message goes in, *every* consumer can read it, at any offset, forever (or until retention expires). This is the **[[kafka|Kafka]]** model, born at LinkedIn in 2011 and now ubiquitous. The mental model: an append-only stream of events that anyone can replay.\n\nBoth ship at planetary scale; both have decades of stories about teams that picked the wrong one and rebuilt. Queues are great when each message must be processed exactly once and order between consumers doesn't matter. Logs are great when many independent systems need to react to the same stream of events at their own pace.\n\nA third member of the family, **[[stomp|STOMP]]**, isn't a broker — it's a *wire format* for talking to brokers. Simple Text-Oriented Messaging Protocol: human-readable frames over TCP. ActiveMQ, RabbitMQ, and HornetQ all speak STOMP. It's the lingua franca for clients (especially browsers via WebSocket) that don't want to ship a full AMQP or Kafka library.`
		},
		{
			type: 'pioneers',
			title: 'The Broker Architects',
			people: [
				{
					name: "John A. O'Hara",
					years: '–',
					title: 'AMQP Originator',
					org: 'JPMorgan Chase',
					contribution:
						"Conceived [[amqp|AMQP]] inside JPMorgan in 2003 — the bank needed a message broker but the existing commercial options (IBM MQSeries, TIBCO Rendezvous) had per-server licensing that didn\\'t scale to the bank\\'s workload. The original proposal: an open, royalty-free, interoperable messaging protocol that multiple vendors could implement. AMQP 0-9-1 (2008) became the basis for RabbitMQ; AMQP 1.0 (2011) was the standards-body-blessed wire protocol, accepted as ISO/IEC 19464 in 2014."
				},
				{
					name: 'Jay Kreps',
					years: '–',
					title: 'Co-creator of Kafka',
					org: 'LinkedIn / Confluent',
					contribution:
						'Co-created [[kafka|Apache Kafka]] at LinkedIn in 2011 with Neha Narkhede and Jun Rao. LinkedIn had outgrown ActiveMQ and Splunk for event ingestion; Kafka was their bet on a *log-as-primitive* approach instead of a queue-as-primitive. The 2013 paper "The Log: What every software engineer should know about real-time data\\\'s unifying abstraction" is required reading. Kreps later co-founded Confluent (2014), now the dominant commercial Kafka company.'
				},
				{
					name: 'Brian McCallister',
					years: '–',
					title: 'STOMP Co-author',
					org: 'Independent / Groovy.io',
					contribution:
						"Co-authored [[stomp|STOMP]] in 2005 with Hiram Chirino as a deliberately minimal text protocol for talking to message brokers. The goal: any language that can speak TCP can speak STOMP in a few lines. ActiveMQ, RabbitMQ, HornetQ, and OpenMQ all added STOMP support. The protocol\\'s lasting niche is *browser → broker* via WebSocket — there\\'s no real competitor for that use case."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1992,
					title: 'IBM MQSeries Ships',
					description:
						'The first commercially significant message broker. Defines the queue model that AMQP later standardizes. Runs banks and airlines for the next 30 years; still alive as IBM MQ.'
				},
				{
					year: 2001,
					title: 'JMS 1.0 (Java Message Service)',
					description:
						'Sun ships JMS — a Java API for messaging, not a wire protocol. Every Java app can talk to any broker that implements JMS. Powerful but Java-only.'
				},
				{
					year: 2003,
					title: 'AMQP Conceived at JPMorgan',
					description:
						"John O'Hara starts [[amqp|AMQP]] as a vendor-neutral, wire-level protocol — the thing JMS isn't. Cisco, Red Hat, RabbitMQ Technologies, and others join the AMQP Working Group."
				},
				{
					year: 2005,
					title: 'STOMP Designed',
					description:
						'Brian McCallister and Hiram Chirino design [[stomp|STOMP]] — Simple Text-Oriented Messaging Protocol. Five frame types, human-readable, no specific broker required.'
				},
				{
					year: 2007,
					title: 'RabbitMQ 1.0',
					description:
						'Rabbit Technologies ships RabbitMQ — an Erlang implementation of AMQP. The Erlang foundation (built for telecom switches) makes it remarkably resilient under failure.'
				},
				{
					year: 2008,
					title: 'AMQP 0-9-1',
					description:
						'The version of [[amqp|AMQP]] that actually got adopted. Exchanges, queues, bindings, consumer ack — all the abstractions RabbitMQ-shaped messaging is built on.'
				},
				{
					year: 2011,
					title: 'Kafka Open-Sourced at Apache',
					description:
						'LinkedIn donates [[kafka|Kafka]] to the Apache Software Foundation. The log model — partitioned, replicated, consumer-group-based — is a different conception of messaging than queues.'
				},
				{
					year: 2011,
					title: 'AMQP 1.0',
					description:
						'AMQP 1.0 finalized — wire-format-only, dropped the exchange/queue model from 0-9-1. RabbitMQ supports it via a plugin but keeps 0-9-1 as the default. The split between 0-9-1 and 1.0 has fragmented the AMQP ecosystem ever since.'
				},
				{
					year: 2014,
					title: 'AMQP 1.0 Becomes ISO Standard',
					description:
						'AMQP 1.0 published as ISO/IEC 19464. The standards-body imprimatur matters in regulated industries (banking, insurance) where ISO compliance is a procurement requirement.'
				},
				{
					year: 2017,
					title: 'Kafka Streams + ksqlDB',
					description:
						'Kafka grows beyond pure transport into stream processing. Kafka Streams (a Java library) and ksqlDB (a SQL-ish layer) let you do joins, aggregations, and windowing directly against the log.'
				},
				{
					year: 2021,
					title: 'Kafka Removes ZooKeeper Dependency',
					description:
						'KIP-500 — Kafka raft-based metadata (KRaft) — eliminates the long-standing ZooKeeper dependency. Operationally simpler; a smaller blast radius when something goes wrong.'
				},
				{
					year: 2024,
					title: 'Kafka 4.0 — ZooKeeper Gone for Good',
					description:
						"KRaft becomes the only mode in Kafka 4.0. ZooKeeper, after 13 years as Kafka's coordination backbone, is removed."
				}
			]
		},
		{
			type: 'comparison',
			title: 'AMQP vs Kafka vs STOMP',
			axes: ['Model', 'Persistence', 'Consumer pattern', 'Wire format', 'Best for'],
			rows: [
				{
					label: '[[amqp|AMQP]] (RabbitMQ)',
					values: [
						'Queue — message consumed once',
						'Until ack from consumer',
						'Competing consumers drain a queue',
						'Binary frames over TCP',
						'Work distribution, RPC patterns, request/response over queues'
					]
				},
				{
					label: '[[kafka|Kafka]]',
					values: [
						'Log — partitioned, append-only',
						'Configurable retention (hours to forever)',
						'Consumer groups read at their own offset',
						'Custom binary over TCP (Kafka protocol)',
						'Event sourcing, stream processing, replay, audit logs'
					]
				},
				{
					label: '[[stomp|STOMP]]',
					values: [
						'Wire format only — broker-agnostic',
						"Broker's problem",
						'Whatever the broker supports',
						'Text frames over TCP or WebSocket',
						'Browser ↔ broker; scripts and tools without language-specific libs'
					]
				}
			],
			note: 'If you find yourself trying to make Kafka behave like a queue (or AMQP behave like a log), you almost certainly picked the wrong tool. The mental models are genuinely different.'
		},
		{
			type: 'animated-sequence',
			title: 'Queue vs Log',
			definition: `sequenceDiagram
    participant P as Producer
    participant Q as AMQP Queue
    participant W1 as Worker 1
    participant W2 as Worker 2
    participant K as Kafka Topic
    participant C1 as Consumer Group A
    participant C2 as Consumer Group B
    Note over P,W2: AMQP — competing consumers drain a queue
    P->>Q: msg A
    P->>Q: msg B
    P->>Q: msg C
    Q->>W1: msg A
    W1-->>Q: ack
    Q->>W2: msg B
    W2-->>Q: ack
    Q->>W1: msg C
    W1-->>Q: ack
    Note over Q: queue empty
    Note over P,C2: Kafka — consumer groups read at their own offsets
    P->>K: offset 0, msg A
    P->>K: offset 1, msg B
    P->>K: offset 2, msg C
    K-->>C1: A, B, C delivered to group A
    K-->>C2: A delivered to group B
    K-->>C2: B
    K-->>C2: C
    Note over K: messages remain — both groups read independently`,
			caption:
				'In [[amqp|AMQP]], a message belongs to whoever consumes it first; the queue empties. In [[kafka|Kafka]], the messages stay; each consumer group has its own read offset. This is why "replay the last hour of events" is trivial with Kafka and nearly impossible with AMQP.',
			steps: {
				0: '**AMQP — competing consumers.** The queue is the source of truth. Multiple workers pull from the same queue; each message goes to exactly one of them.',
				1: 'Producer publishes **msg A** to the queue.',
				2: 'Producer publishes **msg B** to the queue.',
				3: 'Producer publishes **msg C** to the queue.',
				4: 'Queue delivers **msg A to Worker 1** — whichever worker is ready first gets the next message.',
				5: 'Worker 1 **acks**. The queue removes msg A permanently. If Worker 1 had crashed before acking, the queue would have redelivered msg A.',
				6: 'Queue delivers **msg B to Worker 2** — the next ready consumer (could have been W1 again; depends on prefetch and load).',
				7: 'Worker 2 acks. Msg B is gone forever.',
				8: 'Queue delivers **msg C to Worker 1** again.',
				9: 'Worker 1 acks. Msg C is gone.',
				10: '**Queue empty.** Each message was consumed exactly once. To replay anything, you would need to re-publish.',
				11: '**Kafka — consumer groups.** Same three messages, but the topic *retains* them. Two independent consumer groups will each read all three at their own pace.',
				12: 'Producer writes **msg A at offset 0**. The log is append-only; offsets are stable.',
				13: 'Producer writes **msg B at offset 1**.',
				14: 'Producer writes **msg C at offset 2**.',
				15: '**Consumer Group A** reads from offset 0 and gets A, B, C in order. Its read offset advances to 3.',
				16: '**Consumer Group B** starts at offset 0 too, but reads at its own pace. It gets msg A first.',
				17: 'Group B reads msg B.',
				18: 'Group B reads msg C. Both groups have now seen all three messages.',
				19: '**Messages remain in the log** for the configured retention (hours, days, or forever). A new consumer group can start at offset 0 tomorrow and replay history. This is what makes "event sourcing" practical with Kafka and impractical with AMQP.'
			}
		},
		{
			type: 'callout',
			title: 'The Confluent Argument: "The Log Is the Database"',
			text: `**Jay Kreps**'s 2013 essay "The Log: What every software engineer should know about real-time data's unifying abstraction" reframed [[kafka|Kafka]] from "a message broker" to "the source of truth for your data."\n\nThe argument: every stateful system in your stack is, in some sense, a *materialized view* over an event log. Your database is rows derived from a sequence of inserts/updates/deletes. Your search index is documents derived from upstream changes. Your cache is a recent snapshot. If you make the log itself the primary source — and treat all derived state as downstream views over it — then:\n\n- Adding a new system means subscribing to the log and replaying history\n- Recovery means resetting the offset and re-deriving state\n- Auditing is free — every state change is in the log\n- Pipelines become declarative — "this view is a transformation of these topics"\n\nThis is the architectural pattern called **event sourcing**, and Kafka was the first widely-deployed system that made it operationally feasible at scale. Whether you buy the full argument or not, the *mental model* is now standard across distributed-systems design. The log-as-primitive view is one of the deepest contributions of the Kafka era.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[amqp|AMQP]]/RabbitMQ's failure mode is **the unbounded queue**. A consumer falls behind; the queue grows; memory fills; the broker dies. RabbitMQ has rate-limiting, max-length policies, and dead-letter exchanges to mitigate this, but every team running RabbitMQ in anger has a story about a queue that ate the broker. The discipline: always set max-length, always have a dead-letter exchange, always alert on queue depth.\n\n[[kafka|Kafka]]'s failure mode is **operations**. Running Kafka well requires real distributed-systems expertise: partition planning, broker sizing, consumer-group rebalancing, log retention, offset management, replication lag, ZooKeeper (pre-KRaft) coordination. Kafka-as-a-service (Confluent Cloud, AWS MSK, Aiven, Redpanda Cloud) exists precisely because most companies should *not* operate Kafka themselves. Even with managed Kafka, the consumer side is hard: a consumer group rebalance under load can stall processing for minutes.\n\n[[stomp|STOMP]]'s failure mode is **its simplicity**. There's no built-in flow control, no native end-to-end ack semantics, no message-acknowledgment timeouts. Brokers add their own — and they all add slightly different ones. A STOMP client that works with ActiveMQ may not work identically with RabbitMQ. The protocol is the floor; everything above the floor is broker-specific.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **Tiered storage in Kafka** — cold data offloaded to S3/GCS while hot data stays on local disk. Cuts broker storage costs by ~10×. KIP-405 shipped; AWS MSK and Confluent Cloud offer it.\n- **Iceberg + Kafka convergence** — Confluent's Tableflow and Redpanda's direct Iceberg writes make every Kafka topic queryable as an Iceberg table. The log-as-database vision is finally operationally trivial.\n- **WarpStream and "stateless brokers"** — broker designs that store every partition directly in S3 instead of replicating on local disk. Trade a bit of latency for dramatically lower operational complexity and cost. Acquired by Confluent in 2024.\n- **RabbitMQ 4.0** ships proper quorum queues by default and finally removes mirrored queues. The eternal RabbitMQ operational pain point is being addressed.\n- **NATS** continues quietly winning niches where Kafka is overkill but AMQP is too heavy — embedded systems, edge networks, in-cluster service eventing.\n- **The unsexy truth**: most teams should pick a managed broker (Confluent Cloud, AWS MSK, RabbitMQ Cloud, Upstash Kafka, etc.) and never operate one themselves. Running a broker is operationally distinct from using one.`
		}
	]
};
