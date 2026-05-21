import type { Protocol } from '../types';

export const mdnsDnsSd: Protocol = {
	id: 'mdns-dns-sd',
	name: 'Multicast DNS & DNS-Based Service Discovery',
	abbreviation: 'mDNS / DNS-SD',
	categoryId: 'utilities',
	port: 5353,
	year: 2013,
	rfc: 'RFC 6762 / 6763',
	oneLiner:
		'[[dns|DNS]], shouted to a link-local {{multicast|multicast}} group, so every printer, Chromecast, AirPlay speaker, and {{matter|Matter}} device on your {{lan|LAN}} can find each other with zero configuration.',
	overview: `[[mdns-dns-sd|mDNS]] is the [[dns|DNS]] you already know, sent to a {{link-local|link-local}} {{multicast|multicast}} group on [[udp|UDP]]/5353. Same 12-byte {{header|header}}, same RR types, same wire format — but instead of {{unicast|unicasting}} to a {{dns-resolution|recursive resolver}}, every host on the link both *asks* and *answers* on \`224.0.0.251\` ([[ipv6|IPv6]]: \`FF02::FB\`). Two flag bits get repurposed: the high bit of QCLASS becomes the **{{unicast|unicast}}-response** bit ("answer me directly to save {{multicast|multicast}} {{bandwidth|bandwidth}}"), and the high bit of RRCLASS becomes the **cache-flush** bit ("my answer supersedes anything you {{cache-hit-miss|cached}} for this name"). Add a probe/announce/respond/defend/goodbye lifecycle and you have a self-organising, conflict-resolving name registry for the local link.

**{{dns-resolution|DNS}}-SD** ([[rfc:6763|RFC 6763]]) is a naming convention layered on top. A {{service-discovery|service instance}} is named \`<Instance>._<service>._<proto>.local\` — e.g., \`Office Printer._ipp._tcp.local\` for an AirPrint printer. A **{{ptr-record|PTR}}** record lists all instances of a service type; an **{{srv-record|SRV}}** record gives the host and {{port|port}}; **{{txt-record|TXT}}** carries key-value metadata; **A/{{aaaa-record|AAAA}}** resolves the hostname. Discovery is "send a {{ptr-record|PTR}} query for \`_ipp._tcp.local\`, then resolve each instance's {{srv-record|SRV}}+{{txt-record|TXT}}+A/{{aaaa-record|AAAA}}." Same [[dns|DNS]], link-local scope, self-organising registry.

Stuart Cheshire and Marc Krochmal at {{apple|Apple}} shipped this as **Rendezvous** (later renamed **Bonjour** in 2005 after a Tibco trademark dispute) starting in **macOS 10.2 in 2002** — eleven years before [[rfc:6762|RFC 6762]] and [[rfc:6763|RFC 6763]] standardised what was already running on millions of Macs. Today every iPhone, iPad, Mac, {{apple|Apple}} TV, HomePod, Chromecast, AirPlay speaker, AirPrint printer, Sonos, Plex server, {{matter|Matter}} device, and Spotify {{mqtt-connect|Connect}} speaker on the planet speaks it. The 2020s frontier is wide-area mDNS via **SRP / Service Registration Protocol** ({{rfc-doc|RFC}} 9665, June 2025) — {{thread|Thread}} Border Routers and {{matter|Matter}} ecosystems are about to make link-local discovery a global-scoped story.`,
	howItWorks: [
		{
			title: 'Probe — three queries, 250 ms apart',
			description:
				'When a host comes online with a candidate name (e.g., `office-printer.local`), it sends three Query messages asking *does anyone already own this name?* spaced 250 ms apart. If any host responds with a matching record, the prober picks a new candidate (`office-printer-2.local`) and starts over. The whole conflict-resolution phase takes ~750 ms.'
		},
		{
			title: 'Announce — two responses with cache-flush',
			description:
				"On winning the probe, the host sends two Response messages 1 second apart, each with the **cache-flush** bit set on its A/{{aaaa-record|AAAA}}/{{srv-record|SRV}}/{{txt-record|TXT}} records. Every receiver replaces any stale entries for that name with the new ones. The host is now *live* on the link."
		},
		{
			title: 'Respond — multicast queries, 20–120 ms random delay',
			description:
				'When another host queries (e.g., `who owns office-printer.local?` or `what `_ipp._tcp` services exist?`), every host with a matching record waits a random 20–120 ms (collision-avoidance), then either multicasts the answer (default) or unicasts it (if the querier set the {{unicast|unicast}}-response bit).'
		},
		{
			title: 'Service discovery — PTR → SRV → TXT → A/AAAA',
			description:
				"A {{dns-resolution|DNS}}-SD client looking for printers sends a {{ptr-record|PTR}} query for `_ipp._tcp.local`. Each printer responds with a {{ptr-record|PTR}} pointing to its instance name. The client then sends {{srv-record|SRV}} + {{txt-record|TXT}} + A/{{aaaa-record|AAAA}} queries for each instance — usually combined in one Question section with the *known-answer suppression* trick: the client lists records it already has so responders only send what's new."
		},
		{
			title: 'Defend — re-probe on conflict',
			description:
				'If a live host sees a Response from another host claiming the same name (e.g., after a network merge), it sends one defence Response. If the conflict persists for 10 seconds, it re-probes for a new name. This is how name collisions across previously-disjoint networks heal automatically.'
		},
		{
			title: 'Goodbye — TTL=0 on exit',
			description:
				'On graceful shutdown, the host sends one Response with {{ttl|TTL}}=0 for every record it owns. Receivers immediately flush the records from their caches. (Crash-exits leave records to age out at their normal {{ttl|TTL}} — 120 s for hostnames, 4500 s for service records.)'
		}
	],
	useCases: [
		'AirPlay / Chromecast / Sonos speaker discovery (`_airplay._tcp`, `_googlecast._tcp`, `_spotify-connect._tcp`)',
		'AirPrint / IPP printer discovery (`_ipp._tcp`, `_ipps._tcp`, `_pdl-datastream._tcp`)',
		'**Matter** device commissioning (`_matterc._udp`) and operational discovery (`_matter._tcp`)',
		'SSH server discovery on the LAN (`_ssh._tcp`)',
		'Plex media server, Roon, HomeAssistant, IDE remote-debug discovery',
		'Apple Continuity (AirDrop, Handoff, Universal Clipboard, Wi-Fi Password Sharing) over AWDL'
	],
	codeExample: {
		language: 'python',
		code: `# zeroconf — the canonical Python mDNS/DNS-SD library.
# Browse for AirPlay speakers and print what's discovered.
from zeroconf import ServiceBrowser, ServiceListener, Zeroconf

class AirPlayListener(ServiceListener):
    def add_service(self, zc, type_, name):
        info = zc.get_service_info(type_, name)
        if info:
            print(f"+ {name}")
            print(f"    host = {info.server}")
            print(f"    addr = {info.parsed_addresses()}")
            print(f"    port = {info.port}")
            print(f"    txt  = {info.properties}")

    def remove_service(self, zc, type_, name):
        print(f"- {name}")

    def update_service(self, zc, type_, name):
        pass

zc = Zeroconf()
browser = ServiceBrowser(zc, "_airplay._tcp.local.", AirPlayListener())
try:
    input("Press Enter to stop browsing...\\n")
finally:
    zc.close()`,
		caption: 'A [[mdns-dns-sd|DNS-SD]] browser in 25 lines of Python. Same code finds Chromecasts (`_googlecast._tcp.`), printers (`_ipp._tcp.`), or {{matter|Matter}} devices (`_matter._tcp.`).',
		alternatives: [
			{
				language: 'javascript',
				code: `// bonjour-service — the canonical Node mDNS library.
const bonjour = require('bonjour-service')();

// Publish a service
const svc = bonjour.publish({
  name: 'Test Web',
  type: 'http',         // becomes _http._tcp.local.
  port: 3000,
  txt: { path: '/' }
});

// Browse for AirPlay speakers
bonjour.find({ type: 'airplay' }, service => {
  console.log('Found:', service.name, '@', service.host, ':', service.port);
});

// Browse for Chromecasts
bonjour.find({ type: 'googlecast' }, c => {
  console.log('Cast:', c.name, c.txt);
});

// Clean shutdown
process.on('SIGINT', () => { svc.stop(); bonjour.destroy(); process.exit(); });`
			},
			{
				language: 'cli',
				code: `# dns-sd — Apple's canonical command-line tool (ships with every Mac).
# Browse for service types
dns-sd -B _services._dns-sd._udp .         # list every service type on the link
dns-sd -B _airplay._tcp .                  # list AirPlay receivers
dns-sd -B _matterc._udp .                  # list Matter devices in commissioning mode

# Resolve a specific instance
dns-sd -L "Office Printer" _ipp._tcp .

# Publish a service
dns-sd -R "Test Web" _http._tcp . 3000 path=/index.html

# avahi-browse — the Linux equivalent (from the Avahi package)
avahi-browse -a            # browse all service types
avahi-browse -r _ipp._tcp  # resolve every IPP printer
avahi-publish-service "Test Web" _http._tcp 3000 path=/index.html

# Wireshark — observe mDNS on the wire
# Display filter: \`mdns\` or \`udp.port == 5353\`
# Quick stats:    Statistics > DNS, but filter to mdns first`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'mDNS query (DNS-SD PTR for _ipp._tcp)',
						code: `Ethernet → IPv4 (224.0.0.251) → UDP (sport=5353, dport=5353) → DNS

DNS Header:
  ID:        0x0000             (mDNS uses zero — multicast doesn't need txn IDs)
  Flags:     0x0000             (standard query, QR=0, OPCODE=0)
  QDCOUNT:   1
  ANCOUNT:   0
  NSCOUNT:   0
  ARCOUNT:   0

Question:
  QNAME:     _ipp._tcp.local
  QTYPE:     PTR (12)
  QCLASS:    0x8001
             │└────── 0x0001 = IN (Internet class)
             └─────── 0x8000 = UNICAST-RESPONSE bit set
                              ("answer me unicast, save multicast bandwidth")`
					},
					{
						title: 'mDNS announce (PTR + SRV + TXT + A, cache-flush set)',
						code: `Ethernet → IPv4 (224.0.0.251) → UDP (sport=5353, dport=5353) → DNS

DNS Header:
  ID:        0x0000
  Flags:     0x8400         (QR=1 response, AA=1 authoritative)
  ANCOUNT:   4

Answers:
  PTR     _ipp._tcp.local.       PTR    Office Printer._ipp._tcp.local
  SRV     Office Printer.[...]   SRV    0 0 631 office-printer.local
  TXT     Office Printer.[...]   TXT    rp=ipp/print pdl=application/pdf
  A       office-printer.local   A      192.168.1.42

Each RR's CLASS field:
  0x0001 = IN
  + high bit set = CACHE-FLUSH ("supersede whatever you had cached for this name")
  → RRCLASS on the wire = 0x8001`
					},
					{
						title: 'DNS-SD service-type enumeration',
						code: `_services._dns-sd._udp.local                       <-- meta-service ("list service types")
  PTR    _airplay._tcp.local
  PTR    _ipp._tcp.local
  PTR    _matterc._udp.local
  PTR    _ssh._tcp.local
  PTR    _spotify-connect._tcp.local
  PTR    _googlecast._tcp.local

→ The "what services exist on this link at all?" enumeration that
  every "Bonjour Browser" / "Avahi Discover" app shows you.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'~750 ms for full probe (3× 250 ms); ~1 s for initial announce. Steady-state query/response: 20–120 ms random response delay on the link, dominated by multicast collision avoidance. Far faster than unicast DNS because no recursion is involved',
		throughput:
			'Per-packet ~80–250 bytes for typical announce/resolve. Steady-state bandwidth is dominated by the announce interval (re-announce every 4500 s for service records, 120 s for A/AAAA) — effectively negligible per device',
		overhead:
			'12-byte DNS header + variable QNAME (with compression). Worst-case amplification factor ~10× (Rossow NDSS 2014) makes mDNS a reflection-DDoS vector if responders are exposed to the WAN'
	},
	connections: ['dns', 'dhcp', 'udp', 'ip', 'ipv6', 'bluetooth', 'wifi'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Multicast_DNS',
		rfc: 'https://www.rfc-editor.org/rfc/rfc6762'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Multicast.svg/500px-Multicast.svg.png',
		alt: 'Multicast diagram showing a single source delivering packets to multiple receivers in one transmission — the underlying mechanism mDNS exploits to make link-local discovery efficient',
		caption:
			'The [[mdns-dns-sd|mDNS]] trick in one diagram: instead of unicasting a [[dns|DNS]] query to a resolver, *every* host on the link both asks and answers on a single {{multicast|multicast}} group (`224.0.0.251` / `FF02::FB`). One question, every printer hears it; one announcement, every laptop caches it. {{apple|Apple}} shipped this as *Rendezvous* in macOS 10.2 (2002), renamed *Bonjour* in 2005; [[rfc:6762|RFC 6762]] / [[rfc:6763|RFC 6763]] standardised it in 2013.',
		credit: 'Image: Wikimedia Commons / GNU Free Documentation License'
	},

	recentChanges: [
		{
			date: '2025-06',
			title: 'RFC 9665 — SRP (Service Registration Protocol) published',
			description:
				'**SRP** ({{rfc-doc|RFC}} 9665, Lemon + [[pioneer:stuart-cheshire|Cheshire]], June 2025) extends [[mdns-dns-sd|DNS-SD]] from link-local to wide-area via {{thread|Thread}} Border Routers and {{matter|Matter}} ecosystems. A device sends one [[dns|DNS]] {{bgp-update|UPDATE}} per service to a registrar (typically a {{thread|Thread}} {{border-router|Border Router}}); the registrar pushes it into both wide-area [[dns|DNS]] and link-local [[mdns-dns-sd|mDNS]]. Also allocated `2001:1::3/128` as the **SRP {{anycast|anycast}} address** — so your IoT device can register at a fixed [[ipv6|IPv6]] address with zero prior configuration.',
			source: { url: 'https://www.rfc-editor.org/rfc/rfc9665', label: 'RFC 9665' }
		},
		{
			date: '2024-10',
			title: 'Windows 11 24H2 disables LLMNR, defaults to mDNS',
			description:
				'Windows 11 24H2 (October 2024) ships with [[mdns-dns-sd|mDNS]] **enabled** and LLMNR **disabled** in the security baseline. {{microsoft|Microsoft}}\'s blog: *"having [LLMNR/NetBIOS] enabled needlessly expands the attack surface."* The decade-long "Windows doesn\'t see my AirPrint printer" support era ends.',
			source: {
				url: 'https://learn.microsoft.com/en-us/windows/security/operating-system-security/network-security/windows-firewall/best-practices-configuring',
				label: 'Microsoft security baseline'
			}
		},
		{
			date: '2024-11',
			title: 'Avahi CVE-2024-52616 — predictable DNS transaction IDs',
			description:
				'Evgeny Vereshchagin disclosed a class of reachable-assertion DoS bugs ({{cve|CVE}}-2023-1981, {{cve|CVE}}-2023-38469 through 38473) plus predictable transaction IDs ({{cve|CVE}}-2024-52616) in **Avahi**, the dominant {{linux|Linux}}/{{bsd|BSD}} [[mdns-dns-sd|mDNS]] implementation. Patched in Debian DLA-3990 (December 2024); still under active maintenance — a 2025 unbounded-clients DoS in 0.9-rc2 was fixed in PR #808.',
			source: {
				url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-52616',
				label: 'NVD CVE-2024-52616'
			}
		},
		{
			date: '2024-03',
			title: 'Cisco WLC mDNS DoS — cisco-sa-wlc-mdns-dos-4hv6pBGf',
			description:
				'A continuous stream of [[mdns-dns-sd|mDNS]] packets pegs {{cisco|Cisco}} Wireless {{lan|LAN}} Controller {{cpu|CPU}} at 100% and Access Points lose their CAPWAP tunnel. The latest in a decade-long pattern of [[mdns-dns-sd|mDNS]] gateway DoS bugs on {{cisco|Cisco}} hardware ({{cve|CVE}}-2014-3358, {{cve|CVE}}-2015-0650, 2019 Aironet FlexConnect bug, this one). The cost of being the {{lan|LAN}} protocol everyone implements differently.',
			source: {
				url: 'https://sec.cloudapps.cisco.com/security/center/content/CiscoSecurityAdvisory/cisco-sa-wlc-mdns-dos-4hv6pBGf',
				label: 'Cisco PSIRT advisory'
			}
		},
		{
			date: '2022-10',
			title: 'Matter 1.0 ships — every Matter device speaks mDNS',
			description:
				'{{matter|Matter}} 1.0 (Connectivity Standards Alliance, October 2022) standardises [[mdns-dns-sd|mDNS]]+[[mdns-dns-sd|DNS-SD]] as the discovery protocol for smart-home devices. `_matterc._udp.local` for commissioning, `_matter._tcp.local` for operational. By end of 2024 {{sig-bluetooth-acronym|CSA}} had certified >2,000 {{matter|Matter}} device SKUs across {{matter|Matter}} 1.0–1.3. Every one of them runs an [[mdns-dns-sd|mDNS]] responder.',
			source: { url: 'https://csa-iot.org/all-solutions/matter/', label: 'Matter standard' }
		}
	],

	realWorldDeployments: [
		{
			org: 'Apple (mDNSResponder)',
			scale: '>2 billion active devices',
			description:
				"{{apple|Apple}}'s reference implementation, written in C, Apache 2.0-licensed at `opensource.{{apple|apple}}.com/source/mDNSResponder/`. Built into every macOS, iOS, iPadOS, tvOS, watchOS, visionOS device shipped since 2002. {{apple|Apple}}'s January 2024 earnings call disclosed >2 billion active devices — every one runs mDNSResponder by default."
		},
		{
			org: 'Avahi',
			scale: 'Default on every major Linux distro',
			description:
				"The dominant {{linux|Linux}}/{{bsd|BSD}} implementation, LGPL, maintained by Trent Lloyd. Bundled by Debian, Ubuntu, Fedora, {{rhel|RHEL}}, openSUSE. Co-authored by [[pioneer:lennart-poettering|Lennart Poettering]] in 2004 (before he moved on to PulseAudio and systemd). The Avahi name is the genus of a Madagascar woolly lemur — freedesktop.org's whimsical-animal-codename pattern at work."
		},
		{
			org: 'Google Chromecast + Cast ecosystem',
			scale: '100+ million Cast devices (Google, 2018)',
			description:
				"Every Chromecast, Cast-enabled TV, and Cast-enabled speaker announces `_googlecast._tcp.local` via [[mdns-dns-sd|mDNS]]. {{google|Google}} last published an installed-base figure (\"100 million\") at I/O 2018; the actual number today is presumably much higher."
		},
		{
			org: 'Matter ecosystem (CSA)',
			scale: '>2,000 certified device SKUs by end of 2024',
			description:
				'{{matter|Matter}} 1.0+ uses [[mdns-dns-sd|mDNS]] for both commissioning (`_matterc._udp`) and operational discovery (`_matter._tcp`). The Connectivity Standards Alliance certification database tracks devices from {{apple|Apple}}, {{google|Google}}, Amazon, Samsung, Aqara, Eve, Philips Hue, IKEA, Schlage, Yale, and dozens more.'
		}
	],

	funFacts: [
		{
			title: 'The name was almost "OpenTalk"',
			text: 'AppleInsider\'s exclusive of 18 February 2005 revealed {{apple|Apple}} had filed for the *OpenTalk* trademark before settling on **Bonjour**. Internal {{apple|Apple}} logic: *"naturally, when Rendezvous-enabled computers and devices come within range of each other, they say \'hello\' — hence the name \'Bonjour.\'"* The rebrand was forced by a trademark dispute with Tibco, which had held *TIBCO Rendezvous* for its enterprise messaging product since 1994.'
		},
		{
			title: '`.local` is an act of IETF jurisdiction over ICANN',
			text: '{{rfc-doc|RFC}} 6761 (February 2013) uses {{iana|IANA}}\'s Special-Use Domain Names registry to *take a {{tld|TLD}} off the table* permanently. There is no legal way for {{icann|ICANN}} to delegate `.local` to a registry — this is one of the cleanest examples of the {{ietf|IETF}} asserting authority over names {{icann|ICANN}} normally controls. The legitimisation of a de-facto practice that had been running on every Mac for 11 years.'
		},
		{
			title: 'Stuart Cheshire also wrote a tank game',
			text: 'Before zero-configuration networking, [[pioneer:stuart-cheshire|Stuart Cheshire]] wrote **Bolo**, a 16-player networked tank game on the BBC Micro in 1987 and ported it to the Mac. Within {{apple|Apple}}, *Bolo* is still a thing some old-timers will name-drop. His PhD dissertation invented **Consistent Overhead Byte Stuffing (COBS)** — the framing algorithm now widely used in embedded protocols.'
		},
		{
			title: 'The Avahi name is a lemur',
			text: 'Trent Lloyd suggested *Avahi* (genus *Avahi*, woolly lemur, endemic to Madagascar) when the project was founded in 2004, following freedesktop.org\'s pattern of whimsical animal codenames. The Avahi project logo is a stylised lemur. Sometimes mis-translated from Latin — *Avahi laniger* is the proper binomial; *avahi* is the Malagasy root.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'IGMP/MLD snooping is mDNS\'s #1 enemy on enterprise Wi-Fi',
				text: 'Access points forward {{multicast|multicast}} at the lowest basic rate (often 6 Mbps); managed switches with IGMP snooping enabled drop frames whose listeners haven\'t joined the group; per-{{ssid|SSID}}/per-{{vlan|VLAN}} isolation breaks the link-local scope assumption. **Cure:** deploy an [[mdns-dns-sd|mDNS]] gateway ({{cisco|Cisco}} WLC `mdns-sd` profile, Aruba AirGroup, Aerohive Bonjour Gateway). Whitelist exactly `224.0.0.251` and `FF02::FB`; rate-limit UDP/5353 to ~50 pps per client; never enable {{multicast|multicast}}-to-{{unicast|unicast}} conversion blindly.'
			},
			{
				title: 'mDNS responders exposed to the WAN are a DDoS reflector',
				text: 'Many home routers shipped with [[mdns-dns-sd|mDNS]] responders that answered queries on their {{wan|WAN}} interface — a misconfiguration violating [[rfc:6762|RFC 6762]]\'s "link-local only" intent. **Christian Rossow\'s "Amplification Hell" ({{ndss-conf|NDSS}} 2014)** measured BAF up to ~10× for mDNS. **CERT/CC VU#550620 (March 2015)** and **Akamai (December 2016)** documented in-the-wild abuse. **Cure:** {{firewall|firewall}} UDP/5353 at the {{wan|WAN}} edge; ensure your responder refuses non-link-local {{unicast|unicast}} queries; deploy BCP 38 ingress filtering.'
			},
			{
				title: 'Stadium / large-venue mDNS storms',
				text: 'Tens of thousands of phones on one {{vlan|VLAN}}, each chattering Bonjour. APs without IGMP snooping (or with snooping miscalibrated) rebroadcast every [[mdns-dns-sd|mDNS]] packet at 6 Mbps. Result: air-time exhaustion, failed authentications, user complaints. **Cure:** disable {{broadcast|broadcast}}/{{multicast|multicast}} on stadium SSIDs entirely, or deploy [[mdns-dns-sd|mDNS]] gateways with rate limits. The lesson is in {{cisco|Cisco}} / Aruba / Meraki blog posts rather than {{cve|CVE}} records — operators treat these incidents as embarrassments.'
			}
		]
	}
};
