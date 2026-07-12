import type { Protocol } from '../types';

export const wireguard: Protocol = {
	id: 'wireguard',
	name: 'WireGuard',
	abbreviation: 'WG',
	categoryId: 'utilities',
	port: 51820,
	year: 2016,
	rfc: 'WireGuard whitepaper (NDSS 2017)',
	oneLiner:
		'A ~4,000-line in-kernel {{vpn|VPN}} that does one thing — encrypted, authenticated, packet-routed {{ip-address|IP}} tunnels — with a single, opinionated, modern crypto suite. The deliberate anti-[[ipsec|IPsec]].',
	overview: `[[wireguard|WireGuard]] is a Layer-3 secure-{{tunnel|tunnel}} protocol that encapsulates [[ip|IP]] {{packet|packets}} inside [[udp|UDP]] after a single round-trip Noise_IKpsk2 {{handshake|handshake}}. It collapses ACL and routing into one mechanism — **cryptokey routing** — where each {{peer|peer}}'s {{curve25519|Curve25519}} {{public-key|public key}} is bound to a set of \`AllowedIPs\` prefixes. There are *exactly* four message types and *exactly* one {{cipher-suite|ciphersuite}} (\`Noise_IKpsk2_25519_ChaChaPoly_BLAKE2s\`). No negotiation, no extensibility, no algorithmic agility, and deliberately **no {{ietf|IETF}} standardisation**.

Created as a side project by [[pioneer:jason-donenfeld|Jason A. Donenfeld]] in 2015 after a long pen-testing frustration with [[ipsec|IPsec]] and OpenVPN, the first public code snapshot is dated **30 June 2016**. Donenfeld presented the whitepaper at {{ndss-conf|NDSS}} 2017. Linus Torvalds endorsed it on the kernel mailing list in August 2018 as *"a work of art… compared to the horrors that are OpenVPN and [[ipsec|IPsec]]"*; the module was mainlined in **{{linux|Linux}} 5.6 on 29 March 2020**. The whole kernel module weighs in at around **4,000 lines of code**, versus 100,000+ for OpenVPN's core and the six-figure footprint of strongSwan + {{linux|Linux}} {{xfrm|XFRM}}.

The crypto choices are a victory lap for the Daniel J. Bernstein stack — **{{curve25519|Curve25519}}** (2006), **ChaCha20** (2008), **{{poly1305|Poly1305}}** (2005), **BLAKE2s** — wrapped in the **{{noise-protocol|Noise Protocol Framework}}** ([[pioneer:trevor-perrin|Trevor Perrin]], 2016). The {{handshake|handshake}} is formally verified (Donenfeld & Milner 2018, Tamarin) and has been cryptographically analysed (Dowling & Paterson 2018, Lafourcade, Mahmoud & Ruhault {{ndss-conf|NDSS}} 2024). Today it underpins {{cloudflare|Cloudflare}} WARP (>50M daily clients via {{cloudflare|Cloudflare}}'s BoringTun Rust implementation), **Tailscale** ([[pioneer:avery-pennarun|Avery Pennarun]] et al., mesh networking on top of WireGuard), NordVPN's NordLynx, Mullvad, Mozilla {{vpn|VPN}}, ProtonVPN, and an uncountable long tail of self-hosted deployments. The post-quantum companion **Rosenpass** (Hülsing/Varner 2022) hands a {{pq|PQ}}-secure {{pfs|pre-shared key}} to WireGuard every 120 s, giving harvest-now-decrypt-later resistance without touching the kernel module.`,
	howItWorks: [
		{
			title: 'Identity = public key',
			description:
				'Each {{peer|peer}} holds a 32-byte {{curve25519|Curve25519}} long-term keypair. There are no certificates, no {{pki|PKI}}, no IDs — the {{public-key|public key}} *is* the identity. You {{exchange|exchange}} them out of band (`scp`, GitHub, a Tailscale control plane).'
		},
		{
			title: 'Handshake Initiation (148 bytes, type=1)',
			description:
				"Initiator sends an ephemeral {{curve25519|Curve25519}} pubkey, an {{aead|AEAD-encrypted}} copy of its **static** pubkey (hiding sender identity from passive observers), and a {{wg-tai64n|TAI64N timestamp}}. Plus MAC1 (proves the initiator knows the responder's pubkey) and MAC2 ({{cookie|cookie}} under load, DoS shield)."
		},
		{
			title: 'Handshake Response (92 bytes, type=2)',
			description:
				'Responder sends its own ephemeral pubkey, finishing the four-{{diffie-hellman|DH}} **Noise_IK** pattern (plus optional {{psk|PSK}} mix). At the end of these two messages both sides hold matching {{chacha20-poly1305|ChaCha20-Poly1305}} sending and receiving keys; all ephemeral state is wiped.'
		},
		{
			title: 'Cryptokey routing',
			description:
				"`AllowedIPs` on each {{peer|peer}} says *which inner [[ip|IP]] prefixes* may travel through this {{peer|peer}}'s tunnel. It is simultaneously the {{routing-table|routing table}} (outbound: which {{peer|peer}} for which destination prefix) **and** the ACL (inbound: only accept packets from this {{peer|peer}} if the inner source {{ip-address|IP}} falls in its allowed prefixes). One mechanism, both jobs."
		},
		{
			title: 'Transport Data (type=4)',
			description:
				'{{encryption|Encrypted}} [[ip|IP]] {{packet|packets}} are wrapped in a 16-byte WireGuard {{header|header}} (type, receiver-index, 64-bit counter) plus the {{aead|AEAD}} ciphertext + 16-byte {{poly1305|Poly1305}} tag. The 64-bit counter doubles as the {{aead|AEAD}} {{nonce|nonce}} and the {{anti-replay|anti-replay sequence number}}.'
		},
		{
			title: 'Rekey every 120 seconds',
			description:
				'`REKEY_AFTER_TIME = 120 s` and `REKEY_AFTER_MESSAGES = 2^60` force a fresh {{handshake|handshake}} (the hard cap `REJECT_AFTER_MESSAGES = 2^64 − 2^13 − 1` is never reached in practice). Old keys are wiped — **per-message {{forward-secrecy|forward secrecy}}** within a session, **per-{{handshake|handshake}} {{forward-secrecy|forward secrecy}}** across sessions. After `REJECT_AFTER_TIME = 180 s` of silence the session is torn down.'
		}
	],
	useCases: [
		'Site-to-site corporate VPN replacing [[ipsec|IPsec]] / IKEv2',
		'Consumer "global VPN" services — Cloudflare WARP, Mullvad, NordVPN NordLynx, Mozilla VPN, ProtonVPN',
		'Zero-trust mesh networking — **Tailscale**, Headscale, NordVPN Meshnet, exitlightning',
		'Cloud VPC overlays — Fly.io, Hetzner Cloud VPN, in-house Kubernetes CNIs',
		'Personal road-warrior VPN home — OPNsense, pfSense, Algo, PiVPN',
		'Post-quantum hybrid via [[wireguard|Rosenpass]] feeding the WireGuard PSK slot every 120 s'
	],
	codeExample: {
		language: 'cli',
		code: `# Generate keys (anywhere).
wg genkey | tee privatekey | wg pubkey > publickey

# /etc/wireguard/wg0.conf — minimal site-to-site setup.
[Interface]
PrivateKey = <my-private-key>
Address    = 10.0.0.1/24
ListenPort = 51820

# Optional: rotate kernel route automatically at interface-up.
PostUp     = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown   = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

[Peer]
PublicKey  = <peer-public-key>
AllowedIPs = 10.0.0.2/32, 192.168.1.0/24    # routing table AND ACL
Endpoint   = peer.example.com:51820         # resolved at interface-up
PersistentKeepalive = 25                    # keep NAT bindings warm

# Bring it up — wg-quick handles DNS resolution and route setup.
sudo wg-quick up wg0

# Inspect — \`wg show\` is the universal status command.
sudo wg show
#   interface: wg0
#     public key:  <my-public-key>
#     listening port: 51820
#   peer: <peer-public-key>
#     endpoint: 203.0.113.5:51820
#     allowed ips: 10.0.0.2/32, 192.168.1.0/24
#     latest handshake: 23 seconds ago
#     transfer: 142.3 KiB received, 89.7 KiB sent
#     persistent keepalive: every 25 seconds`,
		caption:
			'A complete [[wireguard|WireGuard]] tunnel in 12 lines of config. Same on {{linux|Linux}}, {{bsd|BSD}}, macOS, {{android|Android}}, Windows. The simplicity is the feature.',
		alternatives: [
			{
				language: 'python',
				code: `# wireguard-tools (Python) — read the live kernel state and tweak peers.
# Useful for programmatic config in orchestration scripts.
from wireguard_tools import WireguardConfig, WireguardKey
import ipaddress

# Generate a new keypair the same way \`wg genkey\` does.
priv = WireguardKey.generate()
pub = priv.public_key()

# Load an existing wg0 config and add a peer programmatically.
config = WireguardConfig.from_wgconfig('/etc/wireguard/wg0.conf')
config.add_peer(
    public_key=WireguardKey('xTIBA5rboUvnH4htodjb6e697QjLERt1NAB4mZqp8Dg='),
    allowed_ips=[ipaddress.ip_network('10.0.0.42/32')],
    endpoint='client.example.com:51820',
    persistent_keepalive=25,
)
config.to_wgconfig('/etc/wireguard/wg0.conf')
# wg-quick will pick the new peer up on next \`wg syncconf wg0 <(wg-quick strip wg0)\`.`
			},
			{
				language: 'javascript',
				code: `// wireguard-go (JS-callable via N-API bindings, or use the Tailscale userspace
// reference). Below: a minimal userspace tunnel using the boringtun-compatible
// API. Useful when you can't load a kernel module (containers, mobile).

// boringtun ships a Rust library + CLI; there is no official JS binding.
// From Node you drive the boringtun-cli / wireguard-go userspace tunnel:
import { spawn } from 'node:child_process';

const wg = spawn('boringtun-cli', ['wg0'], { stdio: 'inherit' });
// then configure it with the standard wg(8) tooling:

//   wg set wg0 private-key ./priv listen-port 51820 \\
//     peer xTIBA5rboUvnH4htodjb6e697QjLERt1NAB4mZqp8Dg= \\
//     allowed-ips 10.0.0.2/32 endpoint 203.0.113.5:51820 \\
//     persistent-keepalive 25

// Same crypto on the wire as the kernel module; ~1-3 Gbps vs multi-Gbps
// in-kernel, but works anywhere a userspace process can open a UDP socket
// and a TUN device (containers, mobile). Note: platforms without raw UDP
// sockets (e.g. Cloudflare Workers) cannot run a WireGuard data plane.`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Handshake Initiation (148 bytes)',
						code: `0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Type = 1     |   Reserved (zero) (24 bits)                   |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                Sender Index (32 bits, random)                 |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|     Unencrypted Ephemeral Public (32 bytes Curve25519)        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Encrypted Static (32 B) + 16-byte Poly1305 tag          |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|       Encrypted Timestamp (12 B TAI64N) + 16 B tag            |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       MAC1 (16 bytes)                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                       MAC2 (16 bytes)                         |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+

MAC1 = BLAKE2s-128 keyed by HASH(LABEL_MAC1 ‖ responder_static_public)
MAC2 = BLAKE2s-128 keyed by latest cookie  (set only when responder is loaded)`
					},
					{
						title: 'Handshake Response (92 bytes)',
						code: `Type = 2, Reserved = 0
Sender Index   (4 B random — responder's)
Receiver Index (4 B echoed — initiator's)
Unencrypted Ephemeral Public (32 B Curve25519)
Encrypted Empty + 16 B Poly1305 tag       (proves key agreement)
MAC1 (16 B)
MAC2 (16 B)

After this round trip, both sides have derived:
  T_send_i = HKDF(C, "")
  T_recv_i = HKDF(C, "")    on initiator side
  T_send_r, T_recv_r on responder side
and the chaining-key C is wiped from memory.`
					},
					{
						title: 'Transport Data (type=4) — every inner packet',
						code: `Type = 4
Reserved (zero, 24 bits)
Receiver Index (32 bits)
Counter (64 bits)               <-- AEAD nonce AND anti-replay sequence
Encrypted Encapsulated Packet   <-- ChaCha20 ciphertext of inner IP packet
Poly1305 Authentication Tag (16 bytes)

Overhead per packet:
  WireGuard header   16 B
  UDP header          8 B
  Outer IPv4 header  20 B   (or 40 B for IPv6)
  Poly1305 tag       16 B
  ------------------ ----
  TOTAL             60 B   (80 B for IPv6)

Around 4% data inflation for typical 1400-byte inner packets.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'1 round trip for handshake. <1 ms forwarding-plane overhead in-kernel Linux; ~3–5 ms with BoringTun (userspace, Rust); userspace adds context-switch cost',
		throughput:
			'Multi-Gbps in-kernel Linux (>10 Gbps reported on AES-NI-equipped hardware with ChaCha20). 1–3 Gbps with BoringTun. 1–2 Gbps with wireguard-go',
		overhead:
			'60 bytes/packet over IPv4 (80 over IPv6) — 16 B WireGuard + 8 B UDP + 20 B outer IP + 16 B Poly1305. Roughly 4% data inflation on a 1400-byte inner MTU'
	},
	connections: ['ipsec', 'udp', 'ip', 'ipv6', 'tls', 'nat-traversal', 'quic'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/WireGuard',
		official: 'https://www.wireguard.com/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/98/Logo_of_WireGuard.svg/250px-Logo_of_WireGuard.svg.png',
		alt: 'WireGuard logo — a stylised dragon-snake, inspired by a stone engraving of the mythological Python that Jason Donenfeld saw in a museum in Delphi',
		caption:
			'The [[wireguard|WireGuard]] logo. The dragon-snake is inspired by a stone engraving of the mythological **Python** that [[pioneer:jason-donenfeld|Jason Donenfeld]] saw while visiting a museum in Delphi. The serpent is also a quiet jab at the architectural sprawl of [[ipsec|IPsec]] — many heads, one body.',
		credit: 'Image: Wikimedia Commons / © WireGuard'
	},

	recentChanges: [
		{
			date: '2024-02',
			title: 'NDSS 2024 — unified symbolic analysis surfaces an anonymity flaw',
			description:
				'Lafourcade, Mahmoud & Ruhault, *A Unified Symbolic Analysis of WireGuard* ({{ndss-conf|NDSS}} 2024), confirmed an anonymity flaw and pointed to an implementation choice that "considerably weakens" the protocol\'s identity-hiding guarantee. Not an attack-on-key-material, but the first widely-published symbolic-analysis caveat. Worth tracking — Donenfeld\'s response and possible v2 work-in-progress.',
			source: {
				url: 'https://www.ndss-symposium.org/wp-content/uploads/2024-364-paper.pdf',
				label: 'NDSS 2024 paper PDF'
			}
		},
		{
			date: '2024-04',
			title: 'Rosenpass — post-quantum hybrid VPN companion',
			description:
				"Rosenpass (Andreas Hülsing's group + Karolin Varner), first released February 2023 and still on the 0.2.x series (v0.2.2, June 2024), is a pure-Rust daemon that runs alongside WireGuard and feeds a post-quantum-secure {{psk|PSK}} into WireGuard's {{psk|PSK}} slot. Uses Classic McEliece + Kyber, formally verified in ProVerif. Closes the harvest-now-decrypt-later threat without changing the kernel module.",
			source: {
				url: 'https://rosenpass.eu/',
				label: 'Rosenpass project'
			}
		},
		{
			date: '2024-11',
			title: 'AmneziaWG 2.0 (March 2026) — DPI-resistant fork ships QUIC/DNS mimicry',
			description:
				"Russia's TSPU boxes learned to fingerprint and drop standard WireGuard's invariant 148/92-byte {{handshake|handshake}}. AmneziaWG (Amnezia {{vpn|VPN}} team) responds with randomised packet sizes, randomised header type bytes (H1–H4 ranges instead of fixed 1–4), random S1/S2 padding. AWG 2.0 (March 2026) adds optional QUIC/{{dns-resolution|DNS}}/SIP protocol mimicry; the late-2024 1.x releases only had the packet-randomization features. The architectural cost of [[pioneer:jason-donenfeld|Donenfeld]]'s no-obfuscation stance, made visible.",
			source: {
				url: 'https://docs.amnezia.org/documentation/amnezia-wg/',
				label: 'AmneziaWG documentation'
			}
		},
		{
			date: '2025-02',
			title: 'Tailscale crosses 10,000 paying customers — Series C',
			description:
				'Tailscale (the WireGuard-mesh control-plane company, [[pioneer:avery-pennarun|Avery Pennarun]] + David Crawshaw + Brad Fitzpatrick) raised its Series C at a $1B+ valuation. ~10,000 paying customers; product-market-fit hit, now go-to-market-fit. The single biggest reason engineering teams encounter WireGuard in 2026 is via Tailscale, not via raw `wg-quick`.',
			source: {
				url: 'https://betakit.com/tailscale-hits-10000-paying-customers-as-it-pushes-into-broader-go-to-market-fit/',
				label: 'BetaKit'
			}
		},
		{
			date: '2023-11',
			title: 'Sovereign Tech Fund funds WireGuard — €209,000+',
			description:
				"Germany's Sovereign Tech Fund granted Edge Security (Donenfeld's company) more than €209,000 to fund WireGuard's ongoing maintenance, joining the Open Technology Fund, NLnet, Mullvad, Tailscale, Jump Trading, and Fly.io. The project is now well-funded — a meaningful change from the single-maintainer hobbyist days of 2016–2018.",
			source: {
				url: 'https://en.wikipedia.org/wiki/WireGuard#Funding',
				label: 'Wikipedia — WireGuard funding'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Cloudflare WARP',
			scale: '>50 million daily active clients',
			description:
				"{{cloudflare|Cloudflare}}'s consumer {{vpn|VPN}} (1.1.1.1 + WARP app) runs on **BoringTun**, {{cloudflare|Cloudflare}}'s pure-Rust WireGuard implementation (released 2019). Routes user traffic over WireGuard to {{cloudflare|Cloudflare}}'s edge for security and (with WARP+) {{latency|latency}} improvements. The single largest WireGuard deployment by user count."
		},
		{
			org: 'Tailscale',
			scale: '10,000+ paying customers, hundreds of thousands of free users',
			description:
				'Mesh networking on top of WireGuard. The control plane handles key {{exchange|exchange}}, {{nat|NAT}}-traversal coordination (via {{stun|STUN}}-style hole-punching with DERP relay fallback — analogous to [[nat-traversal|TURN]]), ACLs ("tailnet" policy). Founded 2019 by [[pioneer:avery-pennarun|Pennarun]], Crawshaw, Carney + Fitzpatrick (Jan 2020). Series C 2025.'
		},
		{
			org: 'NordVPN NordLynx',
			scale: '~14 million users on the NordLynx protocol',
			description:
				"NordVPN's flagship protocol since 2019. NordLynx wraps WireGuard with a custom {{nat|NAT}}-style account system (since vanilla WireGuard assigns static inner IPs by design, NordVPN had to solve the dynamic-{{ip-address|IP}} problem in userspace). Markets WireGuard's ~4,000 LoC vs OpenVPN's 100,000 explicitly."
		},
		{
			org: 'Linux kernel mainline',
			scale: 'Every modern Linux distro ships WireGuard since 5.6 (March 2020)',
			description:
				'Mainlined 29 March 2020. Available in Debian, Ubuntu, Fedora, {{rhel|RHEL}}, Arch, openSUSE, Alpine. The kernel module is the canonical implementation; everything else (BoringTun, wireguard-go, wireguard-windows) is a userspace fallback for platforms without kernel access. ~4,000 LoC in `drivers/net/wireguard/` upstream.'
		}
	],

	funFacts: [
		{
			title: 'The "4,000 lines of code" number is in the whitepaper itself',
			text: 'From the [[pioneer:jason-donenfeld|Donenfeld]] {{ndss-conf|NDSS}} 2017 paper: *"WireGuard can be simply implemented for {{linux|Linux}} in less than 4,000 lines of code, making it easily audited and verified."* For comparison, OpenVPN\'s core (not counting OpenSSL) is north of 100,000 lines, and the equivalent {{linux|Linux}} [[ipsec|IPsec]] stack ({{xfrm|XFRM}} + strongSwan + libraries) is in the six digits. The order-of-magnitude has not changed in the 9 years since.'
		},
		{
			title: 'Linus said it was "a work of art"',
			text: "On 2 August 2018, in a postscript to a {{linux|Linux}} 4.18 networking pull-request, Linus Torvalds wrote: *\"I see that Jason actually made the pull request to have wireguard included in the kernel. Can I just once again state my love for it and hope it gets merged soon? Maybe the code isn't perfect, but I've skimmed it, and compared to the horrors that are OpenVPN and [[ipsec|IPsec]], it's a work of art.\"* It took another 19 months for the merge to land ({{linux|Linux}} 5.6, March 2020) but the endorsement set the trajectory."
		},
		{
			title: 'No IETF RFC — by design',
			text: "[[pioneer:jason-donenfeld|Donenfeld]] on the *Security Cryptography Whatever* podcast (Dec 2021): *\"I have a very low opinion of internet standards, cryptography and internet standards… WireGuard is one of the first times in my career I've seen something get this much adoption without having to get through the filter of the {{ietf|IETF}}. I worry that publishing an {{rfc-doc|RFC}} might send the wrong message where — oh, it sends the right bits on the wire, it's done — that's not good enough.\"* {{rfc-doc|RFC}} 8922 (2020) mentions WireGuard for the Transport Services document but is not normative."
		},
		{
			title: 'The logo is a snake from Delphi',
			text: 'The [[wireguard|WireGuard]] logo is inspired by a stone engraving of the **mythological Python** that [[pioneer:jason-donenfeld|Donenfeld]] saw while visiting a museum in Delphi, Greece. The serpent doubles as a quiet visual jab at the architectural sprawl of [[ipsec|IPsec]] — many heads, one body. (Source: wireguard.com/about/.)'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'AllowedIPs is your routing table AND your ACL',
				text: 'A single `AllowedIPs` field on each {{peer|peer}} does two jobs: outbound it picks which {{peer|peer}} to send packets through for a given destination prefix, and inbound it filters which inner source IPs the {{peer|peer}} is allowed to send. Forgetting this is the most common config bug. **Cure:** when a {{peer|peer}} is supposed to be a "remote {{subnet|subnet}}", put the {{subnet|subnet}} in `AllowedIPs`. When a {{peer|peer}} is supposed to be a "single roadwarrior", put just its `/32`. When a {{peer|peer}} is "default route everything", use `0.0.0.0/0, ::/0` — and add `PostUp` rules for masquerading.'
			},
			{
				title: 'No dynamic IPs out of the box',
				text: 'Vanilla WireGuard refuses to do [[dns|DNS]] lookups on `Endpoint =` (the kernel module is keep-it-simple, no [[dns|DNS]]). The plumbing for "the {{peer|peer}}\'s endpoint changed because their {{isp|ISP}} rebooted them" is **not in the kernel**. `wg-quick(8)` resolves hostnames at interface-up time only. **Cure:** for road-warriors, the {{peer|peer}} connects *out* to a fixed endpoint and uses `PersistentKeepalive` to hold the {{nat|NAT}} binding. For dynamic-{{ip-address|IP}} servers, run `reresolve-dns.timer` (Donenfeld\'s own systemd timer) to re-resolve `Endpoint =` periodically.'
			},
			{
				title: 'DPI-resistance is not in the protocol',
				text: "Standard [[wireguard|WireGuard]]'s 148-byte and 92-byte handshakes and fixed 1/2/3/4 message-type bytes form an obvious fingerprint. Russia's TSPU boxes (2024) and Iran's filtering systems (2024–2025) learned to drop WireGuard handshakes on sight. **Cure:** if you operate from or to a censorious network, deploy **AmneziaWG** (the Amnezia {{vpn|VPN}} team's fork — randomised header bytes, random S1/S2 padding, optional QUIC/{{dns-resolution|DNS}} mimicry, retains the WireGuard crypto suite intact). Or fall back to **{{masque|MASQUE}} {{mqtt-connect|CONNECT}}-{{ip-address|IP}}** over [[http3|HTTP/3]]."
			}
		]
	}
};
