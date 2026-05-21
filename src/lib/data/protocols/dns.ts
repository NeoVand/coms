import type { Protocol } from '../types';

export const dns: Protocol = {
	id: 'dns',
	name: 'Domain Name System',
	abbreviation: 'DNS',
	categoryId: 'network-foundations',
	port: 53,
	year: 1983,
	rfc: 'RFC 1035',
	oneLiner: "The internet's phone book — translates domain names to [[ip|IP]] addresses.",
	overview: `[[dns|DNS]] is arguably the most critical infrastructure protocol on the internet. Every time you type a {{url|URL}}, your device asks [[dns|DNS]] "what {{ip-address|IP address}} is {{google|google}}.com?" without this translation, the web as we know it couldn't exist.

[[dns|DNS]] is a distributed, hierarchical database. At the top are 13 root server clusters. Below them are {{tld|TLD}} servers (.com, .org, .net). Below those are authoritative servers for individual domains. Your query cascades down this tree, with aggressive caching at every level to keep things fast.

A typical {{dns-resolution|DNS lookup}} takes 10-50ms and involves your device's stub resolver → your {{isp|ISP}}'s {{recursive-resolver|recursive resolver}} → root servers → {{tld|TLD}} servers → authoritative servers. But caching means most lookups are answered in under 1ms from a nearby cache. [[dns|DNS]] also carries more than just [[ip|IP]] addresses: {{mx-record|MX}} records for email, {{txt-record|TXT}} records for verification, {{cname-record|CNAME}} records for aliases, and many more.

Security is a growing concern: {{dnssec|DNSSEC}} ([[dns|DNS]] Security Extensions) adds cryptographic signatures to [[dns|DNS]] responses, authenticating their origin and preventing cache poisoning attacks where an attacker injects forged records. For privacy, [[dns|DNS]] over [[tls|TLS]] (DoT, port 853) and {{dns-over-https|DNS over HTTPS}} (DoH) encrypt [[dns|DNS]] queries so eavesdroppers can't see which domains you're resolving.`,
	howItWorks: [
		{
			title: 'Query sent',
			description:
				'Your device asks the configured {{recursive-resolver|recursive resolver}} (e.g., 8.8.8.8 or 1.1.1.1): "What is the [[ip|IP]] for example.com?" Usually sent over [[udp|UDP]] for speed.'
		},
		{
			title: 'Recursive resolution',
			description:
				"The resolver walks the [[dns|DNS]] tree: asks a root server → gets referred to .com {{tld|TLD}} → asks .com → gets referred to example.com's authoritative server → asks it → gets the answer."
		},
		{
			title: 'Response cached',
			description:
				'Each answer has a {{ttl|TTL}} (time-to-live). The resolver caches the answer for that duration. Your {{os|OS}} and browser cache it too. Next lookup is instant.'
		},
		{
			title: 'IP returned',
			description:
				'Your device receives the {{ip-address|IP address}} and can now establish a [[tcp|TCP]] connection to the web server. The entire process typically takes 10-100ms for uncached queries.'
		}
	],
	useCases: [
		'Every website visit (domain → [[ip|IP]] translation)',
		'Email delivery (MX record lookups)',
		'Domain verification (TXT records for SPF, DKIM, DMARC)',
		'{{load-balancing|Load balancing}} (multiple A records, GeoDNS)',
		'{{service-discovery|Service discovery}} in microservices'
	],
	codeExample: {
		language: 'python',
		code: `import dns.resolver

# Look up A record (IPv4 address)
answers = dns.resolver.resolve('example.com', 'A')
for rdata in answers:
    print(f"IP: {rdata.address}")  # 93.184.216.34

# Look up MX records (mail servers)
mx_records = dns.resolver.resolve('example.com', 'MX')
for mx in mx_records:
    print(f"Mail: {mx.preference} {mx.exchange}")

# Look up TXT records (SPF, DKIM, etc.)
txt_records = dns.resolver.resolve('example.com', 'TXT')
for txt in txt_records:
    print(f"TXT: {txt.to_text()}")`,
		caption:
			'The dig command shows exactly how [[dns|DNS]] resolves a name — from root servers down to the answer',
		alternatives: [
			{
				language: 'javascript',
				code: `const dns = require('node:dns');
const { Resolver } = dns.promises;
const resolver = new Resolver();

// Look up A record
const addresses = await resolver.resolve4('example.com');
console.log('IP:', addresses);  // ['93.184.216.34']

// Look up MX records
const mx = await resolver.resolveMx('example.com');
mx.forEach((r) => {
  console.log(\`Mail: \${r.priority} \${r.exchange}\`);
});

// Look up TXT records
const txt = await resolver.resolveTxt('example.com');
txt.forEach((r) => console.log('TXT:', r.join('')));

// Reverse DNS lookup
const hosts = await resolver.reverse('93.184.216.34');
console.log('Reverse:', hosts);`
			},
			{
				language: 'cli',
				code: `# Look up A record (IPv4 address)
dig example.com A +short
# 93.184.216.34

# Look up MX records (mail servers)
dig example.com MX +short
# 10 mail.example.com

# Trace the full resolution path
dig example.com +trace

# Query a specific DNS server
dig @8.8.8.8 example.com

# DNS-over-HTTPS query
curl -sH 'accept: application/dns-json' \\
  'https://1.1.1.1/dns-query?name=example.com' | jq`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Query',
						code: `DNS Query (UDP):
  Transaction ID: 0xA1B2
  Flags: 0x0100
    QR: 0 (Query)
    Opcode: 0 (Standard)
    RD: 1 (Recursion Desired)
  Questions: 1
  Answer RRs: 0

  Query Section:
    Name: example.com
    Type: A (1)
    Class: IN (1)

  Wire bytes:
    a1 b2 01 00 00 01 00 00  |  ........
    00 00 00 00 07 65 78 61  |  .....exa
    6d 70 6c 65 03 63 6f 6d  |  mple.com
    00 00 01 00 01           |  .....`
					},
					{
						title: 'Response',
						code: `DNS Response (UDP):
  Transaction ID: 0xA1B2
  Flags: 0x8180
    QR: 1 (Response)
    AA: 0 (Not Authoritative)
    RD: 1, RA: 1
    RCODE: 0 (No Error)
  Questions: 1
  Answer RRs: 2

  Answer Section:
    example.com  300  IN  A  93.184.216.34
    example.com  300  IN  A  93.184.216.35

  Authority Section:
    example.com  86400  IN  NS  ns1.example.com
    example.com  86400  IN  NS  ns2.example.com

  Additional Section:
    ns1.example.com  86400  IN  A  198.51.100.1`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'Cached: <1ms. Uncached: 10-100ms (multiple recursive queries). DNS-over-HTTPS adds ~50ms.',
		throughput: 'Not applicable — DNS is query/response, not streaming',
		overhead: '12-byte header + question + answer. Typical query: 40-60 bytes. UDP-based.'
	},
	connections: ['udp', 'tcp', 'tls', 'smtp', 'dhcp', 'bgp', 'icmp', 'ipv6', 'mdns-dns-sd'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Domain_Name_System',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc1035'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Example_of_an_iterative_DNS_resolver.svg/500px-Example_of_an_iterative_DNS_resolver.svg.png',
		alt: 'Diagram showing iterative DNS resolution: client queries recursive resolver, which queries root, TLD, and authoritative nameservers in sequence',
		caption:
			'How {{dns-resolution|DNS resolution}} works — your device asks a {{recursive-resolver|recursive resolver}}, which iteratively queries root servers, {{tld|TLD}} servers (.com, .org), and authoritative nameservers to translate a domain name like "example.com" into an {{ip-address|IP address}}.',
		credit: 'Image: Wikimedia Commons / Public Domain'
	},

	recentChanges: [
		{
			date: '2025',
			title: 'DNS-over-HTTPS adoption past 30%',
			description:
				'{{cloudflare|Cloudflare}}, {{google|Google}} Public [[dns|DNS]], and Quad9 collectively report over 30% of global [[dns|DNS]] queries now arriving via DoH ([[rfc:8484|RFC 8484]]). Browser-level DoH (Firefox, Chrome) drives most of the growth.'
		},
		{
			date: '2024',
			title: 'DNSSEC validation reaches 38%',
			description:
				'{{apnic|APNIC}} measurements show 38% of users are behind a validating resolver — a steady climb from 12% a decade ago. The .gov and .mil zones are 100% {{dnssec|DNSSEC}}-signed; .com is at ~5% of leaf domains.'
		},
		{
			date: '2024-10',
			title: 'KeyTrap (CVE-2023-50387) prompts cross-vendor patches',
			description:
				'A {{dnssec|DNSSEC}} implementation flaw in BIND, Unbound, PowerDNS, Knot, and others let a single crafted query exhaust {{cpu|CPU}} on validating resolvers. Coordinated cross-vendor patches shipped within a week.',
			source: { url: 'https://nvd.nist.gov/vuln/detail/CVE-2023-50387', label: 'NIST NVD' }
		}
	],

	realWorldDeployments: [
		{
			org: 'Cloudflare 1.1.1.1',
			scale: '~1 trillion queries/day',
			description:
				'{{anycast|Anycast}} public resolver with privacy-first design (no logging, encrypted via DoH/DoT). Fastest resolver by most measurements.'
		},
		{
			org: 'Google 8.8.8.8',
			scale: '~14 trillion queries/day',
			description:
				'The original public resolver, {{anycast|anycast}} across {{google|Google}}\'s edge network. Backbone of much of the modern internet\'s name resolution.'
		},
		{
			org: 'Root server system',
			scale: '13 root server letters, ~1500 anycast instances',
			description:
				'The 13 logical root servers (a.root-servers.net to m.root-servers.net) are operated by 12 organisations and replicated across thousands of physical machines via {{anycast|anycast}}. Loss of any one is invisible.'
		}
	],

	funFacts: [
		{
			title: 'DNS replaced a hand-edited text file',
			text: 'Until 1983, every host on the {{arpanet|ARPANET}} maintained a flat HOSTS.{{txt-record|TXT}} file with all the address mappings, distributed by [[ftp|FTP]]. As the network grew past a few hundred hosts, the manual {{bgp-update|update}} process became absurd. [[pioneer:paul-mockapetris|Paul Mockapetris]] designed [[dns|DNS]] to replace it.'
		},
		{
			title: 'Caching does almost all the work',
			text: 'A typical {{recursive-resolver|recursive resolver}} answers **95%+ of queries from cache** without contacting any other server. The "distributed hierarchy" is mostly an availability and authority story; the operational hot path is local memory. {{ttl|TTL}} fields let zone administrators control how long records can be cached.'
		},
		{
			title: 'There are only 13 root server letters',
			text: 'Why 13? In 1991, when the root system was designed, a single [[udp|UDP]] packet could only fit so many name+[[ip|IP]] records — and 13 was the maximum that fit in a 512-byte response. Today the limit is moot (EDNS allows larger responses), but the 13-letter convention has stuck for 35 years.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'TTL of 0 does not mean "never cache"',
				text: 'Some resolvers ignore {{ttl|TTL}}=0 and use a minimum-cache-time (often 60 seconds). Other resolvers cache {{ttl|TTL}}=0 forever. If you need fast cache invalidation, use a moderate {{ttl|TTL}} (60-300 seconds) and rotate explicitly, not {{ttl|TTL}}=0.'
			},
			{
				title: 'CNAME at the apex breaks email',
				text: 'A {{cname-record|CNAME}} at example.com (the zone apex) violates [[rfc:1034|RFC 1034]] because the apex must also have {{ns-record|NS}} and SOA records. Some [[dns|DNS]] providers offer "ALIAS" or "ANAME" pseudo-records that work around this; the underlying limitation is in the spec.'
			},
			{
				title: 'Negative caching can hurt',
				text: 'Resolvers cache NXDOMAIN responses based on the SOA minimum field. If you typo a domain name and a resolver caches the failure for an hour, your fix won\'t take effect until the cache expires. Cure: monitor for unexpected NXDOMAIN; test resolution from multiple resolvers.'
			}
		]
	}
};
