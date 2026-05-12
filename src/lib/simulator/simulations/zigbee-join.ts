import type { SimulationConfig } from '../types';
import { create802154Layer, createZigbeeNWKLayer, createZigbeeAPSLayer } from '../layers/zigbee';

export const zigbeeJoin: SimulationConfig = {
	protocolId: 'zigbee',
	title: 'Zigbee Device Join — Coordinator → new bulb → first OnOff command',
	description:
		"Watch a new Zigbee 3.0 bulb join a Trust Center–centralised network with an install code: beacon scan → Association → Transport-Key → Toggle. Same flow under every Philips Hue join, IKEA Trådfri pairing, and Aqara device commissioning in 2026.",
	tier: 'client',
	actors: [
		{ id: 'bulb', label: 'New Bulb (Joiner)', icon: 'device', position: 'left' },
		{ id: 'router', label: 'Mains-Powered Router', icon: 'server', position: 'center' },
		{ id: 'coord', label: 'Coordinator + Trust Center', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'channel',
			label: 'Zigbee channel',
			type: 'select',
			defaultValue: '25 (2475 MHz)',
			options: ['15 (2425 MHz, avoids Wi-Fi 6)', '20 (2450 MHz)', '25 (2475 MHz)', '26 (2480 MHz, regulatory limit)']
		},
		{
			id: 'auth',
			label: 'Pre-configured link key',
			type: 'select',
			defaultValue: 'Install code (secure)',
			options: ['Install code (secure)', 'ZigBeeAlliance09 default (legacy)', 'R23 Dynamic Link Key (SPEKE/Curve25519)']
		},
		{
			id: 'panId',
			label: 'Network PAN ID',
			type: 'text',
			defaultValue: '0x1A62',
			placeholder: '16-bit hex'
		}
	],
	steps: [
		{
			id: 'beacon-req',
			label: 'Beacon Request — joiner asks "any networks here?"',
			description:
				'The new bulb has no parent yet. It sends an 802.15.4 MAC Command 0x07 (Beacon Request) as a 1-hop broadcast on the chosen channel (25 by default, dodging the Wi-Fi 1/6/11 trio at 2412/2437/2462 MHz). Every router and the Coordinator that hears it will reply with a Beacon frame describing their PAN.',
			fromActor: 'bulb',
			toActor: 'router',
			duration: 900,
			highlight: ['Frame Control', 'Dst Addr'],
			layers: [
				create802154Layer({
					frameControl: '0x0803 (MAC Cmd, AckReq=0, PAN-ID Compression off)',
					seq: 0x00,
					dstPan: '0xFFFF (broadcast)',
					dstAddr: '0xFFFF (broadcast)',
					srcAddr: '64-bit EUI-64 (no short yet)',
					payload: 'MAC Cmd 0x07 — Beacon Request'
				})
			]
		},
		{
			id: 'beacon',
			label: 'Beacon response — Coordinator advertises the PAN',
			description:
				'The Coordinator (and any router permitting-joins) replies with a Beacon: PAN ID 0x1A62, Coordinator short address 0x0000, Network ID, Permit-Joining bit set, Stack Profile = Zigbee PRO, Protocol Version = 0x02. The joiner picks the best beacon by RSSI + LQI + capability bits.',
			fromActor: 'coord',
			toActor: 'bulb',
			duration: 900,
			highlight: ['Frame Control', 'Dst Addr', 'Src Addr'],
			layers: [
				create802154Layer({
					frameControl: '0x8000 (Beacon, AckReq=0)',
					seq: 0x01,
					dstPan: '0x1A62',
					dstAddr: '(none — beacon)',
					srcAddr: '0x0000 (Coordinator)',
					payload: 'PAN ID 0x1A62, Permit-Join=1, Stack Profile=PRO, Proto Version=2'
				})
			]
		},
		{
			id: 'assoc-req',
			label: 'Association Request — joiner asks for a short address',
			description:
				'The bulb selects the Coordinator (or a nearby router as its parent) and sends MAC Command 0x01 (Association Request). The Capability Information byte tells the parent: FFD or RFD, mains-powered or sleepy, security-capable, allocate-address flag. AckReq is set; the parent must Ack.',
			fromActor: 'bulb',
			toActor: 'coord',
			duration: 900,
			highlight: ['Frame Control', 'Payload'],
			layers: [
				create802154Layer({
					frameControl: '0xC823 (MAC Cmd, AckReq=1, src EUI-64, dst short)',
					seq: 0x02,
					dstPan: '0x1A62',
					dstAddr: '0x0000 (Coordinator)',
					srcAddr: 'EUI-64 of the joiner',
					payload: 'MAC Cmd 0x01 — Association Request. Capability=0x8E (FFD, mains-powered, security-capable, allocate-short)'
				})
			]
		},
		{
			id: 'assoc-rsp',
			label: 'Association Response — assigns short address 0x3F4E',
			description:
				'The Coordinator allocates a unique 16-bit short address (0x3F4E) and replies with MAC Command 0x02 (Association Response). The joiner now has a short address it can use for the rest of its life on this network — much cheaper than the 8-byte EUI-64 on every frame.',
			fromActor: 'coord',
			toActor: 'bulb',
			duration: 900,
			highlight: ['Frame Control', 'Payload'],
			layers: [
				create802154Layer({
					frameControl: '0xCC63 (MAC Cmd, AckReq=1, both addrs EUI-64)',
					seq: 0x03,
					dstPan: '0x1A62',
					dstAddr: 'EUI-64 of joiner',
					srcAddr: '0x0000 (Coordinator EUI-64)',
					payload: 'MAC Cmd 0x02 — Association Response. Allocated short=0x3F4E. Status=0x00 (success)'
				})
			]
		},
		{
			id: 'transport-key',
			label: 'APS Transport-Key — Coordinator delivers the network key',
			description:
				"The critical join-time message. Once associated, the Coordinator (acting as Trust Center) sends the **network key** in an APS Transport-Key command (cmd id 0x05), encrypted with the joiner's pre-configured link key. With an install code, that link key is unique to this device and an eavesdropper cannot decrypt the message. With the default *ZigBeeAlliance09* link key, an eavesdropper who captured this frame would recover the network key — the canonical Zigbee sniffer-at-join attack.",
			fromActor: 'coord',
			toActor: 'bulb',
			duration: 1100,
			highlight: ['Frame Control', 'Aux Sec Hdr / MIC', 'Payload (APS frame)'],
			layers: [
				createZigbeeNWKLayer({
					frameControl: '0x0048 (Data, ProtoVer=2, NWK Security off — APS-level only on Transport-Key)',
					dstAddr: '0x3F4E',
					srcAddr: '0x0000',
					radius: 1,
					seq: 0x10,
					security: '(none at NWK; APS encrypts under pre-conf link key)',
					payload: 'APS Cmd 0x05 — Transport-Key (Network Key). Encrypted under install-code-derived link key.'
				})
			]
		},
		{
			id: 'device-announce',
			label: 'Device Announce — bulb broadcasts its arrival',
			description:
				"The joiner now has both a short address and the network key. It NWK-broadcasts a **Device Announce** ZDO message (cluster 0x0013) — *I am 0x3F4E, EUI-64 = …, capability = …* — so every router knows to add it to their routing tables and binding tables. From here the device is on the mesh.",
			fromActor: 'bulb',
			toActor: 'router',
			duration: 900,
			highlight: ['Frame Control', 'Dst Addr', 'Aux Sec Hdr / MIC'],
			layers: [
				createZigbeeNWKLayer({
					frameControl: '0x0208 (Data, ProtoVer=2, NWK Security on)',
					dstAddr: '0xFFFD (NWK broadcast — RxOnWhenIdle routers)',
					srcAddr: '0x3F4E',
					radius: 30,
					seq: 0x11,
					security: 'AES-CCM* with network key, frame counter increments',
					payload: 'ZDO Device Announce (cluster 0x0013, profile 0x0000): "I am here"'
				})
			]
		},
		{
			id: 'onoff-toggle',
			label: 'First command — ZCL OnOff.Toggle = 0x02',
			description:
				"A switch (or the Hue app via the bridge) sends a ZCL OnOff Toggle command to the new bulb. APS frame: Cluster 0x0006 (OnOff), Profile 0x0104 (Home Automation), Cmd 0x02 (Toggle). The ZCL FrameCtrl byte 0x11 says *cluster-specific, client→server, disable default response*. The whole on-the-wire payload is roughly 40 bytes including all the headers.",
			fromActor: 'coord',
			toActor: 'bulb',
			duration: 1000,
			highlight: ['Cluster ID', 'Profile ID', 'ZCL Frame'],
			layers: [
				createZigbeeNWKLayer({
					frameControl: '0x0208 (Data, secured)',
					dstAddr: '0x3F4E',
					srcAddr: '0x0000',
					radius: 30,
					seq: 0x12,
					security: 'AES-CCM* with network key',
					payload: 'APS data frame'
				}),
				createZigbeeAPSLayer({
					frameControl: '0x40 (Data, Unicast, no Ack)',
					dstEp: 11,
					clusterId: '0x0006 (OnOff)',
					profileId: '0x0104 (Home Automation)',
					srcEp: 1,
					apsCtr: 0x42,
					zcl: '0x11 0x05 0x02 (cluster-specific, TSN=5, Cmd=0x02 Toggle)'
				})
			]
		}
	]
};
