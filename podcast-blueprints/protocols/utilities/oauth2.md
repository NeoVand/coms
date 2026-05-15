---
id: oauth2
type: protocol
name: OAuth 2.0
abbreviation: OAuth
etymology: "[O]pen [Auth]orization"
category: utilities-security
year: 2012
rfc: RFC 6749
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - story-of-the-internet/the-ai-agent-layer
  - web-api/mcp-and-a2a
  - utilities-security/oauth-and-jwt
  - famous-outages/facebook-2021
related_protocols: [tls, rest, http1, tcp, kerberos]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [6749, 6750, 7636, 7662, 7009, 8252, 8628, 8705, 9068, 9126, 9396, 9449, 9470, 9635, 9700, 9728]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/Oauth_logo.svg/500px-Oauth_logo.svg.png
    caption: The OAuth logo. RFC 6749, published in October 2012, became the industry standard for delegated authorization — Sign in with Google, GitHub Apps, and API access tokens all run on OAuth 2.0.
    credit: Image — Chris Messina / CC BY-SA 3.0, via Wikimedia Commons
visual_cues:
  - "A four-actor sequence diagram of Authorization Code plus PKCE. Browser, client app, authorization server, resource server. Five labelled arrows — authorize redirect, login and consent, code redirect, token POST with code_verifier, bearer call to the API. The PKCE hash comparison highlighted in a callout box."
  - "An exploded-view diagram of an access-token JWT. Three coloured segments separated by dots — header, payload, signature. The payload claims iss, sub, aud, exp, iat, jti, scope, client_id labelled with one-line meanings. A small RSA-key icon next to the signature segment."
  - "A timeline of OAuth from 2006 to 2026. Pin events: late-2006 CitizenSpace meeting, October 2007 OAuth 1.0, April 2010 RFC 5849, July 2012 Hammer resignation, October 2012 RFC 6749, 2015 PKCE RFC 7636, 2023 DPoP RFC 9449, October 2024 GNAP RFC 9635, January 2025 RFC 9700, March 2026 OAuth 2.1 draft 15."
  - "Storm-0558 cascade as a five-step diagram. 2016 key signed for consumer accounts, April 2021 crash dump leaks key, 2022 enterprise OWA misconfigured to accept consumer-key tokens, May 2023 forged tokens read US State Department mail, June 2023 detection by State Department analysts. Each step linked by red arrows."
  - "A bar chart of authentication scale in 2025. Microsoft Entra ID 1.2 billion sign-ins per day, AWS Cognito 100 billion authentications per month, the April 2024 Entra block rate of 11,000 attacks per second highlighted in a separate callout."
  - "A side-by-side of bearer-token versus DPoP-bound token use. Left panel — attacker steals bearer token, replays at API, gets data. Right panel — attacker steals DPoP-bound access token, has no private key, API rejects request because the DPoP-proof JWT signature fails."
---

# OAuth 2.0 — The Authorization Framework That Runs the Modern Web

## In one breath

OAuth 2.0 is the framework that lets a third-party app reach your data without ever seeing your password. You click Sign in with Google, the app gets back a scoped, time-limited access token, and Google never hands over your credentials. Microsoft Entra ID alone runs more than 1.2 billion of these sign-ins every day. RFC 6749 standardised it in October 2012, and a thirteen-year stack of follow-up RFCs — PKCE, DPoP, the 2025 Security Best Current Practice, and the still-in-draft OAuth 2.1 — has been quietly fixing what shipped.

## The pitch (cold-open)

Every Sign in with Google click. Every GitHub App you install. Every iPhone calendar event from your work account. Every overnight bank-app refresh. They are all running the same six-letter protocol: O-Auth. And in July 2012, three months before its founding RFC was published, the lead editor publicly resigned and called it, quote, "the road to hell." That editor — Eran Hammer — was right about more than he was wrong. Bearer tokens were eventually pinned, redirect-URI matching was eventually tightened, and the spec got rewritten as OAuth 2.1 with the bad parts removed. But OAuth 2.0 also became the most successful authorization protocol in history, and it is now the layer through which AI agents reach into your accounts.

## How it actually works

OAuth has four roles and two endpoints. The **resource owner** is you. The **client** is the app asking for access. The **authorization server**, or AS, runs the login and consent screens. The **resource server** is the API holding the data. The two endpoints are the **authorization endpoint** for browser redirects and the **token endpoint** for back-channel JSON. With OpenID Connect on top there is also a userinfo endpoint and a discovery document at slash dot well-known slash openid-configuration.

The recommended interactive flow is **Authorization Code with PKCE**. After RFC 9700 in January 2025, it is the only interactive flow you should be writing. Step by step:

**Step one — authorization request.** The client picks a random forty-three-to-one-hundred-twenty-eight-character code verifier, hashes it with SHA-256 to produce the code challenge, and redirects the user's browser to the AS. The query string carries response_type equals code, the client_id, the requested scope, a random state value for CSRF defence, and the code_challenge with code_challenge_method equals S256.

**Step two — user consent.** The AS authenticates the user — username and password, passkey, whatever it uses — and shows a consent screen describing what the app is asking for. The user approves. The app never sees the credentials.

**Step three — authorization code.** The AS redirects the browser back to the pre-registered redirect URI with a short-lived authorization code and the original state value. The client compares state to what it sent, defending against cross-site request forgery on the callback.

**Step four — token exchange.** The client posts to the token endpoint with grant_type equals authorization_code, the code, the redirect_uri, the client_id, and the code_verifier. The AS hashes the verifier and checks the result against the stored challenge. If it matches, the same app that started the flow is finishing it.

**Step five — token response.** The AS returns JSON containing an access_token, a token_type of Bearer, an expires_in in seconds, and usually a refresh_token. With OpenID Connect there is also an id_token — a JWT that authenticates the user.

**Step six — API call.** The client calls the resource server with `Authorization: Bearer eyJhbG…`. The resource server validates the token's signature, issuer, audience, and expiry, then checks the scope before returning data.

### Header at a glance

OAuth doesn't have a wire header in the TCP sense. Its primary on-the-wire artefacts are the authorization request URL, the token endpoint POST body, and the Authorization Bearer header on subsequent API calls.

- `response_type=code` says you want the code flow.
- `client_id` identifies the app.
- `redirect_uri` is the exact URL the AS will send the browser back to. In OAuth 2.1 and RFC 9700 this must be exact-string-matched, no wildcards, no path suffixes.
- `scope` is a space-separated list of requested permissions.
- `state` is an opaque random value the client verifies on return — mandatory CSRF defence per RFC 6749 section 10.12.
- `code_challenge` and `code_challenge_method=S256` carry the PKCE proof.
- `nonce` is OpenID Connect only — bound into the ID token to prevent replay.

The token response is JSON with `access_token`, `token_type`, `expires_in`, optional `refresh_token`, and optional `id_token`. A modern access-token JWT carries iss, sub, aud, exp, iat, nbf, jti, scope, and client_id — that is RFC 9068's standardised JWT-AT profile.

### State machine in three sentences

OAuth itself is a stateless redirect dance — the AS holds session state for the user, the client holds the verifier and the state parameter for the duration of one flow, and that's it. There is no long-lived OAuth connection. The state machine that matters in production is the **token lifecycle**: access tokens live minutes to hours and expire, refresh tokens live days to months and rotate, and a reused refresh token revokes the entire chain.

### Reliability, flow, and security mechanics

OAuth's security model is almost entirely defensive layering on top of TLS. RFC 6749 section 1.6 mandates TLS 1.2 or later for any traffic carrying credentials, codes, or tokens; RFC 9700 reinforces it. Without TLS the bearer-token model collapses, because anyone who reads a token over the wire can replay it.

**PKCE** — RFC 7636, 2015, by Sakimura, Bradley, and Agarwal — defends the code itself. Without PKCE, an attacker who steals a redirect URL with the code can race the client to the token endpoint. With PKCE, the attacker doesn't have the verifier, so the AS rejects the exchange.

**State and nonce** defend against CSRF and ID-token replay, respectively.

**Refresh-token rotation with reuse detection** is the modern defence against long-term token theft. Auth0, Okta, and Curity all issue a fresh refresh token on every refresh; if a previously-used refresh token is replayed, the AS revokes the entire chain.

**Sender-constraining** — DPoP from RFC 9449 in September 2023, or mTLS from RFC 8705 in 2020 — re-introduces the cryptographic proof of possession that OAuth 1.0a had and OAuth 2.0 dropped. With DPoP, the client signs a per-request JWT with a private key whose SHA-256 thumbprint is bound into the access token's `cnf.jkt` claim. Stealing the bearer token is no longer enough; you need the key too.

**JWT validation** is the resource server's main job: verify the signature against the JWKS cached from slash dot well-known slash jwks dot json, check iss, aud, exp, nbf, reject `alg: none`, pin the expected algorithm. Storm-0558 succeeded partly because Microsoft 365 didn't validate the audience properly on consumer-signed tokens.

## Where it shows up in production

**Microsoft Entra ID** — the rebranded Azure Active Directory as of July 2023 — authenticates more than 1.2 billion sign-ins per day. During an April 2024 attack spike, Entra blocked 11,000 attacks per second. The 2024-launched regionally isolated authentication endpoints serve six billion requests per day. Entra is the largest production OAuth and OIDC deployment in existence.

**AWS Cognito** processes more than 100 billion authentications per month, per AWS's own blog. The November 2024 pricing change introduced Lite, Essentials, and Plus tiers; overage RPS pricing runs around twenty dollars per RPS-month for continuous use, forty-five dollars per RPS-month for partial-month bursts.

**Sign in with Google**, built directly on OAuth 2.0 plus OpenID Connect, is used by billions of Google account holders. Google's case studies report Reddit roughly doubling sign-in conversion and eBay seeing a one-hundred-percent lift after One Tap.

**Auth0**, now part of Okta since the 2021 acquisition, defaults to one hundred requests per second on its Authentication API. Public Performance Burst tiers hit two times, three times, and four times that for up to forty-eight hours per month. Private Performance Burst tiers go up to six thousand RPS — sixty times the default — for up to eighty hours per month. The free tier covers seventy-five-hundred monthly active users with unlimited logins.

**Okta** uses bucketed rate limits per endpoint per scope — for example, the slash oauth2 slash v1 slash authorize endpoint typically caps at twelve hundred requests per minute org-wide, with nested per-app sub-buckets. Overflow returns four-twenty-nine Too Many Requests with X-Rate-Limit headers.

**Sign in with Apple, GitHub, GitLab, Slack, Stripe Connect, Twilio, Salesforce, Atlassian** all expose OAuth 2.0 plus OpenID Connect. **Keycloak** from Red Hat, **Ory Hydra** with Ory Kratos, **Curity Identity Server**, **Duende IdentityServer** (the commercial replacement for the deprecated free IdentityServer4), and **Spring Authorization Server** (Spring's replacement for the retired Spring Security OAuth) cover the open-source and self-hosted side.

Three deployment patterns dominate. **API gateways** — Kong, Apigee, AWS API Gateway, Tyk — terminate OAuth at the edge, validate the JWT, optionally introspect, and forward minimal context to upstream services. JWKS-backed JWT verification is a memory-only RSA or EC verify after the first JWKS fetch — single-digit milliseconds. Token introspection adds one HTTP round-trip, typically five to fifty milliseconds inside one region. The **BFF pattern** — Backend for Frontend — keeps tokens server-side: the SPA holds only an HTTP-only session cookie, the BFF holds the OAuth tokens. RFC 9700 and the draft-ietf-oauth-browser-based-apps document recommend BFF for any browser-based application. The **sidecar pattern** — a dedicated process per pod, typically Envoy or oauth2-proxy — handles token validation in service-mesh deployments like Istio and Linkerd.

## Things that go wrong

**Storm-0558, May to July 2023.** A Microsoft consumer signing key from 2016 leaked into a crash dump in April 2021, ended up in a debug environment, and stayed there. A Microsoft engineer's corporate account was later compromised, and the attacker — a China-aligned actor Microsoft now tracks as Antique Typhoon — got hold of the key. A separate Exchange Online change had quietly made enterprise OWA accept consumer-key-signed tokens because the SDK didn't validate issuer and audience properly. From May 15 2023 the actor read mailboxes at roughly twenty-five organisations including the US Department of State, the US Department of Commerce, and Congressional staff. The State Department's analysts spotted it on June 16 in audit logs they had specifically asked Microsoft to enable. Microsoft revoked the key on June 29 and went public on July 11. The Cyber Safety Review Board's April 2024 report called the breach "preventable" and Microsoft's security culture "inadequate." If you want the full cascade — every cause-and-consequence step — that's the chapter on OAuth 2.1 and JWT.

**The Google Docs OAuth worm, May 2017.** A fake app literally registered with the name Google Docs harvested mailbox and contacts data from roughly one million users before Google killed it in about an hour. There was no exploit. The attacker abused legitimate OAuth consent. Google added client-name validation afterwards. It was the protocol's design — trust the user's consent — meeting human credulity at scale.

**Facebook View As, September 2018.** Three combined bugs in the video-uploader's interaction with the View As feature caused tokens with mobile-app permissions to be issued for the *viewer's target* user. Roughly fifty million access tokens were stolen; about ninety million were reset.

**Sign-in-with-Apple JWT forgery, May 2020.** Researcher Bhavuk Jain found that Apple would issue valid JWTs for arbitrary email IDs, signed by Apple's key. A single missing check on the binding between authenticated user and JWT subject. Apple paid one hundred thousand dollars.

**GitHub via Heroku and Travis CI, April 2022.** Stolen OAuth integration tokens were used to download dozens of organisations' private repos, including some at npm. GitHub itself wasn't breached — the OAuth tokens Heroku and Travis held for their GitHub integrations were exfiltrated and replayed.

**Booking.com, 2023, Salt Labs.** A redirect_uri path-manipulation flaw plus access-token-validation gaps could have enabled account takeover for any user using Continue with Facebook. The same Pass-The-Token family of attacks hit Vidio with around one hundred million MAU, Bukalapak, Grammarly, Expo (CVE-2023-28131), and Codecademy.

**Microsoft Device Code phishing, February 2025.** Russian APTs spear-phished Microsoft 365 users through the legitimate device-code flow at slash common slash oauth2 slash deviceauth. No CVE, just social engineering against a flow designed for input-constrained devices.

**The 2014 Covert Redirect** — Wang Jing's open-redirect via insufficient redirect URI whitelisting — wasn't a spec defect. RFC 6819 section 4.1.5 already covered it. It exposed lax implementations.

**The Facebook 2021 outage** wasn't an OAuth incident as such, but it taught the industry something OAuth deployments should internalise: when the network goes, the identity provider goes with it, and everything that depends on online IdP round-trips fails together. There's a separate chapter episode on Facebook 2021 — the Cascade — that walks through the BGP withdrawal, the DNS black hole, and the badge readers that locked engineers out of their own data centres.

## Common pitfalls (for the practitioner)

- **Missing or forged `state`.** Symptom: a successful login as someone else. Cure: generate, persist (encrypted cookie), and verify on every callback.
- **Wildcard or path-suffix `redirect_uri` matching.** Symptom: account takeover via crafted redirect. This was the Booking.com 2023 root cause. Cure: exact string match, mandated by RFC 9700 and OAuth 2.1.
- **Audience confusion.** Symptom: a resource server accepting a token issued for a different audience. Storm-0558's enterprise impact rode on this. Cure: validate the `aud` claim with paranoia.
- **`alg: none` attacks.** Symptom: a JWT validates with no signature check. Modern libraries reject it; CVE feeds still find the bug in older ones. Cure: pin the expected algorithm explicitly.
- **Refresh-token theft without rotation.** Symptom: indefinite access after a single token leak. Cure: rotate on every refresh, detect reuse, revoke the chain (RFC 9700 section 4.14).
- **Client-secret leakage in mobile apps and SPAs.** Symptom: secrets pulled out of binaries or JavaScript bundles. Cure: treat these clients as public, no secret, mandatory PKCE.
- **PKCE downgrade.** Symptom: an attacker strips the `code_challenge` and the AS issues a code anyway. Cure: AS rejects auth requests without PKCE (RFC 9700 section 4.8).
- **Confused-deputy or mix-up attacks** between multiple authorization servers. Cure: the `iss` parameter from RFC 9207, and distinct redirect URIs per AS (RFC 9700 section 4.4).
- **Authorization-code injection.** Cure: PKCE binding (RFC 9700 section 4.5).

## Debugging it

- **jwt.io** (Auth0/Okta) and **jwt.ms** (Microsoft) decode and verify JWTs in the browser.
- **oauth.tools** (Curity) walks through full flows.
- **oauthdebugger.com** crafts authorization requests for testing.
- **openidconnect.net** does the same for OIDC.
- **Postman** has built-in OAuth 2.0 helpers for code-flow and client-credentials grants.
- **mitmproxy** and **Burp Suite** intercept and replay OAuth traffic — essential for debugging redirect flows.
- **curl with `-v`** is the no-fuss way to inspect token endpoints. Pipe through `jq` for JSON.
- **Keycloak's quickstarts** at keycloak.org/guides give you a local AS to point clients at.

What to log and alert on: failed token validations broken down by signature, audience, and expiry; refresh-token reuse-detection events; unusually broad scope grants; new OAuth-app installs in a tenant; tokens used from new IPs or ASNs.

## What's changing in 2026

**RFC 9700, January 2025**, is the single most important read of the last twenty-four months. It updates RFCs 6749, 6750, and 6819, formally **deprecates the Implicit grant and the Resource Owner Password Credentials grant**, mandates Authorization Code plus PKCE for public clients, requires exact redirect-URI matching, and provides countermeasures for mix-up attacks, code injection, and PKCE downgrade.

**OAuth 2.1, draft 15, March 2026** — by Hardt, Parecki, and Lodderstedt — consolidates RFC 6749 plus 6750 plus 7636 plus 8252 plus the BCP. It mandates PKCE for **all** clients, requires exact redirect-URI matching, and removes Implicit and ROPC. Still an Internet-Draft, but Spring Authorization Server, Cloudflare Workers, and major IdPs already enforce its rules.

**MCP plus OAuth 2.1.** Anthropic's Model Context Protocol, introduced in late 2024, was retrofitted in mid-2025 to use OAuth 2.1 for agent-to-MCP-server authorization, replacing API keys. The MCP Authorization Specification's November 25 2025 update made MCP servers formal OAuth 2.1 resource servers and mandated RFC 8707 Resource Indicators to prevent token mis-redemption. ChatGPT added custom MCP support in September 2025 requiring OAuth 2.1 plus Dynamic Client Registration; bare bearer tokens are not accepted.

**Cloudflare's OAuth Provider Library for Workers** lets a Worker act as an MCP authorization server in a few hundred lines. Stytch, Auth0, Descope, WorkOS Connect, and Cloudflare Access all offer your-app-as-OAuth-provider-for-AI-agents packages aimed at making it trivial to scope and revoke agent tokens. The full story of the AI agent layer is in the chapter on the AI Agent Layer (2024–) and the chapter on MCP and A2A.

**Client ID Metadata Documents (CIMD)** — the agent's `client_id` is the HTTPS URL of a JSON metadata document hosted by the agent itself, eliminating per-server pre-registration.

**FAPI 2.0, Final on February 22 2025** (OpenID Foundation), mandates either DPoP or mTLS. It is regulator-mandated in Colombia (Circular 004 2024) and the Australian CDR. Formally analysed by Hosseyni, Küsters, and Würtele at the University of Stuttgart, CSF 2024.

**RFC 9728, April 2025**, adds slash dot well-known slash oauth-protected-resource so a client starting from a resource server URL can discover its AS.

**GNAP, RFC 9635, October 2024.** Sometimes called OAuth 3 — Justin Richer co-edited it. It abandons OAuth 2.0 compatibility in exchange for a JSON-only grant-negotiation model and removes the requirement that clients pre-register `client_id` and `client_secret`. Adoption is gradual; OAuth 2.x and GNAP will coexist for years.

**Active drafts as of early 2026**: draft-ietf-oauth-transaction-tokens-08 for propagating identity context across microservices; draft-ietf-oauth-identity-chaining-08 for cross-domain delegation; draft-ietf-oauth-sd-jwt-vc-16 from April 2026 for selective-disclosure verifiable credentials underpinning the EU Digital Identity Wallet; draft-ietf-oauth-cross-device-security-15 from January 2026 for cross-device flow phishing defences (motivated by the February 2025 device-code attacks); draft-ietf-oauth-security-topics-update-01 from March 2026 covering Cross-app OAuth Account Takeover and cross-user session fixation. CUHK's MobiTeC group documented COAT at OSW 2025 and USENIX Security 2025.

**CAEP and the Shared Signals Framework** — OpenID Foundation Final specs published September 2025 — solve the stale long-lived session problem. Identity providers, EDR tools, and SaaS apps push Security Event Tokens to subscribers in real time, so a compromised device immediately revokes its sessions. Microsoft Entra, Okta, Cisco Duo, and Apple Business Manager are early adopters.

**OSW 2026** is in Leipzig, May 27 to 29 2026. The early agenda emphasises AI-agent authorization, identity chaining, transaction tokens, and post-quantum implications for token signing.

## Fun facts (host material)

The "**Road to Hell**" resignation post is the most famous walkout in modern protocol history. Eran Hammer's line — "WS-* bad" — became shorthand among IETF veterans for any standard sunk by enterprise committee design. His prediction has been partly vindicated by the 2017 Google Docs worm, the 2018 Facebook tokens, and Storm-0558, and partly refuted by the fact that OAuth 2.0 became the most-deployed authorization protocol in history.

OAuth 2.0 is **technically a framework, not a protocol**. The abstract of RFC 6749 itself warns that "this specification is likely to produce a wide range of non-interoperable implementations" — language Hammer fought to insert before he resigned.

The **WRAP precursor**, co-developed by Yahoo, Microsoft, and Google in 2009 — originally called Simple OAuth — is OAuth 2.0's actual genetic ancestor. WRAP killed the HMAC signatures of OAuth 1.0 in favour of bearer tokens over TLS and bequeathed the four grant types.

The bearer-token debate. Hammer's lasting objection was that OAuth 2.0 dropped OAuth 1.0a's cryptographic request signing in favour of bearer tokens whose security depends entirely on TLS. **DPoP in 2023 and mTLS in 2020 re-introduced sender-constraining eleven years later**, vindicating that complaint. The wheel had to be reinvented.

**Aaron Parecki's *OAuth 2.0 Simplified*** at oauth.com — Okta-published, continuously updated — started as a single blog post that received hundreds of thousands of views per year and became the de-facto onramp for new developers.

**Vittorio Bertocci's RFC 9470 acknowledgement** thanks "the shampoo manufacturers" — a permanent in-joke in the IETF stream about his legendary curly hair. Bertocci, Principal Architect at Okta, host of the Identity, Unlocked podcast, and co-author of the Step-Up Authentication Challenge, passed away from pancreatic cancer on October 7 2023. The podcast has not produced new episodes since. The OAuth community lost its most prolific public educator at a critical moment.

**OSW — the OAuth Security Workshop** — runs without corporate backing. Daniel Fett, Guido Schmitz, and Steinar Noem started it after two academic groups at Ruhr-Bochum and Trier independently discovered attacks on OAuth and OpenID Connect in 2015. OSW 2025 was in Reykjavík; OSW 2026 is in Leipzig.

The **Google Docs worm of May 2017** was a pure consent-screen exploit: there was no flaw in OAuth, just a malicious app named literally "Google Docs". The protocol worked exactly as designed.

## Where this connects in the book

- **Part Utilities and Security — chapter "OAuth 2.1 and JWT"** is the historical and contextual home episode. It covers the CitizenSpace origin, the Hammer resignation in full, the famous incidents in narrative form, the OAuth 2.1 cleanup, the new RFC wave, and the Bertocci tribute. Anything story-shaped in this protocol's life lives there.
- **Part The Story of the Internet — chapter "The AI Agent Layer (2024–)"** picks up OAuth 2.1 as the authentication substrate of MCP and A2A — the first new application-layer protocols since WebSockets in 2011.
- **Part Web/API — chapter "MCP and A2A"** goes deep on how Anthropic's MCP and Google's A2A both lean on OAuth 2.1 for authentication while running JSON-RPC 2.0 over HTTP, including the Resource Indicators retrofit.
- **Part Famous Outages — chapter "Facebook 2021 — the Cascade"** is not an OAuth episode but the lesson is sharply relevant: when the network disappears, OAuth disappears with it, and the badge readers don't open.

## See also (other protocol episodes)

- **TLS.** OAuth and TLS solve different problems and depend on each other. TLS encrypts the bytes; OAuth says who can read them. RFC 6749 section 1.6 mandates TLS for any OAuth traffic carrying credentials, codes, or tokens. If you've heard the TLS episode, the relationship is one of strict dependency: bearer tokens in cleartext is a disaster, and OAuth's entire security model assumes the channel is encrypted.
- **REST.** OAuth was designed in the REST era to secure REST APIs. Scopes correspond naturally to resource permissions, the `Authorization: Bearer` header travels cleanly with REST verbs, and OpenID Connect's userinfo endpoint is itself a REST resource. The REST episode is the natural pairing — REST is what OAuth protects.
- **HTTP/1.1.** Every OAuth message rides on HTTP. The redirect-based flows use 302s and query strings; the back-channel uses POSTs with form-urlencoded bodies and JSON responses. OAuth makes no functional demands on the HTTP version, so HTTP/2 multiplexing and HTTP/3's QUIC transport work transparently.
- **TCP.** Underneath HTTP is TCP. OAuth notices nothing about it. HTTP/3 swaps TCP for QUIC over UDP, and OAuth still notices nothing.
- **Kerberos.** The enterprise predecessor — ticket-based mutual authentication for Active Directory, Hadoop clusters, NFSv4 mounts — still wins on properties OAuth doesn't address: offline service-to-service auth, no online IdP round-trip per request, native mutual auth. The two coexist in the wild via SPNEGO: a browser's Authorization Negotiate header chains Kerberos when on a corporate network and falls back to NTLM or OAuth otherwise.

## Visual cues for image generation

- A four-actor sequence diagram of Authorization Code plus PKCE. Browser, client app, authorization server, resource server. Five labelled arrows — authorize redirect, login and consent, code redirect, token POST with code_verifier, bearer call to the API. The PKCE hash comparison highlighted in a callout box.
- An exploded-view diagram of an access-token JWT. Three coloured segments separated by dots — header, payload, signature. The payload claims iss, sub, aud, exp, iat, jti, scope, client_id labelled with one-line meanings. A small RSA-key icon next to the signature segment.
- A timeline of OAuth from 2006 to 2026. Pin events: late-2006 CitizenSpace meeting, October 2007 OAuth 1.0, April 2010 RFC 5849, July 2012 Hammer resignation, October 2012 RFC 6749, 2015 PKCE RFC 7636, 2023 DPoP RFC 9449, October 2024 GNAP RFC 9635, January 2025 RFC 9700, March 2026 OAuth 2.1 draft 15.
- Storm-0558 cascade as a five-step diagram. 2016 key signed for consumer accounts, April 2021 crash dump leaks key, 2022 enterprise OWA misconfigured to accept consumer-key tokens, May 2023 forged tokens read US State Department mail, June 2023 detection by State Department analysts. Each step linked by red arrows.
- A bar chart of authentication scale in 2025. Microsoft Entra ID 1.2 billion sign-ins per day, AWS Cognito 100 billion authentications per month, the April 2024 Entra block rate of 11,000 attacks per second highlighted in a separate callout.
- A side-by-side of bearer-token versus DPoP-bound token use. Left panel — attacker steals bearer token, replays at API, gets data. Right panel — attacker steals DPoP-bound access token, has no private key, API rejects request because the DPoP-proof JWT signature fails.

## Sources

### RFCs

- [RFC 6749 — The OAuth 2.0 Authorization Framework](https://www.rfc-editor.org/rfc/rfc6749)
- [RFC 6750 — Bearer Token Usage](https://www.rfc-editor.org/rfc/rfc6750)
- [RFC 7009 — Token Revocation](https://www.rfc-editor.org/rfc/rfc7009)
- [RFC 7519 — JSON Web Token](https://www.rfc-editor.org/rfc/rfc7519)
- [RFC 7636 — PKCE](https://www.rfc-editor.org/rfc/rfc7636)
- [RFC 7662 — Token Introspection](https://www.rfc-editor.org/rfc/rfc7662)
- [RFC 8252 — OAuth 2.0 for Native Apps](https://www.rfc-editor.org/rfc/rfc8252)
- [RFC 8628 — Device Authorization Grant](https://www.rfc-editor.org/rfc/rfc8628)
- [RFC 8705 — mTLS Client Authentication and Certificate-Bound Tokens](https://www.rfc-editor.org/rfc/rfc8705)
- [RFC 9068 — JWT Profile for OAuth 2.0 Access Tokens](https://www.rfc-editor.org/rfc/rfc9068)
- [RFC 9126 — OAuth 2.0 Pushed Authorization Requests](https://www.rfc-editor.org/rfc/rfc9126)
- [RFC 9396 — OAuth 2.0 Rich Authorization Requests](https://www.rfc-editor.org/rfc/rfc9396)
- [RFC 9449 — DPoP](https://datatracker.ietf.org/doc/html/rfc9449)
- [RFC 9470 — OAuth 2.0 Step-Up Authentication Challenge](https://www.rfc-editor.org/rfc/rfc9470.html)
- [RFC 9635 — GNAP Core Protocol](https://www.rfc-editor.org/rfc/rfc9635)
- [RFC 9700 — Best Current Practice for OAuth 2.0 Security](https://datatracker.ietf.org/doc/rfc9700/)
- [RFC 9728 — OAuth 2.0 Protected Resource Metadata](https://datatracker.ietf.org/doc/html/rfc9728)
- [draft-ietf-oauth-v2-1 — OAuth 2.1](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
- [draft-ietf-oauth-transaction-tokens](https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/)
- [draft-ietf-oauth-identity-chaining](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/)
- [draft-ietf-oauth-sd-jwt-vc](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)
- [draft-ietf-oauth-security-topics-update](https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/)
- [draft-oauth-transaction-tokens-for-agents](https://datatracker.ietf.org/doc/draft-oauth-transaction-tokens-for-agents/)
- [OpenID Connect Core 1.0](https://openid.net/specs/openid-connect-core-1_0.html)
- [FAPI 2.0 Security Profile (Final, Feb 2025)](https://openid.net/specs/fapi-security-profile-2_0-final.html)
- [OpenID CAEP 1.0 Final](https://openid.net/specs/openid-caep-1_0-final.html)

### Papers

- [Fett, Küsters, Schmitz — A Comprehensive Formal Security Analysis of OAuth 2.0 (CCS 2016)](https://dl.acm.org/doi/10.1145/2976749.2978385)
- [Hosseyni, Küsters, Würtele — Formal Security Analysis of FAPI 2.0 (CSF 2024)](https://doi.ieeecomputersociety.org/10.1109/CSF61375.2024.00002)
- [CUHK MobiTeC — OSW 2025 / COAT attacks](https://mobitec.ie.cuhk.edu.hk/osw2025/)
- [Daniel Fett — OAuth Security Analysis publications](https://danielfett.de/publications/2016-01-06-oauth-security-analysis/)

### Vendor / engineering blogs

- [oauth.net — OAuth 2.0](https://oauth.net/2/)
- [oauth.net — OAuth 2.1](https://oauth.net/2.1/)
- [oauth.net — GNAP](https://oauth.net/gnap/)
- [Aaron Parecki — OAuth 2.0 Simplified background](https://www.oauth.com/oauth2-servers/background/)
- [WorkOS — OAuth best practices: We read RFC 9700 so you don't have to](https://workos.com/blog/oauth-best-practices)
- [WorkOS — DPoP RFC 9449 explained](https://workos.com/blog/dpop-rfc-9449-explained)
- [WorkOS — RFC 9728 explainer](https://workos.com/blog/introducing-rfc-9728-say-hello-to-standardized-oauth-2-0-resource-metadata)
- [WorkOS — MCP auth for AI agents using CIMD](https://workos.com/blog/mcp-auth-for-ai-agents-how-to-register-a-python-oauth-client-using-cimd)
- [Auth0 — Refresh token rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)
- [Auth0 — Protect your access tokens with DPoP](https://auth0.com/blog/protect-your-access-tokens-with-dpop/)
- [Auth0 — FAPI 2.0 future of API security](https://auth0.com/blog/fapi-2-0-the-future-of-api-security-for-high-stakes-customer-interactions/)
- [Auth0 — Rate-limit policy](https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy)
- [Okta — Rate limits](https://developer.okta.com/docs/reference/rate-limits/)
- [Cloudflare — Building AI agents with MCP, authn, authz, and Durable Objects](https://blog.cloudflare.com/building-ai-agents-with-mcp-authn-authz-and-durable-objects/)
- [Cloudflare — MCP authorization docs](https://developers.cloudflare.com/agents/model-context-protocol/authorization/)
- [Stytch — Agent-to-agent OAuth guide](https://stytch.com/blog/agent-to-agent-oauth-guide/)
- [Stytch — OAuth for MCP example](https://stytch.com/blog/oauth-for-mcp-explained-with-a-real-world-example/)
- [Tyk — DPoP for FAPI 2.0 and Open Banking](https://tyk.io/blog/demonstrating-proof-of-possession-dpop-oauth2-security-for-fapi-2-0-and-open-banking/)
- [Authlete — PKCE explainer](https://www.authlete.com/developers/pkce/)
- [Authlete — Step-up authentication](https://www.authlete.com/developers/stepup_authn/)
- [Microsoft — Storm-0558 analysis](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/)
- [Microsoft MSRC — Storm-0558 root-cause update](https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/)
- [Microsoft Entra resilience update](https://techcommunity.microsoft.com/blog/microsoft-entra-blog/microsoft-entra-resilience-update-workload-identity-authentication/4094704)
- [Wiz — Storm-0558 compromised Microsoft key](https://www.wiz.io/blog/storm-0558-compromised-microsoft-key-enables-authentication-of-countless-micr)
- [GitHub blog — Stolen OAuth user tokens](https://github.blog/news-insights/company-news/security-alert-stolen-oauth-user-tokens/)
- [Facebook 2018 security update](https://about.fb.com/news/2018/09/security-update/)
- [Bhavuk Jain — Sign in with Apple zero-day](https://bhavukjain.com/blog/2020/05/30/zeroday-signin-with-apple/)
- [Salt Labs — Booking.com OAuth flaw](https://salt.security/press-releases/salt-security-uncovers-api-security-flaws-within-booking-com-that-allowed-full-account-takeover-issues-have-been-remediated)
- [Salt Labs — Vidio, Bukalapak, Grammarly, Expo, Codecademy](https://www.itsecuritydemand.com/news/security-news/salt-labs-warns-about-potential-oauth-lapses-in-its-report/)
- [Salt Labs — ChatGPT plugins disclosure](https://securityboulevard.com/2024/04/salt-security-addresses-critical-oauth-vulnerabilities-enhancing-api-security-with-oauth-protection-package/)
- [Eran Hammer — OAuth 2.0 and the Road to Hell (archived)](https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f)
- [Yaron Sheffer — A new RFC published, the GNAP core protocol](https://yaronf.svbtle.com/a-new-rfc-published-the-gnap-core-protocol)
- [Aaron Parecki — 2025 update](https://aaronparecki.com/2025/02/26/1/)
- [Mike Jones — RFC 9728](https://self-issued.info/?p=2653)
- [SGNL — Shared Signals and CAEP final publication](https://sgnl.ai/2025/09/sgnl-welcomes-the-publication-of-the-final-shared-signals-and-caep-specifications/index.html)
- [SGNL — Guide to CAEP white paper](https://sgnl.ai/2025/12/introducing-guide-to-caep-white-paper/)
- [FIDO Alliance — Shared Signals Framework white paper](https://fidoalliance.org/white-paper-fido-and-the-shared-signals-framework/)
- [JavaCodeGeeks — OAuth 2.1 and the death of Implicit flow](https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html)
- [dasroot.net — MCP authorization spec, OAuth 2.1, Resource Indicators](https://dasroot.net/posts/2026/04/mcp-authorization-specification-oauth-2-1-resource-indicators/)
- [Authlete — OSW 2025 / OID4VC](https://www.authlete.com/news/20250217_osw2025/)
- [Frontegg — AWS Cognito pricing](https://frontegg.com/guides/aws-cognito-pricing)
- [The Stack — AWS Cognito pricing change](https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/)
- [Curity Resource Library](https://curity.io/resources/)
- [Google for Developers — Sign in with Google](https://developers.google.com/identity/gsi/web/guides/overview)
- [Google Sign-in case studies](https://developers.google.com/identity/sign-in/case-studies)
- [Cyber Safety Review Board context — Help Net Security](https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/)
- [Volexity / Microsoft device-code phishing — Help Net Security](https://www.helpnetsecurity.com/2025/02/14/microsoft-device-code-authentication-phishing-m365-account-compromise/)
- [Tribute to Vittorio Bertocci — IDPro](https://idpro.org/a-tribute-to-vittorio-luigi-bertocci/)
- [In Celebration of Vittorio Bertocci — Auth0](https://auth0.com/blog/in-celebration-of-vittorio-bertocci/)
- [R.I.P. Vittorio — Global Nerdy](https://www.globalnerdy.com/2023/10/09/r-i-p-super-vittorio-bertocci/)
- [IDPro — OAuth Security Workshop 2025](https://idpro.org/the-oauth-security-workshop-2025/)
- [OAuth Security Workshop](https://oauth.secworkshop.events/)
- [OSW 2026 (Leipzig)](https://oauth.secworkshop.events/osw2026)
- [EPC Group — Microsoft Entra ID enterprise guide 2026](https://www.epcgroup.net/microsoft-entra-id-enterprise-identity-guide-2026)
- [Wintive — Microsoft Entra ID complete guide](https://www.wintive.com/tutorials/microsoft-365/microsoft-entra-id-complete-guide/)
- [Entra.News tribute — 11,000 attacks per second](https://entra.news/p/entranews-13-dedicated-to-vittorio)

### News

- [The Register — OAuth 2.0 standard editor quits (28 July 2012)](https://www.theregister.com/2012/07/28/oauth_editor_quits/)
- [The Register — GitHub stolen OAuth tokens used in breaches](https://www.theregister.com/2022/04/21/github-stolen-oauth-tokens-used-in-breaches/)
- [BankInfoSecurity — 2017 Google Docs OAuth worm](https://www.bankinfosecurity.com/attackers-unleash-oauth-worm-via-google-docs-app-a-9888)
- [Proofpoint — Google OAuth worm follow-up](https://www.proofpoint.com/us/threat-insight/post/google-oauth-worm-leads-proofpoint-discovery)
- [The Hacker News — Covert Redirect](https://thehackernews.com/2014/05/nasty-covert-redirect-vulnerability.html)
- [TechTarget — MCP OAuth update (Nov 2025)](https://www.techtarget.com/searchsoftwarequality/news/366634681/MCP-OAuth-update-adds-security-for-personalized-AI)
- [Truthifi — State of MCP 2026](https://truthifi.com/education/state-of-mcp-2026-ai-agents-custom-connectors)
- [Computer Weekly — Booking.com OAuth flaw](https://www.computerweekly.com/news/365532003/Salt-Labs-identifies-OAuth-security-flaw-within-Bookingcom)
- [CyberScoop — Sign in with Apple bug bounty](https://cyberscoop.com/apple-sign-in-vulnerability-bug-bounty/)
- [EFF — Facebook 2018 data breach](https://www.eff.org/deeplinks/2018/09/facebook-data-breach-affects-least-50-million-users)
- [WeLiveSecurity — 50 million Facebook users breach](https://www.welivesecurity.com/2018/10/01/50-million-facebook-users-breach/)
- [TechTarget — Stolen OAuth tokens lead to dozens of breached GitHub repos](https://www.techtarget.com/searchsecurity/news/252516048/Stolen-Oauth-tokens-lead-to-dozens-of-breached-GitHub-repos)
- [Simon Willison — GNAP](https://simonwillison.net/2024/Oct/14/grant-negotiation-and-authorization-protocol-gnap/)
- [O'Reilly Radar — What's going on with OAuth (2010, on WRAP)](https://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html)

### Wikipedia

- [Wikipedia — OAuth](https://en.wikipedia.org/wiki/OAuth)
