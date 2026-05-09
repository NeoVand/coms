import type { Protocol } from '../types';

export const ftp: Protocol = {
	id: 'ftp',
	name: 'File Transfer Protocol',
	abbreviation: 'FTP',
	categoryId: 'utilities',
	port: 21,
	year: 1971,
	rfc: 'RFC 959',
	oneLiner: 'One of the oldest internet protocols — built for transferring files between machines.',
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
				'For file transfers, a separate [[tcp|TCP]] connection opens. In passive mode (PASV), the server tells the client which port to connect to. This separates control flow from data flow.'
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
		caption:
			'FTP uses dual connections — control channel for commands, data channel for transfers.',
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
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Passive_FTP_Verbindung.svg/500px-Passive_FTP_Verbindung.svg.png',
		alt: 'Diagram showing FTP passive mode connection flow: client connects to control port 21, then server provides a data port for the client to connect to',
		caption:
			"FTP passive mode — the client connects to port 21 for commands, then the server tells the client which high port to connect to for data transfer. Passive mode solved the {{nat|NAT}}/{{firewall|firewall}} problems that plagued FTP's original active mode.",
		credit: 'Image: Wikimedia Commons / CC BY-SA 3.0'
	}
};
