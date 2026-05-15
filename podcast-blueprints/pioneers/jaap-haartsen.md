---
id: jaap-haartsen
type: pioneer
name: Jaap Haartsen
years: "1963–"
title: Inventor of Bluetooth
org: Ericsson Mobile Communications (Lund), Plantronics, Sony Mobile (retired)
podcast_target_minutes: 6
protocols: [bt]
categories: []
related_book_chapters:
  - wireless/bluetooth
awards:
  - { name: "European Inventor Award (Lifetime Achievement finalist)", year: 2015, url: "https://www.epo.org/learning/materials/inventors/files/2015-finalists-haartsen.pdf" }
  - { name: "Eduard Rhein Foundation Technology Award", year: 2009, url: null }
image:
  src: null
  alt: Portrait of Jaap Haartsen, the Dutch electrical engineer who invented Bluetooth
  credit: null
visual_cues:
  - "Portrait composition: a Dutch electrical engineer in his early thirties at an Ericsson Mobile Communications lab bench in Lund, Sweden, mid-1990s, a brick-sized mobile phone with a wired headset on the bench beside him"
  - "Whiteboard close-up: hand-drawn 2.4 GHz frequency-hopping pattern, 1,600 hops per second, with arrows leaping between channels and the label 'piconet — one master, up to seven slaves'"
  - "Founding-document aesthetic: a May 1998 SIG founding press release on a wood-grain conference table, surrounded by Ericsson, Nokia, IBM, Toshiba, and Intel logos"
  - "Split composition: on the left, an RS-232 serial cable coiled on a 1994 desk; on the right, a modern wireless earbud sitting in its charging case — the cable Haartsen was asked to delete, and the production it became"
---

# Jaap Haartsen

## In one sentence
Jaap Haartsen is the Dutch electrical engineer who, between 1994 and 1997 in an Ericsson lab in Lund, designed the 2.4 gigahertz frequency-hopping radio that became Bluetooth — and is now inside roughly every phone, headset, and earbud on the planet.

## The hook (cold-open)
In 1994, an Ericsson manager handed a young Dutch engineer in Lund a small problem: get rid of the cable between a mobile phone and its headset. Three years later, Jaap Haartsen and his colleague Sven Mattisson had a working frequency-hopping radio that hopped sixteen hundred times a second across the 2.4 gigahertz band. By May 1998, Ericsson, Nokia, IBM, Toshiba, and Intel had founded a Special Interest Group around it. The European Patent Office, naming him a Lifetime Achievement finalist in 2015, said his invention had "made wireless communication ubiquitous." He had been asked to delete a cable. He had ended up defining a radio standard.

## The work

### Ericsson Lund, 1991 — and the cable problem
Haartsen joined Ericsson Mobile Communications in Lund, Sweden in 1991. The brief that mattered came a few years later: replace the RS-232 serial cable that ran from a mobile phone to its headset. It is worth pausing on how mundane that brief sounds — a short-range, low-power, point-to-point link to delete one wire on one accessory. The radio he and Sven Mattisson built to do it ended up doing far more than that, but the original constraint set the design philosophy. Short range. Low power. Cheap silicon. Robust in a noisy unlicensed band.

### The Baseband, 1994–1997
Between 1994 and 1997, Haartsen authored the core technical work that defined the Bluetooth Baseband — the layer the Bluetooth episode unpacks in detail. The defining choices were his: operation in the 2.4 gigahertz ISM band, frequency hopping at sixteen hundred hops per second to ride out interference and microwave-oven noise, the piconet topology with one master and up to seven active slaves (renamed Central and Peripheral in the modern nomenclature), the BD_ADDR-derived clock alignment that lets a follower lock onto the leader's hopping sequence, and the split between SCO and eSCO links for synchronous voice and ACL links for asynchronous data. Every Bluetooth chip ever shipped descends from that design.

### Founding the SIG, May 1998
In May 1998, the Bluetooth Special Interest Group was founded by Ericsson, Nokia, IBM, Toshiba, and Intel — and Haartsen was a co-architect of the founding. The SIG is the institutional reason the radio became an industry rather than an Ericsson accessory. The chapter on Bluetooth — Classic, LE, and the 6.0 ranging future tells the story of what the SIG did with the radio over the following twenty-five years; the BR/EDR-to-BLE-to-channel-sounding arc belongs there.

### After Ericsson
Haartsen's career after the original radio ran through Plantronics and then Sony Mobile, before he retired. The dump does not detail what he shipped at each stop, so we will leave it at that — the production he is remembered for is the one he completed in Lund before the SIG was founded.

## Awards and recognition
Haartsen was named a Lifetime Achievement finalist for the European Inventor Award in 2015 — the citation from the European Patent Office credited him with having "made wireless communication ubiquitous." He had earlier received the Eduard Rhein Foundation Technology Award in 2009.

## Quotes
"We were not trying to invent a new wireless standard. We were trying to get rid of a cable." That line, from the EPO's 2015 inventor-award finalist profile, is the cleanest summary of the brief that produced Bluetooth — and the reason the radio's design priorities are short range, low power, and cheap silicon rather than the high-throughput, long-range goals of the Wi-Fi work happening on the same 2.4 gigahertz band a few years later.

## Where they appear in the book
- Part "Wireless," chapter "Bluetooth — Classic, LE, and the 6.0 ranging future" — the chapter on the radio Haartsen designed in Lund, the SIG that carried it to market, and the Classic, Low Energy, and Bluetooth 6.0 channel-sounding evolutions that came after.

## See also (other pioneer episodes)
Haartsen's story sits naturally alongside the other wireless-radio pioneers in this collection. Bob Heile's episode covers the IEEE 802.15 working group and the Zigbee Alliance — the institutional companion to the low-power radio world that Bluetooth shares the 2.4 gigahertz band with. Charles Walton's episode covers the prehistory of short-range wireless identification, the RFID work that became NFC. Read together, the three pioneer episodes are the human side of the wireless personal-area network — the cable-replacement radio (Haartsen), the mesh radio (Heile), and the four-centimetre tap radio (Walton).

## Sources

**Wikipedia**
- [Jaap Haartsen — Wikipedia](https://en.wikipedia.org/wiki/Jaap_Haartsen)

**Awards pages**
- [European Inventor Award 2015 finalist profile (EPO)](https://www.epo.org/learning/materials/inventors/files/2015-finalists-haartsen.pdf)
