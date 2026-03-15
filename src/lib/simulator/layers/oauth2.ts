import type { ProtocolLayer } from '../types';

export function createOAuth2Layer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'OAuth 2.0',
		abbreviation: 'OAuth',
		osiLayer: 7,
		color: '#2DD4BF',
		headerFields: [
			{
				name: 'Grant Type',
				bits: 0,
				value: overrides?.grantType ?? 'authorization_code',
				editable: false,
				description:
					'OAuth flow type — authorization_code, client_credentials, refresh_token'
			},
			{
				name: 'Client ID',
				bits: 0,
				value: overrides?.clientId ?? 'my-app-id',
				editable: false,
				description:
					'Identifies the application requesting access'
			},
			{
				name: 'Scope',
				bits: 0,
				value: overrides?.scope ?? 'read:user email',
				editable: false,
				description:
					'Requested permissions — limits what the token can access',
				color: '#2DD4BF'
			},
			{
				name: 'State',
				bits: 0,
				value: overrides?.state ?? 'xYz123_csrf',
				editable: false,
				description:
					'CSRF protection — random value verified on callback'
			},
			{
				name: 'Code Challenge',
				bits: 0,
				value: overrides?.codeChallenge ?? 'SHA256(verifier)',
				editable: false,
				description:
					'PKCE — proves the token requester is the same as the auth initiator'
			},
			{
				name: 'Token',
				bits: 0,
				value: overrides?.token ?? '',
				editable: false,
				description:
					'Access token (JWT or opaque) — presented in Authorization: Bearer header'
			}
		]
	};
}
