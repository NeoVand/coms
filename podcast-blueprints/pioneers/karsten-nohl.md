---
id: karsten-nohl
type: pioneer
name: Karsten Nohl
years: "c. 1981–"
title: "Cryptographer who broke MIFARE Classic Crypto1"
org: "University of Virginia (PhD), Security Research Labs (SRLabs), Berlin"
podcast_target_minutes: 8
protocols: [nfc]
categories: []
related_book_chapters:
  - wireless/nfc
awards: []
image:
  src: null
  alt: "Portrait of Karsten Nohl, German cryptographer and SRLabs founder"
  credit: ""
visual_cues:
  - "Portrait of a German cryptographer in his late twenties at a Chaos Communication Congress lectern in December 2007, projected slide behind him reading 'MIFARE — Little Security, Despite Obscurity'"
  - "An optical-microscope mosaic of a decapped MIFARE Classic die, roughly ten thousand gates visible, a small overlay highlighting the ten percent of gates that implement the Crypto1 stream cipher"
  - "A Berlin office labelled SRLabs, a workbench with a logic analyser, a SIM card under a probe, and a stack of contactless transit cards from Amsterdam, London, and Boston"
  - "Split panel: on the left, a 16-bit linear-feedback shift register diagram for the Crypto1 PRNG; on the right, a free-running power-up counter feeding its seed, arrow labelled 'predictable'"
---

# Karsten Nohl

## In one sentence
Karsten Nohl is the German cryptographer who, with two collaborators at the Chaos Computer Club in December 2007, decapped a MIFARE Classic chip, photographed its gates under an optical microscope, reverse-engineered the secret Crypto1 stream cipher off the silicon, and ended security-by-obscurity for roughly a billion contactless cards already in pockets across Europe and North America.

## The hook (cold-open)
On the 28th of December 2007, in a Berlin lecture hall at the 24th Chaos Communication Congress, Nohl stood up with Henryk Plötz and the CCC researcher known as Starbug and walked the audience through photographs of a MIFARE Classic chip with its top layers ground away. They had imaged about ten thousand gates with an optical microscope, noticed that only about seventy unique gate types were used, and isolated the ten percent of the die that implemented Crypto1 — a 48-bit stream cipher whose entire security argument had been that nobody outside NXP was supposed to see it. By the end of the talk, the cipher was on slides. The Dutch OV-chipkaart, the London Oyster card, the Boston Charlie Card, and a generation of hotel-key, office-badge, and university-canteen systems all sat on top of a broken algorithm, and everyone in the room knew it.

## The work

### The 24C3 MIFARE Classic dismantlement (2007)
The talk was titled "MIFARE — Little Security, Despite Obscurity," and Nohl was one of three presenters. The method combined two disciplines that rarely sit in the same room. On the hardware side: decap the chip, photograph the metal layers, and read the logic by inspection. On the cryptanalytic side: take the small set of gate types that turn up over and over on the die, recognise the stream-cipher structure they form, and reconstruct the algorithm. They also flagged a second weakness — a 16-bit pseudo-random number generator seeded from a free-running power-up counter, which made the nonces predictable enough to attack in practice.

The protocol layer underneath all of this is the one the NFC episode covers in detail — the 13.56-megahertz inductively-coupled card-and-reader family, with MIFARE as the dominant card line above it. Nohl's contribution is not the radio. It is the proof that a closed cipher sitting on top of that radio could be lifted off the silicon by a small team in a year, and that "you cannot inspect the algorithm" is not a security property.

### The USENIX paper (2008)
The follow-on academic write-up, *Reverse-Engineering a Cryptographic RFID Tag*, appeared at USENIX Security 2008 and is the canonical citation for the work. The paper is the artefact people now point at when they want a single reference for how the MIFARE Classic break was done — the optical-microscope methodology, the gate inventory, the Crypto1 reconstruction, and the PRNG observation in one place. It is also the reason the story sits in security curricula a decade and a half later as the textbook example of why open peer review of cryptographic primitives is not optional.

### SRLabs and the second act
After the MIFARE work, Nohl founded Security Research Labs — SRLabs — in Berlin, and the lab became the vehicle for a long sequence of public dismantlements of deployed wireless and telecom infrastructure: SIM-card cloning, attacks on the SS7 signalling network that underpins international telephony, and contactless banking-app analyses, among others. The shape of the career is consistent: take a system that the industry treats as opaque, pull it apart in public, and publish enough that the deployment can no longer pretend the weakness is theoretical.

## Where they appear in the book
- Part "Wireless," chapter on NFC — the four-centimetre wireless that runs the global payment rails. The MIFARE Classic break is the cautionary half of the chapter: a worked example of what happens when a billion-card deployment leans on a secret algorithm and the secret does not hold.

## See also (other pioneer episodes)
The obvious companion is Henryk Plötz, who co-presented the 24C3 talk with Nohl and went on to continue RFID and NFC security work at Humboldt University of Berlin — the two episodes are designed to be listened to together. For the constructive side of the same protocol family, the Franz Amtmann episode covers the NXP engineer who led the physical-layer and MIFARE silicon work that put the cards into the world in the first place. For the protocol mechanism — the 13.56-megahertz coupling, the operating modes, the payment and transit deployments — the next thing to play is the NFC episode.

## Visual cues for image generation
- Portrait, late twenties, at a Chaos Communication Congress lectern in December 2007, projected slide reading "MIFARE — Little Security, Despite Obscurity."
- Optical-microscope mosaic of a decapped MIFARE Classic die, roughly ten thousand gates visible, ten percent of the gates highlighted as the Crypto1 region.
- A Berlin SRLabs workbench: logic analyser, SIM card under a probe, a stack of contactless transit cards from Amsterdam, London, and Boston.
- Split panel: a 16-bit LFSR diagram for the Crypto1 PRNG on the left, a free-running power-up counter feeding its seed on the right, arrow labelled "predictable."

## Sources

**Papers**
- [Reverse-Engineering a Cryptographic RFID Tag — USENIX Security 2008](https://www.usenix.org/legacy/event/sec08/tech/full_papers/nohl/nohl.pdf)

**Talks and recordings**
- [24C3: MIFARE — Little Security, Despite Obscurity (CCC media archive)](https://media.ccc.de/v/24c3-2378-en-mifare_security)

**Wikipedia**
- [Karsten Nohl — Wikipedia](https://en.wikipedia.org/wiki/Karsten_Nohl)

**Homepage**
- [Security Research Labs (SRLabs)](https://srlabs.de/)
