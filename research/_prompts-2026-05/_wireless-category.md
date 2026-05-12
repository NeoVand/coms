===== CATEGORY · WIRELESS =====

# What I'm asking you to do

I'm putting together a deep educational resource on network protocols. The
research you produce will be reshaped into long-form articles, an interactive
encyclopedia (with hand-authored simulations, header diagrams, state machines,
and a graph of cross-links), a book, and a podcast series. The audience is
smart engineers — some new to networking, some experienced and looking for
serious depth.

What I need is a thorough, citation-backed research report. It should read
like the result of a focused weekend spent with the best papers, RFCs / IEEE
standards / 3GPP specs, books, engineering blog posts, conference talks, and
podcasts on this topic, all distilled into one document. Surface-level
"what is wireless" content already exists everywhere — what I need is depth,
story, current detail, and connections that aren't obvious from a Wikipedia
skim.

Specifically I'm interested in:

- The actual narrative — who, when, why, what they were trying to fix.
- The shape of the family as a whole — what are the unifying physics,
  unifying spec bodies (IEEE 802 vs Bluetooth SIG vs 3GPP vs NFC Forum
  vs Connectivity Standards Alliance), unifying design problems
  (shared medium, hidden terminal, interference, mobility, power).
- Where each member sits, what each is for, and what could plausibly
  join the family that I haven't asked you about.
- Real failures and famous incidents, named, with the dramatic detail.
- 2024–2026 developments — what's actively changing right now and how
  practice has shifted in the last 24 months.
- Resources someone could actually go learn from today, with the year
  each one was last updated.

**Today's date is 2026-05-12.** Prefer sources from 2024–2026 and explicitly
call out anything that has changed in the last 24 months. Treat older
sources as suspect and verify them against the current state. Define every
term you use — assume the reader is smart but new to this area.

**Sourcing discipline.** Cite every factual claim with a verifiable URL or
DOI. Do not fabricate citations. If a claim has no real source, mark it
`[needs source]` — but before doing that, attempt at least three search
variations including academic indices (Google Scholar, IEEE Xplore, ACM DL),
archive.org for older or dead links, and the relevant standards body
(IEEE-SA, Bluetooth SIG, 3GPP, NFC Forum, CSA, FiRa Consortium, Wi-Fi
Alliance, LoRa Alliance).

There is no length limit. Go deep.

# Where this fits in the encyclopedia

This research is for an interactive protocol-encyclopedia app
(neovand.github.io/coms) that already covers 51 protocols across 7
categories. The **Wireless** category currently has two members
([[wifi|Wi-Fi]] and [[bluetooth|Bluetooth]]) but is too sparse for the role
it plays in everyday life. Your job is to help me figure out who *else*
belongs in it, write the family-level narrative, and lay out the chapter
plan for the book.

Existing categories (do not duplicate work — give context only on how
Wireless interacts with these):

- **Network foundations** — Ethernet, ARP, IPv4, IPv6, BGP, ICMP, OSPF
- **Transport** — TCP, UDP, QUIC, SCTP, MPTCP
- **Web & API** — HTTP/1.1, HTTP/2, HTTP/3, WebSockets, gRPC, GraphQL, REST, JSON-RPC, MCP, A2A, SOAP, SSE
- **Asynchronous messaging & IoT** — MQTT, AMQP, CoAP, STOMP, XMPP, Kafka
- **Real-time audio/video** — WebRTC, RTP, SIP, HLS, RTMP, SDP, DASH
- **Utilities & security** — TLS, SSH, DNS, DHCP, NTP, SMTP, FTP, IMAP, OAuth 2.0, IPsec, NAT-traversal (STUN/TURN/ICE)

# Topic

The topic of this research is the **Wireless** category — the protocols that
move bits through the air. The current members are **[[wifi|Wi-Fi]]
(IEEE 802.11)** and **[[bluetooth|Bluetooth]] (Classic BR/EDR + BLE)**.

I want the bird's-eye view of this group as a coherent area of computing —
the narrative arc, the shared vocabulary, how the members relate to each
other, what unites them, and **what else belongs here**.

# Strongly-considered additions (verify and prioritise)

I'm planning to add these to the encyclopedia. Tell me which ones I should
actually prioritise, in what order, and which I might be wrong about:

  - **Cellular (4G LTE + 5G NR)** — 3GPP family. ~9 billion subscriptions
    worldwide; the largest wireless deployment on Earth. The 5G NR
    radio + the 4G/5G core (EPC / 5GC) are arguably one protocol or
    arguably twenty. Tell me how to scope a single encyclopedia node
    for this.
  - **NFC (Near Field Communication)** — ISO/IEC 18092, NFC Forum specs.
    Every contactless payment (Apple Pay, Google Wallet), every transit
    card, every car key fob. ~2 billion NFC-enabled devices.
  - **Zigbee** — IEEE 802.15.4 + Zigbee Alliance / CSA specs. The Philips
    Hue installed base; losing new-deployment share to Thread + Matter
    but still huge.
  - **Thread** — IEEE 802.15.4 + IPv6 (6LoWPAN). The radio layer under
    Matter; runs every modern smart-home device's mesh. (Note: this is
    being added separately as part of the Matter+Thread bundle prompt;
    please cross-reference rather than duplicate.)
  - **UWB (Ultra-Wideband)** — IEEE 802.15.4z. Sub-microsecond ranging
    for AirTag precision finding, Galaxy SmartTag+, CCC Digital Key 3.0.
    Pairs with [[bluetooth|BLE]] in the modern Apple/Android device-finding
    stack.
  - **LoRaWAN** — LPWAN for agriculture, smart cities, asset tracking;
    long-range (km), low-bitrate (kbps), unlicensed sub-GHz spectrum.

# Other candidates you should evaluate

Mention each, briefly, with a verdict on whether it belongs:

  - **Z-Wave** — competitor to Zigbee, ~150 million devices.
  - **NB-IoT / LTE-M** — 3GPP narrowband cellular variants for IoT.
  - **Satellite (Iridium, Starlink Direct-to-Cell, Apple Emergency SOS)**
    — increasingly mainstream in 2024–2026.
  - **GNSS (GPS / Galileo / GLONASS / BeiDou) + NMEA 0183**
    — positioning protocols.
  - **DECT / DECT NR+** — cordless phones; NR+ is the recent IETF-style
    rebirth.
  - **WirelessHART / ISA 100.11a** — industrial wireless.
  - **AM/FM, DAB+, DVB-T, ATSC 3.0** — broadcast wireless.
  - **RFID (passive)** — toll tags, inventory.
  - **IrDA** — historical infrared.
  - **MIMO / beamforming / OFDMA / MU-MIMO** — *techniques* not protocols;
    where do they live in the encyclopedia?

# Mandatory deliverables checklist

Before submitting, verify you have produced **at minimum**:

- [ ] A **definitive members list** — which protocols belong in this
      category, and why. Order by how much I should prioritise adding them.
- [ ] **≥4** dated entries on the wireless-family history timeline
      (1971 ALOHAnet → 2026 Wi-Fi 7 / Bluetooth 6.0 / 5G-Advanced).
- [ ] **≥4** narrative-section beats suitable for the encyclopedia's
      category-story page (StorySection union: narrative, timeline,
      pioneers, callout, diagram, image).
- [ ] **≥3** pioneer / key-contributor candidates not yet in the
      encyclopedia. (Already covered: Jaap Haartsen, Sven Mattisson,
      Jim Kardach, Vic Hayes.)
- [ ] **A spectrum map** — which protocol uses which band, why, and how
      they coexist (ISM 2.4 GHz, 5 GHz, 6 GHz, 60 GHz; sub-GHz 868/915
      MHz; UWB 6.0–8.5 GHz; LTE/5G FR1/FR2 mid-band, mmWave).
- [ ] **A power-vs-range-vs-bitrate scatterplot** in mermaid or table form,
      placing every wireless protocol on the three axes.
- [ ] **≥3** named failure incidents (Wi-Fi KRACK, FragAttacks; Bluetooth
      KNOB / BIAS / BLUFFS; cellular Diameter SS7 signalling fraud;
      Starlink jamming reports; etc.).
- [ ] **≥5** dated 2024–2026 "recent changes" entries with sources.
- [ ] **≥1** 2025–2026 frontier development per member protocol you
      recommend.
- [ ] **A book-chapter plan** — how should the Wireless section of the
      encyclopedia book be structured? Propose:
      - Part / volume placement relative to other parts (Network
        Foundations is Part II–III; Wireless might be Part IV?)
      - Chapter list with 1-sentence summaries
      - Which chapters use simulation / diagram / pioneer-card content
      - How long the section should be (rough wordcount)
- [ ] **An adjacency map** — explicit cross-links the Wireless category
      should make to other categories (e.g. Wireless ↔ Network Foundations
      via Ethernet, Wireless ↔ Utilities via TLS over Wi-Fi, Wireless ↔
      Async/IoT via MQTT-over-Wi-Fi-or-LoRaWAN).
- [ ] **Citations** — full URLs/DOIs, numbered, no fabrications.

# How to structure the report

Use these section headings in this order.

## Prerequisites and glossary

Concepts that span this whole group of protocols. What does a reader need
to understand before any of the members make sense? Spectrum / band /
licensed-vs-unlicensed; modulation (OOK, FSK, QAM, OFDM, GFSK); MAC layer
techniques (CSMA/CA, TDMA, FDMA, OFDMA, frequency hopping); MIMO and
beamforming; shared-medium problems (hidden node, exposed node);
mobility and handoff; power-vs-throughput-vs-range as a design triangle.

## The arc of the wireless family

When did wireless networking emerge as a coherent thing? ALOHAnet, the
ARPA SATNET, the 1980s ISM-band liberation, the 1990s Wi-Fi/Bluetooth/
GSM trio, the 2010s smartphone explosion, the 2020s LE Audio / Matter /
5G-Advanced era. Who were the architects of the field — not just the
individual protocols, but the *family*. Historical narrative.

## Definitive members list

Authoritative list of who belongs in this category and why. For each:
- A one-sentence "what it is"
- Frequency band(s) and spectrum-licensing status
- Typical range, throughput, power-budget
- The standards body and primary spec
- The 2024–2026 milestone
- Priority rank (1 = add first, 5 = add later, 9 = don't add)

## Internal taxonomy — how to mentally cluster the members

What are the meaningful axes? Cellular (licensed, carrier-operated) vs
ISM (unlicensed, end-user-operated) vs sub-GHz LPWAN (unlicensed,
network-operator-mediated). Personal-area vs local-area vs wide-area.
Carrier-grade vs consumer vs industrial. Provide a decision-tree or
matrix that helps an engineer choose between members.

## Spectrum and coexistence

Where does each member live in the radio spectrum? Walk the 2.4 GHz ISM
crowding story (Wi-Fi b/g/n + Bluetooth + Zigbee + microwave oven leakage
+ baby monitors). Walk the 6 GHz expansion (Wi-Fi 6E/7, US FCC versus
EU). Walk the 60 GHz Wi-Gig story. Walk UWB at 6–8.5 GHz. Walk the
sub-GHz LPWAN story (868 MHz in EU, 915 MHz in US). Walk the cellular
spectrum auctions and FR1/FR2 split. Diagram(s) or table(s).

## How this group interacts with other categories

How does Wireless interact with Network Foundations (the IP/Ethernet
boundary at the access point; the cellular core's translation to IP),
Transport (TCP behaviour over lossy wireless links — fast retransmit,
spurious retransmits), Utilities & Security (TLS for application
security on top of wireless link security; 802.1X EAP for enterprise
Wi-Fi auth), Real-time AV (Wi-Fi calling, VoLTE, latency-sensitive
codecs), Async/IoT (MQTT-over-LTE, CoAP-over-Thread, the LPWAN gateway
pattern)?

## Common patterns and failure modes

Design patterns that recur across the family — frequency hopping,
backoff, packet acknowledgement, fast / slow PHY rates, rate adaptation,
roaming. Failure modes that are family-wide rather than protocol-specific
— hidden node, near-far, intermodulation, jamming, the 2.4 GHz crowding
death spiral.

## Industry timeline

When was each member hot? What replaced what? What's currently in
active development in 2024–2026? Who is doing the pushing — IEEE 802
working groups, 3GPP releases, the Bluetooth SIG, the NFC Forum, the
Connectivity Standards Alliance, the FiRa Consortium?

## Pioneers across the family

For each notable person who shaped wireless networking *as a field*:
name, years, primary affiliation, contribution (1–2 paragraphs),
quotable lines with sources. **Already covered in the encyclopedia**
(don't duplicate): Vic Hayes (Wi-Fi), Jaap Haartsen / Sven Mattisson
/ Jim Kardach (Bluetooth). Add anyone else who deserves a card —
Norman Abramson (ALOHAnet), the Marconi-era contributors via citation,
Andrew Viterbi (Qualcomm / CDMA), Irwin Jacobs (Qualcomm), Edholm of
Edholm's Law, etc.

## Recommended learning paths (current as of 2026)

For someone studying this whole family of protocols, what's the best
order to learn the members? What books, courses, talks, and labs cover
wireless broadly rather than one protocol at a time? Resources with
URL, level (intro/intermediate/advanced), and year last updated.

## Where things are heading (2025–2026 frontier)

The major frontiers across the family:
- Post-quantum crypto in wireless (WPA3-PQ drafts, BLE security)
- AI-assisted RAN (open-RAN, AI-defined radio)
- Wi-Fi 8 (Ultra High Reliability), 6 GHz adoption
- LE Audio Auracast deployments
- Starlink Direct-to-Cell, AST SpaceMobile, Apple Globalstar
- UWB regulatory rollout in EU vs FCC
- 5G-Advanced (Release 18, 19) → 6G (2030 target)
- Matter / Thread cross-vendor interop (Matter 1.5)
- Spectrum policy: the 6 GHz fight, the L-band vs GPS fight (Ligado)

## Hooks for the article, infographic, and podcast

End the report with a few short fragments — each should be one to three
sentences and stand on its own.

- A 60-second narrated hook for the wireless story
- A striking statistic (e.g. "5G is now 60% of all internet traffic")
- A "pause and think" moment
- A failure-story arc

## Book-chapter plan

How should this category be presented in the encyclopedia's embedded
book? Propose:
- Where the Wireless section sits relative to existing parts
  (currently the book has Part III chapter on Wi-Fi and Part XI on
  Wi-Fi 7/8 — these likely consolidate into a new Wireless part).
- Numbered chapter list with one-sentence summaries.
- Per-chapter content type tags (simulation, diagram, pioneer card,
  callout).
- Rough chapter word counts and total section length.
- Which existing chapters should be moved / merged / deleted.

## Citations

Full URLs (and DOIs where applicable) for every factual claim above,
numbered in order of appearance. Do not fabricate citations.

==========
