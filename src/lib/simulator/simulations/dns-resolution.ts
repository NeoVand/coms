import type { SimulationConfig } from '../types';
import { createUDPLayer } from '../layers/udp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';

function dnsQueryLayers(srcIp: string, dstIp: string) {
	return [
		createEthernetLayer(),
		createIPv4Layer({ srcIp, dstIp, protocol: 17 }),
		createUDPLayer({ srcPort: 53412, dstPort: 53 }),
		{
			name: 'DNS Query',
			abbreviation: 'DNS',
			osiLayer: 7,
			color: '#2DD4BF',
			headerFields: [
				{ name: 'ID', bits: 16, value: '0xA1B2', editable: false, description: 'Transaction ID — matches queries to responses' },
				{ name: 'QR', bits: 1, value: 0, editable: false, description: '0 = Query, 1 = Response' },
				{ name: 'Opcode', bits: 4, value: 0, editable: false, description: '0 = Standard query' },
				{ name: 'RD', bits: 1, value: 1, editable: false, description: 'Recursion Desired — ask the resolver to recurse on our behalf' },
				{ name: 'QDCount', bits: 16, value: 1, editable: false, description: 'Number of questions — we are asking about one domain' },
				{ name: 'QNAME', bits: 0, value: 'example.com', editable: false, description: 'The domain name we want to resolve' },
				{ name: 'QTYPE', bits: 16, value: 'A', editable: false, description: 'Query type A — requesting an IPv4 address' }
			]
		}
	];
}

function dnsResponseLayers(srcIp: string, dstIp: string, answer: string) {
	return [
		createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
		createIPv4Layer({ srcIp, dstIp, protocol: 17 }),
		createUDPLayer({ srcPort: 53, dstPort: 53412 }),
		{
			name: 'DNS Response',
			abbreviation: 'DNS',
			osiLayer: 7,
			color: '#2DD4BF',
			headerFields: [
				{ name: 'ID', bits: 16, value: '0xA1B2', editable: false, description: 'Same transaction ID — matches our query' },
				{ name: 'QR', bits: 1, value: 1, editable: false, description: '1 = Response' },
				{ name: 'AA', bits: 1, value: 1, editable: false, description: 'Authoritative Answer — this server owns the domain' },
				{ name: 'ANCount', bits: 16, value: 1, editable: false, description: 'Number of answer records' },
				{ name: 'NAME', bits: 0, value: 'example.com', editable: false, description: 'The domain name we asked about' },
				{ name: 'TYPE', bits: 16, value: 'A', editable: false, description: 'Answer type — A record (IPv4 address)' },
				{ name: 'TTL', bits: 32, value: 3600, editable: false, description: 'Time to live — cache this answer for 3600 seconds (1 hour)' },
				{ name: 'RDATA', bits: 32, value: answer, editable: false, description: 'The resolved IPv4 address', color: '#2DD4BF' }
			]
		}
	];
}

export const dnsResolution: SimulationConfig = {
	protocolId: 'dns',
	title: 'DNS Resolution — From Domain to IP',
	description:
		'Trace how a domain name like example.com gets resolved to an IP address through the hierarchical DNS system.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Your Computer', icon: 'client', position: 'left' },
		{ id: 'resolver', label: 'Resolver', icon: 'router', position: 'center' },
		{ id: 'nameserver', label: 'Nameserver', icon: 'dns', position: 'right' }
	],
	userInputs: [
		{
			id: 'domain',
			label: 'Domain to Resolve',
			type: 'text',
			defaultValue: 'example.com',
			placeholder: 'e.g. example.com'
		}
	],
	steps: [
		{
			id: 'query-resolver',
			label: 'DNS Query',
			description:
				'Your computer sends a DNS query to its configured recursive resolver (usually your ISP or 8.8.8.8). It asks: "What is the IP address for example.com?"',
			fromActor: 'client',
			toActor: 'resolver',
			duration: 1000,
			highlight: ['QNAME', 'QTYPE', 'RD'],
			layers: dnsQueryLayers('192.168.1.100', '8.8.8.8')
		},
		{
			id: 'query-root',
			label: 'Root Query',
			description:
				'The resolver doesn\'t know the answer. It starts at the top of the DNS hierarchy by asking a root nameserver: "Who handles .com domains?"',
			fromActor: 'resolver',
			toActor: 'nameserver',
			duration: 1200,
			highlight: ['QNAME'],
			layers: dnsQueryLayers('8.8.8.8', '198.41.0.4')
		},
		{
			id: 'root-referral',
			label: 'Root Referral',
			description:
				'The root nameserver doesn\'t know example.com, but it knows who handles all .com domains. It responds with a referral to the .com TLD nameserver.',
			fromActor: 'nameserver',
			toActor: 'resolver',
			duration: 1000,
			highlight: ['RDATA'],
			layers: dnsResponseLayers('198.41.0.4', '8.8.8.8', 'NS: a.gtld-servers.net')
		},
		{
			id: 'query-tld',
			label: 'TLD Query',
			description:
				'The resolver now asks the .com TLD nameserver: "Who is the authoritative nameserver for example.com?"',
			fromActor: 'resolver',
			toActor: 'nameserver',
			duration: 1200,
			highlight: ['QNAME'],
			layers: dnsQueryLayers('8.8.8.8', '192.5.6.30')
		},
		{
			id: 'tld-referral',
			label: 'TLD Referral',
			description:
				'The .com TLD nameserver responds with the authoritative nameserver for example.com. One more step to go!',
			fromActor: 'nameserver',
			toActor: 'resolver',
			duration: 1000,
			highlight: ['RDATA'],
			layers: dnsResponseLayers('192.5.6.30', '8.8.8.8', 'NS: ns1.example.com')
		},
		{
			id: 'query-auth',
			label: 'Auth Query',
			description:
				'The resolver asks the authoritative nameserver for example.com directly: "What is the A record for example.com?"',
			fromActor: 'resolver',
			toActor: 'nameserver',
			duration: 1200,
			highlight: ['QNAME', 'QTYPE'],
			layers: dnsQueryLayers('8.8.8.8', '199.43.135.53')
		},
		{
			id: 'auth-answer',
			label: 'Answer!',
			description:
				'The authoritative nameserver has the definitive answer: example.com is at 93.184.216.34. This is the final, authoritative response.',
			fromActor: 'nameserver',
			toActor: 'resolver',
			duration: 1200,
			highlight: ['RDATA', 'AA', 'TTL'],
			layers: dnsResponseLayers('199.43.135.53', '8.8.8.8', '93.184.216.34')
		},
		{
			id: 'resolver-response',
			label: 'Response',
			description:
				'The resolver caches the answer (for TTL seconds) and returns the IP address to your computer. Your browser can now connect to 93.184.216.34!',
			fromActor: 'resolver',
			toActor: 'client',
			duration: 1000,
			highlight: ['RDATA', 'TTL'],
			layers: dnsResponseLayers('8.8.8.8', '192.168.1.100', '93.184.216.34')
		}
	]
};
