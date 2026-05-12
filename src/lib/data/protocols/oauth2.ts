import type { Protocol } from '../types';

export const oauth2: Protocol = {
	id: 'oauth2',
	name: 'OAuth 2.0',
	abbreviation: 'OAuth',
	categoryId: 'utilities',
	port: 443,
	year: 2012,
	rfc: 'RFC 6749',
	oneLiner:
		'Delegated authorization for the modern web — let apps access your data without sharing your password.',
	overview: `[[oauth2|OAuth 2.0]] is the authorization framework that powers "Sign in with Google," "Connect your GitHub," and virtually every third-party integration on the modern web. Instead of handing your password to an application, [[oauth2|OAuth]] lets you grant it a scoped, time-limited {{access-token|access token}} — the app can read your repos but not delete them, view your calendar but not your email. Your credentials never leave the identity provider.

The core mechanism is the authorization code flow. When you click "Sign in with GitHub," you're redirected to GitHub's authorization server. You authenticate there (not on the app), review what permissions the app is requesting, and consent. GitHub redirects you back to the app with a short-lived authorization code. The app exchanges this code — along with a {{pkce|PKCE}} (Proof Key for Code {{exchange|Exchange}}) code verifier to prevent interception — for an {{access-token|access token}} and a refresh token. Access tokens are short-lived (minutes to hours); when they expire, the app uses the refresh token to silently obtain a new one without bothering the user.

A critical distinction: [[oauth2|OAuth]] is an authorization {{protocol|protocol}} (what you can access), not an authentication protocol (who you are). Knowing that a token grants read access to someone's repos doesn't tell you who that someone is. OpenID Connect (OIDC) is a thin identity layer built on top of [[oauth2|OAuth]] that adds authentication — it returns an ID token (a {{jwt|JWT}}) containing the user's identity. Together, [[oauth2|OAuth]] + OIDC secure [[rest|REST]] APIs across the web, all running over [[tls|TLS]] on top of [[http1|HTTP]] and [[tcp|TCP]].`,
	howItWorks: [
		{
			title: 'Authorization request',
			description:
				'App redirects the user to the authorization server with client_id, requested scope, a random state parameter for CSRF protection, and a {{pkce|PKCE}} code_challenge derived from a secret code_verifier.'
		},
		{
			title: 'User consent',
			description:
				"The authorization server authenticates the user (login page) and presents a consent screen showing what the app is requesting. The app never sees the user's credentials."
		},
		{
			title: 'Authorization code',
			description:
				"After the user consents, the authorization server redirects back to the app's redirect_uri with a short-lived authorization code and the original state parameter for CSRF verification."
		},
		{
			title: 'Token exchange',
			description:
				'The app sends the authorization code along with the {{pkce|PKCE}} code_verifier to the token endpoint. The server validates the PKCE proof and returns an {{access-token|access token}} (short-lived) and a refresh token (long-lived).'
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
		'Scoped access control for [[rest|REST]] APIs'
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
			'[[oauth2|OAuth]] lets apps access your data with scoped tokens — your password never leaves the identity provider',
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
		wikipedia: 'https://en.wikipedia.org/wiki/[[oauth2|OAuth]]',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc6749',
		official: 'https://oauth.net/2/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Oauth_logo.svg/500px-Oauth_logo.svg.png',
		alt: 'The OAuth open authorization protocol logo',
		caption:
			'The [[oauth2|OAuth]] logo. [[oauth2|OAuth 2.0]] ([[rfc:6749|RFC 6749]], 2012) became the industry standard for delegated authorization — "Sign in with Google," GitHub Apps, and API access tokens all use [[oauth2|OAuth]].',
		credit: 'Image: Chris Messina / CC BY-SA 3.0, via Wikimedia Commons'
	}
};
