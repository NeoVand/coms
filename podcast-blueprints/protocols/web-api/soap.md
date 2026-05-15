---
id: soap
type: protocol
name: SOAP
abbreviation: SOAP
etymology: "[S]imple [O]bject [A]ccess [P]rotocol — acronym officially dropped by W3C in SOAP 1.2 (2003)"
category: web-api
year: 1998
rfc: null
standards_body: w3c
podcast_target_minutes: 22
related_book_chapters: []
related_protocols: [http1, json-rpc, tcp, tls, rest, grpc, graphql, smtp]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: []
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e7/IBM_System_360_at_USDA.jpg/500px-IBM_System_360_at_USDA.jpg"
    caption: "The IBM System/360 at the USDA Data Processing Center, 1966. Mainframes like these built the enterprise computing world that SOAP was designed to wire together — wrapping cross-platform RPC calls in XML envelopes."
    credit: "Photo: U.S. Department of Agriculture / Public Domain, via Wikimedia Commons"
visual_cues:
  - "Anatomy of a SOAP envelope: outer Envelope element, optional Header block stacked on top of a required Body, with a Fault subtree shown as the alternate Body content on error."
  - "Side-by-side wire dumps — SOAP 1.1 with text/xml plus a SOAPAction header, vs SOAP 1.2 with application/soap+xml; charset=utf-8; action=\"...\" — same operation, different framing."
  - "An XML Signature Wrapping attack visualised: the signed Body element gets moved into a hidden wsse:Security child, and a malicious replacement Body slips in untouched — the signature still verifies because it points by Id."
  - "A Billion Laughs payload tree: ten nested entity definitions, ~1 KB on the wire, exploding into a ~3 GB in-memory string the server must allocate before it can parse anything."
  - "Map of where SOAP still runs in 2026: NHS Spine (HL7 V3), CDC IIS, Salesforce SOAP API login(), IATA NDC over Amadeus, CoreWCF on .NET 9 — each pinned with its sunset date."
  - "Envelope cross-section: TCP three-way handshake at the bottom, TLS handshake above it, HTTP POST framing, then the XML envelope inside the body — five layers, one round trip."
---

# SOAP — Simple Object Access Protocol

## In one breath

SOAP is a messaging protocol that wraps remote procedure calls in XML envelopes. It was designed inside Microsoft in 1998 to push COM calls through corporate firewalls, became the backbone of enterprise web services in the 2000s, and is now in managed retirement nearly everywhere — except the regulated industries it was built for, where it still moves trillions of dollars in payments, every NHS Spine HL7 V3 transaction, and a large slice of IATA airline distribution. If you write code that touches a bank, a hospital, an airline, or any system old enough to have a WSDL, you will eventually meet SOAP.

## The pitch (cold-open)

In late 1997, four engineers — Bob Atkinson and Mohsen Al-Ghosein at Microsoft, Don Box at DevelopMentor, and Dave Winer at UserLand — sketched out a way to make COM calls travel through corporate firewalls that by then routinely blocked DCOM. They called it the Simple Object Access Protocol. Microsoft's internal politics buried the spec for a year. Winer got tired of waiting and shipped a stripped-down subset called XML-RPC in UserLand Frontier 5.1 in June 1998 — beating SOAP into the world by more than a year. By 2003 SOAP was a W3C Recommendation and the foundation of corporate computing. By 2008 Tim Bray, the man who co-invented XML, was calling the SOAP stack "an embarrassing failure." Today, in 2026, Apache Axis 1 is end-of-life, Microsoft has handed WCF to a community project, and Salesforce is retiring its SOAP login() call. But SOAP is still the workhorse of the regulated back office, because in industries where an auditor signed off on an XML envelope twenty years ago, beating that envelope is harder than living with it.

## How it actually works

A SOAP exchange is a six-step dance. The simulator transcript walks it end to end: WSDL discovery, envelope construction, HTTP POST, response, then a deliberately invalid request to demonstrate fault handling.

**Step 1 — WSDL discovery.** The client fetches the WSDL document from the service endpoint, usually at `?wsdl`. WSDL — the Web Services Description Language — is an XML contract that lists every operation the service exposes, the input and output message schemas, the binding style, and the network address. Tools like `wsdl2java` (Apache CXF), `svcutil.exe` (CoreWCF/.NET), `wsimport` (JAX-WS), `gsoap`, and Python's `zeep` read the WSDL and generate typed client stubs from it. This is the single biggest cultural difference between SOAP and REST: in SOAP, the contract comes first and the code comes from the contract.

**Step 2 — Envelope construction.** The client builds an XML document whose root is `<soap:Envelope>`. The envelope contains an optional `<soap:Header>` for metadata — authentication tokens, routing, transaction context, WS-Security `<wsse:Security>` blocks — and a required `<soap:Body>` for the actual operation and its parameters. The namespace URI on the envelope is the version selector: `http://schemas.xmlsoap.org/soap/envelope/` for SOAP 1.1, `http://www.w3.org/2003/05/soap-envelope` for SOAP 1.2. A receiver expecting one and getting the other will return a `VersionMismatch` fault, or worse, a silent 500.

**Step 3 — HTTP POST.** SOAP almost always rides on HTTP, and it always uses POST — even for read-only operations. SOAP 1.1 sets `Content-Type: text/xml` and a separate `SOAPAction` header whose value is the URI of the target operation, in quotes. SOAP 1.2 changes both: the Content-Type becomes `application/soap+xml` and the action moves into a `;action=` parameter on the Content-Type itself, reducing the role of the SOAPAction header. The protocol is in theory transport-agnostic — SOAP 1.2 explicitly defines a binding framework — and real-world bindings exist for SMTP for store-and-forward mail, JMS, IBM WebSphere MQ, and AMQP, mostly inside healthcare and finance integration buses. We cover the underlying transport in the HTTP/1.1 episode and the TCP episode.

**Step 4 — Response.** The server processes the envelope, runs the operation, and returns a SOAP response envelope whose Body contains the serialized return value. HTTP 200 OK in the success path. The simulator example: send `GetUser(id: 42)`, receive `GetUserResponse(name: "Alice", email: "alice@...")`, all wrapped in `<soap:Envelope>`.

**Step 5 — Invalid request.** Send `GetUser(id: -1)` to demonstrate failure handling.

**Step 6 — SOAP Fault.** The server returns HTTP 500 Internal Server Error (in SOAP 1.1) or 400 Bad Request for sender-class faults (in SOAP 1.2), with a `<soap:Fault>` element inside the Body. The HTTP status is not the source of truth. The presence of `<Fault>` is.

### Header at a glance

A SOAP message has three notable structural pieces and one fault subtree:

- **`Envelope`** is required and contains exactly one `Body`. If `Header` is present, it must be the first child.
- **`Header`** carries metadata for intermediaries: routing, message IDs, authentication tokens, WS-Security signatures and encryption blocks, transaction context. Each header block is namespace-qualified.
- **`Body`** carries the payload — an RPC call, a document, or a single `Fault` element on error.
- **Header block attributes** decide how intermediaries handle a block. `mustUnderstand="1"` (1.1) or `"true"` (1.2) means a node that doesn't recognise the block must generate a `MustUnderstand` fault and stop. `actor` (1.1) or `role` (1.2) names the SOAP node the block is targeted at — `next` for any intermediary, `ultimateReceiver` for the final destination, `none` for nodes that should pass it through untouched. SOAP 1.2 added a `relay` attribute and a `NotUnderstood` header so the fault can name which block failed. `encodingStyle` identifies the serialization rules used.

The Fault subtree differs by version. SOAP 1.1 uses unqualified subelements: `faultcode` (one of `VersionMismatch`, `MustUnderstand`, `Client`, `Server`), `faultstring` (human-readable), `faultactor` (URI of the failing node), and `detail` (application-specific). SOAP 1.2 namespace-qualifies everything, replaces `faultcode` with a structured `<Code><Value>` plus optional nested `<Subcode>`s, replaces `faultstring` with `<Reason><Text xml:lang="...">`, and renames `Client` to `Sender` and `Server` to `Receiver`.

### State machine in three sentences

SOAP itself has no protocol-level state machine. Each request-response is independent at the SOAP layer; any session state lives either in the underlying transport's state (HTTP keep-alive, TLS session, WS-ReliableMessaging sequence numbers in the SOAP Header) or in application logic. That statelessness is exactly why WS-ReliableMessaging, WS-AtomicTransaction, and WS-SecureConversation had to exist as separate header-level specifications — they bolt session and transaction state back onto an otherwise stateless envelope.

### Reliability, security, and the WS-Star stack

Around SOAP 1.2 a constellation of additional specifications grew up — collectively the WS-* (or "WS-star") stack: WS-Addressing (W3C Recommendation, 2006) for endpoint references and message correlation; WS-Security (OASIS Standard 1.0 in 2004, 1.1 in 2006) for message-level encryption and signing using XML Signature and XML Encryption, plus token profiles for X.509, Kerberos, and SAML; WS-ReliableMessaging for guaranteed-once or in-order delivery via sequence numbers and acknowledgments in headers; WS-AtomicTransaction for distributed two-phase commit; WS-Policy for advertising what a service requires; WS-Trust, WS-SecureConversation, WS-Federation, WS-Discovery, WS-MetadataExchange.

The crucial mechanic is end-to-end message-level security. TLS gives you hop-by-hop confidentiality and integrity; WS-Security signs and encrypts XML inside the envelope so security survives intermediaries, store-and-forward queues, and offline replay — TLS terminates at the load balancer, WS-Security does not. We cover the transport-layer story in the TLS episode.

For binary attachments, MTOM and XOP — XML-binary Optimized Packaging, a W3C Recommendation as of 25 January 2005 — let SOAP send `xs:base64Binary` content as a separate MIME part referenced by `<xop:Include href="cid:..."/>`. That eliminates the roughly 33% size penalty of inlined base64. The wire format is `multipart/related` with the SOAP envelope as the root part and binary attachments as subsequent parts.

The four style-and-use combinations from WSDL 1.1 are document/literal (most modern, mandated by WS-I Basic Profile), document/encoded (rare), RPC/literal, and the original RPC/encoded from section 5 of SOAP 1.1, which is mostly historical. Document/literal "wrapped" — where the wrapper element name matches the operation — is what everyone actually deploys.

## Where it shows up in production

**Healthcare — HL7 V3 over SOAP.** IHE's IT Infrastructure Technical Framework Volume 2 Appendix V mandates SOAP 1.2 with WS-I Basic Profile 2.0 for transactions carrying HL7 V3 messages. The UK NHS Spine still exposes synchronous HL7 V3 SOAP web services and asynchronous HL7 V3 ebXML messaging. The CDC's national Immunization Information Systems WSDL for immunization data submission is a SOAP service. The trend is toward HL7 FHIR — REST and JSON, R4 normative since 2019 — for new builds, and US ONC and CMS regulations now mandate FHIR for certified EHRs. Expect five to ten more years of HL7 V3 SOAP runoff in regulated archives.

**Banking and payments.** SWIFT's MT format for cross-border payment instructions was decommissioned on 22 November 2025 — coexistence with ISO 20022 (XML on SWIFT FINplus or MX) ended that day. ISO 20022 messages are XML but are not SOAP — they ride in SWIFT's own envelope, in MQ, or in proprietary HTTPS APIs. SOAP itself remains common in domestic clearing houses and corporate-to-bank channels.

**Airlines — IATA NDC.** New Distribution Capability is the airline-industry XML standard that replaced the old EDIFACT teletype format. NDC schema versions 17.2 and 18.x dominate; 21.3 is the newest stable family; 24.1 schemas were the focus of 2024–2025 work. Amadeus exposes NDC over SOAP APIs; Sabre and Travelport offer REST and JSON over the same data; full migration to "Offers & Orders" is targeted for 2030.

**Salesforce SOAP API.** Still in heavy use. Legacy API versions 21.0 to 30.0 were retired in Summer '25. The SOAP `login()` method has been removed from API versions 65.0 and later, and is currently planned for full retirement for older versions 31.0 to 64.0 in the Summer '27 release. Salesforce strongly recommends migrating to OAuth 2.0 plus REST.

**Government and EU eIDAS.** Cross-border identity uses SAML 2.0 over the Web Browser SSO Profile (HTTP POST and Redirect bindings, not SOAP), but many member-state attribute services and the underlying eIDAS-Node Specific Connector code base still use SOAP web services internally. The eIDAS 2.0 regulation (EU 2024/1183, in force 20 May 2024) and the EU Digital Identity Wallet, mandatory by end of 2026, push hard toward OpenID Connect and OAuth.

**Legacy commerce APIs.** eBay Trading API, PayPal Classic, and Amazon MWS were originally SOAP and are all in long-running deprecation. PayPal Classic SOAP and NVP APIs remain available for legacy merchants but are no longer the recommended path.

**Telecom BSS layers.** TM Forum specifications and many billing and OSS systems still use SOAP heavily in business support layers.

**Implementation landscape, named.** Apache Axis 1.x was last released in April 2006 and is formally end-of-life — CVE-2023-40743 carries the explicit Apache statement "As Axis 1 has been EOL we recommend you migrate to a different SOAP engine, such as Apache Axis 2/Java." Apache Axis2 2.0.0 shipped on 10 March 2025 — a multi-year release adding Jakarta EE namespace support; the previous release, 1.8.2, was in 2022. Apache Rampart 1.8.0, the WS-Security and WS-Trust and WS-SecureConversation companion for Axis2, shipped on 10 December 2024 — its first release in over seven years. Apache CXF is the actively-maintained alternative, combining JAX-WS for SOAP and JAX-RS for REST. gSOAP covers C and C++ and is common in embedded and telecom. Spring-WS is the contract-first SOAP framework for Spring. On the .NET side: classic Windows Communication Foundation, codenamed "Indigo," shipped in .NET 3.0 in 2007 and still ships in Windows-only .NET Framework 4.8.x with security fixes — but it was never ported to .NET Core or .NET 5/6/8/9. CoreWCF, the community-led MIT-licensed port under the .NET Foundation, hit 1.0 in April 2022 and 1.8.0 on 28 July 2025, supporting .NET 8 and 9, tested on .NET 10 preview, and .NET Framework 4.6.2 and up. Microsoft now offers paid Product Support for CoreWCF in production despite it being a community project. Microsoft WCF Client 4.10 had its end-of-support extended to 10 November 2026 because of breaking changes. Python uses `zeep`. Perl has SOAP::Lite. PHP has the built-in `SoapClient` and `SoapServer`.

## Things that go wrong

**XXE — XML External Entity injection.** The classic XML weakness, especially common in SOAP services because they invariably parse XML on the server. A malicious DTD pulls in `file:///etc/passwd` or fires SSRF requests inside the network. **CVE-2022-40705** is the canonical example — XXE in the original Apache SOAP project's `RPCRouterServlet` allowing arbitrary file read. No fix is planned because the project is end-of-life.

**Billion Laughs — XML bomb (CWE-776).** Ten nested entity expansions, about 1 KB on the wire, expands to roughly 3 GB after parsing. First reported around 2002, popularised in 2008, and still relevant in 2024 and 2025 — CVE-2024-1455 hit LangChain, CVE-2025-3225 hit a sitemap parser. Any SOAP server with DTD processing enabled is vulnerable.

**XML Signature Wrapping — XSW.** Discovered by McIntosh and Austel at IBM in 2005 and systematically broken open by Juraj Somorovsky and Jörg Schwenk's group at Ruhr-Universität Bochum from 2009 onward. The trick: a valid signed element is moved — wrapped — elsewhere in the document while a malicious payload takes its place. Signature verification still passes because it points by `Id` to the original. The 2011 CCSW paper "All Your Clouds Are Belong to Us" showed the attack working against AWS and other major cloud APIs. AWS patched within days. A 2021 paper showed XSW still broke Germany's national personal health record.

The pattern keeps reappearing because the root cause is structural: XML Signature was designed to sign abstract XML, but SOAP processing logic operates on the concrete document. The signature library checks "is the bit I pointed to with this `Id` correctly signed?" The application logic asks "what's in the SOAP Body?" Nothing forces those two pieces of code to look at the same element. The standard countermeasures are XPath-based signature targets (Gajek et al., 2009), schema-hardened validation (Jensen et al., 2011), and the operational rule that the code verifying a signature must be the same code consuming the signed data, with no XML rewriting in between.

**The Apache Axis CVE arc.** CVE-2012-5784 — Axis 1.4 failed to validate certificate hostnames; the bug was in PayPal Payments Pro and ActiveMQ JMS. CVE-2014-3596 was an incomplete fix for the above. CVE-2018-8032 was XSS in the Axis 1.x default servlet. CVE-2019-0227 in Axis 1.4 was an SSRF via the `StockQuoteService.jws` example service — and Rhino Security Labs purchased the expired hard-coded `xmltoday.com` domain to demonstrate how the SSRF was a path to remote code execution. CVE-2023-40743 lets `ServiceFactory.getService` perform untrusted lookups (LDAP) and carries the explicit Axis-is-EOL notice. CVE-2023-51441 in Axis ≤ 1.3 was an SSRF through the admin HTTP API. Axis2 has its own list, including the 2012 SAML Signature Exclusion attack (CVE-2012-4418).

The dump notes that there are comparatively few named SOAP-caused outages in the 2024–2026 window — most "SOAP outage" stories in industry post-mortems get aggregated under "the XML parser exploded" or "the ESB blew up" without a specific CVE attached.

## Common pitfalls (for the practitioner)

- **WSDL versioning hell.** Generated client stubs are tied to a specific WSDL. Even a backwards-compatible-looking schema change — adding an optional element — can force regeneration across every consumer. IATA NDC is the poster child: dozens of schema variants across 17.2, 18.x, and 21.3.
- **Namespace mismatches.** A receiver expecting SOAP 1.1's `http://schemas.xmlsoap.org/soap/envelope/` silently rejecting SOAP 1.2 envelopes with a `VersionMismatch` fault — or, worse, a generic 500.
- **`mustUnderstand` misuse.** Marking a custom header as `mustUnderstand="1"` means every node along the message path that doesn't recognise it must fault. By spec. This is how a well-meaning new header block takes down every old client.
- **Character-encoding bugs.** UTF-16 envelopes routed through HTTP intermediaries that assume UTF-8. The HTTP `charset` parameter must agree with the XML prolog.
- **XML Schema validation explosion.** Some XSDs (IATA NDC, HL7 V3) are huge; naive validators load the entire schema graph into memory per message.
- **Chunked encoding plus WS-Security streaming.** Some signature implementations require the whole message in memory. Combine that with HTTP chunked transfer and you get correctness bugs at hard-to-reproduce sizes.
- **SOAPAction missing the surrounding double-quotes.** Legal-looking in many tools, but it breaks operation-aware HTTP routers.
- **Mixing SOAP 1.1 and SOAP 1.2 fault structures in one client.** The two are incompatible — the subelement names, namespaces, and code values all changed.
- **Default `xsi:type` acceptance.** RPC/encoded services that accept arbitrary types are XXE and SSRF magnets.

The practitioner moves that work in 2026: pin SOAP versions explicitly on both ends; always use document/literal wrapped per WS-I Basic Profile; and disable DTDs and external entities in every XML parser used for SOAP. That single change kills XXE and Billion Laughs in one move. Java: `factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)`. .NET: `XmlReaderSettings.DtdProcessing = DtdProcessing.Prohibit`. Python `lxml`: pass `resolve_entities=False`.

If you sign SOAP messages, validate the signature *and* the structure — see the XSW story above.

## Debugging it

- **SoapUI and ReadyAPI** are still the gold standard for SOAP-specific testing. They parse WSDL, generate skeleton requests, drive load, and run XML Bomb and SQL injection security scans natively.
- **Postman** has a SOAP Client mode for ad-hoc requests and supports importing WSDL, but lacks deep WSDL-driven validation. Apidog, Insomnia, and Hoppscotch are modern alternatives with varying SOAP fidelity.
- **Wireshark** with the XML dissector decodes envelopes inline. Pair with SSL key logging to peek inside HTTPS.
- **`curl -X POST -H "Content-Type: text/xml" -H 'SOAPAction: "..."' --data @env.xml`** captures the raw envelope when you suspect your client library is silently mutating it.
- **For .NET Framework WCF**, enable message logging and `System.ServiceModel` trace listeners.
- **For Java JAX-WS or CXF**, set `com.sun.xml.ws.transport.http.client.HttpTransportPipe.dump=true` or turn on CXF's `LoggingFeature`.
- **For client generation**, use `wsimport` for JAX-WS, `wsdl2java` for Apache CXF or Axis2, `svcutil.exe` or `dotnet-svcutil` for .NET, `gsoap`'s `wsdl2h` plus `soapcpp2` for C and C++, and `zeep` for Python.

What to monitor in production: the rate of 5xx responses and SOAP `Receiver` or `Server` faults (server bugs); the rate of 4xx and `Sender` or `Client` faults (consumer bugs, often namespace mismatch or schema validation); `MustUnderstand` faults (someone added a new header without telling clients); message-size distribution for signed envelopes with attachments that drift past gateway limits; and CPU time spent in XML canonicalization (C14N) and signature verification, which can dominate when keys or algorithms are weak.

## What's changing in 2026

- **22 November 2025.** SWIFT formally ended MT and ISO 20022 coexistence for cross-border payment instructions. The largest XML migration in financial history. Not a SOAP migration directly, but it pulled XML-on-XML investment toward FINplus and away from SOAP-style integration.
- **28 July 2025.** CoreWCF 1.8.0 shipped — last 1.x release tested against .NET 10 preview, supports .NET 8, .NET 9, and .NET Framework 4.6.2 and up. Microsoft offers paid Product Support for CoreWCF in production. Microsoft's official advice for new services remains gRPC or ASP.NET Core minimal APIs, not CoreWCF.
- **Summer '25 (Salesforce release).** Salesforce retired legacy SOAP API versions 21.0 to 30.0.
- **10 March 2025.** Apache Axis2/Java 2.0.0 shipped, adding Jakarta EE namespace support — the first major release since 1.8.2 in 2022.
- **10 December 2024.** Apache Rampart 1.8.0 shipped — the first Rampart release in over seven years, restoring WS-Security, WS-Trust, and WS-SecureConversation support on top of Axis2.
- **20 May 2024.** EU Regulation 2024/1183 — eIDAS 2.0 — entered into force, with the EU Digital Identity Wallet mandatory by end of 2026. The push is hard toward OpenID Connect and OAuth, away from SAML-over-SOAP attribute services.
- **In flight: Summer '27.** Salesforce's planned full retirement of the SOAP `login()` call for API versions 31.0 to 64.0. The single highest-profile commercial SOAP deprecation currently scheduled.
- **In flight: 10 November 2026.** Microsoft WCF Client 4.10 end-of-support, extended from an earlier date due to breaking changes.
- **Standards bodies.** The W3C XML Protocol Working Group — the body that maintained SOAP itself — closed on 10 July 2009. SOAP 1.2 Second Edition (April 2007) was the last edition. OASIS WS-Security and related committees still exist for errata work but produce no new specs at meaningful pace.

## Fun facts (host material)

- Don Box once gave a SOAP talk from a bathtub of suds at TechEd Europe 2001 in Barcelona. Microsoft's own news release announcing his hire confirms it: "not the least of which was conducting a discussion on SOAP while in a bathtub full of suds at TechEd Barcelona 2001."

- The "Simple" died of embarrassment. SOAP 1.2 explicitly stripped the acronym: "In previous versions of this specification the SOAP name was an acronym. This is no longer the case." Around the same time, the industry quietly began re-expanding it as "Service-Oriented Architecture Protocol" — a backronym that never had W3C blessing.

- "WS-Deathstar" is the affectionate industry shorthand for the WS-* spec sprawl. InfoWorld attributed the term to Ruby on Rails creator David Heinemeier Hansson in July 2008. That same week at OSCON 2008, Tim Bray — co-inventor of XML — told InfoWorld: "The SOAP stack is generally regarded as an embarrassing failure these days." In a follow-up interview he said the WS-* specs were "mostly cooked up in back rooms at IBM and Microsoft."

- Don Box on why SOAP shipped late: "So why didn't we ship SOAP back in 1998? That one's easy: Microsoft politics." He apologized publicly to Andrew Layman "at least twice" for not getting XML-Data when he first encountered it.

- Dave Winer shipped XML-RPC in protest. From Don Box's own retrospective: "Unwilling to let the slow process of getting MS to act on SOAP beyond a press release, Dave Winer went out on his own and shipped the XML-RPC specification." XML-RPC went out in UserLand Frontier 5.1 in June 1998 — more than a year before the IETF SOAP Internet-Draft of 13 September 1999. XML-RPC is still alive in WordPress's `xmlrpc.php` and Pingback.

- SOAP 1.1 — by far the most widely deployed version of SOAP — is technically not a standard. It is a W3C *Note*, submitted on 8 May 2000. Only SOAP 1.2 ever became a W3C Recommendation, and even that received its last edition almost two decades ago, in April 2007.

- WCF was codenamed "Indigo" during the Longhorn (Vista) era. It survived Vista's reset and shipped with .NET 3.0 in November 2007. It is currently in maintenance on Windows-only .NET Framework, with all forward investment redirected to the community-led CoreWCF.

## Where this connects in the book

The dump records no book chapters that reference SOAP directly. The protocol's history sits entirely inside this episode — there is no separate chapter to defer to.

## See also (other protocol episodes)

If you've heard the **REST episode**, the contrast is the entire SOAP-vs-REST argument compressed. SOAP gives you formal XML contracts, WSDL-described operations, structured `Fault` envelopes, and the WS-* enterprise stack. REST is an architectural style — Roy Fielding's 2000 dissertation — using full HTTP semantics (GET, POST, PUT, DELETE), JSON over HTTP, and HTTP status codes for errors. By 2026 surveys, around 83% of public web APIs are REST and JSON; SOAP is mainly maintained for legacy or enterprise back-ends. Use SOAP when you need formal contracts and built-in security standards (banking, insurance); use REST when you want simplicity, broad developer adoption, or HTTP-native caching and content negotiation.

The **gRPC episode** is the modern, lessons-learned answer to SOAP's RPC story. Both use strict contracts and code generation, but gRPC swaps XML envelopes for compact binary Protocol Buffers, swaps HTTP/1.1 POST for HTTP/2 with multiplexing and bidirectional streaming, and swaps WSDL for `.proto` files. Microsoft itself, when retiring WCF, told users on greenfield projects to use gRPC instead. gRPC routinely hits 500,000 requests per second per core on equivalent hardware against SOAP's hundreds-to-low-thousands.

The **GraphQL episode** is the philosophical opposite. SOAP defines rigid operations via WSDL. GraphQL lets clients specify exactly the data they need in a single flexible query against a typed schema. Use SOAP when the API surface is fixed and regulatory requirements mandate formal service descriptions; use GraphQL when clients have varying data needs (mobile, desktop, watch) and you want to reduce round trips.

The **JSON-RPC episode** does what SOAP does in two pages instead of two thousand. Same RPC mental model — caller invokes a remote function, parameters and return values get marshalled — but JSON-RPC gives you `{ "jsonrpc": "2.0", "method": "...", "params": {...}, "id": 1 }` and stops. No envelope, no headers, no fault subtree, no schema, no WS-* extensions. About 60 bytes for a simple call against SOAP's 500+ bytes. XML-RPC, JSON-RPC's even older cousin, is literally a subset of the original 1998 SOAP type system — Don Box's own words.

The **HTTP/1.1 episode** is the transport SOAP almost always uses. SOAP 1.1 mandates `POST`, a `Content-Type` of `text/xml`, and a `SOAPAction` header whose value lets HTTP intermediaries route by operation without parsing the XML body. SOAP 1.2 swaps the Content-Type to `application/soap+xml` and folds the action into a `;action=` parameter. SOAP layers semantically on top of HTTP rather than overriding it — the W3C 2000 Note explicitly says SOAP intermediaries are not the same as HTTP intermediaries.

The **TLS episode** is half the SOAP security story. TLS gives SOAP transport-level confidentiality and (with mTLS) mutual authentication. The WS-I Basic Profile 1.1 explicitly recommends HTTPS for transport security. The other half is WS-Security at the message level — signing and encrypting XML inside the envelope so security survives intermediaries and store-and-forward queues. TLS terminates at the load balancer; WS-Security does not.

The **TCP episode** is the layer SOAP never speaks to directly — it sits on HTTP, which sits on TCP. The relevance is operational: long XML envelopes can interact poorly with small TCP send buffers and Nagle's algorithm, and large WS-Security signatures can blow past default HTTP keep-alive timeouts.

The **SMTP episode** is the unexpected binding. SOAP 1.2 explicitly defines a binding framework, not just an HTTP binding. Real-world bindings exist for SMTP for mail-based store-and-forward, JMS, IBM WebSphere MQ, and AMQP. These are common in healthcare and finance integration buses — the same back offices where SOAP is still load-bearing in 2026.

## Visual cues for image generation

- Anatomy of a SOAP envelope: outer Envelope element, optional Header block stacked on top of a required Body, with a Fault subtree shown as the alternate Body content on error.
- Side-by-side wire dumps — SOAP 1.1 with `text/xml` plus a `SOAPAction` header, vs SOAP 1.2 with `application/soap+xml; charset=utf-8; action="..."` — same operation, different framing.
- An XML Signature Wrapping attack visualised: the signed Body element gets moved into a hidden `wsse:Security` child, and a malicious replacement Body slips in untouched — the signature still verifies because it points by `Id`.
- A Billion Laughs payload tree: ten nested entity definitions, ~1 KB on the wire, exploding into a ~3 GB in-memory string the server must allocate before it can parse anything.
- Map of where SOAP still runs in 2026: NHS Spine (HL7 V3), CDC IIS, Salesforce SOAP API `login()`, IATA NDC over Amadeus, CoreWCF on .NET 9 — each pinned with its sunset date.
- Envelope cross-section: TCP three-way handshake at the bottom, TLS handshake above it, HTTP POST framing, then the XML envelope inside the body — five layers, one round trip.

## Sources

### RFCs and W3C / OASIS specifications

- [W3C SOAP 1.1 Note (8 May 2000)](https://www.w3.org/TR/2000/NOTE-SOAP-20000508/)
- [W3C SOAP 1.2 Part 0: Primer (Second Edition)](https://www.w3.org/TR/soap12-part0/)
- [W3C SOAP 1.2 Part 1: Messaging Framework (Second Edition)](https://www.w3.org/TR/soap12-part1/)
- [W3C SOAP 1.2 Part 2: Adjuncts (Second Edition)](https://www.w3.org/TR/soap12-part2/)
- [W3C SOAP Specifications index](https://www.w3.org/TR/soap/)
- [W3C SOAP MTOM](https://www.w3.org/TR/soap12-mtom/)
- [W3C XML-binary Optimized Packaging (XOP)](https://www.w3.org/TR/xop10/)
- [W3C XML Signature Syntax and Processing 1.1](https://www.w3.org/TR/xmldsig-core1/)
- [W3C XML Encryption 1.1](https://www.w3.org/TR/xmlenc-core1/)
- [W3C WSDL 1.1 Note (15 March 2001)](https://www.w3.org/TR/2001/NOTE-wsdl-20010315)
- [W3C WSDL 2.0 Part 1 Recommendation (26 June 2007)](https://www.w3.org/TR/2007/REC-wsdl20-20070626/)
- [W3C XML 1.0](https://www.w3.org/TR/xml/)
- [W3C XML Schema Part 2: Datatypes](https://www.w3.org/TR/xmlschema-2/)
- [IETF RFC 9112 — HTTP/1.1](https://www.rfc-editor.org/rfc/rfc9112)
- [IETF RFC 8446 — TLS 1.3](https://www.rfc-editor.org/rfc/rfc8446)
- [OASIS WS-Security 1.1 SAML Token Profile](https://docs.oasis-open.org/wss/v1.1/wss-v1.1-spec-os-SAMLTokenProfile.pdf)
- [W3C SOAP 1.2 Recommendation press release (24 June 2003)](https://www.w3.org/2003/06/soap12-testimonial)
- [W3C News — SOAP 1.2 Second Edition (27 April 2007)](https://www.w3.org/news/2007/soap-version-12-second-edition-is-a-w3c-recommendation/)

### Academic papers

- [Springer — Making XML Signatures Immune to XML Signature Wrapping Attacks](https://link.springer.com/chapter/10.1007/978-3-319-04519-1_10)
- [Jensen, Meyer, Somorovsky, Schwenk — On the Effectiveness of XML Schema Validation for Countering XML Signature Wrapping Attacks (IWSSC 2011)](https://www.researchgate.net/publication/252053794)
- [Gajek, Jensen, Liao, Schwenk — Analysis of Signature Wrapping Attacks and Countermeasures (ICWS 2009)](https://www.semanticscholar.org/paper/Analysis-of-Signature-Wrapping-Attacks-and-Gajek-Jensen/51bd3fbf030a369c3a1201d4d924e30076f96b87)
- [Somorovsky et al. — On Breaking SAML: Be Whoever You Want to Be (USENIX Security 2012)](https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/somorovsky)
- [Springer — XML Signature Wrapping Still Considered Harmful (Germany ePA, 2021)](https://link.springer.com/chapter/10.1007/978-3-030-78120-0_1)
- [Roy T. Fielding — Architectural Styles and the Design of Network-based Software Architectures (UC Irvine, 2000)](https://roy.gbiv.com/pubs/dissertation/top.htm)
- [Joni Mäkkönen — Performance and Usage Comparison Between REST and SOAP (Aalto, 2017)](https://aaltodoc.aalto.fi/bitstream/handle/123456789/29224/master_Makkonen_Joni_2017.pdf)

### Vendor and engineering blogs

- [Don Box — A Brief History of SOAP (xml.com, April 2001)](https://www.xml.com/pub/a/ws/2001/04/04/soap.html)
- [Tim Bray — The Shambling WS-Undead](http://www.tbray.org/ongoing/When/200x/2008/07/03/The-Shambling-Undead)
- [Tim Bray — REST Questions](https://www.tbray.org/ongoing/When/200x/2008/08/18/On-REST)
- [Microsoft .NET Blog — CoreWCF 1.0 has been Released](https://devblogs.microsoft.com/dotnet/corewcf-v1-released/)
- [CoreWCF Releases on GitHub](https://github.com/CoreWCF/CoreWCF/releases)
- [CodeMag — Using CoreWCF to Move WCF Services to .NET Core](https://www.codemag.com/Article/2211092/Using-CoreWCF-to-Move-WCF-Services-to-.NET-Core)
- [Microsoft — WCF Client support policy](https://dotnet.microsoft.com/en-us/platform/support/policy/wcf-client)
- [Apache Whimsy — Axis Project Board Minutes](https://whimsy.apache.org/board/minutes/Axis.html)
- [Apache Axis2 MTOM Guide](https://axis.apache.org/axis2/java/core/docs/mtom-guide.html)
- [IBM Docs — XML-binary Optimized Packaging](https://www.ibm.com/docs/en/was/9.0.5?topic=mechanism-xml-binary-optimized-packaging)
- [Salesforce — SOAP API End-of-Life Policy](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/api_eol_soap.htm)
- [InfallibleTechie — Salesforce SOAP API login() Retirement (Nov 2025)](https://www.infallibletechie.com/2025/11/salesforce-soap-api-login-retirement.html)
- [AltexSoft — NDC API Versions](https://www.altexsoft.com/blog/ndc-api-versions/)
- [AltexSoft — New Distribution Capability (NDC) in Air Travel](https://www.altexsoft.com/blog/new-distribution-capability-ndc-in-air-travel-airlines-gdss-and-the-impact-on-the-industry/)
- [IATA — Distribution with Offers & Orders (NDC)](https://www.iata.org/en/programs/airline-distribution/retailing/ndc/)
- [PortSwigger Web Security Academy — XXE](https://portswigger.net/web-security/xxe)
- [Snyk — XXE in soap:soap (CVE-2022-40705)](https://security.snyk.io/vuln/SNYK-JAVA-SOAP-3034822)
- [Rhino Security Labs — CVE-2019-0227 Apache Axis SSRF](https://rhinosecuritylabs.com/application-security/cve-2019-0227-expired-domain-rce-apache-axis/)
- [GitHub Advisory — CVE-2019-0227 SSRF in Apache Axis](https://github.com/advisories/GHSA-h9gj-rqrw-x4fq)
- [GitHub Advisory — CVE-2023-40743 Apache Axis 1.x EOL](https://github.com/advisories/GHSA-rmqp-9w4c-gc7w)
- [Security Vulnerability — CVE-2023-51441 Apache Axis SSRF](https://securityvulnerability.io/vulnerability/CVE-2023-51441)
- [CVE Details — Apache Axis vulnerabilities](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html)
- [CVE Details — Apache Axis2 vulnerabilities](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-19507/Apache-Axis2.html)
- [WS-Attacks — XML Signature Wrapping](http://www.ws-attacks.org/XML_Signature_Wrapping)
- [SoapUI](https://www.soapui.org/)
- [Postman SOAP Client](https://www.postman.com/product/soap-client/)
- [PFLB — SOAP UI vs Postman](https://pflb.us/blog/soap-ui-vs-postman/)
- [Abstracta — SoapUI vs Postman for API Testing](https://abstracta.us/blog/testing-tools/soapui-vs-postman-for-api-testing/)
- [Mertech — Know your API protocols](https://www.mertech.com/blog/know-your-api-protocols)
- [Techlasi — SOAP vs REST vs gRPC (2026)](https://techlasi.com/savvy/soap-vs-rest-vs-grpc-what-is-the-difference/)
- [Superblocks — SOAP vs REST in 2026](https://www.superblocks.com/blog/soap-vs-rest)
- [Visual Studio Magazine — Community Devs Revive WCF After Microsoft Deprecation](https://visualstudiomagazine.com/articles/2022/04/28/corewcf.aspx)
- [InfoWorld — WCF returns: Core WCF gets a 1.0 release](https://www.infoworld.com/article/2335217/wcf-returns-core-wcf-gets-a-10-release.html)
- [InformIT — SOAP HTTP binding](https://www.informit.com/articles/article.aspx?p=102285&seqNum=5)
- [InformIT — Faults: Error Handling in SOAP](https://www.informit.com/articles/article.aspx?p=327825&seqNum=11)
- [InformIT — SOAP Faults](https://www.informit.com/articles/article.aspx?p=169106&seqNum=6)
- [Pearson Higher Ed — The SOAP Protocol (sample chapter)](https://www.pearsonhighered.com/assets/samplechapter/0/6/7/2/0672326418.pdf)
- [O'Reilly — Web Services Essentials, SOAP and the W3C](https://www.oreilly.com/library/view/web-services-essentials/0596002246/ch03s05.html)
- [Microsoft News — COM and SOAP Pioneer Don Box Joins Microsoft](https://news.microsoft.com/source/2002/01/18/com-and-soap-pioneer-don-box-joins-microsoft/)
- [InfoQ — Don Box Discusses SOAP, XML, REST and M](https://www.infoq.com/interviews/box-soap-xml-rest-m/)
- [InfoQ — Tim Bray on Rails, REST, XML, Java, and More](https://www.infoq.com/interviews/tim_bray_rails_and_more/)
- [InfoQ — WSDL 2.0 Recommendation](https://www.infoq.com/news/2007/07/wsdl-2-recommendation/)
- [IHE — Appendix V: Web Services for IHE Transactions](https://profiles.ihe.net/ITI/TF/Volume2/ch-V.html)
- [NHS England Digital — Legitimate Relationship Service HL7 V3 API](https://digital.nhs.uk/developer/api-catalogue/legitimate-relationship-service-hl7-v3)
- [CDC — Transport (SOAP) for Immunization Information Systems](https://www.cdc.gov/iis/technical-guidance/services.html)
- [CapMinds — HL7 V2, V3, and FHIR](https://www.capminds.com/blog/hl7-vs-fhir-whats-the-real-difference/)
- [SWIFT — ISO 20022 Standards](https://www.swift.com/standards/iso-20022/iso-20022-standards)
- [European Commission — eIDAS SAML Attribute Profile v1.4.1 (2024)](https://ec.europa.eu/digital-building-blocks/sites/download/attachments/467109280/eIDAS%20SAML%20Attribute%20Profile%20v1.4.1_final.pdf)
- [Cloudflare — What is the OSI Model?](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)
- [IANA — Service Name and Transport Protocol Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)

### News

- [Paul Krill — "Sun technologist: SOAP stack a 'failure'" (InfoWorld, July 2008)](https://www.infoworld.com/article/2651733/sun-technologist--soap-stack-a--failure-.html)
- [PaymentExpert — SWIFT's ISO 20022 cutover (21 Nov 2025)](https://paymentexpert.com/2025/11/21/swifts-iso-20022-cutover-the-end-of-mt-and-a-20-year-promise/)
- [Banking.Vision — ISO 20022: The Final Chapter Begins](https://banking.vision/en/iso-20022-the-final-chapter-begins/)
- [Asquared — Digital Identity Solutions in Europe 2025](https://asquared.company/en/blog/digital-identity-solutions-in-europe-2025-status-quo-1096/)
- [European Digital Identity Regulation portal — eIDAS 2.0](https://www.european-digital-identity-regulation.com/)
- [Micronetbd — Salesforce automation at risk: API retirement could break your org in Summer '25](https://micronetbd.org/salesforce-automation-at-risk-api-retirement-could-break-your-org-in-summer-25/)
- [Medium / InstaTunnel — Billion Laughs Attack](https://medium.com/@instatunnel/billion-laughs-attack-the-xml-that-brings-servers-to-their-knees-f83ba617caa4)

### Wikipedia

- [Wikipedia — SOAP](https://en.wikipedia.org/wiki/SOAP)
- [Wikipedia — XML-RPC](https://en.wikipedia.org/wiki/XML-RPC)
- [Wikipedia — WS-Security](https://en.wikipedia.org/wiki/WS-Security)
- [Wikipedia — XML-binary Optimized Packaging](https://en.wikipedia.org/wiki/XML-binary_Optimized_Packaging)
- [Wikipedia — Billion laughs attack](https://en.wikipedia.org/wiki/Billion_laughs_attack)
- [Wikipedia — Apache Axis2](https://en.wikipedia.org/wiki/Apache_Axis2)
- [Wikipedia — Don Box](https://en.wikipedia.org/wiki/Don_Box)
- [Wikipedia — UserLand Software](https://en.wikipedia.org/wiki/UserLand_Software)
