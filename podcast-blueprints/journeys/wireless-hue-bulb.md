---
id: wireless-hue-bulb
type: journey
title: A Hue bulb joins the mesh — Zigbee commissioning in 4 messages
scope: wireless
podcast_target_minutes: 12
step_count: 4
protocols_in_order: [zigbee, zigbee, zigbee, zigbee]
related_protocols: [zigbee, wifi]
related_book_chapters: []
visual_cues:
  - "Four-node graph lighting up in sequence: Beacon Request, Association Request and Response, APS Transport-Key, Device Announce plus first ZCL command — with a four-second wall-clock timeline underneath"
  - "Channel map of the 2.4 GHz band showing Wi-Fi 1, 6, and 11 at 2412, 2437, and 2462 MHz, and Zigbee channels 15, 20, 25, 26 tucked into the gaps"
  - "Cross-section of the bulb's box showing the install-code QR sticker, with a callout to the per-device link key it encodes"
  - "Side-by-side: the universal ZigBeeAlliance09 link key in plain hex versus a unique per-device install-code key, with a sniffer icon next to the universal one"
  - "Stacked frame diagram of the very first ZCL OnOff.Toggle command — 802.15.4 header, NWK header, APS header, ZCL payload, AES-CCM* MIC — fitting in about 40 bytes"
---

# A Hue bulb joins the mesh — Zigbee commissioning in 4 messages

## In one breath
You unbox a new Philips Hue bulb, screw it into a lamp, and four
Zigbee messages later it lights up from your phone. This journey walks
that join sequence end to end, and lingers on the one message in the
middle that decides whether your network is secure or trivially
sniffable.

## The hook (cold-open)
You unscrew the dead bulb. You screw in the new one. You open the Hue
app, tap Add Light, and a few seconds later it appears. From boot to
first command takes about four seconds. In that window, the bulb
scanned for a parent, got itself a 16-bit address, received a 128-bit
network key encrypted under a key it already knew, and announced
itself to the mesh. Four Zigbee messages, in a strict order. Let's
walk them.

## The journey

### Step 1 — Beacon Request, joiner asks "any networks?" (Zigbee)
The new bulb powers on with no parent and no network key. The first
thing it does is broadcast an IEEE 802.15.4 MAC Command 0x07 — the
Beacon Request — on its current channel. Zigbee uses channels 15, 20,
25, and 26 in the 2.4 GHz band. Those four are not arbitrary; they sit
in the gaps between Wi-Fi's channels 1, 6, and 11 at 2412, 2437, and
2462 megahertz, so a healthy Zigbee deployment doesn't fight Wi-Fi for
airtime. Every Zigbee router on that channel with permit-joining
enabled answers with a Beacon, declaring its PAN ID, the Coordinator's
short address of 0x0000, the Stack Profile — Zigbee PRO — and whether
it's accepting joiners right now. The bulb collects the responses and
picks the best parent by signal strength and link quality. The deeper
mechanism of the mesh — how routers, end devices, and the Coordinator
relate, what the PAN ID actually is — lives in the Zigbee episode.
For this journey, the takeaway is that this is the slowest step of
the whole join: scanning every candidate channel takes two to four
seconds, which is why most of those four wall-clock seconds happen
right here.

The bulb has picked a parent. Now it needs a short address — a 16-bit
local identifier that is much cheaper to put on every frame than its
full 64-bit EUI-64.

### Step 2 — Association Request and Response, get a short address (Zigbee)
The bulb sends MAC Command 0x01, the Association Request, with a
Capability byte of 0x8E. That byte declares the bulb is a
full-function device, mains-powered, security-capable, and asks the
Coordinator to allocate a short address. The Coordinator picks a free
16-bit value — say 0x3F4E — and replies with MAC Command 0x02, the
Association Response. The bulb is now associated at the MAC layer.
But — and this is the catch — it still doesn't have the network key.
Without that key it can't decrypt or encrypt any actual Zigbee
frames. It has an address but it can't speak. The full mechanics of
short addresses versus EUI-64s, and why every Zigbee device has both,
are in the Zigbee episode. For this journey, the picture is simple:
the bulb is on the guest list, but the door is still locked.

Without the network key the bulb is useless. The Coordinator, wearing
its other hat as the Trust Center, has to deliver that key — and how
it does that is the single most important security decision in the
whole Zigbee architecture.

### Step 3 — APS Transport-Key, the network key encrypted at the application layer (Zigbee)
The Coordinator sends an APS Transport-Key command, command 0x05,
carrying the 128-bit AES network key. The frame is encrypted under
the joiner's pre-configured link key. Everything hinges on which link
key that is. If the bulb has a per-device install code — and a Hue
bulb does, printed as a QR code on the box you just unwrapped — then
the link key is unique to that bulb, and an eavesdropper sitting on
the channel during commissioning cannot decrypt the frame. If the
joiner only has the default ZigBeeAlliance09 link key, which is
universally known and is literally the ASCII bytes of the string
"ZigBeeAlliance09," then the eavesdropper can decrypt it, lift the
network key out, and from that moment own every frame on the network
for as long as that key lives. This is the canonical Zigbee
sniffer-at-join attack. Zigbee R23's Dynamic Link Key, which uses
SPEKE over Curve25519, removes the question entirely by negotiating
the link key fresh with no shared secret. The full story of the
Trust Center, install codes, and the R23 upgrade is in the Zigbee
episode. For this journey, the moral is that one frame in the middle
of a four-frame join decides whether your mesh is secure.

The bulb now has both a short address and the network key. It can
encrypt frames and act as a router for its neighbours. Time to
announce its arrival.

### Step 4 — Device Announce and the first ZCL command (Zigbee)
The bulb broadcasts a Device Announce on the network layer — a ZDO
message at cluster 0x0013 — saying: I am 0x3F4E, my EUI-64 is
such-and-such, I'm a mains-powered router. Every router on the mesh
adds the new bulb to its routing and binding tables. A moment later
the Hue app shows the bulb in its list. You tap the on-off toggle and
the app sends a single Zigbee Cluster Library command — OnOff.Toggle,
APS profile 0x0104 for Home Automation, cluster 0x0006 for OnOff,
command 0x02 for Toggle. The complete on-the-wire payload — the
802.15.4 MAC header, the network header, the APS header, the ZCL
header, and the AES-CCM* message integrity code — fits in about 40
bytes. The bulb turns on. From boot to first command: roughly four
seconds, most of it spent in that initial channel scan back at
step one.

## What the listener now understands
Zigbee commissioning is a small, sharp instance of the layered stack
doing exactly what it's supposed to. The radio finds a parent. The
MAC layer hands out a local address. The application support layer
delivers the cryptographic secret that everything above it depends
on. The cluster library above that turns "I want the light on" into
forty bytes on the air. Each layer minds its own job. And the whole
sequence pivots on one design choice — pre-configured link key versus
install code versus R23 — that decides whether your smart home is
private or wide open.

## Where this connects in the book
- The chapter on the Wireless Family places Zigbee next to its
  neighbours — Wi-Fi, Bluetooth, Thread — and explains why a low-power
  mesh radio is the right choice for a light bulb and the wrong one
  for a video stream.
- The Zigbee chapter goes deep on the four messages of this journey —
  the 802.15.4 MAC commands, the APS Transport-Key, the ZCL command
  set — and on the install-code, ZigBeeAlliance09, and R23 Dynamic
  Link Key story that decides the security posture of the whole mesh.
- The Wi-Fi chapter is worth pairing with this journey for the channel
  map alone: Zigbee 15, 20, 25, 26 sitting in the gaps between Wi-Fi
  1, 6, and 11 is a coexistence story that only makes sense once
  you've seen both.

## See also (other journeys and protocol episodes)

- The Tap to Pay journey is the obvious counterweight to this one:
  same wireless family, opposite scale. Tap to Pay sends one
  cryptogram halfway around the planet in 300 milliseconds. Hue
  commissioning sends four messages across a few metres in four
  seconds, and the whole point is that the network never has to
  reach further than your house.

- The Zigbee episode is the next listen if any of those four messages
  felt magical. It covers the mesh, the Trust Center, the install-code
  versus universal-link-key choice, the R23 upgrade, and why a 40-byte
  ZCL command is the right size unit for "turn the light on."

- The Wi-Fi episode is the right pair for the channel-coexistence
  beat — the reason Zigbee picked channels 15, 20, 25, and 26 in the
  first place is that Wi-Fi got there first, on 1, 6, and 11.

## Visual cues for image generation

- Four-node graph lighting up in sequence: Beacon Request,
  Association Request and Response, APS Transport-Key, Device Announce
  plus first ZCL command — with a four-second wall-clock timeline
  running underneath.
- Channel map of the 2.4 GHz band showing Wi-Fi 1, 6, and 11 at 2412,
  2437, and 2462 megahertz, and Zigbee channels 15, 20, 25, and 26
  tucked into the gaps between them.
- Cross-section of the bulb's box showing the install-code QR sticker,
  with a callout pointing to the per-device link key it encodes.
- Side-by-side comparison: the universal ZigBeeAlliance09 link key in
  plain hex on one side, a unique per-device install-code key on the
  other, with a sniffer icon hovering over the universal one.
- Stacked frame diagram of the very first ZCL OnOff.Toggle command —
  802.15.4 MAC header, network header, APS header, ZCL payload, and
  the AES-CCM* MIC at the end — adding up to about 40 bytes total.
