import type { Protocol } from '../types';

export const utilitiesProtocols: Protocol[] = [
	{
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
		connections: ['tcp', 'http1', 'http2', 'quic', 'websockets', 'smtp', 'ftp', 'dns', 'imap', 'oauth2'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Transport_Layer_Security',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc8446'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Full_TLS_1.3_Handshake.svg/600px-Full_TLS_1.3_Handshake.svg.png',
			alt: 'Sequence diagram of the full TLS 1.3 handshake showing ClientHello, ServerHello, certificate exchange, and encrypted data flow',
			caption:
				'The TLS 1.3 handshake — reduced from two round trips (TLS 1.2) to just one. The client sends supported cipher suites and key shares in ClientHello; the server responds with its choices, certificate, and finished message — then encrypted data flows immediately.',
			credit: 'Image: Wikimedia Commons / Public Domain'
		}
	},
	{
		id: 'ssh',
		name: 'Secure Shell',
		abbreviation: 'SSH',
		categoryId: 'utilities',
		port: 22,
		year: 1995,
		rfc: 'RFC 4253',
		oneLiner: 'Encrypted remote access — how developers securely connect to servers.',
		overview: `SSH replaced the insecure telnet and rlogin protocols by providing {{encryption|encrypted}} remote shell access. When you connect to a server, push code to GitHub, or tunnel a database connection, you're likely using SSH.

SSH provides an encrypted tunnel between {{client-server|client and server}} that can carry interactive shell sessions, file transfers (SCP/SFTP), and port forwarding. Authentication can use passwords, but the preferred method is {{public-key|public key}} authentication: your {{private-key|private key}} stays on your machine, and the server has your public key — no passwords transmitted over the network.

Beyond shell access, SSH's {{port-forwarding|port forwarding}} capability is remarkably powerful. You can create {{tunnel|tunnels}} that securely expose remote services locally, bypass {{firewall|firewalls}}, and create ad-hoc {{vpn|VPNs}} — making SSH one of the most versatile networking tools in a developer's toolkit.`,
		howItWorks: [
			{
				title: 'TCP connection + version exchange',
				description:
					'Client connects to port 22. Both sides announce their SSH protocol version and software version in plain text.'
			},
			{
				title: 'Key exchange',
				description:
					'Client and server negotiate encryption using Diffie-Hellman or similar. This produces shared session keys without ever transmitting them. Everything after this is encrypted.'
			},
			{
				title: 'Server authentication',
				description:
					'Client verifies the server\'s host key against its known_hosts file. "Are you the same server I connected to before?" Prevents man-in-the-middle attacks.'
			},
			{
				title: 'User authentication',
				description:
					'Client authenticates via public key (preferred), password, or other method. The server verifies and grants access. An encrypted session is now established.'
			}
		],
		useCases: [
			'Remote server administration',
			'Git operations (GitHub, GitLab over SSH)',
			'Secure file transfer (SCP, SFTP)',
			'Port forwarding and tunneling',
			'Automated deployment scripts'
		],
		codeExample: {
			language: 'python',
			code: `import paramiko

# Connect to a remote server
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect('example.com',
               username='user', key_filename='~/.ssh/id_ed25519')

# Execute a command
stdin, stdout, stderr = client.exec_command('ls -la')
print(stdout.read().decode())

# SFTP file transfer
sftp = client.open_sftp()
sftp.put('local_file.txt', '/home/user/remote_file.txt')
sftp.get('/var/log/app.log', 'local_app.log')
sftp.close()

client.close()`,
			caption:
				'SSH is a Swiss Army knife: shell access, file transfer, tunneling, and Git — all encrypted',
			alternatives: [
				{
					language: 'javascript',
					code: `const { Client } = require('ssh2');

const conn = new Client();
conn.on('ready', () => {
  console.log('Connected!');

  // Execute a command
  conn.exec('ls -la', (err, stream) => {
    stream.on('data', (data) => {
      console.log('Output:', data.toString());
    });
    stream.on('close', () => {
      // SFTP file transfer
      conn.sftp((err, sftp) => {
        sftp.fastPut('local.txt', '/home/user/remote.txt',
          () => conn.end());
      });
    });
  });
});

conn.connect({
  host: 'example.com',
  username: 'user',
  privateKey: require('fs').readFileSync(
    require('path').join(require('os').homedir(), '.ssh', 'id_ed25519')
  )
});`
				},
				{
					language: 'cli',
					code: `# Generate an SSH key pair
ssh-keygen -t ed25519 -C "you@example.com"

# Connect to a remote server
ssh user@example.com

# Port forward: access remote DB locally
ssh -L 5432:localhost:5432 user@db-server.com

# Copy files securely
scp file.txt user@example.com:/home/user/

# SSH tunnel (SOCKS proxy)
ssh -D 8080 user@example.com`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Banner Exchange',
							code: `Server → Client:
  SSH-2.0-OpenSSH_9.6

Client → Server:
  SSH-2.0-OpenSSH_9.6p1 Ubuntu-3

Server → Client (Key Exchange Init):
  Packet Length: 1508
  Padding Length: 6
  Message Code: SSH_MSG_KEXINIT (20)

  Cookie: 8f2a9d3b7c1e5f4a...
  KEX Algorithms:
    curve25519-sha256
    ecdh-sha2-nistp256
    diffie-hellman-group16-sha512
  Host Key Algorithms:
    ssh-ed25519
    ecdsa-sha2-nistp256
    rsa-sha2-512
  Encryption (client→server):
    chacha20-poly1305@openssh.com
    aes256-gcm@openssh.com
    aes128-gcm@openssh.com`
						},
						{
							title: 'Authentication',
							code: `Client → Server:
  SSH_MSG_USERAUTH_REQUEST (50)
    Username: "alice"
    Service: "ssh-connection"
    Method: "publickey"
    Algorithm: "ssh-ed25519"
    Public Key: AAAAC3NzaC1lZDI1NTE5...
    Signature: [64 bytes Ed25519]

Server → Client:
  SSH_MSG_USERAUTH_SUCCESS (52)

Client → Server:
  SSH_MSG_CHANNEL_OPEN (90)
    Channel Type: "session"
    Sender Channel: 0
    Initial Window: 2097152
    Max Packet: 32768`
						}
					]
				}
			]
		},
		performance: {
			latency: '1-2 RTTs for connection + key exchange + authentication',
			throughput: 'Hardware AES encryption; limited mainly by the network and remote system speed',
			overhead: 'Per-packet: ~28+ bytes (4 length + 1 padding length + padding + MAC). MAC size varies: HMAC-SHA1 = 20 bytes, HMAC-SHA2-256 = 32 bytes. AEAD ciphers (AES-GCM, ChaCha20-Poly1305) use a 16-byte authentication tag instead.'
		},
		connections: ['tcp', 'tls', 'ftp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Secure_Shell',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc4253'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Ssh_binary_packet_alt.svg/600px-Ssh_binary_packet_alt.svg.png',
			alt: 'Diagram of the SSH binary packet structure showing packet length, padding length, payload, padding, and MAC fields',
			caption:
				'The SSH binary packet structure — every SSH message is wrapped in this format. The payload is encrypted, random padding prevents traffic analysis, and the MAC (Message Authentication Code) ensures integrity. This is what makes SSH secure where Telnet was not.',
			credit: 'Image: Wikimedia Commons / CC BY 2.5'
		}
	},
	{
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
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Example_of_an_iterative_DNS_resolver.svg/600px-Example_of_an_iterative_DNS_resolver.svg.png',
			alt: 'Diagram showing iterative DNS resolution: client queries recursive resolver, which queries root, TLD, and authoritative nameservers in sequence',
			caption:
				'How DNS resolution works — your device asks a recursive resolver, which iteratively queries root servers, TLD servers (.com, .org), and authoritative nameservers to translate a domain name like "example.com" into an IP address.',
			credit: 'Image: Wikimedia Commons / Public Domain'
		}
	},
	{
		id: 'dhcp',
		name: 'Dynamic Host Configuration Protocol',
		abbreviation: 'DHCP',
		categoryId: 'utilities',
		port: 67,
		year: 1993,
		rfc: 'RFC 2131',
		oneLiner: "Automatically assigns IP addresses — plug in and you're on the network.",
		overview: `DHCP is the reason you can connect to a Wi-Fi network and immediately start browsing. Without it, you'd have to manually configure your {{ip-address|IP address}}, {{subnet|subnet mask}}, {{gateway|gateway}}, and DNS servers — for every network you join.

When your device connects to a network, it {{broadcast|broadcasts}} a DHCP Discover message ("I need an IP address!"). A DHCP server responds with an offer, which the client accepts. The server then confirms and assigns the IP, along with all the configuration your device needs: subnet mask, default gateway, [[dns|DNS]] servers, and the {{lease|lease}} duration.

DHCP leases are temporary — typically 1-24 hours. When a lease expires, the device must renew it. This dynamic allocation means IP addresses can be reused efficiently. DHCP is simple, ubiquitous, and works transparently — one of those "invisible" {{protocol|protocols}} that makes networking just work.

For IPv6 networks, DHCPv6 (RFC 8415) provides similar functionality but with a different message flow: Solicit/Advertise replaces Discover/Offer, and Request/Reply replaces Request/ACK. DHCPv6 also supports a stateless configuration mode (via SLAAC — Stateless Address Autoconfiguration) where hosts generate their own addresses and only use DHCPv6 for additional options like DNS server addresses.`,
		howItWorks: [
			{
				title: 'DISCOVER (broadcast)',
				description:
					'New device broadcasts to the entire network: "I need an IP address." It has no IP yet, so it uses 0.0.0.0 as source and 255.255.255.255 as destination.'
			},
			{
				title: 'OFFER',
				description:
					'DHCP server(s) respond with an offered IP address, subnet mask, gateway, DNS servers, and lease time. Multiple servers may offer.'
			},
			{
				title: 'REQUEST',
				description:
					'Client broadcasts its selection: "I\'ll take the offer from server X." This broadcast ensures other servers know their offer was declined.'
			},
			{
				title: 'ACK',
				description:
					"Selected server confirms with DHCP ACK. The client configures its network interface. Done — you're online. The entire process takes milliseconds."
			}
		],
		useCases: [
			'Home and office Wi-Fi networks',
			'Enterprise network management',
			'ISP customer IP assignment',
			'Container/VM orchestration',
			'Hotel and public Wi-Fi networks'
		],
		codeExample: {
			language: 'python',
			code: `from scapy.all import *

# Construct a DHCP Discover packet
dhcp_discover = (
    Ether(dst="ff:ff:ff:ff:ff:ff") /
    IP(src="0.0.0.0", dst="255.255.255.255") /
    UDP(sport=68, dport=67) /
    BOOTP(chaddr=get_if_hwaddr(conf.iface)) /
    DHCP(options=[
        ("message-type", "discover"),
        ("hostname", "my-device"),
        "end"
    ])
)

# Send and wait for DHCP Offer
ans = srp1(dhcp_discover, timeout=5, verbose=0)
if ans:
    offered_ip = ans[BOOTP].yiaddr
    print(f"Offered IP: {offered_ip}")`,
			caption:
				'Scapy lets you construct and send raw DHCP packets — see the DORA process in action',
			alternatives: [
				{
					language: 'javascript',
					code: `const dhcp = require('dhcp');

// Create a DHCP server
const server = dhcp.createServer({
  range: ['192.168.1.100', '192.168.1.200'],
  netmask: '255.255.255.0',
  router: ['192.168.1.1'],
  dns: ['8.8.8.8', '1.1.1.1'],
  server: '192.168.1.1',
  leaseTime: 3600  // 1 hour
});

server.on('bound', (state) => {
  console.log('Assigned:', state.address,
              'to', state.mac);
});

server.listen();`
				},
				{
					language: 'cli',
					code: `# Request a new DHCP lease
sudo dhclient -v eth0

# Release the current lease
sudo dhclient -r eth0

# View current DHCP lease details
cat /var/lib/dhcp/dhclient.leases

# Monitor DHCP traffic on the network
sudo tcpdump -i eth0 port 67 or port 68 -v

# Show current IP configuration (from DHCP)
ip addr show eth0`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'DISCOVER + OFFER',
							code: `DHCP DISCOVER:
  Op: BOOTREQUEST (1)
  HType: Ethernet (1)
  Transaction ID: 0x3903F326
  Client MAC: 00:1A:2B:3C:4D:5E
  Client IP: 0.0.0.0
  Your IP: 0.0.0.0
  Broadcast: 255.255.255.255

  Options:
    (53) Message Type: DISCOVER
    (55) Parameter Request:
      Subnet Mask, Router, DNS, Domain Name
    (61) Client Identifier: 00:1A:2B:3C:4D:5E

---

DHCP OFFER:
  Op: BOOTREPLY (2)
  Transaction ID: 0x3903F326
  Your IP: 192.168.1.100
  Server IP: 192.168.1.1

  Options:
    (53) Message Type: OFFER
    (1)  Subnet Mask: 255.255.255.0
    (3)  Router: 192.168.1.1
    (6)  DNS: 8.8.8.8, 8.8.4.4
    (51) Lease Time: 86400 (24 hours)
    (54) Server Identifier: 192.168.1.1`
						},
						{
							title: 'REQUEST + ACK',
							code: `DHCP REQUEST:
  Op: BOOTREQUEST (1)
  Transaction ID: 0x3903F326
  Client MAC: 00:1A:2B:3C:4D:5E
  Client IP: 0.0.0.0

  Options:
    (53) Message Type: REQUEST
    (50) Requested IP: 192.168.1.100
    (54) Server Identifier: 192.168.1.1

---

DHCP ACK:
  Op: BOOTREPLY (2)
  Transaction ID: 0x3903F326
  Your IP: 192.168.1.100

  Options:
    (53) Message Type: ACK
    (1)  Subnet Mask: 255.255.255.0
    (3)  Router: 192.168.1.1
    (6)  DNS: 8.8.8.8, 8.8.4.4
    (51) Lease Time: 86400
    (58) Renewal Time: 43200
    (59) Rebinding Time: 75600`
						}
					]
				}
			]
		},
		performance: {
			latency: 'Full DORA cycle: ~100-500ms. Renewal: single RTT.',
			throughput: 'Not applicable — DHCP is one-time configuration, not data transfer',
			overhead: 'Fixed BOOTP header is 236 bytes, but minimum on-wire DHCP frame is larger (300+ bytes with required options and Ethernet/IP/UDP headers). UDP-based, broadcast-heavy.'
		},
		connections: ['udp', 'dns', 'arp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc2131'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/DHCP_session.svg/600px-DHCP_session.svg.png',
			alt: 'Sequence diagram of the DHCP DORA process: Discover, Offer, Request, and Acknowledge messages between client and server',
			caption:
				'The DHCP DORA process — Discover (client broadcasts "I need an IP"), Offer (server proposes an address), Request (client accepts), Acknowledge (server confirms the lease). This four-step handshake happens every time a device joins a network.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
		}
	},
	{
		id: 'ntp',
		name: 'Network Time Protocol',
		abbreviation: 'NTP',
		categoryId: 'utilities',
		port: 123,
		year: 1985,
		rfc: 'RFC 5905',
		oneLiner: 'Keeps every device on Earth synchronized to the same clock.',
		overview: `NTP is one of the oldest protocols still in active use, and one of the most underappreciated. It synchronizes clocks across the internet to within milliseconds — a critical requirement for everything from log correlation to financial trading to [[tls|TLS]] {{certificate|certificate}} validation.

NTP uses a hierarchical system of time sources. Stratum 0 are atomic clocks and GPS receivers. Stratum 1 servers connect directly to these. Stratum 2 servers sync from Stratum 1, and so on. Your computer typically syncs from Stratum 2 or 3 servers (like pool.ntp.org).

The clever part is how NTP accounts for network {{latency|delay}}. It measures the {{rtt|round-trip time}} of its packets and mathematically compensates for the delay, achieving accuracy far beyond what simple "what time is it?" queries could provide.

NTP has been exploited for DDoS amplification attacks: the legacy \`monlist\` command could return a large list of recent clients in response to a small spoofed request, amplifying traffic by a factor of 500x or more. Modern NTP implementations disable \`monlist\` by default, and rate-limiting helps mitigate remaining abuse.`,
		howItWorks: [
			{
				title: 'Client sends request',
				description:
					'Client sends a UDP packet with its current timestamp (T1). The packet is tiny — 48 bytes.'
			},
			{
				title: 'Server timestamps receipt',
				description:
					'Server records when the packet arrives (T2) and when it sends the reply (T3). Both timestamps are included in the response.'
			},
			{
				title: 'Client timestamps response',
				description:
					'Client records when the response arrives (T4). Now it has four timestamps: T1 (sent), T2 (server received), T3 (server sent), T4 (received).'
			},
			{
				title: 'Calculate offset and delay',
				description:
					'Offset = ((T2-T1) + (T3-T4)) / 2. Delay = (T4-T1) - (T3-T2). The clock is adjusted gradually to avoid time jumps.'
			}
		],
		useCases: [
			'Operating system time synchronization',
			'Distributed system coordination (consensus protocols)',
			'Log timestamp correlation across servers',
			'Financial trading (regulatory time requirements)',
			'Certificate validity and expiration checking'
		],
		codeExample: {
			language: 'python',
			code: `import ntplib
from datetime import datetime

# Query an NTP server
client = ntplib.NTPClient()
response = client.request('pool.ntp.org', version=3)

# The response contains timing data for offset calculation
print(f"NTP time: {datetime.fromtimestamp(response.tx_time)}")
print(f"Offset:   {response.offset:.6f} seconds")
print(f"Delay:    {response.delay:.6f} seconds")
print(f"Stratum:  {response.stratum}")

# Offset tells you how far your clock is off
# Positive = your clock is behind, Negative = ahead`,
			caption:
				'ntplib queries an NTP server and calculates the clock offset using the four-timestamp algorithm',
			alternatives: [
				{
					language: 'javascript',
					code: `const NtpClient = require('ntp-client');

// Query an NTP server
NtpClient.getNetworkTime(
  'pool.ntp.org', 123, (err, date) => {
    const now = new Date();
    const offset = date.getTime() - now.getTime();

    console.log('NTP time:', date.toISOString());
    console.log('Local time:', now.toISOString());
    console.log('Offset:', offset, 'ms');
    console.log('Your clock is',
      offset > 0 ? 'behind' : 'ahead');
  }
);`
				},
				{
					language: 'cli',
					code: `# Query an NTP server manually
ntpdate -q pool.ntp.org

# Check NTP synchronization status (systemd)
timedatectl timesync-status

# Use chrony for modern NTP management
chronyc tracking     # Show current sync status
chronyc sources -v   # Show NTP servers and quality

# One-shot time sync (requires root)
sudo ntpdate pool.ntp.org`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Client Request',
							code: `NTP Packet (UDP port 123):
  Flags: 0x23
    LI: 0 (no warning)
    Version: 4
    Mode: 3 (Client)
  Stratum: 0 (unspecified)
  Poll Interval: 6 (64 seconds)
  Precision: -20 (≈1μs)

  Root Delay: 0.000000
  Root Dispersion: 0.000000
  Reference ID: (none)

  Reference Timestamp:  0
  Origin Timestamp:     0
  Receive Timestamp:    0
  Transmit Timestamp:   2024-03-13 14:30:00.123456 UTC`
						},
						{
							title: 'Server Response',
							code: `NTP Packet (UDP port 123):
  Flags: 0x24
    LI: 0 (no warning)
    Version: 4
    Mode: 4 (Server)
  Stratum: 1 (primary reference)
  Poll Interval: 6
  Precision: -24 (≈60ns)

  Root Delay: 0.000000
  Root Dispersion: 0.000122
  Reference ID: "GPS\\0"

  Reference Timestamp:  2024-03-13 14:29:55.000000
  Origin Timestamp:     2024-03-13 14:30:00.123456
  Receive Timestamp:    2024-03-13 14:30:00.123478
  Transmit Timestamp:   2024-03-13 14:30:00.123502

  Round-trip delay: 0.000044s
  Clock offset: +0.000022s`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Single UDP round trip. Synchronization accuracy: 1-50ms over internet, <1ms on LAN.',
			throughput: 'Polling interval: 64-1024 seconds. Negligible bandwidth.',
			overhead: '48-byte packets. One of the lightest protocols in existence.'
		},
		connections: ['udp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Network_Time_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc5905',
			official: 'https://www.ntp.org/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nist-f1.jpg/600px-Nist-f1.jpg',
			alt: 'NIST-F1 cesium fountain atomic clock at the National Institute of Standards and Technology',
			caption:
				'The NIST-F1 cesium fountain atomic clock — accurate to one second in 100 million years. Atomic clocks like this are the ultimate time source (Stratum 0) that NTP distributes to every device on the internet.',
			credit: 'Photo: NIST / Public Domain, via Wikimedia Commons'
		}
	},
	{
		id: 'smtp',
		name: 'Simple Mail Transfer Protocol',
		abbreviation: 'SMTP',
		categoryId: 'utilities',
		port: 587,
		year: 1982,
		rfc: 'RFC 5321',
		oneLiner:
			'The protocol that delivers email across the internet — store and forward, hop by hop.',
		overview: `SMTP is the backbone of email. Every email you've ever sent was delivered via SMTP — from your mail client to your provider's server, then relayed across the internet to the recipient's mail server. It's a "store and forward" protocol: each server along the path accepts responsibility for the message and forwards it to the next {{hop|hop}}.

SMTP is a text-based {{protocol|protocol}} with a simple command vocabulary: HELO/EHLO to greet, MAIL FROM to specify the sender, RCPT TO for recipients, DATA to send the message body, and QUIT to disconnect. Modern SMTP uses STARTTLS to upgrade plain connections to [[tls|TLS]]-encrypted ones, and authentication (SMTP AUTH) to prevent unauthorized sending.

Despite being over 40 years old, SMTP remains the universal standard for email delivery. It's been extended with SPF, DKIM, and DMARC to fight spam and phishing. While newer protocols handle retrieval (IMAP, POP3), SMTP still handles every email's journey from sender to destination.`,
		howItWorks: [
			{
				title: 'Connection & greeting',
				description:
					'Client connects to the mail server on port 587 (submission) or 25 (relay) and sends EHLO with its hostname. Server responds with supported extensions like STARTTLS and AUTH.'
			},
			{
				title: 'TLS & authentication',
				description:
					'Client issues STARTTLS to upgrade to an encrypted connection, then authenticates with username/password via AUTH LOGIN or AUTH PLAIN.'
			},
			{
				title: 'Envelope & message',
				description:
					'Client specifies sender (MAIL FROM), recipients (RCPT TO), then sends the message body after DATA command. The message includes headers (From, To, Subject) and the body text.'
			},
			{
				title: 'Relay & delivery',
				description:
					"The server accepts the message (250 OK) and relays it to the recipient's mail server by looking up MX records in DNS. Each hop stores and forwards until the message reaches the destination mailbox."
			}
		],
		useCases: [
			'Email delivery between mail servers',
			'Transactional emails (receipts, password resets, notifications)',
			'Newsletter and marketing email campaigns',
			'Automated alerts and monitoring notifications',
			'Application-generated email via SMTP relay services'
		],
		codeExample: {
			language: 'python',
			code: `import smtplib
from email.mime.text import MIMEText

msg = MIMEText("Hello from SMTP!")
msg["Subject"] = "Test Email"
msg["From"] = "sender@example.com"
msg["To"] = "recipient@example.com"

with smtplib.SMTP("smtp.example.com", 587) as server:
    server.starttls()
    server.login("sender@example.com", "password")
    server.send_message(msg)`,
			caption: "SMTP delivers email hop by hop — STARTTLS encrypts the connection.",
			alternatives: [
				{
					language: 'javascript',
					code: `import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: { user: 'sender@example.com', pass: 'password' }
});

await transporter.sendMail({
  from: 'sender@example.com',
  to: 'recipient@example.com',
  subject: 'Test Email',
  text: 'Hello from SMTP!'
});`
				},
				{
					language: 'cli',
					code: `# Send a test email with swaks
swaks --to recipient@example.com \\
  --from sender@example.com \\
  --server smtp.example.com:587 \\
  --tls --auth-user sender@example.com

# Send email with curl
curl --url 'smtp://smtp.example.com:587' \\
  --ssl-reqd \\
  --mail-from 'sender@example.com' \\
  --mail-rcpt 'recipient@example.com' \\
  --upload-file email.txt \\
  --user 'sender@example.com:password'

# Test SMTP server connectivity
openssl s_client -starttls smtp \\
  -connect smtp.example.com:587`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Session Transcript',
							code: `Server: 220 mail.example.com ESMTP Postfix
Client: EHLO client.example.com
Server: 250-mail.example.com
        250-PIPELINING
        250-SIZE 52428800
        250-STARTTLS
        250-AUTH PLAIN LOGIN
        250 8BITMIME
Client: STARTTLS
Server: 220 2.0.0 Ready to start TLS

  [TLS handshake occurs]

Client: EHLO client.example.com
Client: AUTH PLAIN AGFsaWNlAHNlY3JldA==
Server: 235 2.7.0 Authentication successful
Client: MAIL FROM:<alice@example.com>
Server: 250 2.1.0 Ok
Client: RCPT TO:<bob@example.com>
Server: 250 2.1.5 Ok
Client: DATA
Server: 354 End data with <CR><LF>.<CR><LF>
Client: From: alice@example.com
        To: bob@example.com
        Subject: Meeting Tomorrow
        Date: Wed, 13 Mar 2024 10:30:00 -0700
        MIME-Version: 1.0
        Content-Type: text/plain; charset=UTF-8

        Hi Bob, are we still on for 3pm?
        .
Server: 250 2.0.0 Ok: queued as ABC123
Client: QUIT
Server: 221 2.0.0 Bye`
						}
					]
				}
			]
		},
		performance: {
			latency: 'Seconds to minutes (store and forward)',
			throughput: 'Millions of messages/day at scale',
			overhead: 'Moderate — DNS lookups, TLS, multi-hop relay'
		},
		connections: ['tcp', 'tls', 'dns', 'imap'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc5321'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/Email.svg/600px-Email.svg.png',
			alt: 'Diagram showing the flow of email from sender through SMTP servers and DNS MX lookups to the recipient mailbox',
			caption:
				'How email flows across the internet — the sender\'s mail client submits to an SMTP server, which looks up the recipient\'s domain via DNS MX records and relays the message hop by hop until it reaches the destination mailbox.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
		}
	},
	{
		id: 'ftp',
		name: 'File Transfer Protocol',
		abbreviation: 'FTP',
		categoryId: 'utilities',
		port: 21,
		year: 1971,
		rfc: 'RFC 959',
		oneLiner:
			'One of the oldest internet protocols — built for transferring files between machines.',
		overview: `FTP is one of the original internet protocols, predating even TCP/IP itself. It was designed for one purpose: moving files between computers. FTP uses a unique dual-connection architecture — a control connection for commands and a separate data connection for file transfers.

The control channel ({{port|port}} 21) carries text commands like USER, PASS, LIST, RETR (download), and STOR (upload). When a file transfer begins, a separate data connection opens on a different port. In "active" mode, the server connects back to the client; in "passive" mode (PASV), the client initiates both connections, which works better with {{firewall|firewalls}} and {{nat|NAT}}.

While FTP's {{plaintext|plain-text}} design makes it insecure by modern standards, FTPS (FTP over [[tls|TLS]]) adds {{encryption|encryption}}. SFTP ([[ssh|SSH]] File Transfer Protocol) is a completely different protocol that runs over [[ssh|SSH]]. Despite being largely superseded by SFTP, SCP, and [[http1|HTTP]]-based file transfer, FTP remains in use for legacy systems, firmware updates, and bulk file hosting.`,
		howItWorks: [
			{
				title: 'Control connection',
				description:
					'Client connects to server port 21 and authenticates with USER and PASS commands. This connection stays open for the entire session, carrying all commands and responses.'
			},
			{
				title: 'Directory navigation',
				description:
					'Client browses the remote filesystem with CWD (change directory), PWD (print working directory), and LIST (directory listing). All commands are human-readable text.'
			},
			{
				title: 'Data connection',
				description:
					'For file transfers, a separate TCP connection opens. In passive mode (PASV), the server tells the client which port to connect to. This separates control flow from data flow.'
			},
			{
				title: 'File transfer',
				description:
					'Client issues RETR (download) or STOR (upload). Data flows on the data connection in binary or ASCII mode. After transfer completes, the data connection closes while control stays open.'
			}
		],
		useCases: [
			'Legacy system file transfers and mainframe integration',
			'Bulk file hosting and public archives',
			'Firmware and software distribution',
			'Automated batch file uploads/downloads',
			'Web hosting file management (traditional hosting providers)'
		],
		codeExample: {
			language: 'python',
			code: `from ftplib import FTP

ftp = FTP('ftp.example.com')
ftp.login('username', 'password')

# List directory
ftp.retrlines('LIST')

# Download a file
with open('local_file.txt', 'wb') as f:
    ftp.retrbinary('RETR remote_file.txt', f.write)

# Upload a file
with open('upload.txt', 'rb') as f:
    ftp.storbinary('STOR upload.txt', f)

ftp.quit()`,
			caption: "FTP uses dual connections — control channel for commands, data channel for transfers.",
			alternatives: [
				{
					language: 'javascript',
					code: `import ftp from 'basic-ftp';

const client = new ftp.Client();
await client.access({
  host: 'ftp.example.com',
  user: 'username',
  password: 'password',
  secure: true  // FTPS
});

// List directory
const files = await client.list();
files.forEach(f => console.log(f.name, f.size));

// Download a file
await client.downloadTo('local_file.txt', 'remote_file.txt');

// Upload a file
await client.uploadFrom('upload.txt', 'upload.txt');

client.close();`
				},
				{
					language: 'cli',
					code: `# Download a file
curl -u user:pass ftp://ftp.example.com/file.txt -o file.txt

# Upload a file
curl -u user:pass -T upload.txt ftp://ftp.example.com/

# List directory
curl -u user:pass ftp://ftp.example.com/

# FTPS (FTP over TLS)
curl --ftp-ssl -u user:pass ftp://ftp.example.com/

# Interactive FTP session
lftp -u user,pass ftp.example.com`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Session Transcript',
							code: `Server: 220 ftp.example.com FTP server ready
Client: USER alice
Server: 331 Password required for alice
Client: PASS ••••••••
Server: 230 User alice logged in
Client: SYST
Server: 215 UNIX Type: L8
Client: PWD
Server: 257 "/" is the current directory
Client: TYPE I
Server: 200 Type set to I (binary)
Client: PASV
Server: 227 Entering Passive Mode (93,184,216,34,195,149)
  → Data connection: 93.184.216.34:50069
Client: LIST
Server: 150 Opening data connection for file list
  (data connection):
    drwxr-xr-x  2 alice users  4096 Mar 13 docs/
    -rw-r--r--  1 alice users 15234 Mar 12 report.pdf
    -rw-r--r--  1 alice users  8192 Mar 11 data.csv
Server: 226 Transfer complete
Client: RETR report.pdf
Server: 150 Opening BINARY mode data connection
  (data connection): [15234 bytes transferred]
Server: 226 Transfer complete
Client: QUIT
Server: 221 Goodbye`
						}
					]
				}
			]
		},
		performance: {
			latency: 'Connection setup + transfer time',
			throughput: 'Line-speed for data channel',
			overhead: 'Dual connection (control + data channels)'
		},
		connections: ['tcp', 'tls', 'ssh'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/File_Transfer_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc959'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Passive_FTP_Verbindung.svg/600px-Passive_FTP_Verbindung.svg.png',
			alt: 'Diagram showing FTP passive mode connection flow: client connects to control port 21, then server provides a data port for the client to connect to',
			caption:
				'FTP passive mode — the client connects to port 21 for commands, then the server tells the client which high port to connect to for data transfer. Passive mode solved the NAT/firewall problems that plagued FTP\'s original active mode.',
			credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
		}
	},
	{
		id: 'imap',
		name: 'Internet Message Access Protocol',
		abbreviation: 'IMAP',
		categoryId: 'utilities',
		port: 993,
		year: 1986,
		rfc: 'RFC 9051',
		oneLiner:
			'Access and manage email on the server — read, search, and organize without downloading.',
		overview: `IMAP is how your email client reads messages from the server while keeping them stored remotely. Unlike POP3 (which downloads and deletes), IMAP keeps all mail on the server — so your phone, laptop, and webmail all see the same inbox, the same folders, and the same read/unread state. IMAP uses port 143 for plaintext connections (with optional STARTTLS upgrade) or port 993 for IMAPS (implicit TLS).

The key insight is IMAP's tagged command-response {{protocol|protocol}}. Every command gets a unique tag (A001, A002...) and the server's response includes the same tag. This means you can pipeline commands — send A002 before A001's response arrives — because tags match responses to commands unambiguously.

IMAP's FETCH command is remarkably flexible: you can request just message {{header|headers}}, just the text body, or individual MIME attachments — without downloading the entire message. Server-side SEARCH lets you find messages by sender, date, subject, or full-text content without transferring anything. The IDLE command keeps a persistent connection open for push notifications when new mail arrives.

[[smtp|SMTP]] sends email, IMAP receives it — together they form the complete email system. IMAP connections are {{encryption|encrypted}} with [[tls|TLS]] (IMAPS on {{port|port}} 993) and ride over [[tcp|TCP]] for reliable delivery of the tagged command-response dialogue.`,
		howItWorks: [
			{
				title: 'Connect & authenticate',
				description:
					'Client connects to port 993 (IMAPS with TLS) and authenticates with LOGIN or a SASL mechanism like OAUTH2. The server grants access to the user\'s mailboxes.'
			},
			{
				title: 'SELECT mailbox',
				description:
					'Client selects a mailbox (INBOX, Drafts, Sent, etc.). Server reports message count, recent messages, available flags, and UIDVALIDITY for cache validation.'
			},
			{
				title: 'FETCH messages',
				description:
					'Client requests message envelopes, headers, or full bodies. IMAP can fetch parts of messages — just headers, just text, or individual attachments — without downloading everything.'
			},
			{
				title: 'SEARCH & STORE',
				description:
					'Client searches server-side (SEARCH FROM "alice" SINCE 1-Mar-2024) and modifies flags (\\Seen, \\Flagged, \\Deleted) without transferring message content.'
			},
			{
				title: 'IDLE for push',
				description:
					'Client enters IDLE mode — server pushes notifications when new mail arrives or flags change. This is how "push email" works on IMAP, keeping the connection open for real-time updates.'
			}
		],
		useCases: [
			'Email clients syncing across multiple devices (phone, laptop, tablet)',
			'Webmail interfaces (Gmail, Outlook.com, Yahoo Mail)',
			'Server-side email search and filtering',
			'Corporate email with shared mailboxes and folders',
			'Automated email processing and monitoring scripts'
		],
		codeExample: {
			language: 'python',
			code: `import imaplib

# Connect to IMAP server over TLS
with imaplib.IMAP4_SSL('imap.example.com') as mail:
    mail.login('user@example.com', 'password')
    mail.select('INBOX')

    # Search for unread messages
    _, nums = mail.search(None, 'UNSEEN')
    for num in nums[0].split():
        _, data = mail.fetch(num, '(ENVELOPE)')
        print(data[0][1])

    mail.logout()`,
			caption:
				'IMAP lets you search and fetch email on the server — no need to download everything',
			alternatives: [
				{
					language: 'javascript',
					code: `import Imap from 'imap';

const imap = new Imap({
  user: 'user@example.com',
  password: 'password',
  host: 'imap.example.com',
  port: 993, tls: true
});

imap.once('ready', () => {
  imap.openBox('INBOX', true, (err, box) => {
    console.log(box.messages.total + ' messages');
    const f = imap.seq.fetch('1:3', {
      bodies: 'HEADER.FIELDS (FROM SUBJECT DATE)'
    });
    f.on('message', msg => {
      msg.on('body', stream =>
        stream.pipe(process.stdout));
    });
  });
});
imap.connect();`
				},
				{
					language: 'cli',
					code: `# Connect to IMAP server with openssl
openssl s_client -connect imap.example.com:993

# Manual IMAP session (type these commands):
A001 LOGIN user@example.com password
A002 SELECT INBOX
A003 FETCH 1:5 (FLAGS ENVELOPE)
A004 SEARCH UNSEEN FROM "alice"
A005 FETCH 3 (BODY[TEXT])
A006 STORE 3 +FLAGS (\\Seen)
A007 LOGOUT`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Tagged Commands',
							code: `Client: A001 LOGIN user@example.com ****
Server: A001 OK LOGIN completed

Client: A002 SELECT INBOX
Server: * 47 EXISTS
Server: * 2 RECENT
Server: * FLAGS (\\Seen \\Answered \\Flagged \\Deleted \\Draft)
Server: * OK [UIDVALIDITY 1234567890]
Server: A002 OK [READ-WRITE] SELECT completed`
						},
						{
							title: 'Fetch & IDLE',
							code: `Client: A003 FETCH 47 (ENVELOPE BODY[TEXT])
Server: * 47 FETCH (ENVELOPE ("14-Mar-2026"
  "Meeting Tomorrow"
  (("Alice" NIL "alice" "example.com"))
  (("Bob" NIL "bob" "example.com")))
  BODY[TEXT] {42}
  Hi Bob, see you at 10am tomorrow.
  )
Server: A003 OK FETCH completed

Client: A004 IDLE
Server: + idling
  ... server pushes: * 48 EXISTS`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'LOGIN + SELECT: ~200ms. FETCH single message: ~50-100ms. IDLE: persistent connection with instant push.',
			throughput:
				'Designed for interactive use, not bulk transfer. Partial FETCH avoids downloading large attachments.',
			overhead:
				'Text-based tagged protocol. Each command/response pair includes tag and status. Minimal framing overhead.'
		},
		connections: ['tcp', 'tls', 'smtp', 'dns'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Internet_Message_Access_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc9051'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/Alpine_email_client.png/600px-Alpine_email_client.png',
			alt: 'Screenshot of the Alpine email client showing threaded message view in a terminal interface',
			caption:
				"Alpine email client (2009) — the successor to Pine, developed at the University of Washington by Mark Crispin's team. Pine was the reference implementation for the IMAP protocol, proving that server-side mail access could work across any device.",
			credit: 'Image: University of Washington / Apache License 2.0, via Wikimedia Commons'
		}
	},
	{
		id: 'bgp',
		name: 'Border Gateway Protocol',
		abbreviation: 'BGP',
		categoryId: 'network-foundations',
		port: 179,
		year: 1989,
		rfc: 'RFC 4271',
		oneLiner:
			'The routing protocol of the internet — how autonomous systems find paths to each other.',
		overview: `BGP is the protocol that holds the internet together. The internet isn't a single network — it's a network of networks, each called an Autonomous System (AS). Your ISP is an AS. Google is an AS. Amazon, universities, governments — each is an AS with its own number. BGP is how they learn to reach each other.

When you visit a website, your {{packet|packets}} may cross 5-10 different autonomous systems. BGP is the protocol that calculated that path. Each BGP router maintains a {{routing-table|table}} of every reachable IP prefix on the internet (~1 million entries) along with the AS_PATH — the sequence of autonomous systems to traverse. BGP is a path-vector protocol: it doesn't just know the next hop, it knows the entire AS-level path.

BGP runs over [[tcp|TCP]] port 179, relying on TCP's reliable delivery because routing information must never be lost or corrupted. Two BGP routers ("peers") establish a session by exchanging OPEN messages, then continuously exchange UPDATE messages as routes are announced or withdrawn. {{keep-alive|KEEPALIVE}} messages every ~30 seconds prove the peer is still alive.

A fundamental distinction in BGP is between eBGP (External BGP) and iBGP (Internal BGP). eBGP runs between routers in different autonomous systems — this is the inter-domain routing that connects the internet. iBGP runs between routers within the same AS, distributing externally learned routes internally. The two behave differently: eBGP modifies the AS_PATH on each hop, while iBGP does not, requiring either a full mesh of iBGP peers or route reflectors to prevent loops.

The consequences of BGP mistakes are enormous. The Facebook outage of October 2021 — which took down Facebook, Instagram, and WhatsApp for six hours — was caused by a BGP misconfiguration that withdrew all of Facebook's routes from the internet. BGP route hijacks, where an AS announces routes it doesn't own, can redirect traffic through malicious networks.`,
		howItWorks: [
			{
				title: 'TCP session establishment',
				description:
					'BGP peers open a TCP connection on port 179. Unlike most protocols, BGP uses TCP for reliability — routing information must never be lost, duplicated, or reordered.'
			},
			{
				title: 'OPEN exchange',
				description:
					'Both routers exchange OPEN messages containing their AS number, BGP identifier (router IP), proposed hold time, and supported capabilities like 4-byte AS numbers.'
			},
			{
				title: 'KEEPALIVE confirmation',
				description:
					'Each router confirms the session with a KEEPALIVE (the smallest BGP message — just 19 bytes). The session enters the Established state and route exchange begins.'
			},
			{
				title: 'UPDATE announcements',
				description:
					'Routers exchange UPDATE messages containing reachable prefixes (NLRI) with path attributes: AS_PATH, NEXT_HOP, LOCAL_PREF, MED. Each UPDATE can announce new routes or withdraw old ones.'
			},
			{
				title: 'Ongoing operation',
				description:
					'Routers send KEEPALIVEs every ~30 seconds to prove liveness. UPDATEs flow whenever routes change. NOTIFICATION messages signal fatal errors and close the session.'
			}
		],
		useCases: [
			'Internet backbone routing between ISPs and content providers',
			'Enterprise multi-homing (connecting to multiple ISPs for redundancy)',
			'Cloud provider network peering (AWS, Google, Azure edge networks)',
			'Internet Exchange Point (IXP) route exchange',
			'Content delivery network (CDN) anycast routing'
		],
		codeExample: {
			language: 'python',
			code: `# ExaBGP — programmatic BGP route announcements
# exabgp.conf:
neighbor 10.0.0.2 {
    router-id 10.0.0.1;
    local-as 65001;
    peer-as 65002;

    static {
        route 192.168.0.0/16 next-hop self;
        route 10.10.0.0/24 next-hop self
            community 65001:100;
    }
}`,
			caption:
				'BGP is typically configured on routers — ExaBGP allows programmatic control from Python',
			alternatives: [
				{
					language: 'cli',
					code: `# Cisco IOS BGP configuration
router bgp 65001
  neighbor 10.0.0.2 remote-as 65002
  network 192.168.0.0 mask 255.255.0.0

# Show BGP routing table
show ip bgp

# Show BGP neighbor status
show ip bgp summary

# View path to specific prefix
show ip bgp 172.16.0.0/12

# Debug BGP updates
debug ip bgp updates`
				},
				{
					language: 'javascript',
					code: `// Parse BGP MRT dump data with bgpkit
import { BgpkitParser } from 'bgpkit-parser';

const parser = new BgpkitParser(
  'rib.20240101.0000.bz2'
);

for await (const elem of parser) {
  console.log(
    elem.prefix,
    'via AS path:', elem.as_path,
    'from peer:', elem.peer_asn
  );
}`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'OPEN Message',
							code: `BGP OPEN:
  Marker: FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF FF
  Length: 41
  Type: OPEN (1)
  Version: 4
  My AS: 65001
  Hold Time: 90
  BGP Identifier: 10.0.0.1
  Optional Parameters:
    Capability: 4-byte ASN support
    Capability: Route Refresh`
						},
						{
							title: 'UPDATE Message',
							code: `BGP UPDATE:
  Marker: FF FF FF FF (16 bytes)
  Length: 52
  Type: UPDATE (2)
  Withdrawn Routes Length: 0
  Path Attributes:
    ORIGIN: IGP
    AS_PATH: 65001
    NEXT_HOP: 10.0.0.1
    LOCAL_PREF: 100
  NLRI (reachable):
    192.168.0.0/16`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Session setup: seconds (TCP handshake + OPEN exchange). Convergence after change: seconds to minutes depending on network size and policy.',
			throughput:
				'Full internet routing table: ~1M IPv4 prefixes. Initial table transfer can take 30-60 seconds between peers.',
			overhead:
				'19-byte minimum header (16-byte marker + 2-byte length + 1-byte type). UPDATE messages vary by prefix count and path attributes.'
		},
		connections: ['tcp', 'dns', 'ip'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Border_Gateway_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc4271'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/ARPA_Network%2C_Logical_Map%2C_September_1973.jpg/600px-ARPA_Network%2C_Logical_Map%2C_September_1973.jpg',
			alt: 'ARPA Network logical map from September 1973 showing network nodes and satellite links',
			caption:
				'ARPANET logical map, September 1973 — showing the early internet backbone topology including satellite links to Hawaii and London. BGP was created in 1989 to replace the original routing protocols that managed networks like this one.',
			credit: 'Image: Bolt Beranek and Newman Inc. / Public Domain, via Wikimedia Commons'
		}
	},
	{
		id: 'icmp',
		name: 'Internet Control Message Protocol',
		abbreviation: 'ICMP',
		categoryId: 'network-foundations',
		port: undefined,
		year: 1981,
		rfc: 'RFC 792',
		oneLiner:
			'The diagnostic protocol behind ping and traceroute — how the network reports errors.',
		overview: `ICMP is the internet's error-reporting and diagnostic protocol. When you type \`ping google.com\`, ICMP Echo Request and Reply messages measure whether the target is reachable and how long the {{rtt|round trip}} takes. When you run \`traceroute\`, ICMP Time Exceeded messages reveal each {{hop|hop}} along the path. ICMP is arguably the most universally used protocol in network troubleshooting.

Unlike [[tcp|TCP]] or UDP, ICMP doesn't use {{port|ports}}. It's {{encapsulation|encapsulated}} directly in IP {{packet|packets}} with protocol number 1 — sitting at the network layer, not the transport layer. This means ICMP can report problems that TCP and UDP can't even see: unreachable networks, expired {{ttl|TTLs}}, {{fragmentation|fragmentation}} issues, and routing redirects.

Every router on the internet speaks ICMP. When a router can't deliver a packet, it sends an ICMP Destination Unreachable (Type 3) back to the sender, with codes specifying why: network unreachable, host unreachable, port unreachable, or "fragmentation needed but don't-fragment flag is set" (which is essential for Path MTU Discovery).

ICMP is also controversial. Many {{firewall|firewalls}} block ICMP to prevent reconnaissance, but this breaks legitimate diagnostics and can cause subtle problems like Path MTU Discovery failures. The debate over whether to filter ICMP has been going on for decades — and ICMP's designers would argue it should never be blocked.

IPv6 uses a separate specification called ICMPv6 (RFC 4443) with different type numbers and additional functionality. ICMPv6 is more critical than its IPv4 counterpart because it incorporates Neighbor Discovery Protocol (NDP), which replaces ARP for address resolution and handles router discovery, address autoconfiguration, and duplicate address detection.`,
		howItWorks: [
			{
				title: 'Echo Request (ping)',
				description:
					'Source sends an ICMP Type 8 packet to the target with an Identifier (session ID), Sequence number, and optional data payload. No TCP or UDP — just IP + ICMP.'
			},
			{
				title: 'Echo Reply',
				description:
					'If reachable, the target replies with ICMP Type 0 containing the same Identifier, Sequence, and data. Round-trip time is measured from send to receive.'
			},
			{
				title: 'Destination Unreachable',
				description:
					'When a router cannot deliver a packet, it sends Type 3 back to the sender. Code values specify why: 0=Network Unreachable, 1=Host Unreachable, 2=Protocol Unreachable, 3=Port Unreachable, 4=Fragmentation Needed.'
			},
			{
				title: 'Time Exceeded (traceroute)',
				description:
					'When a packet\'s TTL reaches zero, the router sends Type 11 back. Traceroute exploits this by sending packets with incrementing TTL values (1, 2, 3...) to discover each hop.'
			},
			{
				title: 'Redirect',
				description:
					'Type 5 tells a host to use a better next-hop router. If a router receives a packet and knows a more direct path, it sends a Redirect to optimize future traffic.'
			}
		],
		useCases: [
			'Network reachability testing (ping)',
			'Path discovery and latency measurement (traceroute/tracert)',
			'Network troubleshooting and diagnostics',
			'Path MTU Discovery (Packet Too Big messages)',
			'Router signaling and redirect optimization'
		],
		codeExample: {
			language: 'python',
			code: `import socket
import struct
import time

def checksum(data):
    s = 0
    for i in range(0, len(data), 2):
        w = data[i] + (data[i+1] << 8)
        s = s + w
    s = (s >> 16) + (s & 0xffff)
    s = s + (s >> 16)
    return ~s & 0xffff

def ping(host):
    sock = socket.socket(
        socket.AF_INET,
        socket.SOCK_RAW,
        socket.IPPROTO_ICMP
    )
    # Build ICMP Echo Request (Type 8)
    icmp_type, code = 8, 0
    ident, seq = 0x1234, 1
    header = struct.pack(
        '!BBHHH', icmp_type, code, 0, ident, seq
    )
    data = b'ping payload'
    # Calculate checksum and rebuild
    cksum = checksum(header + data)
    header = struct.pack(
        '!BBHHH', icmp_type, code, cksum, ident, seq
    )
    sock.sendto(header + data, (host, 0))
    start = time.time()
    reply = sock.recv(1024)
    rtt = (time.time() - start) * 1000
    print(f"Reply from {host}: time={rtt:.1f}ms")`,
			caption:
				'ICMP requires raw sockets — it operates at the network layer, below TCP/UDP',
			alternatives: [
				{
					language: 'cli',
					code: `# Ping — ICMP Echo Request/Reply
ping -c 4 example.com
# PING example.com: 64 bytes, seq=1, ttl=56, time=12.3ms

# Traceroute — ICMP Time Exceeded
traceroute example.com
#  1  router.local (192.168.1.1)  1.2ms
#  2  isp-gw.net (10.0.0.1)      5.4ms
#  3  example.com (93.184.216.34) 12.1ms

# MTU Path Discovery
ping -M do -s 1472 example.com

# Continuous ping with timestamps
ping -D example.com`
				},
				{
					language: 'javascript',
					code: `import { exec } from 'child_process';
import { promisify } from 'util';
const run = promisify(exec);

// Node.js can't send raw ICMP without
// native modules — use system ping
const { stdout } = await run(
  'ping -c 4 example.com'
);
const times = stdout
  .match(/time=([\\d.]+)/g)
  ?.map(t => parseFloat(
    t.replace('time=', '')
  ));
console.log('RTTs:', times, 'ms');
console.log('Avg:', (times.reduce(
  (a, b) => a + b) / times.length
).toFixed(1), 'ms');`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Echo Request / Reply',
							code: `ICMP Echo Request:
  Type: 8 (Echo Request)
  Code: 0
  Checksum: 0x4D2A
  Identifier: 0x1234
  Sequence: 1
  Data: 48 65 6C 6C 6F ("Hello")

ICMP Echo Reply:
  Type: 0 (Echo Reply)
  Code: 0
  Checksum: 0x552A
  Identifier: 0x1234  (echoed)
  Sequence: 1         (echoed)
  Data: 48 65 6C 6C 6F ("Hello" echoed back)`
						},
						{
							title: 'Time Exceeded (Traceroute)',
							code: `ICMP Time Exceeded:
  Type: 11 (Time Exceeded)
  Code: 0 (TTL expired in transit)
  Checksum: 0x3B1F
  Unused: 0x00000000
  --- Original IP Header ---
  Src: 192.168.1.100
  Dst: 93.184.216.34
  Protocol: 1 (ICMP)
  TTL: 1 (was 1, decremented to 0)
  --- First 8 bytes of original ICMP ---
  Type: 8, Code: 0, ID: 0x1234, Seq: 1`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Ping RTT depends on network distance: <1ms LAN, 1-20ms continental, 100-300ms intercontinental. Processing overhead is negligible.',
			throughput:
				'Not applicable — ICMP is for diagnostics, not data transfer. Most routers rate-limit ICMP to prevent abuse.',
			overhead:
				'8-byte ICMP header (Type, Code, Checksum, Id, Seq) encapsulated in IP. Minimal by design — diagnostics should be lightweight.'
		},
		connections: ['dns', 'tcp', 'ip', 'ipv6'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Internet_Control_Message_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc792'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/99/DEC_VT100_terminal.jpg/600px-DEC_VT100_terminal.jpg',
			alt: 'DEC VT100 terminal at the Living Computer Museum, connected to a DEC PDP-11/70',
			caption:
				"A DEC VT100 terminal — the type of terminal where early network administrators ran ping and traceroute, the quintessential ICMP diagnostic tools. ICMP was defined in 1981, and these terminals were the window into the network.",
			credit: 'Photo: Jason Scott / CC BY 2.0, via Wikimedia Commons'
		}
	},
	{
		id: 'oauth2',
		name: 'OAuth 2.0',
		abbreviation: 'OAuth',
		categoryId: 'utilities',
		port: 443,
		year: 2012,
		rfc: 'RFC 6749',
		oneLiner:
			'Delegated authorization for the modern web — let apps access your data without sharing your password.',
		overview: `OAuth 2.0 is the authorization framework that powers "Sign in with Google," "Connect your GitHub," and virtually every third-party integration on the modern web. Instead of handing your password to an application, OAuth lets you grant it a scoped, time-limited {{access-token|access token}} — the app can read your repos but not delete them, view your calendar but not your email. Your credentials never leave the identity provider.

The core mechanism is the authorization code flow. When you click "Sign in with GitHub," you're redirected to GitHub's authorization server. You authenticate there (not on the app), review what permissions the app is requesting, and consent. GitHub redirects you back to the app with a short-lived authorization code. The app exchanges this code — along with a PKCE (Proof Key for Code Exchange) code verifier to prevent interception — for an access token and a refresh token. Access tokens are short-lived (minutes to hours); when they expire, the app uses the refresh token to silently obtain a new one without bothering the user.

A critical distinction: OAuth is an authorization {{protocol|protocol}} (what you can access), not an authentication protocol (who you are). Knowing that a token grants read access to someone's repos doesn't tell you who that someone is. OpenID Connect (OIDC) is a thin identity layer built on top of OAuth that adds authentication — it returns an ID token (a {{jwt|JWT}}) containing the user's identity. Together, OAuth + OIDC secure [[rest|REST]] APIs across the web, all running over [[tls|TLS]] on top of [[http1|HTTP]] and [[tcp|TCP]].`,
		howItWorks: [
			{
				title: 'Authorization request',
				description:
					'App redirects the user to the authorization server with client_id, requested scope, a random state parameter for CSRF protection, and a PKCE code_challenge derived from a secret code_verifier.'
			},
			{
				title: 'User consent',
				description:
					'The authorization server authenticates the user (login page) and presents a consent screen showing what the app is requesting. The app never sees the user\'s credentials.'
			},
			{
				title: 'Authorization code',
				description:
					'After the user consents, the authorization server redirects back to the app\'s redirect_uri with a short-lived authorization code and the original state parameter for CSRF verification.'
			},
			{
				title: 'Token exchange',
				description:
					'The app sends the authorization code along with the PKCE code_verifier to the token endpoint. The server validates the PKCE proof and returns an access token (short-lived) and a refresh token (long-lived).'
			},
			{
				title: 'API access',
				description:
					'The app calls resource APIs with an "Authorization: Bearer {token}" header. The API server validates the token\'s signature, expiry, and scopes before returning protected data.'
			}
		],
		useCases: [
			'Social login ("Sign in with Google/GitHub/Apple")',
			'Third-party API access (GitHub Apps, Slack integrations, Google APIs)',
			'Mobile and single-page app authorization',
			'Microservice-to-microservice authentication (client_credentials grant)',
			'Scoped access control for REST APIs'
		],
		codeExample: {
			language: 'python',
			code: `from authlib.integrations.requests_client import OAuth2Session
from authlib.oauth2.rfc7636 import create_s256_code_challenge

# Configure the OAuth 2.0 client
client = OAuth2Session(
    client_id='your-client-id',
    client_secret='your-client-secret',
    redirect_uri='http://localhost:8080/callback',
    scope='read:user repo'
)

# Step 1: Generate authorization URL with PKCE
code_verifier = client.create_s256_code_verifier()
code_challenge = create_s256_code_challenge(code_verifier)
uri, state = client.create_authorization_url(
    'https://github.com/login/oauth/authorize',
    code_verifier=code_verifier,
    code_challenge=code_challenge,
    code_challenge_method='S256'
)
print(f"Visit: {uri}")

# Step 2: After user consents and is redirected back,
# exchange the authorization code for tokens
token = client.fetch_token(
    'https://github.com/login/oauth/access_token',
    authorization_response=callback_url
)
print(f"Access token: {token['access_token'][:20]}...")
print(f"Expires in: {token['expires_in']}s")

# Step 3: Use the token to access protected APIs
resp = client.get('https://api.github.com/user')
print(f"Hello, {resp.json()['login']}!")`,
			caption:
				'OAuth lets apps access your data with scoped tokens — your password never leaves the identity provider',
			alternatives: [
				{
					language: 'javascript',
					code: `import * as oauth from 'oauth4webapi';

// Discover the authorization server metadata
const issuer = new URL('https://accounts.google.com');
const metadata = await oauth
  .discoveryRequest(issuer)
  .then((r) => oauth.processDiscoveryResponse(issuer, r));

// Configure client
const client = {
  client_id: 'your-client-id',
  token_endpoint_auth_method: 'none' // public client (SPA)
};

// Step 1: Build authorization URL with PKCE
const code_verifier = oauth.generateRandomCodeVerifier();
const code_challenge = await oauth
  .calculatePKCECodeChallenge(code_verifier);

const authUrl = new URL(metadata.authorization_endpoint);
authUrl.searchParams.set('client_id', client.client_id);
authUrl.searchParams.set('redirect_uri', 'http://localhost:3000/cb');
authUrl.searchParams.set('response_type', 'code');
authUrl.searchParams.set('scope', 'openid profile email');
authUrl.searchParams.set('code_challenge', code_challenge);
authUrl.searchParams.set('code_challenge_method', 'S256');

// Step 2: After redirect, exchange code for tokens
const params = oauth.validateAuthResponse(
  metadata, client, new URL(window.location.href)
);
const tokenResponse = await oauth.authorizationCodeGrantRequest(
  metadata, client, params, 'http://localhost:3000/cb',
  code_verifier
);
const tokens = await oauth.processAuthorizationCodeResponse(
  metadata, client, tokenResponse
);
console.log('Access token:', tokens.access_token);`
				},
				{
					language: 'cli',
					code: `# Step 1: Direct the user to the authorization URL
# (In practice, this is a browser redirect)
open "https://github.com/login/oauth/authorize?\\
  client_id=YOUR_CLIENT_ID&\\
  redirect_uri=http://localhost:8080/callback&\\
  scope=read:user%20repo&\\
  state=random_csrf_token&\\
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&\\
  code_challenge_method=S256"

# Step 2: Exchange authorization code for tokens
curl -s -X POST https://github.com/login/oauth/access_token \\
  -H "Accept: application/json" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "code=AUTHORIZATION_CODE" \\
  -d "code_verifier=YOUR_CODE_VERIFIER" \\
  -d "redirect_uri=http://localhost:8080/callback" | jq

# Step 3: Use the access token to call APIs
curl -s -H "Authorization: Bearer ACCESS_TOKEN" \\
  https://api.github.com/user | jq '{login, name, email}'

# Refresh an expired access token
curl -s -X POST https://github.com/login/oauth/access_token \\
  -H "Accept: application/json" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "grant_type=refresh_token" \\
  -d "refresh_token=REFRESH_TOKEN" | jq`
				},
				{
					language: 'wire',
					code: '',
					sections: [
						{
							title: 'Authorization Request (Browser Redirect)',
							code: `GET /authorize?
  response_type=code&
  client_id=s6BhdRkqt3&
  redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&
  scope=read%3Auser%20repo&
  state=af0ifjsldkj&
  code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM&
  code_challenge_method=S256
Host: auth.example.com

HTTP/1.1 302 Found
Location: https://auth.example.com/login?
  continue=%2Fconsent%3Fclient_id%3Ds6BhdRkqt3

  [User authenticates and consents]

HTTP/1.1 302 Found
Location: https://app.example.com/callback?
  code=SplxlOBeZQQYbYS6WxSbIA&
  state=af0ifjsldkj`
						},
						{
							title: 'Token Exchange',
							code: `POST /token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=SplxlOBeZQQYbYS6WxSbIA&
redirect_uri=https%3A%2F%2Fapp.example.com%2Fcallback&
client_id=s6BhdRkqt3&
code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk

HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "tGzv3JOkF0XG5Qx2TlKWIA",
  "scope": "read:user repo"
}`
						}
					]
				}
			]
		},
		performance: {
			latency:
				'Authorization flow: 1-3 HTTP round trips (redirect \u2192 consent \u2192 token exchange). API calls: one extra header per request.',
			throughput:
				'Negligible overhead once token is acquired. JWT validation is local (no server call needed).',
			overhead:
				'Access tokens: 200-2000 bytes (JWT). Authorization flow adds user-facing redirect latency.'
		},
		connections: ['tls', 'rest', 'http1', 'tcp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/OAuth',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc6749',
			official: 'https://oauth.net/2/'
		},
		image: {
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Oauth_logo.svg/600px-Oauth_logo.svg.png',
			alt: 'The OAuth open authorization protocol logo',
			caption:
				'The OAuth logo. OAuth 2.0 (RFC 6749, 2012) became the industry standard for delegated authorization — "Sign in with Google," GitHub Apps, and API access tokens all use OAuth.',
			credit: 'Image: Chris Messina / CC BY-SA 3.0, via Wikimedia Commons'
		}
	}
];
