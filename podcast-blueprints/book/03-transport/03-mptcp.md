---
id: mptcp
type: chapter
part_id: transport
part_label: IV
part_title: Transport
title: MPTCP
synopsis: Wi-Fi plus cellular at the same time, transparently.
podcast_target_minutes: 12
position_in_book: 28 of 75
listening_order:
  prev: transport/sctp
  next: transport/quic
related_protocols: [mptcp, wifi, quic, tcp, sctp, udp, http3]
related_pioneers: []
related_outages: []
related_frontier: [multipath-quic]
related_rfcs: [6824, 8684]
images:
  - src: ""
    caption: "iOS 7, shipped September 2013 — the first consumer operating system to ship Multipath TCP, used by Siri to bridge the half-second handoff between Wi-Fi and cellular."
    credit: "Apple"
visual_cues:
  - "A phone with two radios drawn as parallel pipes — one labeled Wi-Fi, one labeled cellular — feeding into a single TCP socket icon at the top, with the kernel labeled 'MPTCP shim' in between."
  - "A walking-out-of-the-house diagram: at the door, the Wi-Fi bar drops to one and the cellular bar climbs to four; a Siri speech bubble keeps streaming uninterrupted."
  - "A timeline with three pinned dates — RFC 6824 January 2013, iOS 7 September 2013, RFC 8684 March 2020, Linux kernel 5.6 March 2020 — with a final marker in late 2025 / early 2026 reading 'draft-ietf-quic-multipath, IETF Last Call.'"
  - "Two side-by-side stacks: on the left, MPTCP options bolted onto the TCP header with an angry middlebox stripping them out; on the right, multipath QUIC tucked inside an opaque UDP envelope sliding past the same middlebox."
  - "A map of South Korea with a Korea Telecom GIGA Path antenna icon, a phone showing a 1 Gbps download speed, and two flowing arrows labeled LTE and Wi-Fi merging into a single connection."
---

# Part IV, Chapter — MPTCP

## The hook

Apple shipped Multipath TCP in iOS 7 in September 2013 for one specific reason: Siri kept failing the moment you walked out your front door. The half-second handoff between Wi-Fi and cellular was breaking voice recognition mid-sentence. Twelve years later, the same multipath idea is being ported to QUIC. This is the chapter on the transport that Apple shipped to a billion devices and almost no third-party developer knows about.

## The story

### Two Paths, One Connection

Your phone has two radios. Wi-Fi is fast and free. Cellular is everywhere. The naive approach — pick one, fall back to the other if it fails — wastes capacity and stutters every time you walk out of range of your home router.

What if a single connection could use both at the same time?

That is the Multipath TCP proposition. RFC 6824 in January 2013, current RFC 8684 in March 2020. MPTCP presents a normal TCP socket to the application, but underneath it negotiates subflows over multiple paths and aggregates their throughput. Sequence numbers and acknowledgements are coordinated at the MPTCP layer. Congestion control runs per subflow, but the subflows are coupled — the algorithm is called LIA, Linked Increases Algorithm, in RFC 6356 — so the protocol does not over-allocate capacity to the better path.

The application has no idea any of this is happening. The socket interface is identical to a regular TCP socket. The kernel does the multipath bookkeeping. The wire format uses TCP options that legacy middleboxes mostly forward unchanged. How TCP itself works — sequence numbers, the three-way handshake, the congestion control lineage from Tahoe and Reno through CUBIC to BBR — is the TCP episode.

### The Apple iOS 7 Deployment

Apple shipped MPTCP in iOS 7 in September 2013 for Siri. The choice was forced by user experience. Siri's voice recognition did a round trip to Apple's servers, and the half-second handoff between Wi-Fi and cellular was producing visible "Sorry, I didn't catch that" failures during normal walking-out-of-the-house transitions. MPTCP let Siri's connection keep working through the handoff.

Apple expanded MPTCP in iOS 11 in 2017 to a public API for any app, and in iOS 12 and later to additional system services — Apple Maps, Apple Music. By 2026, every Apple device with both Wi-Fi and cellular uses MPTCP for the OS-managed services. Notably, Apple did not open up MPTCP for third-party app traffic by default. Most app developers do not know they could use it.

Linux merged the upstream MPTCP implementation in kernel 5.6 in March 2020, after years of out-of-tree patches.

South Korea's Korea Telecom built a "GIGA Path" service that used MPTCP to bond LTE and Wi-Fi for one-gigabit-per-second mobile downloads. That was the first commercial network operator to position MPTCP as a consumer feature.

### Adoption Is Real But Limited

The same NAT and firewall friction that confines SCTP — the chapter just before this one — hits MPTCP. Many middleboxes strip the MPTCP option from the SYN, falling the connection back to plain TCP. Where MPTCP works — Apple OS services, Korea Telecom GIGA Path, some specialised enterprise WANs — it works well. Where it does not work — the long tail of public-internet middleboxes — it falls back transparently.

The deployment story is "successful in controlled paths, invisible everywhere else."

### The Multipath QUIC Succession

The future of multipath transport is multipath QUIC. The IETF draft, draft-ietf-quic-multipath, is in IETF Last Call as of late 2025 and early 2026. The latest revision, draft -21, is dated 17 March 2026.

Multipath QUIC inherits MPTCP's algorithmic ideas — subflows, coupled congestion control, packet scheduling across paths — but it operates inside QUIC's much more deployable carrier, UDP. Where MPTCP had to fight middleboxes that didn't understand TCP options, multipath QUIC encrypts everything except a handful of public bits inside the UDP envelope. Middleboxes see UDP. The multipath logic is invisible.

Apple, Alibaba, and Tessares have already deployed predecessors — gQUIC multipath at Google, Apple's iCloud sync, Alibaba's mobile e-commerce. Once multipath QUIC ships in the mainline implementations — quiche, mvfst, quinn, msquic — it becomes the natural multipath transport for HTTP/3.

MPTCP itself will remain in production for the use cases it currently serves. But the architectural arc — same idea, ported to a more deployable transport — is the same arc QUIC followed for everything else. That story picks up in the next chapter, on QUIC.

## The figures

### Multipath QUIC

draft-ietf-quic-multipath is in IETF Last Call as of late 2025 / early 2026, with the latest revision dated 17 March 2026. The protocol extends QUIC with multiple concurrent paths between endpoints, the same way MPTCP extended TCP, but built into QUIC's connection-ID architecture rather than bolted on as TCP options. The use cases are the obvious ones: aggregating Wi-Fi and cellular bandwidth on a phone, seamless network handover when the user changes interfaces, reaching a multi-homed server through whichever path is fastest. The 3GPP ATSSS standard for 5G already specifies both MPTCP and multipath QUIC for traffic steering between cellular and Wi-Fi. There is more on this in the Frontier section of the book.

### RFC 6824 — TCP Extensions for Multipath Operation with Multiple Addresses

Published January 2013 as Experimental, by Alan Ford, Costin Raiciu, Mark Handley, and Olivier Bonaventure. This was the original wire-format specification for MPTCP — the document Apple was implementing against when iOS 7 shipped nine months later. Obsoleted by RFC 8684.

### RFC 8684 — TCP Extensions for Multipath Operation with Multiple Addresses, version 1

Published March 2020 as Standards Track, by the original four authors plus Christoph Paasch from Apple. This is the current MPTCP specification, and the document the Linux 5.6 kernel implementation was upstreamed against the same month.

## What you'd see in the simulator

Press play and the simulator walks the multi-path TCP idea end to end. Your phone is connected to both Wi-Fi and cellular. A regular TCP socket opens to a server, but underneath, MPTCP is negotiating two subflows — one over the Wi-Fi interface, one over the cellular interface. Data is striped across both paths and reassembled at the other end into the single byte stream the application sees. Then the simulator drops the Wi-Fi link. The connection does not break. The cellular subflow keeps carrying data, and from the application's point of view nothing has changed. That is the entire pitch of MPTCP in one animation.

## What it taught the industry

Two lessons from MPTCP have stuck.

The first is that you can do clever things at the transport layer if — and only if — you preserve the existing socket API exactly. Every application written against TCP since 1981 keeps working over MPTCP without a single line of change. That is why Apple could deploy this to a billion devices without telling anyone.

The second is the harder one. Innovating inside TCP options means fighting every middlebox between you and the other endpoint. The same NAT and firewall ecosystem that kept SCTP off the public internet has kept MPTCP from becoming the default. The lesson the QUIC community took from this is that the next multipath transport had to live inside an encrypted UDP envelope, where middleboxes cannot see what they would otherwise want to mangle. That is why multipath QUIC, not MPTCP version 2, is what the next decade of multi-radio devices is going to run on.

## Listening order

- **Before this chapter:** "SCTP" — the previous attempt at multi-streaming, multi-homing transport, and the cautionary tale about NAT and firewall friction that MPTCP then walked into anyway.
- **After this chapter:** "QUIC" — the UDP-based transport that learned from MPTCP's deployment scars and is about to inherit the multipath idea in a more deployable carrier.

## Where to go deeper

- The TCP episode picks up the underlying mechanism — sequence numbers, the three-way handshake, and the congestion-control lineage from Tahoe and Reno through CUBIC to BBR — that MPTCP coordinates above the per-subflow layer.
- The Wi-Fi episode covers the radio side of the handoff that drove Apple to ship MPTCP in the first place — beacons, association, and the reality of moving between an access point and an LTE cell.
- The QUIC episode explains why a UDP-based encrypted transport is a better carrier for multipath than TCP options ever were, and why multipath QUIC is the next chapter of this story.
- The HTTP/3 episode covers the application-layer protocol that will inherit multipath QUIC once the draft lands.
- The SCTP episode is the other multi-homing transport in this part of the book — the one MPTCP's deployment story rhymes with.
- The Frontier section has the full multipath QUIC entry, with the IETF Last Call status and the 3GPP ATSSS pointer.

## Visual cues for image generation

- A phone with two parallel pipes — Wi-Fi and cellular — both feeding into a single TCP socket icon, with a kernel-level box labeled "MPTCP shim" doing the merging.
- A walking-out-of-the-house scene: at the doorway the Wi-Fi bar drops, cellular climbs, and a Siri speech bubble keeps streaming without interruption.
- A timeline with four pinned events — RFC 6824 January 2013, iOS 7 September 2013, RFC 8684 and Linux kernel 5.6 in March 2020, draft-ietf-quic-multipath in IETF Last Call late 2025 — laid along a single horizontal axis.
- Two stacks side by side: on the left, MPTCP options bolted onto the TCP header with a middlebox stripping them out; on the right, multipath QUIC tucked inside an opaque UDP envelope sliding past the same middlebox untouched.
- A Korea Telecom GIGA Path scene with a phone bonded to an LTE tower and a Wi-Fi access point at the same time, the speedometer reading one gigabit per second.
