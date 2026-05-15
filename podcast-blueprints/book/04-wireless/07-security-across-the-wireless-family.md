---
id: security-across-the-wireless-family
type: chapter
part_id: wireless
part_label: V
part_title: Wireless
title: Security across the wireless family
synopsis: KRACK, BLUFFS, KNOB/BIAS, FragAttacks, SS7 / Diameter abuse, MIFARE Crypto1, the 2022 Tesla BLE relay, and the Ghost Peak UWB STS attack — one chapter tying the wireless attack lineage together.
podcast_target_minutes: 12
position_in_book: 37 of 84
listening_order:
  prev: wireless/zigbee
  next: wireless/spectrum-and-the-frontier
related_protocols: []
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
images: []
visual_cues:
  - "A family tree of wireless attacks: KRACK and FragAttacks branching from Wi-Fi, BLUFFS and KNOB/BIAS branching from Bluetooth, SS7 and Diameter abuse branching from Cellular, MIFARE Crypto1 from NFC, the Tesla BLE relay sitting on its own twig, and Ghost Peak branching from UWB. Each labelled with the year it broke."
  - "A side-by-side timeline 2008 to 2022 marking each disclosure on a horizontal axis: Crypto1 cracked, KNOB, KRACK, BIAS, FragAttacks, BLUFFS, the Tesla relay, Ghost Peak. Wi-Fi cluster on top, Bluetooth in the middle, NFC and UWB on the bottom."
  - "A relay-attack diagram: a parked Tesla, a phone near the owner inside a building, and two attacker radios bridging the Bluetooth Low Energy link across hundreds of metres. Arrows showing the round-trip relay path."
  - "A stylised reused-keystream picture for KRACK: the same nonce labelled twice over two encrypted frames, with the XOR of the two ciphertexts revealing the plaintext underneath."
  - "An SS7 signalling diagram with a benign carrier on the left and a hostile peer on the right, both speaking the same protocol into the global signalling backbone — the trust model the wireless family inherited from the 1980s."
---

# Part V, Chapter — Security across the wireless family

## The hook

Every wireless link in your life has been broken at least once, in public, by name. Wi-Fi has KRACK and FragAttacks. Bluetooth has KNOB, BIAS, and BLUFFS. Cellular has SS7 and Diameter abuse. NFC has the MIFARE Crypto1 break. Even ultra-wideband — the newest of them — already has Ghost Peak. And in 2022, a Tesla unlocked itself across a Bluetooth Low Energy relay. This chapter is about the lineage that connects all of those incidents.

## The story

The previous six chapters of Part V each took one wireless family and walked through how it works — the shared medium itself, then Wi-Fi, then Bluetooth, then cellular, then NFC, then UWB, then the Zigbee–Thread–Matter mesh world. This chapter pulls back and asks the question the listener has probably been asking the whole way through: *how secure is any of this, really?*

The honest answer is that every one of those families has been broken in public, by named researchers, in attacks that have stuck around long enough to earn nicknames. Engineering a wireless protocol means accepting that the medium itself is open — anyone with a radio inside the cell can listen. Confidentiality, integrity, and authentication are bolted on top in software and silicon. And every bolt-on layer in the wireless family has been pried off at least once.

Mechanism for each of these attacks lives in the protocol episode where it actually bites. We will name the attack and point you there. The job of this chapter is the lineage.

### Wi-Fi — KRACK and FragAttacks

Wi-Fi's two big public bruises are KRACK and FragAttacks. KRACK — the Key Reinstallation Attack — broke the WPA2 four-way handshake by forcing nonce reuse, which collapses the encryption guarantees of any stream cipher. FragAttacks attacked Wi-Fi fragmentation and aggregation, a much older corner of the standard. How either of them works frame-by-frame is in the Wi-Fi episode.

### Bluetooth — KNOB, BIAS, and BLUFFS

Bluetooth's lineage is KNOB, BIAS, and BLUFFS, in that order. KNOB — the Key Negotiation of Bluetooth attack — talked the link down to a one-byte encryption key. BIAS attacked the secure connections handshake itself. BLUFFS, the most recent of the three, attacked forward secrecy in the session-key derivation. Three different parts of the same standard, three different breaks. The Bluetooth episode walks through the pairing and session model these attacks targeted.

### Cellular — SS7 and Diameter

Cellular's exposure is structural and older than the others. SS7 — the signalling network behind 2G and 3G — was designed in the 1980s for a closed club of national carriers, and the trust model never really got rewritten when the club got bigger. Diameter, its 4G replacement, inherited the same posture. Both protocols have been used in the wild for SMS interception, location lookup, and call redirection. The cellular episode covers what these signalling networks actually do.

### NFC — MIFARE Crypto1

NFC's most famous break is MIFARE Crypto1 — a proprietary stream cipher used in a generation of transit, access-control, and payment cards. Researchers reverse-engineered the cipher from silicon and showed it could be cracked in seconds on commodity hardware. Cards that were everywhere in the 2000s became cloneable. The NFC episode covers the card families and the migration path that followed.

### Bluetooth Low Energy — the 2022 Tesla relay

In 2022 a Bluetooth Low Energy relay attack unlocked and started a Tesla. The owner's phone was nowhere near the car. Two attacker radios bridged the BLE link across enough distance to convince the car that the phone was in proximity. Relay attacks are not specific to BLE — the technique generalises to any "if it's nearby, trust it" protocol — but the Tesla incident was the moment the consumer-product version of the problem went mainstream.

### UWB — Ghost Peak

Ultra-wideband is the newest entrant in the wireless family and it was supposed to *fix* relay attacks by measuring distance with picosecond-level timing. Ghost Peak attacked UWB's Scrambled Timestamp Sequence — the cryptographic nonce that protects the ranging exchange — and showed that distance-bounding is only as strong as the nonce protecting it. The UWB episode covers STS and what's being done about it.

### What ties the lineage together

Across Wi-Fi, Bluetooth, cellular, NFC, and UWB, the breaks rhyme. Sometimes the cipher is too weak — Crypto1, KNOB-downgraded keys. Sometimes the handshake reuses a nonce — KRACK. Sometimes the trust boundary is wrong for the modern world — SS7, Diameter, the Tesla relay. Sometimes the new protocol's distance-bounding nonce is itself the weak point — Ghost Peak. The mechanisms differ. The pattern — *bolted-on security on an open medium, attacked at the seam* — is the same one each time.

## Listening order

- **Before this chapter:** *"Zigbee, Thread, and the Matter bridge"* — the last of the per-family chapters, on the low-power mesh world that finally agreed on an application layer.
- **After this chapter:** *"Spectrum, regulation, and what comes next"* — Part V closes by stepping up from the protocols to the spectrum they all share and the regulators who hand it out.

## Where to go deeper

- The Wi-Fi episode picks up KRACK and FragAttacks at the frame level — the four-way handshake, fragmentation, aggregation.
- The Bluetooth episode walks the pairing and session-key derivation that KNOB, BIAS, and BLUFFS each attacked.
- The cellular episode covers SS7 and Diameter as protocols, including what they were designed to do and why their trust model is structural.
- The NFC episode covers the MIFARE families and the migration off Crypto1.
- The UWB episode covers Scrambled Timestamp Sequence ranging and the Ghost Peak disclosure.

## Visual cues for image generation

- A family tree of wireless attacks with each break labelled by year and attached to its protocol branch.
- A 2008–2022 timeline of named wireless disclosures, clustered by family.
- A relay-attack diagram for the 2022 Tesla incident showing the two attacker radios bridging a BLE link across distance.
- A nonce-reuse picture for KRACK showing two ciphertexts XORed under the same keystream.
- An SS7 signalling diagram showing a hostile peer speaking the same protocol as a benign carrier into the shared signalling backbone.
