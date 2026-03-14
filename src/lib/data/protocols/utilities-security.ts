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
		overview: `TLS (and its predecessor SSL) is the security layer that makes the modern internet possible. Every HTTPS website, every secure API call, every encrypted email — they all rely on TLS to ensure that data can't be read or modified in transit.

TLS provides three guarantees: confidentiality (data is encrypted, so eavesdroppers see gibberish), integrity (data can't be modified without detection), and authentication (you're actually talking to who you think you are, verified by certificates). TLS 1.3 (2018) dramatically simplified the handshake, reducing it from 2 round trips to 1, and removed support for legacy insecure algorithms.

When you see the lock icon in your browser, TLS is at work. It sits between the application layer (HTTP) and the transport layer (TCP), transparently encrypting everything. Application code doesn't need to change — "http://" becomes "https://" and TLS handles the rest.`,
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
		connections: ['tcp', 'http1', 'http2', 'quic', 'websockets', 'smtp', 'ftp', 'dns'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Transport_Layer_Security',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc8446'
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
		overview: `SSH replaced the insecure telnet and rlogin protocols by providing encrypted remote shell access. When you connect to a server, push code to GitHub, or tunnel a database connection, you're likely using SSH.

SSH provides an encrypted tunnel between client and server that can carry interactive shell sessions, file transfers (SCP/SFTP), and port forwarding. Authentication can use passwords, but the preferred method is public key authentication: your private key stays on your machine, and the server has your public key — no passwords transmitted over the network.

Beyond shell access, SSH's port forwarding capability is remarkably powerful. You can create tunnels that securely expose remote services locally, bypass firewalls, and create ad-hoc VPNs — making SSH one of the most versatile networking tools in a developer's toolkit.`,
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
  privateKey: require('fs').readFileSync('~/.ssh/id_ed25519')
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
			overhead: 'Per-packet: ~28 bytes (4 length + 1 padding length + padding + 16 MAC)'
		},
		connections: ['tcp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Secure_Shell',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc4253'
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
		overview: `DNS is arguably the most critical infrastructure protocol on the internet. Every time you type a URL, your device asks DNS "what IP address is google.com?" without this translation, the web as we know it couldn't exist.

DNS is a distributed, hierarchical database. At the top are 13 root server clusters. Below them are TLD servers (.com, .org, .net). Below those are authoritative servers for individual domains. Your query cascades down this tree, with aggressive caching at every level to keep things fast.

A typical DNS lookup takes 10-50ms and involves your device's stub resolver → your ISP's recursive resolver → root servers → TLD servers → authoritative servers. But caching means most lookups are answered in under 1ms from a nearby cache. DNS also carries more than just IP addresses: MX records for email, TXT records for verification, CNAME records for aliases, and many more.`,
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
		connections: ['udp', 'tcp', 'tls', 'smtp'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Domain_Name_System',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc1035'
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
		overview: `DHCP is the reason you can connect to a Wi-Fi network and immediately start browsing. Without it, you'd have to manually configure your IP address, subnet mask, gateway, and DNS servers — for every network you join.

When your device connects to a network, it broadcasts a DHCP Discover message ("I need an IP address!"). A DHCP server responds with an offer, which the client accepts. The server then confirms and assigns the IP, along with all the configuration your device needs: subnet mask, default gateway, DNS servers, and the lease duration.

DHCP leases are temporary — typically 1-24 hours. When a lease expires, the device must renew it. This dynamic allocation means IP addresses can be reused efficiently. DHCP is simple, ubiquitous, and works transparently — one of those "invisible" protocols that makes networking just work.`,
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
			overhead: 'Minimum 236-byte message. UDP-based, broadcast-heavy.'
		},
		connections: ['udp', 'dns'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc2131'
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
		overview: `NTP is one of the oldest protocols still in active use, and one of the most underappreciated. It synchronizes clocks across the internet to within milliseconds — a critical requirement for everything from log correlation to financial trading to TLS certificate validation.

NTP uses a hierarchical system of time sources. Stratum 0 are atomic clocks and GPS receivers. Stratum 1 servers connect directly to these. Stratum 2 servers sync from Stratum 1, and so on. Your computer typically syncs from Stratum 2 or 3 servers (like pool.ntp.org).

The clever part is how NTP accounts for network delay. It measures the round-trip time of its packets and mathematically compensates for the delay, achieving accuracy far beyond what simple "what time is it?" queries could provide.`,
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
		overview: `SMTP is the backbone of email. Every email you've ever sent was delivered via SMTP — from your mail client to your provider's server, then relayed across the internet to the recipient's mail server. It's a "store and forward" protocol: each server along the path accepts responsibility for the message and forwards it to the next hop.

SMTP is a text-based protocol with a simple command vocabulary: HELO/EHLO to greet, MAIL FROM to specify the sender, RCPT TO for recipients, DATA to send the message body, and QUIT to disconnect. Modern SMTP uses STARTTLS to upgrade plain connections to encrypted ones, and authentication (SMTP AUTH) to prevent unauthorized sending.

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
		connections: ['tcp', 'tls', 'dns'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/Simple_Mail_Transfer_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc5321'
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

The control channel (port 21) carries text commands like USER, PASS, LIST, RETR (download), and STOR (upload). When a file transfer begins, a separate data connection opens on a different port. In "active" mode, the server connects back to the client; in "passive" mode (PASV), the client initiates both connections, which works better with firewalls and NAT.

While FTP's plain-text design makes it insecure by modern standards, FTPS (FTP over TLS) adds encryption. SFTP (SSH File Transfer Protocol) is a completely different protocol that runs over SSH. Despite being largely superseded by SFTP, SCP, and HTTP-based file transfer, FTP remains in use for legacy systems, firmware updates, and bulk file hosting.`,
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
		connections: ['tcp', 'tls'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/File_Transfer_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc959'
		}
	}
];
