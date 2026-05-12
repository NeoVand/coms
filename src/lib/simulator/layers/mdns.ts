import type { ProtocolLayer } from '../types';

export function createMDNSLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'mDNS / DNS',
		abbreviation: 'mDNS',
		osiLayer: 7,
		color: '#2DD4BF',
		headerFields: [
			{
				name: 'Transaction ID',
				bits: 16,
				value: overrides?.txid ?? '0x0000',
				editable: false,
				description: 'mDNS uses 0x0000 — multicast doesn\'t need transaction IDs (matching is by question)'
			},
			{
				name: 'Flags',
				bits: 16,
				value: overrides?.flags ?? '0x0000 (query)',
				editable: false,
				description: 'QR + Opcode + AA + TC + RD + RA + Z + RCODE. mDNS responses set QR=1 AA=1'
			},
			{
				name: 'QDCOUNT',
				bits: 16,
				value: overrides?.qdcount ?? 1,
				editable: false,
				description: 'Number of entries in the Question section'
			},
			{
				name: 'ANCOUNT',
				bits: 16,
				value: overrides?.ancount ?? 0,
				editable: false,
				description: 'Number of entries in the Answer section'
			},
			{
				name: 'NSCOUNT / ARCOUNT',
				bits: 32,
				value: '0 / 0',
				editable: false,
				description: 'Authority and Additional sections — usually empty in mDNS'
			},
			{
				name: 'Question / Answer',
				bits: 0,
				value: overrides?.body ?? '_ipp._tcp.local PTR IN (unicast-response bit set)',
				editable: false,
				description:
					'Question section (queries) or Answer section (responses). RRs use standard DNS encoding with QCLASS/RRCLASS high bit repurposed as unicast-response / cache-flush'
			}
		]
	};
}
