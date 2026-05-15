---
id: xmpp
type: protocol
name: Extensible Messaging and Presence Protocol
abbreviation: XMPP
etymology: "[E]xtensible [M]essaging and [P]resence [P]rotocol"
category: async-iot
year: 1999
rfc: RFC 6120
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/ai-protocols
  - story-of-the-internet/the-ai-agent-layer
related_protocols: [tcp, tls, websockets]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [6120, 6121, 7622, 7395, 8446, 9293, 6455, 7247]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/JabberNetwork.svg/500px-JabberNetwork.svg.png
    caption: XMPP federation in one diagram. Anyone runs a server. Servers talk to each other on port 5269 the same way email servers do, so a user on one domain can message a user on any other.
    credit: Image — Wikimedia Commons / CC BY-SA 3.0
visual_cues:
  - "An XMPP stream as a long opening tag. The browser-style angle brackets at the top, then a vertical column of message, presence, and iq stanzas flowing down for hours, with a tiny closing tag at the very bottom labelled 'days later'."
  - "A side-by-side wire comparison: a 180-byte XMPP message stanza on the left, a 20-byte FunXMPP binary frame on the right, both labelled 'hello'. Caption: 'WhatsApp on a $20 phone in rural Brazil.'"
  - "The XMPP federation graph as a constellation of named servers — jabber.org, snikket.chat, conversations.im, xmpp.cloud — with dashed s2s links on port 5269 between every pair, and one greyed-out 'talk.google.com' node with a 2017 tombstone."
  - "The Nintendo Switch ejabberd architecture: ten million phones in an outer ring, each holding one TCP connection to an 'outer' Erlang node; outer nodes feeding a smaller cluster of CPU-heavy 'inner' nodes that ingest two billion notifications per day."
  - "A three-track timeline of XMPP's commercial rollercoaster: 1999 Slashdot post, 2005 Google Talk launch, 2008 Cisco buys Jabber Inc., 2013 Hangouts drops federation, 2017 Talk fully retired, 2024 EU DMA forces WhatsApp interop, 2026 first third-party clients announced."
  - "The Openfire CVE-2023-32315 attack as a cartoon: a normal '..' bouncing off a filter, then '%2e%2e' bouncing off, then '%u002e%u002e' walking straight through into /setup-s/, with a label 'eight years undetected, fifty percent of public servers exploited within months.'"
---

# XMPP — Extensible Messaging and Presence Protocol

## In one breath

XMPP is XML streaming over a long-lived TCP connection, with federated server-to-server routing and a vocabulary of three stanza types — message, presence, and iq. It was born as Jabber in 1999 to break the AOL-MSN-Yahoo-ICQ walled gardens, and twenty-seven years later it still routes more chat traffic than anything except SMS — over a hundred billion messages a day on WhatsApp's forked ejabberd, ten million simultaneous connections on Nintendo's Switch push service, every Jitsi Meet call, and every Cisco Jabber deployment that has not yet been migrated to Webex.

## The pitch

On the 4th of January 1999, a 23-year-old in Iowa called Jeremie Miller posted a one-line Slashdot story about an open replacement for AOL Instant Messenger. The protocol that grew out of that post — XMPP — is now the messaging plane underneath WhatsApp, Nintendo Switch, Jitsi Meet, Zoom Chat, EA's Origin, and the PlayStation network. Google built Talk on it in 2005 and killed federation with it in 2013. The European Union's Digital Markets Act dragged it back into commercial relevance in 2024. This episode is about how the protocol actually works on the wire in 2026, where it runs in production, what breaks, and which corner of the messaging-interop war it might still win.

## How it actually works

An XMPP session is two open `<stream>` tags facing each other across a TCP connection — one client to server, the inverse from server to client — that stay open for as long as the user is online. Inside those streams flow XML fragments called stanzas, each addressed with a JID like `juliet@im.example.com/balcony`. The simulator on this protocol's page walks you through a basic c2s session in five steps: open the stream, get the server's `<stream:features>` back, do SASL authentication, bind a resource so the server knows which device on this account to deliver to, and then send your first `<message>`. When the recipient lives on a different domain, the originating server opens its own stream to the destination server on port 5269 and forwards the stanza there. Email's federation model, with XML and presence on top.

### Header at a glance

XMPP has no fixed binary header. Its "header" is the opening of the stream and the attributes on each stanza. The fields a host actually needs to read aloud:

- **`<stream:stream>`** — the opening tag of the long-lived XML document. Carries `from`, `to`, `version='1.0'`, `xml:lang`, and the `jabber:client` or `jabber:server` namespace plus the streams namespace `http://etherx.jabber.org/streams`. The closing `</stream:stream>` is what shuts the session down.
- **`<stream:features>`** — server-advertised capabilities returned right after the open. Lists STARTTLS availability, SASL mechanisms (typically SCRAM-SHA-256 and SCRAM-SHA-256-PLUS), resource bind, Stream Management, Client State Indication, and increasingly SASL2/Bind 2.
- **JID** — the address. `localpart@domainpart/resourcepart`. Domain-only is legal. The resource lets one account have a phone, a laptop, and a tablet logged in at the same time. RFC 7622 from 2015 defines the modern PRECIS-based handling for non-ASCII parts.
- **Stanza attributes** — `from`, `to`, `id`, `type`, `xml:lang` on every `<message>`, `<presence>`, and `<iq>`. The server stamps `from` itself and rejects forgeries; this is RFC 6120 section 10.
- **Default ports** — 5222 for client-to-server with STARTTLS, 5223 for direct TLS via XEP-0368, 5269 for server-to-server, 5280 and 5281 conventionally for BOSH and WebSocket HTTP endpoints.

### State machine in three sentences

A connection walks through SRV discovery, TCP open, optional implicit TLS, stream open, STARTTLS, SASL authentication, resource binding, optional Stream Management enable, then unbounded stanza flow until either side sends `</stream:stream>` and closes the TCP socket. Stream Management (XEP-0198) overlays delivery acknowledgements on top of the inherently lossy "send and pray" XML stream so a TCP drop on a flaky LTE handover does not lose stanzas — the client `<resume/>`s with the last acknowledged sequence number `h` it remembers. SASL2, Bind 2, and FAST tokens (XEP-0388, XEP-0386, XEP-0484) collapse all of that handshake into a single round trip in modern servers like ejabberd 24.12 and Prosody 13.

### Reliability, security, and federation mechanics

RFC 6120 makes TLS support mandatory; STARTTLS is the default upgrade path on port 5222 and XEP-0368 added implicit-TLS on 5223 for places where in-band negotiation is awkward. SASL authentication usually means SCRAM-SHA-256, sometimes SCRAM-SHA-256-PLUS for channel binding, occasionally EXTERNAL when a client certificate is present, and PLAIN-over-TLS as the fallback. End-to-end encryption between users is a separate layer called OMEMO (XEP-0384), which ports Signal's X3DH and Double Ratchet onto XMPP and uses the Personal Eventing Protocol to distribute prekey bundles. OMEMO 0.9.0, released on the 7th of April 2025, switched to its own wire format called the OMEMO Double Ratchet so implementations can drop the GPL-licensed libsignal dependency.

Server-to-server federation runs on TCP/5269 with two streams per peer pair by default — a legacy of the original 2000 Jabber wire protocol that the Bidi extension XEP-0288 collapses to one. Authentication between servers is either SASL EXTERNAL with PKIX certificates (the modern strong path) or Server Dialback (XEP-0220), a third-party DNS-based callback that verifies the originating domain's authority over the from-address. RFC 6120 explicitly notes dialback's continued necessity, and most public networks still run both.

The three stanza kinds split work cleanly. `<message>` is fire-and-forget delivery — chat, groupchat, normal, headline, error. `<presence>` is broadcast availability with a roster subscription model defined in RFC 6121. `<iq>` is request-response correlated by stanza-level `id`, with `type` of `get`, `set`, `result`, or `error` — the only stanza kind for which the server guarantees a reply.

## Where it shows up in production

**WhatsApp** built its messaging plane on a heavily forked ejabberd speaking a binary, dictionary-compressed dialect called FunXMPP. The name was disclosed in Meta's 2019 NSO Group lawsuit filing. Over a hundred billion messages a day route through this stack on Erlang/OTP and Mnesia. WhatsApp's 2024 DMA architecture diagrams still label the protocol "based on XMPP", and Meta's 6 March 2024 engineering post on third-party messaging interoperability is built around an XMPP-derived API.

**Nintendo's Switch Push Notification Service**, NPNS, runs on ejabberd: roughly ten million simultaneous TCP connections, around two billion notifications a day, between 100,000 and 200,000 connections per node, about 600 messages per second. ProcessOne and Nintendo presented the architecture at ElixirFest in 2019. The cluster splits into "inner" CPU-bound message-ingestion nodes and "outer" memory-bound nodes that just hold the device sessions. The whole thing was built in six months.

**Jitsi Meet** is the canonical example of XMPP as a control plane for WebRTC media. Prosody runs the multi-user chat rooms, Jicofo brokers Jingle (XEP-0166) sessions out to one or more Jitsi Videobridges using COLIBRI v2, and the actual audio and video flow over RTP. Every Jitsi room you join is, underneath, an XMPP room.

**Zoom Chat**, **EA Origin**, **PlayStation messaging**, and historically **Xfire** and **Raptr** all use XMPP variants. **Cisco Jabber** the brand was end-of-sale across versions 12.1 through 12.9 between 2022 and the January 2026 announcement; legacy Webex meeting API support ends 31 July 2026, and customers are pushed to Webex App.

**Snikket** is the modern "instant-on XMPP-as-a-product" project led by Matthew Wild, the author of Prosody. Prosody plus opinionated modules, paired with the Conversations Android client and a Siskin-derived iOS client. November and December 2025 releases shipped a new SDK called Borogove and updated push-notification APIs.

**Conversations** by Daniel Gultsch is the de facto reference modern XMPP client on Android; versions 2.19.5 through 2.19.7 shipped through autumn 2025 with TLS 1.3 enforcement and OMEMO improvements.

**The four servers that matter in 2026.** ejabberd 25.10 and 26.02 from ProcessOne — Erlang, single binary that speaks XMPP plus MQTT plus SIP plus a Matrix gateway, tested at two million concurrent sessions on a single node. Prosody 13.0.3 and 13.0.4 — Lua, lightweight, runs roughly half of public XMPP servers per Snikket's count. Openfire 5.0.3 from December 2025 and 5.0.4 from March 2026 — Java, Ignite Realtime. Tigase XMPP Server — Java, used by xmpp.cloud and Siskin's iOS infrastructure, the first commercial server to ship MIX. MongooseIM 6.5.0 — Erlang Solutions' enterprise fork.

## Things that go wrong

**Google Hangouts cuts s2s federation, 15 May 2013.** Announced at Google I/O. The EFF called it "a clear step backward". Federation peering with Google ended for the public XMPP network, and the most consequential single event in XMPP's commercial history was, depending on who you ask, either the moment open messaging died or the moment open messaging was finally allowed to grow up without Google's gravity bending it. The full c2s shutdown followed on 26 June 2017. Google Talk went dark; the widget converted to Hangouts. The story of why Google walked away from open standards is the kind of thing the chapter on the AI Agent Layer touches when it explains why nothing genuinely new happened at the application layer between WebSockets and MCP.

**Facebook Chat XMPP gateway shutdown, April 2014.** The v2 Graph API removed XMPP support and third-party Pidgin and Adium plug-ins broke overnight. Combined with Hangouts the previous year, this is the moment when XMPP retreated from public-network IM into infrastructure work — IoT, gaming, enterprise chat, the unglamorous billion-message-a-day plumbing where it still wins.

**Openfire CVE-2023-32315.** A path-traversal in Openfire's admin console, disclosed May 2023, affecting every release from 3.10.0 in 2015 onward — eight years of production deployments. The original 2015 filter handled `..` and `%2e%2e`. It did not handle `%u002e%u002e`, a non-standard UTF-16 URL encoding the embedded webserver did not understand at the time. Years later the team upgraded the embedded Jetty. The new Jetty did understand `%u002e%u002e`. Nobody updated the filter. An attacker could slip past the path-traversal filter to reach an unauthenticated `setup-s/...` endpoint, create an admin account, upload a plug-in with a Java payload, and get RCE. CVSS 7.5. Patched in 4.6.8, 4.7.5, and 4.8.0. The lesson — sanitisation filters and the parsers below them must be versioned together — is one of the cleanest case studies of "the bug was the diff between two libraries you weren't watching at the same time" anyone has produced this decade. VulnCheck found about half of internet-facing Openfire instances still vulnerable months after disclosure, and the Kinsing crypto-miner gang used it as an entry vector through late 2023.

**Openfire CVE-2024-25420 and CVE-2024-25421.** Hack The Box found that deleted-then-recreated usernames inherited admin rights or MUC affiliations because state was keyed on the username string, not on a stable account ID. Both fixed in subsequent 5.x releases.

**Openfire SASL EXTERNAL CN-injection, 2025.** Openfire's `X509Certificate.getSubjectDN().getName()` regex did not honour ASN.1 escaping. A malicious certificate with `OU="CN=admin,"` would match the CN regex and let the holder impersonate `admin`. Fixed in Openfire 5.0.2 and 5.1.0.

**Prosody CVE-2018-10847.** A virtual-host confusion in `mod_c2s` allowed a client to switch streams to a different host across XML restarts. Fixed in 0.9.14 and 0.10.2.

**Prosody CVE-2021-37601.** MUC affiliation list disclosure. Patched in 0.11.10 in August 2021.

**Debian Trixie plus ejabberd EKU regression, early 2026.** A Debian-shipped ejabberd 24.12 enforced TLS extended-key-usage strictly enough to break s2s with peers using single-purpose certificates. iOS push delivery for Monal users broke in the field. ejabberd 25.08 introduced a tolerant validator; the workaround on the older version is to enable `mod_s2s_dialback` or upgrade.

**fast-xml-parser CVE-2024-41818 and CVE-2023-34104.** Not an XMPP server bug, but `fast-xml-parser` is widely used by Node and JavaScript XMPP clients. ReDoS in `currency.js` versions 4.3.5 to 4.4.0 and DOCTYPE entity-regex injection produce denial of service via crafted stanzas if you have not patched.

**Classic XML expansion bombs.** Both ejabberd up to 2.1.6 and Prosody up to 0.8.0 had the recursive entity expansion bug analogous to CVE-2003-1564. The textbook reminder: the soft underbelly of XMPP is not XMPP, it is the XML parser underneath.

## Common pitfalls (for the practitioner)

- **No Stream Management on mobile.** Without XEP-0198, every flaky LTE handover loses an unknown number of stanzas. Symptom: users complain that messages "sometimes don't arrive". Fix: enable `<sm>` on the server and `<enable resume='true'/>` on the client, and keep `resume-timeout` at five minutes or more.
- **Default `<r/>` ack cadence per stanza.** Wastes bandwidth on cellular. Request acks every 5 to 10 stanzas or at idle, not after every send.
- **Carbons enabled after MAM query.** Enable Message Carbons (XEP-0280) before querying the Message Archive Manager (XEP-0313), then deduplicate by stanza-id. Get this order wrong and you end up with phantom unread counts on a second device.
- **CSI off in the background.** A backgrounded UI without Client State Indication (XEP-0352) is the difference between a one-day-on-charger client and a four-hour client. The server has to know the UI is asleep so it can drop presence and typing churn.
- **Push gateway colocated with chat.** XEP-0357 push uses two-tier indirection through a dedicated app-server PubSub. Keep your push gateway on a different machine from your main user server, or a push storm during a notification spike takes the chat plane down with it.
- **PEP not enabled.** OMEMO needs the Personal Eventing Protocol to publish prekey bundles. If PEP is off or quotas are too tight, OMEMO sessions silently fail to establish and clients fall back to plaintext.
- **mod_compression on untrusted input.** History of xmppbomb attacks. If you accept compressed streams from arbitrary peers, you have signed up for a decompression-bomb arms race.
- **In-band registration with no rate limit.** Every public server that has tried this without throttling has become a spam launching pad within weeks.
- **Self-signed certs on s2s.** They will fail SASL EXTERNAL on every well-behaved peer. Use Let's Encrypt or a real CA, and make sure the cert covers both the domain and any `_xmpp-server` SRV target.

## Debugging it

- **Wireshark.** The display filter is `xmpp` (Wireshark has had a dissector since the mid-2000s). After STARTTLS you need SSL key logging — set `SSLKEYLOGFILE` for browser-based clients or use the server's debug TLS dump for a native client. Once decrypted, every stanza shows up as readable XML.
- **`dig _xmpp-client._tcp.<domain> SRV +short`** to verify SRV discovery, and `dig _xmpps-client._tcp.<domain> SRV +short` for direct-TLS records (XEP-0368). XEP-0156 also lets clients discover BOSH and WebSocket endpoints via host-meta.
- **`nmap -sV -p 5222 chat.example.com`** for a quick reachability and version check; add `-p 5269` for the s2s port.
- **`prosodyctl shell`** drops you into a Lua REPL inside a running Prosody server. **`ejabberdctl debug`** opens an Erlang remote shell into a running ejabberd node — Nintendo's NPNS team used exactly this to track down a 30-minute session-cleanup penalty.
- **Raw XML console.** Gajim, Conversations, and most modern clients expose a developer view that prints every stanza in and out. This is the fastest way to confirm what the server is actually advertising in `<stream:features>`.
- **`tcpdump -A 'port 5222'`** for the pre-TLS handshake. Useless after STARTTLS unless you have a key log.
- **`sendxmpp`** for one-shot bot messages from a shell script: `echo "Hello Bob!" | sendxmpp -t bob@example.com`. **`profanity -a alice@example.com`** for an interactive terminal client.
- **What to monitor in production.** SASL failure rate (a sudden spike means bad cert rotation or bot-credential stuffing). Stream resumption success rate (90% or above on mobile is healthy). s2s connection count per peer domain (a sudden drop is a TLS regression like the Trixie EKU bug). Stanza queue backlog per session, watching for XEP-0198 `h` divergence.

## What's changing in 2026

**Movim 0.32 ships Spaces in March 2026.** XEP-0503, a hierarchical Discord-style Spaces UI on top of PubSub plus MUC. First major XMPP product to ship that pattern.

**XEP-0440 SASL Channel-Binding advances to Stable, 18 November 2025.** Expect this to become a default in 2026 servers — it is the thing that lets SCRAM-SHA-256-PLUS bind authentication to the underlying TLS session and shut down a class of relay attack.

**XEP-0485 PubSub Server Information advances to Stable, 11 November 2025.** The XSF is using it to publicly track which servers participate in the federation graph for spam mitigation.

**XEP-0509 Initial Authentication Pipelining begins Last Call in late 2025.** With XEP-0388 SASL2, XEP-0386 Bind 2, and XEP-0484 FAST tokens, the suite collapses what used to be five round trips of stream-restart handshake into a single connection. ejabberd 24.12 (December 2024) and Prosody 13.0 (March 2025) shipped support.

**OMEMO 0.9.0 introduces the OMEMO Double Ratchet, 7 April 2025.** Cuts the dependency on libsignal's GPL licensing. Soatok's August 2024 essay "Against XMPP+OMEMO" is the sharpest critique of where this still leaves the protocol — no PQXDH yet, no Triple Ratchet or SPQR, behind upstream Signal on every post-quantum front.

**Meta and the EU DMA, March 2024 onward.** WhatsApp and Messenger were designated DMA gatekeepers and Meta opened an XMPP-derived API for third-party messengers. Element and Matrix demoed a Matrix-to-WhatsApp E2EE bridge at FOSDEM 2024. The XSF published an open letter pushing Meta to expose native XMPP rather than a proprietary API. By November 2025, Meta had announced first interoperable third-party clients — BirdyChat and Haiket. The strategic question for the rest of 2026: will any DMA bridge actually use XMPP as transit, or will Matrix and proprietary APIs share that field?

**MIMI at the IETF picks something else.** The "More Instant Messaging Interoperability" working group, chartered in 2023 in response to the DMA, is consciously not XMPP. Its draft `draft-ietf-mimi-protocol-05` from October 2025 specifies HTTPS plus MLS for inter-provider transport. Its charter notes it will draw lessons from XMPP and SIMPLE without reopening either debate.

**Matrix gateway in ejabberd.** ejabberd 25.07, 25.08, and 25.10 added Matrix Hydra-room support and improved compliance with Matrix's federation. ejabberd is now a viable bridge node, not just a pure XMPP server.

**Snikket Borogove SDK, late 2025.** A new client-side toolkit and updated push-notification APIs aimed at making "I run my own XMPP server for my family" a one-evening project.

**MIX still experimental.** XEP-0369 has been sitting at Experimental since 2017. Tigase has shipped a production MIX implementation on xmpp.cloud and ejabberd has a `mod_mix`, but Conversations and Snikket continue to use MUC plus bookmarks. MIX was designed to replace MUC; in practice it has not, yet.

## Fun facts (host material)

The name "Jabber" comes from English "to jabber" — to talk rapidly and indistinctly. Detractors loved that it was self-deprecating. The IETF's literary trail goes further back: RFC 527, "ARPAWOCKY", from June 1973, was a parody of Lewis Carroll's "Jabberwocky". The protocol's name and the IETF's annual joke RFCs share a common ancestor.

The original announcement on Slashdot, on the 4th of January 1999, was Slashdot story 99/01/04/1621211 by user Jeremie, account 257 — an unusually low Slashdot ID. Rob "CmdrTaco" Malda posted it from a DEC Multia under his desk at The Image Group ad agency. Twenty-five years later, Slashdot ran a "Jabber was announced 25 years ago this week" retrospective.

The "X" in XMPP was won, after long debate inside the IETF working group, over alternatives like JMPP and JXP. The chosen name foregrounded XML extensibility — exactly the choice critics later used to attack the protocol as bloated. Every XMPP retrospective on Hacker News reliably attracts the same JSON-replaces-XML argument.

The XML-overhead critique made flesh: a baseline XMPP message stanza to deliver "hello" runs about 180 bytes. WhatsApp's FunXMPP binary dictionary compresses identical content to about 20 bytes. The bandwidth gap that justified the WhatsApp fork is the same gap that defines engineer scepticism toward XMPP — and the same gap that made WhatsApp viable on a $20 Android phone in rural Brazil.

Cisco bought Jabber Inc. in September 2008 for what trade press estimated at fifty million dollars. Peter Saint-Andre — the editor-in-chief of every XMPP RFC from 2002 onward — joined Cisco as a result and continued editing the standards from there before moving on to Mozilla and `&yet`.

JIDs as URIs. RFC 5122 from 2008 defines the `xmpp:juliet@example.com` URI form. The debate over whether JIDs should even be URIs raged in the working group for years and is the reason RFC 6122 — and later 7622 — exists as a separate document with the address syntax split out of XMPP Core.

## Where this connects in the book

- *Foundations* — Chapter "Protocols for AI Agents". The chapter on MCP and A2A treats XMPP as one of the older application-layer protocols still holding its niche, alongside MQTT and the email stack — useful counterpoint when explaining why the AI agent layer is the first new L7 in fifteen years.
- *The Story of the Internet* — Chapter "The AI Agent Layer (2024–)". The narrative chapter that situates XMPP in the long tail of L7 protocols that survived between WebSockets in 2011 and MCP in 2024. The Hangouts moment, the Facebook gateway shutdown, and the EU DMA reversal are the kind of historical arc the chapter episode is built to carry.

## See also (other protocol episodes)

If you have heard the TCP episode, the relationship is foundational. XMPP maintains a long-lived TCP connection per client — usually exactly one while online — and streams XML stanzas over it. TCP guarantees the well-formed sequential byte stream that the XML parser at the top demands. Server-to-server links use two TCP connections per direction by default, a legacy of the original Jabber wire protocol that the Bidi extension XEP-0288 collapses to one.

If you have heard the TLS episode, the integration is mandatory. RFC 6120 makes TLS support required and STARTTLS the default upgrade path on port 5222. XEP-0368 from 2015 added direct TLS on port 5223 for places where in-band negotiation is awkward — the implicit-TLS path is now widely deployed. The 2026 Debian Trixie ejabberd EKU bug is the case study of how strict client/server certificate distinctions can break s2s overnight.

If you have heard the WebSocket episode, the bridge is RFC 7395. XMPP-over-WebSocket runs the same `<stream>` and stanza model over WebSocket text frames, typically at `wss://server/xmpp-websocket`, so browser clients like Converse.js, Movim, and Prose can join the network without the long-poll overhead of the older BOSH transport (XEP-0124 plus XEP-0206). BOSH is largely superseded; WebSocket won.

The contrast worth drawing is XMPP versus STOMP. STOMP is a minimal text-frame protocol for queue and topic messaging through a broker — SEND, SUBSCRIBE, ACK, and not much else. XMPP is the rich, federated, presence-aware end of the design space — hundreds of XEPs, multi-user chat, message carbons, end-to-end encryption, peer-to-peer media via Jingle. Use STOMP when you have a broker like ActiveMQ or RabbitMQ and you want browser clients to talk to it through WebSocket. Use XMPP when you need presence, federation across administrative domains, or any of the rich messaging features the XEP catalogue has accumulated since 2002.

The MQTT comparison is the other one practitioners argue over. Both are filed under "Async/IoT". MQTT is binary, broker-centric pub/sub for telemetry on constrained devices; XMPP is XML and federated. Independent benchmarks find MQTT 50% to 70% smaller on the wire, which is exactly why WhatsApp's FunXMPP exists. ejabberd nowadays bundles an MQTT broker so a single server can speak both — and pure XMPP-IoT via XEPs 0323, 0324, 0325, and 0326 has not displaced MQTT in production.

The Matrix comparison is the most-cited modern foil. HTTP and JSON, decentralised but with eventual-consistency state DAGs; servers store full room history, so Matrix runs heavy server and light client where XMPP is the inverse. The EU DMA stakeholder process specifically flagged Matrix and XMPP as the two candidate "common languages" for messaging interop. Matrix offers Olm and Megolm for E2EE versus XMPP's OMEMO. ProcessOne's 2024 essay "XMPP and Matrix" is the cleanest practitioner write-up of the trade-off.

## Visual cues for image generation

- "An XMPP stream as a long opening tag. The browser-style angle brackets at the top, then a vertical column of message, presence, and iq stanzas flowing down for hours, with a tiny closing tag at the very bottom labelled 'days later'."
- "A side-by-side wire comparison: a 180-byte XMPP message stanza on the left, a 20-byte FunXMPP binary frame on the right, both labelled 'hello'. Caption: 'WhatsApp on a $20 phone in rural Brazil.'"
- "The XMPP federation graph as a constellation of named servers — jabber.org, snikket.chat, conversations.im, xmpp.cloud — with dashed s2s links on port 5269 between every pair, and one greyed-out 'talk.google.com' node with a 2017 tombstone."
- "The Nintendo Switch ejabberd architecture: ten million phones in an outer ring, each holding one TCP connection to an 'outer' Erlang node; outer nodes feeding a smaller cluster of CPU-heavy 'inner' nodes that ingest two billion notifications per day."
- "A three-track timeline of XMPP's commercial rollercoaster: 1999 Slashdot post, 2005 Google Talk launch, 2008 Cisco buys Jabber Inc., 2013 Hangouts drops federation, 2017 Talk fully retired, 2024 EU DMA forces WhatsApp interop, 2026 first third-party clients announced."
- "The Openfire CVE-2023-32315 attack as a cartoon: a normal '..' bouncing off a filter, then '%2e%2e' bouncing off, then '%u002e%u002e' walking straight through into /setup-s/, with a label 'eight years undetected, fifty percent of public servers exploited within months.'"

## Sources

**RFCs**

- [RFC 6120 — XMPP Core](https://datatracker.ietf.org/doc/rfc6120/)
- [RFC 6121 — XMPP Instant Messaging and Presence](https://www.rfc-editor.org/info/rfc6121)
- [RFC 7622 — XMPP Address Format (PRECIS)](https://datatracker.ietf.org/doc/html/rfc7622)
- [RFC 7395 — XMPP over WebSocket](https://datatracker.ietf.org/doc/html/rfc7395)
- [RFC 7247 — SIP/XMPP Interworking](https://datatracker.ietf.org/doc/html/rfc7247)
- [RFC 8446 — TLS 1.3](https://www.rfc-editor.org/info/rfc8446)
- [RFC 9293 — Transmission Control Protocol](https://www.rfc-editor.org/info/rfc9293)
- [RFC 6455 — The WebSocket Protocol](https://www.rfc-editor.org/info/rfc6455)
- [RFC 3920 — XMPP Core (obsoleted by 6120)](https://datatracker.ietf.org/doc/html/rfc3920.html)
- [XEP series index](https://xmpp.org/extensions/)
- [XEP-0124 — BOSH](https://xmpp.org/extensions/xep-0124.html)
- [XEP-0156 — Discovering XMPP transports](https://xmpp.org/extensions/xep-0156.xml)
- [XEP-0166 — Jingle](https://xmpp.org/extensions/xep-0166.html)
- [XEP-0198 — Stream Management](https://xmpp.org/extensions/xep-0198.html)
- [XEP-0206 — XMPP over BOSH](https://xmpp.org/extensions/xep-0206.html)
- [XEP-0357 — Push Notifications](https://xmpp.org/extensions/xep-0357.html)
- [XEP-0369 — MIX Core](https://xmpp.org/extensions/xep-0369.html)
- [XEP-0384 — OMEMO Encryption](https://xmpp.org/extensions/xep-0384.html)
- [XEP-0479 — XMPP Compliance Suites](https://xmpp.org/extensions/xep-0479.html)
- [XEP-0509 — Initial Authentication Pipelining](https://xmpp.org/extensions/xep-0509.html)
- [draft-ietf-mimi-protocol](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)

**Papers**

- [Mishra et al., Messaging Protocols for IoT Systems — A Pragmatic Comparison, Sensors 2021](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540579/)
- [Hashimoto et al., Comprehensive Deniability Analysis of Signal Handshake Protocols, eprint 2025/1090](https://eprint.iacr.org/2025/1090)
- [NIST PQC 2025 — Post-Quantum Ratcheting for Signal](https://csrc.nist.gov/csrc/media/events/2025/sixth-pqc-standardization-conference/post-quantum%20ratcheting%20for%20signal.pdf)

**Vendor and engineering blogs**

- [Meta Engineering — Messaging interoperability with third parties (2024)](https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/)
- [Matrix.org — Native Matrix interoperability with WhatsApp (2024)](https://matrix.org/blog/2024/09/whatsapp-dma/)
- [Element — The EU Digital Markets Act is here](https://element.io/blog/the-eu-digital-markets-act-is-here/)
- [GetStream — How WhatsApp Works](https://getstream.io/blog/whatsapp-works/)
- [ProcessOne — XMPP and Matrix](https://www.process-one.net/blog/xmpp-matrix/)
- [ProcessOne — ejabberd and Nintendo Switch NPNS](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/)
- [ProcessOne — ejabberd 25.07](https://www.process-one.net/blog/ejabberd-25-07/)
- [ProcessOne — ejabberd 25.10](https://www.process-one.net/blog/ejabberd-25-10/)
- [ProcessOne — ejabberd 26.02](https://www.process-one.net/blog/ejabberd-26-02/)
- [ProcessOne — ejabberd product page](https://www.process-one.net/ejabberd/)
- [Soatok — Against XMPP+OMEMO (2024)](https://soatok.blog/2024/08/04/against-xmppomemo/)
- [Modern XMPP — community guidance](https://docs.modernxmpp.org/)
- [Snikket — server release notes November 2025](https://snikket.org/blog/snikket-server-nov-2025/)
- [Snikket — server release notes December 2025](https://snikket.org/blog/snikket-server-dec-2025/)
- [Snikket — open source](https://snikket.org/open-source/)
- [Movim — XMPP vs ActivityPub explained through the blog feature](https://mov.im/community/pubsub.movim.eu/Movim/the-difference-between-xmpp-and-activitypub-explained-through-the-blog-feature-Hdx4FR)
- [Tigase — IM and MIX](https://tigase.net/tigase-im-mix/)
- [Ignite Realtime — Openfire](https://www.igniterealtime.org/projects/openfire/)
- [Prosody — security tags](https://blog.prosody.im/tags/security/)
- [GitHub — ejabberd releases](https://github.com/processone/ejabberd/releases)
- [Planet Jabber — community feed](https://planet.jabber.org/)
- [VulnCheck — Openfire CVE-2023-32315](https://www.vulncheck.com/blog/openfire-cve-2023-32315)
- [Openfire — GHSA-gw42-f939-fhvm](https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm)
- [Hack The Box — Openfire CVEs CVE-2024-25420 and CVE-2024-25421](https://www.hackthebox.com/blog/openfire-cves-explained-CVE-2024-25420-CVE-2024-25421)

**News**

- [Slashdot — Open Real Time Messaging System (4 January 1999)](https://slashdot.org/story/99/01/04/1621211/open-real-time-messaging-system)
- [Slashdot — Jabber announced 25 years ago this week](https://news.slashdot.org/story/24/01/06/209211/jabber-was-announced-on-slashdot-25-years-ago-this-week)
- [Slashdot — Cisco to buy Jabber (2008)](https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber)
- [EFF — Google abandons open standards for instant messaging](https://www.eff.org/deeplinks/2013/05/google-abandons-open-standards-instant-messaging)
- [Android Police — Google retiring Google Talk (2017)](https://www.androidpolice.com/2017/03/24/google-retiring-google-talk-good-also-shutting-several-gmail-labs/)
- [Computing — WhatsApp announces interoperability (2025)](https://www.computing.co.uk/news/2025/legislation-regulation/whatsapp-announces-interoperability)
- [Cisco — Jabber for Windows EOS/EOL listing](https://www.cisco.com/c/en/us/products/unified-communications/jabber-windows/eos-eol-notice-listing.html)
- [XSF — Open letter to Meta on the DMA](https://xmpp.org/announcements/open-letter-meta-dma/)
- [XSF — XMPP newsletter (current)](https://xmpp.org/category/newsletter/)
- [XSF — November 2025 newsletter](https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/)
- [XSF — December 2025 newsletter](https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/)

**Wikipedia and reference**

- [Wikipedia — XMPP](https://en.wikipedia.org/wiki/XMPP)
- [Wikipedia — Jeremie Miller](https://en.wikipedia.org/wiki/Jeremie_Miller)
- [Wikipedia — WhatsApp](https://en.wikipedia.org/wiki/WhatsApp)
- [Wikipedia — OMEMO](https://en.wikipedia.org/wiki/OMEMO)
- [Wikipedia — Signal Protocol](https://en.wikipedia.org/wiki/Signal_Protocol)
- [Wikipedia — Ejabberd](https://en.wikipedia.org/wiki/Ejabberd)
- [Wikipedia — Movim](https://en.wikipedia.org/wiki/Movim)
- [Wikipedia — Jingle (protocol)](https://en.wikipedia.org/wiki/Jingle_(protocol))
- [XMPP.org — history](https://xmpp.org/about/history/)
- [XMPP.org — technology overview](https://xmpp.org/about/technology-overview/)
- [XMPP.org — instant messaging uses](https://xmpp.org/uses/instant-messaging/)
- [XMPP.org — RFCs](https://xmpp.org/rfcs/)
- [O'Reilly — XMPP: The Definitive Guide](https://www.oreilly.com/library/view/xmpp-the-definitive/9780596157524/index.html)
- [Conversations](https://conversations.im/)
- [Snikket](https://snikket.org/)
- [Gajim](https://gajim.org/)
- [Movim](https://movim.eu/)
- [Dino](https://dino.im/)
- [Prose](https://prose.org/)
- [Jicofo on GitHub](https://github.com/jitsi/jicofo)
