import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createFTPLayer } from '../layers/ftp';

export const ftpTransfer: SimulationConfig = {
	protocolId: 'ftp',
	title: 'FTP — File Transfer with Dual Channels',
	description:
		'Watch how FTP uses separate control and data channels. The control connection on port 21 carries commands, while a separate data connection transfers file contents — a unique dual-connection architecture.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'FTP Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'FTP Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'filename',
			label: 'Filename',
			type: 'text',
			defaultValue: 'report.pdf',
			placeholder: 'e.g. report.pdf'
		}
	],
	steps: [
		{
			id: 'ready',
			label: '220 Ready',
			description:
				'The FTP server sends a welcome banner upon TCP connection to port 21. This is the control channel that will carry all commands and responses for the entire session. The data channel has not been established yet.',
			fromActor: 'server',
			toActor: 'client',
			duration: 800,
			highlight: ['Reply Code', 'Reply Text'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 21, dstPort: 49400, flags: 'PSH,ACK' }),
				createFTPLayer({
					command: '',
					argument: '',
					replyCode: '220',
					replyText: 'ftp.example.com FTP server ready',
					channel: 'Control (21)'
				})
			]
		},
		{
			id: 'user',
			label: 'USER',
			description:
				'The client sends a username for authentication. FTP sends credentials in plain text, which is why FTPS (FTP over TLS) or SFTP (SSH File Transfer) are recommended for security. The 331 response means the username is valid and a password is expected.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Command', 'Argument'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49400, dstPort: 21, flags: 'PSH,ACK' }),
				createFTPLayer({
					command: 'USER',
					argument: 'alice',
					replyCode: '',
					replyText: '',
					channel: 'Control (21)'
				})
			]
		},
		{
			id: 'pass-prompt',
			label: '331 Password',
			description:
				'The server requests a password. The 3xx response code means an intermediate step is needed before the command can be completed. This two-step authentication separates the username lookup from password verification.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Reply Code'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 21, dstPort: 49400, flags: 'PSH,ACK' }),
				createFTPLayer({
					command: '',
					argument: '',
					replyCode: '331',
					replyText: 'Password required for alice',
					channel: 'Control (21)'
				})
			]
		},
		{
			id: 'pass',
			label: 'PASS',
			description:
				'The client sends the password. On success, the server responds with 230 (User logged in). FTP\'s plain-text credentials are a well-known security weakness, which is why modern file transfer uses SFTP or FTPS with TLS encryption.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Command'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49400, dstPort: 21, flags: 'PSH,ACK' }),
				createFTPLayer({
					command: 'PASS',
					argument: '********',
					replyCode: '',
					replyText: '',
					channel: 'Control (21)'
				})
			]
		},
		{
			id: 'logged-in',
			label: '230 Logged In',
			description:
				'Authentication succeeds. The 230 code indicates the user is now logged in and can issue file transfer commands. The client can now navigate directories (CWD, PWD), list files (LIST), and transfer data (RETR, STOR).',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Reply Code', 'Reply Text'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 21, dstPort: 49400, flags: 'PSH,ACK' }),
				createFTPLayer({
					command: '',
					argument: '',
					replyCode: '230',
					replyText: 'User alice logged in',
					channel: 'Control (21)'
				})
			]
		},
		{
			id: 'pasv',
			label: 'PASV',
			description:
				'The client requests passive mode for the data channel. In passive mode, the server opens a port and the client connects to it. This works better with firewalls and NAT than active mode, where the server would initiate the data connection back to the client.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Command'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49400, dstPort: 21, flags: 'PSH,ACK' }),
				createFTPLayer({
					command: 'PASV',
					argument: '',
					replyCode: '',
					replyText: '',
					channel: 'Control (21)'
				})
			]
		},
		{
			id: 'retr',
			label: 'RETR',
			description:
				'The client requests to download report.pdf. The server responds with 150 indicating it is opening a data connection. The file content flows over the separate data channel (PASV-assigned port), keeping the control channel free for status updates.',
			fromActor: 'client',
			toActor: 'server',
			duration: 1200,
			highlight: ['Command', 'Argument', 'Channel'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 49400, dstPort: 21, flags: 'PSH,ACK' }),
				createFTPLayer({
					command: 'RETR',
					argument: 'report.pdf',
					replyCode: '150',
					replyText: 'Opening BINARY mode data connection',
					channel: 'Data (PASV)'
				})
			]
		}
	]
};
