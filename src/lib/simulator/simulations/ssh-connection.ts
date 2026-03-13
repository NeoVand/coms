import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createSSHLayer } from '../layers/ssh';

export const sshConnection: SimulationConfig = {
	protocolId: 'ssh',
	title: 'SSH Connection Establishment',
	description:
		'Watch how SSH establishes a secure shell session — from version negotiation through key exchange and authentication to an encrypted interactive channel.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client', icon: 'client', position: 'left' },
		{ id: 'server', label: 'SSH Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'authMethod',
			label: 'Auth Method',
			type: 'select',
			defaultValue: 'publickey',
			options: ['publickey', 'password']
		}
	],
	steps: [
		{
			id: 'version-client',
			label: 'Version Exchange',
			description:
				'Client announces its SSH protocol version. This is sent as plain text before any encryption. Both sides must agree on SSH-2.0 to continue.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52400, dstPort: 22, flags: 'PSH,ACK' }),
				createSSHLayer({
					messageType: 'Version String',
					algorithm: 'N/A (plaintext)',
					payload: 'SSH-2.0-OpenSSH_9.6',
					packetLength: 32
				})
			]
		},
		{
			id: 'version-server',
			label: 'Version Exchange',
			description:
				'Server responds with its version string. This is the last unencrypted exchange — everything after key exchange will be encrypted.',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Payload'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 22, dstPort: 52400, flags: 'PSH,ACK' }),
				createSSHLayer({
					messageType: 'Version String',
					algorithm: 'N/A (plaintext)',
					payload: 'SSH-2.0-OpenSSH_9.6',
					packetLength: 32
				})
			]
		},
		{
			id: 'kex-init',
			label: 'KEXINIT',
			description:
				'Both sides exchange lists of supported algorithms for key exchange, encryption, MAC, and compression. They pick the first mutually supported algorithm from each list.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Message Type', 'Algorithm'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52400, dstPort: 22, flags: 'PSH,ACK' }),
				createSSHLayer({
					messageType: 'KEXINIT (20)',
					algorithm: 'curve25519-sha256, aes256-gcm',
					payload: 'kex: curve25519-sha256, enc: aes256-gcm@openssh.com, mac: hmac-sha2-256',
					packetLength: 512
				})
			]
		},
		{
			id: 'kex-reply',
			label: 'DH Reply + NEWKEYS',
			description:
				'Server sends its Diffie-Hellman public value and host key. Both sides now compute the shared secret independently. NEWKEYS signals the switch to encrypted communication.',
			fromActor: 'server',
			toActor: 'client',
			duration: 1000,
			highlight: ['Message Type', 'Algorithm'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 22, dstPort: 52400, flags: 'PSH,ACK' }),
				createSSHLayer({
					messageType: 'KEX_REPLY (31) + NEWKEYS (21)',
					algorithm: 'curve25519-sha256',
					payload: 'Host key + DH public value + signature',
					packetLength: 1024
				})
			]
		},
		{
			id: 'service-request',
			label: 'Service Request',
			description:
				'Client requests the ssh-userauth service. Everything from here is encrypted with the negotiated keys. The server must verify the host key fingerprint matches a known value.',
			fromActor: 'client',
			toActor: 'server',
			duration: 600,
			highlight: ['Message Type'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52400, dstPort: 22, flags: 'PSH,ACK' }),
				createSSHLayer({
					messageType: 'SERVICE_REQUEST (5)',
					algorithm: 'aes256-gcm@openssh.com',
					payload: 'ssh-userauth',
					packetLength: 48
				})
			]
		},
		{
			id: 'auth-request',
			label: 'Auth Request',
			description:
				'Client authenticates using public key — it signs a session-unique challenge with its private key. The server checks if the corresponding public key is in ~/.ssh/authorized_keys.',
			fromActor: 'client',
			toActor: 'server',
			duration: 800,
			highlight: ['Message Type', 'Payload'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52400, dstPort: 22, flags: 'PSH,ACK' }),
				createSSHLayer({
					messageType: 'USERAUTH_REQUEST (50)',
					algorithm: 'ssh-ed25519',
					payload: 'user: neo, method: publickey, key: ssh-ed25519 AAAA...',
					packetLength: 256
				})
			]
		},
		{
			id: 'auth-success',
			label: 'Auth Success',
			description:
				'Server confirms authentication succeeded. The SSH session is fully established — the client can now open channels for interactive shell, port forwarding, or file transfer (SCP/SFTP).',
			fromActor: 'server',
			toActor: 'client',
			duration: 600,
			highlight: ['Message Type'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:FF', dstMac: '00:1A:2B:3C:4D:5E' }),
				createIPv4Layer({ srcIp: '93.184.216.34', dstIp: '192.168.1.100', protocol: 6 }),
				createTCPLayer({ srcPort: 22, dstPort: 52400, flags: 'PSH,ACK' }),
				createSSHLayer({
					messageType: 'USERAUTH_SUCCESS (52)',
					algorithm: 'aes256-gcm@openssh.com',
					payload: 'Authentication accepted',
					packetLength: 16
				})
			]
		}
	]
};
