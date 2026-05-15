---
id: oauth-and-jwt
type: chapter
part_id: utilities-security
part_label: IX
part_title: Utilities & Security
title: OAuth 2.1 and JWT
synopsis: How modern apps delegate access — and the most famous resignation in protocol history.
podcast_target_minutes: 15
position_in_book: 59 of 75
listening_order:
  prev: utilities-security/ntp
  next: utilities-security/email-stack
related_protocols: [oauth2]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [6749]
images: []
visual_cues:
  - "A timeline running from a 2006 CitizenSpace meetup with Blaine Cook, Chris Messina, David Recordon, and Larry Halff sketching on a whiteboard, through OAuth Core 1.0 in October 2007, RFC 6749 in October 2012, Eran Hammer's 26 July 2012 resignation post, and ending at the OAuth 2.1 draft in March 2026."
  - "A three-party redirect diagram — user, app, identity provider — with a password staying inside the IdP's box and a scoped, time-limited bearer token flying back to the app."
  - "A wall of incidents card-style: the May 2017 fake Google Docs worm hitting roughly one million users in under an hour, the September 2018 Facebook View As breach with fifty million tokens stolen, the May 2020 Sign in with Apple JWT forgery worth a hundred-thousand-dollar bounty, and the May to July 2023 Storm-0558 mailbox reads at the US State and Commerce Departments."
  - "A scoreboard of 2025 deployment scale — Microsoft Entra ID at over 1.2 billion sign-ins per day with an April 2024 spike of eleven thousand attacks per second blocked, AWS Cognito at over 100 billion authentications per month."
  - "A side-by-side of bearer tokens versus DPoP and mTLS — one token labeled 'whoever holds it can use it,' the other labeled 'sender-constrained, signed by the client's key.'"
---

# Part IX, Chapter — OAuth 2.1 and JWT

## The hook

Eran Hammer titled his resignation post "OAuth 2.0 and the Road to Hell." His one-line verdict was "WS-star bad." It went up on 26 July 2012 — three months before the spec he had spent five years on shipped as RFC 6749 — and it is still the most-cited critique of any IETF standard. The framework he walked away from is now what authenticates more than 1.2 billion sign-ins a day at Microsoft alone. This is the story of how the modern web learned to delegate access, and how it has spent fourteen years cleaning up the compromises that delegation cost.

## The story

### Born at CitizenSpace, late 2006

The room was an OpenID gathering at CitizenSpace, a coworking space in San Francisco. Blaine Cook — Twitter's chief architect at the time — was there with Chris Messina, with David Recordon, and with Larry Halff from Ma.gnolia. Halfway through, they realized something was missing from the open-stack story. There was no open standard for what they were already trying to build: a way for one app to call another app's API on a user's behalf, without that user having to hand over a password.

Eran Hammer, then at Yahoo, took over as community chair. OAuth Core 1.0 shipped in October 2007. OAuth 2.0 — a complete redesign — landed five years later as RFC 6749 in October 2012.

The world before OAuth is hard to picture now. If an app wanted to read your Google Calendar, it asked you for your Google password. You typed it in. The app stored it. When the app was breached, every other account that shared that password went with it. In 2007, that was normal.

OAuth's insight was to split the problem in two. Authentication — proving who you are — stays at the identity provider, on a screen you trust, with a password that never leaves. Authorization — granting some specific app some specific scope of access — happens in that same trusted UI, and what flies back to the app is not your password. It is a bearer token. The token has an expiry. It has a scope: read your repos, not delete them. View your calendar, not your email. And you can revoke it at any time. The mechanism — the redirects, the codes, the PKCE exchange, the refresh tokens — is the OAuth episode. What matters at the chapter level is the split itself, and that the password stops travelling.

### The Road to Hell resignation

By the summer of 2012, Eran Hammer had been editor of the OAuth working group for years. On 26 July, he published "OAuth 2.0 and the Road to Hell" and walked away. The post is still the most famous resignation in modern protocol history.

His core complaint was structural. Enterprise stakeholders had pulled the spec apart into a set of optional pieces that did not, on their own, interoperate. His shorthand was "WS-star bad" — IETF-veteran code for any standard sunk by enterprise committee design, the way the WS-* family of SOAP standards had been a decade earlier. The SOAP and REST chapters cover that earlier carcass.

The framing fact Hammer fought to put on the record is in the spec itself. RFC 6749 is officially titled "The OAuth 2.0 Authorization Framework," not "Protocol." Its abstract warns that "this specification is likely to produce a wide range of non-interoperable implementations" — language Hammer pushed in. And the prediction landed. The next decade is the story of every major identity provider building its own dialect of the framework, and the security community discovering — implementation by implementation — exactly what gets wrong when "framework" is the level of agreement.

### The famous incidents

Four breaches anchor the OAuth threat model.

In May 2017, a fake app named literally "Google Docs" walked through the consent screen and harvested mailboxes and contacts from around one million users. There was no exploit. The user clicked accept. Google killed it within about an hour and added client-name validation afterward. The Famous Outages part of the book has the longer write-up.

In September 2018, Facebook's "View As" feature leaked roughly fifty million access tokens. About ninety million were reset.

In May 2020, the security researcher Bhavuk Jain found that Sign in with Apple would issue valid, Apple-signed JWTs for arbitrary email addresses. One missing check, on a flow used by hundreds of millions of users. The bounty was a hundred thousand dollars.

And then Storm-0558. Between May and July 2023, a China-aligned actor read Outlook Web Access mailboxes at around twenty-five organizations — including the US State Department and the Department of Commerce — for about a month. The forensic chain is brutal. A Microsoft consumer signing key from 2016 leaked into a crash dump in April 2021 and was moved into a debug environment. An engineer's account was later compromised. A separate flaw in Microsoft 365 caused enterprise OWA to accept tokens signed by that consumer key. The Cyber Safety Review Board's April 2024 report called the breach "preventable" and called Microsoft's security culture "inadequate."

There were others. Salt Labs' "Pass-The-Token" research in 2023 showed that an OAuth misconfiguration on Booking.com could have enabled account takeover for any user using "Continue with Facebook" — the bug was redirect-URI path manipulation. The same family of mistakes turned up at Vidio, with around one hundred million monthly active users, at Bukalapak, at Grammarly, at Expo with CVE-2023-28131, and at Codecademy.

Read the list end to end and a pattern emerges. None of these were attacks on the cryptography. They were attacks on the framework's seams — on what was optional, on what was implementation-defined, on what the spec's abstract had warned about in 2012.

### OAuth 2.1 cleanup, and the new standards wave

The 2024-2025 standards wave is the cleanup.

In October 2024, RFC 9635 published the core of GNAP — sometimes called "OAuth 3" — by Justin Richer and Fabien Imbault. It is a ground-up redesign that addresses Hammer's critique by being a single, coherent specification rather than a framework of options.

In January 2025, RFC 9700 — the OAuth 2.0 Security Best Current Practice — formally deprecated the Implicit grant and the Resource Owner Password Credentials grant. It made Authorization Code with PKCE mandatory for public clients. It required exact redirect-URI matching, the failure mode behind the Salt Labs research.

OAuth 2.1 itself is the consolidation pass. The current draft as of May 2026 is `draft-ietf-oauth-v2-1-15`, edited by Dick Hardt, Aaron Parecki, and Torsten Lodderstedt, dated 2 March 2026. It mandates PKCE for all clients, not just public ones. It mandates exact redirect-URI matching. It removes Implicit and ROPC entirely. Spring Authorization Server, Cloudflare Workers, and the major identity providers are already enforcing its rules.

The most pointed change came in September 2023. RFC 9449 — DPoP, Demonstrating Proof-of-Possession — re-introduced sender-constraining to OAuth, eleven years and two months after Hammer published "Road to Hell." His lasting complaint had been that bearer tokens are too easy to steal and replay. DPoP says the token has to be signed by the client that holds it. He was right; it just took a decade to get back to it.

FAPI 2.0 — the Financial-grade API profile from the OpenID Foundation — was approved as Final on 22 February 2025. It mandates either DPoP or mTLS, the mutual-TLS variant where the client also presents a certificate. It is regulator-mandated in Colombia, under Circular 004 of 2024, and in the Australian Consumer Data Right. It has been formally analyzed by the University of Stuttgart.

And the deployment scale, in 2025: Microsoft Entra ID authenticates more than 1.2 billion sign-ins per day, with a recorded April 2024 spike of eleven thousand Entra-blocked attacks per second. AWS Cognito processes more than 100 billion authentications per month. The framework Hammer walked away from runs the front door of the modern internet.

The frontier is identity wallets. SD-JWT-VC — selective-disclosure JSON Web Tokens for verifiable credentials — is at `draft-ietf-oauth-sd-jwt-vc-16` as of April 2026. It underpins the EU Digital Identity Wallet. The next decade of OAuth is going to be fought over what your phone proves about you, one disclosed claim at a time.

A note before we move on. Vittorio Bertocci — Principal Architect at Okta, host of the *Identity, Unlocked* podcast, co-author of RFC 9470 — passed away from pancreatic cancer on 7 October 2023. *Identity, Unlocked* has not produced new episodes since. The OAuth community lost its most prolific public educator at exactly the moment the cleanup wave was getting under way.

## What you'd see in the simulator

The OAuth simulator walks the Authorization Code flow with PKCE — the flow OAuth 2.1 mandates for everyone. Press play. You start as the user, in the app. You click "Sign in with the identity provider." The app generates a random PKCE code verifier, hashes it, and redirects you to the authorization server with the hash attached. You authenticate at the IdP — your password never leaves it — and you see a consent screen listing the scopes the app is asking for. You consent. The IdP redirects you back to the app with a short-lived authorization code. The app posts that code back to the IdP, this time including the original PKCE verifier. The IdP confirms the verifier matches the hash it saw at the start, and only then exchanges the code for an access token and a refresh token. The app calls the API with the access token in the Authorization header. The user's password never moved. The exact wire formats — the JWT structure, the DPoP signature, the OpenID Connect ID token on top — are the OAuth episode.

## What it taught the industry

The lesson the OAuth decade taught the industry is that "framework" is not a level of agreement. RFC 6749 named itself an authorization framework, and its own abstract predicted "a wide range of non-interoperable implementations." It got them. Fake Google Docs in 2017. Sign in with Apple in 2020. Booking.com and the Pass-The-Token family in 2023. Storm-0558 in 2023, called preventable by the CSRB. The fix, fourteen years later, is to put the optional pieces back into the spec: PKCE for everyone, exact redirect-URI matching, no more Implicit, no more password grant, sender-constrained tokens via DPoP or mTLS for anything financial-grade. Eran Hammer's 2012 resignation reads, in 2026, like a roadmap the working group eventually agreed to follow.

## Listening order

- **Before this chapter:** *NTP* — the chapter on how the internet keeps time, which matters more than it sounds, because OAuth tokens have expiry timestamps and sender-constrained tokens need both ends to agree on what "now" is.
- **After this chapter:** *The Email Stack* — SMTP, IMAP, and the long story of how mail authentication has been retrofitted on top of a 1980s protocol family, much the way OAuth was retrofitted onto the web.

## Where to go deeper

- The OAuth episode picks up the mechanism in detail — the Authorization Code flow, PKCE, refresh tokens, OpenID Connect on top, JWT structure, DPoP signatures, and how Kerberos and SPNEGO still coexist with all of it inside corporate networks.
- The TLS episode covers the transport every OAuth redirect rides on, and the certificate machinery that mTLS extends for FAPI 2.0.
- The REST episode covers the API surface that OAuth tokens are presented to, with the Authorization header carrying the bearer or DPoP-bound token on every call.
- The HTTP episode covers the redirects, the headers, and the status codes the whole three-party flow is built out of.
