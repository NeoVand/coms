import type { Protocol } from '../types';

export const utilitiesProtocols: Protocol[] = [
	{
		id: 'tls',
		name: 'Transport Layer Security',
		abbreviation: 'TLS',
		categoryId: 'utilities',
		port: 443,
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
			language: 'bash',
			code: `# View a site's TLS certificate
openssl s_client -connect example.com:443 2>/dev/null \\
  | openssl x509 -noout -text \\
  | grep -E "(Subject:|Issuer:|Not After)"

# Output:
# Subject: CN = example.com
# Issuer: CN = DigiCert SHA2 Secure Server CA
# Not After : Dec 15 23:59:59 2025 GMT`,
			caption:
				'Every HTTPS connection starts with a TLS handshake — you can inspect certificates with openssl'
		},
		performance: {
			latency: 'TLS 1.3: 1 RTT for new connections, 0 RTT for resumption. TLS 1.2: 2 RTTs.',
			throughput:
				'AES-GCM encryption is hardware-accelerated on modern CPUs — negligible throughput impact',
			overhead: '~5 bytes per TLS record header + 16 bytes for GCM authentication tag'
		},
		microInteraction: 'shield',
		connections: ['tcp', 'http1', 'http2', 'quic', 'smtp'],
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
			language: 'bash',
			code: `# Generate an SSH key pair
ssh-keygen -t ed25519 -C "you@example.com"

# Connect to a remote server
ssh user@example.com

# Port forward: access remote DB locally
ssh -L 5432:localhost:5432 user@db-server.com

# Copy files securely
scp file.txt user@example.com:/home/user/`,
			caption:
				'SSH is a Swiss Army knife: shell access, file transfer, tunneling, and Git — all encrypted'
		},
		performance: {
			latency: '1-2 RTTs for connection + key exchange + authentication',
			throughput: 'Hardware AES encryption; limited mainly by the network and remote system speed',
			overhead: 'Per-packet: ~28 bytes (4 length + 1 padding length + padding + 16 MAC)'
		},
		microInteraction: 'shield',
		connections: ['tcp', 'tls', 'ftp'],
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
			language: 'bash',
			code: `# Look up A record (IPv4 address)
dig example.com A +short
# 93.184.216.34

# Look up MX records (mail servers)
dig example.com MX +short
# 10 mail.example.com

# Trace the full resolution path
dig example.com +trace`,
			caption:
				'The dig command shows exactly how DNS resolves a name — from root servers down to the answer'
		},
		performance: {
			latency:
				'Cached: <1ms. Uncached: 10-100ms (multiple recursive queries). DNS-over-HTTPS adds ~50ms.',
			throughput: 'Not applicable — DNS is query/response, not streaming',
			overhead: '12-byte header + question + answer. Typical query: 40-60 bytes. UDP-based.'
		},
		microInteraction: 'query-response',
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
					language: 'bash',
					code: `# Request a new DHCP lease
sudo dhclient -v eth0

# Release the current lease
sudo dhclient -r eth0

# View current DHCP lease details
cat /var/lib/dhcp/dhclient.leases

# Monitor DHCP traffic on the network
sudo tcpdump -i eth0 port 67 or port 68 -v`
				}
			]
		},
		performance: {
			latency: 'Full DORA cycle: ~100-500ms. Renewal: single RTT.',
			throughput: 'Not applicable — DHCP is one-time configuration, not data transfer',
			overhead: 'Minimum 236-byte message. UDP-based, broadcast-heavy.'
		},
		microInteraction: 'query-response',
		connections: ['udp'],
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
					language: 'bash',
					code: `# Query an NTP server manually
ntpdate -q pool.ntp.org

# Check NTP synchronization status (systemd)
timedatectl timesync-status

# Use chrony for modern NTP management
chronyc tracking     # Show current sync status
chronyc sources -v   # Show NTP servers and quality

# One-shot time sync (requires root)
sudo ntpdate pool.ntp.org`
				}
			]
		},
		performance: {
			latency:
				'Single UDP round trip. Synchronization accuracy: 1-50ms over internet, <1ms on LAN.',
			throughput: 'Polling interval: 64-1024 seconds. Negligible bandwidth.',
			overhead: '48-byte packets. One of the lightest protocols in existence.'
		},
		microInteraction: 'query-response',
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
		oneLiner: 'The protocol that delivers email across the internet — store and forward, hop by hop.',
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
			language: 'Python',
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
			caption:
				"Python's smtplib provides a straightforward interface for sending email via SMTP.",
			alternatives: [
				{
					language: 'TypeScript',
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
				}
			]
		},
		performance: {
			latency: 'Seconds to minutes (store and forward)',
			throughput: 'Millions of messages/day at scale',
			overhead: 'Moderate — DNS lookups, TLS, multi-hop relay'
		},
		microInteraction: 'query-response' as const,
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
		oneLiner: 'One of the oldest internet protocols — built for transferring files between machines.',
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
			language: 'Python',
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
			caption: "Python's ftplib provides a simple interface for FTP operations.",
			alternatives: [
				{
					language: 'Bash',
					code: `# Command-line FTP operations
# Download a file
curl -u user:pass ftp://ftp.example.com/file.txt -o file.txt

# Upload a file
curl -u user:pass -T upload.txt ftp://ftp.example.com/

# List directory
curl -u user:pass ftp://ftp.example.com/`
				}
			]
		},
		performance: {
			latency: 'Connection setup + transfer time',
			throughput: 'Line-speed for data channel',
			overhead: 'Dual connection (control + data channels)'
		},
		microInteraction: 'default' as const,
		connections: ['tcp', 'tls', 'ssh'],
		links: {
			wikipedia: 'https://en.wikipedia.org/wiki/File_Transfer_Protocol',
			rfc: 'https://datatracker.ietf.org/doc/html/rfc959'
		}
	}
];
