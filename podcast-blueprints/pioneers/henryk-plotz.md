---
id: henryk-plotz
type: pioneer
name: Henryk Plötz
years: "c. 1980–"
title: "Chaos Computer Club hardware security researcher; co-author of the MIFARE Classic break"
org: "Chaos Computer Club, Humboldt University of Berlin"
podcast_target_minutes: 6
protocols: [nfc]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: "Henryk Plötz at a Chaos Communication Congress lectern"
  credit: ""
visual_cues:
  - "A Berlin lecture hall on 28 December 2007, two researchers at a podium under a CCC logo, projected slide reading 'Mifare Little Security, Despite Obscurity'"
  - "A decapped MIFARE Classic chip die under an optical microscope, gate-level structures visible, annotation arrows pointing at the Crypto1 LFSR cells"
  - "A contactless transit card held against a 13.56 MHz reader, faint coil traces highlighted to show inductive coupling"
---

# Henryk Plötz

## In one sentence
Henryk Plötz is the Chaos Computer Club researcher who, with Karsten Nohl and Starbug at the 24th Chaos Communication Congress in December 2007, peeled open a MIFARE Classic chip, recovered its proprietary Crypto1 cipher from the silicon, and broke it in public — ending an era in which the world's transit and access cards leaned on a secret algorithm.

## The hook (cold-open)
On the 28th of December 2007, in a Berlin lecture hall, three researchers stood up in front of the Chaos Communication Congress and showed photographs of a MIFARE Classic chip with its top layers ground away. They had traced the gates by hand, identified the registers of the Crypto1 stream cipher, and reconstructed an algorithm whose security had rested on no one being allowed to see it. By the end of the talk, a billion deployed contactless cards — the cards in transit systems, office doors, and student IDs across Europe — were on notice. One of those three researchers was Henryk Plötz.

## The work

### The 24C3 MIFARE Classic dismantlement (2007)
Plötz co-presented the talk that the community now files under the title "Mifare Little Security, Despite Obscurity," together with Karsten Nohl — there's a separate episode on him — and the CCC researcher known as Starbug. The work combined two disciplines that rarely sit in the same room: hardware reverse engineering of a commercial silicon die, and cryptanalysis of the cipher that the gates implemented. They decapped the chip, photographed the layers, identified the Crypto1 logic by inspection, and demonstrated that the proprietary 48-bit stream cipher was weak enough to attack with modest resources.

The protocol layer underneath all of this is the one we cover in the NFC episode — the 13.56-megahertz inductively-coupled card-and-reader family that includes MIFARE. Plötz's contribution is not the radio link; it is the proof that a closed cipher sitting on top of that radio link could be lifted off the silicon by a small team in a year.

### Aftermath and academic work
After 24C3, Plötz continued at Humboldt University of Berlin on RFID and NFC security, and on lattice and side-channel attacks against embedded systems. The 24C3 recording itself became one of the most-watched Chaos Computer Club lectures — the canonical artifact people point to when they want to show, in one sitting, how security-by-obscurity dies once the silicon is in attackers' hands.

## See also (other pioneer episodes)
Karsten Nohl is the obvious companion episode — he co-presented the 24C3 talk and went on to build a career around exactly this kind of public dismantlement of deployed wireless protocols, from GSM A5/1 to baseband firmware. If you listen to the Plötz episode, listen to the Nohl episode next; the two careers branch from the same lecture hall on the same December afternoon.

For the protocol context, the NFC episode is the place to go for how 13.56-megahertz contactless cards actually work — the inductive coupling, the framing, the card families above the radio layer — so that the meaning of "they broke MIFARE Classic" lands with the right weight.

## Sources

### Talks and recordings
- [24C3: Mifare — Little Security, Despite Obscurity (CCC media archive)](https://media.ccc.de/v/24c3-2378-en-mifare_security)

### Homepage
- [Henryk Plötz — Humboldt University of Berlin](https://www2.informatik.hu-berlin.de/~ploetz/)
