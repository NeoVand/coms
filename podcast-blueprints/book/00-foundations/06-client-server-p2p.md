---
id: client-server-p2p
type: chapter
part_id: foundations
part_label: I
part_title: Foundations
title: Client-Server vs Peer-to-Peer
synopsis: Two communication patterns and what each makes easy or hard.
podcast_target_minutes: 15
position_in_book: 7 of book
listening_order:
  prev: foundations/reliability-speed
  next: foundations/encryption-basics
related_protocols: [ip, tcp, http1, dns, smtp, ssh, rest, grpc, graphql, webrtc, mqtt, amqp, kafka]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/b/bb/Client-Server_Model-en.svg/500px-Client-Server_Model-en.svg.png
    caption: Client-server topology. One well-known address that everyone connects to. Easy to discover, easy to harden, easy to scale by replicating the server.
    credit: Diagram — Wikimedia Commons / CC BY-SA 4.0
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/P2P-network.svg/500px-P2P-network.svg.png
    caption: Peer-to-peer topology. Every node is both client and server. No single point of failure, and no single point of authority.
    credit: Diagram — Wikimedia Commons / public domain
visual_cues:
  - "Side-by-side topology diagram. Left: a star — many clients converging on one server. Right: a mesh — peers connecting peers, no center. Title block: 'Discovery is trivial vs Discovery is the hard part.'"
  - "A Venn diagram of the three conditions that pick P2P over client-server: 'central server can't scale to the load' (BitTorrent), 'end-to-end privacy required' (WebRTC one-on-one), 'no party can be trusted to mediate' (blockchain). Each circle has its example pinned to the rim."
  - "A NAT-traversal cartoon — two phones behind home routers, neither with a public address, with STUN/TURN/ICE labelled as the three boxes that get them connected anyway. About 10–15% of cases falling through to TURN as a relay."
  - "A bandwidth-vs-control plot of hybrid systems: pure client-server in one corner, pure P2P in the other, and Zoom one-on-one, Discord SFU, BitTorrent + DHT, Mastodon federation, CDN edges, and Cloudflare Workers placed across the diagonal."
  - "A pub/sub broker in the middle with 'producers' on the left, 'subscribers' on the right, and dotted arrows showing that neither side knows the other exists — labelled 'client-server in form, P2P in benefit.'"
---

# Part I, Chapter — Client-Server vs Peer-to-Peer

## The hook

Two computers want to talk. One of them has a stable address everyone knows; the other is on a phone that picks up a new IP every time it joins a new coffee shop. That is not a small detail — that is the whole architectural choice. Almost every system you have ever used falls on one side of it. And the systems that look like they straddle the line, on closer inspection, are quietly running both patterns at different layers.

## The story

### The Pattern Most of the Internet Runs On

Client-server has been the dominant communication pattern on the internet since the web shipped. A client — your browser, your phone app, your terminal — initiates a request to a server, which is a process on a known host at a known address. The server processes the request and sends a response. The server has a stable identity: a hostname, an IP address, a port. The client's identity is ephemeral, a transient TCP connection from a random ephemeral port that the operating system hands out and forgets about.

The list of things that work this way is essentially the list of things you use. HTTP. DNS. SMTP. SSH. Every database protocol. Every REST API. gRPC. GraphQL. All client-server. The mechanism details for each of these belong in their own protocol episodes — TCP for the transport, HTTP for the request-response language of the web, DNS for the lookup, SMTP for email's store-and-forward, SSH for encrypted shells, REST for the architectural style, gRPC for high-performance RPC, GraphQL for client-shaped queries — but the *shape* is the same. One well-known endpoint. Many ephemeral askers.

The model wins for two structural reasons.

The first is that discovery is trivial. The client has the server's hostname; the server has a static IP; that is the entire discovery story. No coordination required. Compare that to the question we are about to face on the other side of this chapter — how do two phones behind two home routers find each other? — and you will see how much weight that one sentence carries.

The second is that trust is concentrated. The server can be hardened, audited, monitored, scaled, and upgraded as one unit. Clients can be lighter, dumber, more numerous. This is why your browser is a few hundred megabytes and Google's web infrastructure is many warehouses of servers. The asymmetry of trust and capability is built into the model itself.

### When Peer-to-Peer Is The Right Answer

The peer-to-peer model is fundamentally different. Every participant is simultaneously client and server. Nodes connect directly to each other. There is no central authority that knows the full membership of the network. BitTorrent works this way. WebRTC works this way. Blockchain consensus works this way. IPFS, the original Napster's data plane — though not its discovery — and Gnutella all use P2P.

Peer-to-peer wins when one of three conditions holds.

First: no central server can scale to the load. BitTorrent for large files turns every downloader into an uploader. Popularity becomes capacity. The more people want the file, the faster everyone gets it.

Second: end-to-end privacy is required. A WebRTC call between two phones in the same room ideally never touches a relay. The audio is between the two endpoints only.

Third: no party can be trusted to mediate. Blockchain protocols specifically refuse the existence of a central authority and replace it with consensus.

Peer-to-peer is harder to build than client-server in three specific ways, and these three difficulties are why the model loses by default.

The first is discovery. How do peers find each other when there is no directory? Tracker servers. DHTs — distributed hash tables. Gossip protocols. None of these is as cheap as "type the hostname into a browser."

The second is NAT traversal. How do two peers behind home routers initiate a connection when neither has a public address? STUN, TURN, and ICE — collectively the NAT-traversal stack — solve this. STUN discovers the peer's public IP. TURN relays media through a server when a direct connection fails, which happens in roughly ten to fifteen percent of cases. ICE coordinates both to find the best working path. The WebRTC episode goes through that stack in detail; for now, just know that punching a hole through two consumer routers from the inside is a real engineering problem with real numbers attached.

The third is trust. How do you verify peers are who they claim to be without a central certificate authority? Public-key cryptography. Web-of-trust. Blockchain identity. Content-addressing. Each is a different answer; none is as ergonomic as a CA-issued certificate that the browser checks for you.

There is a callout in the chapter worth pulling out as its own beat, because it changes how you should read the rest of this story: most systems that *look* peer-to-peer are actually hybrid. Zoom uses a central server for group calls but P2P for one-on-one. Discord routes all voice and video through a server-based Selective Forwarding Unit — an SFU — to handle groups efficiently and to hide users' IPs from each other. BitTorrent uses centralised trackers, or a DHT, which is a decentralised tracker, to bootstrap peer discovery. The pure P2P systems are the exception. Most "decentralised" architectures retain a small centralised piece for discovery or for trust, with the bandwidth-heavy data plane being peer-to-peer.

### Hybrid Patterns

Real systems pick the part of each model that fits their constraints, and the patterns they end up with are worth naming.

Pub/sub messaging — MQTT, AMQP, Kafka — is client-server in form. Everyone connects to a broker. But its purpose is to decouple publishers from subscribers. Neither party knows the others' identities. The broker is just a routing intermediary. The benefits look more like P2P: any number of producers, any number of consumers, no point-to-point connections. The MQTT episode covers the lightweight IoT case — two-byte fixed header, satellite-friendly, born at IBM in 1999 for oil-pipeline monitoring. The AMQP episode covers the enterprise heavyweight, with its four exchange types and its delivery guarantees that financial systems need. The Kafka episode covers the append-only-log model that LinkedIn open-sourced in 2011 and that now handles millions of messages per second at sub-ten-millisecond latency.

CDNs are client-server in shape but distributed across hundreds of edge points-of-presence. Your request to nytimes.com hits an Akamai cache five milliseconds away, not the origin in New York fifty milliseconds away. The architecture is a hierarchy of caches.

Federated systems — Mastodon, ActivityPub, SMTP email — are client-server within each instance but peer-to-peer at the server level. Your Mastodon server federates with thousands of others to expose a global social graph without a central operator. This is the same idea SMTP has been running on for forty years: every mail server is a client to every other mail server, and the whole thing somehow holds together as one network.

Edge compute — Cloudflare Workers, AWS Lambda@Edge — pushes server logic out to the same edge points the CDN uses. The "server" is not in one place. It is a function that runs wherever the user happens to be.

The choice — pure client-server, pure P2P, or one of these hybrids — depends on the scale you need, the trust you can assume, and the privacy you are willing to sacrifice. Twenty years ago, "is this app client-server or P2P" was a coherent question. Today the answer is almost always "yes, both, in different ratios at different layers."

## Where to go deeper

There are a lot of protocol episodes that touch this chapter, because client-server and P2P are the substrate every protocol picks a side of. A short tour:

- **The IP episode** is the addressing layer underneath all of this — every packet, client-server or peer-to-peer, gets a source and destination IP. Best-effort, connectionless, twenty-byte header.
- **The TCP episode** covers the connection-oriented transport that almost every client-server system rides on, including the congestion-control story from Tahoe through CUBIC to BBRv3.
- **The HTTP/1.1 episode** is the original client-server language of the web — request, response, head-of-line blocking, six parallel TCP connections per domain.
- **The DNS episode** is the lookup that turns hostnames into IPs and makes "discovery is trivial" actually trivial.
- **The SMTP episode** is the federated client-server pattern at server level — store-and-forward, hop by hop, forty years old and still universal.
- **The SSH episode** is the encrypted-tunnel client-server case, with port forwarding as the surprise feature that makes it half a VPN.
- **The REST episode** is the architectural style that took over public APIs — Roy Fielding's 2000 dissertation, resources as nouns, statelessness as the scaling lever.
- **The gRPC episode** is the high-performance internal-microservice case — Protocol Buffers, HTTP/2 multiplexing, streaming in three flavours.
- **The GraphQL episode** is the client-shaped-query answer to REST's chattiness — single endpoint, schema-typed, born at Facebook in 2012.
- **The WebRTC episode** is the headline P2P case in the browser — DTLS, SRTP, SCTP data channels, and the STUN/TURN/ICE stack that makes the peer connection possible at all.
- **The MQTT, AMQP, and Kafka episodes** are the three flavours of the broker pattern — IoT, enterprise queue, and event-streaming log.

## Listening order

- **Before this chapter:** *Reliability vs Speed* — the trade-off between getting every byte versus getting them on time. That choice sets up the transport layer that both client-server and P2P sit on top of.
- **After this chapter:** *Encryption Basics* — once you have decided who is talking to whom, you have to decide how to keep anyone else from listening. The next chapter sets up the cryptographic primitives that show up in TLS, SSH, WebRTC's DTLS, and the rest.

## Visual cues for image generation

(See frontmatter `visual_cues` block.)
