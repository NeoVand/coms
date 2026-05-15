---
id: mobile-and-bufferbloat
type: chapter
part_id: story-of-the-internet
part_label: II
part_title: The Story of the Internet
title: The Mobile and Bufferbloat Decade
synopsis: 3G, 4G, the iPhone, and why your home internet is laggy under load.
podcast_target_minutes: 15
position_in_book: 15 of 84
listening_order:
  prev: story-of-the-internet/the-web-arrives
  next: story-of-the-internet/the-quic-redesign
related_protocols: [wifi, tcp, quic]
related_pioneers: []
related_outages: []
related_frontier: [l4s-comcast-launch]
related_rfcs: []
images: []
visual_cues:
  - "A split screen: 2007 desktop with a wired Ethernet jack on the left, a 2007 iPhone with a Wi-Fi and EDGE radio on the right. Above each, an arrow into the same cloud."
  - "A throughput graph for a single mobile user — bandwidth swinging 10x in seconds as the phone is rotated 90 degrees, walked around a wall, handed off between cell towers."
  - "A cross-section of a home cable modem with a multi-megabyte buffer drawn as a giant balloon, a tiny pipe leaving the right side, and a label 'one second of latency at 1 Mbps upload'."
  - "A timeline from 2010 to 2025: Gettys names bufferbloat, RFC 8290 CoDel, RFC 8033 PIE, fq_codel ships in OpenWrt, RFC 9330 L4S, January 2025 Comcast launches L4S in six cities."
  - "An L4S DualQ Coupled AQM diagram: two queues at a router — a classic queue and an L4S queue — with the L4S queue marking ECN bits instead of dropping packets, and a cloud-gaming session and a bulk download sharing the link without interfering."
---

# Part II, Chapter — The Mobile and Bufferbloat Decade

## The hook

In June 2007, the iPhone shipped with a Wi-Fi radio and an EDGE cellular modem. Within a decade, mobile traffic dwarfed the wired internet almost everywhere on Earth. And for fifteen of those years, two quiet pathologies of the new mobile network broke assumptions Van Jacobson had baked into TCP back in 1988. The first was that bandwidth on the last mile would be roughly stable. The second was that buffers in the network would be small. Neither was true anymore. Your video call stuttered because someone in the next room started a download — and the fix took until 2025 to reach a residential ISP.

## The story

### When the Network Got Personal

The iPhone shipped in June 2007 with a Wi-Fi radio and EDGE cellular. The App Store followed in 2008. LTE arrived in 2010. By the middle of the decade, more bytes flowed over radios than over wires in most of the world. The internet had stopped being a thing you logged into from a desktop and become a thing in your pocket.

That shift broke two assumptions buried inside TCP's congestion control. The first assumption was that the bottleneck bandwidth on the last mile was roughly steady. On a wired connection it had been. On a phone, it wasn't. A user turning ninety degrees could change throughput by ten times. Walking around a wall, riding an elevator, handing off between cell towers — every one of these moved the bandwidth ceiling up or down by an order of magnitude in seconds. TCP's loop, designed by Van Jacobson on the assumption of a stable pipe, was now riding a sea state.

The second assumption was about buffers in the network. By the late 2000s, memory had become spectacularly cheap. Router and home-modem vendors started shipping multi-megabyte queues, ostensibly to absorb traffic bursts, actually to make their devices look less lossy in benchmarks. The trouble was that TCP — the version Jacobson shipped in 1988 and that the TCP episode unpacks in detail — needed packet loss as the signal to slow down. A queue that held seconds of data hid that signal. The sender kept piling on. The queue kept filling. The acknowledgements kept arriving late. Latency on a residential cable link could climb past a full second under load while the sender saw a perfectly clean throughput curve. That pathology has a name now: **bufferbloat**. Jim Gettys, working at Bell Labs, coined it in 2010 after measuring 1.2-second latencies on his home connection.

### The Two Pathologies, Together

The two assumptions failed at the same time, and they reinforced each other. Mobile carriers built their base stations with the same instinct as the home-router vendors — bigger queues, fewer drops, prettier marketing slides. So a 4G phone walking from one cell to another could be facing both a moving bandwidth ceiling and a several-hundred-millisecond queue at the base station. Classic loss-based TCP — the Tahoe, Reno, NewReno, CUBIC family — was designed around a network whose queues were measured in tens of packets, not megabytes, and whose bandwidth held still long enough for the sender to learn it. By 2012, that network no longer existed for most users.

The visible symptom was something every household recognised. Your video call stuttered because someone in the next room started a download. Your SSH session lagged because Dropbox was syncing. The cause was always the same: a fat upstream queue at the cable modem, full of bulk traffic, with the latency-sensitive packets stuck behind it.

### The Fifteen-Year Fix

The fix took the rest of the decade and most of the next one. It came in three layers, each pushing the problem further out from where it started.

The first layer was **active queue management** — algorithms that drop or mark packets *before* the queue fills, so that senders see the congestion signal in time to react. CoDel and FQ-CoDel — Controlled Delay and Fair Queueing CoDel — came out of work by Kathie Nichols and Van Jacobson and shipped in OpenWrt and Linux. PIE — Proportional Integral controller Enhanced — came from CableLabs and shipped in DOCSIS modems. The Internet Engineering Task Force standardised CoDel as RFC 8290 and PIE as RFC 8033. Smart Queue Management firmware — SQM — gave home users a way to enable these on routers like the ones from Ubiquiti and the OpenWrt project.

The second layer was **explicit signalling**. The Explicit Congestion Notification bits — IP and TCP flags from RFC 3168 — let routers signal congestion by marking packets instead of dropping them. Senders could slow down without losing data. ECN sat in the standards for years before it saw real deployment, mostly because broken middleboxes would flip the bits and confuse endpoints. The mobile and bufferbloat decade is what finally made it worth turning on.

The third layer was **a different transport entirely**. Once QUIC moved into user space — which is the whole story of the next chapter and the QUIC episode — applications got fine-grained control over their own pacing instead of inheriting the kernel's ossified TCP stack. Pacing means spreading outgoing packets evenly over time instead of sending them in a burst, and Google's BBR algorithm, which has been the default for google.com and YouTube since 2023, paces every send to the estimated bottleneck bandwidth. That avoids triggering AQM drops in the first place. The TCP episode covers BBR's bandwidth-and-RTT model in detail; the QUIC episode covers what shipping a transport in user space actually buys you.

### The Last Step: L4S in Production

The endpoint of the story is a piece of infrastructure that most people will never notice. In late January 2025, Comcast launched L4S — Low Latency, Low Loss, Scalable throughput — in production in six U.S. cities: Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville, and San Francisco. Apple, NVIDIA GeForce NOW, Meta, and Valve were the launch partners. The full story sits in the L4S launch entry on the Frontier page, and the three RFCs that define it — 9330, 9331, and 9332 — were published in January 2023.

What makes L4S the natural ending of the bufferbloat decade is the architecture. Cooperating senders mark their packets ECN-Capable. Routers run a DualQ Coupled AQM — two queues, one for classic loss-based TCP, one for L4S-aware traffic — and mark instead of dropping when congestion is starting to build. Senders react to the marks like minor losses, without backing off as hard as classic TCP would. The result is sub-millisecond queuing latency for cloud gaming, video calls, and other latency-sensitive flows, sharing the same link as bulk downloads, without either side starving the other. Apple shipped L4S support in iOS 17, iPadOS 17, macOS Sonoma, and tvOS 17 back in 2023, on by default for QUIC in newer releases. So the residential ISP turned on the routers, and the iPhones in the house were already speaking the dialect.

That's the arc. Wireless and oversized buffers broke an assumption Jacobson had baked into TCP in 1988. The fix took fifteen years, three layers, two protocol redesigns, and a coordinated launch by an ISP and four launch partners on a Tuesday in January 2025.

## The figures

### L4S Launches in Production at Comcast

In late January 2025, Comcast turned on L4S — Low Latency, Low Loss, Scalable throughput — for residential customers in Atlanta, Chicago, Colorado Springs, Philadelphia, Rockville, and San Francisco, with Apple, NVIDIA GeForce NOW, Meta, and Valve as launch partners. The mechanism — DualQ Coupled AQM, ECN marking instead of dropping, senders that react to marks without halving their window — delivers sub-millisecond queuing latency to latency-sensitive flows on the same link as bulk downloads. RFCs 9330, 9331, and 9332 had specified the architecture in January 2023; Apple had shipped support in iOS 17 and macOS Sonoma the same year. The Frontier entry on the L4S launch has the full deployment timeline.

## What it taught the industry

Three lessons came out of the bufferbloat decade and are now part of how transport engineers think.

**Bufferbloat is the canonical example of well-meaning engineering creating a network-wide pathology.** Adding more buffer seemed obviously good — bursts wouldn't cause loss. But TCP's congestion-control loop *needed* loss as its signal. A whole industry's worth of router and modem vendors did the locally sensible thing, and the global result was a slower internet for fifteen years. The fix was structural: push buffers back down, and add explicit signalling — ECN — so the network could tell senders to slow down without throwing data away.

**Loss is a bad signal on a wireless link.** A dropped packet on a wire almost always means congestion. A dropped packet on a 4G or Wi-Fi link might just mean someone closed a door. Classic TCP treats both the same way and halves its window for both. BBR, which the TCP episode covers, was Google's response — model the path's bottleneck bandwidth and round-trip time directly, instead of waiting for loss. The wireless decade is what made that worth building.

**Pacing matters as much as windowing.** The old mental model said TCP's job was to pick the right window size. The new mental model says it also has to spread the packets out evenly so it doesn't slam the buffer. Linux pacing lives in the FQ qdisc, BBR depends on it, and QUIC implementations bake pacing in by default. The kernel-vs-user-space part of that story is the QUIC episode's job; what matters here is that the bufferbloat decade made pacing non-optional.

## Listening order

- **Before this chapter:** *The Web Is Built On Top* — the chapter that puts HTTP and the browser on top of the existing TCP stack and sets the stage for a billion users discovering that stack from a phone.
- **After this chapter:** *The QUIC Redesign* — once mobile and bufferbloat have shown how badly kernel TCP fits the modern internet, Jim Roskind's team at Google starts building a replacement transport in user space on top of UDP.

## Where to go deeper

- **The Wi-Fi episode** picks up the wireless side of this chapter — CSMA/CA instead of Ethernet's CSMA/CD, the hidden-node problem, RTS/CTS, the per-frame ACKs, and the generation-by-generation evolution from 2 Mbps in 1997 to 46 Gbps in Wi-Fi 7.
- **The TCP episode** is the mechanism counterpart to this chapter's narrative — slow start, AIMD, CUBIC as the Linux default, BBRv3 as Google's default since 2023, and the loss-based assumptions that the bufferbloat decade exposed.
- **The QUIC episode** is what comes next architecturally — UDP-based transport, fused TLS handshake, per-stream loss recovery, pacing baked in, the user-space release valve for everything that the kernel-bound TCP stack could no longer evolve fast enough to fix.
