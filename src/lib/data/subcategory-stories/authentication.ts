import type { SubcategoryStory } from './types';

export const authenticationStory: SubcategoryStory = {
	subcategoryId: 'authentication',
	tagline: 'Proving who you are — tickets vs tokens, centralized realms vs federated delegation',
	sections: [
		{
			type: 'narrative',
			title: 'Two Models, Forty Years Apart',
			text: `Authentication has had two great architectural moments in computing history. The first was 1988 at MIT. The second was 2007 at Twitter.\n\n**MIT Project Athena** in the mid-1980s faced a problem few institutions faced at the time: tens of thousands of students, hundreds of shared workstations, dozens of services (mail, print, file storage, login). How does a workstation prove you're you to all those services without sending your password over the network — and without each service needing to know your password? The answer was **[[kerberos|Kerberos]]** (1988), a three-party protocol with a Key Distribution Center, time-stamped *tickets*, and mutual authentication. Kerberos was so good at the campus-scale problem that it became the basis for Windows Active Directory (1999) and remains the authentication backbone of every Windows enterprise environment today.\n\nNineteen years later, Twitter, Flickr, and Magnolia faced a different problem: how does a third-party app (a desktop Twitter client, a photo-uploading tool) get permission to act on behalf of a user *without that user handing over their password*? Users were giving the password directly to the third-party app, which would then call the API as the user — terrifying from a security perspective and impossible to audit. **[[oauth2|OAuth]]** (1.0 in 2010, 2.0 in 2012) is the protocol for *delegated authorization*: the user logs in to the service, grants specific permissions to the app, and the app receives a scoped *token* that lets it act within those limits.\n\nThese are different problems with the same name. Kerberos answers "is this user really alice@example.edu?" in a trusted realm. OAuth2 answers "did alice grant this app permission to read her tweets?" in an untrusted world of third-party developers. Both are alive in 2025; most enterprise login flows touch both — Kerberos for the SSO inside the corporate network, OAuth2 (and OIDC on top of it) for the SaaS apps the SSO federates out to.`
		},
		{
			type: 'pioneers',
			title: 'The Authentication Architects',
			people: [
				{
					id: 'clifford-neuman',
					name: 'Clifford Neuman',
					years: '–',
					title: 'Kerberos Co-author',
					org: 'MIT / USC ISI',
					contribution:
						"Co-authored [[kerberos|Kerberos]] V5 ([[rfc:1510|RFC 1510]], 1993, later [[rfc:4120|RFC 4120]]) at MIT Project Athena with Theodore Ts'o and John Kohl. Kerberos V5 fixed the cryptographic limitations of V4 and added features (delegation, forwardable tickets, cross-realm) that made it work for inter-organization deployment. Neuman\\'s GSS-API work let many protocols (SSH, HTTP, LDAP, NFS) use Kerberos for authentication without each implementing the protocol details."
				},
				{
					id: 'greg-hudson',
					name: 'Greg Hudson',
					years: '–',
					title: 'MIT Kerberos Lead',
					org: 'MIT',
					contribution:
						"Long-time maintainer of the MIT Kerberos reference implementation — the codebase that powers Active Directory, Hadoop, NFSv4 secure mode, and many enterprise SSO deployments. Hudson's sustained engineering on the protocol's reference implementation has kept Kerberos secure and interoperable for two decades after the original designers moved on."
				},
				{
					name: 'Eran Hammer',
					years: '–',
					title: 'OAuth 1.0 Editor / OAuth 2.0 Critic',
					org: 'Independent',
					contribution:
						'Edited the OAuth 1.0 specification ([[rfc:5849|RFC 5849]], 2010) and was the lead author through OAuth 2.0 drafts. Famously resigned from the OAuth 2.0 spec in July 2012 with a blog post ("OAuth 2.0 and the Road to Hell") arguing that the new spec was a developer-experience disaster: too many extension points, too many ways to do the same thing, no required signing, no built-in interop. The post is still cited as both "why OAuth 2 is hard" and "why simple specs win."'
				},
				{
					name: 'Dick Hardt',
					years: '–',
					title: 'OAuth 2.0 Editor',
					org: 'Sxip / Microsoft',
					contribution:
						'Took over from Hammer and shepherded [[oauth2|OAuth 2.0]] to publication ([[rfc:6749|RFC 6749]], 2012). Defended the framework-not-protocol approach: OAuth 2.0 is intentionally a toolkit because the use cases (server-to-server, browser app, mobile app, IoT) genuinely need different flows. The PKCE extension ([[rfc:7636|RFC 7636]], 2015) and OAuth 2.1 (consolidating best practices) are both responses to the worst of the 2012-era flexibility.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1978,
					title: 'Needham-Schroeder Protocol',
					description:
						'The academic foundation for ticket-based authentication. Subsequently shown to have a replay attack (1981) that the Lowe fix (1995) addressed. Kerberos is a Needham-Schroeder descendant with timestamps to prevent the attack.'
				},
				{
					year: 1988,
					title: 'Kerberos V4 at MIT',
					description:
						'[[kerberos|Kerberos]] ships as part of MIT Project Athena. KDC, TGS, ticket-granting tickets, time-synchronized authentication. The model that defines authentication for the next 35 years.'
				},
				{
					year: 1993,
					title: 'Kerberos V5 (RFC 1510)',
					description:
						'Adds delegation, cross-realm authentication, stronger crypto. The version Active Directory will adopt.'
				},
				{
					year: 1999,
					title: 'Active Directory Ships',
					description:
						'Windows 2000 ships Active Directory using [[kerberos|Kerberos]] V5 as the primary authentication protocol. Kerberos goes from "MIT campus thing" to "the auth protocol of corporate computing."'
				},
				{
					year: 2007,
					title: 'OAuth Conceived',
					description:
						"Blaine Cook (Twitter) and Chris Messina want to give third-party apps API access without sharing passwords. The proto-OAuth draft is sketched at a coffee shop. Within a year it's under IETF consideration."
				},
				{
					year: 2010,
					title: 'OAuth 1.0a (RFC 5849)',
					description:
						"OAuth 1.0a — fully spec'd signature-based delegated auth. Used by Twitter, Flickr, Yahoo, Google's first public APIs."
				},
				{
					year: 2012,
					title: 'OAuth 2.0 (RFC 6749)',
					description:
						'[[oauth2|OAuth 2.0]] published. Framework rather than protocol — multiple grant types (authorization code, implicit, client credentials, password). Hammer publicly resigns as editor citing complexity and developer-experience concerns.'
				},
				{
					year: 2014,
					title: 'OpenID Connect 1.0',
					description:
						'OpenID Connect adds *authentication* on top of OAuth 2.0\'s *authorization*. ID tokens, userinfo endpoint, discovery, dynamic client registration. The basis for "Sign in with Google/Microsoft/Apple."'
				},
				{
					year: 2015,
					title: 'PKCE (RFC 7636)',
					description:
						'PKCE — Proof Key for Code Exchange — extends OAuth 2.0 to protect public clients (mobile apps, SPAs) from authorization-code interception. Becomes the recommended pattern for all OAuth flows.'
				},
				{
					year: 2019,
					title: 'WebAuthn / Passkeys',
					description:
						'WebAuthn ships in browsers. Public-key authentication directly from the browser to the relying party, with the private key never leaving the user\'s device. The first credible "passwords are obsolete" deployment.'
				},
				{
					year: 2022,
					title: 'Passkeys Cross-Device Sync',
					description:
						'Apple, Google, Microsoft ship synced passkeys (the same WebAuthn credential available on all your devices). The user-experience layer that lets WebAuthn potentially replace passwords for consumers.'
				},
				{
					year: 2025,
					title: 'OAuth 2.1 Stabilizes',
					description:
						'OAuth 2.1 consolidates a decade of best-current-practice into one spec. Removes implicit and password grants. PKCE required for authorization-code flow. The standardization of "how to do OAuth 2 safely" instead of "OAuth 2 plus six other RFCs."'
				}
			]
		},
		{
			type: 'comparison',
			title: 'Kerberos vs OAuth 2.0',
			axes: [
				'Problem solved',
				'Architecture',
				'Credential',
				'Time semantics',
				'Where it dominates'
			],
			rows: [
				{
					label: '[[kerberos|Kerberos]]',
					values: [
						'"Authenticate this user to many services without sharing their password"',
						'Three-party: client, KDC, service',
						'Time-stamped tickets, short-lived',
						'Tightly synchronized (clock skew > 5 min = ticket invalid)',
						'Active Directory, Hadoop, NFS Kerberos mode, enterprise SSO inside corporate networks'
					]
				},
				{
					label: '[[oauth2|OAuth 2.0]]',
					values: [
						'"Let an app act on a user\'s behalf without that user giving up their password"',
						'Three-party: user, authorization server, resource server',
						'Bearer tokens (anyone with the token has the access)',
						'Loose — tokens have an expiry, but no clock-sync requirement',
						'Public-facing APIs, third-party app authorization, OIDC for federated login'
					]
				}
			],
			note: 'These solve different problems. Kerberos is for *first-party* authentication within a trusted realm. OAuth 2.0 is for *third-party* authorization across organizational boundaries. Modern enterprises run both: Kerberos for SSO inside the network, OAuth 2.0 + OIDC for SaaS access from outside.'
		},
		{
			type: 'animated-sequence',
			title: 'Kerberos AS/TGS Exchange',
			definition: `sequenceDiagram
    participant U as User
    participant AS as Authentication Server
    participant TGS as Ticket Granting Server
    participant S as Service
    Note over U,S: Step 1 — Get a Ticket Granting Ticket
    U->>AS: AS_REQ asking for a TGT as alice
    AS->>AS: look up alice key, encrypt TGT under TGS key
    AS-->>U: AS_REP, TGT and session key encrypted under alice password
    Note over U: decrypt with password — if password correct, has session key
    Note over U,S: Step 2 — Get a service ticket
    U->>TGS: TGS_REQ with TGT, authenticator, and target service
    TGS->>TGS: validate TGT, mint a service ticket for fileserver
    TGS-->>U: TGS_REP with service ticket and new session key
    Note over U,S: Step 3 — Use the service ticket
    U->>S: AP_REQ with service ticket and authenticator
    S->>S: decrypt with service key, validate authenticator timestamp
    S-->>U: AP_REP — mutual-auth response
    Note over U,S: User and service share session key, further messages encrypted`,
			caption:
				'The Kerberos flow has the classic "three-headed dog" structure: AS (initial authentication), TGS (service ticket distribution), and the actual service. The user\'s password never leaves the user\'s machine. The KDC holds keys for *everyone* (users and services), which is also why a KDC compromise is catastrophic.',
			steps: {
				0: '**Step 1 — Get a TGT.** Before the user can talk to *any* service, they need a Ticket Granting Ticket from the AS. This happens once per login session.',
				1: 'User sends an **AS_REQ** identifying themselves. Importantly: this message does **not** contain the password.',
				2: "**AS looks up alice in its database**, retrieves her long-term key (derived from her password), and prepares a TGT encrypted under the TGS's own key (so only the TGS can read it later).",
				3: "**AS_REP** comes back with the TGT *plus* a session key, all encrypted under alice's password-derived key.",
				4: '**User decrypts with the password.** If the password was correct, the decryption succeeds and the user now holds a TGT plus session key. If the password was wrong, the bytes are garbage and the user knows immediately. The password never crossed the wire.',
				5: '**Step 2 — Get a service ticket.** Now the user wants to talk to a specific service (say a file server). They go back to the KDC, but this time present their TGT.',
				6: "User sends **TGS_REQ**: the TGT, a fresh authenticator (timestamp + checksum encrypted under the TGT's session key), and the name of the target service.",
				7: "**TGS validates the TGT** (it can, because TGT is encrypted under TGS's own key) and the authenticator (proving the request is fresh). It then mints a service ticket encrypted under the fileserver's key.",
				8: '**TGS_REP** delivers the service ticket plus a new session key for the user↔fileserver conversation.',
				9: "**Step 3 — Use the service ticket.** The user now has everything needed to authenticate to the fileserver without the KDC's further involvement.",
				10: 'User sends **AP_REQ** to the service: the service ticket plus a fresh authenticator. The service can decrypt the ticket (it has its own key) and validate the authenticator with the session key inside.',
				11: '**Service validates the timestamp.** Authenticator timestamps must be within ~5 minutes — this is why Kerberos is allergic to clock skew.',
				12: "Service replies with **AP_REP**, encrypting a value derived from the user's authenticator to prove mutual authentication (the user knows they're talking to the real fileserver, not an impostor).",
				13: 'From this point, **user and service share a session key** and can talk securely (or at least authenticated) for the lifetime of the service ticket — typically 8 to 24 hours.'
			}
		},
		{
			type: 'callout',
			title: 'Why OAuth 2.0 Looks Like a Mess',
			text: `If you've ever tried to implement [[oauth2|OAuth 2.0]], you've probably been confused. There are *four* grant types. Tokens come in *two* forms (access + refresh). There's ID Token on top via OpenID Connect. There's PKCE for public clients. There's dynamic client registration. There's the authorization endpoint, the token endpoint, the userinfo endpoint, the discovery endpoint. The total spec surface across OAuth 2.0 + OIDC + PKCE + Dynamic Registration is hundreds of pages.\n\nEran Hammer's 2012 resignation post — *"OAuth 2.0 and the Road to Hell"* — argued this was a disaster:\n\n> *"What I think will be the result is many vendors leveraging the framework, but very little interoperability. The market will need to consolidate on one or two specific implementations of OAuth 2.0... I just don't think it's going to be pretty."*\n\nThirteen years later, the prediction was right *and* wrong. Right: most OAuth 2.0 deployments use one of a small number of standard flows (authorization code with PKCE for web/mobile; client credentials for service-to-service; refresh tokens for long-lived access). Wrong: the patterns *did* consolidate. OAuth 2.1 is the spec that finally documents "the way it actually got done." If you implement OAuth 2.1 today, you can interop with almost anything.\n\nThe flexibility Hammer hated was the cost of OAuth 2.0's success: it's used by everything from a JavaScript SPA to an embedded device to a B2B API, and a single grant type couldn't serve all of those. The spec sprawl was the price; the market consolidation came eventually.`
		},
		{
			type: 'narrative',
			title: 'The Failure Modes',
			text: `[[kerberos|Kerberos]]'s failure mode is **clock skew**. Tickets are timestamped and have a hard validity window (default 5 minutes). If a client's clock drifts more than that from the KDC, every authentication fails with a cryptic error. The fix — NTP-sync everything — is universal in well-run environments. The pathological cases are battery-backed CMOS clocks dying on a VM after a long power-off; the entire host's Kerberos breaks until you fix the clock. (Microsoft's Windows Time Service exists largely to manage this for AD environments.)\n\nKerberos' second failure mode is **the KDC as single point of failure**. The KDC holds the keys for every principal in the realm; if it dies, no one can authenticate. Active Directory uses domain controllers that replicate, but the dependency is real — a network partition that isolates a site from its KDCs degrades to "you can't log in" within ticket lifetime.\n\n[[oauth2|OAuth 2.0]]'s failure mode is **bearer tokens**. The access token is a *bearer credential* — anyone holding it has the access. If your access token leaks (XSS, logged in error reports, stored in a wrong place), anyone with it can act as you until it expires. Mitigations: keep tokens short-lived (5–60 minutes), use refresh tokens with rotation, deploy DPoP (Demonstrating Proof-of-Possession) where the token is bound to a key the client holds. But "bearer tokens are bearer tokens" is the dominant production reality, and token exfiltration is the dominant OAuth attack class.\n\nBoth share a third failure mode: **the trusted-CA problem at scale**. Kerberos cross-realm trust is hand-configured between realms (manageable for a corporation, painful for a federation of universities). OAuth's federation depends on the user trusting that "Sign in with Google" really is Google, that the OIDC issuer is who it says it is. {{phishing|Phishing}} consent screens — fake login pages styled exactly like the real one — are the most common attack against OAuth in 2025.`
		},
		{
			type: 'narrative',
			title: "What's Next",
			text: `Active work in 2025:\n\n- **Passkeys and WebAuthn** are slowly displacing password-based authentication. Cross-device synced passkeys (Apple, Google, Microsoft, 1Password, Bitwarden) make WebAuthn UX usable by non-technical users. The "death of the password" has been promised for 20 years; it's finally happening for consumer logins.\n- **OAuth 2.1** consolidates best practices into one spec. Many libraries and providers already implement the 2.1 conservative subset.\n- **DPoP** (Demonstrating Proof-of-Possession, [[rfc:9449|RFC 9449]]) binds OAuth tokens to a client-held key. Mitigates the bearer-token leak problem. Adoption is uneven but growing.\n- **Sender-constrained access tokens** in general — TLS-bound, certificate-bound, or DPoP-bound — are the long-term answer to "bearer tokens are too easy to steal."\n- **Workload Identity Federation** lets cloud workloads (GCP, AWS, Azure VMs / containers) authenticate to *other* clouds without long-lived API keys. The OAuth pattern applied to machine-to-machine auth.\n- **The Kerberos slow decline** continues. Cloud-native deployments don't use it; new enterprise systems default to OIDC. Active Directory remains, but the action is in Entra ID and similar cloud SSO products that *speak* AD-compatible protocols at the edge while running OAuth+OIDC underneath.\n- **MCP and OAuth 2.0 convergence** — Anthropic's Model Context Protocol picked OAuth 2.1 + DCR (Dynamic Client Registration) as the auth model for remote MCP servers. The new agent ecosystem is being built on OAuth from day one.`
		}
	]
};
