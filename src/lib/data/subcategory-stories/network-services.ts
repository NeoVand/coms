import type { SubcategoryStory } from './types';

export const networkServicesStory: SubcategoryStory = {
	subcategoryId: 'network-services',
	tagline:
		'Invisible plumbing — the protocols that make a network "just work" without anyone configuring anything',
	sections: [
		{
			type: 'narrative',
			title: 'The Plumbing You Never See',
			text: `When you plug a laptop into a network and a webpage loads, dozens of protocol conversations have already happened — none of them initiated by you. They're the invisible plumbing, and four protocols dominate that category:\n\n- **[[dhcp|DHCP]]** ([[rfc:2131|RFC 2131]], 1997) handed you an IP address, a subnet mask, a default gateway, and a [[dns|DNS]] resolver. Without it, you'd have to know all four and type them in. DHCP is why "join a network" is one click.\n- **[[ntp|NTP]]** ([[rfc:5905|RFC 5905]], 2010 — earlier RFCs back to 1985) synchronized your clock to within tens of milliseconds of UTC. Modern cryptography depends on accurate clocks (certificates have validity windows; Kerberos tickets have 5-minute skew tolerance; OAuth tokens have \`exp\` claims). NTP is why your laptop's clock is right even if you never set it.\n- **[[mdns-dns-sd|mDNS/DNS-SD]]** ([[rfc:6762|RFC 6762]] / [[rfc:6763|RFC 6763]], 2013) made your printer visible to your laptop on the local network with no configuration. Originally Apple's Bonjour; standardized via the IETF. Multicast DNS queries on the local link discover \`_printer._tcp.local\`, \`_airplay._tcp.local\`, \`_googlecast._tcp.local\`.\n- **[[nat-traversal|NAT traversal]]** (a family of techniques — {{stun|STUN}}, {{turn|TURN}}, {{ice|ICE}}, hole-punching) lets two devices behind different NATs talk directly. Without it, peer-to-peer video calling, online gaming, and decentralized apps would all be impossible (or relayed through expensive servers). The protocol stack that makes "two phones on cellular networks can video-call each other" actually work.\n\nNone of these are protocols you ever choose. They're what makes the network *feel* invisible. They're also among the most operationally critical pieces of infrastructure on the Internet — when DHCP breaks, no one gets online; when NTP drifts, half your security stack starts rejecting connections; when mDNS chatters, your office Wi-Fi gets noisy; when NAT traversal fails, your video call drops.`
		},
		{
			type: 'pioneers',
			title: 'The Plumbing Architects',
			people: [
				{
					id: 'ted-lemon',
					name: 'Ted Lemon',
					years: '–',
					title: 'DHCP Implementer / Stewart',
					org: 'Internet Software Consortium / Apple / Independent',
					contribution:
						'Implemented and maintained ISC DHCP — the reference open-source DHCP server and client for two decades — and authored major DHCP-related RFCs including IPv6 DHCP, dynamic DNS updates, and the modern DHCPv4 reliability extensions. ISC DHCP shipped in essentially every Linux distribution, BSD, and embedded router for years; Lemon\\\'s sustained engineering is one of the reasons "plug it in and it works" is a universal expectation.'
				},
				{
					id: 'david-mills',
					name: 'David Mills',
					years: '1938–2024',
					title: 'Author of NTP',
					org: 'University of Delaware',
					contribution:
						"Designed [[ntp|NTP]] in 1981 and maintained the reference implementation (ntpd) until 2017. NTP\\'s clever stratum-based hierarchy (stratum 0 = atomic clock; stratum 1 = directly synced to one; stratum 16 = unsynced) and its careful statistical clock-selection algorithms produce sub-millisecond accuracy across networks with seconds of round-trip variance. NTP is one of those protocols where the design has lasted nearly unchanged for 40 years because it was correct the first time."
				},
				{
					id: 'stuart-cheshire',
					name: 'Stuart Cheshire',
					years: '–',
					title: 'mDNS / Bonjour Designer',
					org: 'Apple',
					contribution:
						"Designed Apple\\'s Bonjour — the consumer-facing brand for [[mdns-dns-sd|multicast DNS]] and DNS-based Service Discovery — and shepherded the IETF standards ([[rfc:6762|RFC 6762]] for mDNS, [[rfc:6763|RFC 6763]] for DNS-SD) that made it interoperable. Bonjour is why your iPhone sees the printer the moment it joins your home Wi-Fi. Cheshire also did the original work on the Bonjour Sleep Proxy that lets a device proxy mDNS responses for sleeping peers."
				},
				{
					id: 'bryan-ford',
					name: 'Bryan Ford',
					years: '–',
					title: 'NAT Traversal Researcher',
					org: 'MIT / Yale / EPFL',
					contribution:
						'Co-authored the seminal 2005 USENIX paper "Peer-to-Peer Communication Across Network Address Translators" with Pyda Srisuresh and Dan Kegel. The paper laid out the taxonomy of NAT behaviors (full cone, restricted cone, port-restricted cone, symmetric) and the hole-punching techniques that became {{stun|STUN}} / {{turn|TURN}} / {{ice|ICE}}. Without this work, modern peer-to-peer (WebRTC, BitTorrent peer discovery, IPFS, blockchain peer networks) would be vastly more expensive or impossible.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1981,
					title: 'NTP First Version (RFC 778)',
					description:
						'[[pioneer:david-mills|Mills]] publishes the first NTP version. Time synchronization on the early Internet was previously ad-hoc; NTP would standardize it for 40+ years.'
				},
				{
					year: 1985,
					title: 'BOOTP (RFC 951)',
					description:
						'Bootstrap Protocol — the predecessor to DHCP. Designed for diskless workstations that needed to learn their IP and load a boot image. Static mappings; no lease management.'
				},
				{
					year: 1993,
					title: 'DHCP RFC 1531',
					description:
						'[[dhcp|DHCP]] extends BOOTP with dynamic address pools and leases. Every workstation can get an address without a configured mapping.'
				},
				{
					year: 1997,
					title: 'DHCP RFC 2131',
					description:
						'The current DHCP specification. The DORA exchange (Discover, Offer, Request, Acknowledge) is canonical.'
				},
				{
					year: 2002,
					title: 'Apple Ships Bonjour',
					description:
						'Apple includes Bonjour (multicast DNS + service discovery) in Mac OS X 10.2. The first widely-deployed zero-configuration networking on a mainstream OS.'
				},
				{
					year: 2005,
					title: 'Bryan Ford Taxonomizes NAT Behavior',
					description:
						"The seminal NAT-traversal paper. Defines hole-punching for [[udp|UDP]] and [[tcp|TCP]] through symmetric NATs. The foundation for WebRTC's ICE/STUN/TURN."
				},
				{
					year: 2005,
					title: 'STUN RFC 3489',
					description:
						'Session Traversal Utilities for NAT — the first IETF protocol that lets a client behind a NAT learn its public-facing address.'
				},
				{
					year: 2008,
					title: 'STUN RFC 5389',
					description:
						'STUN revised. The original protocol\'s name is changed ("Simple" → "Session") to reflect its role beyond pure address discovery.'
				},
				{
					year: 2010,
					title: 'ICE RFC 5245',
					description:
						'Interactive Connectivity Establishment — the framework that gathers all possible network candidates and probes connectivity to find the best path between two NAT-bound peers. The foundation of WebRTC NAT traversal.'
				},
				{
					year: 2010,
					title: 'NTP RFC 5905',
					description:
						'The current NTP specification (NTPv4). Adds extension fields, improved security.'
				},
				{
					year: 2013,
					title: 'mDNS/DNS-SD Standardized (RFCs 6762/6763)',
					description:
						"After a decade of Bonjour-as-Apple, the IETF finalizes the standards. Linux Avahi and Windows native mDNS interop with Apple's implementation."
				},
				{
					year: 2017,
					title: 'NTS — Network Time Security (RFC 8915 draft)',
					description:
						'NTP gets a modern security story. Authenticated NTP messages without the per-association key configuration NTP authentication had previously required. RFC 8915 publishes in 2020.'
				},
				{
					year: 2020,
					title: 'NTS RFC 8915',
					description:
						'Network Time Security ships. The first widely-deployable, scalable authenticated NTP. Cloudflare runs time.cloudflare.com with NTS; Netnod, Hetzner, and others follow.'
				},
				{
					year: 2024,
					title: 'IPv6-only Networks Grow',
					description:
						'Apple, T-Mobile, Verizon, and major datacenters run IPv6-only networks with NAT64/DNS64 for legacy IPv4 traffic. NAT traversal still matters because IPv6 firewalls block inbound — but the address-exhaustion driver for NAT is fading.'
				}
			]
		},
		{
			type: 'comparison',
			title: 'The Four Plumbing Protocols',
			axes: ['What it does', 'When it runs', 'Failure symptom', 'Modern variant'],
			rows: [
				{
					label: '[[dhcp|DHCP]]',
					values: [
						'Assigns IP, mask, gateway, DNS',
						'When you join the network (and lease renewals)',
						'"No network connection" — you have no IP',
						'DHCPv6 (for IPv6 stateful); SLAAC for stateless IPv6'
					]
				},
				{
					label: '[[ntp|NTP]]',
					values: [
						'Syncs system clock to UTC',
						'Continuously (background)',
						'Time wrong → cert errors, auth failures, log analysis chaos',
						'NTS (authenticated NTP); chrony as the reference daemon'
					]
				},
				{
					label: '[[mdns-dns-sd|mDNS / DNS-SD]]',
					values: [
						'Local-network name resolution + service discovery',
						'When you ask for a `.local` name or browse for a service type',
						'"Printer doesn\'t show up" — service discovery silently fails',
						'Used by AirPlay, Chromecast, AirPrint, Matter device commissioning'
					]
				},
				{
					label: '[[nat-traversal|NAT traversal]] (STUN/TURN/ICE)',
					values: [
						'Establishes peer-to-peer through NATs',
						'When two peers want a direct connection',
						'Video call goes through a relay (slow), or fails entirely',
						'WebRTC, peer-to-peer gaming, BitTorrent, IPFS'
					]
				}
			],
			note: 'These four are independent — your laptop runs DHCP at boot, NTP continuously, mDNS on demand, and ICE only when an app needs peer-to-peer. They\'re grouped here because they\'re what makes "the network just works."'
		},
		{
			type: 'animated-sequence',
			title: 'DHCP DORA Exchange',
			definition: `sequenceDiagram
    participant C as Client
    participant S as DHCP Server
    participant N as Network
    Note over C,S: Client has no IP yet — broadcasts on the link
    C->>N: DHCPDISCOVER broadcast, src 0.0.0.0
    Note over S: server sees broadcast, has pool to offer
    S->>N: DHCPOFFER broadcast, offering 192.168.1.42 with gw
    Note over C: client picks an offer if multiple servers respond
    C->>N: DHCPREQUEST broadcast — tells all servers which offer it picked
    S->>N: DHCPACK broadcast, lease confirmed, lease time 24h
    Note over C: client configures interface — IP, mask, gateway, DNS
    Note over C: client starts NTP and DNS queries using new config
    Note over C,S: At half the lease elapsed — DHCPREQUEST unicast to renew
    C->>S: DHCPREQUEST renew
    S-->>C: DHCPACK lease extended`,
			caption:
				"DHCP's 4-step DORA (Discover, Offer, Request, Acknowledge) is one of the most-executed protocol exchanges on the Internet. Every laptop on every café Wi-Fi runs it within seconds of joining. The broadcast-based design — needed because the client has no IP yet — is why DHCP is a link-local protocol; it doesn't cross routers without a relay.",
			steps: {
				0: "**The setup.** A new device joins a network. It has no IP address, doesn't know the gateway, has no DNS server. Everything below has to bootstrap from nothing.",
				1: '**D — Discover.** Client broadcasts a DHCPDISCOVER with source 0.0.0.0 (no IP) and destination 255.255.255.255 (everyone on this segment). The MAC source is the real NIC MAC, so servers can reply.',
				2: '**Server sees the broadcast.** Any DHCP server on the segment picks it up. The server checks its address pool and finds a free IP to offer.',
				3: '**O — Offer.** Server broadcasts a DHCPOFFER (also broadcast because the client has no IP to unicast to yet) offering 192.168.1.42, subnet mask, default gateway, DNS resolver, and lease duration.',
				4: '**Multiple servers may respond.** In a network with redundant DHCP servers, several offers may come in. The client picks one — typically the first, or by criteria like server preference.',
				5: '**R — Request.** Client broadcasts a DHCPREQUEST naming the chosen server and the chosen IP. The broadcast lets the *other* DHCP servers know their offers can be released.',
				6: '**A — Ack.** The chosen server confirms with DHCPACK. The lease is now committed. Default lease is 24 hours in most home routers, longer in enterprise.',
				7: '**Configure the interface.** Client sets its IP, subnet mask, default gateway, and DNS resolver from the ACK. The client is now properly on the network.',
				8: '**Bootstrap services.** With IP + gateway + DNS, the client can now start NTP (to fix the clock), resolve hostnames, and do whatever the user actually wanted to do.',
				9: "**Lease renewal.** At T/2 elapsed (half the lease), the client tries to renew with the *same* server. This is unicast — no need to broadcast since the client knows the server's address.",
				10: 'Client sends a **unicast DHCPREQUEST** to renew.',
				11: 'Server confirms with **DHCPACK**, extending the lease. If the server fails to respond, the client falls back to broadcasting at T*7/8 to find any DHCP server. The address space is reclaimed cleanly when leases expire.'
			}
		},
		{
			type: 'callout',
			title: 'The NAT Problem in One Paragraph',
			text: `**Network Address Translation** was a hack from the 1990s to stretch the IPv4 address space. Your home router gets one public IP from your ISP; it shares that one address across all your devices by mangling the source IP and port of outgoing packets and remembering the mapping so it can route the replies back. It worked. It also broke the fundamental Internet model.\n\nThe original Internet assumption: every host has a globally-routable address and can be reached by any other host. NAT broke that. Behind NAT, *your devices can talk out but the world can't talk in*. This is fine for browsing the web — you initiate; the server replies. It's catastrophic for any protocol where someone needs to call *you* — incoming SIP calls, peer-to-peer file sharing, hosted games, decentralized apps.\n\nThe NAT-traversal stack ({{stun|STUN}} / {{turn|TURN}} / {{ice|ICE}}) is the workaround. **{{stun|STUN}}** lets you discover what your public IP+port looks like from outside, so you can publish it. **Hole-punching** is the trick where two peers simultaneously send packets to each other — both NATs see "an outgoing packet" and open the return path. **{{turn|TURN}}** is the fallback when hole-punching fails — both peers send to a public relay, which forwards. **{{ice|ICE}}** orchestrates trying every candidate and picking the best one.\n\n[[ipv6|IPv6]] was supposed to eliminate the need for all this by giving every device a globally routable address. It mostly hasn't — IPv6 firewalls still block inbound by default for security reasons, so NAT traversal still applies. The 1990s hack is still everyone's problem in 2025.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[dhcp|DHCP]]'s failure mode is **lease conflicts**. If two DHCP servers run on the same broadcast domain (intentionally or by accident — someone plugged a home router into the corporate LAN backwards), clients get conflicting addresses and unpredictable connectivity. The classic "rogue DHCP server" incident takes down whole networks until found. The defense — DHCP snooping in switches — exists but isn't universal.\n\n[[ntp|NTP]]'s failure mode is **trust**. Until NTS (2020), NTP had no authentication in practice. A malicious upstream server could lie about the time, breaking everything downstream that depended on it. NTP also can't handle clock jumps gracefully — \`ntpdate\` style step adjustments break running processes (Java GC pauses, database transactions, log timestamps). chrony's slewing approach (slowly drift the clock toward correct) is the modern answer; pre-chrony NTP just stepped.\n\n[[mdns-dns-sd|mDNS]]'s failure mode is **traffic on busy networks**. Multicast on a wireless network is sent at the lowest common rate of all clients on the channel; in a conference Wi-Fi with hundreds of devices, mDNS traffic can dominate the network. Apple's Bonjour Sleep Proxy and various "mDNS reflector" features in enterprise APs exist to filter the chatter. The 2017 release notes for Cisco/Aruba/Meraki all include some flavor of mDNS optimization.\n\n[[nat-traversal|NAT traversal]]'s failure mode is **the symmetric NAT**. Most home NATs are well-behaved enough for hole-punching to work; some carrier-grade NATs (CGNAT) used by cellular networks are symmetric — they assign a different external port per *destination*. Hole-punching can't work in that case; TURN relay is the only option. Roughly 5–15% of WebRTC calls end up requiring TURN; the bandwidth cost for the relay operator is real.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **NTS** (Network Time Security) is rolling out at major time providers (Cloudflare, Netnod). The first credible authenticated NTP in production. NTP's 40-year security gap is finally closing.\n- **DHCP options for IoT** — DHCPv6 keeps getting options for device-management URLs, manufacturer hints, and Matter commissioning. Even DHCP — designed in 1993 — keeps growing.\n- **Matter / Thread commissioning** uses mDNS extensively for device discovery on the home network. The Matter spec mandates DNS-SD service browsing for smart-home device pairing — extending Bonjour into every consumer-IoT product.\n- **IPv6-only networks** + NAT64 + DNS64 are growing in mobile carriers and datacenter networks. The "every device has a routable address" promise is finally semi-real; NAT traversal still matters because firewalls still block inbound, but the variety of NAT pathologies is reducing.\n- **Tailscale-style mesh VPNs** (Tailscale, Headscale, Netbird, NetMaker) are essentially "NAT traversal as a service" — they bundle STUN/TURN/ICE, key management, and routing into one product. The protocols underneath are the same ICE family; the developer experience is finally good.\n- **TLS-protected DHCP** (DHCP over TLS) remains a niche request. DHCP's plaintext design is increasingly out of step with the rest of the network stack, but the broadcast-based first-message design is hard to encrypt.\n- **The truth about these protocols**: they don't need to change much. The job is invisible, the protocols mostly work, the operational pain is in the configuration and tooling around them rather than in the protocols themselves.`
		}
	]
};
