import type { SubcategoryStory } from './types';

export const namingStory: SubcategoryStory = {
	subcategoryId: 'naming',
	tagline:
		'The distributed database that lets humans find machines — and the single most consequential cache in computing',
	sections: [
		{
			type: 'narrative',
			title: 'Before DNS, There Was a File',
			text: `Until 1983, the Internet had no [[dns|DNS]]. Every host on the ARPANET kept a copy of one text file — \`HOSTS.TXT\` — that mapped names to addresses. To add yourself to the Internet, you emailed Elizabeth "Jake" Feinler at SRI; she edited the master file by hand. Every host downloaded the new copy by [[ftp|FTP]] from SRI-NIC, usually overnight.\n\nThis worked for hundreds of hosts. It broke at thousands. By 1982 the file had grown to nearly a megabyte; the network's traffic from \`HOSTS.TXT\` distribution was rivaling its useful traffic. Every name change required centralized human approval. Every name was global — there could be only one \`MIT\`.\n\n[[pioneer:paul-mockapetris|Paul Mockapetris]] at USC ISI was given the problem. His answer in [[rfc:1034|RFC 1034]] and [[rfc:1035|RFC 1035]] (November 1983) is one of the most successful designs in distributed systems: a **hierarchical namespace** delegated to whoever owned each subtree, a **distributed database** where no single server held everything, and a **caching protocol** that let the system scale by *forgetting* most queries within seconds.\n\nForty-two years later, every connection on the Internet still starts with a DNS query. The protocol has changed remarkably little. What has changed is everything *around* it — privacy, censorship, attack surface, and the question of who, exactly, gets to control the root.`
		},
		{
			type: 'pioneers',
			title: 'The DNS Architects',
			people: [
				{
					id: 'paul-mockapetris',
					name: 'Paul Mockapetris',
					years: '1948–',
					title: 'Inventor of DNS',
					org: 'USC ISI',
					contribution:
						'Designed and implemented [[dns|DNS]] in 1983 ([[rfc:1034|RFC 1034]], [[rfc:1035|RFC 1035]]). The hierarchical zone-delegation model, the recursive vs iterative split, the resource-record types, the on-the-wire packet format — all Mockapetris. The first DNS server was JEEVES, written in TOPS-20 assembler. BIND, the dominant DNS server for the next 35 years, was a clean-room re-implementation by Berkeley grad students using the spec. Mockapetris also chaired the IETF (1994–1996).',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Paul_Mockapetris.jpg/330px-Paul_Mockapetris.jpg'
				},
				{
					id: 'jon-postel',
					name: 'Jon Postel',
					years: '1943–1998',
					title: 'IANA & Root Zone Steward',
					org: 'USC ISI',
					contribution:
						'Managed the [[dns|DNS]] root zone and the top-level domain assignments for over a decade as IANA, often single-handedly. The famous "Postel test" of January 1998 — Postel asked eight of the twelve root servers to temporarily take their root zone from his own server rather than the one operated by Network Solutions, to demonstrate that root authority should be technical, not political. The US government was not amused; ICANN was formed later that year to replace Postel\'s role with a multi-stakeholder body.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Jon_Postel_sitting_in_office_%28cropped%29.jpg/330px-Jon_Postel_sitting_in_office_%28cropped%29.jpg'
				},
				{
					id: 'dan-bernstein',
					name: 'Dan Bernstein',
					years: '1971–',
					title: 'djbdns / DNSSEC critic',
					org: 'UIC',
					contribution:
						"Wrote djbdns (2001) — a security-focused DNS server in response to a long string of buffer-overflow vulnerabilities in BIND. djbdns held a $1000 security bounty for nine years without a successful claim. Bernstein also discovered DNS cache-poisoning vulnerabilities that drove the deployment of randomized source ports (Kaminsky's 2008 disclosure used the same class of weakness). Influential as a longtime critic of DNSSEC's complexity — many of his alternative proposals (DNSCurve, CurveCP) shaped later thinking about encrypting DNS."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1973,
					title: 'HOSTS.TXT Begins',
					description:
						'Elizabeth Feinler at SRI maintains a single text file mapping ARPANET hosts to addresses. Distribution: FTP overnight.'
				},
				{
					year: 1983,
					title: 'DNS Standardized (RFCs 1034, 1035)',
					description:
						'[[pioneer:paul-mockapetris|Mockapetris]] publishes the design that will run the Internet. Hierarchical namespace, distributed authority, caching.'
				},
				{
					year: 1984,
					title: 'BIND 1.0 Released',
					description:
						'Berkeley Internet Name Domain — a clean-room reimplementation by Doug Terry, Mark Painter, David Riggle, and Songnian Zhou. Becomes the dominant DNS server for 30+ years.'
				},
				{
					year: 1998,
					title: 'The Postel Redirection',
					description:
						"In January, [[pioneer:jon-postel|Postel]] briefly redirects 8 of the 12 root servers away from Network Solutions' control. ICANN is formed later that year."
				},
				{
					year: 2008,
					title: 'Kaminsky DNS Cache Poisoning',
					description:
						'Dan Kaminsky discovers that the 16-bit DNS transaction ID is too small to prevent off-path poisoning. Coordinated patch deploys randomized source ports to add ~16 more bits of entropy. The fix is wire-compatible; recursive resolvers everywhere update within months.'
				},
				{
					year: 2010,
					title: 'Root Zone Signed (DNSSEC)',
					description:
						'After two decades of debate, the [[dns|DNS]] root is cryptographically signed. The "Root Key Signing Key" rollover ceremonies — held twice a year in geographically separated facilities with multiple custodians — become a uniquely transparent piece of Internet infrastructure.'
				},
				{
					year: 2016,
					title: 'Dyn DDoS via Mirai Botnet',
					description:
						"A botnet of IoT cameras and DVRs floods Dyn — a major managed DNS provider — with traffic. Twitter, Spotify, Reddit, GitHub, Netflix become unreachable for hours on the US East Coast. DNS is the Internet's most attractive DDoS target because everything depends on it."
				},
				{
					year: 2018,
					title: 'DNS over HTTPS (DoH) Standardized (RFC 8484)',
					description:
						'Encapsulating DNS queries in HTTPS to the resolver. Mozilla and Google enable it by default in their browsers, drawing fire from ISPs and governments that relied on DNS visibility for filtering, analytics, and law enforcement.'
				},
				{
					year: 2022,
					title: 'DNS over QUIC (DoQ) — RFC 9250',
					description:
						'DNS over [[quic|QUIC]]. Lower latency than DoH, encryption mandatory like DoH. Slow adoption — DoH is "good enough" for most clients.'
				},
				{
					year: 2024,
					title: 'Encrypted Client Hello (ECH)',
					description:
						"Hides the SNI (which website you're visiting) from passive observers using DNS-served HTTPS records. The last metadata leak from a typical TLS connection. Enabled by default in Chrome and Firefox in 2024."
				}
			]
		},
		{
			type: 'comparison',
			title: 'DNS Transport Variants',
			axes: ['Transport', 'Port', 'Encryption', 'Use case'],
			rows: [
				{
					label: 'Classic DNS',
					values: [
						'[[udp|UDP]] (with TCP fallback)',
						'53',
						'None — queries and answers visible to anyone on path',
						'Default for every recursive resolver since 1983'
					]
				},
				{
					label: 'DNS over TLS (DoT)',
					values: [
						'[[tcp|TCP]] + [[tls|TLS]]',
						'853',
						'[[tls|TLS]] 1.2+',
						'OS-level resolvers (Android Private DNS)'
					]
				},
				{
					label: 'DNS over HTTPS (DoH)',
					values: [
						'[[http2|HTTP/2]] + [[tls|TLS]]',
						'443',
						'[[tls|TLS]] 1.2+',
						'Browser-level (Chrome, Firefox); hides DNS from local network'
					]
				},
				{
					label: 'DNS over QUIC (DoQ)',
					values: [
						'[[quic|QUIC]] (UDP)',
						'853',
						'Mandatory [[tls|TLS]] 1.3',
						'Lower latency than DoH; emerging adoption'
					]
				}
			],
			note: "All four are wire-compatible at the *DNS payload* level. The transport changed; the message format didn't. That's the depth of Mockapetris's original design."
		},
		{
			type: 'animated-sequence',
			title: 'Recursive Resolution from Root',
			definition: `sequenceDiagram
    participant C as Client
    participant R as Recursive Resolver
    participant Root as Root Server
    participant TLD as TLD Server
    participant Auth as Authoritative
    Note over C: A record query for www.example.com
    C->>R: query www.example.com
    Note over R: cache miss — recurse
    R->>Root: query www.example.com
    Root-->>R: I do not know — ask .com server
    R->>TLD: query www.example.com
    TLD-->>R: I do not know — ask example.com authoritative
    R->>Auth: query www.example.com
    Auth-->>R: A record 93.184.216.34, TTL 3600
    R-->>C: 93.184.216.34
    Note over R: cache for TTL of 3600s
    Note over C,Auth: Subsequent queries served from R cache, zero round trips`,
			caption:
				"The first query for a name walks the tree — root → TLD → authoritative. Every subsequent query within the TTL window is served from the resolver's cache. Caching is what makes DNS *fast*. Cache poisoning is what makes DNS *dangerous*.",
			steps: {
				0: "**The query begins.** Your laptop wants to load `www.example.com`. The OS asks the configured DNS resolver — usually your ISP's, or 8.8.8.8, or 1.1.1.1.",
				1: 'Client sends the query to its **recursive resolver**. (The client itself is a "stub resolver" — it does no work beyond asking once.)',
				2: '**Cache miss.** The recursive resolver checks its cache. If it had answered this name in the last TTL window, it would serve from cache and be done. First-time queries — and rare names — recurse.',
				3: 'Resolver asks a **root server**. There are 13 root server addresses (a-m.root-servers.net), heavily anycast-replicated worldwide. The resolver knows them from a built-in hints file.',
				4: 'Root replies: **"I don\'t know `www.example.com`, but here are the servers for `.com`."** Root servers know only top-level delegations — they don\'t answer for individual names.',
				5: 'Resolver follows the referral to a **.com TLD server**. Verisign runs the .com root, with massive replication.',
				6: 'TLD server replies: **"I don\'t know `www.example.com`, but here are the authoritative servers for `example.com`."** TLDs know the next level of delegation, no further.',
				7: 'Resolver asks the **authoritative server** for example.com (typically run by the domain owner or their DNS provider).',
				8: 'Authoritative server replies with the actual **A record: `93.184.216.34`**, plus a TTL of 3600 seconds. The TTL is the *promise* that this answer is valid for an hour.',
				9: 'Resolver returns the answer to the client. The client can now connect to 93.184.216.34.',
				10: 'Resolver **caches** the answer for the next 3600 seconds. Every query in that window from any client of this resolver is served from cache — zero round trips.',
				11: '**Subsequent queries are nearly free.** A new client asking for the same name 5 minutes later gets the cached answer instantly. This caching is what makes DNS practical — without it, every web page load would walk the tree.'
			}
		},
		{
			type: 'callout',
			title: 'DNS Caching Is the Most Consequential Decision in Distributed Systems',
			text: `Every DNS record carries a **TTL** — time-to-live, in seconds — that controls how long a caching resolver may store the answer. The author of the zone picks the TTL. Almost everything about DNS's behavior, good and bad, traces back to this number.\n\n**Short TTLs** (60s) mean rapid propagation of changes — useful for failover, load balancing, A/B-testing. They also mean *every* client query goes to the authoritative server, multiplying load on the origin and erasing the cache's benefit. Run a popular domain with a 60-second TTL and you'll get the bill in compute.\n\n**Long TTLs** (24h, 7d) mean almost-free resolution — most queries hit a nearby cache. They also mean *changes propagate slowly*. Migrate a domain to a new IP with a 24-hour TTL set yesterday, and yesterday's clients will keep hitting the old IP for a day. Anyone who's moved a production site has lived this.\n\nThe trade is genuine: faster updates vs less load. Most teams set TTLs of 300–3600 seconds and only realize the implications during an incident. The recursive-resolver tier of the Internet — Google 8.8.8.8, Cloudflare 1.1.1.1, your ISP's resolver — is collectively the largest cache in computing, and your TTL picks decide what they remember.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[dns|DNS]] fails in three signature ways:\n\n- **Cache poisoning.** Convince a recursive resolver to cache a wrong answer; every client downstream gets directed to your malicious server. The 2008 Kaminsky vulnerability nearly made this trivial; randomized source ports raised the bar back up. {{dnssec|DNSSEC}} raises it further by signing responses cryptographically, but DNSSEC deployment is still partial and validators are still rare in stub resolvers.\n- **Amplification DDoS.** Send a 60-byte query with a spoofed source address to an open resolver; the resolver sends a 3 KB response *to the victim*. Amplification ratios of 50× let modest botnets generate hundreds of Gbps of attack traffic. The defense — closed resolvers, source-address validation (BCP 38), DNSSEC response-rate limiting — is slow because every network has to implement it.\n- **The authoritative outage.** If the authoritative server for a zone is unreachable, *every* client outside the TTL window for that zone breaks. The 2016 Dyn outage took out Twitter, Spotify, GitHub, and Netflix simultaneously because they all used Dyn for authoritative DNS. The lesson: serve from multiple providers across multiple networks. Most major sites learned it the hard way.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **{{dnssec|DNSSEC}} validation in stub resolvers** — pushed by Apple in iOS/macOS and increasingly enabled by default. The end-to-end chain finally completes when the *client*, not just the recursive resolver, validates signatures.\n- **Encrypted Client Hello (ECH)** uses DNS to publish keys that hide SNI from passive network observers. Now default in Chrome and Firefox; the last metadata leak in TLS is closing.\n- **Oblivious DNS over HTTPS (ODoH)** separates *who is asking* from *what they're asking*. A relay knows the client but not the query; a target knows the query but not the client. Apple's iCloud Private Relay uses a similar architecture.\n- **The political fight over DoH.** Several governments (UK, Russia, China, parts of EU) have moved to restrict or ban encrypted DNS. The protocol is decided; the question of who can run a recursive resolver, and whether ISPs can mandate their own, is not.\n\nThe protocol Mockapetris designed in 1983 is barely changed. Everything new is happening around its edges.`
		}
	]
};
