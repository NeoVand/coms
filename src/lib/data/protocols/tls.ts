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
	overview: `TLS (and its predecessor SSL) is the security layer that makes the modern internet possible. Every HTTPS website, every secure API call, every {{encryption|encrypted}} email — they all rely on TLS to ensure that data can't be read or modified in transit.

TLS provides three guarantees: confidentiality (data is encrypted, so eavesdroppers see gibberish), integrity (data can't be modified without detection), and authentication (you're actually talking to who you think you are, verified by {{certificate|certificates}}). TLS 1.3 (2018) dramatically simplified the {{tls-handshake|handshake}}, reducing it from 2 {{rtt|round trips}} to 1, and removed support for legacy insecure algorithms.

When you see the lock icon in your browser, TLS is at work. It sits between the application layer ([[http1|HTTP]]) and the transport layer ([[tcp|TCP]]), transparently encrypting everything. Application code doesn't need to change — "http://" becomes "https://" and TLS handles the rest.`,
	howItWorks: [
		{
			title: 'ClientHello',
			description:
				'Client sends supported TLS versions, cipher suites, and a random value. In TLS 1.3, it also speculatively includes key shares to save a round trip.'
		},
		{
			title: 'ServerHello + Certificate',
			description:
				'Server selects a cipher suite, sends its certificate chain (proving identity), and in TLS 1.3, sends its key share. Handshake keys are now derived.'
		},
		{
			title: 'Certificate verification',
			description:
				"Client verifies the server's certificate against trusted CAs. If it's valid (correct domain, not expired, trusted chain), the connection proceeds."
		},
		{
			title: 'Encrypted data flow',
			description:
				'Application data (HTTP, SMTP, etc.) is encrypted with the negotiated cipher. Each record has an authentication tag preventing tampering.'
		}
	],
	useCases: [
		'HTTPS web browsing (every secure website)',
		'Secure API communication',
		'Email encryption (SMTPS, IMAPS)',
		'VPN tunneling (OpenVPN)',
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
			'Every HTTPS connection starts with a TLS handshake — you can inspect certificates with openssl',
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
		'oauth2'
	],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Transport_Layer_Security',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc8446'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Full_TLS_1.3_Handshake.svg/500px-Full_TLS_1.3_Handshake.svg.png',
		alt: 'Sequence diagram of the full TLS 1.3 handshake showing ClientHello, ServerHello, certificate exchange, and encrypted data flow',
		caption:
			'The TLS 1.3 handshake — reduced from two round trips (TLS 1.2) to just one. The client sends supported cipher suites and key shares in ClientHello; the server responds with its choices, certificate, and finished message — then encrypted data flows immediately.',
		credit: 'Image: Wikimedia Commons / Public Domain'
	}
};
