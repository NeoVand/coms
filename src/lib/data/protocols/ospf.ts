import type { Protocol } from '../types';

export const ospf: Protocol = {
	id: 'ospf',
	name: 'Open Shortest Path First',
	abbreviation: 'OSPF',
	categoryId: 'network-foundations',
	port: undefined,
	year: 1989,
	rfc: 'RFC 2328',
	oneLiner:
		'Link-state interior gateway protocol: every router builds an identical topology database, then runs Dijkstra to compute its {{routing-table|routing table}}.',
	overview: `[[ospf|OSPF]] is the dominant link-state {{igp|Interior Gateway Protocol}} on [[ip|IP]] networks. Where [[bgp|BGP]] is the *external* protocol that stitches the internet's {{autonomous-system|autonomous systems}} together, [[ospf|OSPF]] is what each AS uses *inside* to compute paths between its own routers — every enterprise core, every MPLS PE-CE link, every mid-tier carrier IGP. The trick is elegant: every router floods a description of its own links to every other router in the area, every router holds an **identical** {{lsdb|Link State Database (LSDB)}}, and every router independently runs **Dijkstra's shortest-path-first algorithm** on that database to compute its {{routing-table|routing table}}. No router trusts another's path computation; they all derive the same answer from the same graph.

[[ospf|OSPFv2]] ([[rfc:2328|RFC 2328]], April 1998, edited by [[pioneer:john-moy|John Moy]] at Ascend) is **STD 54** — still the canonical [[ip|IPv4]] spec, 244 pages, unchanged at the level of {{frame|frame}} format. OSPFv3 ([[rfc:5340|RFC 5340]], 2008) carries [[ipv6|IPv6]] and — via RFC 5838 — [[ip|IPv4]] as separate address families. Everything modern (Segment Routing, Flex-Algo, SRv6, BFD Strict-Mode) is layered on through Opaque {{lsa|LSAs}} and Router Information LSA TLVs, not by rewriting the protocol. [[ospf|OSPF]] runs directly on [[ip|IP]] as protocol number 89 — no [[tcp|TCP]], no [[udp|UDP]] — and uses {{link-local|link-local}} {{multicast|multicast}} \`224.0.0.5\` / \`FF02::5\` for adjacency.

[[pioneer:radia-perlman|Radia Perlman]]'s parallel design **IS-IS** dominates tier-1 ISP backbones; hyperscaler data-center fabrics increasingly skip both in favour of EBGP everywhere (RFC 7938). But for the campus, the branch, the enterprise WAN, and the mid-tier provider — [[ospf|OSPF]] is the protocol that draws the map.`,
	howItWorks: [
		{
			title: 'Hello — discover neighbours',
			description:
				'Each [[ospf|OSPF]]-enabled interface multicasts Hello {{packet|packets}} to `224.0.0.5` ([[ipv6|IPv6]]: `FF02::5`) every HelloInterval (default 10 s on point-to-point, 30 s on NBMA). Hellos carry the router\'s ID, options, and the list of neighbours it currently sees on this link — bidirectional visibility is established as soon as a Hello lists *you* in its neighbours field.'
		},
		{
			title: 'Adjacency state machine',
			description:
				'Neighbours progress through eight states: **Down → Init → 2-Way → ExStart → {{exchange|Exchange}} → Loading → Full** (with **Attempt** for NBMA). On {{broadcast|broadcast}} networks (e.g. [[ethernet|Ethernet]]) routers elect a **Designated Router (DR)** and Backup DR — the DR is the only neighbour every router on the segment becomes Full with, cutting the adjacency mesh from O(n²) to O(n).'
		},
		{
			title: 'Synchronise the LSDB',
			description:
				'Routers {{exchange|exchange}} **Database Description (DBD)** packets carrying {{lsa|LSA}} *headers* (sequence/age/length), then send **Link State Request (LSR)** packets asking for the LSAs they don\'t have, and receive them in **Link State Update (LSU)** packets. **LSAck** packets explicitly acknowledge receipt — [[ospf|OSPF]] has {{retransmission|reliable delivery}} without [[tcp|TCP]].'
		},
		{
			title: 'Flood, throttle, age',
			description:
				'Every LSA carries a 16-bit {{sequence-number|sequence number}}, 16-bit age, and 16-bit {{checksum|checksum}}. New LSAs flood through the area in seconds; routers refresh their own LSAs every 30 minutes (`LSRefreshTime`) and age them out at `MaxAge = 3600 s`. RFC 8405 SPF back-off (INITIAL/SHORT_WAIT/LONG_WAIT) throttles SPF runs when topology churns.'
		},
		{
			title: 'Run Dijkstra',
			description:
				'Once the {{lsdb|LSDB}} is identical on every router, each runs the **shortest-path-first algorithm** ([[pioneer:edsger-dijkstra|Edsger Dijkstra]], 1956) on its own copy and installs the resulting tree into its forwarding table. Areas (Area 0 is the backbone) keep LSDBs scoped so the SPF computation stays tractable — typical campus areas are 100–200 routers, LSDB < 1 MB.'
		},
		{
			title: 'Stay converged — BFD, authentication, segment routing',
			description:
				'Modern deployments pair [[ospf|OSPF]] with **BFD** (300 ms × 3 multipliers for sub-second loss detection — RFC 9355 Strict-Mode requires BFD up before adjacency forms) and **{{hmac|HMAC}}-SHA-256** authentication (RFC 5709 for v2, RFC 7166 Authentication Trailer for v3). Segment Routing (RFC 8665/8666) and SRv6 (RFC 9513) ride on top via Opaque LSAs; Flex-Algo ([[rfc:9350|RFC 9350]]) lets operators compute multiple parallel SPF planes — by IGP cost, by min-delay, by SRLG exclusion.'
		}
	],
	useCases: [
		'Enterprise campus and branch routing (the dominant IGP outside ISP backbones)',
		'MPLS-VPN PE-CE peering (RFC 4577)',
		'Mid-tier ISP IGP (tier-1s usually run [[ospf|IS-IS]] instead)',
		'Carrying Segment Routing and SRv6 SIDs (RFC 8665 / 8666 / 9513)',
		'Data-center underlay where pure-[[bgp|BGP]] (RFC 7938) is unjustified',
		'SD-WAN overlay control plane between hub and branch'
	],
	codeExample: {
		language: 'cli',
		code: `# FRRouting — the canonical open-source OSPF speaker.
# /etc/frr/frr.conf
hostname R1
log syslog informational
!
router ospf
 ospf router-id 1.1.1.1
 network 10.0.0.0/24 area 0.0.0.0
 area 0.0.0.0 authentication message-digest
 timers throttle spf 50 200 5000           ! RFC 8405 INITIAL / SHORT / LONG
 timers throttle lsa all 0 5000 5000
!
interface eth0
 ip ospf message-digest-key 10 md5 supersecret
 ip ospf hello-interval 1                  ! sub-second neighbour loss
 ip ospf dead-interval minimal hello-multiplier 4
!
end

# Inspect adjacency, database, and route computation:
vtysh -c 'show ip ospf neighbor'
vtysh -c 'show ip ospf database'
vtysh -c 'show ip ospf interface eth0'
vtysh -c 'show ip route ospf'`,
		caption: 'A minimal [[ospf|OSPF]] speaker on FRR — three commands set up Area 0, MD5 authentication, and sub-second BFD-style failure detection.',
		alternatives: [
			{
				language: 'python',
				code: `# Scapy — craft and inject an OSPFv2 Hello on the wire.
from scapy.all import sendp, Ether, IP
from scapy.contrib.ospf import OSPF_Hdr, OSPF_Hello

hello = (
    IP(src='10.0.0.1', dst='224.0.0.5', proto=89, ttl=1)
    / OSPF_Hdr(version=2, type=1, src='1.1.1.1', area='0.0.0.0')
    / OSPF_Hello(
        mask='255.255.255.0',
        hellointerval=10,
        options=0x02,
        prio=1,
        deadinterval=40,
        router='0.0.0.0',   # no DR elected yet
        backup='0.0.0.0',
        neighbors=[],       # empty -> still Init
    )
)
sendp(Ether() / hello, iface='eth0')`
			},
			{
				language: 'javascript',
				code: `// node-pcap — a minimal OSPF dissector that prints adjacency events.
const pcap = require('pcap');
const session = pcap.createSession('eth0', { filter: 'ip proto 89' });

const TYPES = { 1: 'Hello', 2: 'DBD', 3: 'LSR', 4: 'LSU', 5: 'LSAck' };

session.on('packet', raw => {
  const eth = pcap.decode.ethernet(raw.buf);
  const ip = eth.payload.payload;
  if (ip.protocol !== 89) return;
  const ospf = ip.payload.buffer.slice(ip.payload.offset);
  const version = ospf[0];
  const type = ospf[1];
  const len = ospf.readUInt16BE(2);
  const rid = ospf.slice(4, 8).join('.');
  const area = ospf.slice(8, 12).join('.');
  console.log(\`OSPFv\${version} \${TYPES[type]} from RID \${rid} area \${area} (\${len}B)\`);
});`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Cold-boot adjacency forming',
						code: `T+0.0  R1 → 224.0.0.5   OSPFv2 Hello   RID=1.1.1.1  Nbrs=[]
T+0.0  R2 → 224.0.0.5   OSPFv2 Hello   RID=2.2.2.2  Nbrs=[]
T+10.0 R1 → 224.0.0.5   OSPFv2 Hello   RID=1.1.1.1  Nbrs=[2.2.2.2]    (R1: Init→2-Way)
T+10.0 R2 → 224.0.0.5   OSPFv2 Hello   RID=2.2.2.2  Nbrs=[1.1.1.1]    (R2: Init→2-Way)
T+10.1 R2 → R1           DBD            I=1 M=1 MS=1 Seq=X            (ExStart, R2 Master)
T+10.1 R1 → R2           DBD            I=1 M=1 MS=0 Seq=X            (R1 yields, MS=0)
T+10.2 R2 → R1           DBD            I=0 M=1 MS=1 Seq=X+1 + hdrs
T+10.2 R1 → R2           DBD            I=0 M=1 MS=0 Seq=X+1 + hdrs
T+10.5 R1 → R2           LSR            [LSAs R1 wants]
T+10.5 R2 → R1           LSU            <LSAs>
T+10.5 R1 → R2           LSAck          <ack>
T+10.7 Both routers reach **Full** → run Dijkstra → install routes.`
					},
					{
						title: 'OSPFv2 packet header (24 bytes)',
						code: `0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|   Version=2   |   Type (1-5)  |        Packet Length          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                         Router ID                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                           Area ID                             |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |             AuType            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       Authentication (64 bits)                |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

Types: 1=Hello, 2=DBD, 3=LSR, 4=LSU, 5=LSAck
AuType: 0=none, 1=cleartext, 2=cryptographic (HMAC-SHA-256 per RFC 5709)`
					},
					{
						title: 'LSA flooding',
						code: `Router R5 advertises a new prefix:
  → R5 floods Type-1 Router-LSA to all DRs in Area 0
  → DRs re-flood to every router on their segment
  → Every router checksums, ages, installs in LSDB
  → Every router queues an SPF run (throttled per RFC 8405:
      INITIAL=50ms, SHORT_WAIT=200ms, LONG_WAIT=5000ms)
  → Dijkstra runs on the updated graph
  → Routing table delta installs into the FIB

Total time on a tuned network: < 100 ms.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Default convergence ~40 s (DeadInterval) + ~5 s (SPF) ≈ 45 s; tuned with BFD and RFC 8405 INITIAL=50 ms: sub-second; with LFA pre-installed: 25–50 ms forwarding-plane reroute',
		throughput:
			'Control-plane only — LSU bursts during topology churn, otherwise periodic Hellos + 30-minute LSA refreshes. Typical area LSDB < 1 MB',
		overhead:
			'24-byte OSPFv2 header (16 for OSPFv3); LSAs typically 50–200 bytes; runs directly on IP (protocol 89), no transport header'
	},
	connections: ['ip', 'ipv6', 'bgp', 'icmp', 'ethernet', 'wifi', 'arp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Open_Shortest_Path_First',
		rfc: 'https://www.rfc-editor.org/rfc/rfc2328',
		official: 'https://datatracker.ietf.org/wg/lsr/about/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/OSPF-Adjacency-process.drawio.png/500px-OSPF-Adjacency-process.drawio.png',
		alt: 'OSPF adjacency process diagram showing the eight neighbour states from Down through Full',
		caption:
			'The [[ospf|OSPF]] adjacency process — eight states from `Down` to `Full`. Every adjacency on every router walks this diagram every time a link comes up. Sticking in `ExStart` or `Loading` is the classic [[ospf|OSPF]] debugging signature.',
		credit: 'Image: Wikimedia Commons / CC BY-SA'
	},

	recentChanges: [
		{
			date: '2023-02',
			title: 'RFC 9350 — IGP Flexible Algorithm published',
			description:
				'Lets operators compute **multiple parallel SPF planes** per [[ospf|OSPF]]/IS-IS area, each with its own metric (IGP cost, TE cost, min-delay) and constraints (include/exclude admin groups, exclude SRLGs). Carried in the new Flexible Algorithm Definition TLV in the Router Information LSA.',
			source: { url: 'https://www.rfc-editor.org/rfc/rfc9350', label: 'RFC 9350' }
		},
		{
			date: '2023-12',
			title: 'RFC 9513 — OSPFv3 extensions for SRv6',
			description:
				'Adds SRv6 Capabilities TLV, SRv6 Locator advertisement, and SRv6 End SID encoding to [[ospf|OSPFv3]]. Edited by Peter Psenak (Cisco), the most prolific author of modern [[ospf|OSPF]] extensions.',
			source: { url: 'https://www.rfc-editor.org/rfc/rfc9513', label: 'RFC 9513' }
		},
		{
			date: '2024',
			title: 'RFC 9667 — Dynamic Flooding on Dense Graphs',
			description:
				'Targets [[ospf|OSPF]]/IS-IS scaling in spine-leaf AI fabrics: instead of every router flooding to every neighbour, the area elects a leader that picks a flooding *subgraph*. The control plane stops melting when you stack 1024 spines.',
			source: { url: 'https://www.rfc-editor.org/rfc/rfc9667', label: 'RFC 9667' }
		},
		{
			date: '2024-08',
			title: 'Junos OS Evolved 24.2R1 ships HMAC-SHA-2 keychains + Flex-Algo on hardware',
			description:
				'Juniper\'s Junos OS Evolved 24.2R1 (Aug 2024) added [[ospf|OSPFv2]] {{hmac|HMAC}}-SHA-2 keychain authentication, Flex-Algo FAD with SRLG-exclude, and link-delay normalisation on ACX/PTX hardware — bringing Flex-Algo from "shipped in IOS-XR" to "shipped at multi-vendor parity."',
			source: { url: 'https://supportportal.juniper.net/s/article/Junos-OS-Evolved-24-2R1-Release-Notes', label: 'Junos OS Evolved 24.2R1' }
		},
		{
			date: '2025-10',
			title: 'FRRouting OSPF NULL-pointer DoS — CVE-2025-61103 / 61106',
			description:
				'A malformed Extended Prefix Opaque LSA could crash the [[ospf|OSPF]] daemon in `ospf_ext.c` (FRR v4.0 through v10.4.1). Fixed upstream in PR #19480. Affects every Linux distribution shipping FRR — patch immediately if your edge routers run FRR.',
			source: { url: 'https://github.com/FRRouting/frr/pull/19480', label: 'FRR PR #19480' }
		}
	],

	realWorldDeployments: [
		{
			org: 'Microsoft Azure',
			scale: 'Inter-region routing fabric',
			description:
				"Azure's network fabric uses [[ospf|OSPF]] for internal route distribution between routers in the same region; [[bgp|BGP]] handles inter-region. Public ipspace.net analyses (Ivan Pepelnjak) document the design pattern."
		},
		{
			org: 'Cumulus Networks / NVIDIA SONiC',
			scale: 'Default IGP option for tier-2 data-center fabrics',
			description:
				'Both Cumulus Linux and NVIDIA SONiC ship [[ospf|OSPF]] via FRR as the canonical alternative to "BGP-in-the-DC" (RFC 7938) — common in mid-scale fabrics where operators want a topology-aware IGP without learning IS-IS.'
		},
		{
			org: 'FRRouting',
			scale: 'The dominant open-source IGP implementation',
			description:
				"Forked from Quagga in 2017 and now stewarded by the Linux Foundation. Ships [[ospf|OSPFv2]] and [[ospf|OSPFv3]] daemons (`ospfd`, `ospf6d`) used everywhere from Vyatta/VyOS edge routers to enterprise SD-WAN appliances. Public CVE traffic (e.g. CVE-2025-61103) tracks its prevalence."
		},
		{
			org: 'Cisco IOS-XR / Juniper Junos',
			scale: 'The two dominant tier-2-and-up vendor stacks',
			description:
				"Both ship [[ospf|OSPF]] with full Segment Routing (RFC 8665/8666), Flex-Algo ([[rfc:9350|RFC 9350]]), and BFD Strict-Mode (RFC 9355). Cisco's IOS-XR has shipped Flex-Algo since 2019; Junos OS Evolved caught up in 24.2R1 (Aug 2024)."
		}
	],

	funFacts: [
		{
			title: 'The "F" in OSPF is for "First", not "Fastest"',
			text: 'Common misreading: OSPF is "first-fit" or "fastest path". In fact, **Shortest Path First** was the popular name in the 1980s for [[pioneer:edsger-dijkstra|Dijkstra]]\'s algorithm. The protocol is named after the algorithm, not the routing strategy.'
		},
		{
			title: 'RFC 2328 is the longest unmodified Internet Standard',
			text: '[[rfc:2328|RFC 2328]] (OSPFv2, April 1998) is **244 pages** — STD 54 — and has been the canonical spec for 28 years. The frame format and core algorithm have not changed. Everything new since (Segment Routing, Flex-Algo, SRv6, BFD Strict-Mode) is layered on through Opaque LSAs and Router Information TLVs.'
		},
		{
			title: 'OSPF has reliable delivery without TCP',
			text: '[[ospf|OSPF]] runs **directly on [[ip|IP]]** as protocol number 89. There is no [[tcp|TCP]] underneath. Reliability is implemented in [[ospf|OSPF]] itself: every LSU is explicitly acknowledged with an LSAck; LSAs carry sequence numbers and checksums; the DBD {{exchange|exchange}} uses an Init/More/Master-Slave bit. [[ospf|OSPF]] is one of the few production protocols to re-implement transport-layer guarantees above raw [[ip|IP]].'
		},
		{
			title: 'Radia Perlman designed the competitor, not OSPF',
			text: '[[pioneer:radia-perlman|Radia Perlman]] — the inventor of Spanning Tree and "Mother of the Internet" — designed **IS-IS**, the link-state IGP that competed with [[ospf|OSPF]] and won the tier-1 ISP backbone. The Lemelson-MIT Program credits her with developing the algorithms that make *both* IS-IS and [[ospf|OSPF]] efficient and scalable.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Mismatched HelloInterval / DeadInterval = no adjacency',
				text: 'Two routers will sit in `Init` forever if their Hello or Dead intervals differ by even one second. There is no negotiation. **Cure:** standardise per-interface in your template; use `show ip ospf interface eth0` to dump both sides\' actual values before opening tickets. The state machine\'s most common stuck-state.'
			},
			{
				title: 'Default 40-second DeadInterval is a 1990s artefact',
				text: 'A 40 s DeadInterval means a link failure takes ~40 s to detect — unacceptable on any modern backbone. **Cure:** pair [[ospf|OSPF]] with **BFD** (default 300 ms × 3 multiplier = ~900 ms detection), or use RFC 9355 BFD Strict-Mode which refuses adjacency until BFD is up. Sub-second failover is the modern baseline.'
			},
			{
				title: 'LSA flooding storms in spine-leaf fabrics',
				text: "A single Type-1 LSA from one leaf in a 1024-spine fabric multicasts to every other leaf — and [[ospf|OSPF]]'s default flooding is N-to-N. In an AI training cluster this melts the control plane. **Cure:** RFC 9667 Dynamic Flooding lets the area elect a flooding subgraph; FRR and IOS-XR both implement it. Or skip [[ospf|OSPF]] entirely and use eBGP everywhere (RFC 7938) as Microsoft, Meta, and Google's DC fabrics do."
			}
		]
	}
};
