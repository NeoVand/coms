import type { SimulationConfig } from '../types';
import { createTCPLayer } from '../layers/tcp';
import { createIPv4Layer } from '../layers/ipv4';
import { createEthernetLayer } from '../layers/ethernet';
import { createTLSRecordLayer } from '../layers/tls';
import { createOAuth2Layer } from '../layers/oauth2';

function httpRequestLayer(
	method: string,
	path: string,
	host: string,
	extra?: { auth?: string; contentType?: string; body?: string }
) {
	return {
		name: 'HTTP Request',
		abbreviation: 'HTTP',
		osiLayer: 7 as const,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Method',
				bits: 0,
				value: method,
				editable: false,
				description: `HTTP method — ${method}`
			},
			{
				name: 'Path',
				bits: 0,
				value: path,
				editable: false,
				description: 'Request path'
			},
			{
				name: 'Version',
				bits: 0,
				value: 'HTTP/1.1',
				editable: false,
				description: 'Protocol version'
			},
			{
				name: 'Host',
				bits: 0,
				value: host,
				editable: false,
				description: 'Target server hostname'
			},
			...(extra?.auth
				? [
						{
							name: 'Authorization',
							bits: 0,
							value: extra.auth,
							editable: false,
							description:
								'Authorization header — carries the Bearer access token',
							color: '#2DD4BF'
						}
					]
				: []),
			...(extra?.contentType
				? [
						{
							name: 'Content-Type',
							bits: 0,
							value: extra.contentType,
							editable: false,
							description: 'Request body encoding'
						}
					]
				: []),
			...(extra?.body
				? [
						{
							name: 'Body',
							bits: 0,
							value: extra.body,
							editable: false,
							description: 'Request body parameters'
						}
					]
				: [])
		]
	};
}

function httpResponseLayer(status: string, statusColor: string, body: string) {
	return {
		name: 'HTTP Response',
		abbreviation: 'HTTP',
		osiLayer: 7 as const,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Version',
				bits: 0,
				value: 'HTTP/1.1',
				editable: false,
				description: 'Protocol version'
			},
			{
				name: 'Status',
				bits: 0,
				value: status,
				editable: false,
				description: `HTTP status — ${status}`,
				color: statusColor
			},
			{
				name: 'Content-Type',
				bits: 0,
				value: 'application/json',
				editable: false,
				description: 'Response body encoding'
			},
			{
				name: 'Body',
				bits: 0,
				value: body,
				editable: false,
				description: 'Response body'
			}
		]
	};
}

export const oauth2Flow: SimulationConfig = {
	protocolId: 'oauth2',
	title: 'OAuth 2.0 Authorization Code + PKCE',
	description:
		'See how OAuth 2.0 delegates authorization through a three-party redirect flow. The app never sees the user\'s password — instead it receives a scoped access token after the user consents at the authorization server.',
	tier: 'client',
	actors: [
		{ id: 'app', label: 'Your App', icon: 'browser', position: 'left' },
		{ id: 'auth', label: 'Auth Server', icon: 'server', position: 'center' },
		{ id: 'api', label: 'API Server', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'scope',
			label: 'OAuth Scope',
			type: 'select',
			defaultValue: 'read:user email',
			options: ['read:user email', 'read:user write:repo', 'openid profile']
		}
	],
	steps: [
		{
			id: 'pkce-redirect',
			label: 'Authorization Request',
			description:
				'App generates a random code_verifier and its SHA-256 hash (code_challenge) for PKCE. Then it redirects the user\'s browser to the authorization server with client_id, scope, state, and the code_challenge.',
			fromActor: 'app',
			toActor: 'auth',
			duration: 800,
			highlight: ['Scope', 'Code Challenge', 'State'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52800, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					length: 384
				}),
				httpRequestLayer(
					'GET',
					'/authorize?response_type=code&client_id=my-app&scope=read:user+email&state=xYz123&code_challenge=E9Melhoa2...&code_challenge_method=S256',
					'auth.example.com'
				),
				createOAuth2Layer({
					grantType: 'authorization_code',
					clientId: 'my-app-id',
					scope: 'read:user email',
					state: 'xYz123_csrf',
					codeChallenge: 'SHA256(random_verifier)'
				})
			]
		},
		{
			id: 'user-consent',
			label: 'User Consent',
			description:
				'Auth server presents a consent screen showing what the app is requesting. The user authenticates (if not already logged in) and approves the requested scopes. The app never sees the user\'s credentials.',
			fromActor: 'auth',
			toActor: 'app',
			duration: 1200,
			highlight: ['Scope', 'State'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '10.0.0.50',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({ srcPort: 443, dstPort: 52800, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					length: 256
				}),
				httpResponseLayer(
					'200 OK',
					'#22c55e',
					'Login form + consent: "Allow my-app to read:user email?"'
				)
			]
		},
		{
			id: 'auth-code',
			label: 'Authorization Code',
			description:
				'After consent, the auth server redirects the browser back to the app\'s callback URL with a short-lived authorization code and the original state parameter for CSRF verification.',
			fromActor: 'auth',
			toActor: 'app',
			duration: 800,
			highlight: ['Status', 'Body'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '10.0.0.50',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({ srcPort: 443, dstPort: 52800, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					length: 192
				}),
				httpResponseLayer(
					'302 Found',
					'#FACC15',
					'Location: https://myapp.com/callback?code=SplxlOBez&state=xYz123'
				)
			]
		},
		{
			id: 'token-exchange',
			label: 'Token Exchange',
			description:
				'App sends the authorization code plus the original code_verifier to the token endpoint. The server hashes the verifier and checks it against the stored challenge — proving the same app that started the flow is finishing it.',
			fromActor: 'app',
			toActor: 'auth',
			duration: 800,
			highlight: ['Grant Type', 'Code Challenge'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52801, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					length: 320
				}),
				httpRequestLayer('POST', '/token', 'auth.example.com', {
					contentType: 'application/x-www-form-urlencoded',
					body: 'grant_type=authorization_code&code=SplxlOBez&code_verifier=dBjftJeZ...'
				}),
				createOAuth2Layer({
					grantType: 'authorization_code',
					clientId: 'my-app-id',
					codeChallenge: 'code_verifier=dBjftJeZ4CVP...',
					token: ''
				})
			]
		},
		{
			id: 'token-response',
			label: 'Access Token Issued',
			description:
				'Auth server validates the code and PKCE verifier, then returns an access token (often a JWT) and a refresh token. The access token is short-lived (minutes to hours); the refresh token lasts longer.',
			fromActor: 'auth',
			toActor: 'app',
			duration: 1000,
			highlight: ['Token', 'Scope'],
			layers: [
				createEthernetLayer({
					srcMac: 'AA:BB:CC:DD:EE:FF',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '10.0.0.50',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({ srcPort: 443, dstPort: 52801, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					length: 512
				}),
				httpResponseLayer(
					'200 OK',
					'#22c55e',
					'{access_token:"eyJhbG...", token_type:"Bearer", expires_in:3600, refresh_token:"tGzv3J..."}'
				),
				createOAuth2Layer({
					grantType: 'authorization_code',
					scope: 'read:user email',
					token: 'eyJhbGciOiJSUzI1NiIs...'
				})
			]
		},
		{
			id: 'api-call',
			label: 'API Call with Bearer Token',
			description:
				'App calls the resource API with the access token in the Authorization: Bearer header. The API server validates the token (signature + expiry + scopes) without contacting the auth server.',
			fromActor: 'app',
			toActor: 'api',
			duration: 800,
			highlight: ['Authorization', 'Method'],
			layers: [
				createEthernetLayer(),
				createIPv4Layer({ protocol: 6 }),
				createTCPLayer({ srcPort: 52802, dstPort: 443, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					length: 256
				}),
				httpRequestLayer('GET', '/api/user/me', 'api.example.com', {
					auth: 'Bearer eyJhbGciOiJSUzI1NiIs...'
				}),
				createOAuth2Layer({
					grantType: 'authorization_code',
					scope: 'read:user email',
					token: 'eyJhbGciOiJSUzI1NiIs...'
				})
			]
		},
		{
			id: 'api-response',
			label: 'Protected Resource',
			description:
				'API server returns the protected resource. The token\'s scopes limit what data is returned — with "read:user email" the app gets profile info but can\'t modify anything. When the token expires, the app uses the refresh token to get a new one without user interaction.',
			fromActor: 'api',
			toActor: 'app',
			duration: 1000,
			highlight: ['Status', 'Body'],
			layers: [
				createEthernetLayer({
					srcMac: 'CC:DD:EE:FF:00:11',
					dstMac: '00:1A:2B:3C:4D:5E'
				}),
				createIPv4Layer({
					srcIp: '93.184.216.34',
					dstIp: '192.168.1.100',
					protocol: 6
				}),
				createTCPLayer({ srcPort: 443, dstPort: 52802, flags: 'PSH,ACK' }),
				createTLSRecordLayer({
					contentType: 'Application Data (23)',
					handshakeType: 'N/A (encrypted)',
					cipherSuite: 'AES-256-GCM',
					length: 384
				}),
				httpResponseLayer(
					'200 OK',
					'#22c55e',
					'{id:42, name:"Alice", email:"alice@example.com"}'
				)
			]
		}
	]
};
