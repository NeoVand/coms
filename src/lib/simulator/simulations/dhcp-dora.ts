import type { SimulationConfig } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createDHCPLayer } from '../layers/dhcp';

export const dhcpDora: SimulationConfig = {
	protocolId: 'dhcp',
	title: 'DHCP — DORA Address Assignment',
	description:
		'Watch the DORA sequence that automatically assigns IP addresses: Discover, Offer, Request, Acknowledge. This is how every device on your network gets its IP address, subnet mask, gateway, and DNS servers.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'New Device', icon: 'device', position: 'left' },
		{ id: 'server', label: 'DHCP Server', icon: 'server', position: 'right' }
	],
	steps: [
		{
			id: 'discover',
			label: 'DISCOVER',
			description:
				'The device has no IP address yet, so it broadcasts a DHCP Discover to the entire network. Source IP is 0.0.0.0 (has none), destination is 255.255.255.255 (broadcast). The device includes its MAC address so the server knows who is asking.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Message Type', 'Client MAC', 'Your IP'],
			layers: [
				createEthernetLayer({ dstMac: 'FF:FF:FF:FF:FF:FF' }),
				createIPv4Layer({ srcIp: '0.0.0.0', dstIp: '255.255.255.255', protocol: 17 }),
				createUDPLayer({ srcPort: 68, dstPort: 67 }),
				createDHCPLayer({
					op: 'BOOTREQUEST (1)',
					xid: '0x3903F326',
					clientMac: '00:1A:2B:3C:4D:5E',
					yourIp: '0.0.0.0',
					messageType: 'DISCOVER',
					options: 'Parameter Request: Subnet, Router, DNS'
				})
			]
		},
		{
			id: 'offer',
			label: 'OFFER',
			description:
				'The DHCP server selects an available IP address from its pool and offers it to the device. The offer includes the proposed IP, subnet mask, default gateway, DNS servers, and lease duration. Multiple servers can make competing offers.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Message Type', 'Your IP', 'Options'],
			layers: [
				createEthernetLayer({ dstMac: 'FF:FF:FF:FF:FF:FF', srcMac: 'AA:BB:CC:DD:EE:FF' }),
				createIPv4Layer({ srcIp: '192.168.1.1', dstIp: '255.255.255.255', protocol: 17 }),
				createUDPLayer({ srcPort: 67, dstPort: 68 }),
				createDHCPLayer({
					op: 'BOOTREPLY (2)',
					xid: '0x3903F326',
					clientMac: '00:1A:2B:3C:4D:5E',
					yourIp: '192.168.1.100',
					messageType: 'OFFER',
					options: 'Subnet: 255.255.255.0, Router: 192.168.1.1, DNS: 8.8.8.8, Lease: 86400s'
				})
			]
		},
		{
			id: 'request',
			label: 'REQUEST',
			description:
				'The device broadcasts its acceptance of a specific server\'s offer. This broadcast ensures that all DHCP servers on the network know which offer was chosen, so declined servers can return their proposed addresses to their pools.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1000,
			highlight: ['Message Type', 'Options'],
			layers: [
				createEthernetLayer({ dstMac: 'FF:FF:FF:FF:FF:FF' }),
				createIPv4Layer({ srcIp: '0.0.0.0', dstIp: '255.255.255.255', protocol: 17 }),
				createUDPLayer({ srcPort: 68, dstPort: 67 }),
				createDHCPLayer({
					op: 'BOOTREQUEST (1)',
					xid: '0x3903F326',
					clientMac: '00:1A:2B:3C:4D:5E',
					yourIp: '0.0.0.0',
					messageType: 'REQUEST',
					options: 'Requested IP: 192.168.1.100, Server ID: 192.168.1.1'
				})
			]
		},
		{
			id: 'ack',
			label: 'ACK',
			description:
				'The server confirms the assignment with DHCP ACK. The device can now configure its network interface with the assigned IP, subnet mask, gateway, and DNS servers. The lease timer starts — the device must renew before it expires.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Message Type', 'Your IP', 'Options'],
			layers: [
				createEthernetLayer({ dstMac: 'FF:FF:FF:FF:FF:FF', srcMac: 'AA:BB:CC:DD:EE:FF' }),
				createIPv4Layer({ srcIp: '192.168.1.1', dstIp: '255.255.255.255', protocol: 17 }),
				createUDPLayer({ srcPort: 67, dstPort: 68 }),
				createDHCPLayer({
					op: 'BOOTREPLY (2)',
					xid: '0x3903F326',
					clientMac: '00:1A:2B:3C:4D:5E',
					yourIp: '192.168.1.100',
					messageType: 'ACK',
					options: 'Subnet: 255.255.255.0, Router: 192.168.1.1, DNS: 8.8.8.8, Lease: 86400s'
				})
			]
		}
	]
};
