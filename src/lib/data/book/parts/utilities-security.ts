/**
 * Part VIII — Utilities & Security.
 *
 * The invisible plumbing: DNS, TLS, SSH, NTP, the email stack, and
 * authentication. The protocols you only notice when they break.
 */

import type { BookPart } from '../types';

export const utilitiesSecurity: BookPart = {
	id: 'utilities-security',
	title: 'Utilities & Security',
	label: 'VIII',
	description: 'The invisible plumbing — DNS, TLS, SSH, NTP, the email stack, and authentication.',
	chapters: [
		{
			id: 'dns',
			title: 'DNS',
			synopsis: "The internet's distributed phone book.",
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Hierarchy You Cannot See',
							text: `When you type \`example.com\` into a browser, the operating system needs an IP address. Until 1983 every host on ARPANET maintained a flat HOSTS.TXT file with all the mappings, distributed by FTP. As the network grew past a few hundred hosts, that became absurd — every change required every host to download the whole file.

**[[pioneer:paul-mockapetris|Paul Mockapetris]]** designed [[dns|DNS]] in 1983 (RFCs 882/883, then [[rfc:1035|RFC 1034/1035]] in 1987) to replace it with a **distributed hierarchical lookup**. The root nameservers know who is authoritative for .com. The .com servers know who is authoritative for example.com. The example.com servers know the actual address of www.example.com. A recursive resolver walks this tree and caches the answers.

The architecture has held for forty years across a billion hostnames. The key insight is that **caching does almost all the work**. Most lookups are answered by your ISP's resolver from cache; only fresh queries walk the tree. TTL fields let zone administrators control how long records can be cached.

DNS has been extended several times without breaking. **DNSSEC** adds cryptographic signatures so resolvers can verify answers. **DNS-over-HTTPS (DoH)** and **DNS-over-TLS (DoT)** encrypt queries between client and resolver to prevent ISP surveillance. **EDNS Client Subnet** lets CDNs return geo-appropriate answers. The protocol shape — query, answer, hierarchical zones — is unchanged.`
						},
						{
							type: 'callout',
							title: 'Caching is doing the heavy lifting.',
							text: 'A typical resolver answers 95%+ of queries from cache without contacting any other server. The "distributed hierarchy" is mostly an availability and authority story; the operational hot path is local memory.'
						}
					]
				},
				{ kind: 'protocol', id: 'dns' },
				{ kind: 'pioneer', id: 'paul-mockapetris' },
				{ kind: 'rfc', number: '1035' },
				{ kind: 'simulation', protocolId: 'dns' },
				{ kind: 'outage', id: 'facebook-2021' }
			]
		},
		{
			id: 'tls',
			title: 'TLS',
			synopsis: 'From SSL 1.0 (never released) to post-quantum hybrid.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'TLS is the closest thing the web has to a single point of trust. When TLS gets weaker, every secret on the internet gets weaker.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Thirty Years of Crypto-Engineering, Mostly Hidden',
							text: `**[[pioneer:taher-elgamal|Taher Elgamal]]** at Netscape designed SSL 2.0 in 1995 to encrypt e-commerce on the early web. SSL 1.0 was never released — it had a flaw that let an attacker decrypt the conversation. SSL 2.0 had its own flaws. SSL 3.0 (1996) was good enough to ship and survived for over a decade. In 1999 the IETF took ownership and renamed it [[tls|TLS]] 1.0. Then 1.1 (2006), 1.2 (2008), and 1.3 ([[rfc:8446|RFC 8446]], 2018).

[[tls|TLS]] 1.3 was the first version to break wire compatibility — it cut every weak cipher (RC4, 3DES, MD5, SHA-1, RSA key exchange), reduced the handshake from 2 round-trips to 1 (or 0 for resumption), and adopted authenticated encryption (AEAD) as the only legal cipher mode. Industry deployment was fast: by 2022, over 60% of all TLS connections used 1.3.

The current frontier is **post-quantum cryptography**. A working quantum computer could break the elliptic-curve key exchange ([[tls|X25519]]) that secures essentially all modern TLS. The fix — already shipping — is a **hybrid** approach: combine X25519 with a post-quantum KEM (ML-KEM-768, formerly Kyber-768) so that an attacker has to break both. **[[frontier:pq-tls-x25519mlkem768|X25519MLKEM768]]** is the named hybrid; Apple defaulted it on iOS 26, Chrome 124+, and Cloudflare for all TLS 1.3 connections. By the end of 2026, most TLS handshakes on the internet will be post-quantum-secure.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Digital_certificates_chain_of_trust.png/500px-Digital_certificates_chain_of_trust.png',
							alt: 'X.509 chain of trust: root CA signs intermediate CA, which signs the leaf certificate.',
							caption:
								'X.509 chain of trust. A root CA (pre-installed in your browser) signs an intermediate CA, which signs the leaf certificate the server presents. Each link is a digital signature your browser verifies before trusting the connection.',
							credit: 'Diagram: Wikisosh, CC BY-SA 4.0, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'protocol', id: 'tls' },
				{ kind: 'pioneer', id: 'taher-elgamal' },
				{ kind: 'pioneer', id: 'eric-rescorla' },
				{ kind: 'rfc', number: '8446' },
				{ kind: 'frontier', id: 'pq-tls-x25519mlkem768' },
				{ kind: 'frontier', id: 'ech-rfc-9849' },
				{ kind: 'simulation', protocolId: 'tls' }
			]
		},
		{
			id: 'ssh',
			title: 'SSH',
			synopsis: 'Encrypted shells, port forwards, and SCP.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Replacement for Telnet, Kept Secret for a Decade',
							text: `In 1995, Tatu Ylönen at the Helsinki University of Technology was investigating a password-sniffing attack on the university network. The attack worked because Telnet, RSH, FTP — the standard remote-access protocols — sent everything in cleartext. Ylönen wrote SSH (Secure Shell) as a replacement, with the explicit design goal of being a drop-in for Telnet that nobody could sniff.

The protocol uses **public-key cryptography for host and user authentication**, **Diffie-Hellman for key exchange**, and a **symmetric cipher for the actual session** (originally 3DES, now ChaCha20-Poly1305 or AES-GCM). Once authenticated, the SSH connection multiplexes multiple **channels**: an interactive shell, a port-forwarded TCP connection, an SCP file transfer, an X11 display.

SSH-1 had design flaws. SSH-2 (RFC 4253, 2006) is the version everyone uses. OpenSSH — the dominant implementation — ships with every Linux, BSD, macOS, and Windows release. By 2026, every server on the internet that accepts remote logins runs SSH; Telnet exists only as a museum piece in industrial control systems.

The most recent change is post-quantum: OpenSSH 9.0 (2022) made the post-quantum hybrid \`sntrup761x25519-sha512\` the default key exchange. SSH was the first widely-deployed protocol to ship post-quantum crypto by default — months before TLS managed it.`
						}
					]
				},
				{ kind: 'protocol', id: 'ssh' }
			]
		},
		{
			id: 'ntp',
			title: 'NTP',
			synopsis: "Why your timestamp is correct to within milliseconds.",
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Single Idea, Forty Years of Refinement',
							text: `**[[pioneer:david-mills|David Mills]]** designed [[ntp|NTP]] (Network Time Protocol) in 1985 (RFC 958, then RFC 5905 for v4) to keep the clocks of internet hosts within a few milliseconds of each other. The single core algorithm has not changed. A client samples the round-trip time to a server (call it δ) and the apparent offset (call it θ), then assumes the server's true time was θ ± δ/2. Multiple servers are queried; outliers are clustered out; the surviving median is the new local time.

NTP's hierarchy is called **stratum**. Stratum 0 is a physical clock (atomic clock, GPS receiver). Stratum 1 servers connect directly to a stratum-0 source. Stratum 2 sync from stratum 1, stratum 3 from stratum 2, and so on. The internet has thousands of stratum-1 servers, hundreds of thousands of stratum-2, and millions of stratum-3 (your home router is probably one).

The pool.ntp.org project, run by volunteer admins, serves about 25 billion NTP queries per day from a few thousand donated servers. It is one of the largest free public services on the internet, and one most users have never heard of.

For higher precision (microseconds, sub-microsecond), **PTP** (Precision Time Protocol, IEEE 1588) takes over — used in financial trading, cellular networks, and AI training. NTP gets you to "good enough" for everything else.`
						}
					]
				},
				{ kind: 'protocol', id: 'ntp' },
				{ kind: 'pioneer', id: 'david-mills' }
			]
		},
		{
			id: 'oauth-and-jwt',
			title: 'OAuth 2.1 and JWT',
			synopsis: 'How modern apps delegate access without passing passwords.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Bearer Tokens and Authorization Codes',
							text: `Before [[oauth2|OAuth]] (2010, OAuth 2.0 in 2012, OAuth 2.1 in active draft as of 2026), an app that wanted access to your Google calendar asked you for your Google password. You gave it. The app stored it. When the password was breached, every app that had it was breached. This was **normal** in 2007.

OAuth's insight was to separate **authentication** (proving who you are, done by the identity provider) from **authorisation** (granting an app some scope of access, done by you, in the identity provider's UI, with no password leaving the IdP). The app receives a **bearer token** that lets it act on your behalf within the granted scope, with an expiry, with the option to revoke at any time.

The protocol has four core flows: **Authorization Code** (server-to-server, the secure default), **Implicit** (deprecated, removed in 2.1 because of cross-site issues), **Resource Owner Password** (also deprecated), and **Client Credentials** (machine-to-machine, no user). Modern stacks layer **PKCE** (Proof Key for Code Exchange) on top so even mobile and SPA clients can use the secure flow.

**JWT** (JSON Web Tokens, RFC 7519) is the most common bearer-token format — a base64-encoded JSON payload signed with the IdP's key, so any service can verify it offline. The combination of OAuth 2.1 + JWT + OIDC (OpenID Connect, an authentication layer on top) is the auth backbone of the modern internet. Sign in with Google, with Apple, with GitHub, with Microsoft — all OAuth, all the time.`
						}
					]
				},
				{ kind: 'protocol', id: 'oauth2' },
				{ kind: 'simulation', protocolId: 'oauth2' }
			]
		},
		{
			id: 'email-stack',
			title: 'The Email Stack',
			synopsis: 'SMTP, IMAP, and the trust layer (SPF/DKIM/DMARC) bolted on later.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Protocol Family That Refused to Die',
							text: `Email is the longest-running application of the internet. [[smtp|SMTP]] ([[rfc:5321|RFC 821]], 1982, current RFC 5321) has carried mail for forty-three years with semantically backward-compatible extensions but no replacement. The protocol is text-based, ASCII-clean, designed for an internet where every host trusted every other host.

**[[imap|IMAP]]** (Internet Message Access Protocol, RFC 3501/9051) is how your mail client reads from your mailbox. Where its predecessor POP3 downloaded messages and (usually) deleted them from the server, IMAP keeps mail on the server, lets multiple clients access the same mailbox concurrently, organises into folders, and supports server-side search. Gmail's web UI, Apple Mail on your phone, Outlook on your laptop — all IMAP underneath.

The painful chapter of the email story is **trust**. Because SMTP was designed in 1982 with no notion that senders might lie about who they were, spammers could spoof any From address with no friction. The fix took two decades and three layered protocols: **SPF** (Sender Policy Framework, RFC 7208, 2014) — DNS records declaring which IPs may send for a domain. **DKIM** (DomainKeys Identified Mail, RFC 6376, 2011) — cryptographic signatures over messages, public key in DNS. **DMARC** (RFC 7489, 2015) — a policy on top that tells receivers what to do when SPF or DKIM fails for your domain.

Modern email auth is functional but exhausting. Misconfigure one DNS record and your perfectly legitimate mail goes to spam. The ecosystem is brittle — and yet email remains the most universal addressable protocol on the internet.`
						}
					]
				},
				{ kind: 'protocol', id: 'smtp' },
				{ kind: 'protocol', id: 'imap' }
			]
		}
	]
};
