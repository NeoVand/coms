import type { Protocol } from '../types';

export const zigbee: Protocol = {
	id: 'zigbee',
	name: 'Zigbee',
	abbreviation: 'ZB',
	categoryId: 'wireless',
	port: undefined,
	year: 2004,
	rfc: 'Zigbee PRO 2023 (R23) / IEEE 802.15.4-2020',
	oneLiner:
		'{{ieee-802-15-4|IEEE 802.15.4}}-based low-power mesh networking — the radio under every Philips Hue bulb, IKEA Trådfri light, and Walmart shelf label on Earth.',
	overview: `[[zigbee|Zigbee]] is the upper-layer protocol stack — NWK, APS, ZDO, {{zcl|ZCL}} — that the Connectivity Standards Alliance (CSA, formerly the **Zigbee Alliance**, founded August 2002 by Invensys, Mitsubishi, Motorola, Philips, Samsung, and Honeywell) built on top of the {{ieee-802-15-4|IEEE 802.15.4}} PHY/MAC. The 2.4 GHz {{ism-band|ISM band}} offers 16 channels of 250 kbit/s O-QPSK; 868 MHz (Europe) and 902–928 MHz (NA) sub-GHz PHYs give longer range at lower bit rates. Topologies are star, tree, and **mesh** — every mains-powered device {{routing-table|routes}} for its sleepy neighbours, and the network heals itself when a router drops out. 127-byte PHY {{payload|payloads}}, ~80–100 byte usable APS payloads, and {{aead|AES-128-CCM*}} security across both the network and application layers.

The deployment story is unusually concentrated. **Philips Hue** launched on 29 October 2012 at {{apple|Apple}} Stores for $199 — branded as "Web-enabled lighting", with the word *Zigbee* deliberately invisible. Hue went on to become the largest Zigbee installed base on Earth at ~30 million bulbs lifetime. **IKEA Trådfri** (2017), **SmartThings**, **Amazon Echo Plus**, **Hubitat**, and most commercial-lighting systems (Acuity nLight AIR, Eaton, Lutron Vive) all run Zigbee. The under-reported giant: **VusionGroup electronic shelf labels** shipped 350 million units in 2023 alone and the **Walmart US 4,600-store rollout** announced 23 December 2024 will put more Zigbee-family devices in one retailer than Hue has ever sold.

The current spec is **Zigbee PRO 2023 (R23)**, document 05-3474-23, ratified 15 March 2023. Headline additions: **{{dynamic-link-key|Dynamic Link Key}}** negotiation using SPEKE over Curve25519 (no more "ZigBeeAlliance09" default key as the only fallback), **{{trust-center|Trust Center}} Swap-Out** so a hub failure no longer means re-joining every device, **Device Interview** for policy-gated joins, sub-GHz support, and **Zigbee Direct** (a phone-as-coordinator {{ble|BLE}} bootstrap, mandatory in R23 Coordinators). Above the radio, the CSA has spent the last six years migrating Zigbee's application semantics — the **{{zcl|ZCL}}** data model, originally renamed "Dotdot" in 2017 — onto IP, producing **{{matter|Matter}}** (October 2022). {{matter|Matter}} does not replace Zigbee on the wire; it *bridges* it. Signify's September 2023 Hue Bridge {{matter|Matter}} firmware turned ~30M Hue bulbs into {{matter|Matter}} accessories overnight while keeping the Zigbee mesh underneath. The right framing in 2026: Zigbee is being preserved as a bridged legacy radio while new device design moves to [[wifi|Wi-Fi]] or {{thread|Thread}}.`,
	howItWorks: [
		{
			title: 'IEEE 802.15.4 PHY — 2.4 GHz O-QPSK at 250 kbit/s + sub-GHz',
			description:
				"All Zigbee variants ride {{ieee-802-15-4|IEEE 802.15.4-2020}}. The dominant PHY is **2.4 GHz O-QPSK** with 16 channels (11–26), 5 MHz spacing, 250 kbit/s data rate. Sub-GHz PHYs at 868 MHz (Europe, 20 kbit/s BPSK) and 902–928 MHz (NA, 40 kbit/s BPSK) give better wall penetration and less [[wifi|Wi-Fi]] co-channel interference at lower bit rates; R23 adds FSK PHYs in those same bands. {{frame|Frames}} are bounded at **127 octets PSDU** with a **16-bit {{checksum|FCS}}**. The MAC uses unslotted CSMA-CA in most deployments (FFDs as routers, RFDs as end-devices), with optional beacon-mode for low-power sensor networks."
		},
		{
			title: 'NWK layer — mesh routing with AODV',
			description:
				"Zigbee's Network layer sits on top of 802.15.4 MAC and runs **AODV-style on-demand mesh {{routing-table|routing}}** (since R20, 2007). Every mains-powered router maintains a route table and can repair broken paths reactively; concentrators (typical: the Coordinator) use source routing for many-to-one traffic, eliminating per-route discovery on each upstream send. The 8-bit Radius field acts as a {{ttl|TTL}}. **Frequency-agility** lets the Coordinator order the whole network to {{hop|hop}} to a new channel if interference exceeds threshold — invaluable for [[wifi|Wi-Fi]] coexistence on 2.4 GHz. Frames are addressed by 16-bit short addresses (locally unique) or 64-bit EUI-64 (globally unique, modelled on a {{mac-address|MAC address}})."
		},
		{
			title: 'APS layer — Application Support Sublayer with endpoints and clusters',
			description:
				"The APS layer {{multiplexing|multiplexes}} application traffic onto **endpoints** (1–240, like sub-addresses on a device — endpoint 11 might be a bulb, endpoint 1 a switch). Frames carry a **ProfileID** (Home Automation = 0x0104, Smart Energy = 0x0109), a **ClusterID** (OnOff = 0x0006, Level Control = 0x0008, Color Control = 0x0300, OTA Upgrade = 0x0019), and an **APSCounter** for {{replay-attack|replay protection}}. APS-level AES-128-CCM* {{encryption|encryption}} is layered on top of NWK {{encryption|encryption}} when sensitive (e.g. {{trust-center|Trust Center}} Transport Key commands). The APS layer also handles binding tables — persistent destination-routing for groupcast lights and similar."
		},
		{
			title: 'ZCL — the Zigbee Cluster Library data model',
			description:
				"{{zcl|ZCL}} is what makes Zigbee a *consumer* protocol rather than a generic mesh. Each **cluster** is a small object with attributes (e.g. OnOff.OnOff is a boolean) and commands (OnOff.Toggle = 0x02). A modern Hue bulb implements OnOff (0x0006), Level Control (0x0008), Color Control (0x0300), Identify (0x0003), Groups (0x0004), Scenes (0x0005), OTA Upgrade (0x0019), and a dozen others. ZCL is the same data model that {{matter|Matter}} uses on [[ipv6|IP]] — **{{matter|Matter}} is essentially ZCL on [[ipv6|IPv6]]** — which is why a Hue bulb's behaviour translates one-to-one across the {{matter|Matter}} Bridge that Signify shipped on 19 September 2023."
		},
		{
			title: 'Trust Center + install codes — securing the join',
			description:
				"At commissioning time a new device joins by exchanging a 16-byte AES-128 **pre-configured link key** with the **{{trust-center|Trust Center}}** (usually the Coordinator). The {{trust-center|Trust Center}} then sends the network key in an APS Transport-Key command {{encryption|encrypted}} under that link key. The default link key — `5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39` = ASCII *ZigBeeAlliance09* — is universally known, which is why sniffer-at-join attacks recover the network key from any default-key join. **{{install-code|Install codes}}** (a per-device 128-bit secret printed on the device, mandatory in Zigbee 3.0 commissioning) close that hole; **R23's {{dynamic-link-key|Dynamic Link Key}}** with SPEKE over Curve25519 eliminates {{pfs|pre-shared secrets}} entirely."
		},
		{
			title: 'Matter bridge — how Zigbee gets to the rest of the building',
			description:
				"The CSA's current strategy is to keep Zigbee on the wire and bridge it to **{{matter|Matter}}** at the gateway. The Hue Bridge translates {{matter|Matter}} cluster commands into Zigbee ZCL groupcasts; {{matter|Matter}} 1.3 (May 2024) added **command batching** specifically to fix the *popcorn effect* — bulbs lighting one-by-one — when a single {{matter|Matter}} scene-set fanned out into per-bulb Zigbee writes. **Aqara Hub M3** (CES 2024, shipped 8 May 2024) is the canonical triple-radio bridge: Zigbee 3.0 + {{thread|Thread}} {{border-router|border router}} + {{matter|Matter}} controller, with 8 GB encrypted local storage and *no* microphone or camera. For the FOSS path the answer is **zigbee2mqtt** by Koen Kanters — 5,390 devices from 568 vendors supported as of May 2026 — bridging Zigbee onto [[mqtt|MQTT]] for Home Assistant and friends."
		},
		{
			title: 'Wi-Fi coexistence on 2.4 GHz — pick channel 15, 20, 25, or 26',
			description:
				"[[wifi|Wi-Fi]] at 2.4 GHz uses 20 MHz channels centred at 2412/2437/2462 MHz (channels 1/6/11). Zigbee channels are 2 MHz wide centred at 2405 + 5·(k−11) MHz. **Zigbee channels 11–14 sit under Wi-Fi 1; 15, 16, 19 partially clear Wi-Fi 6; channel 26 is at 2480 MHz** and may exceed regulatory output power in some regions. The safe defaults are channels 15, 20, 25, or 26 — they fit in the gaps. Run a 1-minute energy-detection scan (`zbid`/`zbstumbler` from KillerBee, or {{wireshark|Wireshark}} + nRF Sniffer) at the planned coordinator location before locking the channel in. Coordinator placement *on top of* a Wi-Fi router is the single most common cause of unreliable Zigbee — the router's switched-mode PSU emits broadband 2.4 GHz noise."
		}
	],
	useCases: [
		'Smart lighting — Philips Hue (~30M bulbs lifetime), IKEA Trådfri, GE C by GE, Sengled',
		'Whole-home sensor networks — Aqara, Xiaomi, SmartThings, Hubitat (motion, door, leak, temperature)',
		'Commercial building lighting controls — Acuity nLight AIR / Atrius, Eaton, Hubbell, Lutron Vive',
		'Electronic shelf labels at planetary scale — VusionGroup at Walmart (4,600 US stores), Carrefour, Tesco',
		'Phone-as-coordinator commissioning via Zigbee Direct (R23, {{ble|BLE}} {{gatt|GATT}} bootstrap with SPEKE/Curve25519)',
		'Utility AMI — Zigbee Smart Energy 1.x in-home displays + meter endpoints (PG&E, CenterPoint, Itron)',
		'Bridged {{matter|Matter}} accessories — Hue Bridge, Aqara Hub M3, SmartThings Station turn Zigbee into Matter'
	],
	codeExample: {
		language: 'python',
		code: `# zigpy + bellows — the canonical FOSS Zigbee stack on Python.
# Works with Silicon Labs EZSP coordinators (Sonoff ZBDongle-E, Nabu Casa SkyConnect, etc.),
# also TI Z-Stack (zigpy-znp) and dresden elektronik deCONZ (zigpy-deconz).
import asyncio
import zigpy.config
from zigpy.application import ControllerApplication
from bellows.zigbee.application import ControllerApplication as Bellows

CONFIG = {
    zigpy.config.CONF_DEVICE: {
        zigpy.config.CONF_DEVICE_PATH: '/dev/ttyUSB0',  # Sonoff ZBDongle-E
        'baudrate': 115200,
    },
    zigpy.config.CONF_NWK: {
        zigpy.config.CONF_NWK_CHANNEL: 25,  # avoid Wi-Fi 1/6/11
    },
}

async def main():
    app = await Bellows.new(CONFIG, auto_form=True, start_radio=True)

    # Allow new joins for 240 seconds (default key, or install-code via permit_with_key).
    await app.permit(time_s=240)

    # Find an already-joined Hue bulb by its EUI-64.
    BULB_IEEE = b'\\xec\\x1b\\xbd\\xff\\xfe\\x00\\x01\\x02'
    bulb = app.get_device(ieee=BULB_IEEE)
    onoff_cluster = bulb.endpoints[11].on_off          # ZCL cluster 0x0006

    await onoff_cluster.command(0x02)                  # Toggle
    print('Toggled bulb', bulb.nwk, 'in', bulb.endpoints[11].profile_id)

asyncio.run(main())`,
		caption:
			"A zigpy controller toggling a Hue bulb via ZCL's OnOff cluster 0x0006, command 0x02 (Toggle). The same code runs on Sonoff ZBDongle-E, Nabu Casa SkyConnect, dresden elektronik ConBee II, or any TI CC2652 stick — the radio is abstracted behind the zigpy controller interface.",
		alternatives: [
			{
				language: 'javascript',
				code: `// zigbee2mqtt — bridges Zigbee onto MQTT. Speak to your Hue bulbs from anything
// that can publish to an MQTT broker.
import mqtt from 'mqtt';
const client = mqtt.connect('mqtt://localhost:1883');

client.on('connect', () => {
  // Open the network for new devices for 4 minutes.
  client.publish('zigbee2mqtt/bridge/request/permit_join',
    JSON.stringify({ value: true, time: 240 }));

  // Toggle a specific bulb by friendly name.
  client.publish('zigbee2mqtt/living_room_lamp/set',
    JSON.stringify({ state: 'TOGGLE' }));

  // Push a scene to a group of bulbs (one Zigbee groupcast, not N unicasts).
  client.publish('zigbee2mqtt/kitchen_lights/set',
    JSON.stringify({ brightness: 128, color_temp: 250 }));
});

client.on('message', (topic, payload) => {
  console.log(topic, payload.toString());
});
client.subscribe('zigbee2mqtt/+');                    // listen to every device's state changes`
			},
			{
				language: 'cli',
				code: `# zigbee2mqtt + mosquitto on the command line.
mosquitto_pub -h localhost -t 'zigbee2mqtt/bridge/request/permit_join' \\
  -m '{"value": true, "time": 240}'

# Toggle a single bulb.
mosquitto_pub -h localhost -t 'zigbee2mqtt/living_room_lamp/set' \\
  -m '{"state": "TOGGLE"}'

# Dim and warm-up a kitchen group.
mosquitto_pub -h localhost -t 'zigbee2mqtt/kitchen_lights/set' \\
  -m '{"brightness": 128, "color_temp": 250}'

# Read the current state.
mosquitto_sub -h localhost -t 'zigbee2mqtt/living_room_lamp' -C 1

# Coordinator backup (important — R23 Trust Center Swap-Out doesn't replace this).
mosquitto_pub -h localhost -t 'zigbee2mqtt/bridge/request/backup' -m '{}'

# Wireshark filters for a CC2531 + whsniff capture:
#   zbee_nwk                          all NWK frames
#   zbee_aps                          all APS frames
#   zbee_zcl                          all ZCL frames
#   zbee_zcl.cluster == 0x0006        OnOff cluster
#   zbee_zcl.cluster == 0x0019        OTA Upgrade
#   zbee_aps.cmd.id == 0x05           APS Transport-Key (the critical join-time msg)
#   wpan.frame_type == 0x00           802.15.4 beacons (PAN discovery)
# Pre-configured Keys (Edit → Preferences → Protocols → Zigbee):
#   5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39   (default TC link key)`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'IEEE 802.15.4 MAC frame — the universal 802.15.4 envelope',
						code: `+----------------+--------+-------------+----------+----------+----------+
| Frame Control  | SeqNum | Addressing  | Aux Sec  | Payload  |   FCS    |
|    (16 bits)   | (8b)   | (0–20 B)    | Hdr (var)| (0–127B) |  (16b)   |
+----------------+--------+-------------+----------+----------+----------+

Frame Control (LSB first):
  bits 0–2   Frame Type      000=Beacon, 001=Data, 010=Ack, 011=MAC cmd, 101=Multipurpose
  bit  3     Security Enabled
  bit  4     Frame Pending   (more data follows — used by sleepy end-devices)
  bit  5     Ack Request     (1 = require an immediate Ack frame)
  bit  6     PAN ID Compression
  bit  7     reserved
  bit  8     Seq Num Suppression
  bit  9     IE Present       (Information Elements present)
  bits 10–11 Dst Address Mode   00=None, 10=16-bit short, 11=64-bit extended
  bits 12–13 Frame Version     00=2003, 01=2006, 10=2015/2020
  bits 14–15 Src Address Mode

Addressing fields appear in this order if present:
  Dst PAN ID (16b)  →  Dst Address (16/64b)  →  Src PAN ID (16b)  →  Src Address (16/64b)
PAN ID Compression bit suppresses the second PAN ID when both endpoints share a PAN.`
					},
					{
						title: 'Zigbee NWK header — mesh routing on top of 802.15.4',
						code: `+----------------+----------+----------+--------+--------+...+--------+
| Frame Control  | Dst Addr | Src Addr | Radius | SeqNum |...| Payload|
|   (16 bits)    |  (16b)   |  (16b)   |  (8b)  |  (8b)  |   |        |
+----------------+----------+----------+--------+--------+...+--------+

NWK Frame Control (LSB first):
  bits 0–1   Frame Type        00=Data, 01=NWK Command (Route Req/Reply, Leave, Rejoin Req, …)
  bits 2–5   Protocol Version  0010 = Zigbee PRO; 0011 = R22+
  bits 6–7   Discover Route    00=suppress, 01=enable on-demand AODV
  bit  8     Multicast Flag
  bit  9     Security          (1 = NWK-layer AES-128-CCM* enabled)
  bit  10    Source Route      (Source Route Subframe follows)
  bit  11    Destination IEEE  (DstIEEE 64-bit address present after the 16-bit DstAddr)
  bit  12    Source IEEE
  bit  13    End-Device Initiator
  bits 14–15 reserved

Radius decrements at each hop — drop the frame at 0. SeqNum is mainly anti-replay.
If Source Route is set: { RelayCount(8) | RelayIndex(8) | RelayList(N × 16b) } follows.
If secured: AES-CCM* with a 4/8/16-byte MIC appended after the encrypted payload.`
					},
					{
						title: 'Zigbee APS header + ZCL "On" command on the wire',
						code: `802.15.4 MAC:   41 88 <seq> <PANid LE> <dst-short LE> <src-short LE>
NWK header:     09 12 <dst LE> <src LE> 1E <seq>          (frame type 1 data, security on)
APS header:     40 <dst-ep> 06 00 04 01 <src-ep> <aps-ctr>
                ↑   ↑       ↑↑↑↑↑ ↑↑↑↑↑ ↑       ↑
                |   |       cluster profile     APS counter (anti-replay)
                |   |       0x0006 OnOff
                |   destination endpoint
                FrameCtrl: data type, unicast, no ack, no security
ZCL frame:      11 <TSN> 01
                ↑↑ ↑↑↑↑↑ ↑↑
                |  |     Command 0x01 = "On"
                |  Transaction Sequence Number — matches request to response
                FrameCtrl: cluster-specific, client→server, manuf-specific=0,
                          disable default response=1

That entire on-the-wire dump fits in roughly 40 bytes — a single Hue bulb command.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'~30–80 ms one-hop ZCL command on idle networks; mesh routing adds ~15–30 ms per hop; sleepy end-devices wake every 1–10 s for parent poll, so commands queue at the parent router and deliver on next poll',
		throughput:
			'250 kbit/s on 2.4 GHz O-QPSK; usable application throughput is ~50–100 kbit/s after MAC/NWK/APS/ZCL overhead, security, and CSMA-CA backoff; sub-GHz PHYs at 20/40 kbit/s for longer range and better wall penetration',
		overhead:
			'Per-frame MAC overhead ~9–25 B + 16-bit FCS; NWK header 8–24 B (mostly addresses + Radius); APS header 8–14 B (endpoints + cluster + profile + counter); ZCL 3–5 B; AES-CCM* MIC 4/8/16 B — typical end-to-end overhead 35–55 B against the 127-byte PSDU budget'
	},
	connections: ['wifi', 'bluetooth', 'mqtt', 'ip'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Zigbee',
		official: 'https://csa-iot.org/all-solutions/zigbee/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Zigbee_logo.svg/330px-Zigbee_logo.svg.png',
		alt: 'The Zigbee logo — a stylised honey-bee evoking the waggle dance, the Alliance\'s metaphor for mesh routing.',
		caption:
			'The Zigbee name comes from the **honey-bee waggle dance** — the figure-eight a foraging bee performs to communicate the direction and distance of food. The Alliance picked the metaphor for the mesh: thousands of small, low-power messengers cooperatively routing information to where it is needed.',
		credit: 'Image: Wikimedia Commons / Connectivity Standards Alliance trademark'
	},

	recentChanges: [
		{
			date: '2023-03',
			title: 'Zigbee PRO 2023 (R23) ratified',
			description:
				"Document 05-3474-23, ratified **15 March 2023** by the CSA. Headline additions: **{{dynamic-link-key|Dynamic Link Key}}** negotiation using SPEKE over Curve25519 with AES-MMO-128 (kills the *ZigBeeAlliance09* default-key sniff-at-join attack), **{{trust-center|Trust Center}} Swap-Out** (a failed Coordinator can be replaced without re-joining every device), **Device Interview** (TC policy gate before granting full access), **Works With All Hubs** phase 1, sub-GHz support for Europe (863–870 MHz) and North America (902–928 MHz), and absorbs **Zigbee Direct**. Silicon Labs, Texas Instruments, and ubisys are the named *golden units*. Backward-compatible with Zigbee 3.0 certification.",
			source: {
				url: 'https://csa-iot.org/newsroom/zigbee-pro-2023-released/',
				label: 'CSA: Zigbee PRO 2023 release announcement'
			}
		},
		{
			date: '2023-09',
			title: 'Philips Hue Bridge ships Matter firmware — 30M+ bulbs become Matter accessories',
			description:
				"Public rollout **19/20 September 2023** of {{matter|Matter}} firmware for the second-generation square Hue Bridge after a Q1 2023 target slipped. The update exposes existing Hue Zigbee bulbs to {{apple|Apple}} Home, {{google|Google}} Home, Amazon Alexa, and SmartThings over IP, while preserving the Zigbee mesh underneath. This single update made the Hue Bridge by far the largest {{matter|Matter}} Bridge installation in the world. Signify has continued to ship Bridge and Bridge Pro firmware updates through 2024–26.",
			source: {
				url: 'https://www.hueblog.com/2023/09/19/the-day-has-come-philips-hue-bridge-now-supports-matter/',
				label: 'Hueblog: Hue Bridge Matter release'
			}
		},
		{
			date: '2024-05',
			title: 'Aqara Hub M3 ships globally — Zigbee + Thread + Matter in one box',
			description:
				"Announced at CES on **8 January 2024**; shipped **8 May 2024**. Triple-protocol — **Zigbee 3.0 + {{thread|Thread}} {{border-router|border router}} + {{matter|Matter}} controller + {{matter|Matter}} Bridge** — with dual-band [[wifi|Wi-Fi]], Power-over-Ethernet, USB-C, IR blaster, **8 GB encrypted local storage**, and *no microphone or camera* (deliberate privacy stance). Up to 127 Zigbee + 127 {{thread|Thread}} devices. Aqara published a multi-hub-failover architecture (up to 10 M3s mirroring automations) in mid-2024 — the canonical 2024–25 form factor for a privacy-forward smart-home bridge.",
			source: {
				url: 'https://www.aqara.com/en/news/aqara-hub-m3-globally',
				label: 'Aqara: Hub M3 global launch'
			}
		},
		{
			date: '2024-12',
			title: 'VusionGroup × Walmart ESL rollout — Zigbee at retail scale',
			description:
				"On **23 December 2024** VusionGroup (formerly SES-imagotag) announced acceleration of digital shelf-label deployment across the entire Walmart US **4,600-store fleet** after the 2024 program reached almost 500 stores. Vusion shipped 350 million ESLs in 2023 alone; the EdgeSense platform runs a Zigbee-family radio. When the rollout completes, the total number of Zigbee-family devices on Walmart shelves alone will be roughly an order of magnitude larger than Philips Hue's lifetime install base.",
			source: {
				url: 'https://www.vusion.com/news',
				label: 'VusionGroup newsroom'
			}
		},
		{
			date: '2025-08',
			title: 'Matter 1.4.2 — Wi-Fi-only commissioning (BLE optional)',
			description:
				"Released **11 August 2025**. {{matter|Matter}} 1.4.2 adds **Wi-Fi-only commissioning** — devices can be set up without a Bluetooth Low Energy radio, reducing BOM cost for cheaper {{matter|Matter}}-bridged accessories. Also adds **Quieter Reporting** (battery-saving data-model change) and admin verification. For the Zigbee story, this means a {{matter|Matter}} Bridge for Zigbee no longer needs BLE silicon — accelerating low-cost bridges from secondary brands.",
			source: {
				url: 'https://csa-iot.org/newsroom/matter-1-4-2-released/',
				label: 'CSA: Matter 1.4.2 release'
			}
		},
		{
			date: '2025-11',
			title: 'Matter 1.5 — camera streaming closes the last Zigbee gap',
			description:
				"Released **20 November 2025**. {{matter|Matter}} 1.5 adds **camera streaming** via an RTSP side-channel — the long-awaited piece for {{matter|Matter}} to fully displace Zigbee in new home-security deployments. For Zigbee, this is the moment new device categories (cameras, video doorbells) no longer have a reason to go through a Zigbee bridge — they can go directly on [[wifi|Wi-Fi]] or {{thread|Thread}} with {{matter|Matter}} from day one.",
			source: {
				url: 'https://matteralpha.com/matter-timeline',
				label: 'MatterAlpha: Matter timeline'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Signify (Philips Hue)',
			scale: '~30M+ bulbs lifetime; largest Matter Bridge installation in the world',
			description:
				"Launched **30 October 2012** exclusively at {{apple|Apple}} Stores for $199/starter kit. The Philips press release mentioned *ZigBee LightLink* exactly once, in the technical body; the in-store materials and iOS app deliberately avoided the term. The Hue inventor George Yianni built the first prototype as a UI experiment on an iPhone. Hue migrated to Zigbee 3.0 via a Q1 2018 Bridge firmware update; the second-generation square Bridge gained {{matter|Matter}} support on 19 September 2023, turning the entire installed base into {{matter|Matter}} accessories overnight. The Hue Bridge is the canonical answer to *how does my smart-home ecosystem talk to Zigbee?*"
		},
		{
			org: 'IKEA Trådfri',
			scale: 'Tens of millions of devices since 2017',
			description:
				"IKEA's first major smart-home line, launched in 2017 as the budget alternative to Hue. Originally Zigbee Light Link, migrated to Zigbee 3.0. Trådfri triggered the 2015–2018 *Hue won't pair third-party bulbs* controversy that nudged Signify back to standard ZLL compatibility. IKEA remains an active CSA board member."
		},
		{
			org: 'Aqara / Lumi United (Hub M3)',
			scale: '127 Zigbee + 127 Thread devices per hub; 100+ device models; multi-hub failover',
			description:
				"Shenzhen-based, originally an {{apple|Apple}} HomeKit ecosystem partner. The **Aqara Hub M3** (announced CES 8 January 2024, shipping 8 May 2024) is the textbook modern multi-protocol bridge: Zigbee 3.0 + {{thread|Thread}} {{border-router|border router}} + {{matter|Matter}} controller and bridge, dual-band [[wifi|Wi-Fi]] (2.4/5 GHz, {{wpa3|WPA3}}), PoE, USB-C, 8 GB encrypted local storage, **no microphone or camera**. The M3 supersedes older Aqara hubs and runs automations locally — an Edge-Hub model that does not depend on the Aqara cloud."
		},
		{
			org: 'Samsung SmartThings',
			scale: 'Tens of millions of hubs across Hub v1–v3 and Station',
			description:
				"SmartThings shipped the original Hub in 2013; Samsung acquired the company in August 2014. Carries Zigbee + Z-Wave from day one; later generations added {{thread|Thread}} and {{matter|Matter}}. SmartThings is the most common single Zigbee Coordinator outside of Hue. Samsung sits on the CSA board."
		},
		{
			org: 'Amazon Echo Plus / Echo 4th gen / Echo Hub',
			scale: 'Tens of millions of units 2017+',
			description:
				"Amazon shipped a built-in Zigbee Coordinator inside the Echo Plus in 2017 — the first time a mass-market smart speaker pretended to be a Zigbee hub. Echo (4th gen) and Echo Show 10 also carry a Zigbee radio; the Echo Hub (2024) is positioned as a smart-home control panel with Zigbee inside. Amazon Sidewalk overlaps mostly at sub-GHz (900 MHz) rather than competing with Zigbee directly."
		},
		{
			org: 'Acuity Brands nLight AIR + Atrius',
			scale: 'Millions of fixtures across North American commercial buildings',
			description:
				"Acuity's nLight AIR and Atrius lines are the dominant Zigbee-based commercial lighting controls in North America. Deployed across millions of square feet of office and retail space. Acuity publishes Product Security Bulletins covering Atrius, nLight, nLight AIR, ROAM, SensorSwitch, Synergy, and XPoint Wireless. Eaton, Hubbell, and Lutron Vive compete in adjacent verticals."
		},
		{
			org: 'VusionGroup electronic shelf labels',
			scale: '350M ESLs shipped in 2023 alone; Walmart US 4,600-store rollout from 2024',
			description:
				"The under-reported Zigbee deployment that dwarfs every consumer brand by unit volume. VusionGroup (formerly SES-imagotag) runs a Zigbee-family radio in its EdgeSense / VusionCloud platform. The 23 December 2024 Walmart contract extension after a successful 500-store pilot will roll out across **all 4,600 US Walmart stores**. Carrefour, Lidl, Edeka, Tesco, and the UK Co-operative are parallel customers — cumulative Zigbee-family ESL deployments are well into the billion-device lifetime range."
		}
	],

	funFacts: [
		{
			title: 'The name comes from the honey-bee waggle dance',
			text: "Foraging bees returning to the hive perform a figure-eight dance whose orientation and duration communicate the direction and distance of food — an organic mesh routing protocol, in effect. The Alliance picked the name and the bee logo for exactly this metaphor: thousands of small, low-power messengers cooperatively routing information to where it is needed."
		},
		{
			title: 'Philips Hue\'s 2012 Apple Store launch never said "Zigbee" out loud',
			text: "The Philips press release of 29 October 2012 mentioned *ZigBee LightLink* exactly once in the technical body; the in-store materials, packaging, and iOS app strenuously avoided the term. Customers were sold *Web-enabled* and *iOS-controlled* lighting. The Hue inventor George Yianni later said the goal was to *change people's relationship with lighting in their homes*, not to teach them mesh networking — and Hue remains the canonical example of a successful protocol whose user-visible brand is the product, not the standard."
		},
		{
			title: 'The default Trust Center link key is literally "ZigBeeAlliance09"',
			text: "Sixteen bytes of ASCII — `5A:69:67:42:65:65:41:6C:6C:69:61:6E:63:65:30:39` — baked into the specification of one of the most widely deployed wireless protocols on Earth, used as the fallback when a device has no {{install-code|install code}}. Generations of {{wireshark|Wireshark}} users have memorised that hex string. The fact that Zigbee 3.0 requires install codes for proper commissioning while simultaneously retaining this key for compatibility is the protocol's most-quoted security cautionary tale. R23's {{dynamic-link-key|Dynamic Link Key}} with SPEKE/Curve25519 finally retires the pre-shared default."
		},
		{
			title: 'zigbee2mqtt supports 5,390 devices from 568 vendors',
			text: "A single GPL-licensed Node.js project — maintained primarily by Koen Kanters — keeps a more complete decoder database of Zigbee Cluster Library quirks than any single commercial hub vendor. zigbee2mqtt is the de-facto interoperability spec for the FOSS smart-home community. The most common Zigbee Coordinator in 2026 is a $20 Sonoff ZBDongle-E plugged into a Raspberry Pi running Home Assistant."
		},
		{
			title: 'Walmart\'s shelf labels will outnumber every Hue bulb ever sold',
			text: "When the 4,600-store Walmart US expansion completes, the total number of Zigbee-family devices on Walmart shelves alone will be roughly an order of magnitude larger than the total installed base of Philips Hue bulbs ever sold. The next time someone asks *is Zigbee dead?*, the right answer is: it is invisible because it is behind every price tag in your supermarket."
		},
		{
			title: 'Bob Heile was a founding member of IEEE 802.11 *and* the Zigbee Alliance',
			text: "Robert F. Heile (1945–2020) chaired the Zigbee Alliance from its founding in 2002 through 2013, was a founding member of IEEE [[wifi|802.11]] (Wi-Fi) in 1990, chaired IEEE 802.15 for two decades, and later directed standards at the Wi-SUN Alliance. Almost every low-power 802.15.4-based protocol you can name — Zigbee, {{thread|Thread}}, WirelessHART, Wi-SUN — traces directly back through Bob. He died of prostate cancer on 24 September 2020; his IEEE 802.15 chair role was passed days before his death."
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Wi-Fi co-channel interference — pick channel 15, 20, 25, or 26',
				text: "[[wifi|Wi-Fi]] 2.4 GHz uses 20 MHz channels centred at 2412/2437/2462 MHz (channels 1/6/11); Zigbee channels are 2 MHz wide. Zigbee 11–14 sit under Wi-Fi 1; 15, 16, 19 partially clear Wi-Fi 6; channel 26 is at 2480 MHz and may exceed regulatory power in some regions. **Defaults that work cross-regionally: channel 25** (or 15 if your Wi-Fi sits on 6/11). Run a 1-minute energy-detection scan with `zbstumbler` (KillerBee) or {{wireshark|Wireshark}} + nRF Sniffer at the planned coordinator location before locking in. Coordinator placement *on top of* a Wi-Fi router is the single most common cause of *Zigbee is unreliable* complaints — the router's switched-mode PSU emits broadband 2.4 GHz noise."
			},
			{
				title: 'Coordinator as single point of failure — back up the NV',
				text: "Until R23's {{trust-center|Trust Center}} Swap-Out, losing the Coordinator usually meant rebuilding the entire network. Even with R23 you should: **(a)** take regular backups of the coordinator's NV (zigbee2mqtt writes `coordinator_backup.{{json|json}}` automatically); **(b)** keep the Coordinator on UPS or PoE; **(c)** use a USB extension cable to keep the dongle away from USB 3.0 ports and SSDs, which emit 2.4 GHz noise; **(d)** consider redundant routing density so a single dropped device doesn't {{partition|partition}} the mesh."
			},
			{
				title: 'Router density and child-table limits',
				text: "Mains-powered Zigbee devices act as routers and adopt sleepy end-devices as children. The child-table size on a typical CC2652 / EFR32 firmware is **32**; the Sonoff ZBDongle-E reliably hits trouble around 50 directly-associated devices because of memory. The fix is *more routers, not a beefier coordinator* — every smart plug, ceiling switch, and powered bulb is a free router. Aim for at least one router per 8–10 metres in every direction from the Coordinator, and one router per sleepy-end-device cluster (a bedroom full of battery sensors should have a mains-powered plug or bulb acting as their parent)."
			},
			{
				title: 'Install codes vs. default key — pick a stance at deployment time',
				text: "A pure Zigbee 3.0 deployment with proper install codes is genuinely secure against sniffer-at-join attacks; the same hardware joined with the default *ZigBeeAlliance09* link key is not. Many consumer hubs (zigbee2mqtt's permissive default, older SmartThings) fall back to the default key for compatibility. **Decide your stance at deployment time** — for a commercial site, mandate install codes and refuse joins without one. R23's {{dynamic-link-key|Dynamic Link Key}} removes the question entirely; specify R23-only coordinators if you are starting fresh."
			},
			{
				title: '"Device dropped off the mesh" debugging checklist',
				text: "Run through in order: **(i)** check battery voltage via Power Configuration cluster 0x0001; **(ii)** inspect the parent of the dropped device in `bridge/networkmap` and verify it is still alive; **(iii)** check whether you've exceeded the parent's child-table; **(iv)** check Coordinator/parent uptime for power glitches; **(v)** capture beacons with nRF Sniffer to see whether the device is even hearing the network; **(vi)** look for *rejoin* failures in Coordinator logs that indicate the device's stored network parameters no longer match (often after a Coordinator firmware update)."
			}
		]
	}
};
