import type { ProtocolLayer } from '../types';

export function createOSPFLayer(overrides?: Partial<Record<string, string | number>>): ProtocolLayer {
	return {
		name: 'OSPFv2 Packet',
		abbreviation: 'OSPF',
		osiLayer: 3,
		color: '#F472B6',
		headerFields: [
			{
				name: 'Version',
				bits: 8,
				value: 2,
				editable: false,
				description: 'OSPF version — 2 for IPv4 (OSPFv2), 3 for IPv6 (OSPFv3)'
			},
			{
				name: 'Type',
				bits: 8,
				value: overrides?.type ?? 'Hello',
				editable: false,
				description:
					'Packet type — 1=Hello, 2=DBD (Database Description), 3=LSR (Link State Request), 4=LSU (Link State Update), 5=LSAck'
			},
			{
				name: 'Length',
				bits: 16,
				value: overrides?.length ?? 44,
				editable: false,
				description: 'Total OSPF packet length in bytes, including the 24-byte header'
			},
			{
				name: 'Router ID',
				bits: 32,
				value: overrides?.routerId ?? '1.1.1.1',
				editable: true,
				description: "The advertising router's unique 32-bit identifier (often a loopback address)"
			},
			{
				name: 'Area ID',
				bits: 32,
				value: overrides?.areaId ?? '0.0.0.0',
				editable: false,
				description: 'Area identifier — 0.0.0.0 is the backbone area. Topology is scoped to an area'
			},
			{
				name: 'Checksum',
				bits: 16,
				value: '0x8E3F',
				editable: false,
				description: 'Standard IP checksum over the OSPF packet, excluding the auth field'
			},
			{
				name: 'AuType',
				bits: 16,
				value: overrides?.auType ?? 2,
				editable: false,
				description:
					'Authentication type — 0=none, 1=cleartext, 2=cryptographic (HMAC-SHA-256 per RFC 5709)'
			},
			{
				name: 'Body',
				bits: 0,
				value: overrides?.body ?? 'Hello: HelloInterval=10, DeadInterval=40, Nbrs=[]',
				editable: false,
				description:
					'Type-specific body — Hello carries intervals and neighbour list; DBD carries LSA headers; LSU carries full LSAs'
			}
		]
	};
}
