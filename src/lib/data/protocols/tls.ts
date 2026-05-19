import type { Protocol } from '../types';

export const tls: Protocol = {
	id: 'tls',
	name: 'Transport Layer Security',
	abbreviation: 'TLS',
	categoryId: 'utilities',
	port: undefined,
	year: 1999,
	rfc: 'RFC 8446',
	oneLiner: 'Encrypts everything between client and server — the lock icon in your browser.',
	overview: `[[tls|TLS]] (and its predecessor SSL) is the security layer that makes the modern internet possible. Every HTTPS website, every secure API call, every {{encryption|encrypted}} email — they all rely on [[tls|TLS]] to ensure that data can't be read or modified in transit.

[[tls|TLS]] provides three guarantees: confidentiality (data is encrypted, so eavesdroppers see gibberish), integrity (data can't be modified without detection), and authentication (you're actually talking to who you think you are, verified by {{certificate|certificates}}). [[tls|TLS]] 1.3 (2018) dramatically simplified the {{tls-handshake|handshake}}, reducing it from 2 {{rtt|round trips}} to 1, and removed support for legacy insecure algorithms.

When you see the lock icon in your browser, [[tls|TLS]] is at work. It sits between the application layer ([[http1|HTTP]]) and the transport layer ([[tcp|TCP]]), transparently encrypting everything. Application code doesn't need to change — "http://" becomes "https://" and [[tls|TLS]] handles the rest.

[[tls|TLS]] is the Layer-4 (transport) {{encryption|encryption}} story. Its Layer-3 (network) counterpart is **[[ipsec|IPsec]]** — same goal (confidentiality + integrity + authentication), different scope (entire [[ip|IP]] packets instead of single [[tcp|TCP]] streams). Where [[tls|TLS]] wraps one connection that one application can see, [[ipsec|IPsec]] encrypts every [[ip|IP]] packet between two endpoints — host-to-host or gateway-to-gateway — and is the substrate of every site-to-site VPN, every {{3gpp|3GPP}} [[cellular|mobile-core]] backhaul, and every IKEv2 client tunnel on macOS, iOS, Windows, and Android. The lighter-weight cousin **[[wireguard|WireGuard]]** picks the same Noise-protocol crypto stack and ships in ~4,000 lines of kernel code. Below the transport layer entirely, short-range wireless protocols like [[nfc|NFC]] (Apple Pay), [[bluetooth|BLE]] ({{ccc-digital-key|CCC Digital Key}}), and [[uwb|UWB]] ({{aliro|Aliro}}) negotiate their own session keys and never traverse [[tls|TLS]] until the cryptogram reaches the payment-network back-end.`,
	howItWorks: [
		{
			title: 'ClientHello',
			description:
				'Client sends supported [[tls|TLS]] versions, cipher suites, and a random value. In [[tls|TLS]] 1.3, it also speculatively includes key shares to save a round trip.'
		},
		{
			title: 'ServerHello + Certificate',
			description:
				'Server selects a {{cipher-suite|cipher suite}}, sends its {{certificate-chain|certificate chain}} (proving identity), and in [[tls|TLS]] 1.3, sends its key share. {{handshake|Handshake}} keys are now derived.'
		},
		{
			title: 'Certificate verification',
			description:
				"Client verifies the server's {{certificate|certificate}} against trusted {{certificate-authority|CAs}}. If it's valid (correct domain, not expired, trusted chain), the connection proceeds."
		},
		{
			title: 'Encrypted data flow',
			description:
				'Application data ([[http1|HTTP]], [[smtp|SMTP]], etc.) is {{encryption|encrypted}} with the negotiated cipher. Each record has an authentication tag preventing tampering.'
		}
	],
	useCases: [
		'HTTPS web browsing (every secure website)',
		'Secure API communication',
		'Email encryption (SMTPS, IMAPS)',
		'{{vpn|VPN}} tunneling (OpenVPN)',
		'Database connection encryption'
	],
	codeExample: {
		language: 'python',
		code: `import ssl
import socket

# Create a TLS-wrapped connection
context = ssl.create_default_context()
with socket.create_connection(('example.com', 443)) as sock:
    with context.wrap_socket(sock,
                             server_hostname='example.com') as tls:
        print(f"Version: {tls.version()}")  # TLSv1.3
        print(f"Cipher: {tls.cipher()[0]}")

        cert = tls.getpeercert()
        print(f"Subject: {cert['subject']}")
        print(f"Expires: {cert['notAfter']}")

        tls.sendall(b"GET / HTTP/1.1\\r\\n"
                     b"Host: example.com\\r\\n\\r\\n")
        print(tls.recv(1024).decode())`,
		caption:
			'Every HTTPS connection starts with a {{tls-handshake|TLS handshake}} — you can inspect certificates with openssl',
		alternatives: [
			{
				language: 'javascript',
				code: `const tls = require('node:tls');

const socket = tls.connect(443, 'example.com', () => {
  console.log('Connected:', socket.authorized);
  console.log('Protocol:', socket.getProtocol()); // TLSv1.3
  console.log('Cipher:', socket.getCipher().name);

  const cert = socket.getPeerCertificate();
  console.log('Subject:', cert.subject.CN);
  console.log('Issuer:', cert.issuer.CN);
  console.log('Valid until:', cert.valid_to);

  socket.write('GET / HTTP/1.1\\r\\n' +
               'Host: example.com\\r\\n\\r\\n');
});

socket.on('data', (data) => {
  console.log(data.toString());
  socket.end();
});`
			},
			{
				language: 'cli',
				code: `# View a site's TLS certificate
openssl s_client -connect example.com:443 2>/dev/null \\
  | openssl x509 -noout -text \\
  | grep -E "(Subject:|Issuer:|Not After)"

# Check TLS version and cipher suite
openssl s_client -connect example.com:443 \\
  -tls1_3 2>/dev/null | grep -E "(Protocol|Cipher)"

# Test for specific TLS versions
nmap --script ssl-enum-ciphers -p 443 example.com

# Generate a self-signed certificate
openssl req -x509 -newkey rsa:2048 -nodes \\
  -keyout key.pem -out cert.pem -days 365`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'ClientHello',
						code: `TLS Record:
  Content Type: Handshake (22)
  Version: TLS 1.0 (0x0301)
  Length: 512

  Handshake: ClientHello
    Version: TLS 1.2 (0x0303)
    Random: 5f4dcc3b5aa765d6...
    Session ID Length: 32
    Cipher Suites (5):
      TLS_AES_256_GCM_SHA384 (0x1302)
      TLS_AES_128_GCM_SHA256 (0x1301)
      TLS_CHACHA20_POLY1305_SHA256 (0x1303)
      TLS_ECDHE_RSA_WITH_AES_128_GCM (0xC02F)
      TLS_ECDHE_RSA_WITH_AES_256_GCM (0xC030)
    Extensions:
      server_name: example.com
      supported_versions: TLS 1.3, TLS 1.2
      key_share: x25519 (32 bytes)
      signature_algorithms: ecdsa_secp256r1_sha256, rsa_pss_rsae_sha256`
					},
					{
						title: 'ServerHello',
						code: `TLS Record:
  Content Type: Handshake (22)
  Version: TLS 1.2 (0x0303)
  Length: 122

  Handshake: ServerHello
    Version: TLS 1.2 (0x0303)
    Random: 8f2a9d3b7c1e5f4a...
    Cipher Suite: TLS_AES_256_GCM_SHA384
    Extensions:
      supported_versions: TLS 1.3
      key_share: x25519 (32 bytes)

  [ChangeCipherSpec]

  Handshake: EncryptedExtensions
  Handshake: Certificate
    cert[0]: CN=example.com
      Issuer: Let's Encrypt R3
      Valid: 2024-01-15 to 2024-04-15
  Handshake: CertificateVerify
  Handshake: Finished
    Verify Data: [32 bytes]`
					}
				]
			}
		]
	},
	performance: {
		latency: 'TLS 1.3: 1 RTT for new connections, 0 RTT for resumption. TLS 1.2: 2 RTTs.',
		throughput:
			'AES-GCM encryption is hardware-accelerated on modern CPUs — negligible throughput impact',
		overhead: '~5 bytes per TLS record header + 16 bytes for GCM authentication tag'
	},
	connections: [
		'tcp',
		'http1',
		'http2',
		'quic',
		'websockets',
		'smtp',
		'ftp',
		'dns',
		'imap',
		'oauth2',
		'ipsec'
	],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Transport_Layer_Security',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc8446'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Full_TLS_1.3_Handshake.svg/500px-Full_TLS_1.3_Handshake.svg.png',
		alt: 'Sequence diagram of the full TLS 1.3 handshake showing ClientHello, ServerHello, certificate exchange, and encrypted data flow',
		caption:
			'The [[tls|TLS]] 1.3 {{handshake|handshake}} — reduced from two round trips ([[tls|TLS]] 1.2) to just one. The client sends supported cipher suites and key shares in ClientHello; the server responds with its choices, {{certificate|certificate}}, and finished message — then encrypted data flows immediately.',
		credit: 'Image: Wikimedia Commons / Public Domain'
	},

	recentChanges: [
		{
			date: '2024-08',
			title: 'NIST finalises ML-KEM, ML-DSA, SLH-DSA',
			description:
				'FIPS 203, 204, 205 published — the post-quantum cryptography primitives that [[tls|TLS]] would depend on. {{ml-kem|ML-KEM}}-768 (formerly Kyber-768) becomes the foundation for hybrid key {{exchange|exchange}}.',
			source: { url: 'https://csrc.nist.gov/publications/detail/fips/203/final', label: 'NIST FIPS 203' }
		},
		{
			date: '2024-Q2',
			title: 'X25519MLKEM768 default in Chrome 124',
			description:
				'Chrome enables hybrid post-quantum key agreement by default for all [[tls|TLS]] 1.3 connections. Cloudflare and major CDNs follow within months.',
			source: { url: 'https://chromestatus.com/feature/5572538108870656', label: 'Chrome Status' }
		},
		{
			date: '2025-Q3',
			title: '~70% of TLS 1.3 handshakes are post-quantum',
			description:
				'{{cdn|CDN}} measurements show majority of [[tls|TLS]] 1.3 connections now negotiate X25519MLKEM768 hybrid. Apple iOS 26 ships with PQ on by default.'
		},
		{
			date: '2024-09',
			title: 'ECH (Encrypted Client Hello) progresses',
			description:
				'draft-ietf-tls-esni-23 advanced toward RFC; {{ech|ECH}} hides the {{sni|SNI}} from on-path observers, closing a long-standing [[tls|TLS]] metadata leak. Cloudflare and Mozilla running joint deployments.'
		}
	],

	realWorldDeployments: [
		{
			org: 'Cloudflare',
			scale: '100% of HTTPS edge',
			description:
				'[[tls|TLS]] 1.3 with X25519MLKEM768 hybrid key {{exchange|exchange}} and {{ech|ECH}} support enabled by default for every site fronted by Cloudflare.'
		},
		{
			org: 'Apple',
			scale: 'iOS 26 / macOS 15+',
			description:
				'Network.framework defaults to [[tls|TLS]] 1.3; X25519MLKEM768 enabled by default in iOS 26.'
		},
		{
			org: 'Google Chrome',
			scale: 'Chrome 124+',
			description:
				'Hybrid post-quantum key agreement enabled by default. Falls back gracefully when servers do not support it.'
		},
		{
			org: 'Let\'s Encrypt',
			scale: '~470M certificates active',
			description:
				'The dominant {{certificate-authority|CA}} for the web. All certificates issued via ACME. ~3M certificates renewed daily.'
		}
	],

	funFacts: [
		{
			title: 'SSL 1.0 was never released',
			text: 'Netscape\'s [[pioneer:taher-elgamal|Taher Elgamal]] designed SSL 1.0 in 1994 — but a flaw was found before public release that let an attacker recover the session key. SSL 2.0 (1995) shipped instead. SSL 3.0 (1996) was rewritten from scratch by Paul Kocher and survived for over a decade.'
		},
		{
			title: 'TLS 1.3 cut every weak cipher',
			text: '[[tls|TLS]] 1.3 ([[rfc:8446|RFC 8446]]) was the first version to break wire compatibility — it removed RC4, 3DES, MD5, SHA-1, RSA key {{exchange|exchange}}, and every CBC-mode cipher. Each one had been weaponised in a published attack: BEAST, CRIME, BREACH, Lucky 13, FREAK, Logjam, ROBOT.'
		},
		{
			title: 'Harvest now, decrypt later',
			text: 'An adversary recording your encrypted traffic today can store it indefinitely and decrypt it whenever a working quantum computer arrives. For data that needs to stay secret for decades, the threat is real **now** — which is why the post-quantum migration cannot wait for the hardware to materialise.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Certificate expiry takes down major sites',
				text: 'Even huge organisations forget to renew. Microsoft Teams (2020), Spotify (2020), Cisco WebEx (2018) all had hours-long outages because a single {{certificate|certificate}} expired. Cure: monitor expiries (cert-monitor, AWS ACM, Let\'s Encrypt automation), and never have an "important" cert that someone has to renew by hand.'
			},
			{
				title: 'Resumption tickets enable replay on 0-RTT',
				text: '[[tls|TLS]] 1.3 {{zero-rtt|0-RTT}} lets the client send application data in the very first message — but that data is potentially replayable. {{idempotent|Idempotent}} requests (GET) are usually safe; mutating requests (POST) are not. Most browsers limit {{zero-rtt|0-RTT}} to GET; servers should refuse {{zero-rtt|0-RTT}} for any non-{{idempotent|idempotent}} method.'
			},
			{
				title: 'Mixed content breaks the padlock',
				text: 'A page loaded over HTTPS that includes a single script over HTTP triggers the browser\'s mixed-content blocker. The page either fails to load assets or shows a warning. Cure: use protocol-relative URLs or strict HTTPS-only resources.'
			}
		]
	}
};
