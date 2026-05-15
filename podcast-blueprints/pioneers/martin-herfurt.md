---
id: martin-herfurt
type: pioneer
name: Martin Herfurt
years: ""
title: "Founder of Trifinite; Bluetooth and NFC security researcher"
org: "Trifinite Group (Austria)"
podcast_target_minutes: 6
protocols: [bluetooth, nfc]
categories: []
related_book_chapters: []
awards: []
image:
  src: null
  alt: "Martin Herfurt at a security conference lectern"
  credit: ""
visual_cues:
  - "An Austrian security researcher in front of a Tesla Model 3, a phone in one hand running TeslaKee and an NFC keycard in the other, an on-screen stopwatch reading 02:10 to evoke the 130-second window"
  - "Split composition: on the left, the legitimate driver tapping an NFC keycard against the Tesla's B-pillar; on the right, a second phone enrolling itself as a new key over BLE before the 130-second timer expires"
  - "A whiteboard sketch of the CCC Digital Key 3.0 anti-relay timing-bound check, captioned 'the rule that exists because of the Trifinite disclosure'"
---

# Martin Herfurt

## In one sentence
Martin Herfurt is the Austrian security researcher who founded the Trifinite Group and, in 2022, showed that a Tesla's 130-second post-unlock convenience window would let an attacker enrol a brand-new key over Bluetooth Low Energy and drive the car away — a finding that fed directly into the anti-relay rules now written into the Car Connectivity Consortium's Digital Key standards.

## The hook (cold-open)
In 2022, Herfurt published a piece of work he called *Gone in under 130 seconds*. The setup was almost embarrassingly simple. When a legitimate Tesla driver tapped their NFC keycard against the car's B-pillar, the car opened a 130-second window so the driver could shift into gear without having to authenticate again. Herfurt showed that, inside that same window, the car would also accept the enrolment of an entirely new key over Bluetooth Low Energy — without re-authentication, and without notifying the owner. An attacker standing nearby could pair their own phone, walk away with a working key, and drive the car off later at their leisure.

## The work

### Trifinite and a long Bluetooth security career
Herfurt founded the Trifinite Group in Austria, the long-running collective that has been picking apart Bluetooth security in public for years. The protocol layer that all of this work sits on top of is the one we cover in the Bluetooth episode — both the Classic BR/EDR stack and the Bluetooth Low Energy stack that modern car keys, trackers, and IoT devices use. Trifinite's role across that history has been to find, name, and publish the bugs that the deployed stacks would rather not talk about.

### The 2022 Tesla NFC keycard attack
The headline contribution is the 2022 Tesla disclosure. The mechanism is on the NFC and Bluetooth side of the car — defer the radio details to the NFC episode and the Bluetooth episode — but the logic flaw is what matters here. The car's authorisation model treated the 130 seconds after a legitimate NFC tap as a single trusted window covering everything: shifting into gear *and* enrolling additional keys. Herfurt's work demonstrated that during that window, an attacker within Bluetooth Low Energy range could enrol an attacker-controlled phone as a new key, with no second authentication and no owner notification. The attacker then had a fully valid key for as long as it took the owner to notice and revoke it.

He had reported the issue privately to Tesla months before going public — the standard responsible-disclosure shape — and shipped a defensive Android and iOS app called **TeslaKee** that gives owners visibility into the enrolment behaviour the car itself does not surface.

### Direct effect on the Digital Key standard
The disclosure did not stay an interesting one-off. It became one of the motivating cases behind the **anti-relay-resistance requirements in the Car Connectivity Consortium's Digital Key 3.0 and 4.0 specifications**, and behind the USPTO filings on NFC anti-relay timing bounds that came out of the same period. In other words, the rule that a modern phone-as-car-key system has to *time-bound* its NFC exchanges tightly enough to defeat a relay attacker — and not silently extend trust to new-key enrolment — exists in part because of the Trifinite Tesla work. That is the most useful kind of security research: a bug that ends up rewritten as a clause in the next version of the standard.

## See also (other pioneer episodes)
The natural neighbouring episodes are the other Bluetooth and NFC security researchers in the same orbit — Henryk Plötz and Karsten Nohl, both of whom built careers out of public dismantlement of deployed contactless and wireless protocols, and whose 24C3 MIFARE Classic work in 2007 is the closest stylistic predecessor to what Herfurt did to Tesla in 2022. For the radio layers themselves, the Bluetooth episode covers the Classic and Low Energy stacks that Trifinite's work targets, and the NFC episode covers the 13.56-megahertz contactless side that the Tesla keycard sits on.

## Sources

**Homepage**
- [Trifinite Group](https://trifinite.org/)
