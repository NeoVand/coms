---
prompt_source: deep-research-prompts.txt:9160-9337 (PROTOCOL · OAuth)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/dcefb542-de72-4aec-94a2-016277184092
research_mode: claude.ai Research
---

# OAuth 2.0: A Complete Citation-Backed Reference (May 2026)

> A deep technical and historical reference for engineers. Verified against 2024–2026 sources where possible. Older sources (pre-2024) are cited only where they remain authoritative or describe historical events. Today's date: 2026-05-05.

---

## 1. Prerequisites and glossary

Before OAuth 2.0 makes any sense, you need a working mental model of how a request travels from a browser to a server and back. The list below covers every term used in the rest of this report. Each term has a one- or two-sentence definition and a link to an authoritative source.

**Networking and transport**

- **OSI / TCP-IP layers** — Conceptual layered model for network protocols. OAuth lives at L7 (application). TLS (L5/6 in OSI thinking) protects the bytes; TCP (L4) carries them; IP (L3) routes them. ([https://www.rfc-editor.org/rfc/rfc1122](https://www.rfc-editor.org/rfc/rfc1122))
- **TCP** — Reliable, ordered, byte-stream transport. OAuth runs over HTTPS over TCP, normally on port 443. ([https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293))
- **Socket** — OS abstraction for one end of a TCP/UDP connection (IP + port). ([https://man7.org/linux/man-pages/man2/socket.2.html](https://man7.org/linux/man-pages/man2/socket.2.html))
- **TLS** — Transport Layer Security; encrypts and authenticates a TCP stream. OAuth 2.0 mandates TLS for all token-bearing traffic. ([https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446))
- **Handshake** — The initial round-trips that negotiate keys and parameters (TLS handshake) before encrypted application data flows.
- **HTTP / HTTP/1.1 / HTTP/2 / HTTP/3** — The application protocol OAuth messages travel on. ([https://www.rfc-editor.org/rfc/rfc9110](https://www.rfc-editor.org/rfc/rfc9110), [https://www.rfc-editor.org/rfc/rfc9112](https://www.rfc-editor.org/rfc/rfc9112), [https://www.rfc-editor.org/rfc/rfc9113](https://www.rfc-editor.org/rfc/rfc9113), [https://www.rfc-editor.org/rfc/rfc9114](https://www.rfc-editor.org/rfc/rfc9114))
- **Header** — Key-value metadata in an HTTP request/response (e.g. `Authorization: Bearer …`).
- **REST** — Architectural style for HTTP APIs based on resources, verbs, and statelessness. OAuth was designed to secure REST APIs. (Roy Fielding, 2000 thesis: [https://ics.uci.edu/~fielding/pubs/dissertation/top.htm](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm))
- **User-agent** — Software acting on behalf of the user, almost always a web browser, that follows OAuth's HTTP redirects.

**Encoding and data formats**

- **JSON** — Lightweight text data format. ([https://www.rfc-editor.org/rfc/rfc8259](https://www.rfc-editor.org/rfc/rfc8259))
- **Base64URL** — URL-safe Base64 with `-`/`_` and no padding; used for JWT segments and PKCE. (RFC 4648 §5: [https://www.rfc-editor.org/rfc/rfc4648](https://www.rfc-editor.org/rfc/rfc4648))
- **JWT (JSON Web Token)** — Compact JSON-payload token with three Base64URL parts (`header.payload.signature`). ([https://www.rfc-editor.org/rfc/rfc7519](https://www.rfc-editor.org/rfc/rfc7519))
- **JWS / JWE / JWA / JWK / JOSE** — The JOSE family: signed JWS (RFC 7515), encrypted JWE (RFC 7516), algorithms JWA (RFC 7518), keys JWK (RFC 7517).

**Cryptographic primitives**

- **HMAC** — Symmetric keyed hash, e.g. `HS256` for JWT. (RFC 2104)
- **RSA / RS256, PS256** — Asymmetric signature; `RS256` is the most-deployed JWT signing algorithm.
- **ECDSA / ES256** — Elliptic-curve signature; standard for DPoP. (RFC 9449 §6.1)
- **SHA-256** — Hash function used by PKCE's `S256` method.

**OAuth core vocabulary** (all from RFC 6749 §1.1, [https://www.rfc-editor.org/rfc/rfc6749](https://www.rfc-editor.org/rfc/rfc6749))

- **Resource owner** — The end user (or system) who owns the data. They consent to access.
- **Client** — The application requesting access. *Public* clients (SPAs, mobile) cannot keep a secret; *confidential* clients (server-side) can.
- **Resource server** — The API holding the protected resources, validates access tokens.
- **Authorization server (AS)** — Issues tokens; runs the `/authorize` and `/token` endpoints.
- **Authorization endpoint** — Where the user-agent is redirected to get user consent.
- **Token endpoint** — Where the client exchanges a grant for tokens.
- **Redirect URI** — The pre-registered URL the AS sends the user back to. Must be exact-matched in OAuth 2.1 ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)). [OAuth](https://oauth.net/2.1/)[Java Code Geeks](https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html)
- **Scope** — Space-separated string list naming requested permissions.
- **Access token** — Credential presented to the resource server. May be opaque or a JWT.
- **Refresh token** — Long-lived credential used to mint new access tokens.
- **ID token** — OIDC-only JWT that *authenticates* the user (RFC name: ID Token; spec: OpenID Connect Core 1.0, [https://openid.net/specs/openid-connect-core-1_0.html](https://openid.net/specs/openid-connect-core-1_0.html)).
- **Bearer token** — Any token where mere possession authorizes the bearer (RFC 6750, [https://www.rfc-editor.org/rfc/rfc6750](https://www.rfc-editor.org/rfc/rfc6750)).
- **State parameter** — Opaque value the client sends in the auth request and verifies on return; CSRF defense (RFC 6749 §10.12).
- **Nonce** — OIDC: replay defender, bound into the ID token (OIDC Core §3.1.2.1).
- **Claim / audience (`aud`) / issuer (`iss`)** — JWT fields. `aud` says who the token is for; `iss` says who issued it (RFC 7519 §4.1).
- **PKCE / code_verifier / code_challenge** — Public-client defense against authorization-code interception. Client picks random `code_verifier` (43–128 chars), sends `code_challenge = BASE64URL(SHA256(verifier))` with `code_challenge_method=S256` in the auth request, then the verifier on the token request (RFC 7636, [https://www.rfc-editor.org/rfc/rfc7636](https://www.rfc-editor.org/rfc/rfc7636)). [Authlete](https://www.authlete.com/developers/pkce/)
- **Introspection** — Resource server asks the AS, "is this token still valid, and what does it grant?" (RFC 7662, [https://www.rfc-editor.org/rfc/rfc7662](https://www.rfc-editor.org/rfc/rfc7662)).
- **Revocation** — Client tells the AS to invalidate a token (RFC 7009, [https://www.rfc-editor.org/rfc/rfc7009](https://www.rfc-editor.org/rfc/rfc7009)).
- **DPoP (Demonstrating Proof of Possession)** — Application-layer sender-constraining; client signs a per-request JWT with a private key whose thumbprint is bound into the token's `cnf` claim (RFC 9449, [https://datatracker.ietf.org/doc/html/rfc9449](https://datatracker.ietf.org/doc/html/rfc9449)). [WorkOS](https://workos.com/blog/dpop-rfc-9449-explained)
- **mTLS** — Mutual TLS; client cert binds to the token (RFC 8705, [https://www.rfc-editor.org/rfc/rfc8705](https://www.rfc-editor.org/rfc/rfc8705)).
- **FAPI** — Financial-grade API security profile from the OpenID Foundation. FAPI 2.0 was approved as Final on 22 February 2025 ([https://openid.net/specs/fapi-security-profile-2_0-final.html](https://openid.net/specs/fapi-security-profile-2_0-final.html)). [Medium](https://medium.com/@dimapostnikov/implementers-guide-fapi-2-0-final-specification-vs-implementers-draft-2-0-fc148b013969)

---

## 2. History and story

OAuth was born from a concrete pain point: in late 2006, **Blaine Cook**, then chief architect at Twitter, was implementing OpenID for Twitter and needed a way to delegate API access without handing over passwords. He, **Chris Messina**, **David Recordon**, and **Larry Halff** of Ma.gnolia met at a CitizenSpace OpenID gathering and concluded that no open API-delegation standard existed ([https://oauth.net/about/introduction/](https://oauth.net/about/introduction/)). At the time the landscape was a patchwork of proprietary schemes — Yahoo BBAuth, Google AuthSub, AOL OpenAuth, Flickr Auth, Facebook's MD5-signed scheme — each incompatible ([https://www.oauth.com/oauth2-servers/background/](https://www.oauth.com/oauth2-servers/background/)). A Google group was formed in April 2007; **DeWitt Clinton** at Google joined as a stakeholder; **Eran Hammer** (then at Yahoo) took over as community chair and editor; **OAuth Core 1.0** was released as a final draft in October 2007 and finalized by year's end ([https://oauth.net/about/introduction/](https://oauth.net/about/introduction/)). [Medium + 6](https://medium.com/@kiranchowdhary/oauth-2-0-a-a-8f08e116974c)

A **session-fixation flaw** found in April 2009 forced an emergency revision; **OAuth 1.0a** corrected it. The community version became **RFC 5849** in April 2010 ([https://en.wikipedia.org/wiki/OAuth](https://en.wikipedia.org/wiki/OAuth)).

In parallel, **Yahoo, Microsoft, and Google** decided OAuth 1.0 didn't scale. They produced **WRAP (Web Resource Authorization Protocol)** — originally "Simple OAuth" — which dropped HMAC signatures in favour of bearer tokens over TLS and added new flow types ([https://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html](https://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html)). WRAP was folded into the IETF OAuth WG and became the basis of OAuth 2.0. [Dark Reading + 3](https://www.darkreading.com/cyber-risk/the-road-to-hell-is-authenticated-by-facebook)

The OAuth 2.0 effort moved into the IETF in 2009 with Hammer as lead editor. After three years and 22+ drafts, the political fissure between web-scale companies (Google, Facebook, Twitter) and enterprise vendors (Microsoft, Salesforce) became unbridgeable. On **26 July 2012** Hammer published "**OAuth 2.0 and the Road to Hell**" ([https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f](https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f), archive of the original hueniverse.com post). His core complaints, in his own words:

> "Last month I reached the painful conclusion that I can no longer be associated with the OAuth 2.0 standard. I resigned my role as lead author and editor, withdraw my name from the specification, and left the working group." [GitHub](https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f)

> "When compared with OAuth 1.0, the 2.0 specification is more complex, less interoperable, less useful, more incomplete, and most importantly, less secure." [GitHub](https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f)

> "At the core of the problem is the strong and unbridgeable conflict between the web and the enterprise worlds … The resulting specification is a designed-by-committee patchwork of compromises that serves mostly the enterprise." [GitHub](https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f)

> "Bringing OAuth to the IETF was a huge mistake. … At the end, I reached the conclusion that OAuth 2.0 is a bad protocol. WS-* bad. It is bad enough that I no longer want to be associated with it." ([https://www.theregister.com/2012/07/28/oauth_editor_quits/](https://www.theregister.com/2012/07/28/oauth_editor_quits/)) [GitHub](https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f)[Scott's Thoughts](https://scottwhill.com/thoughts/oauth-2-0-and-the-road-to-hell)

**Dick Hardt** took over as editor and shepherded the spec to publication. **RFC 6749 (OAuth 2.0 Authorization Framework)** and **RFC 6750 (Bearer Token Usage)** were published in **October 2012** ([https://www.rfc-editor.org/rfc/rfc6749](https://www.rfc-editor.org/rfc/rfc6749), [https://www.rfc-editor.org/rfc/rfc6750](https://www.rfc-editor.org/rfc/rfc6750)). The disclaimer Hammer warned of survived in the abstract: the spec is a *framework*, not a protocol, and "is likely to produce a wide range of non-interoperable implementations." [Medium + 3](https://aaujayasena.medium.com/understanding-oauth-2-0-c85d05d8ed66)

The next decade was about plugging the holes Hammer had warned about, one extension RFC at a time:

| Year | RFC | Topic |
|---|---|---|
| 2013 | 6819 | Threat model |
| 2013 | 7009 | Token revocation |
| 2015 | 7515–7519 | JOSE / JWT family |
| 2015 | 7591/7592 | Dynamic client registration |
| 2015 | 7636 | **PKCE** (Sakimura/Bradley/Agarwal, [https://www.rfc-editor.org/rfc/rfc7636](https://www.rfc-editor.org/rfc/rfc7636)) [IETF](https://datatracker.ietf.org/doc/rfc7636/bibtex/) |
| 2015 | 7662 | Token introspection |
| 2015 | 7521–7523 | Assertion grants (incl. SAML and JWT bearer) |
| 2017 | 8252 | OAuth for native apps (BCP) |
| 2018 | 8414 | Authorization Server Metadata |
| 2019 | 8628 | Device Authorization Grant |
| 2020 | 8705 | mTLS client auth and certificate-bound tokens |
| 2021 | 9068 | JWT profile for access tokens |
| 2021 | 9126 | PAR (Pushed Authorization Requests) |
| 2023 | 9396 | RAR (Rich Authorization Requests) |
| 2023 | 9449 | **DPoP** (Fett/Campbell/Bradley/Lodderstedt/Jones/Waite, September 2023, [RFC Editor](https://www.rfc-editor.org/rfc/rfc9449.pdf) [https://datatracker.ietf.org/doc/html/rfc9449](https://datatracker.ietf.org/doc/html/rfc9449)) |
| 2023 | 9470 | Step-Up Authentication Challenge (Bertocci/Campbell, [Global Nerdy](https://www.globalnerdy.com/2023/10/09/r-i-p-super-vittorio-bertocci/) [https://www.rfc-editor.org/rfc/rfc9470.html](https://www.rfc-editor.org/rfc/rfc9470.html)) |
| October 2024 | **9635** | **GNAP** core protocol (Richer/Imbault, [RFC Editor](https://www.rfc-editor.org/rfc/rfc9635) [https://www.rfc-editor.org/rfc/rfc9635](https://www.rfc-editor.org/rfc/rfc9635)) |
| **January 2025** | **9700** | **Best Current Practice for OAuth 2.0 Security** (Lodderstedt/Bradley/Labunets/Fett, [IETF](https://www.ietf.org/rfc/rfc9700.pdf) [https://datatracker.ietf.org/doc/rfc9700/](https://datatracker.ietf.org/doc/rfc9700/)) |
| April 2025 | 9728 | OAuth 2.0 Protected Resource Metadata (Jones/Hunt/Parecki, [IETF](https://datatracker.ietf.org/doc/html/rfc9728) [https://datatracker.ietf.org/doc/html/rfc9728](https://datatracker.ietf.org/doc/html/rfc9728)) |

**RFC 9700 (January 2025)** is the most important development of the last 24 months. It updates RFCs 6749, 6750, and 6819, formally **deprecates the Implicit grant and the Resource Owner Password Credentials grant**, mandates Authorization Code + PKCE for public clients, requires exact redirect-URI matching, and provides countermeasures for mix-up attacks, code injection, and PKCE downgrade ([https://datatracker.ietf.org/doc/rfc9700/](https://datatracker.ietf.org/doc/rfc9700/), [https://workos.com/blog/oauth-best-practices](https://workos.com/blog/oauth-best-practices)). A follow-up "Updates to OAuth 2.0 Security BCP" working-group draft (`draft-ietf-oauth-security-topics-update-01`, March 2026) is already in flight, adding mitigations for "Cross-app OAuth Account Takeover (COAT)" attacks ([https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/](https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/)). [IETF + 6](https://datatracker.ietf.org/doc/rfc9700/)

**OAuth 2.1** continues as `draft-ietf-oauth-v2-1`. The most recent revision is **draft-ietf-oauth-v2-1-15** (Hardt, Parecki, Lodderstedt; published 2 March 2026; expires 3 September 2026, [https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)). It consolidates RFC 6749 + RFC 6750 + RFC 7636 + RFC 8252 + the BCP, mandates PKCE for *all* clients, requires exact redirect-URI matching, and removes Implicit and ROPC. It is still an Internet-Draft, not yet an RFC, but Spring Authorization Server, Cloudflare Workers, and major IdPs already enforce its rules ([https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html](https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html)). [IETF + 3](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)

**GNAP (RFC 9635, October 2024)** is sometimes called "OAuth 3" — Justin Richer co-edited it. It abandons compatibility with OAuth 2.0 in exchange for a cleaner JSON-based grant-negotiation model and removes the requirement that clients pre-register `client_id`/`client_secret` ([https://oauth.net/gnap/](https://oauth.net/gnap/), [https://simonwillison.net/2024/Oct/14/grant-negotiation-and-authorization-protocol-gnap/](https://simonwillison.net/2024/Oct/14/grant-negotiation-and-authorization-protocol-gnap/)). Adoption is gradual; OAuth 2.x and GNAP will coexist for years. [Simon Willison + 2](https://simonwillison.net/2024/Oct/14/grant-negotiation-and-authorization-protocol-gnap/)

**Active 2025–2026 IETF drafts** worth tracking: `draft-ietf-oauth-transaction-tokens-08` (Tulshibagwale, Fletcher, Kasselman) for propagating identity context across microservices in a trust domain ([https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/](https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/)); `draft-ietf-oauth-identity-chaining-08` (Schwenkschuster, Kasselman, Burgin, Jenkins, Campbell, [https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/)) for cross-domain delegation; `draft-ietf-oauth-sd-jwt-vc-16` (April 2026; Terbu/Fett/Campbell, [https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)) for selective-disclosure verifiable credentials underpinning the EU Digital Identity Wallet; `draft-ietf-oauth-cross-device-security-15` (Kasselman/Fett/Skokan); `draft-ietf-oauth-first-party-apps-03`; `draft-ietf-oauth-rfc7523bis-05`. [IETF + 3](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-transaction-tokens-06)

**FAPI 2.0** (OpenID Foundation) was approved as Final on **22 February 2025** ([https://openid.net/specs/fapi-security-profile-2_0-final.html](https://openid.net/specs/fapi-security-profile-2_0-final.html), [https://openid.net/fapi2-0-final-conformance-tests-available/](https://openid.net/fapi2-0-final-conformance-tests-available/)). It mandates either DPoP or mTLS, is regulator-mandated in Colombia (Circular 004 2024) and the Australian CDR, and was formally analyzed by the University of Stuttgart (Hosseyni, Küsters, Würtele, CSF 2024, [https://doi.ieeecomputersociety.org/10.1109/CSF61375.2024.00002](https://doi.ieeecomputersociety.org/10.1109/CSF61375.2024.00002)). [OpenID + 2](https://openid.net/fapi2-0-final-conformance-tests-available/)

**OpenID Connect** is the identity layer built directly on OAuth 2.0 — it adds an **ID Token** (a JWT delivered alongside the access token), the `openid` scope, the `nonce` parameter, and a `/userinfo` endpoint ([https://openid.net/specs/openid-connect-core-1_0.html](https://openid.net/specs/openid-connect-core-1_0.html)). Without OIDC, OAuth 2.0 has no standard way to *authenticate* a user. [arxiv + 2](https://arxiv.org/pdf/1508.01707)

**Key people**: Eran Hammer (1.0 architect, OAuth 2.0 first editor, resigned 2012); Dick Hardt (took over OAuth 2.0 editorship; co-editor of OAuth 2.1); Aaron Parecki (Director of Identity Standards at Okta, maintains oauth.net, co-editor of OAuth 2.1, author of RFC 9728); Justin Richer (lead editor of GNAP/RFC 9635, co-author of *OAuth 2 in Action*); Brian Campbell (Ping Identity, co-author of DPoP, RFC 9470); John Bradley (Yubico, co-author of PKCE, DPoP, RFC 9700); Nat Sakimura (NAT Consulting; co-author of PKCE; OIDF FAPI co-chair); Mike Jones (self-issued; JOSE/JWT and RFC 9728 co-author); Hannes Tschofenig (long-time OAuth WG co-chair); Torsten Lodderstedt (SPRIND; lead author of RFC 9700, OAuth 2.1 co-editor); Daniel Fett (Authlete; formal-analysis pioneer, DPoP/RFC 9700/SD-JWT co-author, organizes OSW). **Vittorio Bertocci** — Principal Architect at Okta, host of the *Identity, Unlocked* podcast, co-author of RFC 9470 — passed away from pancreatic cancer on **7 October 2023** ([https://idpro.org/a-tribute-to-vittorio-luigi-bertocci/](https://idpro.org/a-tribute-to-vittorio-luigi-bertocci/), [https://auth0.com/blog/in-celebration-of-vittorio-bertocci/](https://auth0.com/blog/in-celebration-of-vittorio-bertocci/)). The podcast has not produced new episodes since then; the back catalogue remains available. [Aaron Parecki + 2](https://aaronparecki.com/2025/02/26/1/)

---

## 3. How it actually works

### Roles and endpoints

```
+--------+                              +---------------+
| Client | --(1) Authorization request--> Authorization |
|        | <--(2) Authorization grant--- Server (AS)   |
|        | --(3) Grant + PKCE verifier--> /token        |
|        | <--(4) Access (and refresh)-- token endpoint |
|        | --(5) Bearer token----------> Resource Server|
+--------+                              +---------------+
```

The two endpoints are the **authorization endpoint** (browser-facing, returns codes via redirect) and the **token endpoint** (back-channel, JSON in/out). With OIDC there's also `/userinfo` and `/.well-known/openid-configuration`. RFC 9728 (April 2025) adds `/.well-known/oauth-protected-resource` so a client starting from a resource server URL can discover its AS ([https://datatracker.ietf.org/doc/html/rfc9728](https://datatracker.ietf.org/doc/html/rfc9728)). [The road](https://kane.mx/posts/2025/mcp-authorization-oauth-rfc-deep-dive/)

### Grant types

| Grant | Status (2026) | Use case |
|---|---|---|
| **Authorization Code + PKCE** | **The only recommended interactive grant** (RFC 9700, OAuth 2.1) | Web apps, SPAs, mobile, AI agents |
| **Client Credentials** | Recommended | Service-to-service |
| **Refresh Token** | Recommended (with rotation) | Renewing access without re-prompting |
| **Device Authorization Grant (RFC 8628)** | Recommended for input-constrained devices | TVs, CLIs |
| **JWT Bearer (RFC 7523)** / **SAML Bearer (RFC 7522)** | Used for federation/exchange | Crossing trust domains |
| **Implicit (`response_type=token`)** | **Deprecated by RFC 9700; removed in OAuth 2.1** [OAuth](https://oauth.net/2.1/) | None |
| **Resource Owner Password Credentials (ROPC)** | **Deprecated by RFC 9700; removed in OAuth 2.1** | None |

### Authorization Code + PKCE flow, step by step

Resource ServerAuthorization ServerClientBrowserUserResource ServerAuthorization ServerClientBrowserUser#mermaid-rfg{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rfg .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rfg .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rfg .error-icon{fill:#CC785C;}#mermaid-rfg .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rfg .edge-thickness-normal{stroke-width:1px;}#mermaid-rfg .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rfg .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rfg .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rfg .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rfg .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rfg .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rfg .marker.cross{stroke:#A1A1A1;}#mermaid-rfg svg{font-family:inherit;font-size:16px;}#mermaid-rfg p{margin:0;}#mermaid-rfg .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rfg text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .actor-line{stroke:#A1A1A1;}#mermaid-rfg .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rfg .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rfg #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfg .sequenceNumber{fill:#5e5e5e;}#mermaid-rfg #sequencenumber{fill:#E5E5E5;}#mermaid-rfg #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rfg .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rfg .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rfg .labelText,#mermaid-rfg .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .loopText,#mermaid-rfg .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rfg .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rfg .noteText,#mermaid-rfg .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rfg .activation0{fill:transparent;stroke:#00000000;}#mermaid-rfg .activation1{fill:transparent;stroke:#00000000;}#mermaid-rfg .activation2{fill:transparent;stroke:#00000000;}#mermaid-rfg .actorPopupMenu{position:absolute;}#mermaid-rfg .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rfg .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rfg .actor-man circle,#mermaid-rfg line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rfg :root{--mermaid-font-family:inherit;}code_verifier = random(43-128 chars)code_challenge = BASE64URL(SHA256(verifier))302 to /authorize?...&code_challenge=...&code_challenge_method=S256&state=...GET /authorize?...Login + consent UIApprove302 to redirect_uri?code=AUTH_CODE&state=...GET redirect_uri?code=...&state=...Verify state matchesPOST /token (code, code_verifier, client_id)Verify SHA256(verifier) == stored challenge{access_token, refresh_token, id_token?}GET /api/resource (Authorization: Bearer ...)Validate JWT (iss, aud, exp, sig) OR introspect200 OK + protected data

### On-the-wire example

**Step 1 — Authorization Request** (browser is redirected here):

```
GET /authorize?response_type=code
  &client_id=s6BhdRkqt3
  &redirect_uri=https%3A%2F%2Fclient.example.com%2Fcb
  &scope=openid%20profile%20read%3Aorders
  &state=af0ifjsldkj
  &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
  &code_challenge_method=S256
  &nonce=n-0S6_WzA2Mj HTTP/1.1
Host: as.example.com
```

**Step 2 — User consents.** AS responds:

```
HTTP/1.1 302 Found
Location: https://client.example.com/cb?code=SplxlOBeZQQYbYS6WxSbIA&state=af0ifjsldkj
```

**Step 3 — Token Request** (server-to-server):

```
POST /token HTTP/1.1
Host: as.example.com
Content-Type: application/x-www-form-urlencoded
Authorization: Basic czZCaGRSa3F0MzpnWDFmQmF0M2JW

grant_type=authorization_code
&code=SplxlOBeZQQYbYS6WxSbIA
&redirect_uri=https%3A%2F%2Fclient.example.com%2Fcb
&code_verifier=dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk
```

**Step 4 — Token Response**:

```
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IjFlOWdkazcifQ...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "refresh_token": "8xLOxBtZp8",
  "id_token": "eyJhbGciOiJSUzI1NiI..."
}
```

**Step 5 — API call**:

```
GET /api/orders HTTP/1.1
Host: api.example.com
Authorization: Bearer eyJhbGciOiJSUzI1NiI...
```

### Token formats

- **Opaque** — Random string. Resource server validates by introspection (RFC 7662). Pro: easy revocation. Con: synchronous round-trip per request.
- **JWT** — Self-contained. RS validates signature offline against a JWKS cached from `/.well-known/jwks.json`. Pro: no AS round-trip. Con: revocation is hard until expiry.

A typical access-token JWT payload:

json

```
{
  "iss": "https://as.example.com",
  "sub": "248289761001",
  "aud": "https://api.example.com",
  "exp": 1714914000,
  "iat": 1714910400,
  "nbf": 1714910400,
  "jti": "id1234",
  "scope": "read:orders",
  "client_id": "s6BhdRkqt3"
}
```

### Standard error responses (RFC 6749 §5.2)

`invalid_request`, `invalid_client`, `invalid_grant`, `unauthorized_client`, `unsupported_grant_type`, `invalid_scope`, plus `access_denied`, `server_error`, `temporarily_unavailable` for the auth endpoint. Returned as `400 Bearer Token` `{"error":"invalid_grant","error_description":"..."}`.

### Refresh-token rotation, introspection, revocation

Modern AS implementations (Auth0, Okta, Curity) issue a **new refresh token on every refresh**. If a previously-used refresh token is replayed, the AS revokes the entire chain — refresh-token reuse detection ([https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation](https://auth0.com/docs/secure/tokens/refresh-tokens/refresh-token-rotation)). Introspection (`POST /introspect`, RFC 7662) is the standard way for a resource server to validate opaque tokens. Revocation (`POST /revoke`, RFC 7009) lets a client log a user out.

### State and nonce

- `state` — opaque random value, **mandatory** for CSRF defense (RFC 6749 §10.12; RFC 9700 §4.7).
- `nonce` — OIDC-only, bound into the ID token's `nonce` claim, replays the auth-time challenge to defeat ID-token reuse.

---

## 4. Deep connections to other protocols

**TLS** is mandatory. RFC 6749 §1.6 states that all OAuth requests carrying credentials, codes, or tokens "MUST be sent over TLS" using TLS 1.2 or later (RFC 9700 §2.1 reinforces this). OAuth's bearer-token security model is essentially "don't lose the cookie jar" — without TLS the entire scheme collapses.

**HTTP/1.1, HTTP/2, HTTP/3** carry every OAuth message. The redirect-based flows use HTTP `302` and query strings; the back-channel uses HTTP `POST` with `application/x-www-form-urlencoded` bodies and `application/json` responses. OAuth makes no functional demands on the HTTP version, so HTTP/2 multiplexing and HTTP/3's QUIC transport (RFC 9000) work transparently.

**TCP** sits underneath everything; HTTP/3 swaps it for QUIC over UDP, but OAuth doesn't notice.

**REST**. OAuth was designed in the REST era: scopes correspond naturally to resource permissions, the `Authorization: Bearer` header travels cleanly with REST verbs, and the `/userinfo` endpoint is itself a REST resource.

**OpenID Connect (OIDC)** is built directly on OAuth 2.0. OIDC adds the `openid` scope, the **ID Token** (JWT authenticating the user), and standardizes discovery (`/.well-known/openid-configuration`). When you use "Sign in with Google", you are using OIDC over OAuth 2.0 ([https://developers.google.com/identity/gsi/web/guides/overview](https://developers.google.com/identity/gsi/web/guides/overview), [https://openid.net/specs/openid-connect-core-1_0.html](https://openid.net/specs/openid-connect-core-1_0.html)). [OpenID](https://openid.net/specs/openid-connect-core-1_0.html)

**SAML** is the predecessor enterprise SSO protocol. OAuth often replaces it for new builds, but the two interoperate via the **SAML Assertion Grant (RFC 7522)** — an enterprise IdP issues a SAML assertion that a client exchanges for an OAuth access token at the AS.

**JWT (RFC 7519)** is the most common access-token and ID-token format. JWT lives inside the **JOSE** family — JWS (RFC 7515) for signing, JWE (RFC 7516) for encryption, JWA (RFC 7518) for algorithms, JWK (RFC 7517) for key representation.

**WebAuthn / FIDO2 / passkeys** are typically used *inside* the AS as a phishing-resistant authentication factor; OAuth is the delegation layer on top. In OAuth 2.1 + step-up (RFC 9470), a resource server can demand a passkey-based reauth via the `acr_values` challenge.

**Kerberos** is the older symmetric-ticket SSO standard. It is enterprise-LAN-oriented; OAuth 2.0 + OIDC is its modern internet equivalent.

**GNAP (RFC 9635)** is OAuth's intended successor for greenfield deployments — JSON-only, no pre-registration required, proof-of-possession from request 1 ([https://oauth.net/gnap/](https://oauth.net/gnap/)). [Lobsters](https://lobste.rs/s/e1gujd/rfc_9635_grant_negotiation)

**SCIM (RFC 7642–7644)** complements OAuth: SCIM provisions the users; OAuth authorizes the API calls.

**CIBA (Client-Initiated Backchannel Authentication, OpenID Foundation)** is a decoupled flow where a back-end client triggers authentication on the user's separate device — used in payments and call-center workflows.

**UMA (User-Managed Access)** is built on OAuth 2.0 and gives the resource owner fine-grained policy control over third parties.

**DPoP (RFC 9449, September 2023)** is the application-layer alternative to TLS-bound tokens. The client generates an asymmetric keypair (typically P-256/ES256), publishes the public key in the DPoP-proof JWT header, and the AS binds that key's SHA-256 thumbprint into the access token's `cnf.jkt` claim. Every request to the resource server carries a fresh DPoP-proof JWT signed by the same key, asserting the HTTP method (`htm`), URL (`htu`), unique ID (`jti`), and a hash of the access token (`ath`). The resource server checks the binding before granting access ([https://datatracker.ietf.org/doc/html/rfc9449](https://datatracker.ietf.org/doc/html/rfc9449), [https://workos.com/blog/dpop-rfc-9449-explained](https://workos.com/blog/dpop-rfc-9449-explained), [https://auth0.com/blog/protect-your-access-tokens-with-dpop/](https://auth0.com/blog/protect-your-access-tokens-with-dpop/)). [WorkOS](https://workos.com/blog/dpop-rfc-9449-explained)

**mTLS (RFC 8705)** is the transport-layer alternative to DPoP; powerful for confidential clients but impractical for browser SPAs.

**Token Binding (RFC 8471)** was the third contender; major browser vendors abandoned it and it is effectively dead ([https://workos.com/blog/dpop-rfc-9449-explained](https://workos.com/blog/dpop-rfc-9449-explained)). [WorkOS](https://workos.com/blog/dpop-rfc-9449-explained)

**API gateways** typically terminate OAuth at the edge — validate the JWT, optionally introspect, then forward a minimal context to upstream microservices via a header or via Transaction Tokens (`draft-ietf-oauth-transaction-tokens`). The **BFF (Backend-for-Frontend)** pattern keeps tokens server-side: the SPA holds only an HttpOnly session cookie, the BFF holds the OAuth tokens. RFC 9700 and `draft-ietf-oauth-browser-based-apps` recommend BFF for any browser-based application. [IETF](https://www.ietf.org/archive/id/draft-chen-oauth-roadmap-00.html)

---

## 5. Real-world deployment

**Major implementations (open source / vendor)**: Keycloak (Red Hat); Auth0 (now Okta, since 2021 acquisition); Okta Workforce/CIC; Microsoft Entra ID (formerly Azure Active Directory; rebranded July 2023); Google Identity Platform; AWS Cognito; Ping Identity (PingFederate, PingOne); ForgeRock (now part of Ping); Authelia; Authentik; **Ory Hydra** + **Ory Kratos**; **Curity Identity Server**; **Duende IdentityServer** (commercial replacement for the deprecated free IdentityServer4); **Spring Authorization Server** (Spring's replacement for retired Spring Security OAuth); Apache Oltu (retired 2018). Client libraries: Passport.js; **NextAuth.js / Auth.js**; OAuthLib (Python); **AppAuth** (Google's iOS/Android/JS); **MSAL** (Microsoft); openid-client (Filip Skokan); google-auth-library; oidc-client-ts. [The Stack](https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/)[Microsoft Press Store](https://www.microsoftpressstore.com/articles/article.aspx?p=3197442)

**Major production users and scale**:

- **Microsoft Entra ID** is publicly cited as authenticating "more than 1.2 billion sign-ins per day" ([https://www.epcgroup.net/microsoft-entra-id-enterprise-identity-guide-2026](https://www.epcgroup.net/microsoft-entra-id-enterprise-identity-guide-2026), [https://www.wintive.com/tutorials/microsoft-365/microsoft-entra-id-complete-guide/](https://www.wintive.com/tutorials/microsoft-365/microsoft-entra-id-complete-guide/)). Microsoft's own April-2024 spike was **11,000 Entra-blocked attacks per second** ([https://entra.news/p/entranews-13-dedicated-to-vittorio](https://entra.news/p/entranews-13-dedicated-to-vittorio)). The backup-authentication system has been GA since 2021; "regionally isolated authentication endpoints" added in 2024 serve "six billion requests per day" ([https://techcommunity.microsoft.com/blog/microsoft-entra-blog/microsoft-entra-resilience-update-workload-identity-authentication/4094704](https://techcommunity.microsoft.com/blog/microsoft-entra-blog/microsoft-entra-resilience-update-workload-identity-authentication/4094704)). [Wintive + 3](https://www.wintive.com/tutorials/microsoft-365/microsoft-entra-id-complete-guide/)
- **AWS Cognito** processes "100 billion+ authentications per month" per AWS's own blog ([https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/](https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/)). The November 2024 pricing change introduced Lite / Essentials / Plus tiers. [The Stack](https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/)[The Stack](https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/)
- **Sign in with Google / Google Identity Services** is built directly on OAuth 2.0/OIDC and is used by billions of Google account holders; case studies at [https://developers.google.com/identity/sign-in/case-studies](https://developers.google.com/identity/sign-in/case-studies) report Reddit ~2× sign-in conversion and eBay 100% increase after One Tap. [Google](https://developers.google.com/identity/sign-in/case-studies)[Google](https://developers.google.com/identity/sign-in/case-studies)
- **Sign in with Apple, GitHub, GitLab, Slack, Stripe Connect, Twilio, Salesforce, Atlassian** all expose OAuth 2.0 + OIDC.

**Performance and quotas (real numbers, 2024–2026)**:

- **Auth0** default Authentication API limit: **100 RPS**. Public Performance Burst tiers: 2×/3×/4× (200/300/400 RPS) for up to 48 hours/month. Private Performance Burst tiers up to **6,000 RPS** (60×) for up to 80 hours/month ([https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy](https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy)). Free tier covers 7,500 MAU with unlimited logins. [Auth0 + 2](https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy)
- **Okta**: bucketed rate limits configured per endpoint and per scope; e.g. `/oauth2/v1/authorize` typically 1,200/min org-wide with nested per-app sub-buckets ([https://developer.okta.com/docs/reference/rate-limits/](https://developer.okta.com/docs/reference/rate-limits/)). Returns `429 Too Many Requests` on overflow, with X-Rate-Limit headers. [Okta Developer](https://developer.okta.com/docs/reference/rate-limits/)[Okta Developer](https://developer.okta.com/docs/reference/rate-limits/)
- **AWS Cognito** RPS overage pricing: $20/RPS-month for continuous use, $45/RPS-month for partial-month bursts; default user-pool RPS varies by API category ([https://frontegg.com/guides/aws-cognito-pricing](https://frontegg.com/guides/aws-cognito-pricing)). [Frontegg](https://frontegg.com/guides/aws-cognito-pricing)
- **Latency expectations**: JWKS-backed JWT verification is a memory-only RSA/EC verify after the first JWKS fetch — single-digit milliseconds. Token introspection adds one HTTP round-trip — typically 5–50 ms inside one region, dominated by network. Cache JWKS aggressively (most providers rotate keys every 24 h–90 d, signaled via `kid` and the JWKS endpoint).

**Topologies**:

- **API gateway with introspection**: Kong, Apigee, AWS API Gateway, Tyk all have plugins to introspect or JWT-validate inbound tokens. JWT validation is preferred for hot paths, introspection for low-traffic high-revocation needs.
- **BFF pattern**: SPA holds nothing but an HTTP-only session cookie; the BFF holds tokens server-side. Recommended in `draft-ietf-oauth-browser-based-apps`.
- **Sidecar pattern**: a dedicated process per pod (Envoy, OAuth2-Proxy) handles token validation, leaving the application code OAuth-unaware. Common in service-mesh deployments (Istio, Linkerd).

---

## 6. Failure modes and famous incidents

| Year | Org / actor | Issue | Root cause |
|---|---|---|---|
| 2014 | OAuth 2.0 / OpenID — "Covert Redirect" | Open-redirect via `redirect_uri` not whitelisted | Client/redirect-URI validation gap; reported by Wang Jing (Nanyang Tech, Singapore). [Wordpress](https://vulnerabilitypost.wordpress.com/category/covert-redirect-vulnerability/) Already covered by RFC 6819 §4.1.5 / §4.2.4 [GitHub](https://github.com/aaronpk/oauth.net/blob/main/public/advisories/2014-1-covert-redirect/index.php) — exposed lax implementations rather than a spec defect ([https://oauth.net/advisories/2014-1-covert-redirect/](https://oauth.net/advisories/2014-1-covert-redirect/), [https://thehackernews.com/2014/05/nasty-covert-redirect-vulnerability.html](https://thehackernews.com/2014/05/nasty-covert-redirect-vulnerability.html)). |
| May 2017 | Google / G Suite | "OAuth worm" — fake `Google Docs` app harvested mailbox + contacts, ~1 million users affected [BankInfoSecurity](https://www.bankinfosecurity.com/attackers-unleash-oauth-worm-via-google-docs-app-a-9888) before Google killed it within ~1 hour | Consent-screen abuse: attacker registered an OAuth client literally named "Google Docs". Google added client-name validation afterwards [Proofpoint](https://www.proofpoint.com/us/threat-insight/post/google-oauth-worm-leads-proofpoint-discovery) ([https://www.bankinfosecurity.com/attackers-unleash-oauth-worm-via-google-docs-app-a-9888](https://www.bankinfosecurity.com/attackers-unleash-oauth-worm-via-google-docs-app-a-9888), [https://www.proofpoint.com/us/threat-insight/post/google-oauth-worm-leads-proofpoint-discovery](https://www.proofpoint.com/us/threat-insight/post/google-oauth-worm-leads-proofpoint-discovery)). |
| Sept 2018 | Facebook | ~50 million access tokens stolen via "View As" feature; [FB](https://about.fb.com/news/2018/09/security-update/) ~90 million tokens reset [FB](https://about.fb.com/news/2018/09/security-update/) | Three combined bugs in the video-uploader integration with View As caused tokens with mobile-app permissions to be issued for the *viewer's target* user [SysTools Group](https://blog.systoolsgroup.com/facebook-security-breach-exposes-accounts-of-million-users/) ([https://about.fb.com/news/2018/09/security-update/](https://about.fb.com/news/2018/09/security-update/), [https://www.eff.org/deeplinks/2018/09/facebook-data-breach-affects-least-50-million-users](https://www.eff.org/deeplinks/2018/09/facebook-data-breach-affects-least-50-million-users)). |
| May 2020 | Apple (Bhavuk Jain) | Sign-in-with-Apple JWT forgery: Apple would issue valid JWTs for arbitrary email IDs, signed by Apple's [Bhavukjain](https://bhavukjain.com/blog/2020/05/30/zeroday-signin-with-apple/) key | Insufficient binding between authenticated user and JWT subject; bounty $100,000 [CyberScoop](https://cyberscoop.com/apple-sign-in-vulnerability-bug-bounty/) ([https://bhavukjain.com/blog/2020/05/30/zeroday-signin-with-apple/](https://bhavukjain.com/blog/2020/05/30/zeroday-signin-with-apple/), [https://cyberscoop.com/apple-sign-in-vulnerability-bug-bounty/](https://cyberscoop.com/apple-sign-in-vulnerability-bug-bounty/)). |
| April 2022 | GitHub via Heroku and Travis CI | Stolen OAuth tokens used to download [Infosecurity Magazine](https://www.infosecurity-magazine.com/news/api-security-flaw-found-bookingcom/) dozens of orgs' private repos including npm [GitHub](https://github.blog/news-insights/company-news/security-alert-stolen-oauth-user-tokens/) | Heroku's GitHub-integration OAuth tokens were exfiltrated; GitHub itself wasn't breached [TechTarget](https://www.techtarget.com/searchsecurity/news/252516048/Stolen-Oauth-tokens-lead-to-dozens-of-breached-GitHub-repos)[The Register](https://www.theregister.com/2022/04/21/github-stolen-oauth-tokens-used-in-breaches/) ([https://github.blog/news-insights/company-news/security-alert-stolen-oauth-user-tokens/](https://github.blog/news-insights/company-news/security-alert-stolen-oauth-user-tokens/), [https://www.theregister.com/2022/04/21/github-stolen-oauth-tokens-used-in-breaches/](https://www.theregister.com/2022/04/21/github-stolen-oauth-tokens-used-in-breaches/)). |
| 2023 | Salt Labs / Booking.com | OAuth misconfiguration could have [Salt Security](https://salt.security/press-releases/salt-security-uncovers-api-security-flaws-within-booking-com-that-allowed-full-account-takeover-issues-have-been-remediated) enabled account takeover for any user using "Continue with Facebook"; remediated. Also Vidio (~100 M MAU), Bukalapak, Grammarly, [ITSecurityDemand](https://www.itsecuritydemand.com/news/security-news/salt-labs-warns-about-potential-oauth-lapses-in-its-report/) Expo (CVE-2023-28131), and Codecademy | `redirect_uri` path manipulation + access-token-validation flaws — the "Pass-The-Token" [ITSecurityDemand](https://www.itsecuritydemand.com/news/security-news/salt-labs-warns-about-potential-oauth-lapses-in-its-report/) attack family ([https://salt.security/blog/a-new-oauth-vulnerability-that-may-impact-hundreds-of-online-services](https://salt.security/blog/a-new-oauth-vulnerability-that-may-impact-hundreds-of-online-services), [https://www.computerweekly.com/news/365532003/Salt-Labs-identifies-OAuth-security-flaw-within-Bookingcom](https://www.computerweekly.com/news/365532003/Salt-Labs-identifies-OAuth-security-flaw-within-Bookingcom)). |
| May–July 2023 | Microsoft / Storm-0558 (China-aligned) | ~25 organizations including US State Dept and Commerce had Outlook Web Access mailboxes [Microsoft](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/) read for ~one month after the actor forged authentication tokens | Microsoft consumer (MSA) signing key from 2016 leaked into a crash dump in April 2021, was moved to a debug environment, an engineer's account was later compromised, [Microsoft](https://www.microsoft.com/en-us/msrc/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition) and a separate flaw caused Microsoft 365 to accept consumer-key-signed tokens for enterprise OWA. [DecipherU](https://decipheru.com/cybersecurity/decipher-files/storm-0558-microsoft-2023) The CSRB's April 2024 report called the breach "preventable" and Microsoft's security culture "inadequate" [DecipherU](https://decipheru.com/cybersecurity/decipher-files/storm-0558-microsoft-2023) ([https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/), [https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/](https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/), [https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/](https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/)). Microsoft now tracks the actor as "Antique Typhoon" (August 2024). [Microsoft](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/) |
| April 2024 | Salt Labs / ChatGPT plugins | OAuth flow vulnerabilities in PluginLab and the ChatGPT plugin install process could let attackers inject malicious plugins [Security Boulevard](https://securityboulevard.com/2024/04/salt-security-addresses-critical-oauth-vulnerabilities-enhancing-api-security-with-oauth-protection-package/) or impersonate users | Insufficient validation in PluginLab's auth code redemption ([https://securityboulevard.com/2024/04/salt-security-addresses-critical-oauth-vulnerabilities-enhancing-api-security-with-oauth-protection-package/](https://securityboulevard.com/2024/04/salt-security-addresses-critical-oauth-vulnerabilities-enhancing-api-security-with-oauth-protection-package/)). |
| Feb 2025 | Volexity / Russian APTs | Spear-phishing of Microsoft 365 users through the **Device Code Authentication** flow | Misuse of legitimate `https://login.microsoftonline.com/common/oauth2/deviceauth` flow + social engineering [Help Net Security](https://www.helpnetsecurity.com/2025/02/14/microsoft-device-code-authentication-phishing-m365-account-compromise/) ([https://www.helpnetsecurity.com/2025/02/14/microsoft-device-code-authentication-phishing-m365-account-compromise/](https://www.helpnetsecurity.com/2025/02/14/microsoft-device-code-authentication-phishing-m365-account-compromise/)). |
| 2024–2026 | CUHK research / "COAT" | Cross-app OAuth Account Takeover; mix-up attacks reloaded against integration platforms; CVE-2023-36019 (CVSS 9.6) on Microsoft 365 [Cuhk](https://mobitec.ie.cuhk.edu.hk/osw2025/) | Malicious app integrations exploit insufficient AS-context isolation; [Cuhk](https://mobitec.ie.cuhk.edu.hk/osw2025/) documented in `draft-ietf-oauth-security-topics-update` ([https://mobitec.ie.cuhk.edu.hk/osw2025/](https://mobitec.ie.cuhk.edu.hk/osw2025/), [https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/](https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/)). |

**Recurring pitfalls** that come up in nearly every postmortem:

- **Missing/forged `state`** → CSRF login-confusion.
- **Wildcard or path-suffix `redirect_uri` matching** (the Booking.com 2023 root cause). RFC 9700 and OAuth 2.1 mandate **exact string match**.
- **Audience confusion**: a resource server accepting a token issued for *anyone* — Storm-0558's enterprise impact came from enterprise mailboxes accepting consumer-signed tokens because issuer/audience validation was skipped.
- **`alg: none`** attacks against naïve JWT libraries — fixed in modern libs but still appears in CVE feeds.
- **Refresh-token theft** without rotation → indefinite access. Rotation + reuse-detection is the defense (RFC 9700 §4.14).
- **Client-secret leakage** in mobile apps and SPAs → mandatory PKCE and treating these clients as *public* (no secret).
- **PKCE downgrade** — attacker strips `code_challenge`. Defense: AS rejects auth requests without PKCE (RFC 9700 §4.8).
- **Confused-deputy / mix-up attacks** between multiple ASes — defense is `iss` parameter (RFC 9207) and distinct redirect URIs (RFC 9700 §4.4).
- **Authorization-code injection** — defense: PKCE binding (RFC 9700 §4.5).

---

## 7. Fun facts and anecdotes

- The "**Road to Hell**" post is the most famous resignation in modern protocol history. Hammer's line — "WS-* bad" — is shorthand among IETF veterans for any standard sunk by enterprise committee design ([https://www.theregister.com/2012/07/28/oauth_editor_quits/](https://www.theregister.com/2012/07/28/oauth_editor_quits/)). His prediction has been partly vindicated (the 2017 Google Docs worm, the 2018 Facebook tokens, Storm-0558) and partly refuted: OAuth 2.0 is the most successful authorization protocol in history. [The Register](https://www.theregister.com/2012/07/28/oauth_editor_quits/)
- The **WRAP precursor** — co-developed by Yahoo, Microsoft, and Google in 2009 — is OAuth 2.0's actual genetic ancestor. WRAP killed signatures, introduced bearer tokens over TLS, and bequeathed the four grant types ([https://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html](https://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html)). [Dark Reading](https://www.darkreading.com/cyber-risk/the-road-to-hell-is-authenticated-by-facebook)[Oreilly](http://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html)
- The "**bearer token**" debate. Hammer's lasting objection was that OAuth 2.0 dropped the cryptographic request signing of OAuth 1.0a in favor of bearer tokens whose security depends entirely on TLS. DPoP (2023) and mTLS (2020) re-introduced sender-constraining 11+ years later, vindicating that complaint. [Dark Reading](https://www.darkreading.com/cyber-risk/the-road-to-hell-is-authenticated-by-facebook)
- OAuth 2.0 is **technically a framework**, not a protocol. The abstract of RFC 6749 itself warns that "this specification is likely to produce a wide range of non-interoperable implementations" — language Hammer fought to insert. [Dark Reading](https://www.darkreading.com/cyber-risk/the-road-to-hell-is-authenticated-by-facebook)[OAuth](https://www.oauth.com/oauth2-servers/background/)
- **Aaron Parecki's *OAuth 2.0 Simplified*** (oauth.com / Okta-published) started as a single blog post that received "hundreds of thousands of views per year" and became the de-facto onramp for new developers ([https://www.oauth.com/oauth2-servers/background/](https://www.oauth.com/oauth2-servers/background/)). [OAuth](https://www.oauth.com/oauth2-servers/background/)
- **Vittorio Bertocci's RFC 9470 acknowledgement** thanks "the shampoo manufacturers" — a permanent in-joke in the IETF stream about his legendary curly hair ([https://www.globalnerdy.com/2023/10/09/r-i-p-super-vittorio-bertocci/](https://www.globalnerdy.com/2023/10/09/r-i-p-super-vittorio-bertocci/)). [Global Nerdy](https://www.globalnerdy.com/2023/10/09/r-i-p-super-vittorio-bertocci/)
- **GNAP took five years** in committee, four of them in the GNAP WG co-chaired by Yaron Sheffer and Leif Johansson, before being published as RFC 9635 — Justin Richer says the experience proves committee-driven protocol design *can* still work ([https://yaronf.svbtle.com/a-new-rfc-published-the-gnap-core-protocol](https://yaronf.svbtle.com/a-new-rfc-published-the-gnap-core-protocol)). [Svbtle](https://yaronf.svbtle.com/a-new-rfc-published-the-gnap-core-protocol)
- **OSW (OAuth Security Workshop)** was born after two academic groups (Ruhr-Bochum and Trier, 2015) independently discovered attacks on OAuth and OpenID Connect. Daniel Fett, Guido Schmitz and Steinar Noem run it without corporate backing. OSW 2025 was held in Reykjavík (26–28 Feb 2025); OSW 2026 is in Leipzig (27–29 May 2026) ([https://oauth.secworkshop.events/](https://oauth.secworkshop.events/), [https://oauth.secworkshop.events/osw2026](https://oauth.secworkshop.events/osw2026)). [IDPro + 4](https://idpro.org/the-oauth-security-workshop-2025/)
- The **Google Docs worm of May 2017** abused legitimate Google OAuth: there was no exploit, just a malicious app named "Google Docs". It was the protocol's design — trust the user's consent — meeting human credulity at scale.

---

## 8. Practical wisdom

What an engineer building or auditing an OAuth integration in 2026 must internalize:

1. **Always use Authorization Code + PKCE.** Even for confidential server-side clients (per OAuth 2.1, [https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)). Never use Implicit. Never use ROPC.
2. **Exact-match redirect URIs.** No wildcards, no prefix matches, no path suffixes. This single rule would have prevented Booking.com 2023 and many others.
3. **Short-lived access tokens (5–15 minutes) + rotated refresh tokens with reuse detection.** Refresh-token reuse should atomically revoke the entire chain.
4. **Validate the JWT properly.** Verify signature, `iss`, `aud`, `exp`, `nbf`. Reject `alg: none`. Pin the expected algorithm. Use a vetted library — never hand-roll.
5. **Sender-constrain high-value tokens** with **DPoP** (RFC 9449) for browsers/mobile or **mTLS** (RFC 8705) for server-to-server. Mandatory in FAPI 2.0 ([https://openid.net/specs/fapi-security-profile-2_0-final.html](https://openid.net/specs/fapi-security-profile-2_0-final.html)).
6. **Cache JWKS aggressively but honor `kid`.** Refresh on unknown `kid` to handle rotation; cap at the AS's documented rotation cadence.
7. **State parameter is not optional.** Generate, persist (e.g. encrypted cookie), and verify on callback.
8. **Validate the `aud` claim with paranoia.** Storm-0558 succeeded partly because Exchange Online accepted tokens it shouldn't have.
9. **Log and alert on**: failed token validations (signature, audience, expiry); refresh-token reuse-detection events; unusually broad scope grants; new OAuth-app installs in a tenant; tokens used from new IPs/ASNs.
10. **Use BFF for browser apps.** Don't put refresh tokens in `localStorage`; don't put access tokens in URLs.
11. **Never trust the client to enforce scopes.** Resource server enforces scopes server-side, every request.
12. **Library selection criteria**: actively maintained (commits in last 6 months), CVE history, supports PKCE/DPoP/RFC 9700 mitigations, validates `alg`/`iss`/`aud`/`exp` by default. Recommended starting points: `openid-client` (Node), `authlib` (Python), MSAL, AppAuth, Spring Authorization Server.
13. **Debugging tools**: `jwt.io`, `jwt.ms` (Microsoft), `oauth.tools` (Curity), `oauthdebugger.com`, mitmproxy, Burp Suite. Curl with `-v`. Postman OAuth Helpers.
14. **Use RFC 9728 metadata** to configure new clients automatically rather than copy-pasting endpoint URLs.

---

## 9. Learning resources (current as of 2026)

**RFCs (with section pointers)**

| RFC | Title | Year | Why |
|---|---|---|---|
| 6749 | OAuth 2.0 Authorization Framework | 2012 | The core spec; read §4 grants, §10 security ([https://www.rfc-editor.org/rfc/rfc6749](https://www.rfc-editor.org/rfc/rfc6749)) |
| 6750 | Bearer Token Usage | 2012 | ([https://www.rfc-editor.org/rfc/rfc6750](https://www.rfc-editor.org/rfc/rfc6750)) |
| 7515–7519 | JOSE / JWT family | 2015 | Token format primitives ([https://www.rfc-editor.org/rfc/rfc7519](https://www.rfc-editor.org/rfc/rfc7519)) |
| 7591 / 7592 | Dynamic Client Registration | 2015 | Programmatic onboarding |
| 7636 | PKCE | 2015 | ([https://www.rfc-editor.org/rfc/rfc7636](https://www.rfc-editor.org/rfc/rfc7636)) |
| 7662 | Token Introspection | 2015 | ([https://www.rfc-editor.org/rfc/rfc7662](https://www.rfc-editor.org/rfc/rfc7662)) |
| 7009 | Token Revocation | 2013 | ([https://www.rfc-editor.org/rfc/rfc7009](https://www.rfc-editor.org/rfc/rfc7009)) |
| 8252 | OAuth for Native Apps (BCP) | 2017 | App-side BCP |
| 8628 | Device Authorization Grant | 2019 | TVs, CLIs |
| 8705 | mTLS Client Auth + Cert-bound tokens | 2020 | ([https://www.rfc-editor.org/rfc/rfc8705](https://www.rfc-editor.org/rfc/rfc8705)) |
| 9068 | JWT Profile for Access Tokens | 2021 | Standardized JWT-AT |
| 9126 | PAR | 2021 | Pushed Authorization Requests |
| 9396 | RAR | 2023 | Rich authorization data |
| 9449 | **DPoP** | Sept 2023 | ([https://datatracker.ietf.org/doc/html/rfc9449](https://datatracker.ietf.org/doc/html/rfc9449)) |
| 9470 | Step-Up Authentication Challenge | Sept 2023 | ([https://www.rfc-editor.org/rfc/rfc9470.html](https://www.rfc-editor.org/rfc/rfc9470.html)) |
| 9635 | **GNAP** | Oct 2024 | ([https://www.rfc-editor.org/rfc/rfc9635](https://www.rfc-editor.org/rfc/rfc9635)) |
| **9700** | **OAuth 2.0 Security BCP** | **Jan 2025** | The single most important read of 2025 ([https://datatracker.ietf.org/doc/rfc9700/](https://datatracker.ietf.org/doc/rfc9700/)) |
| 9728 | OAuth 2.0 Protected Resource Metadata | Apr 2025 | ([https://datatracker.ietf.org/doc/html/rfc9728](https://datatracker.ietf.org/doc/html/rfc9728)) |
| draft-ietf-oauth-v2-1-15 | OAuth 2.1 | Mar 2026 | ([https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)) |
| OIDC Core 1.0 | OpenID Connect | 2014, errata 2 2023 | ([https://openid.net/specs/openid-connect-core-1_0.html](https://openid.net/specs/openid-connect-core-1_0.html)) |

**Books**

- *OAuth 2 in Action* — Justin Richer & Antonio Sanso, Manning, 2017 — still the best long-form treatment for engineers (intermediate→advanced).
- *OAuth 2.0 Simplified* — Aaron Parecki — continuously updated at [https://www.oauth.com/](https://www.oauth.com/) ; 2018 print edition, 2020 revised; intro→intermediate.
- *API Security in Action* — Neil Madden, Manning, 2020; intermediate→advanced; broader API-security context.
- *Solving Identity Management in Modern Applications* — Yvonne Wilson & Abhishek Hingnikar, Apress, 2nd edition 2023; intermediate.

**Canonical web references**

- **oauth.net** — Aaron Parecki's reference index ([https://oauth.net/2/](https://oauth.net/2/)) — always current.
- **Curity Resource Library** — [https://curity.io/resources/](https://curity.io/resources/) — strong intermediate/advanced articles.
- **Okta Developer / Auth0 blog** — [https://developer.okta.com/blog/](https://developer.okta.com/blog/), [https://auth0.com/blog/](https://auth0.com/blog/) — current 2024–2026.
- **WorkOS blog** — [https://workos.com/blog](https://workos.com/blog) — practical engineering explainers (DPoP, RFC 9728).
- **Cloudflare blog on AI agents and OAuth** — [https://blog.cloudflare.com/building-ai-agents-with-mcp-authn-authz-and-durable-objects/](https://blog.cloudflare.com/building-ai-agents-with-mcp-authn-authz-and-durable-objects/) (2025).

**Video**

- Nate Barbettini, *OAuth 2.0 and OpenID Connect (in plain English)*, 2018 talk on YouTube — still the canonical intro.
- Aaron Parecki — *The Nuts and Bolts of OAuth* video course (oauth.net).
- Pragmatic Web Security — Philippe De Ryck ([https://pragmaticwebsecurity.com/](https://pragmaticwebsecurity.com/)) — advanced.
- OAuth Security Workshop YouTube channel — [https://www.youtube.com/channel/UC49TGnjbTmGEeuTAF7naMuQ](https://www.youtube.com/channel/UC49TGnjbTmGEeuTAF7naMuQ).

**Podcasts**

- *Identity, Unlocked* — Vittorio Bertocci (Auth0/Okta). Note: **Vittorio passed away on 7 October 2023** of pancreatic cancer; the podcast has not produced new episodes since ([https://idpro.org/a-tribute-to-vittorio-luigi-bertocci/](https://idpro.org/a-tribute-to-vittorio-luigi-bertocci/)). Back catalogue is essential listening. [Auth0](https://identityunlocked.auth0.com/public/49/Identity,-Unlocked.--bed7fada)[Funeralobitsmemorial](https://funeralobitsmemorial.com/vittorio-bertocci-obituary-vittorio-bertocci-has-died-death/)
- *The Identity Podcast* and *Identity at the Center* (Jim McDonald & Jeff Steadman) — active in 2025–2026.

**Conferences and academic venues**

- **OAuth Security Workshop (OSW)** — [https://oauth.secworkshop.events/](https://oauth.secworkshop.events/). OSW 2025 in Reykjavík, OSW 2026 in Leipzig (27–29 May 2026).
- **Identiverse** — annual industry conference; 2025 hosted CAEP/Shared Signals announcements.
- **IETF 118–122** OAuth WG meetings — minutes at [https://datatracker.ietf.org/wg/oauth/meetings/](https://datatracker.ietf.org/wg/oauth/meetings/).

**Hands-on tools**

- jwt.io (Auth0/Okta).
- jwt.ms (Microsoft).
- oauth.tools (Curity).
- oauthdebugger.com.
- openidconnect.net.
- Postman OAuth 2.0 helper.
- Keycloak quickstarts ([https://www.keycloak.org/guides](https://www.keycloak.org/guides)).

**Academic papers**

- Fett, Küsters, Schmitz, "A Comprehensive Formal Security Analysis of OAuth 2.0", CCS 2016, DOI 10.1145/2976749.2978385 ([https://dl.acm.org/doi/10.1145/2976749.2978385](https://dl.acm.org/doi/10.1145/2976749.2978385)); arXiv:1601.01229. [arXiv +2](https://arxiv.org/abs/1601.01229)
- Fett, Hosseyni, Küsters, "An Extensive Formal Security Analysis of the OpenID Financial-grade API", arXiv:1901.11520, 2019. [OpenID](https://openid.net/specs/fapi-security-profile-2_0-final.html)
- Hosseyni, Küsters, Würtele, "Formal Security Analysis of the OpenID FAPI 2.0 Family of Protocols", IEEE CSF 2024 / ACM TOPS 28(1), 2025, DOI 10.1109/CSF61375.2024.00002.
- CUHK MobiTeC, "Cross-app OAuth Attacks in Integration Platforms", USENIX Security 2025 (presented at OSW 2025, [https://mobitec.ie.cuhk.edu.hk/osw2025/](https://mobitec.ie.cuhk.edu.hk/osw2025/)). [Cuhk](https://mobitec.ie.cuhk.edu.hk/osw2025/)

---

## 10. Where things are heading (2025–2026 frontier)

**Active deprecations** (already enforced by RFC 9700 and OAuth 2.1):

- Implicit grant (`response_type=token`). [OAuth](https://oauth.net/2.1/)[Java Code Geeks](https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html)
- Resource Owner Password Credentials grant. [OAuth](https://oauth.net/2.1/)
- Plain (non-PKCE) Authorization Code for public clients.
- Wildcard / partial `redirect_uri` matching.

**What's replacing them**:

- **OAuth 2.1** (draft-15, March 2026) consolidates the BCP into the core.
- **PKCE everywhere** including confidential clients. [Java Code Geeks](https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html)
- **DPoP** (RFC 9449) and **mTLS** (RFC 8705) sender-constraining for high-value APIs.
- **FAPI 2.0** (Final, Feb 2025) for regulated APIs (open banking — Colombia SFC Circular 004/2024 mandates it; Australian CDR; UK and EU open finance). [Auth0](https://auth0.com/blog/fapi-2-0-the-future-of-api-security-for-high-stakes-customer-interactions/)

**Hot working-group drafts (early 2026)**:

- `draft-ietf-oauth-transaction-tokens-08` — propagate user/workload identity inside a microservice trust domain ([https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/](https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/)). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-oauth-transaction-tokens-06)
- `draft-ietf-oauth-identity-chaining-08` / `draft-ietf-oauth-identity-assertion-authz-grant-01` — cross-domain delegation across enterprise IdPs ([https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/)).
- `draft-ietf-oauth-sd-jwt-vc-16` (Apr 2026) and the underlying **SD-JWT** — selective-disclosure verifiable credentials. Underpins the **EU Digital Identity Wallet** mandated by eIDAS 2 ([https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)). [IETF](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)
- `draft-ietf-oauth-cross-device-security-15` (Jan 2026) — cross-device flow phishing defenses (motivated by 2025's device-code attacks).
- `draft-ietf-oauth-first-party-apps-03` — native app + AS coordination.
- `draft-ietf-oauth-rfc7523bis-05` — JWT client-authentication update; closes audience-injection attacks across multiple ASes. [IETF](https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/)
- `draft-ietf-oauth-security-topics-update-01` (Mar 2026) — RFC 9700 follow-up covering COAT and cross-user session fixation.
- `draft-oauth-transaction-tokens-for-agents-04` (Feb 2026) — actor/principal claims for agent workloads. [IETF](https://datatracker.ietf.org/doc/draft-oauth-transaction-tokens-for-agents/)
- `draft-liu-oauth-a2a-profile-00` — Agent-to-Agent profile for transaction tokens.

**OpenID for Verifiable Credentials (OID4VC / OID4VCI / OID4VP)** — OAuth 2.0 profiles for issuing and presenting credentials; the technical substrate of national digital wallets (EU, Japan, Canada, India). Authlete CTO Joseph Heenan presented the 2025 conformance status at OSW 2025 ([https://www.authlete.com/news/20250217_osw2025/](https://www.authlete.com/news/20250217_osw2025/)). [Authlete](https://www.authlete.com/news/20250217_osw2025/)

**AI agents and OAuth — the hottest 2025–2026 topic.** This is what's making the front pages right now.

- The **Model Context Protocol (MCP)**, introduced by Anthropic in late 2024, was retrofitted in mid-2025 to use **OAuth 2.1** for agent-to-MCP-server authorization, replacing API keys ([https://www.techtarget.com/searchsoftwarequality/news/366634681/MCP-OAuth-update-adds-security-for-personalized-AI](https://www.techtarget.com/searchsoftwarequality/news/366634681/MCP-OAuth-update-adds-security-for-personalized-AI)). The MCP Authorization Specification's 2025-11-25 update made MCP servers formal **OAuth 2.1 resource servers** and mandated **RFC 8707 Resource Indicators** to prevent token mis-redemption ([https://dasroot.net/posts/2026/04/mcp-authorization-specification-oauth-2-1-resource-indicators/](https://dasroot.net/posts/2026/04/mcp-authorization-specification-oauth-2-1-resource-indicators/)). [Dasroot](https://dasroot.net/posts/2026/04/mcp-authorization-specification-oauth-2-1-resource-indicators/)
- Cloudflare ships an **OAuth Provider Library for Workers** that lets a Worker act as an MCP authorization server in a few hundred lines ([https://blog.cloudflare.com/building-ai-agents-with-mcp-authn-authz-and-durable-objects/](https://blog.cloudflare.com/building-ai-agents-with-mcp-authn-authz-and-durable-objects/), [https://developers.cloudflare.com/agents/model-context-protocol/authorization/](https://developers.cloudflare.com/agents/model-context-protocol/authorization/)). [Cloudflare](https://developers.cloudflare.com/agents/model-context-protocol/authorization/)
- Stytch, Auth0, Descope, WorkOS Connect, and Cloudflare Access all offer "your-app-as-OAuth-provider-for-AI-agents" packages aimed at making it trivial to scope and revoke agent tokens ([https://stytch.com/blog/agent-to-agent-oauth-guide/](https://stytch.com/blog/agent-to-agent-oauth-guide/), [https://stytch.com/blog/oauth-for-mcp-explained-with-a-real-world-example/](https://stytch.com/blog/oauth-for-mcp-explained-with-a-real-world-example/)).
- ChatGPT (Sept 2025) added custom MCP support requiring **OAuth 2.1 + Dynamic Client Registration**; bearer tokens are not accepted ([https://truthifi.com/education/state-of-mcp-2026-ai-agents-custom-connectors](https://truthifi.com/education/state-of-mcp-2026-ai-agents-custom-connectors)). [Truthifi](https://truthifi.com/education/state-of-mcp-2026-ai-agents-custom-connectors)
- New approach: **Client ID Metadata Documents (CIMD)** — the agent's `client_id` is the HTTPS URL of a JSON metadata document hosted by the agent, eliminating per-server pre-registration ([https://workos.com/blog/mcp-auth-for-ai-agents-how-to-register-a-python-oauth-client-using-cimd](https://workos.com/blog/mcp-auth-for-ai-agents-how-to-register-a-python-oauth-client-using-cimd)). [WorkOS](https://workos.com/blog/mcp-auth-for-ai-agents-how-to-register-a-python-oauth-client-using-cimd)
- IETF drafts now exist explicitly for agentic OAuth: `draft-oauth-transaction-tokens-for-agents` (Amazon's Ashay Raut) and `draft-liu-oauth-a2a-profile`. [IETF](https://datatracker.ietf.org/doc/draft-oauth-transaction-tokens-for-agents/)

**Passkeys integration**: passkeys (FIDO2/WebAuthn multi-device credentials) are the AS's *user-authentication* mechanism, with OAuth/OIDC delivering the result. RFC 9470 step-up challenges let resource servers demand a passkey reauth on sensitive actions. [Authlete](https://www.authlete.com/developers/stepup_authn/)

**Continuous Access Evaluation Profile (CAEP) / Shared Signals Framework (SSF)** — OpenID Foundation Final specs published September 2025 ([https://openid.net/specs/openid-caep-1_0-final.html](https://openid.net/specs/openid-caep-1_0-final.html)). Solves the "stale long-lived session after risk change" problem: identity providers, EDR tools, and SaaS apps push **Security Event Tokens** to subscribers in real time so a compromised device immediately revokes its sessions. Microsoft Entra, Okta, Cisco Duo, and Apple Business Manager are early adopters. [Sgnl](https://sgnl.ai/2025/12/introducing-guide-to-caep-white-paper/)

**OAuth Security Workshop 2025 highlights** (Reykjavík, Feb 2025): formal analysis of FAPI 2.0; CUHK's COAT/CORF attacks against integration platforms; HTTP Message Signatures as a DPoP alternative; OpenID for Verifiable Credentials interoperability ([https://idpro.org/the-oauth-security-workshop-2025/](https://idpro.org/the-oauth-security-workshop-2025/), [https://talks.secworkshop.events/osw2025/](https://talks.secworkshop.events/osw2025/)). [Medium + 2](https://medium.com/@dimapostnikov/implementers-guide-fapi-2-0-final-specification-vs-implementers-draft-2-0-fc148b013969)

**OSW 2026** (Leipzig, 27–29 May 2026): early agenda emphasizes AI-agent authorization, identity chaining, transaction tokens, and post-quantum implications for token signing.

---

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook** *(written for the ear)*

> Every time you click "Sign in with Google" — every time your iPhone shows a calendar event from your work account — every time your bank's mobile app refreshes overnight without asking for a password — a four-letter word is doing the work: O-Auth. It runs over 1.2 *billion* sign-ins a day at Microsoft alone. It was supposed to be simple. Instead it took a three-year IETF brawl, the public resignation of its lead editor — quote, "OAuth 2.0 and the road to hell" — and a decade of follow-up RFCs to make it secure. As of 2025, OAuth has a brand-new constitution, RFC 9700, and a brand-new constituency: the AI agents now logging in on your behalf. This is the story of the most important protocol almost no one outside our industry has heard of.

**Striking statistic with source**

Microsoft Entra ID alone authenticates **more than 1.2 billion sign-ins per day** and, during a 2024 attack spike, blocked **11,000 attacks per second** ([https://www.epcgroup.net/microsoft-entra-id-enterprise-identity-guide-2026](https://www.epcgroup.net/microsoft-entra-id-enterprise-identity-guide-2026), [https://entra.news/p/entranews-13-dedicated-to-vittorio](https://entra.news/p/entranews-13-dedicated-to-vittorio)). [Wintive + 2](https://www.wintive.com/tutorials/microsoft-365/microsoft-entra-id-complete-guide/)

**Pause and think**

In April 2021 a process inside Microsoft's signing infrastructure crashed. The crash dump should have been scrubbed. It wasn't. The signing key sat in a debug environment for two years. In 2023 a Chinese state actor read the email of the US Secretary of Commerce. The CSRB called it "preventable." The lesson isn't that Microsoft is uniquely careless — it's that *every* OAuth deployment is one credential-scanning bug away from a cryptographic disaster. Your JWKS rotation policy isn't a checkbox. It's a fuse. (Source: [https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/](https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/))

**Failure-story arc — Storm-0558**

*Setup.* It's 2016. A Microsoft engineer signs an MSA consumer signing key. It's intended only for personal Hotmail accounts.

*Mistake one — April 2021.* A signing process crashes. A race condition leaves the private key in the crash dump. The credential scanner doesn't catch it. The dump is moved, per normal practice, to a corporate-network debug environment.

*Mistake two — sometime 2021–2023.* A Microsoft engineer's corporate account is compromised. The attacker — Storm-0558, China-aligned — gains access to the debug environment.

*Mistake three — 2022.* A separate Exchange Online team updates code to use Microsoft's common metadata endpoint. They assume the SDK validates token issuer. It doesn't.

*Consequence — 15 May 2023.* Storm-0558 begins forging authentication tokens with the consumer key and using them to read Outlook Web Access mailboxes at roughly 25 organizations, including the US Department of State, US Department of Commerce, and Congressional staff.

*Detection — 16 June 2023.* State Department analysts spot anomalies in audit logs they had specifically requested Microsoft enable.

*Response.* Microsoft revokes the key on 29 June. Goes public 11 July. The Cyber Safety Review Board's April 2024 report says Microsoft's "security culture was inadequate and requires an overhaul."

*Resolution and lesson.* Microsoft launches the **Secure Future Initiative**. Audit-log access becomes free for all customers. Customer-side detection — the State Department's, in this case — becomes a recognized line of defense, not a luxury. And the OAuth working group accelerates RFC 9700 (Jan 2025) and the Resource Indicators (RFC 8707) push that the MCP authorization spec now mandates.

(Sources: [https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/), [https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/](https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/), [https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/](https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/).)

---

## 12. Citations (numbered, in order of appearance)

1. RFC 1122 (Internet Hosts) — [https://www.rfc-editor.org/rfc/rfc1122](https://www.rfc-editor.org/rfc/rfc1122)
2. RFC 9293 (TCP) — [https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293)
3. socket(2) man page — [https://man7.org/linux/man-pages/man2/socket.2.html](https://man7.org/linux/man-pages/man2/socket.2.html)
4. RFC 8446 (TLS 1.3) — [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)
5. RFC 9110 (HTTP semantics) — [https://www.rfc-editor.org/rfc/rfc9110](https://www.rfc-editor.org/rfc/rfc9110)
6. RFC 9112 (HTTP/1.1) — [https://www.rfc-editor.org/rfc/rfc9112](https://www.rfc-editor.org/rfc/rfc9112)
7. RFC 9113 (HTTP/2) — [https://www.rfc-editor.org/rfc/rfc9113](https://www.rfc-editor.org/rfc/rfc9113)
8. RFC 9114 (HTTP/3) — [https://www.rfc-editor.org/rfc/rfc9114](https://www.rfc-editor.org/rfc/rfc9114)
9. Roy Fielding's REST dissertation — [https://ics.uci.edu/~fielding/pubs/dissertation/top.htm](https://ics.uci.edu/~fielding/pubs/dissertation/top.htm)
10. RFC 8259 (JSON) — [https://www.rfc-editor.org/rfc/rfc8259](https://www.rfc-editor.org/rfc/rfc8259)
11. RFC 4648 (Base64URL) — [https://www.rfc-editor.org/rfc/rfc4648](https://www.rfc-editor.org/rfc/rfc4648)
12. RFC 7519 (JWT) — [https://www.rfc-editor.org/rfc/rfc7519](https://www.rfc-editor.org/rfc/rfc7519)
13. RFC 6749 (OAuth 2.0) — [https://www.rfc-editor.org/rfc/rfc6749](https://www.rfc-editor.org/rfc/rfc6749)
14. RFC 6750 (Bearer tokens) — [https://www.rfc-editor.org/rfc/rfc6750](https://www.rfc-editor.org/rfc/rfc6750)
15. RFC 7636 (PKCE) — [https://www.rfc-editor.org/rfc/rfc7636](https://www.rfc-editor.org/rfc/rfc7636)
16. RFC 7662 (Introspection) — [https://www.rfc-editor.org/rfc/rfc7662](https://www.rfc-editor.org/rfc/rfc7662)
17. RFC 7009 (Revocation) — [https://www.rfc-editor.org/rfc/rfc7009](https://www.rfc-editor.org/rfc/rfc7009)
18. RFC 9449 (DPoP) — [https://datatracker.ietf.org/doc/html/rfc9449](https://datatracker.ietf.org/doc/html/rfc9449)
19. RFC 8705 (mTLS) — [https://www.rfc-editor.org/rfc/rfc8705](https://www.rfc-editor.org/rfc/rfc8705)
20. FAPI 2.0 Security Profile (Final, 22 Feb 2025) — [https://openid.net/specs/fapi-security-profile-2_0-final.html](https://openid.net/specs/fapi-security-profile-2_0-final.html)
21. OpenID Connect Core 1.0 — [https://openid.net/specs/openid-connect-core-1_0.html](https://openid.net/specs/openid-connect-core-1_0.html)
22. Wikipedia: OAuth (history) — [https://en.wikipedia.org/wiki/OAuth](https://en.wikipedia.org/wiki/OAuth)
23. oauth.net "Introduction" (Cook/Messina/Halff origin story) — [https://oauth.net/about/introduction/](https://oauth.net/about/introduction/)
24. Aaron Parecki, "Background — OAuth 2.0 Simplified" — [https://www.oauth.com/oauth2-servers/background/](https://www.oauth.com/oauth2-servers/background/)
25. RFC 5849 (OAuth 1.0) — [https://www.rfc-editor.org/rfc/rfc5849](https://www.rfc-editor.org/rfc/rfc5849)
26. O'Reilly Radar, "What's going on with OAuth?" (2010, on WRAP) — [https://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html](https://radar.oreilly.com/2010/01/whats-going-on-with-oauth.html)
27. Eran Hammer, "OAuth 2.0 and the Road to Hell" (archived) — [https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f](https://gist.github.com/nckroy/dd2d4dfc86f7d13045ad715377b6a48f)
28. The Register, "OAuth 2.0 standard editor quits" (28 July 2012) — [https://www.theregister.com/2012/07/28/oauth_editor_quits/](https://www.theregister.com/2012/07/28/oauth_editor_quits/)
29. RFC 9700 (Best Current Practice for OAuth 2.0 Security, January 2025) — [https://datatracker.ietf.org/doc/rfc9700/](https://datatracker.ietf.org/doc/rfc9700/)
30. RFC 9700 PDF — [https://www.ietf.org/rfc/rfc9700.pdf](https://www.ietf.org/rfc/rfc9700.pdf)
31. WorkOS, "OAuth best practices: We read RFC 9700 so you don't have to" — [https://workos.com/blog/oauth-best-practices](https://workos.com/blog/oauth-best-practices)
32. draft-ietf-oauth-v2-1-15 (OAuth 2.1, March 2026) — [https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/](https://datatracker.ietf.org/doc/draft-ietf-oauth-v2-1/)
33. oauth.net OAuth 2.1 page — [https://oauth.net/2.1/](https://oauth.net/2.1/)
34. RFC 9635 (GNAP, October 2024) — [https://www.rfc-editor.org/rfc/rfc9635](https://www.rfc-editor.org/rfc/rfc9635)
35. oauth.net GNAP page — [https://oauth.net/gnap/](https://oauth.net/gnap/)
36. Simon Willison on GNAP — [https://simonwillison.net/2024/Oct/14/grant-negotiation-and-authorization-protocol-gnap/](https://simonwillison.net/2024/Oct/14/grant-negotiation-and-authorization-protocol-gnap/)
37. Yaron Sheffer on GNAP publication — [https://yaronf.svbtle.com/a-new-rfc-published-the-gnap-core-protocol](https://yaronf.svbtle.com/a-new-rfc-published-the-gnap-core-protocol)
38. RFC 9728 (Protected Resource Metadata, April 2025) — [https://datatracker.ietf.org/doc/html/rfc9728](https://datatracker.ietf.org/doc/html/rfc9728)
39. Mike Jones blog on RFC 9728 — [https://self-issued.info/?p=2653](https://self-issued.info/?p=2653)
40. WorkOS, RFC 9728 explainer — [https://workos.com/blog/introducing-rfc-9728-say-hello-to-standardized-oauth-2-0-resource-metadata](https://workos.com/blog/introducing-rfc-9728-say-hello-to-standardized-oauth-2-0-resource-metadata)
41. RFC 9470 (Step-Up Authentication Challenge) — [https://www.rfc-editor.org/rfc/rfc9470.html](https://www.rfc-editor.org/rfc/rfc9470.html)
42. draft-ietf-oauth-transaction-tokens — [https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/](https://datatracker.ietf.org/doc/draft-ietf-oauth-transaction-tokens/)
43. draft-ietf-oauth-identity-chaining — [https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/](https://datatracker.ietf.org/doc/draft-ietf-oauth-identity-chaining/)
44. draft-ietf-oauth-sd-jwt-vc-16 — [https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/](https://datatracker.ietf.org/doc/draft-ietf-oauth-sd-jwt-vc/)
45. draft-ietf-oauth-security-topics-update — [https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/](https://datatracker.ietf.org/doc/draft-ietf-oauth-security-topics-update/)
46. CUHK MobiTeC OSW 2025 page (COAT/mix-up reload) — [https://mobitec.ie.cuhk.edu.hk/osw2025/](https://mobitec.ie.cuhk.edu.hk/osw2025/)
47. Fett/Küsters/Schmitz, "A Comprehensive Formal Security Analysis of OAuth 2.0" (CCS 2016) — [https://dl.acm.org/doi/10.1145/2976749.2978385](https://dl.acm.org/doi/10.1145/2976749.2978385)
48. Daniel Fett's publication page — [https://danielfett.de/publications/2016-01-06-oauth-security-analysis/](https://danielfett.de/publications/2016-01-06-oauth-security-analysis/)
49. Hosseyni/Küsters/Würtele, FAPI 2.0 formal analysis (CSF 2024) — [https://doi.ieeecomputersociety.org/10.1109/CSF61375.2024.00002](https://doi.ieeecomputersociety.org/10.1109/CSF61375.2024.00002)
50. OpenID Foundation FAPI 2.0 Final approval — [https://openid.net/fapi2-0-final-conformance-tests-available/](https://openid.net/fapi2-0-final-conformance-tests-available/)
51. Auth0 blog on FAPI 2.0 — [https://auth0.com/blog/fapi-2-0-the-future-of-api-security-for-high-stakes-customer-interactions/](https://auth0.com/blog/fapi-2-0-the-future-of-api-security-for-high-stakes-customer-interactions/)
52. OSW main site — [https://oauth.secworkshop.events/](https://oauth.secworkshop.events/)
53. OSW 2025 talks — [https://talks.secworkshop.events/osw2025/](https://talks.secworkshop.events/osw2025/)
54. OSW 2026 (Leipzig, May 2026) — [https://oauth.secworkshop.events/osw2026](https://oauth.secworkshop.events/osw2026)
55. IDPro OSW 2025 recap — [https://idpro.org/the-oauth-security-workshop-2025/](https://idpro.org/the-oauth-security-workshop-2025/)
56. Vittorio Bertocci tribute (IDPro) — [https://idpro.org/a-tribute-to-vittorio-luigi-bertocci/](https://idpro.org/a-tribute-to-vittorio-luigi-bertocci/)
57. Auth0 "In Celebration of Vittorio Bertocci" — [https://auth0.com/blog/in-celebration-of-vittorio-bertocci/](https://auth0.com/blog/in-celebration-of-vittorio-bertocci/)
58. Joey deVilla, R.I.P. Vittorio (Global Nerdy, 9 Oct 2023) — [https://www.globalnerdy.com/2023/10/09/r-i-p-super-vittorio-bertocci/](https://www.globalnerdy.com/2023/10/09/r-i-p-super-vittorio-bertocci/)
59. Microsoft Storm-0558 analysis — [https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/](https://www.microsoft.com/en-us/security/blog/2023/07/14/analysis-of-storm-0558-techniques-for-unauthorized-email-access/)
60. Microsoft MSRC root-cause update (Sept 2023) — [https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/](https://msrc.microsoft.com/blog/2023/09/results-of-major-technical-investigations-for-storm-0558-key-acquisition/)
61. Wiz analysis of Storm-0558 — [https://www.wiz.io/blog/storm-0558-compromised-microsoft-key-enables-authentication-of-countless-micr](https://www.wiz.io/blog/storm-0558-compromised-microsoft-key-enables-authentication-of-countless-micr)
62. CSRB report context (Help Net Security) — [https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/](https://www.helpnetsecurity.com/2024/04/03/microsoft-storm-0558-key/)
63. Bhavuk Jain "Sign in with Apple" disclosure — [https://bhavukjain.com/blog/2020/05/30/zeroday-signin-with-apple/](https://bhavukjain.com/blog/2020/05/30/zeroday-signin-with-apple/)
64. CyberScoop on Sign-in-with-Apple bounty — [https://cyberscoop.com/apple-sign-in-vulnerability-bug-bounty/](https://cyberscoop.com/apple-sign-in-vulnerability-bug-bounty/)
65. Salt Labs Booking.com disclosure — [https://salt.security/press-releases/salt-security-uncovers-api-security-flaws-within-booking-com-that-allowed-full-account-takeover-issues-have-been-remediated](https://salt.security/press-releases/salt-security-uncovers-api-security-flaws-within-booking-com-that-allowed-full-account-takeover-issues-have-been-remediated)
66. Computer Weekly on Booking.com OAuth — [https://www.computerweekly.com/news/365532003/Salt-Labs-identifies-OAuth-security-flaw-within-Bookingcom](https://www.computerweekly.com/news/365532003/Salt-Labs-identifies-OAuth-security-flaw-within-Bookingcom)
67. Salt Labs ChatGPT plugins disclosure — [https://securityboulevard.com/2024/04/salt-security-addresses-critical-oauth-vulnerabilities-enhancing-api-security-with-oauth-protection-package/](https://securityboulevard.com/2024/04/salt-security-addresses-critical-oauth-vulnerabilities-enhancing-api-security-with-oauth-protection-package/)
68. Salt Labs Vidio/Bukalapak/Grammarly write-up — [https://www.itsecuritydemand.com/news/security-news/salt-labs-warns-about-potential-oauth-lapses-in-its-report/](https://www.itsecuritydemand.com/news/security-news/salt-labs-warns-about-potential-oauth-lapses-in-its-report/)
69. Facebook 2018 "View As" breach announcement — [https://about.fb.com/news/2018/09/security-update/](https://about.fb.com/news/2018/09/security-update/)
70. EFF on Facebook 2018 — [https://www.eff.org/deeplinks/2018/09/facebook-data-breach-affects-least-50-million-users](https://www.eff.org/deeplinks/2018/09/facebook-data-breach-affects-least-50-million-users)
71. ESET WeLiveSecurity on Facebook 2018 — [https://www.welivesecurity.com/2018/10/01/50-million-facebook-users-breach/](https://www.welivesecurity.com/2018/10/01/50-million-facebook-users-breach/)
72. GitHub blog on Heroku/Travis OAuth tokens (April 2022) — [https://github.blog/news-insights/company-news/security-alert-stolen-oauth-user-tokens/](https://github.blog/news-insights/company-news/security-alert-stolen-oauth-user-tokens/)
73. The Register on Heroku/Travis incident — [https://www.theregister.com/2022/04/21/github-stolen-oauth-tokens-used-in-breaches/](https://www.theregister.com/2022/04/21/github-stolen-oauth-tokens-used-in-breaches/)
74. OAuth Covert Redirect advisory — [https://oauth.net/advisories/2014-1-covert-redirect/](https://oauth.net/advisories/2014-1-covert-redirect/)
75. The Hacker News on Covert Redirect — [https://thehackernews.com/2014/05/nasty-covert-redirect-vulnerability.html](https://thehackernews.com/2014/05/nasty-covert-redirect-vulnerability.html)
76. BankInfoSecurity on 2017 Google Docs worm — [https://www.bankinfosecurity.com/attackers-unleash-oauth-worm-via-google-docs-app-a-9888](https://www.bankinfosecurity.com/attackers-unleash-oauth-worm-via-google-docs-app-a-9888)
77. Auth0 on 2017 Google Docs worm — [https://auth0.com/blog/all-you-need-to-know-about-the-google-docs-phishing-attack/](https://auth0.com/blog/all-you-need-to-know-about-the-google-docs-phishing-attack/)
78. Proofpoint follow-up on Google OAuth worm — [https://www.proofpoint.com/us/threat-insight/post/google-oauth-worm-leads-proofpoint-discovery](https://www.proofpoint.com/us/threat-insight/post/google-oauth-worm-leads-proofpoint-discovery)
79. Volexity / Microsoft device-code phishing (Feb 2025) — [https://www.helpnetsecurity.com/2025/02/14/microsoft-device-code-authentication-phishing-m365-account-compromise/](https://www.helpnetsecurity.com/2025/02/14/microsoft-device-code-authentication-phishing-m365-account-compromise/)
80. WorkOS DPoP explainer — [https://workos.com/blog/dpop-rfc-9449-explained](https://workos.com/blog/dpop-rfc-9449-explained)
81. Auth0 DPoP explainer — [https://auth0.com/blog/protect-your-access-tokens-with-dpop/](https://auth0.com/blog/protect-your-access-tokens-with-dpop/)
82. Tyk DPoP explainer — [https://tyk.io/blog/demonstrating-proof-of-possession-dpop-oauth2-security-for-fapi-2-0-and-open-banking/](https://tyk.io/blog/demonstrating-proof-of-possession-dpop-oauth2-security-for-fapi-2-0-and-open-banking/)
83. Auth0 rate-limit policy — [https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy](https://auth0.com/docs/troubleshoot/customer-support/operational-policies/rate-limit-policy)
84. Okta rate limits — [https://developer.okta.com/docs/reference/rate-limits/](https://developer.okta.com/docs/reference/rate-limits/)
85. AWS Cognito pricing context — [https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/](https://www.thestack.technology/awss-new-cognito-pricing-complicated-potentially-costly/)
86. Frontegg on Cognito RPS pricing — [https://frontegg.com/guides/aws-cognito-pricing](https://frontegg.com/guides/aws-cognito-pricing)
87. Microsoft Entra resilience blog — [https://techcommunity.microsoft.com/blog/microsoft-entra-blog/microsoft-entra-resilience-update-workload-identity-authentication/4094704](https://techcommunity.microsoft.com/blog/microsoft-entra-blog/microsoft-entra-resilience-update-workload-identity-authentication/4094704)
88. EPC Group Entra ID guide (1.2 B sign-ins/day) — [https://www.epcgroup.net/microsoft-entra-id-enterprise-identity-guide-2026](https://www.epcgroup.net/microsoft-entra-id-enterprise-identity-guide-2026)
89. Wintive Entra ID guide — [https://www.wintive.com/tutorials/microsoft-365/microsoft-entra-id-complete-guide/](https://www.wintive.com/tutorials/microsoft-365/microsoft-entra-id-complete-guide/)
90. Entra.News tribute / 11,000 attacks/sec — [https://entra.news/p/entranews-13-dedicated-to-vittorio](https://entra.news/p/entranews-13-dedicated-to-vittorio)
91. Google for Developers, Sign-in with Google overview — [https://developers.google.com/identity/gsi/web/guides/overview](https://developers.google.com/identity/gsi/web/guides/overview)
92. Google Sign-in case studies — [https://developers.google.com/identity/sign-in/case-studies](https://developers.google.com/identity/sign-in/case-studies)
93. Cloudflare AI agents + MCP — [https://blog.cloudflare.com/building-ai-agents-with-mcp-authn-authz-and-durable-objects/](https://blog.cloudflare.com/building-ai-agents-with-mcp-authn-authz-and-durable-objects/)
94. Cloudflare MCP authorization docs — [https://developers.cloudflare.com/agents/model-context-protocol/authorization/](https://developers.cloudflare.com/agents/model-context-protocol/authorization/)
95. Stytch agent-to-agent OAuth guide — [https://stytch.com/blog/agent-to-agent-oauth-guide/](https://stytch.com/blog/agent-to-agent-oauth-guide/)
96. Stytch OAuth-for-MCP example — [https://stytch.com/blog/oauth-for-mcp-explained-with-a-real-world-example/](https://stytch.com/blog/oauth-for-mcp-explained-with-a-real-world-example/)
97. WorkOS CIMD for AI agents — [https://workos.com/blog/mcp-auth-for-ai-agents-how-to-register-a-python-oauth-client-using-cimd](https://workos.com/blog/mcp-auth-for-ai-agents-how-to-register-a-python-oauth-client-using-cimd)
98. TechTarget on MCP OAuth update (Nov 2025) — [https://www.techtarget.com/searchsoftwarequality/news/366634681/MCP-OAuth-update-adds-security-for-personalized-AI](https://www.techtarget.com/searchsoftwarequality/news/366634681/MCP-OAuth-update-adds-security-for-personalized-AI)
99. dasroot.net MCP authorization spec analysis — [https://dasroot.net/posts/2026/04/mcp-authorization-specification-oauth-2-1-resource-indicators/](https://dasroot.net/posts/2026/04/mcp-authorization-specification-oauth-2-1-resource-indicators/)
100. State of MCP 2026 (Truthifi) — [https://truthifi.com/education/state-of-mcp-2026-ai-agents-custom-connectors](https://truthifi.com/education/state-of-mcp-2026-ai-agents-custom-connectors)
101. OpenID CAEP 1.0 Final — [https://openid.net/specs/openid-caep-1_0-final.html](https://openid.net/specs/openid-caep-1_0-final.html)
102. SGNL on Shared Signals/CAEP final publication — [https://sgnl.ai/2025/09/sgnl-welcomes-the-publication-of-the-final-shared-signals-and-caep-specifications/index.html](https://sgnl.ai/2025/09/sgnl-welcomes-the-publication-of-the-final-shared-signals-and-caep-specifications/index.html)
103. FIDO Alliance white paper on Shared Signals Framework — [https://fidoalliance.org/white-paper-fido-and-the-shared-signals-framework/](https://fidoalliance.org/white-paper-fido-and-the-shared-signals-framework/)
104. oauth.net OAuth 2.0 spec index — [https://oauth.net/2/](https://oauth.net/2/)
105. JavaCodeGeeks on OAuth 2.1 + Spring Security (April 2026) — [https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html](https://www.javacodegeeks.com/2026/04/oauth-2-1-and-the-death-of-implicit-flow-what-every-java-developer-building-auth-needs-to-update.html)
106. Authlete OSW 2025 sponsorship / OID4VC — [https://www.authlete.com/news/20250217_osw2025/](https://www.authlete.com/news/20250217_osw2025/)

> *Where a claim was not directly verified in 2024–2026 sources during research, the historical sourcing (e.g. the Hammer "Road to Hell" post, Bhavuk Jain's Apple disclosure, the Facebook View-As breach) is cited from the original publishing party's archived pages.*