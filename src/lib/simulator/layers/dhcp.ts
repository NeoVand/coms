import type { ProtocolLayer } from '../types';

export function createDHCPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'DHCP Message',
		abbreviation: 'DHCP',
		osiLayer: 7,
		color: '#06B6D4',
		headerFields: [
			{
				name: 'Op',
				bits: 8,
				value: overrides?.op ?? 'BOOTREQUEST (1)',
				editable: false,
				description:
					'Message type — 1 = BOOTREQUEST (client to server), 2 = BOOTREPLY (server to client)'
			},
			{
				name: 'Xid',
				bits: 32,
				value: overrides?.xid ?? '0x3903F326',
				editable: false,
				description:
					'Transaction ID — random value chosen by client to match requests with replies'
			},
			{
				name: 'Client MAC',
				bits: 0,
				value: overrides?.clientMac ?? '00:1A:2B:3C:4D:5E',
				editable: false,
				description: 'Client hardware address — identifies the requesting device'
			},
			{
				name: 'Your IP',
				bits: 32,
				value: overrides?.yourIp ?? '0.0.0.0',
				editable: false,
				description: 'IP address assigned to the client by the server (yiaddr)'
			},
			{
				name: 'Message Type',
				bits: 8,
				value: overrides?.messageType ?? 'DISCOVER',
				editable: false,
				description:
					'DHCP option 53 — DISCOVER, OFFER, REQUEST, ACK, NAK, RELEASE',
				color: '#06B6D4'
			},
			{
				name: 'Options',
				bits: 0,
				value: overrides?.options ?? '',
				editable: false,
				description:
					'DHCP options — subnet mask, router, DNS servers, lease time'
			}
		]
	};
}
