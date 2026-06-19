import type { ProtocolLayer } from '../types';

/** IEEE 802.15.4 MAC frame — the 802.15.4 envelope underneath Zigbee/Thread/UWB. */
export function create802154Layer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'IEEE 802.15.4 MAC',
		abbreviation: '15.4',
		osiLayer: 2,
		color: '#FBBF24',
		headerFields: [
			{
				name: 'Frame Control',
				bits: 16,
				value: overrides?.frameControl ?? '0x8841 (Data, AckReq=1, PAN-ID Compression)',
				editable: false,
				description:
					'Frame type (Data/Ack/Cmd), security on/off, AckReq, frame version, addressing modes'
			},
			{
				name: 'Seq Num',
				bits: 8,
				value: overrides?.seq ?? 0x1e,
				editable: false,
				description: 'Per-link sequence number; lets the receiver detect duplicates'
			},
			{
				name: 'Dst PAN ID',
				bits: 16,
				value: overrides?.dstPan ?? '0x1A62',
				editable: false,
				description: '16-bit Personal Area Network identifier — the network this frame belongs to'
			},
			{
				name: 'Dst Addr',
				bits: 16,
				value: overrides?.dstAddr ?? '0xFFFF (broadcast)',
				editable: false,
				description: '16-bit short address (locally unique) or 64-bit EUI-64 (globally unique)'
			},
			{
				name: 'Src Addr',
				bits: 16,
				value: overrides?.srcAddr ?? '0x0000 (Coordinator)',
				editable: false,
				description: 'Source 16-bit short or 64-bit extended address'
			},
			{
				name: 'Payload',
				bits: 0,
				value: overrides?.payload ?? 'NWK frame',
				editable: false,
				description: 'MAC payload — up to 127 PSDU bytes minus header + FCS'
			},
			{
				name: 'FCS',
				bits: 16,
				value: '0xABCD',
				editable: false,
				description: '16-bit CRC over the MAC header + payload — IEEE 802.15.4 polynomial'
			}
		]
	};
}

/** Zigbee NWK layer — the mesh routing header. */
export function createZigbeeNWKLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'Zigbee NWK',
		abbreviation: 'NWK',
		osiLayer: 3,
		color: '#F59E0B',
		headerFields: [
			{
				name: 'Frame Control',
				bits: 16,
				value: overrides?.frameControl ?? '0x0208 (Data, ProtoVer=2, NWK Security on)',
				editable: false,
				description:
					'Type (Data / NWK Command), Protocol Version (0010 = PRO, 0011 = R22+), DiscRoute, Multicast, Security, Source-Route present, IEEE addresses present, End-Device Initiator'
			},
			{
				name: 'Dst Addr',
				bits: 16,
				value: overrides?.dstAddr ?? '0x1234',
				editable: false,
				description:
					'NWK 16-bit short address — every node has a locally unique 16-bit address assigned at join'
			},
			{
				name: 'Src Addr',
				bits: 16,
				value: overrides?.srcAddr ?? '0x0000',
				editable: false,
				description: 'NWK 16-bit short address of the originator'
			},
			{
				name: 'Radius',
				bits: 8,
				value: overrides?.radius ?? 30,
				editable: false,
				description: 'TTL — decrements at every hop; the frame is dropped at 0. Default 30.'
			},
			{
				name: 'Seq Num',
				bits: 8,
				value: overrides?.seq ?? 0x7c,
				editable: false,
				description: 'NWK-layer sequence number — anti-replay alongside the security frame counter'
			},
			{
				name: 'Aux Sec Hdr / MIC',
				bits: 0,
				value: overrides?.security ?? 'AES-CCM* (frame counter 0x000ABCDE, MIC=4 bytes)',
				editable: false,
				description:
					'AES-128-CCM* encryption + integrity using the network key; 4/8/16-byte MIC appended'
			},
			{
				name: 'Payload (APS frame)',
				bits: 0,
				value: overrides?.payload ?? 'APS data: cluster=0x0006 (OnOff), Toggle command',
				editable: false,
				description: 'APS frame — endpoint addressing + cluster + ZCL command'
			}
		]
	};
}

/** Zigbee APS layer — endpoints, clusters, profile. */
export function createZigbeeAPSLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'Zigbee APS',
		abbreviation: 'APS',
		osiLayer: 7,
		color: '#FCD34D',
		headerFields: [
			{
				name: 'Frame Control',
				bits: 8,
				value: overrides?.frameControl ?? '0x40 (Data, Unicast, no Ack)',
				editable: false,
				description:
					'Type (Data / Cmd / Ack), Delivery Mode (Unicast / Indirect / Broadcast / Group), Security, AckReq, Extended Hdr'
			},
			{
				name: 'Dst Endpoint',
				bits: 8,
				value: overrides?.dstEp ?? 11,
				editable: false,
				description:
					'Endpoint within the destination device (1–240). Endpoint 11 is the standard Hue bulb endpoint.'
			},
			{
				name: 'Cluster ID',
				bits: 16,
				value: overrides?.clusterId ?? '0x0006 (OnOff)',
				editable: false,
				description:
					'ZCL cluster — 0x0003 Identify, 0x0006 OnOff, 0x0008 Level Control, 0x0019 OTA Upgrade, 0x0300 Color Control'
			},
			{
				name: 'Profile ID',
				bits: 16,
				value: overrides?.profileId ?? '0x0104 (Home Automation)',
				editable: false,
				description:
					'Application profile — 0x0104 Home Automation, 0x0109 Smart Energy, 0xC05E ZLL (legacy), 0x0107 Telecom, 0x010E Light Link'
			},
			{
				name: 'Src Endpoint',
				bits: 8,
				value: overrides?.srcEp ?? 1,
				editable: false,
				description: 'Endpoint within the source device'
			},
			{
				name: 'APS Counter',
				bits: 8,
				value: overrides?.apsCtr ?? 0x42,
				editable: false,
				description: 'APS-level frame counter — anti-replay protection across endpoints'
			},
			{
				name: 'ZCL Frame',
				bits: 0,
				value: overrides?.zcl ?? '0x11 0x05 0x02 (cluster-specific, TSN=5, OnOff.Toggle)',
				editable: false,
				description:
					'ZCL frame: FrameCtrl (1B) + TSN (1B) + Cmd (1B) + optional payload. 0x01=On, 0x00=Off, 0x02=Toggle on the OnOff cluster.'
			}
		]
	};
}
