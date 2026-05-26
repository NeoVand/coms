import type { SubcategoryStory } from './types';

export const secureChannelsVpnStory: SubcategoryStory = {
	subcategoryId: 'secure-channels-vpn',
	tagline:
		"Encrypting traffic at different layers, for different threat models — transport, app, network, and the minimalist successor",
	sections: [
		{
			type: 'narrative',
			title: 'Four Answers, Four Layers',
			text: `In 1990 you could read almost any traffic on the Internet by tapping the wire. Telnet sent passwords in cleartext. SMTP carried mail with the sender\'s name attached. FTP transferred files unauthenticated. The web (when it arrived a year later) was unencrypted. Anyone with a packet sniffer on the right network segment could read everything.\n\nFour responses emerged at four different layers of the stack:\n\n- **[[tls|TLS]]** (originally SSL, 1995) encrypts at the **transport layer**, sitting between TCP and the application. Web browsers connect, do a handshake, then read and write to a normal socket — except the socket is encrypted. Everything that used HTTP, SMTP, IMAP, LDAP eventually got a TLS variant. TLS is the encryption layer of the modern Internet.\n- **[[ssh|SSH]]** (1995) replaces Telnet for **remote shell access**, at the **application layer**. Designed by Tatu Ylönen at the Helsinki University of Technology after his university\'s network was sniffed for passwords. SSH became the universal "log into a server" protocol; it also grew port forwarding, tunneling, and SCP/SFTP for file transfer.\n- **[[ipsec|IPsec]]** (1995–1998) encrypts at the **network layer**, inside IP itself. Designed for site-to-site VPNs and for the never-quite-fulfilled IPv6 mandate. Operates either in transport mode (encrypt the payload, leave the IP header) or tunnel mode (encrypt the whole IP packet inside another). Famously complex; runs almost every enterprise VPN deployed before ~2020.\n- **[[wireguard|WireGuard]]** (2016) is the **minimalist successor** to IPsec. ~4,000 lines of kernel code (versus IPsec\'s ~400,000). Fixed modern cryptography (no negotiation). Connectionless. Designed by Jason Donenfeld in part out of frustration with the IPsec complexity stack. Merged into the Linux kernel in 2020; now ships in macOS, Windows, every major VPN provider.\n\nEach lives at a different layer because each addresses a different problem. You can run TLS *inside* an IPsec tunnel; you can SSH *over* a WireGuard interface; you can run WireGuard *over* TLS to escape a restrictive firewall. The encryption layers compose.`
		},
		{
			type: 'pioneers',
			title: 'The Crypto Architects',
			people: [
				{
					id: 'taher-elgamal',
					name: 'Taher Elgamal',
					years: '1955–',
					title: '\"Father of SSL\"',
					org: 'Netscape / RSA Security / Salesforce',
					contribution:
						"Led the cryptography team at Netscape that designed SSL 2.0 (1995) and SSL 3.0 (1996) — the foundations of what would become [[tls|TLS]]. Elgamal also invented the ElGamal encryption and signature schemes during his PhD at Stanford under Martin Hellman. Without SSL there is no e-commerce; without e-commerce the web economy is unrecognizable. Few protocols have had higher economic impact than Elgamal\\'s 1995 work."
				},
				{
					id: 'tero-kivinen',
					name: 'Tero Kivinen',
					years: '–',
					title: 'IPsec / IKE Implementer',
					org: 'SafeNet / Independent',
					contribution:
						"Maintained the reference implementation of [[ipsec|IPsec]] / IKE used by half the industry (Racoon, isakmpd). Authored or co-authored ~30 IPsec-related RFCs, including significant parts of IKEv2. Kivinen\\'s sustained engineering work is one of the reasons IPsec went from \"unimplementable in practice\" to \"the default enterprise VPN for 25 years.\""
				},
				{
					id: 'jason-donenfeld',
					name: 'Jason Donenfeld',
					years: '–',
					title: 'Creator of WireGuard',
					org: 'Edge Security / Independent',
					contribution:
						"Designed and implemented [[wireguard|WireGuard]] starting 2016. ~4,000 lines of kernel C — fitting comfortably in one person\\'s head — versus IPsec\\'s sprawling codebase. WireGuard is opinionated by design: Curve25519 + ChaCha20-Poly1305 + BLAKE2s, no negotiation, no algorithm agility. Merged into the Linux kernel mainline in March 2020 by Linus Torvalds personally. Linus\\'s comment: \"Can I just once again state my love for it and hope it gets merged soon?\""
				},
				{
					name: 'Tatu Ylönen',
					years: '1968–',
					title: 'Creator of SSH',
					org: 'Helsinki University of Technology / SSH Communications',
					contribution:
						"Designed [[ssh|SSH]] in 1995 after a password-sniffing attack on the Helsinki University of Technology\\'s network. The original SSH-1 protocol was free; SSH-2 (1996) was substantially redesigned and is what runs today via the OpenSSH implementation. Founded SSH Communications Security; the commercial SSH market exists largely because of Ylönen\\'s patent-cleared core."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1995,
					title: 'SSL 2.0 (Netscape)',
					description:
						"Netscape ships SSL 2.0 in Navigator. Cryptographically weak (multiple flaws); replaced within a year by SSL 3.0."
				},
				{
					year: 1995,
					title: 'SSH 1.0 (Ylönen)',
					description:
						'[[ssh|SSH]] replaces Telnet for remote login. Within a year it\'s standard on every Unix.'
				},
				{
					year: 1995,
					title: 'IPsec Drafts Begin',
					description:
						'IETF IPsec working group starts. The protocol takes most of a decade to stabilize.'
				},
				{
					year: 1999,
					title: 'TLS 1.0 (RFC 2246)',
					description:
						'SSL 3.0 is renamed TLS and standardized at the IETF. TLS 1.0 is functionally close to SSL 3.0 but breaks compatibility deliberately.'
				},
				{
					year: 2005,
					title: 'IKEv2 / IPsec Stabilizes',
					description:
						"After a decade of IKEv1 (Internet Key Exchange v1) frustration, IKEv2 ships ([[ipsec|RFC 4306]], later 5996). Most modern IPsec deployments use IKEv2."
				},
				{
					year: 2008,
					title: 'TLS 1.2 (RFC 5246)',
					description:
						'Adds GCM modes, SHA-256, and stronger cipher suites. The dominant TLS version for the next decade.'
				},
				{
					year: 2014,
					title: 'Heartbleed',
					description:
						'A buffer over-read in OpenSSL exposes server memory to anyone who asks. The most impactful TLS bug in history. Sparks a decade of OpenSSL alternatives (BoringSSL, LibreSSL, rustls).'
				},
				{
					year: 2016,
					title: 'WireGuard First Release',
					description:
						"[[pioneer:jason-donenfeld|Donenfeld]] publishes WireGuard 0.1. Initial reception in the cryptography community is enthusiastic — \"finally, a VPN protocol you can read in an afternoon.\""
				},
				{
					year: 2018,
					title: 'TLS 1.3 (RFC 8446)',
					description:
						'Removes legacy crypto (RSA key exchange, CBC modes, RC4, SHA-1). 1-RTT handshake by default; 0-RTT optional for resumption. The biggest TLS overhaul in 20 years.'
				},
				{
					year: 2020,
					title: 'WireGuard Mainlined in Linux 5.6',
					description:
						"Linus Torvalds merges WireGuard into the Linux kernel after years of \"please can we have this.\" Within months it ships in major distros and is the default of new VPN services (Mullvad, Tailscale, NordVPN\'s NordLynx)."
				},
				{
					year: 2021,
					title: 'Tailscale Mainstream Adoption',
					description:
						"Tailscale — a WireGuard-based zero-config mesh VPN with NAT punch-through and coordination server — explodes in adoption. Demonstrates that \"WireGuard plus a control plane\" is the future of \"how do I connect my laptop to my home server.\""
				},
				{
					year: 2024,
					title: 'Post-Quantum TLS Rolls Out',
					description:
						"Chrome, Cloudflare, Apple roll out hybrid post-quantum key exchange (X25519+Kyber/MLKEM) in TLS 1.3 connections by default. The first widely-deployed PQC in production."
				}
			]
		},
		{
			type: 'comparison',
			title: 'Four Encryption Stacks',
			axes: ['Layer', 'Primary use', 'Handshake', 'Key management', 'Wire format'],
			rows: [
				{
					label: '[[tls|TLS]]',
					values: [
						'Transport (between TCP and app)',
						'HTTPS, IMAPS, SMTPS, any TCP service',
						'1-RTT (TLS 1.3); 2-RTT (older)',
						'X.509 certificate hierarchy',
						"Record protocol with handshake / app data / alert layers"
					]
				},
				{
					label: '[[ssh|SSH]]',
					values: [
						'Application (its own transport)',
						'Remote shell, tunneling, file transfer',
						'Custom — diffie-hellman + key auth',
						'Server host keys + user keys (no PKI)',
						"Binary packet protocol over TCP"
					]
				},
				{
					label: '[[ipsec|IPsec]]',
					values: [
						'Network (inside IP)',
						'Site-to-site VPN, IPv6 mandate',
						"IKEv2 — typically 4 messages",
						"Pre-shared keys, X.509, or EAP",
						"ESP (encrypted payload) and AH (auth header)"
					]
				},
				{
					label: '[[wireguard|WireGuard]]',
					values: [
						'Network (UDP-based virtual interface)',
						'Modern VPN — point-to-point and mesh',
						'1-RTT — Noise IK pattern',
						"Public keys exchanged out of band (simple)",
						"UDP datagrams — no TCP fallback, no algorithm negotiation"
					]
				}
			],
			note: "These don\\'t compete the way most protocol families do. Different layers, different use cases. The replacement question is mostly *IPsec → WireGuard* (where the answer is \"yes, almost always for new deployments\")."
		},
		{
			type: 'animated-sequence',
			title: 'TLS 1.3 1-RTT Handshake',
			definition: `sequenceDiagram
    participant C as Client
    participant S as Server
    Note over C,S: TLS 1.3 — one round trip from connect to app data
    C->>S: ClientHello with key_share and supported_versions
    S->>S: select cipher suite, generate handshake keys
    S-->>C: ServerHello with key_share and EncryptedExtensions
    S-->>C: Certificate encrypted under handshake key
    S-->>C: CertificateVerify encrypted under handshake key
    S-->>C: Finished encrypted under handshake key
    Note over C: verify cert, verify CertificateVerify
    C->>S: Finished encrypted under handshake key
    C->>S: application data encrypted under application key
    S-->>C: application data encrypted under application key
    Note over C,S: 0-RTT resumption on next connection skips even this`,
			caption:
				"[[tls|TLS]] 1.3 dropped 3 round trips from TLS 1.2 by sending the server's Certificate, CertificateVerify, and Finished in the *first* response — encrypted under handshake keys derived from the ephemeral exchange. The client can send app data immediately after its Finished. With 0-RTT resumption, app data can ride in the first packet.",
			steps: {
				0: '**The win.** TLS 1.2 needed 2 full round trips (4 messages) before any app data could flow — TCP added 1 more. TLS 1.3 cuts that to 1 RTT for the handshake, and 0 RTT on session resumption. The savings are enormous on high-latency mobile links.',
				1: 'Client opens with **ClientHello**: supported TLS versions, cipher suites it accepts, *and* a `key_share` — a Diffie-Hellman public key. This bold "send key material in the first message" choice is what enables 1-RTT.',
				2: 'Server **picks a cipher suite** from the client\'s offered list and immediately derives handshake encryption keys using its own ephemeral DH private key + the client\'s `key_share`. No back-and-forth negotiation.',
				3: 'Server sends **ServerHello** with its `key_share` (so the client can derive the same handshake keys) plus EncryptedExtensions (additional negotiation, now encrypted).',
				4: 'Server sends **Certificate** — encrypted with the handshake key. Notable: the cert itself is encrypted, defeating passive observers from learning *which* certificate (and thus which hostname) is in play.',
				5: 'Server sends **CertificateVerify** — a signature over the handshake transcript proving the server owns the private key for the cert.',
				6: 'Server sends **Finished** — a MAC over the entire transcript so far, proving both sides agreed on the same handshake.',
				7: '**Client verifies.** It checks the certificate chain against its trust store and validates the CertificateVerify signature. If anything\'s wrong, the connection aborts here.',
				8: 'Client sends its own **Finished** — its MAC over the transcript, proving it saw the same handshake messages.',
				9: 'Client sends **application data** encrypted under freshly-derived application keys. The first useful request rides in the same RTT as the Finished — net: 1 round trip from "connect" to "request sent."',
				10: 'Server responds with **application data** under the same keys. The connection is now established and encrypted; everything from here is just data.',
				11: '**0-RTT next time.** On reconnect within the resumption window, the client can send application data in the *very first packet* using cached keys. Even faster, but only safe for replay-tolerant requests (idempotent GETs typically).'
			}
		},
		{
			type: 'callout',
			title: 'Why WireGuard Beat IPsec',
			text: `[[ipsec|IPsec]] is a marvel of engineering. It supports every cipher, every key-exchange algorithm, every NAT-traversal mode, every X.509 PKI scheme, every EAP authentication method. It can run in transport mode or tunnel mode, with ESP or AH, in tunnel mode with or without traffic-flow confidentiality, with extended-sequence-number replay protection, with NAT-T encapsulation. The IKEv2 negotiation alone has dozens of attribute classes.\n\nThis is the source of its problem. *Algorithm agility* — the ability to negotiate among many crypto choices — is what kept SSL/TLS upgradeable, but it\'s also what made many of its worst bugs possible (POODLE, FREAK, Logjam). IPsec multiplied this by adding negotiation between every layer of the stack.\n\n[[wireguard|WireGuard]] made the opposite bet:\n\n- **Fixed cryptography**: Curve25519 for key exchange, ChaCha20-Poly1305 for symmetric encryption, BLAKE2s for hashing. No negotiation. If a primitive is broken, the protocol version is incremented and clients/servers update together.\n- **No PKI**: every peer has a single Curve25519 public key. You configure peers by their public keys, like SSH \`authorized_keys\`. No certificates, no CAs, no expiration ceremonies.\n- **Stateless on the wire**: each packet stands alone. No "connection." If the server reboots or a NAT mapping changes, the next packet just works.\n- **Connectionless from the kernel\'s view**: WireGuard creates a regular network interface (\`wg0\`). Routes go to it like any other interface. The kernel doesn\'t know it\'s a VPN.\n\nThe codebase: ~4,000 lines of kernel C. Linux\'s IPsec stack: ~400,000 lines. Donenfeld\'s thesis was simple — *crypto code you can audit fits in your head*. The audit was done by Tor Project security researchers and found nothing. The protocol shipped. The result is the first VPN protocol most security engineers genuinely *trust* without caveats.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[tls|TLS]]\'s failure mode is **certificate validation**. The cryptography is solid; the trust model is the weak link. A misissued certificate from a single trusted CA can MITM any site on the Internet. {{ct|Certificate Transparency}} is the public ledger of all issued certs; HPKP (Public Key Pinning) was an attempt at user-controlled pinning that got removed because mistakes broke entire sites. Let\'s Encrypt democratized cert issuance, but the underlying X.509/CA model is still the most fragile part of the stack.\n\n[[ssh|SSH]]\'s failure mode is **trust on first use**. The first time you connect to a host, you accept its public key as-is. If the host\'s key changes (legitimate rotation? attacker MITM?), SSH warns you, but most users just delete the line in \`known_hosts\` and reconnect. SSH certificate authorities (smallstep, Teleport, Vault SSH backend) fix this but require deployment.\n\n[[ipsec|IPsec]]\'s failure mode is **interop**. Two correctly-implemented IPsec stacks may fail to talk to each other because they pick different defaults. The "IKEv2 connection works between Cisco and Palo Alto if you set X, Y, and Z correctly" stories fill the support forums. {{ikev2|IKEv2}} reduced the variance, but the legacy of IKEv1 still haunts deployments.\n\n[[wireguard|WireGuard]]\'s failure mode is **roaming and mobility**. WireGuard\'s connectionless model is elegant — except every peer\'s configuration includes a fixed UDP endpoint. When a phone moves from Wi-Fi to LTE, the endpoint changes; the server has to learn the new one. WireGuard handles this (the server\'s endpoint floats to wherever the latest authenticated packet came from), but the *initial* connection from a roaming client requires the server to have a stable address. Mesh deployments need a coordination plane — Tailscale, Headscale, Netbird, NetMaker exist precisely to add this layer.`
		},
		{
			type: 'narrative',
			title: 'What\'s Next',
			text: `Active work in 2025:\n\n- **Post-quantum TLS** is rolling out. Chrome, Cloudflare, Apple have already deployed hybrid X25519+ML-KEM (Kyber) by default. NIST PQC standards finalized in 2024; the migration phase is now.\n- **Encrypted Client Hello (ECH)** hides the SNI (which hostname the client is asking for) from passive observers. Default-on in Chrome and Firefox in 2024. The last unencrypted metadata in a TLS connection is gone.\n- **WireGuard in everything** — every major commercial VPN now offers WireGuard. Cloudflare WARP, Tailscale, Mullvad, NordVPN, Surfshark. The transition from OpenVPN/IPsec is essentially complete for consumer VPNs.\n- **SSH certificates** are slowly displacing \`authorized_keys\` files in enterprise environments. Short-lived certificates issued by a CA (HashiCorp Vault, smallstep CA, Teleport) provide centralized control and automatic expiry.\n- **MASQUE** (proxy traffic inside QUIC) is the next generation of "VPN" — used by iCloud Private Relay and Cloudflare\'s Privacy Gateway. Not a replacement for site-to-site IPsec, but a replacement for the "encrypted DNS + proxy" pattern that consumer VPNs deliver.\n- **Memory-safe TLS implementations** (rustls, BoringSSL\'s improvements, OpenSSL 3.x rewrites) continue replacing C-based stacks where the language gives crypto code more guarantees against the Heartbleed-class bugs.`
		}
	]
};
