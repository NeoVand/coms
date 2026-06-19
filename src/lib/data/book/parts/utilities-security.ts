/**
 * Part VIII — Utilities & Security.
 *
 * The invisible plumbing: TLS, SSH, NTP, the email stack, and
 * authentication. Multi-section chapters drawn from the per-protocol
 * research files in /research with citation-backed dates.
 */

import type { BookPart } from '../types';

export const utilitiesSecurity: BookPart = {
	id: 'utilities-security',
	title: 'Utilities & Security',
	label: 'IX',
	description:
		'The invisible plumbing — [[tls|TLS]], [[ssh|SSH]], [[ntp|NTP]], the email stack, and authentication.',
	chapters: [
		// ────────────────────────────────────────────────────────────
		{
			id: 'tls',
			title: 'TLS',
			synopsis:
				'[[tls|From SSL 1.0]] (never released) to post-quantum hybrid by default in iOS 26.',
			slots: [
				{
					kind: 'pull-quote',
					text: '"[[tls|TLS]] not {{ssl|SSL}}" was {{microsoft|Microsoft}}\'s price for {{ietf|IETF}} participation — a face-saving rename so it didn\'t look like the {{ietf|IETF}} was rubber-stamping Netscape.',
					attribution: 'Tim Dierks, 2014'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'SSL 1.0 Never Shipped',
							text: `**Netscape's [[pioneer:taher-elgamal|Taher Elgamal]] designed {{ssl|SSL}}** in 1994 to encrypt e-commerce on the early web. **{{ssl|SSL}} 1.0 was never released** — Phil Karlton, Paul Kocher, and others tore it apart in internal review at Netscape (1994). {{ssl|SSL}} 2.0 (1995) shipped instead but had its own flaws; **{{ssl|SSL}} 3.0 (1996)** was rewritten from scratch by Paul Kocher and survived for over a decade.

In 1999 the {{ietf|IETF}} took ownership and renamed it [[tls|TLS]] 1.0 ([[rfc:2246|RFC 2246]], January 1999). **The rename was {{microsoft|Microsoft}}'s price** for {{ietf|IETF}} participation. In Tim Dierks's words: "a face-saving rename so it didn't look like the {{ietf|IETF}} was rubber-stamping Netscape." [[tls|TLS]] 1.0 was, in practice, "really {{ssl|SSL}} 3.1." Then 1.1 (2006), 1.2 (2008), and **1.3 ([[rfc:8446|RFC 8446]], August 2018)**.

[[tls|TLS]] 1.3 was the first version to break wire compatibility — it cut every weak cipher ({{rc4|RC4}}, 3DES, {{md5|MD5}}, {{sha1|SHA-1}}, {{rsa|RSA}} key {{exchange|exchange}}), reduced the {{handshake|handshake}} from 2 round-trips to 1 (or 0 for resumption), and adopted authenticated {{encryption|encryption}} ({{aead|AEAD}}) as the only legal cipher mode.`
						},
						{
							type: 'callout',
							title: 'TLS 1.3 has middlebox-compatibility hacks built in',
							text: 'The "everyone gets it wrong" wire fact: **[[tls|TLS]] 1.3 {{client-hello|ClientHello}}.legacy_version = 0x0303** ([[tls|TLS]] 1.2); the real version goes in the `supported_versions` extension. **legacy_session_id is non-empty** (faking {{session-resumption|session resumption}}). Both sides send a no-op **ChangeCipherSpec record** after their first flight. All of this is because middleboxes broke when they saw real [[tls|TLS]] 1.3 wire format. The protocol is technically clean; the wire encoding is a deliberate camouflage.'
						},
						{
							type: 'narrative',
							title: 'Heartbleed, DigiNotar, GREASE',
							text: `Three [[tls|TLS]] incidents that shaped the modern field.

**Heartbleed ({{cve|CVE}}-2014-0160, April 2014)**: Independent discovery by Neel Mehta of {{google|Google}} Security and the Codenomicon team in Finland. **One missing length check** in OpenSSL's Heartbeat extension let any client read up to **64 KiB of server memory per request** — including private keys, session keys, passwords. **~17% of the trusted web was vulnerable.** Direct cause of the **Core Infrastructure Initiative**, {{google|Google}}'s BoringSSL fork, OpenBSD's LibreSSL fork, and Amazon's s2n-tls.

**DigiNotar (August 2011)**: Iran-linked attacker issued **531 fraudulent certs for 344 domains** including \`*.google.com\`, used in {{man-in-the-middle|MITM}} against ~300,000 Iranian Gmail users. **DigiNotar bankrupt within a month.** Forced **{{certificate-transparency|Certificate Transparency}}** into existence as a structural fix.

**GREASE ([[rfc:8446|RFC 8701]], January 2020)**: David Benjamin ({{google|Google}}) reserved values like \`0x0A0A, 0x1A1A, ..., 0xFAFA\` in the cipher-suite, named-group, signature, {{alpn|ALPN}}, and version registries. **Chrome injects one at random into every {{client-hello|ClientHello}}** so any server or middlebox that crashes on unknown values is detected before that brittleness ossifies. GREASE is the entire reason [[tls|TLS]] 1.3 deployment did not get blocked by another decade of middlebox ossification.

Two more historical incidents to name: **goto fail ({{cve|CVE}}-2014-1266)** — a duplicated \`goto fail;\` line in iOS/{{os|OS}} X 10.9 made Safari silently accept any server's signed key {{exchange|exchange}} — full {{man-in-the-middle|MITM}} on every Safari HTTPS connection for ~17 months. **ROBOT (December 2017)** — 19-year-old Bleichenbacher attack still let researchers sign messages with **facebook.com's {{private-key|private key}}** in 2017, affecting F5, Citrix, {{cisco|Cisco}}, Radware, BouncyCastle, WolfSSL.`
						},
						{
							type: 'narrative',
							title: 'The Post-Quantum Migration Is Mostly Done',
							text: `**>50% of all [[tls|TLS]] 1.3 connections to {{cloudflare|Cloudflare}} carried post-quantum hybrid ({{pq-ciphersuite|X25519MLKEM768}}) by end of 2025**. Within four days of {{apple|Apple}} shipping iOS 26 in September 2025, share of {{pq|PQ}}-secured iPhone requests jumped from **<2% to 11%, and >25% by December 2025**.

**The 2024 Kyber → {{ml-kem|ML-KEM}} rename literally invalidated [[tls|TLS]] code point 0x6399** in favor of **0x11EC ({{ml-kem|ML-KEM}}-768)** after {{nist|NIST}} published {{fips|FIPS}} 203 on 13 August 2024. Every browser, server, and load balancer had to re-deploy because the wire format changed.

**OpenSSL 3.5 LTS (8 April 2025)** made {{pq-ciphersuite|X25519MLKEM768}} + {{x25519|X25519}} the default keyshare; supported until April 2030. **{{ech|Encrypted Client Hello}} published as [[frontier:ech-rfc-9849|RFC 9849]]** in 2025 after 25 drafts; {{cloudflare|Cloudflare}} deploys {{ech|ECH}} for ~70% of websites it fronts.

**Frontier — 47-day cert lifetimes**: {{certificate-authority|CA}}/Browser Forum **Ballot SC-081v3 (11 April 2025, {{apple|Apple}}-sponsored, 29-yes-0-no)** phases certs to **200 days on 15 March 2026, 100 days on 15 March 2027, 47 days on 15 March 2029**, with DCV reuse falling to **10 days** in the same window. **Manual renewal is no longer an option.** Every {{certificate|certificate}} operation must be automated by 2029.

**Let's Encrypt DST Root {{certificate-authority|CA}} X3 expiry (30 September 2021)** broke older {{android|Android}}, OpenSSL <1.1.0, Sophos UTM, Stripe webhook clients, Roku, Heroku Redis. Root expiration is a **calendar-driven incident** that should have been forecast — and now serves as the canonical case for why root rollovers must be scheduled like rocket launches.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/95/Digital_certificates_chain_of_trust.png/500px-Digital_certificates_chain_of_trust.png',
							alt: 'Digital certificate chain of trust diagram — root CA, intermediate CA, end-entity certificate.',
							caption:
								"A **[[tls|TLS]] {{certificate-chain|certificate chain}} of trust**: a root {{certificate-authority|CA}} signs an intermediate CA, which signs the end-entity {{certificate|certificate}} your browser actually sees. Every HTTPS connection ends at a chain like this; DigiNotar's August 2011 compromise (531 fraudulent certs for 344 domains) is what forced **{{certificate-transparency|Certificate Transparency}}** into existence as a structural fix. The current frontier is 47-day cert lifetimes, mandatory by 15 March 2029.",
							credit: 'Image: Wikimedia Commons / CC BY-SA'
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

		// ────────────────────────────────────────────────────────────
		{
			id: 'ssh',
			title: 'SSH',
			synopsis:
				'[[ssh|Encrypted shells]], port forwards, and {{scp-copy|SCP}} — written by Tatu Ylönen in Helsinki, July 1995.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'OpenSSH 9.0 (April 2022) switched the `scp` command to use {{sftp|SFTP}} under the hood by default. After 27 years, the {{scp-copy|SCP}} wire protocol is finally being replaced by the protocol that was supposed to replace it from the beginning.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Replacement for Telnet, Born in Helsinki',
							text: `**Tatu Ylönen** at Helsinki University of Technology wrote **[[ssh|SSH]] in July 1995** after a password-sniffing attack on the university network. Released as freeware; **~20,000 users in 50 countries by year-end**. The attack worked because Telnet, RSH, [[ftp|FTP]] — the standard remote-access protocols of the time — sent everything in cleartext. [[ssh|SSH]] was designed to be a drop-in replacement that nobody could sniff.

**Port 22 origin story**: Ylönen chose 22 because it sat between **telnet/23 and ftp/21**. On **10 July 1995** he emailed {{iana|IANA}}'s Joyce K. Reynolds; she replied next day assigning port 22 with him as point of contact. The reasoning was aesthetic — telnet, [[ftp|FTP]], and [[ssh|SSH]] form a contiguous range — and it has not been seriously questioned in 30 years.

The protocol uses **public-key cryptography** for host and user authentication, **Diffie-Hellman** for key {{exchange|exchange}}, and a **symmetric cipher** for the actual session (originally 3DES, now {{chacha20-poly1305|ChaCha20-Poly1305}} or {{aes-gcm|AES-GCM}}). Once authenticated, the [[ssh|SSH]] connection multiplexes multiple **channels**: an interactive shell, a port-forwarded [[tcp|TCP]] connection, an {{scp-copy|SCP}} file transfer, an X11 display.

**OpenSSH was forked 26 September 1999** by the OpenBSD team (Theo de Raadt, Markus Friedl, Niels Provos, Bob Beck, Aaron Campbell, Dug Song; for portability Damien Miller and Darren Tucker) from Björn Grönvall's OSSH (re-derivation of Ylönen's last freely-licensed \`ssh-1.2.12\`).`
						},
						{
							type: 'callout',
							title: 'SFTP is not "FTP over SSH"',
							text: 'The "everyone gets it wrong" {{scp-copy|SCP}} fact: **{{sftp|SFTP}} is not "[[ftp|FTP]] over [[ssh|SSH]]"** — it\'s a wholly distinct file-transfer protocol that runs as a *subsystem* request inside an [[ssh|SSH]] session channel. Spec is `draft-{{ietf|ietf}}-secsh-filexfer-13` from 2006, never published as an {{rfc-doc|RFC}}. **OpenSSH 9.0 (April 2022) switched the `scp` command to use {{sftp|SFTP}} under the hood by default.** {{rhel|RHEL}} 9 deprecated the {{scp-copy|SCP}} wire protocol entirely. After 27 years, the protocol that was supposed to replace SCP is finally replacing it.'
						},
						{
							type: 'narrative',
							title: 'The 2024 Year of CVEs',
							text: `Two [[ssh|SSH]] events from 2024 deserve their own paragraph each.

**{{cve|CVE}}-2024-3094 — XZ Utils backdoor (29 March 2024)**: Andres Freund ({{microsoft|Microsoft}}/PostgreSQL) found a multi-stage backdoor in \`liblzma\` 5.6.0/5.6.1 introduced by maintainer **"Jia Tan"** while investigating a **500ms regression in [[ssh|SSH]] {{login-auth|login}} {{latency|latency}} on Debian sid**. Jia Tan spent over **two years (Nov 2021 → Feb 2024)** gaining maintainer status through apparent sock-puppetry. The hook examined the {{rsa|RSA}} modulus N of the {{public-key|public key}} supplied during pubkey auth and, if it contained a {{payload|payload}} signed by attacker's Ed448 key, **executed arbitrary commands via system() *before* authentication completed**. CVSS 10.0. **No stable distro shipped it** — caught in development. The closest call open-source supply chain has had.

**{{cve|CVE}}-2024-6387 "regreSSHion" (1 July 2024)**: Qualys disclosed pre-auth, unauthenticated **RCE as root** in \`sshd\` on glibc-based {{linux|Linux}}. Signal-handler race: \`SIGALRM\` handler calls \`syslog()\` (not async-signal-safe). **Lineage**: regression of {{cve|CVE}}-2006-5051 (Mark Dowd's original 2006 report) — the original 2006 fix was wrapped in \`#ifdef DO_LOG_SAFE_IN_SIGHAND\`; in October 2020 OpenSSH 8.5p1's logging refactor accidentally dropped the directive. Qualys identified **~14 million internet-exposed OpenSSH instances potentially in scope**.

**{{cve|CVE}}-2023-48795 — Terrapin (18 December 2023)**: Bäumer/Brinkmann/Schwenk at Ruhr University Bochum ({{usenix-conf|USENIX}} Security 2024 best paper). {{man-in-the-middle|MITM}} can delete chosen number of encrypted packets from the start of an [[ssh|SSH]] channel without detection because per-direction sequence numbers begin counting before the first encrypted message. Mitigation: **"Strict KEX" extension implemented in OpenSSH 9.6 (December 2023)**.`
						},
						{
							type: 'narrative',
							title: 'Post-Quantum SSH Shipped Before TLS',
							text: `**OpenSSH 10.0 (9 April 2025)**: **Removed DSA entirely**; made **\`mlkem768x25519-sha256\`** the default key {{exchange|exchange}}; split user-auth into \`sshd-auth\`; disabled finite-field DH on the server side by default. **OpenSSH 10.1 (October 2025)** warns when a non-{{pq|PQ}} KEX is selected; OpenSSH 10.2 (10 October 2025), 10.3 (2 April 2026) followed.

[[ssh|SSH]] was the **first widely-deployed protocol to ship post-quantum crypto by default** — six months before [[tls|TLS]] {{pq-ciphersuite|X25519MLKEM768}} reached default-on in iOS 26. The deployment story is the same: {{nist|NIST}} {{fips|FIPS}} 203 in August 2024 let the OpenSSH team standardise the codepoint, and OpenBSD ships the upstream that downstream {{linux|Linux}} distros consume.

**The {{ietf|IETF}} Secure Shell Maintenance (sshm) WG was chartered August 2024** with chairs Job Snijders (Fastly) and Stephen Farrell (Trinity College Dublin) — first WG dedicated to [[ssh|SSH]] in over a decade. Active drafts include \`draft-ietf-sshm-mlkem-hybrid-kex\` (Kampanakis/Stebila/Hansen) for \`mlkem768x25519-sha256\` and an experimental \`draft-michel-ssh3\` (UCLouvain) re-implementing an [[ssh|SSH]]-equivalent on [[http3|HTTP/3]]+[[quic|QUIC]], claiming 3-{{rtt|RTT}} session establishment vs [[ssh|SSH]]'s 5-7 (research prototype only).

**GitHub host-key exposure (24 March 2023)**: GitHub's {{rsa|RSA}} [[ssh|SSH]] host {{private-key|private key}} was briefly inadvertently published in a public GitHub repo; users worldwide had to \`ssh-keygen -R github.com\` and re-trust. The remediation cost was the user-visible part; the deeper lesson was about secret-handling in shared development infrastructure.

**Heninger et al. "Mining Your Ps and Qs" ({{usenix-conf|USENIX}} Security 2012)** found **0.03% of {{rsa|RSA}} [[ssh|SSH]] host keys and 1.03% of DSA keys exposed** because of weak entropy at first boot; computed thousands of private keys via batch-GCD. The reason DSA is finally being removed in OpenSSH 10.0 is that DSA's per-signature random number is too easy to get wrong.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Ssh_binary_packet_alt.svg/500px-Ssh_binary_packet_alt.svg.png',
							alt: 'SSH binary packet format showing length, padding, payload, and MAC fields.',
							caption:
								'The **[[ssh|SSH]] binary packet**: 4-byte length, 1-byte padding length, the {{payload|payload}}, random padding, and an integrity {{mac-address|MAC}} at the end — all encrypted under the negotiated symmetric cipher. Tatu Ylönen wrote this protocol in **July 1995** after a password sniffer at Helsinki University of Technology; thirty years and one OpenBSD-led fork later, OpenSSH 10.0 (April 2025) ships **post-quantum {{ml-kem|ML-KEM}}-768 + {{x25519|X25519}}** as the default key {{exchange|exchange}} — the first widely-deployed protocol to ship {{pq|PQ}} crypto by default.',
							credit: 'Image: Wikimedia Commons / CC BY-SA'
						}
					]
				},
				{ kind: 'protocol', id: 'ssh' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'ntp',
			title: 'NTP',
			synopsis:
				'[[ntp|Why your timestamp is correct]] to within milliseconds — and the era rollover on 7 February 2036.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[pioneer:david-mills|David L. Mills]] — "Father Time" of the Internet — was visually impaired from birth and completely blind by 2022. He continued [[ntp|NTP]] work using large displays and screen readers until his death on 17 January 2024.',
					attribution: 'Vint Cerf, Internet History list obituary'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'David Mills, Father Time of the Internet',
							text: `**[[pioneer:david-mills|David L. Mills]] (1938-2024)** designed [[ntp|NTP]] at the University of Delaware with {{darpa|DARPA}} funding. **Died 17 January 2024 in Newark, Delaware, age 85.** [[pioneer:vint-cerf|Vint Cerf]] wrote the obituary on the Internet History mailing list. Poul-Henning Kamp called Mills *"the grandfather of the Internet."*

**Mills was visually impaired from birth** (glaucoma); childhood surgery preserved partial vision in one eye. His vision deteriorated from 2012; **completely blind by 2022**, but continued [[ntp|NTP]] work using large displays and screen readers.

The [[ntp|NTP]] family tree: **{{rfc-doc|RFC}} 778 (1981)** DCNET Internet Clock Service; **[[rfc:958|RFC 958]] (1985)** first [[ntp|NTP]]; **{{rfc-doc|RFC}} 1305 (1992)** NTPv3 with {{marzullos-algorithm|Marzullo's algorithm}}; **[[rfc:5905|RFC 5905]] (June 2010) NTPv4** is the current canonical spec.

A client samples the {{rtt|round-trip time}} to a server (call it δ) and the apparent {{offset|offset}} (call it θ), then assumes the server's true time was **θ ± δ/2**. Multiple servers are queried; outliers are clustered out; the surviving median is the new local time. **{{marzullos-algorithm|Marzullo's algorithm}}** (1984) is the consensus computation; it has not changed in 40 years.`
						},
						{
							type: 'callout',
							title: 'Era rollover: 7 February 2036 at 06:28:16 UTC',
							text: "[[ntp|NTP]]'s 64-bit timestamp uses the **[[ntp|NTP]] prime epoch, 1900-01-01 00:00:00 {{utc-time|UTC}}** — older than {{arpanet|ARPANET}}, older than UNIX, older than every other timestamp standard in computing. Span = 2³² s = **136.19 years per era**. **Era rollover is 7 February 2036 at 06:28:16 {{utc-time|UTC}}.** The protocol handles eras correctly via 64-bit math; many client implementations assume 32-bit and will need fixes before 2036. The Y2036 work has been quietly underway since 2020."
						},
						{
							type: 'narrative',
							title: 'The 2012 Leap-Second Bug, And the End of Leap Seconds',
							text: `**2012 leap-second {{linux|Linux}} kernel bug (30 June → 1 July 2012)**: The kernel's leap-second handler updated \`xtime\` without calling \`clock_was_set()\` to notify hrtimer; tasks waiting on futexes with absolute deadlines pegged CPUs at 100%. Affected **Reddit, {{linkedin|LinkedIn}}, Mozilla, Yelp, Foursquare, Amadeus airline reservation** (causing flight delays at Qantas and others). Workaround: \`date -s "$(date)"\` reset the clock and unblocked the futex queue.

**2014 [[ntp|NTP]] DDoS amplification disaster**: \`monlist\` mode-7 query in pre-4.2.7 ntpd — 234-byte request returned up to 600 [[ip|IP]]-address entries = up to 48 KB. **Amplification factor ~206×.** **10 February 2014: ~400 Gbps attack on a {{cloudflare|Cloudflare}} customer** — at the time, the largest DDoS ever recorded. Black Lotus reported 69% of all DDoS traffic in early January 2014 was [[ntp|NTP]] reflection.

**The end of leap seconds**: **CGPM Resolution 4 of the 27th General Conference (18 November 2022)** decided "the maximum value for the difference (UT1 − {{utc-time|UTC}}) will be increased in, or before, **2035**" — leap seconds will be abandoned. {{wrc|WRC}}-23 (Dubai, December 2023) formally recognised the resolution. **Russia opposed** (GLONASS uses leap seconds in its protocol). Most distributed systems engineers consider this a major win — leap-second smearing has caused more outages over 50 years than the time accuracy was worth.`
						},
						{
							type: 'narrative',
							title: 'The 2024 Modernisation — Rust, SPTP, NTPv5',
							text: `**{{meta|Meta}} open-sourced SPTP (Simple PTP) in February 2024** — same accuracy as PTPv2 {{unicast|unicast}} but **~40% {{cpu|CPU}}, ~70% memory, ~50% network savings**. Powers {{meta|Meta}}'s datacenter time fabric serving **100,000+ clients**.

**{{aws|AWS}} Nitro PTP Hardware Clock** (since November 2023, expanded since): **Microsecond-level accuracy** vs ~1 ms via [[ntp|NTP]]. PHC does NOT smear leap seconds — it follows {{utc-time|UTC}} standards.

**ntpd-rs** (Tweede golf / Trifecta Tech Foundation, Pendulum project) — **memory-safe Rust [[ntp|NTP]] daemon**; reached 1.0.0 (October 2023); deployed at **Let's Encrypt**; packaged in Debian/Ubuntu/Fedora. The Rust rewrite of [[ntp|NTP]] is one of several "memory-safe daemon" efforts following Heartbleed and similar.

**{{rfc-doc|RFC}} 9523 — Khronos (February 2024)**: secure outlier-rejection watchdog (Rozen-Schiff, Dolev, Mizrahi, Schapira) — provably resists up to **~1/3 compromised servers**.

**Frontier — NTPv5**: \`draft-ietf-ntp-ntpv5-08\` (March 2026, Lichvar/Mizrahi). **Removes modes 1, 2, 5, 6, 7** — only client/server remain. Adds explicit 16-bit era number, **extending unambiguous range to ~35,000 years**. The first ground-up [[ntp|NTP]] redesign since 1992.

**Galileo PTF outage (11-18 July 2019)**: Six-day complete service loss — Precise Timing Facility upgrade gone wrong with redundant standby in Oberpfaffenhofen unavailable. Cautionary tale for stratum-0 GNSS users — need holdover oscillators (rubidium, OCXO).

**Regulatory drivers**: **MiFID II RTS 25 (January 2018)** mandates clock divergence from {{utc-time|UTC}} of **≤100 µs for HFT and ≤1 ms for non-HFT**. [[ntp|NTP]] is now a regulated function in financial services — operating an [[ntp|NTP]] server with insufficient accuracy is a compliance violation.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nist-f1.jpg/500px-Nist-f1.jpg',
							alt: 'NIST-F1 caesium fountain atomic clock — the US primary frequency standard.',
							caption:
								"**{{nist|NIST}}-F1**, the caesium fountain atomic clock that has served as the US primary frequency standard since 1999. Accurate to about one second in 100 million years. [[pioneer:david-mills|David Mills]]'s **[[ntp|NTP]]** (1985 — Mills died 17 January 2024) is the protocol that flows this kind of accuracy out to every laptop, phone, and server on the internet, with Marzullo's 1984 consensus algorithm picking a sane median from a flock of stratum-1 sources.",
							credit: 'Photo: NIST / public domain, via Wikimedia Commons'
						}
					]
				},
				{ kind: 'protocol', id: 'ntp' },
				{ kind: 'pioneer', id: 'david-mills' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'oauth-and-jwt',
			title: 'OAuth 2.1 and JWT',
			synopsis:
				'[[oauth2|How modern apps delegate access]] — and the most famous resignation in protocol history.',
			slots: [
				{
					kind: 'pull-quote',
					text: '[[oauth2|OAuth]] 2.0 and the Road to Hell. {{ws-star|WS-*}} bad. The two slogans Eran Hammer used in his July 2012 resignation are still the most-cited critique of any {{ietf|IETF}} standard.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Born at CitizenSpace, Late 2006',
							text: `Late 2006: **Blaine Cook** (Twitter chief architect), **Chris Messina, David Recordon, Larry Halff** (Ma.gnolia) met at a CitizenSpace OpenID gathering and concluded no open {{api|API}}-delegation standard existed. Eran Hammer (Yahoo) took over as community chair; **[[oauth2|OAuth]] Core 1.0** released October 2007. **[[oauth2|OAuth 2.0]]** as [[rfc:6749|RFC 6749]] in October 2012.

Before [[oauth2|OAuth]], an app that wanted access to your {{google|Google}} calendar asked you for your {{google|Google}} password. You gave it. The app stored it. When the password was breached, every app that had it was breached. This was *normal* in 2007.

[[oauth2|OAuth]]'s insight was to separate **authentication** (proving who you are, done by the identity provider) from **authorisation** (granting an app some scope of access, done by you, in the identity provider's {{ui|UI}}, with no password leaving the IdP). The app receives a **{{bearer-token|bearer token}}** that lets it act on your behalf within the granted scope, with an expiry, with the option to revoke at any time.`
						},
						{
							type: 'callout',
							title: 'The Road to Hell resignation',
							text: '**The "Road to Hell" resignation (26 July 2012)**: Eran Hammer published *"[[oauth2|OAuth]] 2.0 and the Road to Hell"* — most famous resignation in modern protocol history. His core line: *"WS-* bad"* — shorthand among {{ietf|IETF}} veterans for any standard sunk by enterprise committee design. The "everyone gets it wrong" framework fact: **[[oauth2|OAuth]] 2.0 is technically a framework, not a protocol.** [[rfc:6749|RFC 6749]]\'s abstract itself warns *"this specification is likely to produce a wide range of non-interoperable implementations"* — language Hammer fought to insert.'
						},
						{
							type: 'narrative',
							title: 'The Famous Incidents',
							text: `**{{google|Google}} "[[oauth2|OAuth]] worm" (May 2017)**: Fake "{{google|Google}} Docs" app harvested mailbox + contacts; **~1 million users affected** before {{google|Google}} killed it within ~1 hour. No exploit, just a malicious app named literally *"{{google|Google}} Docs"*. {{google|Google}} added client-name validation afterwards.

**Storm-0558 (May-July 2023)**: ~25 organisations including US State Dept and Commerce had Outlook Web Access mailboxes read for ~one month after the China-aligned actor forged authentication tokens. {{microsoft|Microsoft}} consumer (MSA) signing key from 2016 leaked into a crash dump in April 2021, was moved to a debug environment; an engineer's account was later compromised; a separate flaw caused {{microsoft|Microsoft}} 365 to accept consumer-key-signed tokens for enterprise OWA. The CSRB's April 2024 report called the breach **"preventable"** and {{microsoft|Microsoft}}'s security culture **"inadequate."**

**Sign-in-with-{{apple|Apple}} {{jwt|JWT}} forgery (May 2020, Bhavuk Jain)**: {{apple|Apple}} would issue valid JWTs for arbitrary email IDs, signed by {{apple|Apple}}'s key. **Bounty: $100,000.** A single missing check.

**Booking.com "Pass-The-Token" (2023, {{salt|Salt}} Labs)**: [[oauth2|OAuth]] misconfiguration could have enabled account takeover for any user using "Continue with Facebook" — \`redirect_uri\` path manipulation. Also affected Vidio (~100M MAU), Bukalapak, Grammarly, Expo ({{cve|CVE}}-2023-28131), Codecademy.

**Facebook "View As" (September 2018)**: ~50 million access tokens stolen via "View As" feature; ~90 million tokens reset.`
						},
						{
							type: 'narrative',
							title: 'OAuth 2.1 Cleanup, And the New Standards Wave',
							text: `**2024-2025 landmark RFCs**:

**{{rfc-doc|RFC}} 9635 (October 2024) — GNAP** core protocol (Justin Richer/Imbault), sometimes called "[[oauth2|OAuth]] 3" — a ground-up redesign that addresses Hammer's critique by being a single specification rather than a framework.

**{{rfc-doc|RFC}} 9700 (January 2025) — [[oauth2|OAuth 2.0]] Security BCP** formally **deprecates the Implicit grant and Resource Owner Password Credentials grant**, mandates Authorization Code + {{pkce|PKCE}} for public clients, requires exact redirect-{{uri|URI}} matching.

**[[oauth2|OAuth]] 2.1 status (May 2026)**: \`draft-ietf-oauth-v2-1-15\` (Hardt, Parecki, Lodderstedt; 2 March 2026). **Mandates {{pkce|PKCE}} for ALL clients; exact redirect-{{uri|URI}} matching; removes Implicit and ROPC.** Spring Authorization Server, {{cloudflare|Cloudflare}} Workers, and major IdPs already enforce its rules.

**DPoP (RFC 9449, September 2023)** re-introduces **sender-constraining 11+ years after Hammer's lasting bearer-token complaint** — vindicating his original objection that bearer tokens are too easy to steal and replay.

**FAPI 2.0 approved as Final 22 February 2025** (OpenID Foundation) — mandates either DPoP or {{mtls|mTLS}}; **regulator-mandated in Colombia (Circular 004 2024) and Australian CDR**; formally analyzed by University of Stuttgart.

**2025 deployment scale**: {{microsoft|Microsoft}} Entra {{id-identifier|ID}} authenticates **>1.2 billion sign-ins per day**; April 2024 spike of **11,000 Entra-blocked attacks per second**. {{aws|AWS}} Cognito processes **100 billion+ authentications per month**.

**Frontier**: SD-{{jwt|JWT}}-VC (\`draft-ietf-oauth-sd-jwt-vc-16\`, April 2026) for selective-disclosure verifiable credentials underpinning the **EU Digital Identity Wallet**.

**Vittorio Bertocci** — Principal Architect at Okta, host of *Identity, Unlocked* podcast, co-author of RFC 9470 — passed away from pancreatic cancer 7 October 2023; the podcast has not produced new episodes since. The [[oauth2|OAuth]] community lost its most prolific public educator at a critical moment.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Oauth_logo.svg/500px-Oauth_logo.svg.png',
							alt: 'The OAuth logo — a stylised "O" rendered as a key.',
							caption:
								'The **[[oauth2|OAuth]]** logo. The framework was sketched at CitizenSpace in late 2006, [[oauth2|OAuth 2.0]] published as [[rfc:6749|RFC 6749]] in October 2012, [[oauth2|OAuth 2.1]] cleanups currently in draft. Eran Hammer\'s 2012 resignation essay *"[[oauth2|OAuth]] 2.0 and the Road to Hell"* is still the field\'s most-cited critique of any {{ietf|IETF}} standard — and yet [[oauth2|OAuth]] now powers >1.2 billion daily sign-ins through {{microsoft|Microsoft}} Entra {{id-identifier|ID}} alone.',
							credit: 'Image: Chris Messina / Wikimedia Commons, public domain'
						}
					]
				},
				{ kind: 'protocol', id: 'oauth2' },
				{ kind: 'simulation', protocolId: 'oauth2' }
			]
		},

		// ────────────────────────────────────────────────────────────
		{
			id: 'email-stack',
			title: 'The Email Stack',
			synopsis:
				'[[smtp|SMTP]] + [[imap|IMAP]], the protocol family that refused to die — and the new bulk-sender enforcement.',
			slots: [
				{
					kind: 'pull-quote',
					text: 'The era of "give me a 16-character password and [[imap|IMAP]] works forever" is over. {{microsoft|Microsoft}} 365 [[smtp|SMTP]] {{smtp-auth|AUTH}} basic auth retires in two phases starting March 2026 with full rejection by April 2026. {{google|Google}} "Less Secure Apps" was removed for personal accounts May 2022; Workspace deadline September 2024.',
					attribution: 'Author'
				},
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Ray Tomlinson Picked the @',
							text: `Email is the longest-running application of the internet. **\`@\` was chosen by Ray Tomlinson at {{bbn|BBN}} in 1971**, modifying SNDMSG for {{arpanet|ARPANET}} — the symbol that is now everywhere from email to social media handles to {{aws|AWS}} resources started with one engineer picking a separator that wasn't in any name.

**[[smtp|SMTP]]** was born from {{rfc-doc|RFC}} 788 (November 1981) and **[[rfc:5321|RFC 821]] (August 1982)** by [[pioneer:jon-postel|Jon Postel]], assigning **port 25** ("contact socket 25 (31 octal)"). Dave Crocker's [[rfc:822|RFC 822]] same month defined the message header format we still use.

**Sendmail (1981-83)**: Eric Allman at UC Berkeley wrote *delivermail*, then rewrote as **sendmail** which shipped with 4.1cBSD in 1983 — the first {{bsd|BSD}} with [[tcp|TCP]]/[[ip|IP]]. **Once 80% of public mail servers (1996); now under 4%.** Postfix (Wietse Venema, 1998) and Exim (Philip Hazel, 1995) ate sendmail's share over the next two decades.

**[[smtp|SMTP]] vs X.400 protocol war**: ITU-T's X.400 (Red Book 1984, Blue Book 1988) was the official "future" of email — strongly typed, {{asn|ASN}}.1-encoded, with built-in {{encryption|encryption}}. [[smtp|SMTP]] won by being deployable on already-installed Unix machines and by routing around X.400's PTT-billed gateway model. **X.400 survives only in aviation AMHS and military MMHS.**`
						},
						{
							type: 'callout',
							title: 'Port 25 vs 587 vs 465',
							text: '**The "everyone gets it wrong" port fact**: Port **25** is {{mta|MTA}}-to-{{mta|MTA}} relay; **587** is Submission with {{starttls|STARTTLS}} ([[rfc:6409|RFC 6409]]); **465** is **Submissions** with implicit [[tls|TLS]] (formally restored to that role by [[rfc:8314|RFC 8314]], January 2018). **465 is preferred for new client integrations because {{starttls|STARTTLS}} is strippable** by an active attacker who can downgrade the connection. The "submission" vs "relay" distinction is what enterprise mail admins burn most of their time on.'
						},
						{
							type: 'narrative',
							title: 'IMAP and the Crispin Mythology',
							text: `**[[imap|IMAP]] origin**: **Mark Reed Crispin** (b. 19 July 1956; d. 28 December 2012) wrote the original "Interim Mail Access Protocol" at Stanford KSL in 1985-86; first server was a Xerox Lisp Machine client and TOPS-20 server. [[rfc:1064|RFC 1064]] (July 1988) was the first publicly-distributed IMAP2.

**IMAP3 ({{rfc-doc|RFC}} 1203, February 1991, J. Rice) was a counter-proposal that never won the marketplace** — IESG reclassified it as **Historic in 1993**; the [[imap|IMAP]] WG used {{rfc-doc|RFC}} 1176 (IMAP2) as the basis for IMAP4, which is why we have **IMAP4rev1 and IMAP4rev2 but no successful IMAP3**.

**Crispin's two April Fools' RFCs**: **RFC 1437 (1993)** on {{mime|MIME}} body parts; **RFC 4042 (2005)** describing UTF-9 and UTF-18 — Unicode encodings optimised for the **PDP-10's 36-bit words**. Crispin reportedly still ran TOPS-20 systems in his home in 2009.

His "Ten Commandments of How to Write an [[imap|IMAP]] client" still circulates; *"Thou shalt not {{imap-fetch|fetch}} the entire mailbox at once"* might as well be Commandment 1.

**2025 deployment statistic**: **Dovecot ≈ 76.9% of all observable [[imap|IMAP]] servers globally** (Open Email Survey 2020, ~2.9 million instances). When you {{mqtt-connect|connect}} to an [[imap|IMAP]] server today, three out of four times you are talking to Dovecot.`
						},
						{
							type: 'narrative',
							title: 'The Trust Layer and the 2024-2026 Enforcement Cliff',
							text: `Because [[smtp|SMTP]] was designed in 1982 with no notion that senders might lie about who they were, spammers could spoof any From address with no friction. The fix took two decades and three layered protocols: **{{spf|SPF}}** (Sender Policy Framework, {{rfc-doc|RFC}} 7208, 2014) — [[dns|DNS]] records declaring which IPs may send for a domain. **{{dkim|DKIM}}** (DomainKeys Identified Mail, {{rfc-doc|RFC}} 6376, 2011) — cryptographic signatures over messages, {{public-key|public key}} in [[dns|DNS]]. **{{dmarc|DMARC}}** (RFC 7489, 2015) — a policy on top that tells receivers what to do when {{spf|SPF}} or {{dkim|DKIM}} fails for your domain.

**The enforcement cliff started 1 February 2024**. **Yahoo / {{google|Google}} bulk-sender requirements**: senders of >5,000 messages/day to Gmail or Yahoo addresses must implement {{spf|SPF}}, {{dkim|DKIM}}, AND {{dmarc|DMARC}} with at least p=none, RFC 8058 one-click List-Unsubscribe (deadline pushed to 1 June 2024), valid {{ptr-record|PTR}}/forward-confirmed reverse [[dns|DNS]], spam-complaint rate <0.30%. **Gmail moved from 4xx soft errors (Feb 2024) to 5xx permanent rejections in November 2025.** {{microsoft|Microsoft}} Outlook/Hotmail added equivalent requirements with hard [[smtp|SMTP]] rejection (error 550 5.7.515) starting **5 May 2025**.

**[[smtp|SMTP]] smuggling (December 2023 / January 2024)**: Timo Longin (SEC Consult) at 37C3 — outbound and inbound [[smtp|SMTP]] servers disagree on end-of-data sequences, allowing forged messages that pass {{spf|SPF}}/{{dkim|DKIM}}/{{dmarc|DMARC}}. {{cve|CVE}}-2023-51764 (Postfix), {{cve|CVE}}-2023-51765 (Sendmail), {{cve|CVE}}-2023-51766 (Exim).

**EFAIL ({{usenix-conf|USENIX}} Security 2018)**: CBC/CFB malleability gadgets in S/{{mime|MIME}} and OpenPGP plus {{html|HTML}}/{{css|CSS}}/X.509 backchannels in [[imap|IMAP]]-fetched {{html|HTML}} email exfiltrate decrypted plaintext. **23/35 S/{{mime|MIME}} and 10/28 OpenPGP clients vulnerable**; ten CVEs.

**{{microsoft|Microsoft}} 365 basic-auth retirement**: Phased disablement began **1 October 2022** across worldwide multi-tenant {{microsoft|Microsoft}} 365 for EAS, EWS, [[imap|IMAP]], POP, RPS, MAPI/{{rpc|RPC}}, OAB, Autodiscover. **[[smtp|SMTP]] {{smtp-auth|AUTH}} basic auth retiring in two phases starting 1 March 2026 with full rejection by 30 April 2026**; default-disable for new tenants in December 2026. **The era of "give me a 16-character password and [[imap|IMAP]] works forever" is over.**

**Frontier**: **JMAP** (RFC 8620 / 8621, July/August 2019) by Neil Jenkins and Bron Gondwana (Fastmail) — {{json|JSON}}-over-HTTPS replacement for [[imap|IMAP]]; designed inside Fastmail starting ~2014. **Stalwart Mail Server** (Rust, AGPL, 2023+) reached "feature complete" 2025 with native JMAP plus IMAP4rev1+rev2, {{pop3|POP3}}, ManageSieve, CalDAV, CardDAV, WebDAV — funded in part by NLnet via EU NGI0 Entrust Fund. **DKIM2** (\`draft-ietf-dkim-dkim2-motivation\`, November 2025) responds to the {{dkim|DKIM}} replay-attack epidemic by adding per-hop signatures with timestamps.`
						},
						{
							type: 'image',
							src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Email.svg/500px-Email.svg.png',
							alt: 'Email envelope icon — stylised mail handler.',
							caption:
								"**Email** — the longest-running application of the internet. Ray Tomlinson at {{bbn|BBN}} picked the **@** sign in 1971 modifying SNDMSG. [[pioneer:jon-postel|Jon Postel]] published [[rfc:5321|RFC 821]] on port 25 in August 1982. Forty-four years later [[smtp|SMTP]] still relays your mail, [[imap|IMAP]] still serves your folders, and **{{dmarc|DMARC}} enforcement** at {{google|Google}} + Yahoo (from 1 February 2024) finally killed the easy spoofed-From address. The protocol is older than {{arpanet|ARPANET}}'s {{flag-day-1983|flag day}}; the standards work is not done.",
							credit: 'Image: Wikimedia Commons / public domain'
						}
					]
				},
				{ kind: 'protocol', id: 'smtp' },
				{ kind: 'protocol', id: 'imap' }
			]
		}
	]
};
