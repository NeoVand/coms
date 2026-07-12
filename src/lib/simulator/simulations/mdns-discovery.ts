import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createUDPLayer } from '../layers/udp';
import { createMDNSLayer } from '../layers/mdns';

export const mdnsDiscovery: SimulationConfig = {
	protocolId: 'mdns-dns-sd',
	title: 'mDNS / DNS-SD — Probe, Announce, Discover, Goodbye',
	description:
		'Watch a new printer claim `office-printer.local`, announce its IPP service, get discovered by a laptop browsing for `_ipp._tcp`, and send a clean goodbye on shutdown. The full Bonjour lifecycle on one link.',
	tier: 'server',
	actors: [
		{ id: 'printer', label: 'Printer (responder)', icon: 'device', position: 'left' },
		{ id: 'laptop', label: 'Laptop (querier)', icon: 'client', position: 'right' }
	],
	userInputs: [
		{
			id: 'hostname',
			label: 'Candidate hostname',
			type: 'text',
			defaultValue: 'office-printer.local',
			placeholder: 'name.local'
		},
		{
			id: 'serviceType',
			label: 'Service type',
			type: 'text',
			defaultValue: '_ipp._tcp.local',
			placeholder: '_<service>._<proto>.local'
		}
	],
	steps: [
		{
			id: 'probe-1',
			label: 'Probe Query #1',
			description:
				'Printer wakes up with a candidate hostname. Before claiming it, the printer asks the link: "does anyone already own `office-printer.local`?" Sends one Query, multicast to `224.0.0.251`. Waits 250 ms for any defending response.',
			fromActor: 'printer',
			toActor: 'laptop',
			duration: 1100,
			highlight: ['Question / Answer'],
			layers: [
				createEthernetLayer({ dstMac: '01:00:5E:00:00:FB' }),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '224.0.0.251', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x0000 (Query)',
					qdcount: 1,
					body: 'office-printer.local ANY IN (with unicast-response bit)'
				})
			]
		},
		{
			id: 'probe-2',
			label: 'Probe Query #2',
			description:
				'Second probe, 250 ms later. Still no response from the link — nobody is defending the name. Three probes are required to handle bursty packet loss on busy Wi-Fi.',
			fromActor: 'printer',
			toActor: 'laptop',
			duration: 1000,
			highlight: ['Question / Answer'],
			layers: [
				createEthernetLayer({ dstMac: '01:00:5E:00:00:FB' }),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '224.0.0.251', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x0000 (Query)',
					qdcount: 1,
					body: 'office-printer.local ANY IN (unicast-response bit)'
				})
			]
		},
		{
			id: 'probe-3',
			label: 'Probe Query #3 — name claimed',
			description:
				'Third probe. 750 ms total for the conflict-resolution phase. Still silence. The printer now owns `office-printer.local`. If any host had responded with a matching record, the printer would have picked `office-printer-2.local` and started the probe sequence over.',
			fromActor: 'printer',
			toActor: 'laptop',
			duration: 1000,
			highlight: ['Question / Answer'],
			layers: [
				createEthernetLayer({ dstMac: '01:00:5E:00:00:FB' }),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '224.0.0.251', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x0000 (Query)',
					qdcount: 1,
					body: 'office-printer.local ANY IN (unicast-response bit)'
				})
			]
		},
		{
			id: 'announce',
			label: 'Announce (cache-flush set)',
			description:
				"Printer announces its identity with a multicast Response. PTR maps `_ipp._tcp.local` → its instance name; SRV gives the host:port; TXT carries protocol metadata (resource path, supported PDLs); A maps the hostname to the IP. The unique SRV/TXT/A records set the **cache-flush** bit (high bit of RRCLASS) so receivers replace stale entries; the shared PTR browse record does not (RFC 6762 §10.2 — it would otherwise evict other printers' PTRs).",
			fromActor: 'printer',
			toActor: 'laptop',
			duration: 1300,
			highlight: ['Flags', 'ANCOUNT', 'Question / Answer'],
			data: 'PTR (shared, no cache-flush) + SRV/TXT/A (unique, cache-flush)',
			layers: [
				createEthernetLayer({ dstMac: '01:00:5E:00:00:FB' }),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '224.0.0.251', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x8400 (Response, AA=1)',
					qdcount: 0,
					ancount: 4,
					body: 'PTR (class IN 0x0001) + SRV (port=631) + TXT (rp=ipp/print) + A (192.168.1.42), cache-flush (0x8001) on SRV/TXT/A only'
				})
			]
		},
		{
			id: 'sd-query',
			label: 'DNS-SD Browse — PTR query for _ipp._tcp',
			description:
				'User on the laptop opens the print dialog. macOS / Windows / Linux sends a PTR query for `_ipp._tcp.local` — *"what IPP printers exist on this link?"* The unicast-response bit set in QCLASS (high bit) tells responders to reply unicast — saves multicast bandwidth when only one host needs the answer.',
			fromActor: 'laptop',
			toActor: 'printer',
			duration: 1200,
			highlight: ['Question / Answer'],
			layers: [
				createEthernetLayer({ srcMac: '11:22:33:44:55:66', dstMac: '01:00:5E:00:00:FB' }),
				createIPv4Layer({ srcIp: '192.168.1.50', dstIp: '224.0.0.251', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x0000 (Query)',
					qdcount: 1,
					body: '_ipp._tcp.local PTR IN (unicast-response bit)'
				})
			]
		},
		{
			id: 'sd-response',
			label: 'PTR Response (unicast)',
			description:
				'Printer responds — unicast this time (because the querier set the unicast-response bit). Just the PTR pointing to its service instance. The laptop will follow up with SRV+TXT+A queries to complete the resolution.',
			fromActor: 'printer',
			toActor: 'laptop',
			duration: 1200,
			highlight: ['Flags', 'Question / Answer'],
			data: 'PTR → "Office Printer._ipp._tcp.local"',
			layers: [
				createEthernetLayer({ dstMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '192.168.1.50', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x8400 (Response, AA=1)',
					qdcount: 0,
					ancount: 1,
					body: '_ipp._tcp.local PTR Office Printer._ipp._tcp.local'
				})
			]
		},
		{
			id: 'sd-resolve',
			label: 'SRV + TXT + A — resolve the instance',
			description:
				"Laptop now wants the host:port and the metadata. One query with multiple Question entries — and *known-answer suppression*: it lists records it already has so the responder only sends what's new. The printer responds with everything the laptop needs to open an IPP connection.",
			fromActor: 'printer',
			toActor: 'laptop',
			duration: 1300,
			highlight: ['ANCOUNT', 'Question / Answer'],
			data: 'SRV=:631 + TXT=rp=ipp/print + A=192.168.1.42',
			layers: [
				createEthernetLayer({ dstMac: '11:22:33:44:55:66' }),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '192.168.1.50', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x8400 (Response, AA=1)',
					qdcount: 0,
					ancount: 3,
					body: 'SRV "Office Printer..." 0 0 631 office-printer.local + TXT rp=ipp/print + A 192.168.1.42'
				})
			]
		},
		{
			id: 'goodbye',
			label: 'Goodbye (TTL=0 on shutdown)',
			description:
				'At shutdown, the printer multicasts one Response with TTL=0 for every record it owns. Every receiver immediately flushes those entries from its cache. (A crash-exit skips this step — records age out at their normal TTL: 120 s for hostnames, 4500 s for service records.)',
			fromActor: 'printer',
			toActor: 'laptop',
			duration: 1000,
			highlight: ['ANCOUNT', 'Question / Answer'],
			layers: [
				createEthernetLayer({ dstMac: '01:00:5E:00:00:FB' }),
				createIPv4Layer({ srcIp: '192.168.1.42', dstIp: '224.0.0.251', protocol: 17, ttl: 255 }),
				createUDPLayer({ srcPort: 5353, dstPort: 5353 }),
				createMDNSLayer({
					txid: '0x0000',
					flags: '0x8400 (Response, AA=1)',
					qdcount: 0,
					ancount: 4,
					body: 'PTR + SRV + TXT + A all with TTL=0 (goodbye)'
				})
			]
		}
	]
};
