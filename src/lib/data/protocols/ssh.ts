import type { Protocol } from '../types';

export const ssh: Protocol = {
	id: 'ssh',
	name: 'Secure Shell',
	abbreviation: 'SSH',
	categoryId: 'utilities',
	port: 22,
	year: 1995,
	rfc: 'RFC 4253',
	oneLiner: 'Encrypted remote access — how developers securely connect to servers.',
	overview: `[[ssh|SSH]] replaced the insecure telnet and rlogin protocols by providing {{encryption|encrypted}} remote shell access. When you connect to a server, push code to GitHub, or tunnel a database connection, you're likely using [[ssh|SSH]].

[[ssh|SSH]] provides an encrypted tunnel between {{client-server|client and server}} that can carry interactive shell sessions, file transfers (SCP/{{sftp|SFTP}}), and {{port-forwarding|port forwarding}}. Authentication can use passwords, but the preferred method is {{public-key|public key}} authentication: your {{private-key|private key}} stays on your machine, and the server has your {{public-key|public key}} — no passwords transmitted over the network.

Beyond shell access, [[ssh|SSH]]'s {{port-forwarding|port forwarding}} capability is remarkably powerful. You can create {{tunnel|tunnels}} that securely expose remote services locally, bypass {{firewall|firewalls}}, and create ad-hoc {{vpn|VPNs}} — making [[ssh|SSH]] one of the most versatile networking tools in a developer's toolkit.`,
	howItWorks: [
		{
			title: 'TCP connection + version exchange',
			description:
				'Client connects to port 22. Both sides announce their [[ssh|SSH]] protocol version and software version in plain text.'
		},
		{
			title: 'Key exchange',
			description:
				'Client and server negotiate {{encryption|encryption}} using Diffie-Hellman or similar. This produces shared session keys without ever transmitting them. Everything after this is encrypted.'
		},
		{
			title: 'Server authentication',
			description:
				'Client verifies the server\'s host key against its known_hosts file. "Are you the same server I connected to before?" Prevents man-in-the-middle attacks.'
		},
		{
			title: 'User authentication',
			description:
				'Client authenticates via {{public-key|public key}} (preferred), password, or other method. The server verifies and grants access. An encrypted session is now established.'
		}
	],
	useCases: [
		'Remote server administration',
		'Git operations (GitHub, GitLab over [[ssh|SSH]])',
		'Secure file transfer (SCP, SFTP)',
		'{{port-forwarding|Port forwarding}} and tunneling',
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
			'[[ssh|SSH]] is a Swiss Army knife: shell access, file transfer, tunneling, and Git — all encrypted',
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
		overhead:
			'Per-packet: ~28+ bytes (4 length + 1 padding length + padding + MAC). MAC size varies: HMAC-SHA1 = 20 bytes, HMAC-SHA2-256 = 32 bytes. AEAD ciphers (AES-GCM, ChaCha20-Poly1305) use a 16-byte authentication tag instead.'
	},
	connections: ['tcp', 'tls', 'ftp', 'kerberos'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Secure_Shell',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc4253'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Ssh_binary_packet_alt.svg/500px-Ssh_binary_packet_alt.svg.png',
		alt: 'Diagram of the SSH binary packet structure showing packet length, padding length, payload, padding, and MAC fields',
		caption:
			'The [[ssh|SSH]] binary packet structure — every [[ssh|SSH]] message is wrapped in this format. The {{payload|payload}} is encrypted, random padding prevents traffic analysis, and the MAC (Message Authentication Code) ensures integrity. This is what makes [[ssh|SSH]] secure where Telnet was not.',
		credit: 'Image: Wikimedia Commons / CC BY 2.5'
	}
};
