import type { ProtocolLayer } from '../types';

export function createTCPLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'TCP Segment',
		abbreviation: 'TCP',
		osiLayer: 4,
		color: '#39FF14',
		headerFields: [
			{
				name: 'Src Port',
				bits: 16,
				value: overrides?.srcPort ?? 49152,
				editable: true,
				description: 'Source port — ephemeral port chosen by the sender'
			},
			{
				name: 'Dst Port',
				bits: 16,
				value: overrides?.dstPort ?? 80,
				editable: true,
				description: 'Destination port — the service being contacted (80 = HTTP)'
			},
			{
				name: 'Seq #',
				bits: 32,
				value: overrides?.seq ?? 1000,
				editable: true,
				description: 'Sequence number — position of the first data byte in the stream'
			},
			{
				name: 'Ack #',
				bits: 32,
				value: overrides?.ack ?? 0,
				editable: false,
				description: 'Acknowledgment number — next expected byte from the other side'
			},
			{
				name: 'Offset',
				bits: 4,
				value: 5,
				editable: false,
				description: 'Data offset — number of 32-bit words in the header (5 = 20 bytes)'
			},
			{
				name: 'Flags',
				bits: 6,
				value: overrides?.flags ?? 'SYN',
				editable: false,
				description: 'Control flags — SYN, ACK, FIN, RST, PSH, URG',
				color: '#39FF14'
			},
			{
				name: 'Window',
				bits: 16,
				value: overrides?.window ?? 65535,
				editable: false,
				description: 'Window size — how many bytes the receiver can accept'
			},
			{
				name: 'Checksum',
				bits: 16,
				value: '0xA1B2',
				editable: false,
				description: 'Checksum — covers header + data + pseudo-header for integrity'
			}
		]
	};
}
