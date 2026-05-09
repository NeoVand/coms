import type { Protocol } from '../types';

export const bgp: Protocol = {
	id: 'bgp',
	name: 'Border Gateway Protocol',
	abbreviation: 'BGP',
	categoryId: 'network-foundations',
	port: 179,
	year: 1989,
	rfc: 'RFC 4271',
	oneLiner:
		'The routing protocol of the internet — how autonomous systems find paths to each other.',
	overview: `BGP is the protocol that holds the internet together. The internet isn't a single network — it's a network of networks, each called an Autonomous System (AS). Your ISP is an AS. Google is an AS. Amazon, universities, governments — each is an AS with its own number. BGP is how they learn to reach each other.

When you visit a website, your {{packet|packets}} may cross 5-10 different autonomous systems. BGP is the protocol that calculated that path. Each BGP router maintains a {{routing-table|table}} of every reachable IP prefix on the internet (~1 million entries) along with the AS_PATH — the sequence of autonomous systems to traverse. BGP is a path-vector protocol: it doesn't just know the next hop, it knows the entire AS-level path.

BGP runs over [[tcp|TCP]] port 179, relying on TCP's reliable delivery because routing information must never be lost or corrupted. Two BGP routers ("peers") establish a session by exchanging OPEN messages, then continuously exchange UPDATE messages as routes are announced or withdrawn. {{keep-alive|KEEPALIVE}} messages every ~30 seconds prove the peer is still alive.

A fundamental distinction in BGP is between eBGP (External BGP) and iBGP (Internal BGP). eBGP runs between routers in different autonomous systems — this is the inter-domain routing that connects the internet. iBGP runs between routers within the same AS, distributing externally learned routes internally. The two behave differently: eBGP modifies the AS_PATH on each hop, while iBGP does not, requiring either a full mesh of iBGP peers or route reflectors to prevent loops.

The consequences of BGP mistakes are enormous. The Facebook outage of October 2021 — which took down Facebook, Instagram, and WhatsApp for six hours — was caused by a BGP misconfiguration that withdrew all of Facebook's routes from the internet. BGP route hijacks, where an AS announces routes it doesn't own, can redirect traffic through malicious networks.`,
	howItWorks: [
		{
			title: 'TCP session establishment',
			description:
				'BGP peers open a TCP connection on port 179. Unlike most protocols, BGP uses TCP for reliability — routing information must never be lost, duplicated, or reordered.'
		},
		{
			title: 'OPEN exchange',
			description:
				'Both routers exchange OPEN messages containing their AS number, BGP identifier (router IP), proposed hold time, and supported capabilities like 4-byte AS numbers.'
		},
		{
			title: 'KEEPALIVE confirmation',
			description:
				'Each router confirms the session with a KEEPALIVE (the smallest BGP message — just 19 bytes). The session enters the Established state and route exchange begins.'
		},
		{
			title: 'UPDATE announcements',
			description:
				'Routers exchange UPDATE messages containing reachable prefixes (NLRI) with path attributes: AS_PATH, NEXT_HOP, LOCAL_PREF, MED. Each UPDATE can announce new routes or withdraw old ones.'
		},
		{
			title: 'Ongoing operation',
			description:
				'Routers send KEEPALIVEs every ~30 seconds to prove liveness. UPDATEs flow whenever routes change. NOTIFICATION messages signal fatal errors and close the session.'
		}
	],
	useCases: [
		'Internet backbone routing between ISPs and content providers',
		'Enterprise multi-homing (connecting to multiple ISPs for redundancy)',
		'Cloud provider network peering (AWS, Google, Azure edge networks)',
		'Internet Exchange Point (IXP) route exchange',
		'Content delivery network (CDN) anycast routing'
	],
	codeExample: {
		language: 'python',
		code: `# ExaBGP — programmatic BGP route announcements
# exabgp.conf:
neighbor 10.0.0.2 {
    router-id 10.0.0.1;
    local-as 65001;
    peer-as 65002;

    static {
        route 192.168.0.0/16 next-hop self;
        route 10.10.0.0/24 next-hop self
            community 65001:100;
    }
}`,
		caption:
			'BGP is typically configured on routers — ExaBGP allows programmatic control from Python',
		alternatives: [
			{
				language: 'cli',
				code: `# Cisco IOS BGP configuration
router bgp 65001
  neighbor 10.0.0.2 remote-as 65002
  network 192.168.0.0 mask 255.255.0.0

# Show BGP routing table
show ip bgp

# Show BGP neighbor status
show ip bgp summary

# View path to specific prefix
show ip bgp 172.16.0.0/12

# Debug BGP updates
debug ip bgp updates`
			},
			{
				language: 'javascript',
				code: `// Parse BGP MRT dump data with bgpkit
import { BgpkitParser } from 'bgpkit-parser';

const parser = new BgpkitParser(
  'rib.20240101.0000.bz2'
);

for await (const elem of parser) {
  console.log(
    elem.prefix,
    'via AS path:', elem.as_path,
    'from peer:', elem.peer_asn
  );
}`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'OPEN Message',
						code: `BGP OPEN:
  Marker: FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF
  Length: 41
  Type: OPEN (1)
  Version: 4
  My AS: 65001
  Hold Time: 90
  BGP Identifier: 10.0.0.1
  Optional Parameters:
    Capability: 4-byte ASN support
    Capability: Route Refresh`
					},
					{
						title: 'UPDATE Message',
						code: `BGP UPDATE:
  Marker: FF FF FF FF (16 bytes)
  Length: 52
  Type: UPDATE (2)
  Withdrawn Routes Length: 0
  Path Attributes:
    ORIGIN: IGP
    AS_PATH: 65001
    NEXT_HOP: 10.0.0.1
    LOCAL_PREF: 100
  NLRI (reachable):
    192.168.0.0/16`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Session setup: seconds ([[tcp|TCP]] {{handshake|handshake}} + OPEN exchange). Convergence after change: seconds to minutes depending on network size and policy.',
		throughput:
			'Full internet {{routing-table|routing table}}: ~1M IPv4 prefixes. Initial table transfer can take 30-60 seconds between peers.',
		overhead:
			'19-byte minimum header (16-byte marker + 2-byte length + 1-byte type). UPDATE messages vary by prefix count and path attributes.'
	},
	connections: ['tcp', 'dns', 'ip'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Border_Gateway_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc4271'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ARPA_Network%2C_Logical_Map%2C_September_1973.jpg/500px-ARPA_Network%2C_Logical_Map%2C_September_1973.jpg',
		alt: 'ARPA Network logical map from September 1973 showing network nodes and satellite links',
		caption:
			'ARPANET logical map, September 1973 — showing the early internet backbone topology including satellite links to Hawaii and London. BGP was created in 1989 to replace the original routing protocols that managed networks like this one.',
		credit: 'Image: Bolt Beranek and Newman Inc. / Public Domain, via Wikimedia Commons'
	},

	recentChanges: [
		{
			date: '2026',
			title: 'RPKI/ROV crosses 50% of advertised IP space',
			description:
				'NIST Route Origin Validation Monitor and Cloudflare\'s isbgpsafeyet.com show over 50% of advertised IPv4 space now covered by signed Route Origin Authorisations. Most tier-1 transits enforce ROV on incoming announcements.'
		},
		{
			date: '2024-2025',
			title: 'ASPA reaches late-stage IETF draft',
			description:
				'AS Provider Authorisation extends RPKI to AS-path validation — closing the route-leak hole that origin validation alone cannot fix. Standards finalisation expected 2026-2027.',
			source: { url: 'https://datatracker.ietf.org/wg/sidrops/about/', label: 'IETF SIDROPS WG' }
		},
		{
			date: '2024-01',
			title: 'TCP-AO ships in Linux 6.7 for BGP',
			description:
				'Native TCP Authentication Option ([[rfc:5925|RFC 5925]]) lands in Linux, finally giving BGP sessions a modern replacement for the deprecated TCP-MD5. Cisco IOS-XR and Junos already supported it; Linux was the long-pole.'
		}
	],

	realWorldDeployments: [
		{
			org: 'Tier-1 transit (Lumen, Telia, NTT, GTT, Cogent, Tata)',
			scale: '~1M IPv4 + 200k IPv6 routes',
			description:
				'Every tier-1 backbone runs BGP with the full global routing table on every border router. Memory and route-processor capacity is the binding constraint.'
		},
		{
			org: 'Cloudflare',
			scale: '335+ cities, anycast everywhere',
			description:
				'Cloudflare announces the same prefixes from hundreds of POPs via BGP anycast; users hit the nearest PoP based on routing policy.'
		},
		{
			org: 'Hyperscalers (AWS, GCP, Azure)',
			scale: 'Massive AS holdings',
			description:
				'AWS (AS 16509), Google (AS 15169), Microsoft (AS 8075) operate some of the largest BGP networks in the world. AWS Direct Connect, Azure ExpressRoute, GCP Cloud Interconnect all use BGP for customer peering.'
		}
	],

	funFacts: [
		{
			title: 'BGP was sketched on three napkins',
			text: 'In January 1989, [[pioneer:yakov-rekhter|Yakov Rekhter]] and Kirk Lougheed met at lunch during an IETF meeting in Austin. The previous routing protocol (EGP) was unmanageable. They sketched a replacement on three napkins. That sketch became BGP-1 ([[rfc:1105|RFC 1105]]) six months later.'
		},
		{
			title: 'BGP has no built-in authentication',
			text: 'When AS A says "I can reach 8.8.8.0/24 in two hops," AS B has to choose whether to believe it. There is no cryptographic proof. This is why every {{bgp-hijack|BGP hijack}} of the last 25 years was possible — [[outage:as-7007-1997|AS 7007]], [[outage:pakistan-youtube-2008|Pakistan/YouTube]], and the same architecture choice that made [[outage:facebook-2021|Facebook 2021]] propagate globally in minutes.'
		},
		{
			title: 'TCP keepalives keep BGP sessions alive',
			text: 'A BGP session is just a long-lived TCP connection on port 179. KEEPALIVE messages every 60 seconds prove the peer is still there; if no message arrives within 180 seconds (HoldTime), the session resets and all routes through that peer are withdrawn — which is what cascaded into [[outage:centurylink-flowspec-2020|CenturyLink 2020]].'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'No prefix filters = catastrophic leaks',
				text: 'Without max-prefix limits and explicit allow-lists, a misconfigured customer can announce the entire global table to you, which you then propagate to your peers. [[outage:as-7007-1997|AS 7007]] is the canonical example. Cure: max-prefix on every BGP session; explicit prefix-list filters from customers.'
			},
			{
				title: 'Soft reset vs hard reset',
				text: 'A "hard" reset of a BGP session withdraws all routes and re-learns them — visible to the entire internet. A "soft" reset (route-refresh capability, [[rfc:2918|RFC 2918]]) just reapplies policy without dropping the session. Always prefer soft reset when changing filter policy.'
			},
			{
				title: 'TTL security gotcha',
				text: 'Some operators enable GTSM (Generalised TTL Security Mechanism, [[rfc:5082|RFC 5082]]) requiring incoming BGP packets to have TTL=255 — defending against off-path injection. If your peer does not also enable it, the session simply never establishes. Check both ends.'
			}
		]
	}
};
