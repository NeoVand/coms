import type { Protocol } from '../types';

export const ipsec: Protocol = {
	id: 'ipsec',
	name: 'Internet Protocol Security',
	abbreviation: 'IPsec',
	categoryId: 'utilities',
	port: 500,
	year: 1995,
	rfc: 'RFC 4301 / 7296',
	oneLiner:
		'The {{ietf|IETF}}\'s Layer-3 cryptographic envelope — every site-to-site VPN, every {{3gpp|3GPP}} mobile-core backhaul, every IKEv2 client tunnel on macOS / iOS / Windows / {{android|Android}} runs IPsec.',
	overview: `[[ipsec|IPsec]] is the {{ietf|IETF}}'s **network-layer** security architecture. Where [[tls|TLS]] wraps a single [[tcp|TCP]] stream and [[ssh|SSH]] wraps a single remote session, [[ipsec|IPsec]] {{encryption|encrypts}} entire [[ip|IP]] {{packet|packets}} — host-to-host, gateway-to-gateway, or both — and is the only mainstream cryptographic protocol that lives *inside* the network stack rather than above it. **{{ah-authentication-header|AH}}** ([[rfc:4302|RFC 4302]]) authenticates the [[ip|IP]] {{header|header}} and {{payload|payload}}; **{{esp|ESP}}** ([[rfc:4303|RFC 4303]], the part everyone actually deploys) encrypts and authenticates payloads using {{aead|AEAD ciphers}} like {{aes-gcm|AES-GCM}} and {{chacha20-poly1305|ChaCha20-Poly1305}}. **{{ike|IKEv2}}** ([[rfc:7296|RFC 7296]], the modern key-management protocol, edited across decades by [[pioneer:charlie-kaufman|Charlie Kaufman]] and [[pioneer:tero-kivinen|Tero Kivinen]]) negotiates the {{cipher-suite|cipher suite}} and establishes the {{security-association|Security Associations}} the data plane uses.

The architecture began in 1995 with [[pioneer:randall-atkinson|Randall Atkinson]] at the U.S. Naval Research Lab (RFC 1825/1826/1827); [[pioneer:phil-karn|Phil Karn]] influenced the design from Qualcomm and was, in parallel, the plaintiff in *Karn v. U.S. State Department* — the export-control case that helped establish "code is speech." [[ipsec|IPsec]] has been re-architected twice ([[rfc:4301|RFC 4301]], 2005) and survived a 2003 architectural critique from Ferguson and Schneier (whose paper concluded it was, despite its complexity, "the best [[ip|IP]] security protocol available at the moment"). It is the **only** widely-deployed VPN that natively carries [[bgp|BGP]] / [[ospf|OSPF]] / {{multicast|multicast}} on tunnel interfaces — the reason {{3gpp|3GPP}} picked it for LTE S1/X2 and 5G N2/N3 backhaul, and the reason every carrier on Earth runs it whether they want to or not.

As of May 2026, [[ipsec|IPsec]] is also the first mainstream VPN with a real, deployable **post-quantum** story: [[rfc:8784|RFC 8784]] mixes a post-quantum pre-shared key into IKEv2; [[rfc:9242|RFC 9242]] adds the IKE_INTERMEDIATE {{exchange|exchange}} so large PQ public keys can be transferred before authentication; [[rfc:9370|RFC 9370]] allows multiple chained key exchanges per SA negotiation. strongSwan 6.0 (December 2024) ships native {{ml-kem|ML-KEM}}. The much-loved [[wifi|WireGuard]] caught up to IPsec on simplicity but is still behind on PQ, on EAP, on carrier certifications (FIPS, Common Criteria, BSI SINA), and on the ability to carry a full routing protocol — which is why [[ipsec|IPsec]] still owns the enterprise/carrier market.`,
	howItWorks: [
		{
			title: 'IKE_SA_INIT — negotiate crypto, exchange DH/ECDH/ML-KEM, detect NAT',
			description:
				'Two peers {{exchange|exchange}} {{diffie-hellman|Diffie-Hellman}} (or ECDH, or **{{ml-kem|ML-KEM}}** since 2024) {{public-key|public keys}}, {{nonce|nonces}}, and the {{cipher-suite|cipher suite}} they support. NAT detection happens here: if either {{peer|peer}} is behind {{nat|NAT}}, the SA switches to UDP/4500 {{encapsulation|encapsulation}}. Two messages total; the resulting *{{ike|IKE SA}}* protects every subsequent {{exchange|exchange}}.'
		},
		{
			title: 'IKE_AUTH — prove identity, authorize the Child SA',
			description:
				'Each {{peer|peer}} presents its identity ({{certificate|certificate}}, raw {{public-key|public key}}, PSK, or EAP method) and signs the IKE_SA_INIT messages with it. Traffic Selectors negotiate *which* {{ip-address|IP address ranges}} flow over the {{tunnel|tunnel}}. The first **{{child-sa|Child SA}}** (a one-direction {{esp|ESP}} key) is set up in the same {{exchange|exchange}}.'
		},
		{
			title: 'ESP — encrypt and authenticate every packet',
			description:
				"Once the {{child-sa|Child SA}} is up, every outbound [[ip|IP]] {{packet|packet}} matching the Security Policy Database (SPD) is wrapped in an **{{esp|ESP}} {{header|header}}** (32-bit SPI + 32-bit {{sequence-number|sequence number}}), {{aead|AEAD-encrypted}} with the negotiated key, and forwarded. In **tunnel mode** (the default for gateways) the original [[ip|IP]] packet is {{encapsulation|encapsulated}} inside a new outer [[ip|IP]] header. In **transport mode** (host-to-host) the [[ip|IP]] header is preserved and only the {{payload|payload}} is encrypted."
		},
		{
			title: 'Anti-replay window',
			description:
				'The 32-bit ESP {{sequence-number|sequence number}} prevents {{replay-attack|replay}}. Receivers maintain a sliding **{{anti-replay|anti-replay window}}** ([[rfc:4303|RFC 4303]] §3.4.3 default = 32 entries; production at 10 Gbps+ needs 1024+). Window misconfiguration is the single most common reason a tuned site-to-site tunnel drops legitimate packets — [[rfc:4303|RFC 4303]] §A.2 specifically warns about it.'
		},
		{
			title: 'Rekey before the SA expires',
			description:
				'Each {{child-sa|Child SA}} has a time-and-byte lifetime (default ~8 hours / ~100 GB). Before either limit is hit, peers run **CREATE_CHILD_SA** to derive a fresh key from the {{ike-sa|IKE SA}} — usually invisible. The {{ike-sa|IKE SA}} itself rekeys with **IKE_SA_REKEY**; every 24 hours is a common production policy.'
		},
		{
			title: 'NAT-T, MOBIKE, MOBIKE-X — survive the real internet',
			description:
				'Once outside the lab, NAT and mobility appear. **NAT-T** (UDP/4500) wraps ESP in [[udp|UDP]] so home routers don\'t corrupt the packet. **MOBIKE** ([[rfc:4555|RFC 4555]]) lets a roadwarrior survive Wi-Fi-to-LTE handoff. **RFC 8229 (IKE/ESP over [[tcp|TCP]])** is the last-resort fallback for hostile networks (hotel Wi-Fi, captive portals) that drop [[udp|UDP]].'
		}
	],
	useCases: [
		'3GPP LTE S1/X2 and 5G N2/N3/Xn/F1/E1 mobile-core backhaul (RFC mandated)',
		'Enterprise site-to-site VPN between firewalls (Cisco ASA, Juniper SRX, Fortinet, OPNsense, pfSense)',
		'Roadwarrior remote access — Apple iOS/macOS native IKEv2, Microsoft Always-On VPN, strongSwan / NetworkManager',
		'AWS Site-to-Site VPN, Azure VPN Gateway, GCP Cloud VPN — every public cloud SKU',
		'GRE-over-[[ipsec|IPsec]] tunnels that carry [[bgp|BGP]] / [[ospf|OSPF]] across encrypted overlay networks',
		'Opportunistic encryption between cooperating networks (null-auth, RFC 7619)'
	],
	codeExample: {
		language: 'cli',
		code: `# strongSwan — the most-deployed open-source IPsec/IKEv2 implementation.
# /etc/swanctl/conf.d/site-to-site.conf
connections {
    hq-branch {
        version = 2                       # IKEv2 only
        proposals = aes256gcm16-prfsha384-ecp384-mlkem768
        local_addrs  = 198.51.100.1
        remote_addrs = 203.0.113.5

        local  { auth = pubkey  certs = hq.example.com.crt }
        remote { auth = pubkey  id = branch.example.com    }

        children {
            office-net {
                local_ts  = 10.0.0.0/16
                remote_ts = 10.1.0.0/16
                esp_proposals = aes256gcm16-ecp384
                rekey_time = 8h
                life_time  = 24h
                start_action = trap        # SA created on first match
                dpd_action  = restart      # dead-peer detection
            }
        }
    }
}

# Bring it up and inspect:
swanctl --load-all
swanctl --initiate --child office-net
swanctl --list-sas
ip -s xfrm state                          # kernel data-plane counters
ip -s xfrm policy                         # SPD entries`,
		caption: 'A site-to-site [[ipsec|IPsec]] tunnel in strongSwan with **{{ml-kem|ML-KEM}}-768 hybrid post-quantum** key {{exchange|exchange}} — production-deployable today on {{linux|Linux}} 6.x.',
		alternatives: [
			{
				language: 'python',
				code: `# Scapy — craft and inspect IKE_SA_INIT on the wire.
# Useful for unit-testing implementations and capturing weird interop bugs.
from scapy.all import *
from scapy.contrib.ikev2 import *

# IKE_SA_INIT: initiator -> responder
init = (
    IP(dst='203.0.113.5')
    / UDP(sport=500, dport=500)
    / IKEv2(init_SPI=RandLong(), resp_SPI=0, exch_type=34, flags='Initiator')
    / IKEv2_payload_SA(
        next_payload='KE',
        prop=IKEv2_payload_Proposal(
            trans_nb=4,
            trans=[
                IKEv2_payload_Transform(transform_type='Encryption', transform_id=20),  # AES-GCM-16-256
                IKEv2_payload_Transform(transform_type='PRF',        transform_id=7),   # PRF_HMAC_SHA2_512
                IKEv2_payload_Transform(transform_type='Integrity',  transform_id=0),
                IKEv2_payload_Transform(transform_type='GroupDesc',  transform_id=20),  # ecp384
            ]
        )
    )
    / IKEv2_payload_KE(group=20, ke_data=RandBin(96))
    / IKEv2_payload_Nonce(load=RandBin(32))
)
send(init)`
			},
			{
				language: 'javascript',
				code: `// Browsers cannot speak IPsec directly — it lives in the kernel.
// On macOS / iOS / Windows / Android, IKEv2 is configured via MDM profiles
// (.mobileconfig on Apple, intunemanagement on Microsoft).

// Below: programmatic IKEv2 profile via macOS \`networksetup\` + a generated
// .mobileconfig. This is what an MDM agent does internally.

const profile = \`<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>PayloadType</key><string>com.apple.vpn.managed</string>
  <key>VPNType</key><string>IKEv2</string>
  <key>IKEv2</key>
  <dict>
    <key>RemoteAddress</key><string>vpn.example.com</string>
    <key>AuthenticationMethod</key><string>Certificate</string>
    <key>RemoteIdentifier</key><string>vpn.example.com</string>
    <key>DeadPeerDetectionRate</key><string>Medium</string>
    <key>EnablePFS</key><true/>
    <key>EnableRedirect</key><true/>
    <key>IKESecurityAssociationParameters</key>
    <dict>
      <key>EncryptionAlgorithm</key><string>AES-256-GCM</string>
      <key>DiffieHellmanGroup</key><integer>20</integer>
      <key>LifeTimeInMinutes</key><integer>1440</integer>
    </dict>
  </dict>
</dict>
</plist>\`;

require('fs').writeFileSync('vpn.mobileconfig', profile);`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'IKE_SA_INIT (UDP/500, initiator → responder)',
						code: `IKEv2 Header (28 bytes):
  Initiator SPI:   0x1122334455667788
  Responder SPI:   0x0000000000000000   (zero — responder not chosen yet)
  Next Payload:    SA (33)
  Version:         2.0
  Exchange Type:   IKE_SA_INIT (34)
  Flags:           0x08 (Initiator, not Response)
  Message ID:      0
  Length:          312 bytes

Payloads:
  SA Proposal #1, ENCR=AES-GCM-256, PRF=HMAC-SHA-2-512, DH=ecp384, KE-group=ML-KEM-768
  KE (Key Exchange): group=ML-KEM-768, data=<1184-byte public key>
  Nonce: <32 random bytes>
  Notify(NAT_DETECTION_SOURCE_IP):     SHA-1(SPI_i || SPI_r || src_ip || src_port)
  Notify(NAT_DETECTION_DESTINATION_IP): SHA-1(SPI_i || SPI_r || dst_ip || dst_port)`
					},
					{
						title: 'ESP packet (tunnel mode, AES-GCM-256)',
						code: `Outer IP header:    src=198.51.100.1  dst=203.0.113.5  protocol=50 (ESP)
ESP header:
  SPI:             0xC0FFEE01            (Security Parameters Index)
  Sequence Number: 0x000003D2            (auto-incrementing, anti-replay key)
ESP encrypted payload:
  IV / Nonce:      8 bytes (GCM)
  Ciphertext:      <original IP packet + ESP trailer, AES-GCM-256 encrypted>
  ICV (Auth Tag):  16 bytes (GCM authentication tag)

→ Receiver decrypts using SA keyed by SPI, validates ICV, increments
  anti-replay window, strips ESP, and forwards the inner IP packet.`
					},
					{
						title: 'CREATE_CHILD_SA — rekey before lifetime expires',
						code: `IKEv2 Header:
  Exchange Type:   CREATE_CHILD_SA (36)
  Message ID:      n (next in sequence after IKE_SA_INIT/IKE_AUTH)
  Flags:           Initiator

Payloads:
  SA Proposal (new Child SA's algorithms)
  Nonce (fresh, both directions)
  KE (optional — for PFS)
  TSi, TSr (Traffic Selectors)
  Notify(REKEY_SA): SPI of the SA being rekeyed
  Notify(ESP_TFC_PADDING_NOT_SUPPORTED): explicit padding mode (RFC 8019)

→ Both sides derive new KEYMAT from the new nonces + (optional) fresh DH/ML-KEM
  result, install the new ESP SAs, and start using them. Old SAs are deleted
  after MaxRetransmit retries with INFORMATIONAL(DELETE).`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'2 round trips for IKE_SA_INIT + IKE_AUTH = ~2 RTT for tunnel up. ESP itself is single-pass — ~10–50 µs per packet on x86-64 with AES-NI; sub-microsecond on dedicated crypto NICs',
		throughput:
			'AES-GCM-128 software: 3–6 Gbps single-core x86-64 with AES-NI; 40–100 Gbps on dedicated crypto NICs (Mellanox BlueField, Intel QAT). AWS Site-to-Site VPN: 5 Gbps/tunnel (ECMP-aggregable); Azure VPN Gateway 5 AZ: 10 Gbps aggregate',
		overhead:
			'ESP adds 36–44 bytes per packet (8B SPI+seq, 8B IV, up to 16B padding+trailer, 16B GCM ICV). Tunnel mode adds another 20-byte outer IPv4 header (40 bytes for IPv6). MTU clamping is mandatory unless PMTUD is reliable'
	},
	connections: ['ip', 'ipv6', 'udp', 'tcp', 'tls', 'bgp', 'ospf', 'quic', 'wireguard'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/IPsec',
		rfc: 'https://www.rfc-editor.org/rfc/rfc7296',
		official: 'https://datatracker.ietf.org/wg/ipsecme/about/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Ipsec-ah.svg/500px-Ipsec-ah.svg.png',
		alt: 'IPsec Authentication Header (AH) format diagram showing the fields that authenticate every IP packet',
		caption:
			'IPsec\'s **Authentication Header (AH)** — the simpler half of the architecture. Authenticates the [[ip|IP]] header *and* {{payload|payload}}, but encrypts nothing. Almost no production deployment uses AH alone in 2026; **ESP** ([[rfc:4303|RFC 4303]]) — which encrypts *and* authenticates — has won the architecture debate.',
		credit: 'Image: Wikimedia Commons / CC BY-SA'
	},

	recentChanges: [
		{
			date: '2024-08',
			title: 'NIST finalises ML-KEM (FIPS 203)',
			description:
				'On 13 August 2024 NIST published FIPS 203 — the standardised form of CRYSTALS-Kyber. This is the post-quantum KEM that [[ipsec|IPsec]] implementations are wiring into IKEv2 via `draft-{{ietf|ietf}}-ipsecme-ikev2-mlkem`. The first deployable PQ VPN story.',
			source: { url: 'https://csrc.nist.gov/pubs/fips/203/final', label: 'NIST FIPS 203' }
		},
		{
			date: '2024-12',
			title: 'strongSwan 6.0 — native ML-KEM + RFC 9370 multi-KE',
			description:
				'3 December 2024. strongSwan 6.0.0 ships native {{ml-kem|ML-KEM}} key {{exchange|exchange}} and [[rfc:9370|RFC 9370]] multiple-KE — meaning two or more KEMs (e.g. classical ecp384 + post-quantum {{ml-kem|ML-KEM}}-768) can be chained inside one IKEv2 negotiation. The first production-quality hybrid PQ VPN.',
			source: {
				url: 'https://strongswan.org/blog/2024/12/03/strongswan-6.0.0-released.html',
				label: 'strongSwan 6.0 release notes'
			}
		},
		{
			date: '2025-02',
			title: 'Libreswan 5.2 — IP-TFS and PPK-in-INTERMEDIATE',
			description:
				'26 February 2025. Libreswan 5.2 ships [[rfc:9347|RFC 9347]] IP-TFS (Traffic Flow Security — fixed-size aggregated packets to defeat traffic analysis) and post-quantum pre-shared key carriage in the IKE_INTERMEDIATE {{exchange|exchange}}.',
			source: { url: 'https://libreswan.org/security/CVE-2025/', label: 'Libreswan 5.x changelog' }
		},
		{
			date: '2026-03',
			title: 'draft-ietf-ipsecme-ikev2-mlkem-05',
			description:
				'14 March 2026. Fifth revision of the [[ipsec|IPsec]] WG draft that bakes {{ml-kem|ML-KEM}} into IKEv2 as a first-class key-{{exchange|exchange}} method. Adoption-call close on the FrodoKEM hybrid draft on 18 January 2026 means [[ipsec|IPsec]] will likely ship multiple PQ KEMs side-by-side.',
			source: {
				url: 'https://datatracker.ietf.org/doc/draft-ietf-ipsecme-ikev2-mlkem/',
				label: 'IETF draft-ietf-ipsecme-ikev2-mlkem'
			}
		},
		{
			date: '2023-08',
			title: 'RFC 9347 — IP-TFS (Traffic Flow Security)',
			description:
				'Defines fixed-size aggregated packets inside [[ipsec|ESP]] tunnels to defeat traffic-analysis attacks that infer activity from packet sizes. The architectural answer to "your VPN hides what you say but not *how much* you say." Now shipped in Libreswan.',
			source: { url: 'https://www.rfc-editor.org/rfc/rfc9347', label: 'RFC 9347' }
		}
	],

	realWorldDeployments: [
		{
			org: '3GPP / every mobile carrier',
			scale: 'Every LTE/5G base station + mobile-core in the world',
			description:
				'{{3gpp|3GPP}} TS 33.401 (LTE) and TS 33.501 (5G) mandate [[ipsec|IPsec]] for the S1, X2, N2, N3, Xn, F1, and E1 interfaces. The IKEv2 + ESP combo runs on every eNB/gNB to every EPC/5GC. This is the single largest [[ipsec|IPsec]] deployment on Earth.'
		},
		{
			org: 'strongSwan / Libreswan',
			scale: 'The two reference open-source implementations',
			description:
				'strongSwan (originally HSR Rapperswil, now under [[pioneer:andreas-steffen|Andreas Steffen]] and the OST team; owned by secunet AG since June 2022, central to the BSI SINA high-security solution) and Libreswan (descendent of FreeS/WAN → Openswan, maintained by [[pioneer:paul-wouters|Paul Wouters]] at Aiven, ships in Red Hat Enterprise {{linux|Linux}}). Together they run almost every {{linux|Linux}}-based [[ipsec|IPsec]] deployment.'
		},
		{
			org: 'Cloud hyperscalers (AWS / Azure / GCP / Oracle)',
			scale: 'Every Site-to-Site VPN SKU; 5–10 Gbps per tunnel',
			description:
				'AWS Site-to-Site VPN (IKEv2, AES-256-GCM, ECDH groups 19–24, 5 Gbps/tunnel), Azure VPN Gateway (10 Gbps aggregate on the AZ-redundant SKU), GCP Cloud VPN, OCI Site-to-Site VPN. [[ipsec|IPsec]] is the universal "connect my on-prem to my VPC" sku across every cloud.'
		},
		{
			org: 'Operating-system native clients',
			scale: 'Every modern OS ships an IKEv2 client',
			description:
				'{{apple|Apple}} iOS / macOS: native IKEv2 since iOS 9 / OS X 10.11 (configured via `.mobileconfig`). {{microsoft|Microsoft}} Always-On VPN: IKEv2 + EAP-TLS profile baseline. {{android|Android}}: native IKEv2/IPsec PSK + EAP since {{android|Android}} 12. {{linux|Linux}}: NetworkManager + strongSwan. OpenBSD: clean-room `iked` since OpenBSD 4.8 (2010), by Reyk Floeter.'
		}
	],

	funFacts: [
		{
			title: 'Phil Karn sued the US State Department over an IPsec book',
			text: 'In 1995 [[pioneer:phil-karn|Phil Karn]] tried to export Bruce Schneier\'s *Applied Cryptography*. The State Department classified the **printed book** as First Amendment-protected speech, but the **floppy disk** containing the same code as a regulated munition under ITAR. *Karn v. U.S. State Department* became one of the founding "code is speech" cases. Karn would shortly thereafter contribute to RFC 1827 (ESP).'
		},
		{
			title: 'Ferguson & Schneier\'s "I told you so" paper actually endorsed IPsec',
			text: 'The 2003 Ferguson-Schneier critique *"A Cryptographic Evaluation of IPsec"* is the most-cited "I told you so" in network security — practitioners love quoting its complexity warnings. But the full text explicitly concludes [[ipsec|IPsec]] is "**the best [[ip|IP]] security protocol available at the moment**." Engineers cite the first half, regulators cite the second.'
		},
		{
			title: 'The NSA exploit and the working group meet in the same building',
			text: 'The Shadow Brokers leak (August 2016) revealed BENIGNCERTAIN — an NSA exploit that extracted {{cisco|Cisco}} PIX VPN private keys from IKEv1 (CVE-2016-6415). The [[ipsec|IPSECME]] working group routinely seats {{cisco|Cisco}}, {{microsoft|Microsoft}}, AWS, and NSA Cybersecurity Directorate engineers at the same table. [[rfc:8784|RFC 8784]] (PQ-PPK) is co-authored by {{cisco|Cisco}}, AWS, and ELVIS-PLUS engineers — [[ipsec|IPsec]] has always been multi-government.'
		},
		{
			title: 'WireGuard is ~4,000 lines; the IPsec stack is six digits',
			text: '[[pioneer:jason-donenfeld|Jason Donenfeld]]\'s 2017 NDSS WireGuard paper counted 116,730 LoC across OpenVPN + {{linux|Linux}} XFRM + strongSwan + SoftEther. The comparison is biased — XFRM does more — but the order of magnitude is correct. WireGuard\'s minimalism is a direct response to [[ipsec|IPsec]]\'s architectural sprawl; [[ipsec|IPsec]]\'s sprawl is a direct response to thirty years of interop requirements no clean-slate design has yet had to face.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Anti-replay window is 32 by default — drop legitimate packets at 10 Gbps',
				text: '[[rfc:4303|RFC 4303]] §3.4.3 sets the {{anti-replay|anti-replay window}} default to **32 entries**. On a 10 Gbps+ ECMP-parallel tunnel ({{linux|Linux}} XFRM default), packets routinely arrive out of order beyond that window and get dropped. **Cure:** `ip xfrm state ... replay-window 1024` on every {{linux|Linux}} gateway carrying >1 Gbps. The single most-common reason a "tuned" site-to-site tunnel mysteriously loses 0.01% of packets.'
			},
			{
				title: 'PMTU black holes drop large packets silently',
				text: '[[ipsec|IPsec]] in tunnel mode adds 36–60 bytes of overhead. If an intermediate hop drops large packets and the [[icmp|ICMP]] "{{fragmentation|fragmentation}} needed" message is filtered upstream (very common — security policy blocks [[icmp|ICMP]] type 3), the connection hangs after the first few KB. **Cure:** [[tcp|TCP]] MSS clamping at the gateway (`iptables -t mangle ... TCPMSS --clamp-mss-to-pmtu`) or enable PLPMTUD ([[rfc:4821|RFC 4821]]).'
			},
			{
				title: 'Roadwarriors die on Wi-Fi → LTE handoff without MOBIKE',
				text: 'A roadwarrior session that comes up on hotel Wi-Fi will tear down the moment the laptop switches to LTE — the {{ike-sa|IKE SA}} is bound to the source `ip:port` and reconnects from scratch. **Cure:** enable **MOBIKE** ([[rfc:4555|RFC 4555]]) on both ends (`mobike=yes` in strongSwan). The session migrates seamlessly to the new {{ip-address|address}} without re-authenticating. Built into {{apple|Apple}}\'s native client; opt-in on strongSwan/Libreswan.'
			}
		]
	}
};
