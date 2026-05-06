---
prompt_source: deep-research-prompts.txt:5754-5931 (XMPP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/b766670c-b342-48ea-92fd-09c16d38c6de
research_mode: claude.ai Research
---

# XMPP: A Citation-Backed Deep Field Report (May 2026)

## 1. Prerequisites and glossary

Before XMPP makes sense, an engineer needs a working vocabulary spanning the OSI/TCP-IP stack, encoding, cryptography, and presence-protocol idioms. The definitions below are deliberately tight; each cites or links to an authoritative explainer.

- **OSI/TCP-IP layers.** XMPP is an *application-layer* protocol that rides on TCP (transport layer 4) and TLS (presentation/transport-adjacent). The Internet model collapses OSI's seven layers to four: link, internet (IP), transport (TCP/UDP), application (XMPP, HTTP, SMTP). [IETF RFC 1122] [needs source for OSI mapping specifics, see [https://www.rfc-editor.org/rfc/rfc1122](https://www.rfc-editor.org/rfc/rfc1122) ]
- **TCP (Transmission Control Protocol).** Connection-oriented, reliable, ordered byte stream over IP. XMPP requires a long-lived TCP connection per stream (RFC 6120 §3). [https://www.rfc-editor.org/info/rfc9293](https://www.rfc-editor.org/info/rfc9293)
- **TLS (Transport Layer Security).** Cryptographic protocol layered over TCP that provides confidentiality, integrity, and server (and optionally client) authentication via X.509 certificates. XMPP uses TLS 1.2/1.3; default port 5222 (c2s) supports both opportunistic STARTTLS and direct TLS via XEP-0368. [https://www.rfc-editor.org/info/rfc8446](https://www.rfc-editor.org/info/rfc8446)
- **WebSocket (WS).** RFC 6455 framed bidirectional protocol over a single HTTP/1.1 upgrade. XMPP-over-WebSocket is specified in RFC 7395. [https://datatracker.ietf.org/doc/html/rfc7395](https://datatracker.ietf.org/doc/html/rfc7395) [IETF](https://datatracker.ietf.org/doc/html/rfc7395)
- **Socket.** Endpoint of a bidirectional inter-process channel, identified by (IP, port, protocol).
- **Port.** 16-bit address inside a host. XMPP defaults: 5222 (c2s, STARTTLS), 5223 (direct TLS c2s, XEP-0368), 5269 (s2s), 5280/5281 (BOSH/WebSocket HTTP endpoints, by convention). [Wikipedia](https://en.wikipedia.org/wiki/XMPP)
- **Header / frame / datagram / stream.** A *header* is metadata at the front of a unit; a *frame* is a delimited unit at link/WebSocket layer; a *datagram* is a connectionless packet (UDP); a *stream* is an ordered, possibly unbounded sequence of bytes/elements (TCP, XML).
- **Handshake.** Multi-message setup before useful traffic — TCP three-way SYN/SYN-ACK/ACK; TLS ClientHello/ServerHello/Finished; XMPP stream open + features + STARTTLS + SASL + bind.
- **Checksum / MAC.** Integrity primitives: CRC (link-layer), HMAC (TLS, OMEMO).
- **XML (Extensible Markup Language).** W3C-standardised tree of nested, namespaced elements. XMPP transports XML *fragments* over a long-lived stream rather than serialising whole documents.
- **Namespace.** XML qualifier (`xmlns="..."`) that disambiguates element names; XMPP uses namespaces (e.g., `urn:ietf:params:xml:ns:xmpp-sasl`) to extend the protocol without colliding with the core. [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html)
- **Stream.** In XMPP, an open-ended XML "document" framed by `<stream:stream>...</stream:stream>` whose children are stanzas. Two streams (one each direction) constitute a session (RFC 6120 §4). [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html)
- **Stanza.** Top-level XML element of type `<message/>`, `<presence/>`, or `<iq/>` exchanged inside a stream (RFC 6120 §8). [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/)
- **JID (Jabber ID).** Address of the form `localpart@domainpart/resourcepart` (e.g., `juliet@capulet.lit/balcony`); domain-only JIDs are valid; the resource identifies a specific connected device or session. RFC 7622 defines the modern PRECIS-based format. [https://datatracker.ietf.org/doc/html/rfc7622](https://datatracker.ietf.org/doc/html/rfc7622) [Wikipedia](https://en.wikipedia.org/wiki/XMPP)
- **Federation.** Independent servers route stanzas across administrative domains via s2s links — architecturally analogous to SMTP email. [https://en.wikipedia.org/wiki/XMPP](https://en.wikipedia.org/wiki/XMPP) [Wikipedia](https://en.wikipedia.org/wiki/XMPP)
- **Presence.** Network-availability information ("online", "away", priority, custom show/status) broadcast through a roster subscription model. RFC 6121 §4. [https://www.rfc-editor.org/info/rfc6121](https://www.rfc-editor.org/info/rfc6121)
- **Roster / subscription.** Server-stored contact list with bidirectional presence subscriptions (`subscription="both|from|to|none"`).
- **SASL (Simple Authentication and Security Layer).** RFC 4422 framework that XMPP uses for authentication; common mechanisms: `PLAIN`, `SCRAM-SHA-1`, `SCRAM-SHA-256(-PLUS)`, `EXTERNAL` (client cert).
- **STARTTLS.** Mechanism to upgrade a plaintext stream to TLS in-band (XMPP §5 of RFC 6120) so port 5222 can negotiate encryption.
- **Resource binding.** After SASL, the client requests a resource string and the server returns the full JID it has bound to the stream (RFC 6120 §7). [https://xmpp.org/extensions/xep-0193.html](https://xmpp.org/extensions/xep-0193.html)
- **Stream features.** Server-advertised capabilities (`<stream:features>`): `starttls`, `mechanisms`, `bind`, `sm` (stream management), `csi`, etc., that drive negotiation.
- **Dialback.** Weak server-to-server identity verification (XEP-0220) used widely on the public XMPP network when SASL EXTERNAL with PKIX is impractical. [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html) [IETF](https://datatracker.ietf.org/doc/rfc6120/)
- **MUC / MIX.** Multi-User Chat (XEP-0045) is the long-running room protocol; MIX (XEP-0369) is its successor built atop PubSub + MAM. [https://xmpp.org/extensions/xep-0369.html](https://xmpp.org/extensions/xep-0369.html) [XMPP](https://xmpp.org/extensions/xep-0369.pdf)
- **PubSub / PEP.** Generic publish-subscribe (XEP-0060) and Personal Eventing Protocol (XEP-0163) used for avatars, OMEMO key bundles, microblogging, IoT telemetry.
- **MAM / Carbons / Stream Management.** Message Archive Management (XEP-0313), Message Carbons (XEP-0280), Stream Management (XEP-0198) — the three pillars of modern multi-device XMPP. [https://xmpp.org/extensions/xep-0198.html](https://xmpp.org/extensions/xep-0198.html)
- **OMEMO.** XMPP end-to-end encryption (XEP-0384) built on the Signal Protocol's X3DH + Double Ratchet primitives. [https://xmpp.org/extensions/xep-0384.html](https://xmpp.org/extensions/xep-0384.html) [Grokipedia](https://grokipedia.com/page/OMEMO)
- **BOSH.** Bidirectional-streams Over Synchronous HTTP (XEP-0124 + XEP-0206) — long-poll HTTP transport pre-WebSocket. [https://xmpp.org/extensions/xep-0124.html](https://xmpp.org/extensions/xep-0124.html) [XMPP](https://xmpp.org/extensions/xep-0206.html)
- **Jingle.** XMPP signalling for peer-to-peer media (XEP-0166), used by Jitsi/Google Talk for RTP/WebRTC sessions. [https://xmpp.org/extensions/xep-0166.html](https://xmpp.org/extensions/xep-0166.html) [XMPP + 2](https://xmpp.org/extensions/xep-0166.html)

## 2. History and story

**The pre-history (1996–1998).** Through the late 1990s, instant messaging was a walled-garden land grab: AOL Instant Messenger (1997), ICQ (Mirabilis 1996, bought by AOL 1998), Yahoo! Messenger and MSN Messenger were all closed, mutually hostile networks. **Jeremie Miller**, then a young developer working from his farm in Iowa and later studying at Iowa State, was sick of running four chat clients at once. In early 1998 he started "the Jabber project" to do for IM what SMTP had done for email — give it a federated, open, XML-based core. [https://en.wikipedia.org/wiki/Jeremie_Miller](https://en.wikipedia.org/wiki/Jeremie_Miller) [https://xmpp.org/uses/instant-messaging/](https://xmpp.org/uses/instant-messaging/) [XMPP + 4](https://xmpp.org/uses/instant-messaging/)

**The Slashdot moment.** On **4 January 1999** Miller posted *Open Real Time Messaging System* to Slashdot, announcing a working server and "a few test clients." That post — `slashdot.org/story/99/01/04/1621211` — is widely treated as the protocol's birth certificate. [https://slashdot.org/story/99/01/04/1621211/open-real-time-messaging-system](https://slashdot.org/story/99/01/04/1621211/open-real-time-messaging-system) Miller wrote one of the earliest JavaScript XML parsers in the process. [https://en.wikipedia.org/wiki/Jeremie_Miller](https://en.wikipedia.org/wiki/Jeremie_Miller) [Wikipedia + 2](https://en.wikipedia.org/wiki/XMPP)

**Stabilisation (2000–2002).** **jabberd 1.0** shipped May 2000, fixing the basic XML-streaming wire protocol used today. **jabberd 1.2** (October 2000) added *server dialback* to stop trivial domain spoofing. The **Jabber Software Foundation** (JSF) was formed August 2001 to manage the rapidly growing XEP/JEP catalogue. [https://xmpp.org/about/history/](https://xmpp.org/about/history/) [Simon Holywell + 2](https://www.simonholywell.com/post/2013/02/xmpp-and-jabber/)

**IETF formalisation (2002–2004).** In February 2002 the JSF submitted Internet-Drafts; the **XMPP Working Group** was chartered by IESG in October 2002, and held its first meeting at IETF 55 in November with presentations by Miller, Joe Hildebrand, and **Peter Saint-Andre**, who became the protocol's editor-in-chief. The WG made two notable additions to the original Jabber wire protocol: **TLS for channel encryption** and **SASL for authentication**. [https://en.wikipedia.org/wiki/XMPP](https://en.wikipedia.org/wiki/XMPP) **RFC 3920 (XMPP Core)** and **RFC 3921 (IM and Presence)** were published October 2004; the WG concluded the same month. [https://datatracker.ietf.org/doc/html/rfc3920.html](https://datatracker.ietf.org/doc/html/rfc3920.html) [Ilya Safro + 4](https://www.eecis.udel.edu/~amer/856/jabber.05f.ppt)

**The 6120/6121 revision (2011).** Saint-Andre led a thorough rewrite. **RFC 6120** obsoleted RFC 3920 in March 2011, with backward-compatible changes summarised in Appendix D — most importantly tightening TLS rules, retiring stringprep profiles in favour of clearer JID handling, replacing the old session-establishment IQ with implicit sessions, and clarifying server rules for stanza routing. RFC 6121 obsoleted 3921; **RFC 6122** updated JID format, later replaced by **RFC 7622 (2015)** which moved to PRECIS (RFC 7564) for non-ASCII handling. [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/) [https://xmpp.org/rfcs/](https://xmpp.org/rfcs/) [IETF](https://datatracker.ietf.org/doc/rfc6120/)[XMPP](https://xmpp.org/rfcs/)

**The corporate boom and bust (2005–2014).** Google launched Google Talk on XMPP in 2005, opened federation in 2006, and added voice via Jingle. Cisco bought Jabber Inc. in September 2008. Facebook opened XMPP access to Facebook Chat in February 2010. [https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber](https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber) [https://en.wikipedia.org/wiki/XMPP](https://en.wikipedia.org/wiki/XMPP) The cracks then appeared: at Google I/O **15 May 2013**, Google announced Hangouts and *dropped XMPP server-to-server federation* (client-to-server lingered). The EFF called it "a clear step backward". [https://www.eff.org/deeplinks/2013/05/google-abandons-open-standards-instant-messaging](https://www.eff.org/deeplinks/2013/05/google-abandons-open-standards-instant-messaging) Facebook removed XMPP support from its v2 chat API in **April 2014**; Google fully retired the Talk XMPP gateway in **2017**, with residual XMPP federation killed 26 June 2017. [https://www.androidpolice.com/2017/03/24/google-retiring-google-talk-good-also-shutting-several-gmail-labs/](https://www.androidpolice.com/2017/03/24/google-retiring-google-talk-good-also-shutting-several-gmail-labs/) [Slashdot + 4](https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber)

**The XSF era (2007–present).** The JSF renamed itself the **XMPP Standards Foundation** in January 2007 to reflect a focus on protocol over implementations. The Foundation now publishes the XEP series (1.26 of XEP-0001, 2025), runs annual XMPP Summits (Summit 28: 29–30 January 2026 in Brussels, paired with FOSDEM), and curates Compliance Suites. [https://xmpp.org/about/history/](https://xmpp.org/about/history/) [https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/](https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/) [XMPP + 2](https://xmpp.org/about/history/)

**What changed in the last 24 months.** (a) **Meta and the EU DMA**, March 2024: WhatsApp and Messenger were designated gatekeepers and Meta opened an XMPP-derived API for third-party messengers; Element/Matrix demoed a Matrix↔WhatsApp E2EE bridge at FOSDEM 2024, and the XSF published an open letter pushing for native XMPP rather than proprietary APIs. [https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/](https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/) [https://element.io/blog/the-eu-digital-markets-act-is-here/](https://element.io/blog/the-eu-digital-markets-act-is-here/) [https://xmpp.org/announcements/open-letter-meta-dma/](https://xmpp.org/announcements/open-letter-meta-dma/) (b) **OMEMO 0.9.0** (7 April 2025) introduced its own wire format ("OMEMO Double Ratchet"), making OMEMO independent of libsignal's GPL licensing. [https://grokipedia.com/page/OMEMO](https://grokipedia.com/page/OMEMO) (c) **SASL2 / Bind 2 / FAST tokens** (XEP-0388, XEP-0386, XEP-0484) advanced — ejabberd 24.12 (December 2024) and Prosody 13.0 (March 2025) shipped support; XEP-0509 "Initial Authentication Pipelining" began Last Call in late 2025. [https://github.com/processone/ejabberd/releases](https://github.com/processone/ejabberd/releases) [https://xmpp.org/extensions/xep-0509.html](https://xmpp.org/extensions/xep-0509.html) (d) **XEP-0440 (SASL Channel-Binding)** advanced to Stable on 18 November 2025, and **XEP-0485 (PubSub Server Information)** reached Stable on 11 November 2025. [https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/](https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/) (e) **Spaces / XEP-0503** debuted in Movim 0.32 (March 2026). [https://mov.im/community/pubsub.movim.eu/Movim/](https://mov.im/community/pubsub.movim.eu/Movim/) (f) An EKU-validation regression in TLS s2s broke Debian Trixie ejabberd push notifications in early 2026 — fixed by ejabberd 25.08+. [https://planet.jabber.org/](https://planet.jabber.org/) [Wikipedia + 6](https://en.wikipedia.org/wiki/XMPP)

## 3. How it actually works

### 3.1 Big picture

XMPP is XML streaming over TCP. A client opens TCP to the server (default 5222), sends a `<stream>` opening tag, the server replies with its own `<stream>` and a `<stream:features>` list. The two then negotiate STARTTLS, SASL, optional Stream Management, and resource binding, after which the client may send unbounded **stanzas** until either side sends a closing `</stream>` tag. Each server-to-server link is a separate, mostly-symmetric stream pair on TCP/5269. [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html)

### 3.2 The state machine

1. **DNS discovery** — `_xmpps-client._tcp.<domain>` (direct TLS) and `_xmpp-client._tcp.<domain>` (STARTTLS) SRV records (RFC 6120 §3.2). XEP-0156 also lets clients discover BOSH/WebSocket endpoints via host-meta. [https://xmpp.org/extensions/xep-0156.xml](https://xmpp.org/extensions/xep-0156.xml) [XMPP](https://xmpp.org/extensions/xep-0156.xml)
2. **TCP open** to resolved host:port.
3. **(Optional) implicit TLS** if XEP-0368 direct TLS port 5223 was selected.
4. **Stream open** — the client sends:

xml

```
   <?xml version='1.0'?>
   <stream:stream from='juliet@im.example.com' to='im.example.com'
                  version='1.0' xml:lang='en'
                  xmlns='jabber:client' xmlns:stream='http://etherx.jabber.org/streams'>
```

1. **Stream features** from the server, including `<starttls>` if not already encrypted.
2. **STARTTLS** negotiation (`<starttls/>` → `<proceed/>` → TLS handshake → restart stream).
3. **SASL** mechanisms list, then `<auth mechanism='SCRAM-SHA-256'>...</auth>` and challenge/response. Stream restart on success. [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html)
4. **Resource binding** — the client sends an IQ-set with `<bind xmlns='urn:ietf:params:xml:ns:xmpp-bind'><resource>balcony</resource></bind>`; server responds with the full JID. [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html)
5. **(Optional) Stream Management enable** — `<enable xmlns='urn:xmpp:sm:3' resume='true'/>`. [https://xmpp.org/extensions/xep-0198.html](https://xmpp.org/extensions/xep-0198.html)
6. **Stanzas flow** in both directions. Server stores offline messages, syncs across resources, performs delivery rules (RFC 6121 §8).
7. **Close** — `</stream:stream>`, then TLS close-notify, then TCP FIN.

### 3.3 The three stanza kinds

- `<message/>` — fire-and-forget delivery (chat, groupchat, normal, headline, error).
- `<presence/>` — broadcast availability and capability changes.
- `<iq/>` — request-response with `type` ∈ {`get`, `set`, `result`, `error`} and a stanza-level `id` for correlation.

Common attributes on every stanza: `from`, `to`, `id`, `type`, `xml:lang`. The server stamps `from` and rejects forgeries (RFC 6120 §10).

### 3.4 Real on-the-wire example (post-binding)

xml

```
<!-- C → S -->
<message from='juliet@im.example.com/balcony' to='romeo@example.net' id='m-9'
         type='chat'>
  <body>Wherefore art thou?</body>
  <thread>thr-42</thread>
  <request xmlns='urn:xmpp:receipts'/>
  <markable xmlns='urn:xmpp:chat-markers:0'/>
  <store xmlns='urn:xmpp:hints'/>
</message>
```

A typical IQ get/set:

xml

```
<iq type='get' id='roster1' from='juliet@im.example.com/balcony'>
  <query xmlns='jabber:iq:roster'/>
</iq>

<iq type='result' id='roster1' to='juliet@im.example.com/balcony'>
  <query xmlns='jabber:iq:roster' ver='ver7'>
    <item jid='romeo@example.net' subscription='both'/>
  </query>
</iq>
```

A presence broadcast:

xml

```
<presence from='juliet@im.example.com/balcony'>
  <show>away</show>
  <status>Studying poison vendors</status>
  <priority>5</priority>
  <c xmlns='http://jabber.org/protocol/caps'
     hash='sha-1' node='https://conversations.im' ver='abc='/>
</presence>
```

### 3.5 Server-to-server (s2s)

Two TCP connections per direction by default (RFC 3920 model retained for compatibility). Authentication:

- **SASL EXTERNAL with PKIX** when the certificate of the originating domain is trusted (now standard on the modern public network).
- **Server Dialback (XEP-0220)** when not — a third-party DNS-based callback verifies the originating domain's authority over the from-address. [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html) [IETF](https://datatracker.ietf.org/doc/rfc6120/)

Bidirectional s2s on a single TCP connection is offered by XEP-0288 (Bidi).

### 3.6 Sequence diagram

Recipient (romeo@example.net)Server example.netServer im.example.comDNSClient (juliet@im.example.com)Recipient (romeo@example.net)Server example.netServer im.example.comDNSClient (juliet@im.example.com)#mermaid-req{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-req .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-req .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-req .error-icon{fill:#CC785C;}#mermaid-req .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-req .edge-thickness-normal{stroke-width:1px;}#mermaid-req .edge-thickness-thick{stroke-width:3.5px;}#mermaid-req .edge-pattern-solid{stroke-dasharray:0;}#mermaid-req .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-req .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-req .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-req .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-req .marker.cross{stroke:#A1A1A1;}#mermaid-req svg{font-family:inherit;font-size:16px;}#mermaid-req p{margin:0;}#mermaid-req .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-req text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-req .actor-line{stroke:#A1A1A1;}#mermaid-req .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-req .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-req #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-req .sequenceNumber{fill:#5e5e5e;}#mermaid-req #sequencenumber{fill:#E5E5E5;}#mermaid-req #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-req .messageText{fill:#E5E5E5;stroke:none;}#mermaid-req .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-req .labelText,#mermaid-req .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-req .loopText,#mermaid-req .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-req .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-req .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-req .noteText,#mermaid-req .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-req .activation0{fill:transparent;stroke:#00000000;}#mermaid-req .activation1{fill:transparent;stroke:#00000000;}#mermaid-req .activation2{fill:transparent;stroke:#00000000;}#mermaid-req .actorPopupMenu{position:absolute;}#mermaid-req .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-req .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-req .actor-man circle,#mermaid-req line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-req :root{--mermaid-font-family:inherit;}TLS handshake (TLS 1.3, ALPN 'xmpp-client')SRV _xmpp-client._tcp.im.example.com1host:5222 (and XEP-0368 direct-TLS)2TCP SYN/SYN-ACK/ACK (port 5222)3<stream:stream xmlns='jabber:client' to='im.example.com' version='1.0'>4<stream:stream id='abc'> + <stream:features> (starttls required)5<starttls/>6<proceed/>7<stream:stream> (restart over TLS)8<stream:features> (SASL2 mechanisms, bind2, sm)9<authenticate mechanism='SCRAM-SHA-256-PLUS'>...</authenticate>10<success> + bound JID + resumed/enabled SM id11<message to='romeo@example.net' id='m-1'><body>Hi</body></message>12SRV _xmpp-server._tcp.example.net13host:526914TCP + STARTTLS + SASL EXTERNAL (or Dialback)15<message from='juliet@im.example.com/balcony' to='romeo@example.net' id='m-1'>16route to all available resources / store offline17<message type='chat'> reply18route reply19deliver to bound resource20<r/> (Stream Management ack request)21<a h='17'/> (acknowledged stanza count)22

### 3.7 Errors and edge cases

Stream-level fatal errors close the stream: `<stream:error><not-well-formed.../></stream:error>`. Stanza-level errors return the stanza with `type='error'` and an `<error>` child carrying a defined condition (`service-unavailable`, `forbidden`, `recipient-unavailable`, …). RFC 6120 §4.9, §8.3 enumerate all conditions. [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/) Stream Management (XEP-0198) overlays delivery acknowledgements on top of the inherently lossy "send and pray" XML stream so a TCP drop doesn't lose stanzas in flight; the client `<resume/>`s with the last acknowledged sequence number `h`. [https://xmpp.org/extensions/xep-0198.html](https://xmpp.org/extensions/xep-0198.html) [XMPP](https://xmpp.org/extensions/xep-0198.xml)

## 4. Deep connections to other protocols

- **TCP.** The default and only mandatory transport (RFC 6120 §3). Long-lived, half-duplex-friendly streams; the client typically maintains exactly one TCP connection while online (s2s uses two for legacy unidirectional reasons, bidi-s2s collapses to one). [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/)
- **TLS.** RFC 6120 makes TLS support mandatory and STARTTLS the default upgrade path; XEP-0368 ("SRV records for direct TLS") added a port-5223 implicit-TLS option, now widely deployed. The 2026 Debian Trixie/ejabberd EKU bug shows how strict client/server certificate distinctions can break s2s; ejabberd 25.08 relaxed the EKU check. [https://planet.jabber.org/](https://planet.jabber.org/) [Jabber](https://planet.jabber.org/)
- **WebSocket (RFC 7395).** Defines an XMPP subprotocol over WS so browser-resident clients (Converse.js, Movim, Prose) avoid BOSH's polling overhead. Typical endpoints: `wss://server/xmpp-websocket`. [https://datatracker.ietf.org/doc/html/rfc7395](https://datatracker.ietf.org/doc/html/rfc7395) [IETF](https://datatracker.ietf.org/doc/html/rfc7395)
- **BOSH (XEP-0124 + XEP-0206).** Long-poll HTTP transport from 2007. Two HTTP requests are kept open at a time; a "connection manager" terminates them and bridges to the XMPP core. Largely superseded by WebSocket. [https://xmpp.org/extensions/xep-0124.html](https://xmpp.org/extensions/xep-0124.html) [https://xmpp.org/extensions/xep-0206.html](https://xmpp.org/extensions/xep-0206.html) [Xmpp](https://wiki.xmpp.org/web/Tech_pages/BOSH_and_Websocket)
- **Matrix.** The most-cited modern competitor: HTTP/JSON, decentralised but with eventual-consistency state DAGs; servers store full room history (heavy server, light client) where XMPP is the inverse. The DMA stakeholder process at the EU specifically flagged Matrix and XMPP as the two candidate "common languages" for messaging interop; Matrix offers Olm/Megolm E2EE versus XMPP's OMEMO. [https://matrix.org/blog/2022/03/30/technical-faq-on-the-digital-markets-act/](https://matrix.org/blog/2022/03/30/technical-faq-on-the-digital-markets-act/) [https://www.process-one.net/blog/xmpp-matrix/](https://www.process-one.net/blog/xmpp-matrix/) [ejabberd + 2](https://www.process-one.net/blog/xmpp-matrix/)
- **MQTT.** Both are "Async/IoT" protocols, but MQTT is binary, broker-centric pub/sub for telemetry on constrained devices; XMPP is XML and federated. Independent benchmarks find MQTT 50–70% smaller on the wire — and indeed WhatsApp's *FunXMPP* exists precisely because plain XML overhead is unacceptable on cellular networks. ejabberd nowadays bundles an MQTT broker so a single server can speak both. [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540579/](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540579/) [https://getstream.io/blog/whatsapp-works/](https://getstream.io/blog/whatsapp-works/) [https://www.process-one.net/ejabberd/](https://www.process-one.net/ejabberd/) [DEV Community](https://dev.to/emqx/what-is-the-mqtt-and-why-is-it-the-best-protocol-for-iot-n7e)[GetStream](https://getstream.io/blog/whatsapp-works/)
- **SIP / SIMPLE.** SIP-for-Instant-Messaging-and-Presence-Leveraging-Extensions was XMPP's nearest IETF rival, ratified by the same body in 2004. RFC 7247/7248/7572 (2014–2015) define formal SIP↔XMPP interworking. SIP/SIMPLE never won meaningful IM market share; XMPP's headstart from the Jabber community settled it. [https://datatracker.ietf.org/doc/html/rfc7247](https://datatracker.ietf.org/doc/html/rfc7247) [https://andrewjprokop.wordpress.com/2013/11/07/some-pontification-on-xmpp-and-simple/](https://andrewjprokop.wordpress.com/2013/11/07/some-pontification-on-xmpp-and-simple/)
- **IRC.** XMPP was conceived as a reaction *against* IRC's session-only, server-network constraints and to bridge the closed AIM/ICQ gardens. IRC remains text-line over TCP without persistent identity, presence, or extension framework. Hanez's 2024 comparison summarises the architectural distance. [https://hanez.org/document/irc-vs-matrix-vs-xmpp/](https://hanez.org/document/irc-vs-matrix-vs-xmpp/) [Johannes Findeisen](https://hanez.org/document/irc-vs-matrix-vs-xmpp/)
- **Jingle (XEP-0166) / RTP / SIP / WebRTC.** Jingle is XMPP signalling for peer-to-peer media (voice, video, file transfer). XEP-0167 maps Jingle to RTP and SDP for SIP interop; codec recommendations live in XEP-0266. Jitsi Meet's signalling layer is XMPP — Prosody runs the rooms (MUC) and **Jicofo** brokers Jingle sessions to one or more **Jitsi Videobridges** (COLIBRI v2). [https://xmpp.org/extensions/xep-0166.html](https://xmpp.org/extensions/xep-0166.html) [https://github.com/jitsi/jicofo](https://github.com/jitsi/jicofo) [XMPP + 5](https://xmpp.org/extensions/xep-0166.html)
- **OMEMO (XEP-0384) / Signal Protocol.** OMEMO was a 2015 Google Summer of Code project by Andreas Straub that ports Signal's X3DH + Double Ratchet onto XMPP using PEP for prekey-bundle distribution. OMEMO 0.4.0 added MUC support; OMEMO 0.9.0 (2025) introduced the *OMEMO Double Ratchet* (ODR) so implementations can leave libsignal's GPL behind. [https://en.wikipedia.org/wiki/OMEMO](https://en.wikipedia.org/wiki/OMEMO) [https://grokipedia.com/page/OMEMO](https://grokipedia.com/page/OMEMO) Cryptographer Soatok's August 2024 essay "Against XMPP+OMEMO" remains the sharpest critique — arguing OMEMO is iteratively behind upstream Signal (no PQXDH yet, no triple-ratchet/SPQR). [https://soatok.blog/2024/08/04/against-xmppomemo/](https://soatok.blog/2024/08/04/against-xmppomemo/) [Wikipedia + 2](https://en.wikipedia.org/wiki/OMEMO)
- **ActivityPub / Fediverse.** ActivityPub (W3C 2018) is HTTP+JSON-LD, with each object stored on the originating server and *fanned out* to followers' inboxes via signed POSTs. XMPP achieves the same federation goal with PubSub + PEP — see Movim's social features (XEP-0277, XEP-0472, XEP-0503). Bridges like `xmpp-ap-bridge` glue the two. [https://mov.im/community/pubsub.movim.eu/Movim/the-difference-between-xmpp-and-activitypub-explained-through-the-blog-feature-Hdx4FR](https://mov.im/community/pubsub.movim.eu/Movim/the-difference-between-xmpp-and-activitypub-explained-through-the-blog-feature-Hdx4FR) [https://github.com/Barbapulpe/xmpp-ap-bridge](https://github.com/Barbapulpe/xmpp-ap-bridge)
- **MIMI (IETF).** The "More Instant Messaging Interoperability" working group, chartered 2023 in response to the DMA, is explicitly *not* XMPP — its Internet-Draft (`draft-ietf-mimi-protocol-05`, October 2025) specifies HTTPS + MLS for inter-provider transport. Its charter notes it "will draw lessons from" XMPP and SIMPLE without reopening those debates. [https://datatracker.ietf.org/wg/mimi/about/](https://datatracker.ietf.org/wg/mimi/about/) [https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)

## 5. Real-world deployment

- **WhatsApp** built its messaging plane on a heavily forked **ejabberd** speaking a binary, dictionary-compressed dialect called **FunXMPP** (named in Meta's 2019 NSO Group lawsuit filing). Over **100 billion messages a day** are routed by this stack on Erlang/OTP and Mnesia. WhatsApp's 2024 DMA architecture diagrams still label its protocol "based on XMPP". [https://en.wikipedia.org/wiki/WhatsApp](https://en.wikipedia.org/wiki/WhatsApp) [https://getstream.io/blog/whatsapp-works/](https://getstream.io/blog/whatsapp-works/) [https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/](https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/) [Wikipedia + 4](https://en.wikipedia.org/wiki/WhatsApp)
- **Nintendo Switch Push Notification Service (NPNS)** runs on ejabberd: ~10 million simultaneous TCP connections, ~2 billion notifications per day, 100k–200k connections per node, ~600 messages/second. ProcessOne and Nintendo presented the architecture at ElixirFest in 2019; the cluster is split into "inner" (CPU-bound, message ingestion) and "outer" (memory-bound, holds device sessions) ejabberd nodes. [https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/) [ejabberd](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/)[Speaker Deck](https://speakerdeck.com/elixirfest/otp-to-ejabberd-wohuo-yong-sita-nintendo-switch-tm-xiang-ke-hutusiyutong-zhi-sisutemu-npns-false-kai-fa-shi-li)
- **Zoom Chat**, **Origin (EA)**, **PlayStation messaging**, and historically **Xfire**/**Raptr** all use XMPP variants. [https://en.wikipedia.org/wiki/XMPP](https://en.wikipedia.org/wiki/XMPP) [Wikipedia](https://en.wikipedia.org/wiki/XMPP)
- **Jitsi Meet** uses Prosody (XMPP MUC) + Jicofo (Jingle focus) for signalling; this is the canonical example of XMPP as a control plane for WebRTC. [https://github.com/jitsi/jicofo](https://github.com/jitsi/jicofo)
- **Snikket** is the modern "instant-on XMPP-as-a-product" project led by Matthew Wild (Prosody's author) — Prosody plus opinionated modules, paired with Conversations on Android and Siskin-derived iOS. November and December 2025 releases shipped a new SDK ("Borogove") and updated push-notification APIs. [https://snikket.org/blog/snikket-server-nov-2025/](https://snikket.org/blog/snikket-server-nov-2025/) [Snikket](https://snikket.org/open-source/)[Snikket](https://snikket.org/blog/snikket-server-nov-2025/)
- **Conversations** (Android) by Daniel Gultsch is the de facto reference modern XMPP client; v2.19.5–2.19.7 shipped through autumn 2025 with TLS 1.3 enforcement and OMEMO improvements. [https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/](https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/) [XMPP](https://xmpp.org/2025/10/the-xmpp-newsletter-september-2025/)[XMPP](https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/)
- **Servers in 2026.**
  - **ejabberd 25.10** (October 2025) and **26.02** (early 2026) — Erlang, ProcessOne; supports XMPP + MQTT + SIP + Matrix gateway in one binary; tested at "2 million concurrent sessions on a single node". [https://www.process-one.net/ejabberd/](https://www.process-one.net/ejabberd/) [https://www.process-one.net/blog/ejabberd-25-10/](https://www.process-one.net/blog/ejabberd-25-10/) [CopyProgramming](https://copyprogramming.com/howto/xmpp-server-ejabberd-vs-openfire-vs-prosody)[ejabberd](https://www.process-one.net/ejabberd/)
    - **Prosody 13.0.3 / 13.0.4** (late 2025/early 2026) — Lua, lightweight; powers ~half of public XMPP servers per Snikket's count. [https://snikket.org/open-source/](https://snikket.org/open-source/) [CopyProgramming](https://copyprogramming.com/howto/xmpp-server-ejabberd-vs-openfire-vs-prosody)[Snikket](https://snikket.org/open-source/)
    - **Openfire 5.0.3** (December 2025) and 5.0.4 (March 2026) — Java, Ignite Realtime. [https://www.igniterealtime.org/projects/openfire/](https://www.igniterealtime.org/projects/openfire/) [CopyProgramming](https://copyprogramming.com/howto/xmpp-server-ejabberd-vs-openfire-vs-prosody)
    - **Tigase XMPP Server** — Java, used by xmpp.cloud and Siskin iOS infrastructure; first commercial server to ship MIX. [https://tigase.net/tigase-im-mix/](https://tigase.net/tigase-im-mix/)
    - **MongooseIM 6.5.0** — Erlang fork by Erlang Solutions, enterprise focus.
- **Cisco Jabber** (the brand, not the protocol) was end-of-sale: 12.1/12.5 in 2024, 12.6/12.7 in 2022, 12.8/12.9 announced January 2026; legacy Webex meeting API support ends 31 July 2026. Customers are pushed to "Webex App". [https://www.cisco.com/c/en/us/products/unified-communications/jabber-windows/eos-eol-notice-listing.html](https://www.cisco.com/c/en/us/products/unified-communications/jabber-windows/eos-eol-notice-listing.html) [Cisco](https://www.cisco.com/c/en/us/products/unified-communications/jabber-windows/eos-eol-notice-listing.html)[Cisco](https://www.cisco.com/c/dam/en/us/td/docs/voice_ip_comm/jabber/ReleaseNotes/Cisco-Jabber-Release-Notes-for-1431.pdf)
- **Cisco/Jabber Inc. acquisition (2008).** Cisco bought Jabber Inc. for ~$50M and integrated XCP into the Cisco Unified Communications Manager. [https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber](https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber)

## 6. Failure modes and famous incidents

- **Google Hangouts cuts s2s federation, 15 May 2013.** Announced at Google I/O. EFF: "a clear step backward". Federation peering with Google ended for the public XMPP network, the most consequential single event in XMPP's commercial history. [https://www.eff.org/deeplinks/2013/05/google-abandons-open-standards-instant-messaging](https://www.eff.org/deeplinks/2013/05/google-abandons-open-standards-instant-messaging)
- **Facebook Chat XMPP gateway shutdown, April 2014.** v2 Graph API removed XMPP support; third-party Pidgin/Adium plug-ins broke overnight. [https://en.wikipedia.org/wiki/XMPP](https://en.wikipedia.org/wiki/XMPP)
- **Google Talk final shutdown, 26 June 2017.** Residual c2s XMPP went dark; Google Talk widget converted to Hangouts. [https://www.androidpolice.com/2017/03/24/google-retiring-google-talk-good-also-shutting-several-gmail-labs/](https://www.androidpolice.com/2017/03/24/google-retiring-google-talk-good-also-shutting-several-gmail-labs/)
- **CVE-2023-32315 — Openfire admin-console path traversal.** Disclosed May 2023, affecting every release ≥3.10.0 (2015) — that is, almost a decade of production deployments. The attack uses non-standard URL encoding (`%u002e%u002e`) to slip past Openfire's path-traversal filter and reach an unauthenticated `setup-s/...` endpoint, letting an attacker create an admin account, then upload a plug-in with a Java payload for RCE. CVSS 7.5. Patched in 4.6.8 / 4.7.5 / 4.8.0. **VulnCheck found ~50% of internet-facing Openfire instances still vulnerable months after disclosure**, and the bug was actively exploited (Kinsing crypto-miner ransomware in late 2023). [https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm](https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm) [https://www.vulncheck.com/blog/openfire-cve-2023-32315](https://www.vulncheck.com/blog/openfire-cve-2023-32315) [GitHub + 4](https://github.com/vulhub/vulhub/tree/master/openfire/CVE-2023-32315)
- **CVE-2024-25420 / CVE-2024-25421 — Openfire admin-list and MUC-affiliation residue.** Hack The Box found that deleted-then-recreated usernames inherited admin rights or MUC affiliations because state was keyed on username, not account ID. Both fixed in subsequent 5.x releases. [https://www.hackthebox.com/blog/openfire-cves-explained-CVE-2024-25420-CVE-2024-25421](https://www.hackthebox.com/blog/openfire-cves-explained-CVE-2024-25420-CVE-2024-25421) [Hack The Box](https://www.hackthebox.com/blog/openfire-cves-explained-CVE-2024-25420-CVE-2024-25421)
- **Openfire SASL EXTERNAL CN-injection (2025).** Openfire's `X509Certificate.getSubjectDN().getName()` regex did not honour ASN.1 escaping; a malicious cert with `OU="CN=admin,"` would match the CN regex and impersonate `admin`. Fixed in Openfire 5.0.2 / 5.1.0. [https://www.cvedetails.com/vulnerability-list/vendor_id-9209/product_id-16308/Igniterealtime-Openfire.html](https://www.cvedetails.com/vulnerability-list/vendor_id-9209/product_id-16308/Igniterealtime-Openfire.html) [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-9209/product_id-16308/Igniterealtime-Openfire.html)[CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-9209/product_id-16308/Igniterealtime-Openfire.html)
- **Prosody CVE-2018-10847.** A virtual-host confusion in `mod_c2s` allowed a client to switch streams to a different host across XML restarts; fixed in 0.9.14 / 0.10.2. [https://blog.prosody.im/tags/security/](https://blog.prosody.im/tags/security/) [Prosody](https://blog.prosody.im/tags/security/)
- **Prosody CVE-2021-37601 — MUC affiliation list disclosure.** Patched 0.11.10 / trunk August 2021. [https://blog.prosody.im/tags/security/](https://blog.prosody.im/tags/security/) [Freshfoss](https://freshfoss.com/projects/prosody)
- **Debian Trixie + ejabberd EKU regression, 2026.** A Debian-shipped ejabberd 24.12 enforced TLS extended-key-usage strictly enough to break s2s with peers using single-purpose certificates, breaking iOS push delivery for Monal users. ejabberd 25.08 introduced a tolerant validator; the workaround is `mod_s2s_dialback` or upgrading. [https://planet.jabber.org/](https://planet.jabber.org/) [Jabber](https://planet.jabber.org/)[Jabber](https://planet.jabber.org/)
- **fast-xml-parser CVE-2024-41818 / CVE-2023-34104.** Although not an XMPP server bug, `fast-xml-parser` is widely used by Node/JS XMPP clients; ReDoS in `currency.js` (4.3.5–4.4.0) and DOCTYPE entity-regex injection produce DoS via crafted stanzas if not patched. [https://github.com/advisories/GHSA-mpg4-rc92-vx8v](https://github.com/advisories/GHSA-mpg4-rc92-vx8v) [DevHub](https://devhub.checkmarx.com/cve-details/cve-2024-41818/)[GitHub](https://github.com/advisories/GHSA-6w63-h3fj-q4vw)
- **Classic XML expansion bombs.** Both ejabberd (≤2.1.6) and Prosody (≤0.8.0) had the recursive entity expansion bug analogous to CVE-2003-1564 — a textbook reminder that XML parsers, not XMPP per se, are the soft underbelly. [https://www.cvedetails.com/vulnerability-list/vendor_id-4455/product_id-7709/Process-one-Ejabberd.html](https://www.cvedetails.com/vulnerability-list/vendor_id-4455/product_id-7709/Process-one-Ejabberd.html)

## 7. Fun facts and anecdotes

- **The name "Jabber"** comes from English "to jabber" (talk rapidly, indistinctly); detractors loved that it was self-deprecating, and the project's own RFC 527 ancestry trail from "Jabberwocky" (June 1973) makes it doubly literary. [https://news.slashdot.org/story/24/01/06/209211/jabber-was-announced-on-slashdot-25-years-ago-this-week](https://news.slashdot.org/story/24/01/06/209211/jabber-was-announced-on-slashdot-25-years-ago-this-week)
- **The "X" in XMPP** was won, after long debate inside the IETF WG, over alternatives like "JMPP" and "JXP". The chosen name foregrounded XML extensibility — exactly the choice critics like Soatok and ex-Googler engineers later used to attack the protocol as bloated. JSON-replaces-XML arguments dominate the Hacker News comment trees on every XMPP retrospective. [https://news.slashdot.org/story/24/01/06/209211/jabber-was-announced-on-slashdot-25-years-ago-this-week](https://news.slashdot.org/story/24/01/06/209211/jabber-was-announced-on-slashdot-25-years-ago-this-week)
- **The original announcement** on Slashdot, 4 January 1999, was Slashdot story #99/01/04/1621211 by user **Jeremie** (account #257, an early Slashdot ID). Rob "CmdrTaco" Malda posted it from a DEC Multia under his desk at The Image Group ad agency. [https://www.freecodecamp.org/news/a-pre-history-of-slashdot-6403341dabae](https://www.freecodecamp.org/news/a-pre-history-of-slashdot-6403341dabae) [freeCodeCamp](https://www.freecodecamp.org/news/a-pre-history-of-slashdot-6403341dabae)
- **JIDs as URIs.** RFC 5122 (2008) defines `xmpp:juliet@example.com` URIs; the debate over whether JIDs should be URIs at all raged in the WG for years and is the reason RFC 6122/7622 split address syntax out of core. [https://xmpp.org/rfcs/](https://xmpp.org/rfcs/)
- **April Fools' RFCs.** XMPP itself has no canonical April-Fools RFC, but the IETF tradition that birthed it traces directly to **RFC 527 (June 1973) — "ARPAWOCKY"**, a parody of Lewis Carroll's *Jabberwocky*. The protocol's name and the IETF's annual joke RFCs share a literary ancestor. [https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments](https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments)
- **The XML-overhead critique made flesh.** A baseline XMPP `<message>` to deliver "hello" is ~180 bytes; FunXMPP's binary dictionary compresses identical content to ~20 bytes — the bandwidth gap that justified WhatsApp forking. [https://getstream.io/blog/whatsapp-works/](https://getstream.io/blog/whatsapp-works/) [GetStream](https://getstream.io/blog/whatsapp-works/)
- **Cisco bought Jabber Inc. in September 2008** for what trade press estimated at $50M; Peter Saint-Andre joined Cisco as a result and continued editing the XMPP RFCs from there, then left for Mozilla and `&yet`. [https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber](https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber) [https://datatracker.ietf.org/doc/html/rfc7572](https://datatracker.ietf.org/doc/html/rfc7572)
- **Humorous XEPs do exist.** XEP-0001's "humorous XEPs" appendix in *XMPP: The Definitive Guide* lists a number of intentionally non-serious extensions; the XSF prefers wit to outright parody and reserves April-1 jokes mostly for Standards-list emails. [https://www.oreilly.com/library/view/xmpp-the-definitive/9780596157524/index.html](https://www.oreilly.com/library/view/xmpp-the-definitive/9780596157524/index.html)
- **Conversations was sponsored to invent invitation links.** Snikket's frictionless onboarding flow paid Daniel Gultsch to standardise the invite protocol now used by most modern XMPP services. [https://snikket.org/open-source/](https://snikket.org/open-source/) [Snikket](https://snikket.org/open-source/)

## 8. Practical wisdom

- **c2s vs s2s tuning.** c2s wants long idle keepalives (300–600s) plus Stream Management resumption (XEP-0198) — without SM, every flaky-LTE handover loses an unknown number of stanzas. s2s wants aggressive `<r/>`/`<a/>` cadence and Bidi (XEP-0288) so you don't double TCP connection counts.
- **Dialback vs SASL EXTERNAL.** SASL EXTERNAL with PKIX is the strong, modern path; dialback is a pragmatic fallback that still dominates the "long tail" of small servers. Run *both*: SASL EXTERNAL where certs match, dialback as fallback. RFC 6120 explicitly notes dialback's continued necessity. [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/)
- **XEP-0198 settings to be skeptical of.** Default `request-ack` cadence per stanza wastes bandwidth on mobile; instead request acks every 5–10 stanzas or at idle. Servers should keep `resume-timeout` ≥ 5 minutes for mobile clients (Snikket and Conversations expect this). [https://xmpp.org/extensions/xep-0198.html](https://xmpp.org/extensions/xep-0198.html)
- **Carbons (XEP-0280) + MAM (XEP-0313) ordering trap.** Enable Carbons *before* querying MAM, then deduplicate by stanza-id. [https://docs.modernxmpp.org/client/protocol/](https://docs.modernxmpp.org/client/protocol/) [Modernxmpp](https://docs.modernxmpp.org/client/protocol/)
- **CSI (Client State Indication, XEP-0352).** Tell the server when your UI is backgrounded so it can drop presence/typing churn and only wake the device for messages — this is the difference between a one-day-on-charger client and a four-hour client.
- **Push (XEP-0357).** Two-tier indirection through a dedicated app-server PubSub. Keep your push gateway distinct from your main user server so a push-storm doesn't take chat down.
- **Compliance Suites (XEP-0479, 2023).** Use them as a checklist for client/server feature parity; categories are Core, Web, IM, Mobile, A/V Calling at "Core" or "Advanced" levels. [https://xmpp.org/extensions/xep-0479.html](https://xmpp.org/extensions/xep-0479.html) [XMPP](https://xmpp.org/extensions/xep-0479.html)[XMPP](https://xmpp.org/extensions/xep-0479.xml)
- **What to monitor in production traces.**
  - SASL failure rate (sudden spike = bad cert rotation or bot-credential stuffing).
    - Stream resumption success rate (≥90% on mobile is healthy).
    - s2s connection count per peer domain (sudden drop = TLS regression like the Trixie EKU bug).
    - Stanza queue backlog per session (XEP-0198 `h` divergence).
- **Common misconfigurations.** Forgetting to enable PEP for OMEMO key bundles; running mod_compression with untrusted input (xmppbomb history); leaving in-band registration on without rate limiting (spam haven); shipping self-signed certs that fail SASL EXTERNAL on peer servers.
- **Debugging moves.** `prosodyctl shell` (Lua REPL into a running server), `ejabberdctl debug` (Erlang remote shell — Nintendo's NPNS team used this to find a 30-minute session-cleanup penalty), `tcpdump -A 'port 5222'` once you've negotiated SSL key logging, and clients like Gajim/Conversations expose raw XML console. [ejabberd](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/)

## 9. Learning resources (current as of May 2026)

**Authoritative specifications (free)**

- RFC 6120 — XMPP Core (P. Saint-Andre, 2011). [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/) — *Intro/Intermediate; current.*
- RFC 6121 — XMPP IM and Presence (2011). [https://www.rfc-editor.org/info/rfc6121](https://www.rfc-editor.org/info/rfc6121) — *Intermediate; current.*
- RFC 7622 — XMPP Address Format (2015). [https://datatracker.ietf.org/doc/html/rfc7622](https://datatracker.ietf.org/doc/html/rfc7622) — *Reference.*
- RFC 7395 — XMPP over WebSocket (2014). [https://datatracker.ietf.org/doc/html/rfc7395](https://datatracker.ietf.org/doc/html/rfc7395) — *Reference.*
- RFC 7247/7248/7572 — SIP↔XMPP interworking (2014–2015). [https://datatracker.ietf.org/doc/html/rfc7247](https://datatracker.ietf.org/doc/html/rfc7247) — *Advanced.*
- XEP series, especially XEP-0001 v1.26 (2025), XEP-0030, XEP-0045, XEP-0060, XEP-0163, XEP-0166, XEP-0198, XEP-0280, XEP-0313, XEP-0352, XEP-0357, XEP-0368, XEP-0369, XEP-0384, XEP-0388, XEP-0440, XEP-0479. [https://xmpp.org/extensions/](https://xmpp.org/extensions/) — *Authoritative; updated monthly.*
- RFC 6455 — WebSocket Protocol (2011). [https://www.rfc-editor.org/info/rfc6455](https://www.rfc-editor.org/info/rfc6455)

**Books**

- *XMPP: The Definitive Guide*, Saint-Andre, Smith, Tronçon, O'Reilly 2009. ISBN 978-0-596-52126-4. Chapters 1–4 cover architecture, addresses, streams; Chapter 6 is the bedrock for implementing presence; Chapter 9 (Server Federation) is still relevant. [https://www.oreilly.com/library/view/xmpp-the-definitive/9780596157524/index.html](https://www.oreilly.com/library/view/xmpp-the-definitive/9780596157524/index.html) — *Intro/Advanced; pre-RFC 6120 in places.* [O'Reilly](https://www.oreilly.com/pub/pr/2301)[ResearchGate](https://www.researchgate.net/publication/220693434_XMPP_-_The_Definitive_Guide_Building_Real-Time_Applications_with_Jabber_Technologies)

**Engineering blog posts (2024–2026 currency)**

- *Making messaging interoperability with third parties safe for users in Europe* — Meta Engineering, 6 March 2024. [https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/](https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/) — *Advanced; 2024.*
- *Update on Native Matrix interoperability with WhatsApp* — Matthew Hodgson, Matrix.org, 16 September 2024. [https://matrix.org/blog/2024/09/whatsapp-dma/](https://matrix.org/blog/2024/09/whatsapp-dma/) — *Intermediate; 2024.*
- *How WhatsApp Works* — GetStream, 2024. [https://getstream.io/blog/whatsapp-works/](https://getstream.io/blog/whatsapp-works/) — *Intermediate; 2024.*
- *XMPP and Matrix* — ProcessOne, 2024. [https://www.process-one.net/blog/xmpp-matrix/](https://www.process-one.net/blog/xmpp-matrix/) — *Intermediate.*
- *ejabberd & Nintendo Switch NPNS* — ProcessOne, 2019, still the canonical scale write-up. [https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/)
- *Against XMPP+OMEMO* — Soatok, August 2024. [https://soatok.blog/2024/08/04/against-xmppomemo/](https://soatok.blog/2024/08/04/against-xmppomemo/) — *Advanced; 2024.*
- *Modern XMPP* — community guidance project, last updated 2024. [https://docs.modernxmpp.org/](https://docs.modernxmpp.org/) — *Intro/Intermediate.*
- *XMPP Newsletter* — XSF, monthly through May 2026. [https://xmpp.org/category/newsletter/](https://xmpp.org/category/newsletter/) — *Intermediate; current.*

**Academic / standards papers**

- Naik, *Choice of effective messaging protocols for IoT systems: MQTT, CoAP, AMQP and HTTP* — IEEE 2017. (Comparator with XMPP.) [needs DOI lookup]
- Mishra et al., *Messaging Protocols for IoT Systems—A Pragmatic Comparison*, Sensors 21(20):6904, 2021. [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540579/](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540579/) — *Advanced.*
- Hashimoto, Katsumata, Wigger et al., *Comprehensive Deniability Analysis of Signal Handshake Protocols* (eprint 2025/1090). [https://eprint.iacr.org/2025/1090](https://eprint.iacr.org/2025/1090) — *Advanced; useful as a foil for OMEMO debates; 2025.*

**Hands-on tools**

- Conversations 2.19.x (Android) — [https://conversations.im/](https://conversations.im/) — *Reference client; 2025–26.*
- Snikket self-hosted — [https://snikket.org/](https://snikket.org/) — *Easiest end-to-end setup; 2025–26.*
- Gajim 2.4.x (desktop) — [https://gajim.org/](https://gajim.org/) — *Best for raw XML console debugging; 2025.*
- Movim 0.32 — [https://movim.eu/](https://movim.eu/) — *Social/PubSub-heavy, 2026.*
- Dino 0.5.x — [https://dino.im/](https://dino.im/) — *Lightweight Linux client; 2025.*
- Prose web client — [https://prose.org/](https://prose.org/) — *Modern WebAssembly; 2025.*
- ejabberd 26.02 / Prosody 13.0 / Openfire 5.0.4 — *Reference servers, all current early 2026.*
- *XMPP Interop Testing* (CI scenario runner) — [https://xmpp.org/2025/11/the-xmpp-newsletter-october-2025/](https://xmpp.org/2025/11/the-xmpp-newsletter-october-2025/)

**Videos and talks**

- *Engineering XMPP Federation* — XSF talks at FOSDEM 2026 Decentralised Communication track, AW1.126, 31 January 2026. [https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/](https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/) — *Intermediate; 2026.*
- *Opening up communication silos with Matrix 2.0 and the EU DMA* — FOSDEM 2024 (Hodgson). [https://element.io/blog/the-eu-digital-markets-act-is-here/](https://element.io/blog/the-eu-digital-markets-act-is-here/) — *Intermediate.*
- *Erlang/OTP と ejabberd を活用した Nintendo Switch 向け プッシュ通知システム NPNS の開発事例* — Watanabe, ElixirFest 2019. [https://speakerdeck.com/elixirfest/otp-to-ejabberd-wohuo-yong-sita-nintendo-switch-tm-xiang-ke-hutusiyutong-zhi-sisutemu-npns-false-kai-fa-shi-li](https://speakerdeck.com/elixirfest/otp-to-ejabberd-wohuo-yong-sita-nintendo-switch-tm-xiang-ke-hutusiyutong-zhi-sisutemu-npns-false-kai-fa-shi-li) — *Advanced.*

**Free university course material**

- [needs source — no first-rank university OCW course on XMPP found in 2024–2026 indexes; CS conference tutorials at IETF Hackathons (e.g., IETF 125 hackathon work on XEP-0202 by Daniel Gultsch, late 2025) are the closest substitute.] [https://xmpp.org/2026/04/the-xmpp-newsletter-march-2026/](https://xmpp.org/2026/04/the-xmpp-newsletter-march-2026/)

## 10. Where things are heading (2025–2026 frontier)

- **The IETF XMPP WG remains formally concluded** (since 2004). XSF runs all extension work; IETF XMPP-adjacent work happens in **MIMI**, which has consciously chosen *not* to extend XMPP and is instead specifying HTTPS+MLS transport (`draft-ietf-mimi-protocol-05`, October 2025). [https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)
- **DMA fallout (2024–2026).** Meta's WhatsApp/Messenger reference offers (March + September 2024) opened a new commercial frontier; by November 2025 Meta announced first interoperable third-party apps (BirdyChat, Haiket); the XSF's open letter to Meta calls for native XMPP rather than proprietary APIs. The strategic question for 2026: will any DMA bridge actually use XMPP as its transit, or will Matrix and proprietary APIs share the field? [https://www.computing.co.uk/news/2025/legislation-regulation/whatsapp-announces-interoperability](https://www.computing.co.uk/news/2025/legislation-regulation/whatsapp-announces-interoperability) [https://xmpp.org/announcements/open-letter-meta-dma/](https://xmpp.org/announcements/open-letter-meta-dma/) [FB](https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/)[Computing](https://www.computing.co.uk/news/2025/legislation-regulation/whatsapp-announces-interoperability)
- **SASL2 / Bind 2 / FAST tokens.** XEP-0388 and XEP-0386 collapse the SASL → bind → SM-resume → push-enable handshake to a single round trip; XEP-0484 adds long-lived authentication tokens; XEP-0509 (Experimental, 12 December 2025) pipelines all of this into the initial connection. ejabberd 24.12+ and Prosody 13+ support the suite. Expect XEP-0440 channel-binding (Stable November 2025) to be a default in 2026 servers. [https://xmpp.org/extensions/xep-0509.html](https://xmpp.org/extensions/xep-0509.html) [https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/](https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/) [GitHub + 2](https://github.com/processone/ejabberd/releases)
- **MIX adoption.** XEP-0369 (MIX-CORE) remains *Experimental* since 2017, but **Tigase** has shipped a production MIX implementation on xmpp.cloud, and ejabberd has a mod_mix. Conversations and Snikket continue to use MUC + bookmarks; MIX is not yet the de facto group-chat standard despite being designed to replace MUC. [https://tigase.net/tigase-im-mix/](https://tigase.net/tigase-im-mix/)
- **OMEMO post-quantum gap.** OMEMO 0.9.0 still uses X3DH + Double Ratchet on Curve25519; Signal already shipped PQXDH (2023) and the Triple Ratchet / SPQR (2025). Several blog discussions in 2024 suggest OMEMO will need to track the SPQR design; nothing has been merged into a XEP yet. [https://en.wikipedia.org/wiki/Signal_Protocol](https://en.wikipedia.org/wiki/Signal_Protocol) [https://soatok.blog/2024/08/04/against-xmppomemo/](https://soatok.blog/2024/08/04/against-xmppomemo/)
- **IoT vs MQTT.** XMPP's IoT story is increasingly: "use ejabberd, which embeds an MQTT broker." Pure XMPP-IoT (via XEPs 0323/0324/0325/0326) has not displaced MQTT. [https://www.process-one.net/ejabberd/](https://www.process-one.net/ejabberd/)
- **Matrix gateway in ejabberd.** ejabberd 25.07/25.08/25.10 added Matrix Hydra-room support and improved compliance with Matrix's federation; this makes ejabberd a viable bridge node rather than a pure XMPP server. [https://www.process-one.net/blog/ejabberd-25-07/](https://www.process-one.net/blog/ejabberd-25-07/) [https://www.process-one.net/blog/ejabberd-25-10/](https://www.process-one.net/blog/ejabberd-25-10/) [ejabberd](https://www.process-one.net/blog/ejabberd-25-07/)[ejabberd](https://www.process-one.net/ejabberd/)
- **Spaces (XEP-0503).** Movim 0.32 (March 2026) is the first major XMPP product to ship a "Discord-style" hierarchical Spaces UI on top of PubSub + MUC. [https://mov.im/community/pubsub.movim.eu/Movim/](https://mov.im/community/pubsub.movim.eu/Movim/)
- **Network Graph and PubSub Server Information (XEP-0485).** The XSF is publicly tracking which servers participate in the federation graph for spam mitigation. [https://xmpp.org/2025/11/the-xmpp-newsletter-october-2025/](https://xmpp.org/2025/11/the-xmpp-newsletter-october-2025/) [GitHub](https://github.com/processone/ejabberd/releases/tag/25.07)

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook (write for the ear).**

> "On a farm in Iowa in 1998, a frustrated 23-year-old got tired of running four chat apps to talk to his friends. He wrote his own. He posted it to Slashdot on January 4, 1999. Twenty-five years later, that protocol routes a hundred billion messages a day for WhatsApp, ten million game consoles for Nintendo Switch, every video call on Jitsi Meet, and a quiet federated network of independent servers that survived Google killing it, Facebook killing it, and every cycle of 'XMPP is dead' since 2013. The protocol is XMPP. The kid was Jeremie Miller. And the European Union may have just brought it back from the margins."

**A striking statistic with source.** Nintendo's Switch Push Notification Service handles ~10 million simultaneous TCP connections and ~2 billion daily messages on a single ejabberd cluster — and was built in six months. [https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/) [ejabberd](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/)

**A "pause and think" moment.** WhatsApp routes more messages per day on a forked ejabberd (Erlang) running on FreeBSD than the public SMS network does globally — and to do it, they wrote a binary dictionary compression layer because plain XMPP's XML overhead was too heavy on a $20 phone in rural Brazil. The XML-bloat critique that *defines* engineer scepticism toward XMPP is the same critique that made WhatsApp viable. [https://en.wikipedia.org/wiki/WhatsApp](https://en.wikipedia.org/wiki/WhatsApp) [https://getstream.io/blog/whatsapp-works/](https://getstream.io/blog/whatsapp-works/) [GetStream](https://getstream.io/blog/whatsapp-works/)

**A failure-story arc retold dramatically (CVE-2023-32315).**

- *Setup.* Openfire is the friendly Java XMPP server. April 2015's release added a path-traversal filter to the admin console because they'd already been bitten in 2008 (CVE-2008-6508). The filter handles `..` and `%2e%2e`. They forget about `%u002e%u002e` — non-standard UTF-16 URL encoding that the *embedded* webserver didn't even support at the time. [GitHub](https://github.com/vulhub/vulhub/tree/master/openfire/CVE-2023-32315)
- *Mistake.* Years later, the team upgrades the embedded webserver. The new Jetty *does* understand `%u002e%u002e`. Nobody updates the filter. [GitHub](https://github.com/K3ysTr0K3R/CVE-2023-32315-EXPLOIT)
- *Consequence.* For roughly **eight years**, every Openfire on the public internet has an unauthenticated admin path. May 2023, the bug is public. By August, VulnCheck finds about 50% of internet-facing Openfire still vulnerable, and the Kinsing crypto-miner gang is using it as an entry vector. [VulnCheck](https://www.vulncheck.com/blog/openfire-cve-2023-32315)
- *Resolution.* Patches in 4.6.8/4.7.5; in 4.8.0 the embedded webserver is downgraded to one without `%u002e%u002e`, and the admin console binds to loopback by default. The lesson — *sanitisation filters and the parsers below them must be versioned together* — is the kind of dramatic, concrete moment that podcasts are made of. [https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm](https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm) [https://www.vulncheck.com/blog/openfire-cve-2023-32315](https://www.vulncheck.com/blog/openfire-cve-2023-32315) [GitHub](https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm)

## 12. Citations

1. [https://xmpp.org/about/history/](https://xmpp.org/about/history/)
2. [https://en.wikipedia.org/wiki/Jeremie_Miller](https://en.wikipedia.org/wiki/Jeremie_Miller)
3. [https://xmpp.org/uses/instant-messaging/](https://xmpp.org/uses/instant-messaging/)
4. [https://slashdot.org/story/99/01/04/1621211/open-real-time-messaging-system](https://slashdot.org/story/99/01/04/1621211/open-real-time-messaging-system)
5. [https://news.slashdot.org/story/24/01/06/209211/jabber-was-announced-on-slashdot-25-years-ago-this-week](https://news.slashdot.org/story/24/01/06/209211/jabber-was-announced-on-slashdot-25-years-ago-this-week)
6. [https://www.freecodecamp.org/news/a-pre-history-of-slashdot-6403341dabae](https://www.freecodecamp.org/news/a-pre-history-of-slashdot-6403341dabae)
7. [https://en.wikipedia.org/wiki/XMPP](https://en.wikipedia.org/wiki/XMPP)
8. [https://datatracker.ietf.org/doc/rfc6120/](https://datatracker.ietf.org/doc/rfc6120/)
9. [https://xmpp.org/rfcs/rfc6120.html](https://xmpp.org/rfcs/rfc6120.html)
10. [https://www.rfc-editor.org/info/rfc6121](https://www.rfc-editor.org/info/rfc6121)
11. [https://datatracker.ietf.org/doc/html/rfc7622](https://datatracker.ietf.org/doc/html/rfc7622)
12. [https://xmpp.org/rfcs/](https://xmpp.org/rfcs/)
13. [https://datatracker.ietf.org/doc/html/rfc3920.html](https://datatracker.ietf.org/doc/html/rfc3920.html)
14. [https://datatracker.ietf.org/doc/html/rfc7395](https://datatracker.ietf.org/doc/html/rfc7395)
15. [https://www.rfc-editor.org/info/rfc8446](https://www.rfc-editor.org/info/rfc8446)
16. [https://www.rfc-editor.org/info/rfc9293](https://www.rfc-editor.org/info/rfc9293)
17. [https://xmpp.org/extensions/](https://xmpp.org/extensions/)
18. [https://xmpp.org/extensions/xep-0124.html](https://xmpp.org/extensions/xep-0124.html)
19. [https://xmpp.org/extensions/xep-0206.html](https://xmpp.org/extensions/xep-0206.html)
20. [https://xmpp.org/extensions/xep-0156.xml](https://xmpp.org/extensions/xep-0156.xml)
21. [https://xmpp.org/extensions/xep-0166.html](https://xmpp.org/extensions/xep-0166.html)
22. [https://xmpp.org/extensions/xep-0167.html](https://xmpp.org/extensions/xep-0167.html)
23. [https://xmpp.org/extensions/xep-0198.html](https://xmpp.org/extensions/xep-0198.html)
24. [https://xmpp.org/extensions/xep-0193.html](https://xmpp.org/extensions/xep-0193.html)
25. [https://xmpp.org/extensions/xep-0369.html](https://xmpp.org/extensions/xep-0369.html)
26. [https://xmpp.org/extensions/xep-0384.html](https://xmpp.org/extensions/xep-0384.html)
27. [https://xmpp.org/extensions/xep-0384.pdf](https://xmpp.org/extensions/xep-0384.pdf)
28. [https://xmpp.org/extensions/xep-0479.html](https://xmpp.org/extensions/xep-0479.html)
29. [https://xmpp.org/extensions/xep-0509.html](https://xmpp.org/extensions/xep-0509.html)
30. [https://xmpp.org/extensions/xep-0511.html](https://xmpp.org/extensions/xep-0511.html)
31. [https://xmpp.org/extensions/xep-0451.html](https://xmpp.org/extensions/xep-0451.html)
32. [https://docs.modernxmpp.org/client/protocol/](https://docs.modernxmpp.org/client/protocol/)
33. [https://xmpp.org/2025/11/the-xmpp-newsletter-october-2025/](https://xmpp.org/2025/11/the-xmpp-newsletter-october-2025/)
34. [https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/](https://xmpp.org/2025/12/the-xmpp-newsletter-november-2025/)
35. [https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/](https://xmpp.org/2026/01/the-xmpp-newsletter-december-2025/)
36. [https://xmpp.org/2026/02/the-xmpp-newsletter-january-2026/](https://xmpp.org/2026/02/the-xmpp-newsletter-january-2026/)
37. [https://xmpp.org/2026/03/the-xmpp-newsletter-february-2026/](https://xmpp.org/2026/03/the-xmpp-newsletter-february-2026/)
38. [https://xmpp.org/2026/04/the-xmpp-newsletter-march-2026/](https://xmpp.org/2026/04/the-xmpp-newsletter-march-2026/)
39. [https://xmpp.org/announcements/open-letter-meta-dma/](https://xmpp.org/announcements/open-letter-meta-dma/)
40. [https://xmpp.org/about/technology-overview/](https://xmpp.org/about/technology-overview/)
41. [https://xmpp.org/about/the-jabber-project/](https://xmpp.org/about/the-jabber-project/)
42. [https://xmpp.org/about/compliance-suites/](https://xmpp.org/about/compliance-suites/)
43. [https://snikket.org/blog/snikket-server-nov-2025/](https://snikket.org/blog/snikket-server-nov-2025/)
44. [https://snikket.org/blog/snikket-server-dec-2025/](https://snikket.org/blog/snikket-server-dec-2025/)
45. [https://snikket.org/open-source/](https://snikket.org/open-source/)
46. [https://snikket.org/faq/](https://snikket.org/faq/)
47. [https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/](https://www.process-one.net/blog/ejabberd-nintendo-switch-npns/)
48. [https://www.process-one.net/blog/xmpp-matrix/](https://www.process-one.net/blog/xmpp-matrix/)
49. [https://www.process-one.net/blog/ejabberd-25-07/](https://www.process-one.net/blog/ejabberd-25-07/)
50. [https://www.process-one.net/blog/ejabberd-25-10/](https://www.process-one.net/blog/ejabberd-25-10/)
51. [https://www.process-one.net/blog/ejabberd-26-02/](https://www.process-one.net/blog/ejabberd-26-02/)
52. [https://www.process-one.net/ejabberd/](https://www.process-one.net/ejabberd/)
53. [https://github.com/processone/ejabberd/releases](https://github.com/processone/ejabberd/releases)
54. [https://www.eff.org/deeplinks/2013/05/google-abandons-open-standards-instant-messaging](https://www.eff.org/deeplinks/2013/05/google-abandons-open-standards-instant-messaging)
55. [https://www.androidpolice.com/2017/03/24/google-retiring-google-talk-good-also-shutting-several-gmail-labs/](https://www.androidpolice.com/2017/03/24/google-retiring-google-talk-good-also-shutting-several-gmail-labs/)
56. [https://www.disruptivetelephony.com/2013/05/did-google-really-kill-off-all-xmppjabber-support-in-google-hangouts-it-still-seems-to-partially-work.html](https://www.disruptivetelephony.com/2013/05/did-google-really-kill-off-all-xmppjabber-support-in-google-hangouts-it-still-seems-to-partially-work.html)
57. [https://blogs.fsfe.org/hugo/2013/05/google-talk-discontinued-will-google-keep-its-promise-and-give-xmpp-users-a-way-out/](https://blogs.fsfe.org/hugo/2013/05/google-talk-discontinued-will-google-keep-its-promise-and-give-xmpp-users-a-way-out/)
58. [https://en.wikipedia.org/wiki/WhatsApp](https://en.wikipedia.org/wiki/WhatsApp)
59. [https://getstream.io/blog/whatsapp-works/](https://getstream.io/blog/whatsapp-works/)
60. [https://www.cometchat.com/blog/whatsapps-architecture-and-system-design](https://www.cometchat.com/blog/whatsapps-architecture-and-system-design)
61. [https://ethora.com/blog/how-does-whatsapp-work-inside-its-architecture-design/](https://ethora.com/blog/how-does-whatsapp-work-inside-its-architecture-design/)
62. [https://medium.com/@rajendra_51543/how-whatsapp-works-197bfc6d6b95](https://medium.com/@rajendra_51543/how-whatsapp-works-197bfc6d6b95)
63. [https://www.rst.software/blog/22-companies-using-xmpp-and-ejabberd-to-build-instant-messaging-services](https://www.rst.software/blog/22-companies-using-xmpp-and-ejabberd-to-build-instant-messaging-services)
64. [https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/](https://engineering.fb.com/2024/03/06/security/whatsapp-messenger-messaging-interoperability-eu/)
65. [https://element.io/blog/the-eu-digital-markets-act-is-here/](https://element.io/blog/the-eu-digital-markets-act-is-here/)
66. [https://element.io/blog/the-digital-markets-act-explained-in-15-questions/](https://element.io/blog/the-digital-markets-act-explained-in-15-questions/)
67. [https://matrix.org/blog/2022/03/30/technical-faq-on-the-digital-markets-act/](https://matrix.org/blog/2022/03/30/technical-faq-on-the-digital-markets-act/)
68. [https://matrix.org/blog/2024/09/whatsapp-dma/](https://matrix.org/blog/2024/09/whatsapp-dma/)
69. [https://matrix.org/blog/2023/03/15/the-dma-stakeholder-workshop-interoperability-between-messaging-services/](https://matrix.org/blog/2023/03/15/the-dma-stakeholder-workshop-interoperability-between-messaging-services/)
70. [https://www.computing.co.uk/news/2025/legislation-regulation/whatsapp-announces-interoperability](https://www.computing.co.uk/news/2025/legislation-regulation/whatsapp-announces-interoperability)
71. [https://datatracker.ietf.org/wg/mimi/about/](https://datatracker.ietf.org/wg/mimi/about/)
72. [https://datatracker.ietf.org/doc/charter-ietf-mimi/](https://datatracker.ietf.org/doc/charter-ietf-mimi/)
73. [https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/](https://datatracker.ietf.org/doc/draft-ietf-mimi-protocol/)
74. [https://hanez.org/document/irc-vs-matrix-vs-xmpp/](https://hanez.org/document/irc-vs-matrix-vs-xmpp/)
75. [https://lukesmith.xyz/articles/matrix-vs-xmpp/](https://lukesmith.xyz/articles/matrix-vs-xmpp/)
76. [https://joinmatrix.org/guide/matrix-vs-al/](https://joinmatrix.org/guide/matrix-vs-al/)
77. [https://eylenburg.github.io/im_comparison.htm](https://eylenburg.github.io/im_comparison.htm)
78. [https://thisvsthat.io/matrix-vs-xmpp](https://thisvsthat.io/matrix-vs-xmpp)
79. [https://en.wikipedia.org/wiki/OMEMO](https://en.wikipedia.org/wiki/OMEMO)
80. [https://wiki.xmpp.org/web/Tech_pages/OMEMO](https://wiki.xmpp.org/web/Tech_pages/OMEMO)
81. [https://conversations.im/omemo/](https://conversations.im/omemo/)
82. [https://hackmag.com/coding/omemo-inside](https://hackmag.com/coding/omemo-inside)
83. [https://grokipedia.com/page/OMEMO](https://grokipedia.com/page/OMEMO)
84. [https://soatok.blog/2024/08/04/against-xmppomemo/](https://soatok.blog/2024/08/04/against-xmppomemo/)
85. [https://en.wikipedia.org/wiki/Signal_Protocol](https://en.wikipedia.org/wiki/Signal_Protocol)
86. [https://eprint.iacr.org/2025/1090](https://eprint.iacr.org/2025/1090)
87. [https://csrc.nist.gov/csrc/media/events/2025/sixth-pqc-standardization-conference/post-quantum%20ratcheting%20for%20signal.pdf](https://csrc.nist.gov/csrc/media/events/2025/sixth-pqc-standardization-conference/post-quantum%20ratcheting%20for%20signal.pdf)
88. [https://datatracker.ietf.org/doc/html/rfc7247](https://datatracker.ietf.org/doc/html/rfc7247)
89. [https://datatracker.ietf.org/doc/html/rfc7248](https://datatracker.ietf.org/doc/html/rfc7248)
90. [https://datatracker.ietf.org/doc/rfc7572/](https://datatracker.ietf.org/doc/rfc7572/)
91. [https://andrewjprokop.wordpress.com/2013/11/07/some-pontification-on-xmpp-and-simple/](https://andrewjprokop.wordpress.com/2013/11/07/some-pontification-on-xmpp-and-simple/)
92. [https://en.wikipedia.org/wiki/Jingle_(protocol)](https://en.wikipedia.org/wiki/Jingle_(protocol))
93. [https://wiki.xmpp.org/web/Tech_pages/Jingle](https://wiki.xmpp.org/web/Tech_pages/Jingle)
94. [https://github.com/jitsi/jicofo](https://github.com/jitsi/jicofo)
95. [https://jitsi.expert/wiki/jitsi-meet-prosody-explained/](https://jitsi.expert/wiki/jitsi-meet-prosody-explained/)
96. [https://meetrix.io/articles/jitsi-architecture-exploring-nginx-jicofo-prosody-jvb-and-frontend-interface/](https://meetrix.io/articles/jitsi-architecture-exploring-nginx-jicofo-prosody-jvb-and-frontend-interface/)
97. [https://wiki.archlinux.org/title/Jitsi-meet](https://wiki.archlinux.org/title/Jitsi-meet)
98. [https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540579/](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC8540579/)
99. [https://stackshare.io/stackups/mqtt-vs-xmpp](https://stackshare.io/stackups/mqtt-vs-xmpp)
100. [https://www.rst.software/blog/xmpp-vs-matrix-vs-mqtt-which-instant-messaging-protocol-is-best-for-your-chat-application](https://www.rst.software/blog/xmpp-vs-matrix-vs-mqtt-which-instant-messaging-protocol-is-best-for-your-chat-application)
101. [https://servicelab.org/2015/05/08/xmpp-versus-mqtt-comparing-apples-with-pears/](https://servicelab.org/2015/05/08/xmpp-versus-mqtt-comparing-apples-with-pears/)
102. [https://expertbeacon.com/mqtt-vs-xmpp-an-in-depth-comparison-for-iot-messaging/](https://expertbeacon.com/mqtt-vs-xmpp-an-in-depth-comparison-for-iot-messaging/)
103. [https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm](https://github.com/igniterealtime/Openfire/security/advisories/GHSA-gw42-f939-fhvm)
104. [https://www.vulncheck.com/blog/openfire-cve-2023-32315](https://www.vulncheck.com/blog/openfire-cve-2023-32315)
105. [https://www.hackthebox.com/blog/openfire-cves-explained-CVE-2024-25420-CVE-2024-25421](https://www.hackthebox.com/blog/openfire-cves-explained-CVE-2024-25420-CVE-2024-25421)
106. [https://www.cvedetails.com/vulnerability-list/vendor_id-9209/product_id-16308/Igniterealtime-Openfire.html](https://www.cvedetails.com/vulnerability-list/vendor_id-9209/product_id-16308/Igniterealtime-Openfire.html)
107. [https://www.rapid7.com/db/modules/exploit/multi/http/openfire_auth_bypass_rce_cve_2023_32315/](https://www.rapid7.com/db/modules/exploit/multi/http/openfire_auth_bypass_rce_cve_2023_32315/)
108. [https://github.com/K3ysTr0K3R/CVE-2023-32315-EXPLOIT](https://github.com/K3ysTr0K3R/CVE-2023-32315-EXPLOIT)
109. [https://www.sangfor.com/farsight-labs-threat-intelligence/cybersecurity/cve-2023-32315-openfire-authentication-bypass-vulnerability](https://www.sangfor.com/farsight-labs-threat-intelligence/cybersecurity/cve-2023-32315-openfire-authentication-bypass-vulnerability)
110. [https://www.cvedetails.com/vulnerability-list/vendor_id-4455/product_id-7709/Process-one-Ejabberd.html](https://www.cvedetails.com/vulnerability-list/vendor_id-4455/product_id-7709/Process-one-Ejabberd.html)
111. [https://www.cvedetails.com/vulnerability-list/vendor_id-11422/Prosody.html](https://www.cvedetails.com/vulnerability-list/vendor_id-11422/Prosody.html)
112. [https://blog.prosody.im/tags/security/](https://blog.prosody.im/tags/security/)
113. [https://github.com/advisories/GHSA-mpg4-rc92-vx8v](https://github.com/advisories/GHSA-mpg4-rc92-vx8v)
114. [https://github.com/advisories/GHSA-6w63-h3fj-q4vw](https://github.com/advisories/GHSA-6w63-h3fj-q4vw)
115. [https://planet.jabber.org/](https://planet.jabber.org/)
116. [https://www.cisco.com/c/en/us/products/unified-communications/jabber-windows/eos-eol-notice-listing.html](https://www.cisco.com/c/en/us/products/unified-communications/jabber-windows/eos-eol-notice-listing.html)
117. [https://www.cisco.com/c/en/us/products/collateral/unified-communications/jabber-windows/bulletin-c25-744688.html](https://www.cisco.com/c/en/us/products/collateral/unified-communications/jabber-windows/bulletin-c25-744688.html)
118. [https://www.rocket.chat/blog/jabber-webex](https://www.rocket.chat/blog/jabber-webex)
119. [https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber](https://tech.slashdot.org/story/08/09/19/2218215/cisco-to-buy-jabber)
120. [https://en.wikipedia.org/wiki/Ejabberd](https://en.wikipedia.org/wiki/Ejabberd)
121. [https://speakerdeck.com/elixirfest/otp-to-ejabberd-wohuo-yong-sita-nintendo-switch-tm-xiang-ke-hutusiyutong-zhi-sisutemu-npns-false-kai-fa-shi-li](https://speakerdeck.com/elixirfest/otp-to-ejabberd-wohuo-yong-sita-nintendo-switch-tm-xiang-ke-hutusiyutong-zhi-sisutemu-npns-false-kai-fa-shi-li)
122. [https://blog.process-one.net/my-gsoc-2015-project-push-for-xmpp/](https://blog.process-one.net/my-gsoc-2015-project-push-for-xmpp/)
123. [https://www.oreilly.com/library/view/xmpp-the-definitive/9780596157524/index.html](https://www.oreilly.com/library/view/xmpp-the-definitive/9780596157524/index.html)
124. [https://www.amazon.com/XMPP-Definitive-Real-Time-Applications-Technologies/dp/059652126X](https://www.amazon.com/XMPP-Definitive-Real-Time-Applications-Technologies/dp/059652126X)
125. [https://en.wikipedia.org/wiki/IP_over_Avian_Carriers](https://en.wikipedia.org/wiki/IP_over_Avian_Carriers)
126. [https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments](https://en.wikipedia.org/wiki/April_Fools'_Day_Request_for_Comments)
127. [https://www.cs.hmc.edu/~awooster/joke_rfcs.html](https://www.cs.hmc.edu/~awooster/joke_rfcs.html)
128. [https://mov.im/community/pubsub.movim.eu/Movim/the-difference-between-xmpp-and-activitypub-explained-through-the-blog-feature-Hdx4FR](https://mov.im/community/pubsub.movim.eu/Movim/the-difference-between-xmpp-and-activitypub-explained-through-the-blog-feature-Hdx4FR)
129. [https://mov.im/community/pubsub.movim.eu/Movim/](https://mov.im/community/pubsub.movim.eu/Movim/)
130. [https://en.wikipedia.org/wiki/Movim](https://en.wikipedia.org/wiki/Movim)
131. [https://movim.eu/](https://movim.eu/)
132. [https://github.com/Barbapulpe/xmpp-ap-bridge](https://github.com/Barbapulpe/xmpp-ap-bridge)
133. [https://tigase.net/tigase-im-mix/](https://tigase.net/tigase-im-mix/)
134. [https://xmpp.org/extensions/xep-0357.html](https://xmpp.org/extensions/xep-0357.html)
135. [https://xmpp.org/extensions/xep-0408.html](https://xmpp.org/extensions/xep-0408.html)
136. [https://www.igniterealtime.org/projects/openfire/](https://www.igniterealtime.org/projects/openfire/)
137. [https://discourse.igniterealtime.org/t/openfire-5-0-2-release/95982](https://discourse.igniterealtime.org/t/openfire-5-0-2-release/95982)
138. [https://datatracker.ietf.org/wg/xmpp/about/](https://datatracker.ietf.org/wg/xmpp/about/)
139. [https://www.rfc-editor.org/info/rfc6455](https://www.rfc-editor.org/info/rfc6455)
140. [https://copyprogramming.com/howto/xmpp-server-ejabberd-vs-openfire-vs-prosody](https://copyprogramming.com/howto/xmpp-server-ejabberd-vs-openfire-vs-prosody)

Marked `[needs source]` items:

- Specific OSI/TCP-IP-stack-to-XMPP layer mapping table — RFC 1122 covers TCP/IP layering generally; no canonical XMPP-layer diagram is cited in IETF documents.
- A first-rank OCW university course dedicated to XMPP — none found in 2024–2026 indexes; the closest substitutes are conference tutorials and IETF Hackathons.