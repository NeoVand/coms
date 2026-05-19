import type { Protocol } from '../types';

export const dhcp: Protocol = {
	id: 'dhcp',
	name: 'Dynamic Host Configuration Protocol',
	abbreviation: 'DHCP',
	categoryId: 'utilities',
	port: 67,
	year: 1993,
	rfc: 'RFC 2131',
	oneLiner: "Automatically assigns [[ip|IP]] addresses — plug in and you're on the network.",
	overview: `[[dhcp|DHCP]] is the reason you can connect to a [[wifi|Wi-Fi]] network and immediately start browsing. Without it, you'd have to manually configure your {{ip-address|IP address}}, {{subnet|subnet mask}}, {{gateway|gateway}}, and [[dns|DNS]] servers — for every network you join.

When your device connects to a network, it {{broadcast|broadcasts}} a [[dhcp|DHCP]] Discover message ("I need an {{ip-address|IP address}}!"). A [[dhcp|DHCP]] server responds with an offer, which the client accepts. The server then confirms and assigns the [[ip|IP]], along with all the configuration your device needs: {{subnet|subnet}} mask, {{gateway|default gateway}}, [[dns|DNS]] servers, and the {{lease|lease}} duration.

[[dhcp|DHCP]] leases are temporary — typically 1-24 hours. When a {{lease|lease}} expires, the device must renew it. This dynamic allocation means [[ip|IP]] addresses can be reused efficiently. [[dhcp|DHCP]] is simple, ubiquitous, and works transparently — one of those "invisible" {{protocol|protocols}} that makes networking just work.

For [[ipv6|IPv6]] networks, DHCPv6 (RFC 8415) provides similar functionality but with a different message flow: Solicit/Advertise replaces Discover/Offer, and Request/Reply replaces Request/{{ack|ACK}}. DHCPv6 also supports a {{stateless|stateless}} configuration mode (via {{slaac|SLAAC}} — {{slaac|Stateless Address Autoconfiguration}}) where hosts generate their own addresses and only use DHCPv6 for additional options like [[dns|DNS]] server addresses.`,
	howItWorks: [
		{
			title: 'DISCOVER (broadcast)',
			description:
				'New device {{broadcast|broadcasts}} to the entire network: "I need an {{ip-address|IP address}}." It has no [[ip|IP]] yet, so it uses 0.0.0.0 as source and 255.255.255.255 as destination.'
		},
		{
			title: 'OFFER',
			description:
				'[[dhcp|DHCP]] server(s) respond with an offered {{ip-address|IP address}}, {{subnet|subnet}} mask, gateway, [[dns|DNS]] servers, and {{lease|lease}} time. Multiple servers may offer.'
		},
		{
			title: 'REQUEST',
			description:
				'Client broadcasts its selection: "I\'ll take the offer from server X." This {{broadcast|broadcast}} ensures other servers know their offer was declined.'
		},
		{
			title: 'ACK',
			description:
				"Selected server confirms with [[dhcp|DHCP]] {{ack|ACK}}. The client configures its network interface. Done — you're online. The entire process takes milliseconds."
		}
	],
	useCases: [
		'Home and office [[wifi|Wi-Fi]] networks',
		'Enterprise network management',
		'ISP customer [[ip|IP]] assignment',
		'Container/VM orchestration',
		'Hotel and public [[wifi|Wi-Fi]] networks'
	],
	codeExample: {
		language: 'python',
		code: `from scapy.all import *

# Construct a DHCP Discover packet
dhcp_discover = (
    Ether(dst="ff:ff:ff:ff:ff:ff") /
    IP(src="0.0.0.0", dst="255.255.255.255") /
    UDP(sport=68, dport=67) /
    BOOTP(chaddr=get_if_hwaddr(conf.iface)) /
    DHCP(options=[
        ("message-type", "discover"),
        ("hostname", "my-device"),
        "end"
    ])
)

# Send and wait for DHCP Offer
ans = srp1(dhcp_discover, timeout=5, verbose=0)
if ans:
    offered_ip = ans[BOOTP].yiaddr
    print(f"Offered IP: {offered_ip}")`,
		caption: 'Scapy lets you construct and send raw [[dhcp|DHCP]] packets — see the {{dora|DORA}} process in action',
		alternatives: [
			{
				language: 'javascript',
				code: `const dhcp = require('dhcp');

// Create a DHCP server
const server = dhcp.createServer({
  range: ['192.168.1.100', '192.168.1.200'],
  netmask: '255.255.255.0',
  router: ['192.168.1.1'],
  dns: ['8.8.8.8', '1.1.1.1'],
  server: '192.168.1.1',
  leaseTime: 3600  // 1 hour
});

server.on('bound', (state) => {
  console.log('Assigned:', state.address,
              'to', state.mac);
});

server.listen();`
			},
			{
				language: 'cli',
				code: `# Request a new DHCP lease
sudo dhclient -v eth0

# Release the current lease
sudo dhclient -r eth0

# View current DHCP lease details
cat /var/lib/dhcp/dhclient.leases

# Monitor DHCP traffic on the network
sudo tcpdump -i eth0 port 67 or port 68 -v

# Show current IP configuration (from DHCP)
ip addr show eth0`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'DISCOVER + OFFER',
						code: `DHCP DISCOVER:
  Op: BOOTREQUEST (1)
  HType: Ethernet (1)
  Transaction ID: 0x3903F326
  Client MAC: 00:1A:2B:3C:4D:5E
  Client IP: 0.0.0.0
  Your IP: 0.0.0.0
  Broadcast: 255.255.255.255

  Options:
    (53) Message Type: DISCOVER
    (55) Parameter Request:
      Subnet Mask, Router, DNS, Domain Name
    (61) Client Identifier: 00:1A:2B:3C:4D:5E

---

DHCP OFFER:
  Op: BOOTREPLY (2)
  Transaction ID: 0x3903F326
  Your IP: 192.168.1.100
  Server IP: 192.168.1.1

  Options:
    (53) Message Type: OFFER
    (1)  Subnet Mask: 255.255.255.0
    (3)  Router: 192.168.1.1
    (6)  DNS: 8.8.8.8, 8.8.4.4
    (51) Lease Time: 86400 (24 hours)
    (54) Server Identifier: 192.168.1.1`
					},
					{
						title: 'REQUEST + ACK',
						code: `DHCP REQUEST:
  Op: BOOTREQUEST (1)
  Transaction ID: 0x3903F326
  Client MAC: 00:1A:2B:3C:4D:5E
  Client IP: 0.0.0.0

  Options:
    (53) Message Type: REQUEST
    (50) Requested IP: 192.168.1.100
    (54) Server Identifier: 192.168.1.1

---

DHCP ACK:
  Op: BOOTREPLY (2)
  Transaction ID: 0x3903F326
  Your IP: 192.168.1.100

  Options:
    (53) Message Type: ACK
    (1)  Subnet Mask: 255.255.255.0
    (3)  Router: 192.168.1.1
    (6)  DNS: 8.8.8.8, 8.8.4.4
    (51) Lease Time: 86400
    (58) Renewal Time: 43200
    (59) Rebinding Time: 75600`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Full DORA cycle: ~100-500ms. Renewal: single RTT.',
		throughput: 'Not applicable — DHCP is one-time configuration, not data transfer',
		overhead:
			'Fixed BOOTP header is 236 bytes, but minimum on-wire DHCP frame is larger (300+ bytes with required options and Ethernet/IP/UDP headers). UDP-based, broadcast-heavy.'
	},
	connections: ['udp', 'dns', 'arp', 'mdns-dns-sd'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc2131'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/DHCP_session.svg/500px-DHCP_session.svg.png',
		alt: 'Sequence diagram of the DHCP DORA process: Discover, Offer, Request, and Acknowledge messages between client and server',
		caption:
			'The [[dhcp|DHCP]] {{dora|DORA}} process — Discover (client broadcasts "I need an [[ip|IP]]"), Offer (server proposes an address), Request (client accepts), Acknowledge (server confirms the {{lease|lease}}). This four-step {{handshake|handshake}} happens every time a device joins a network.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
