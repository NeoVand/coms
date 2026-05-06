import type { Protocol } from '../types';

export const dns: Protocol = {
	id: 'dns',
	name: 'Domain Name System',
	abbreviation: 'DNS',
	categoryId: 'utilities',
	port: 53,
	year: 1983,
	rfc: 'RFC 1035',
	oneLiner: "The internet's phone book — translates domain names to IP addresses.",
	overview: `DNS is arguably the most critical infrastructure protocol on the internet. Every time you type a URL, your device asks DNS "what {{ip-address|IP address}} is google.com?" without this translation, the web as we know it couldn't exist.

DNS is a distributed, hierarchical database. At the top are 13 root server clusters. Below them are TLD servers (.com, .org, .net). Below those are authoritative servers for individual domains. Your query cascades down this tree, with aggressive caching at every level to keep things fast.

A typical {{dns-resolution|DNS lookup}} takes 10-50ms and involves your device's stub resolver → your ISP's recursive resolver → root servers → TLD servers → authoritative servers. But caching means most lookups are answered in under 1ms from a nearby cache. DNS also carries more than just IP addresses: MX records for email, TXT records for verification, CNAME records for aliases, and many more.

Security is a growing concern: {{dnssec|DNSSEC}} (DNS Security Extensions) adds cryptographic signatures to DNS responses, authenticating their origin and preventing cache poisoning attacks where an attacker injects forged records. For privacy, DNS over TLS (DoT, port 853) and {{dns-over-https|DNS over HTTPS}} (DoH) encrypt DNS queries so eavesdroppers can't see which domains you're resolving.`,
	howItWorks: [
		{
			title: 'Query sent',
			description:
				'Your device asks the configured recursive resolver (e.g., 8.8.8.8 or 1.1.1.1): "What is the IP for example.com?" Usually sent over UDP for speed.'
		},
		{
			title: 'Recursive resolution',
			description:
				"The resolver walks the DNS tree: asks a root server → gets referred to .com TLD → asks .com → gets referred to example.com's authoritative server → asks it → gets the answer."
		},
		{
			title: 'Response cached',
			description:
				'Each answer has a TTL (time-to-live). The resolver caches the answer for that duration. Your OS and browser cache it too. Next lookup is instant.'
		},
		{
			title: 'IP returned',
			description:
				'Your device receives the IP address and can now establish a TCP connection to the web server. The entire process typically takes 10-100ms for uncached queries.'
		}
	],
	useCases: [
		'Every website visit (domain → IP translation)',
		'Email delivery (MX record lookups)',
		'Domain verification (TXT records for SPF, DKIM, DMARC)',
		'Load balancing (multiple A records, GeoDNS)',
		'Service discovery in microservices'
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
			'The dig command shows exactly how DNS resolves a name — from root servers down to the answer',
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
	connections: ['udp', 'tcp', 'tls', 'smtp', 'dhcp', 'bgp', 'icmp', 'ipv6'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Domain_Name_System',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc1035'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Example_of_an_iterative_DNS_resolver.svg/500px-Example_of_an_iterative_DNS_resolver.svg.png',
		alt: 'Diagram showing iterative DNS resolution: client queries recursive resolver, which queries root, TLD, and authoritative nameservers in sequence',
		caption:
			'How DNS resolution works — your device asks a recursive resolver, which iteratively queries root servers, TLD servers (.com, .org), and authoritative nameservers to translate a domain name like "example.com" into an IP address.',
		credit: 'Image: Wikimedia Commons / Public Domain'
	}
};
