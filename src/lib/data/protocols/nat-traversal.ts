import type { Protocol } from '../types';

export const natTraversal: Protocol = {
	id: 'nat-traversal',
	name: 'NAT Traversal',
	abbreviation: 'STUN/TURN/ICE',
	categoryId: 'utilities',
	port: 3478,
	year: 2003,
	rfc: 'RFC 8489 / 8656 / 8445',
	oneLiner:
		'Lets two peers behind home routers find each other: {{stun|STUN}} learns your public address, {{turn|TURN}} relays when direct paths fail, and {{ice|ICE}} picks the best working path.',
	overview: `[[nat-traversal|NAT traversal]] is the reason a [[webrtc|WebRTC]] call between two laptops on home Wi-Fi works at all. The public internet only routes between public {{ip-address|IP addresses}}, but most devices live behind {{nat|NAT}} routers that share one address across many {{hosts-bare|hosts}}. [[nat-traversal|NAT traversal]] is a three-protocol bundle — {{stun|STUN}}, {{turn|TURN}}, and {{ice|ICE}} — that lets two such devices discover each other's public-facing address, probe every possible path between them, and fall back to a relay when nothing direct works.

**{{stun|STUN}}** ([[rfc:8489|RFC 8489]], the modern revision of [[pioneer:jonathan-rosenberg|Jonathan Rosenberg]]'s 2003 [[rfc:8489|RFC 3489]]) is the wire format and the reflexive-address probe. A client sends a 20-byte Binding Request to a public {{stun|STUN}} server; the server replies with the address it saw, encoded as \`XOR-MAPPED-ADDRESS\`. That tells the client what the rest of the internet sees through its {{nat|NAT}}. **{{turn|TURN}}** ([[rfc:8656|RFC 8656]]) is {{stun|STUN}}'s relay extension: when the path is blocked or both sides are behind symmetric {{nat|NATs}}, peers \`Allocate\` a public \`ip:port\` on a {{turn|TURN}} server and route media through it. **{{ice|ICE}}** ([[rfc:8445|RFC 8445]]) is the algorithm that orchestrates everything — it gathers every candidate address (host, server-reflexive via {{stun|STUN}}, relayed via {{turn|TURN}}), pairs them with the {{peer|peer}}'s, runs {{stun|STUN}} connectivity checks across every pair, and nominates the highest-priority working one.

All three protocols share the same 20-byte {{stun|STUN}} header, transaction IDs, {{tlv|TLV}} attribute encoding, and the magic {{cookie|cookie}} \`0x2112A442\` that lets receivers demultiplex {{stun|STUN}}, [[rtp|RTP]], and [[tls|DTLS]] on a shared {{port|port}}. Every modern real-time application — [[webrtc|WebRTC]] in browsers, [[sip|SIP]] over the public internet, Tailscale's mesh {{vpn|VPN}}, gaming P2P — uses some form of this stack.`,
	howItWorks: [
		{
			title: 'Gather host candidates',
			description:
				'Each {{ice|ICE}} agent enumerates its local interfaces and binds [[udp|UDP]] {{socket|sockets}} on every routable address. These "host candidates" are tried first — they win when both peers are on the same {{lan|LAN}} or a {{vpn|VPN}} that already routed them together.'
		},
		{
			title: 'STUN: learn your public address',
			description:
				"The agent sends a Binding Request to a public {{stun|STUN}} server (e.g. `{{stun|stun}}.l.{{google|google}}.com:19302`). The server replies with the source `ip:port` it observed, encoded in `{{xor-mapped-address|XOR-MAPPED-ADDRESS}}`. That's the agent's **server-reflexive candidate** — what peers will see when packets exit the {{nat|NAT}}."
		},
		{
			title: 'TURN: allocate a relay (fallback)',
			description:
				'If direct paths might fail, the agent also `Allocate`s a port on a {{turn|TURN}} server using long-term credentials. The {{turn|TURN}} server returns `{{xor-relayed-address|XOR-RELAYED-ADDRESS}}` — a public `ip:port` the {{peer|peer}} can hit. The default allocation lifetime is 600 seconds; clients refresh at ~450 s.'
		},
		{
			title: 'Trickle and pair',
			description:
				"Candidates are signalled to the other {{peer|peer}} as they arrive ([[rfc:8838|RFC 8838]] Trickle {{ice|ICE}}) over the application's signalling channel ([[websockets|WebSocket]], [[sip|SIP]], etc.). Each side pairs every local candidate with every remote candidate and assigns a priority — host (126) > {{peer|peer}}-reflexive (110) > server-reflexive (100) > relay (0)."
		},
		{
			title: 'Connectivity checks',
			description:
				'Both agents send {{stun|STUN}} Binding Requests across every pair using short-term {{ice|ICE}} credentials (`ufrag`/`pwd` from the [[sdp|SDP]]). The first pair to round-trip successfully becomes a *valid pair*; the controlling agent then nominates one with `{{use-candidate|USE-CANDIDATE}}`.'
		},
		{
			title: 'Keep the path alive',
			description:
				'Consent freshness ([[rfc:7675|RFC 7675]]) fires a Binding Indication every ~15 seconds on the selected pair — if no response in ~30 s, the agent tears down and triggers an {{ice|ICE}} restart. {{turn|TURN}} allocations refresh every ~450 s to stay below the 600 s timeout.'
		}
	],
	useCases: [
		'[[webrtc|WebRTC]] video calls (Google Meet, Zoom, Teams, Discord, FaceTime)',
		'[[sip|SIP]]-based VoIP and softphones across the public internet',
		'P2P gaming and file transfer when both peers are behind home routers',
		'Mesh VPNs like Tailscale (hole-punching via STUN, DERP as TURN-analogue)',
		'Cloudflare Realtime, Twilio NTS, Microsoft Teams relay backbone'
	],
	codeExample: {
		language: 'javascript',
		code: `// Browser RTCPeerConnection — every WebRTC call is an ICE agent.
const pc = new RTCPeerConnection({
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    {
      urls: ['turn:turn.example.com:3478', 'turns:turn.example.com:5349'],
      username: 'session-user',
      credential: 'session-secret'   // mint short-lived via REST API
    }
  ],
  iceTransportPolicy: 'all',         // 'relay' to force TURN-only for debugging
  iceCandidatePoolSize: 4
});

pc.onicecandidate = e => e.candidate && signal({ candidate: e.candidate });
pc.oniceconnectionstatechange = () =>
  console.log('ICE:', pc.iceConnectionState);

const offer = await pc.createOffer();
await pc.setLocalDescription(offer);
signal({ sdp: offer });`,
		caption:
			'A browser {{ice|ICE}} agent: {{stun|STUN}} + {{turn|TURN}} URLs go in, candidates trickle out. The {{nat|NAT traversal}} is invisible — but every event firing here corresponds to a {{stun|STUN}} message on the wire.',
		alternatives: [
			{
				language: 'python',
				code: `# aiortc — the canonical Python ICE/STUN/TURN stack.
import asyncio
from aiortc import RTCPeerConnection, RTCIceServer, RTCConfiguration

async def main():
    cfg = RTCConfiguration(iceServers=[
        RTCIceServer(urls=['stun:stun.l.google.com:19302']),
        RTCIceServer(
            urls=['turn:turn.example.com:3478',
                  'turns:turn.example.com:5349'],
            username='user', credential='pass'
        ),
    ])
    pc = RTCPeerConnection(configuration=cfg)
    pc.addTransceiver('audio', direction='sendrecv')

    @pc.on('icecandidate')
    def on_ic(c):
        if c: print('candidate:', c.candidate)

    await pc.setLocalDescription(await pc.createOffer())
    print(pc.localDescription.sdp)

asyncio.run(main())`
			},
			{
				language: 'cli',
				code: `# One-liner reflexive-address probe — the "hello world" of NAT traversal.
turnutils_stunclient stun.l.google.com
# => Address (IPv4): 198.51.100.7:55432

# Test a TURN allocate against your own server.
turnutils_uclient -t -u user -w pass turn.example.com

# Capture a STUN flow.
sudo tcpdump -nn -i en0 'udp port 3478'

# Wireshark display filters.
# stun
# stun.type == 0x0001              (Binding Request)
# stun.att.type == 0x0020          (XOR-MAPPED-ADDRESS)
# stun.id == <hex transaction id>

# Browser "internals" page — what Chrome's ICE agent is doing right now.
# chrome://webrtc-internals/`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'STUN Binding Request (client → server)',
						code: `STUN Header (20 bytes):
  Type:           0x0001  (Binding Request)
  Length:         0x0000  (no attributes)
  Magic Cookie:   0x2112A442
  Transaction ID: 0xB7E7A701 0xBC344D... (96 bits, random)

Wire bytes:
  00 01 00 00
  21 12 A4 42
  B7 E7 A7 01 BC 34 4D EE 12 0F 11 22`
					},
					{
						title: 'STUN Binding Success (server → client)',
						code: `STUN Header:
  Type:           0x0101  (Binding Success Response)
  Length:         0x000C  (12 bytes of attributes)
  Magic Cookie:   0x2112A442
  Transaction ID: <echoed>

Attribute XOR-MAPPED-ADDRESS (type 0x0020, length 8):
  Family:    IPv4 (0x01)
  X-Port:    0xD84E  (port XORed with high 16 bits of cookie)
  X-Address: 0x550DA46E  (XORed with the full 32-bit cookie)

  Decoded: 198.51.100.7 : 55432`
					},
					{
						title: 'TURN Allocate Request',
						code: `STUN Header: type=0x0003 (Allocate), txid=<random>
Attributes:
  REQUESTED-TRANSPORT (0x0019): 17 (UDP)
  LIFETIME            (0x000D): 600 seconds
  USERNAME            (0x0006): "1700000000:alice"
  REALM               (0x0014): "turn.example.com"
  NONCE               (0x0015): obMatJos2 + 4B base64 (security features)
  MESSAGE-INTEGRITY-256 (0x001C): HMAC-SHA256(key, msg)

→ Server replies with XOR-RELAYED-ADDRESS, e.g. 203.0.113.5:62000`
					},
					{
						title: 'ICE connectivity check (peer ↔ peer)',
						code: `STUN Header: type=0x0001 (Binding Request)
Attributes:
  USERNAME:            "<remote-ufrag>:<local-ufrag>"
  PRIORITY:            0x6E7F0001       (per RFC 8445 §5.1.2)
  ICE-CONTROLLING:     <64-bit tiebreaker>
  USE-CANDIDATE:       (set on the nominated pair)
  MESSAGE-INTEGRITY:   HMAC-SHA1(short-term key, msg)
  FINGERPRINT:         CRC-32 ⊕ 0x5354554E   ("STUN" in ASCII)`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'1 RTT for a STUN Binding probe; ICE gather typically completes in <500 ms with Trickle ICE; nominated pair is chosen within ~1 RTT after the first valid check',
		throughput:
			'STUN/TURN signalling itself is tiny (hundreds of bytes per probe). TURN relays add one extra hop of latency and re-bill bandwidth; Cloudflare Realtime charges $0.05/GB egress (1 TB free/month, 2025)',
		overhead:
			'20-byte STUN header + TLV attributes; TURN `ChannelData` framing is 4 bytes vs ~36 bytes for full Send/Data Indications; default allocation lifetime 600 s, refresh at 450 s'
	},
	connections: ['udp', 'tcp', 'tls', 'webrtc', 'rtp', 'sip', 'sdp', 'quic', 'dns', 'ipv6'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Interactive_Connectivity_Establishment',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc8445',
		official: 'https://datatracker.ietf.org/wg/ice/about/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/NAT_Concept-en.svg/500px-NAT_Concept-en.svg.png',
		alt: 'NAT concept diagram showing internal private IP addresses behind a router translated to a single public IP address',
		caption:
			'The reason {{nat|NAT traversal}} exists. A {{nat|NAT}} router rewrites the 5-tuple of every outbound flow, mapping many internal addresses onto one public {{ip-address|IP}}. {{stun|STUN}} reveals what the world sees; {{turn|TURN}} relays when nothing direct works; {{ice|ICE}} picks the path.',
		credit: 'Image: Wikimedia Commons / CC BY-SA'
	},

	recentChanges: [
		{
			date: '2024-09',
			title: 'Cloudflare Realtime TURN GA',
			description:
				"{{cloudflare|Cloudflare}} opened its {{anycast|anycast}} {{turn|TURN}} service (`{{turn|turn}}.{{cloudflare|cloudflare}}.com`) at 335+ locations with $0.05/GB egress and 1 TB free per month — the first major price drop in managed [[nat-traversal|NAT traversal]] in years. Free entirely when paired with {{cloudflare|Cloudflare}}'s {{sfu|SFU}}.",
			source: {
				url: 'https://developers.cloudflare.com/realtime/turn/',
				label: 'Cloudflare Realtime TURN docs'
			}
		},
		{
			date: '2024-11',
			title: 'Justin Uberti joins OpenAI to lead Real-Time AI',
			description:
				'After a decade as the architect of [[webrtc|WebRTC]] at {{google|Google}} (Meet, Duo, Stadia), [[pioneer:justin-uberti|Justin Uberti]] joined OpenAI on 25 November 2024 — signalling that the {{ice|ICE}}/{{stun|STUN}}/{{turn|TURN}} stack is now load-bearing for low-{{latency|latency}} voice agents, not just video calls.',
			source: {
				url: 'https://x.com/juberti/status/1861144466168987756',
				label: '@juberti on X'
			}
		},
		{
			date: '2024-12',
			title: 'coturn 4.9.0 closes the IPv4-mapped-IPv6 bypass',
			description:
				'The fix for [[nat-traversal|TURN]] {{loopback|loopback}} escape ({{cve|CVE}}-2020-26262) had checked `127.x.x.x` and `::1` but not `::ffff:127.0.0.1`. 4.9.0 hardens `ioa_addr_is_loopback` and friends.',
			source: {
				url: 'https://github.com/coturn/coturn/releases/tag/4.9.0',
				label: 'coturn 4.9.0 release notes'
			}
		},
		{
			date: '2025-01',
			title: 'iroh ships QUIC Address Discovery — STUN-over-QUIC in production',
			description:
				'Number 0 / iroh moved from a {{stun|STUN}}-only path to [[quic|QUIC]] address discovery, exploiting the fact that [[quic|QUIC]] and {{stun|STUN}} can share a [[udp|UDP]] socket (their top bits differ: [[quic|QUIC]] long-header `1`, {{stun|STUN}} `00`). A signal that draft-seemann-quic-nat-traversal is going to be real.',
			source: {
				url: 'https://www.iroh.computer/blog/qad',
				label: 'iroh: Moving from STUN to QUIC Address Discovery'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Google',
			scale: '`stun.l.google.com:19302` anycast, free, default in libwebrtc',
			description:
				"{{google|Google}}'s {{stun|STUN}} fleet ({{stun|stun}}, stun1..4) is the most-used reflexive-address probe on the internet — baked into every default [[webrtc|WebRTC]] sample. libwebrtc itself was 1.21M LoC by end-2018 (≈3× Space Shuttle flight software)."
		},
		{
			org: 'Cloudflare Realtime',
			scale: '335+ anycast locations; $0.05/GB egress; 1 TB free/month',
			description:
				'{{anycast|Anycast}} {{turn|TURN}} + {{stun|STUN}} bundle launched late 2024, the first credible challenger to Twilio {{nts|NTS}}. Per-allocation guards rate-limit >5 new IPs/s and >50–100 Mbps, defending against {{turn|TURN}}-as-open-proxy abuse.'
		},
		{
			org: 'Tailscale',
			scale: '>90% direct-path success via STUN hole-punching',
			description:
				"Tailscale's WireGuard overlay uses {{stun|STUN}}-style probes to find a direct path between peers; their proprietary **DERP** relays absorb the rest as a {{turn|TURN}}-analogue. Public engineering posts in 2024–25 detailed multi-part improvements to [[udp|UDP]] hole-punching."
		},
		{
			org: 'coturn',
			scale: '~14k GitHub stars; the de-facto open-source TURN binary',
			description:
				'Maintained by Pavel Mihály Mészáros ("misi") after Oleg Moskalenko\'s original `rfc5766-{{turn|turn}}-server`. Runs Jitsi Meet, Nextcloud Talk, Matrix Synapse, and uncountable in-house deployments.'
		}
	],

	funFacts: [
		{
			title: 'The magic cookie spells "STUN"',
			text: "{{stun|STUN}}'s `0x2112A442` is the {{ietf|IETF}}'s nod to the {{ip-address|IP}} version field, but the **FINGERPRINT** attribute {{checksum|checksum}} is XORed with `0x5354554E` — the {{ascii|ASCII}} bytes for `{{stun|STUN}}`. The protocol literally signs its own name on every packet."
		},
		{
			title: 'STUN changed what its own acronym means',
			text: '[[rfc:8489|RFC 3489]] (2003) expanded {{stun|STUN}} as **Simple Traversal of [[udp|UDP]] through NATs** — a tool that classified NATs into four neat types. [[rfc:8489|RFC 5389]] (2008) re-expanded it as **Session Traversal Utilities for {{nat|NAT}}** after [[pioneer:bryan-ford|Bryan Ford]], [[pioneer:saikat-guha|Saikat Guha]], and Paul Francis showed the four-flavours model was a myth: NATs lie, drift, and behave differently per {{peer|peer}}. {{stun|STUN}} became a *toolkit*, not a *solution*.'
		},
		{
			title: '80–90% of WebRTC calls never need TURN',
			text: '[[pioneer:justin-uberti|Justin Uberti]] and Mozilla reported on `discuss-webrtc` in 2019 that 80–90% of calls succeed on host or server-reflexive paths. "{{turn|TURN}} is expensive… and lowers quality." Tailscale\'s mesh hits >90% direct as well — but every cloud-default {{nat|NAT}} ({{aws|AWS}}, {{gcp|GCP}}, {{azure|Azure}}) is symmetric and forces relays.'
		},
		{
			title: 'Jonathan Rosenberg is a top-10 RFC author of all time',
			text: 'Counts vary by year, but [[pioneer:jonathan-rosenberg|Jonathan Rosenberg]] has authored 56–71 RFCs — including [[sip|SIP]] itself ([[rfc:3261|RFC 3261]]), [[sdp|SDP]] offer/answer ({{rfc-doc|RFC}} 3264), and **every** revision of {{stun|STUN}}, {{turn|TURN}}, and {{ice|ICE}}. Currently CTO + Head of {{ai|AI}} at Five9.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'TURN credentials in mobile binaries = open SOCKS proxy',
				text: 'Hard-coding {{turn|TURN}} long-term credentials in a shipped app is a class incident: attackers extract them with `apktool`/`Frida` and use the server as a free SOCKS-style proxy into your private network. Cure: mint **short-lived credentials server-side per session** via the [[rest|REST]] {{api|API}} {{hmac|HMAC}} pattern, or use third-party authorization ([[rfc:7635|RFC 7635]]).'
			},
			{
				title: 'Cloud NATs are symmetric — TURN is mandatory',
				text: '{{aws|AWS}}, default {{azure|Azure}}, and default {{gcp|GCP}} Cloud {{nat|NAT}} all randomise source port per destination — the worst case for hole punching. Two peers behind cloud NATs almost never form a direct [[udp|UDP]] path. Only {{gcp|GCP}}\'s "Endpoint-Independent Mapping" mode opts out. Budget for relayed traffic when either side is in a public cloud.'
			},
			{
				title: 'Forgetting consent freshness causes mystery hangups',
				text: '[[rfc:7675|RFC 7675]] requires the agent to send a Binding Indication every ~15 s; if no response in ~30 s the connection is declared dead. A common bug: {{nat|NAT}} bindings on aggressive home routers time out faster than the {{bgp-keepalive|keepalive}} cadence. Cure: tune the consent interval down, or fall back to relayed mode.'
			}
		]
	}
};
