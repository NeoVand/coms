---
id: how-to-learn-more/tools
type: chapter
part_id: how-to-learn-more
part_label: XIII
part_title: How to Learn More
title: Tools
synopsis: Wireshark, scapy, FRRouting, Containerlab, RIPE Atlas.
podcast_target_minutes: 12
position_in_book: 84 of 75
listening_order:
  prev: how-to-learn-more/blogs
  next: null
related_protocols: [quic, dns, bgp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A laptop screen split four ways — Wireshark capturing live packets, a curl -v command in a terminal, dig +trace walking the DNS hierarchy, and a Containerlab topology diagram of fifty routers — captioned 'one engineer, one hour, the whole stack.'"
  - "A Wireshark dissection panel zoomed into a single TCP segment — Ethernet header, IP header, TCP header, payload — each layer in a different colour, with annotations 'this is what the wire actually carries.'"
  - "A world map dotted with thousands of small probes — RIPE Atlas — with arrows from one chosen city to a target server, latency numbers labelled in milliseconds at each vantage point."
  - "A bgp.tools-style table showing an AS path for a single prefix — origin AS, transit AS, your AS — captioned 'this is how the internet decides where your packet goes.'"
  - "A bookshelf of tool logos — Wireshark, curl, dig, scapy, FRRouting, Containerlab, RIPE Atlas, bgp.tools, iperf3, ngrep — labelled 'the operating toolkit.'"
---

# Part XIII, Chapter — Tools

## The hook
Books explain the protocols. Blogs explain the production stories. But nothing teaches networking like watching the bytes go past on the wire. This last chapter is a toolkit — ten programs that turn the textbook into something you can poke, capture, replay, and break on purpose.

## The story

### The Operating Toolkit

There is a short list of tools that practising network engineers reach for every week, and if you learn them, you stop being someone who has read about networking and start being someone who can debug it. The chapter walks the list in order.

**Wireshark**, at wireshark.org, is the canonical packet analyser. It captures from any interface, dissects more than three thousand protocols, and lets you trace any flow byte by byte. The chapter makes a strong claim: if you do not know Wireshark, learning it is the highest-leverage hour you will ever spend in this field. Use it the next time something is wrong, and you will never debug networking the same way again.

**curl**, at curl.se, is the command-line HTTP client and the Swiss-army knife of the protocol world. `curl -v` shows you the entire request and response with headers. `--http3` forces the request over QUIC — and how QUIC actually works, the one-RTT handshake and the per-stream loss recovery, is the whole QUIC episode. `--resolve` overrides DNS for a single request, which is invaluable when you are testing a new origin before flipping the public records. `-w` formats timing information so you can see exactly where the milliseconds are going.

**dig**, shipped with the BIND tools, is the standard DNS debugging tool. The one incantation worth memorising is `dig +trace +recurse example.com`, which walks the entire delegation chain from the root servers down to the authoritative server for the domain. The mechanics of that hierarchy — root, TLD, authoritative, recursive resolver — is the DNS episode.

**scapy**, in Python, is what you reach for when you need to craft a packet that no normal tool will produce. It is the standard for protocol research, fuzzing, and unusual diagnostics. The learning curve is steep and the payoff is deep: once you can hand-build a packet, no protocol feels like magic anymore.

**FRRouting**, at frrouting.org, is an open-source routing stack — BGP, OSPF, IS-IS, RIP, and more — that runs on Linux. It powers containerlab simulations and runs in production at some small-scale ISPs. BGP itself, the protocol it speaks, is the BGP episode.

**Containerlab**, at containerlab.dev, orchestrates network labs of containerised network operating systems. You can spin up a fifty-router BGP topology in under a minute on your laptop. This is the standard for hands-on routing learning today — it has replaced the rack of physical routers that an earlier generation kept in a closet.

**RIPE Atlas**, at atlas.ripe.net, is a global mesh of probes you can use to measure reachability, latency, and routing from arbitrary vantage points around the world. It is free for non-commercial research, and it is the cheapest way to ask "what does my service look like from Lagos, or São Paulo, or Jakarta, right now."

**bgp.tools** is the modern BGP looking glass. Type any AS number or prefix and see the global routing table from multiple vantage points. It is the successor to the older route-views.org infrastructure that an earlier generation of network engineers grew up on.

**iperf3** is the bandwidth measurement tool — the standard answer to the question "how fast can these two hosts actually talk to each other." Two endpoints, one number in bits per second, no ambiguity.

**ngrep** is grep for live packet captures. `ngrep -d any "GET /api"` shows every HTTP GET on the wire that matches the pattern, in real time, with no setup.

That is the list. Ten tools. The chapter's quiet argument is that an engineer who is fluent in these ten programs can investigate any networking problem on any layer of any stack, because between them they cover capture, crafting, querying, simulating, measuring, and observing — the full set of verbs you ever need.

## Where to go deeper

- The QUIC episode picks up what `curl --http3` is actually doing — the combined transport-and-TLS handshake, one round trip instead of two, no head-of-line blocking, and the 0-RTT path on reconnection.
- The DNS episode picks up what `dig +trace` is walking — the root, the TLD servers, the authoritative servers, the recursive resolvers, and the caching that makes most lookups answer in under a millisecond.
- The BGP episode picks up what FRRouting, Containerlab, and bgp.tools are all in service of — the path-vector protocol that holds the internet together, eBGP versus iBGP, and why a single misconfiguration once took Facebook off the internet for six hours.

## Listening order

- **Before this chapter:** *"Blogs" — the previous chapter pointed you at the writing that explains how the protocols are run in production. This one hands you the tools to see them yourself.*
- **After this chapter:** This is the last chapter of the book. The next move is yours — open Wireshark on your own laptop and capture the next page load.

## Visual cues for image generation
- A laptop screen split four ways — Wireshark capturing live packets, a curl -v command in a terminal, dig +trace walking the DNS hierarchy, and a Containerlab topology diagram of fifty routers — captioned "one engineer, one hour, the whole stack."
- A Wireshark dissection panel zoomed into a single TCP segment — Ethernet header, IP header, TCP header, payload — each layer in a different colour, with annotations "this is what the wire actually carries."
- A world map dotted with thousands of small probes — RIPE Atlas — with arrows from one chosen city to a target server, latency numbers labelled in milliseconds at each vantage point.
- A bgp.tools-style table showing an AS path for a single prefix — origin AS, transit AS, your AS — captioned "this is how the internet decides where your packet goes."
- A bookshelf of tool logos — Wireshark, curl, dig, scapy, FRRouting, Containerlab, RIPE Atlas, bgp.tools, iperf3, ngrep — labelled "the operating toolkit."
