import type { SimulationConfig } from '../types';
import { createEthernetLayer } from '../layers/ethernet';
import { createIPv4Layer } from '../layers/ipv4';
import { createUDPLayer } from '../layers/udp';
import { createKerberosLayer } from '../layers/kerberos';

export const kerberosAuth: SimulationConfig = {
	protocolId: 'kerberos',
	title: 'Kerberos Authentication — TGT → Service Ticket → AP-REQ',
	description:
		'Watch Alice log into a Kerberos realm, acquire a Ticket Granting Ticket, fetch a service ticket for a web server, and authenticate to that server — all without sending her password on the wire. Same flow that runs in every Active Directory domain and every Hadoop cluster on Earth.',
	tier: 'client',
	actors: [
		{ id: 'client', label: 'Client (Alice)', icon: 'client', position: 'left' },
		{ id: 'kdc', label: 'KDC (AS + TGS)', icon: 'server', position: 'center' },
		{ id: 'service', label: 'Service (web1)', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'principal',
			label: 'Client principal',
			type: 'text',
			defaultValue: 'alice@EXAMPLE.COM',
			placeholder: 'user@REALM'
		},
		{
			id: 'service',
			label: 'Target service principal',
			type: 'text',
			defaultValue: 'HTTP/web1.example.com',
			placeholder: 'svc/host'
		},
		{
			id: 'etype',
			label: 'Encryption type',
			type: 'select',
			defaultValue: 'aes256-cts-hmac-sha384-192',
			options: [
				'aes256-cts-hmac-sha384-192',
				'aes128-cts-hmac-sha256-128',
				'rc4-hmac (legacy, NEA1)'
			]
		}
	],
	steps: [
		{
			id: 'as-req',
			label: 'AS-REQ — request a TGT',
			description:
				'Alice sends an AS-REQ to the KDC\'s Authentication Service with her principal name and a **PA-ENC-TIMESTAMP** — a fresh timestamp encrypted under her long-term key. Modern KDCs reject the request without it (the "AS-REP roasting" defence). UDP/88 by default; TCP/88 fallback for messages >`udp_preference_limit`.',
			fromActor: 'client',
			toActor: 'kdc',
			duration: 1300,
			highlight: ['Application Tag', 'Principal Name (cname / sname)', 'Body / Ticket'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.42', dstIp: '10.0.0.10', protocol: 17 }),
				createUDPLayer({ srcPort: 50000, dstPort: 88 }),
				createKerberosLayer({
					appTag: '[APPLICATION 10] AS-REQ',
					msgType: 10,
					cname: 'alice@EXAMPLE.COM',
					body: 'kdc-options: forwardable, renewable; sname: krbtgt/EXAMPLE.COM; padata: PA-ENC-TIMESTAMP (enc with K_alice); nonce: 0xA1B2C3D4; etype: { AES-256, AES-128 }'
				})
			]
		},
		{
			id: 'as-rep',
			label: 'AS-REP — TGT delivered',
			description:
				"KDC looks up Alice's long-term key, generates a fresh session key, returns the AS-REP with **two encrypted blobs**: (a) the **TGT** encrypted under the krbtgt principal's key — only the KDC can later decrypt it, (b) the session key encrypted under Alice's long-term key — only Alice can decrypt it. Alice never sees her own password fly over the wire.",
			fromActor: 'kdc',
			toActor: 'client',
			duration: 1300,
			highlight: ['Application Tag', 'Body / Ticket'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:10' }),
				createIPv4Layer({ srcIp: '10.0.0.10', dstIp: '10.0.0.42', protocol: 17 }),
				createUDPLayer({ srcPort: 88, dstPort: 50000 }),
				createKerberosLayer({
					appTag: '[APPLICATION 11] AS-REP',
					msgType: 11,
					cname: 'alice@EXAMPLE.COM',
					body: 'ticket: TGT enc[krbtgt key] { K_session, flags, times }; enc-part: enc[K_alice] { K_session, nonce echoed, sname=krbtgt }'
				})
			]
		},
		{
			id: 'tgs-req',
			label: 'TGS-REQ — request a service ticket',
			description:
				"Alice now wants to access HTTP/web1.example.com. She sends a TGS-REQ to the KDC's Ticket Granting Service, presenting her TGT (proves who she is) plus a fresh **authenticator** encrypted under the TGT's session key (proves she just got it). No password again.",
			fromActor: 'client',
			toActor: 'kdc',
			duration: 1300,
			highlight: ['Application Tag', 'Principal Name (cname / sname)', 'Body / Ticket'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.42', dstIp: '10.0.0.10', protocol: 17 }),
				createUDPLayer({ srcPort: 50001, dstPort: 88 }),
				createKerberosLayer({
					appTag: '[APPLICATION 12] TGS-REQ',
					msgType: 12,
					cname: 'alice@EXAMPLE.COM',
					body: 'sname: HTTP/web1.example.com; padata: PA-TGS-REQ (AP-REQ with TGT + authenticator); nonce: 0xE5F60718; etype: { AES-256 }'
				})
			]
		},
		{
			id: 'tgs-rep',
			label: 'TGS-REP — service ticket delivered',
			description:
				"KDC decrypts the TGT with the krbtgt key, validates the authenticator (fresh, ±5min skew), mints a new client↔service session key, and returns the TGS-REP with: (a) a **service ticket** encrypted under web1's keytab key — only web1 can decrypt, (b) the new session key encrypted under the previous TGT's session key — only Alice can decrypt.",
			fromActor: 'kdc',
			toActor: 'client',
			duration: 1300,
			highlight: ['Application Tag', 'Body / Ticket'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:10' }),
				createIPv4Layer({ srcIp: '10.0.0.10', dstIp: '10.0.0.42', protocol: 17 }),
				createUDPLayer({ srcPort: 88, dstPort: 50001 }),
				createKerberosLayer({
					appTag: '[APPLICATION 13] TGS-REP',
					msgType: 13,
					cname: 'alice@EXAMPLE.COM',
					body: 'ticket: ServiceTicket enc[web1 keytab] { K_svc, flags, times }; enc-part: enc[K_TGT_session] { K_svc, sname=HTTP/web1, times }'
				})
			]
		},
		{
			id: 'ap-req',
			label: 'AP-REQ — present the service ticket',
			description:
				"Alice connects to web1 (HTTPS, SMB, NFS, SSH, whatever) and sends an **AP-REQ** containing the service ticket + a fresh authenticator encrypted under K_svc. The application protocol carries this transparently — over HTTP it's `Authorization: Negotiate <base64>` via SPNEGO; over SSH it's `gss-with-mic`.",
			fromActor: 'client',
			toActor: 'service',
			duration: 1300,
			highlight: ['Application Tag', 'Body / Ticket'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.42', dstIp: '10.0.0.100', protocol: 6 }),
				{
					name: 'TCP / SPNEGO / HTTP',
					abbreviation: 'TCP',
					osiLayer: 4,
					color: '#39FF14',
					headerFields: [
						{
							name: 'TCP src/dst',
							bits: 32,
							value: '50002 → 443',
							editable: false,
							description: 'AP-REQ rides inside the application transport — here HTTPS on TCP/443'
						},
						{
							name: 'HTTP header',
							bits: 0,
							value: 'Authorization: Negotiate <base64(SPNEGO+AP-REQ)>',
							editable: false,
							description: 'SPNEGO wrapper carrying the Kerberos AP-REQ — RFC 4178'
						}
					]
				},
				createKerberosLayer({
					appTag: '[APPLICATION 14] AP-REQ',
					msgType: 14,
					cname: 'alice@EXAMPLE.COM',
					body: 'ticket: ServiceTicket enc[web1 keytab] { K_svc }; authenticator: enc[K_svc] { ctime, cusec, seq-number, subkey? }'
				})
			]
		},
		{
			id: 'ap-rep',
			label: 'AP-REP — mutual authentication',
			description:
				"web1 decrypts the ticket using its **keytab** key (no round trip to the KDC!), extracts K_svc, decrypts the authenticator. If ctime is within ±5 min and seq-number is fresh, Alice is authenticated. If she set `mutual-required` in ap-options, web1 returns an **AP-REP** with its own encrypted timestamp — proving to Alice she's talking to the real web1 (the one with the right keytab), not an impostor.",
			fromActor: 'service',
			toActor: 'client',
			duration: 1200,
			highlight: ['Application Tag', 'Body / Ticket'],
			layers: [
				createEthernetLayer({ srcMac: 'AA:BB:CC:DD:EE:64' }),
				createIPv4Layer({ srcIp: '10.0.0.100', dstIp: '10.0.0.42', protocol: 6 }),
				{
					name: 'TCP / SPNEGO / HTTP',
					abbreviation: 'TCP',
					osiLayer: 4,
					color: '#39FF14',
					headerFields: [
						{
							name: 'TCP src/dst',
							bits: 32,
							value: '443 → 50002',
							editable: false,
							description: '200 OK with the WWW-Authenticate Negotiate response token'
						},
						{
							name: 'HTTP header',
							bits: 0,
							value: 'WWW-Authenticate: Negotiate <base64(AP-REP)>',
							editable: false,
							description: 'Server returns its mutual-auth token for the client to verify'
						}
					]
				},
				createKerberosLayer({
					appTag: '[APPLICATION 15] AP-REP',
					msgType: 15,
					cname: 'HTTP/web1.example.com',
					body: 'enc-part: enc[K_svc] { ctime, cusec, subkey?, seq-number echoed }'
				})
			]
		},
		{
			id: 'session',
			label: 'Authenticated session',
			description:
				'From this point Alice and web1 share K_svc. Subsequent application traffic flows over the established session (HTTPS over TLS, SSH over its own keying — Kerberos only authenticates, it does not encrypt the payload by default). If the protocol uses **KRB-PRIV** ([APPLICATION 21]) or **KRB-SAFE** ([APPLICATION 20]), the session key further wraps each message for confidentiality or integrity.',
			fromActor: 'client',
			toActor: 'service',
			duration: 1100,
			highlight: ['Body / Ticket'],
			data: 'Authenticated HTTPS session — Alice → web1',
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ srcIp: '10.0.0.42', dstIp: '10.0.0.100', protocol: 6 }),
				{
					name: 'Application',
					abbreviation: 'APP',
					osiLayer: 7,
					color: '#00D4FF',
					headerFields: [
						{
							name: 'Protocol',
							bits: 0,
							value: 'HTTPS / SMB / NFSv4 / SSH',
							editable: false,
							description: 'Kerberos-authenticated session — the underlying app protocol takes over'
						},
						{
							name: 'Optional KRB-PRIV wrap',
							bits: 0,
							value: 'enc[K_svc] { user payload, seq-number }',
							editable: false,
							description:
								'For protocols that want Kerberos confidentiality (rare — most use TLS for that)'
						}
					]
				}
			]
		}
	]
};
