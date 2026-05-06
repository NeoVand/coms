---
prompt_source: deep-research-prompts.txt:4858-5039 (PROTOCOL · SOAP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/d08ca781-2964-4f3d-b487-c95aced04fd5
research_mode: claude.ai Research
---

# SOAP (Simple Object Access Protocol): A Deep, Citation-Backed Field Manual for 2026

> Working report for long-form articles, infographics, and a podcast series.
> Today's date: 2026-05-05. Sources prioritized 2024–2026; older sources flagged where used.

---

## 1. Prerequisites and glossary

Before SOAP makes sense, an engineer needs a working vocabulary that spans the network stack from packet to payload, plus a small library of XML and crypto terms. Each definition below is short and pointed; authoritative explainers are linked.

- **TCP/IP stack and the OSI model.** TCP/IP is the layered architecture the Internet runs on (link → IP → TCP/UDP → application). SOAP itself is an *application-layer* message format that depends on a lower-layer transport (almost always HTTP, sometimes SMTP, JMS, or AMQP). Authoritative explainer: Cloudflare's "What is the OSI model?" [1].
- **Socket.** A socket is the operating-system endpoint of a network connection — a (IP address, port, protocol) tuple. SOAP rarely speaks to sockets directly; it lets HTTP libraries do that.
- **Port 80 / 443.** TCP port 80 is the IANA-registered default for HTTP; 443 for HTTPS. SOAP-over-HTTP traffic uses these by default. (IANA service registry [2].)
- **HTTP/1.1 (RFC 9112).** The request/response application protocol SOAP most commonly rides on. SOAP requests are always HTTP `POST` with the SOAP envelope as the body [3]. [InformIT](https://www.informit.com/articles/article.aspx?p=102285&seqNum=5)
- **HTTP header.** Key/value metadata before the body. SOAP cares about three: `Content-Type` (`text/xml` for SOAP 1.1, `application/soap+xml` for SOAP 1.2), `Content-Length`, and `SOAPAction` (SOAP 1.1 only) [4][5].
- **TLS (RFC 8446 for 1.3).** Transport Layer Security; the encryption layer that turns HTTP into HTTPS. SOAP can use TLS for hop-by-hop confidentiality, *or* WS-Security for end-to-end message-level confidentiality (see §4) [6]. [Wikipedia](https://en.wikipedia.org/wiki/SOAP)
- **Handshake.** The opening exchange where two endpoints agree on parameters — TCP three-way handshake (SYN, SYN-ACK, ACK), then TLS handshake (ClientHello/ServerHello/key agreement). SOAP has no protocol-level handshake of its own; it inherits whatever HTTP/TLS does.
- **Frame, datagram, stream, packet.** A frame is a link-layer unit (Ethernet); a packet is an IP-layer unit; a datagram is a UDP message; a stream is the byte-ordered abstraction TCP provides. SOAP messages are arbitrary-size XML documents that the HTTP library chops into TCP segments for you.
- **Checksum.** A small value computed over data to detect corruption (TCP and IP each have one). Not a SOAP concern directly.
- **RPC (Remote Procedure Call).** A pattern in which a caller invokes a function that runs on another machine, with parameters and return values marshalled across the wire. SOAP supports an RPC style (along with a "document" style) [7].
- **Marshalling / serialization.** Converting in-memory objects to a wire format (and back). SOAP marshalls into XML using *encoding rules* (see §3) [7].
- **Envelope.** SOAP's outermost XML element — `<Envelope>` — wrapping `<Header>` and `<Body>`. The "envelope" metaphor is from physical mail: routing on the outside, content on the inside [4][5].
- **XML (eXtensible Markup Language).** A self-describing, hierarchical text format standardized by W3C. SOAP messages are XML documents with a specific schema (W3C XML 1.0 Recommendation) [8].
- **XML namespaces.** A way to disambiguate element names by binding a prefix to a URI (e.g., `xmlns:soap="http://www.w3.org/2003/05/soap-envelope"`). SOAP relies on namespaces heavily; the namespace URI *is* how a receiver tells SOAP 1.1 apart from SOAP 1.2 [4][5].
- **XML Schema (XSD).** A language for typing XML documents (datatypes, structures, cardinality). SOAP uses XSD types for parameter encoding [9].
- **XML Information Set (Infoset).** An abstract data model for XML; SOAP 1.2 is defined in terms of the Infoset, not the raw bytes [5]. [Pearson Higher Education](https://www.pearsonhighered.com/assets/samplechapter/0/6/7/2/0672326418.pdf)
- **Base64.** A binary-to-text encoding (3 bytes → 4 ASCII chars; ~33% size penalty). Default way to embed binary data in XML [9].
- **MIME / Multipart.** Multipurpose Internet Mail Extensions: a way of bundling multiple parts (text + binary) into one message. SOAP with Attachments and MTOM/XOP both use `multipart/related` [10]. [Altinn](https://altinn.github.io/ark/models/archi-all/e7e6c527-26f4-461c-b4dd-651fcbe85c8d/elements/id-d0c567f18b844e969379cb893bca2466.html)
- **XML Signature (W3C).** A standard for digitally signing whole or partial XML documents; the cryptographic core of WS-Security [11].
- **XML Encryption (W3C).** A standard for encrypting parts of XML documents (also used by WS-Security) [11].
- **WSDL (Web Services Description Language).** An XML format that *describes* a SOAP service — operations, message types, bindings, endpoint URLs. WSDL 1.1 (2001 W3C Note) is by far the most deployed; WSDL 2.0 became a W3C Recommendation in June 2007 [12][13]. [InfoQ](https://www.infoq.com/news/2007/07/wsdl-2-recommendation/)[Grokipedia](https://grokipedia.com/page/Web_Services_Description_Language)
- **UDDI (Universal Description, Discovery, and Integration).** A directory service for finding WSDLs. Mostly historical: the public UDDI Business Registry was shut down in 2006 and the OASIS spec is dormant.
- **MTOM/XOP.** Message Transmission Optimization Mechanism / XML-binary Optimized Packaging: the modern way to send binary attachments without 33% base64 overhead. XOP became a W3C Recommendation 25 January 2005 [14][15]. [IBM](https://www.ibm.com/docs/en/was/9.0.5?topic=mechanism-xml-binary-optimized-packaging)
- **SAML (Security Assertion Markup Language).** OASIS XML format for authentication/authorization assertions. WS-Security has a SAML Token Profile [16].
- **REST.** An *architectural style* (not a protocol) defined by Roy Fielding's 2000 dissertation; SOAP's chief rival on the public web [17].
- **JSON-RPC, gRPC, GraphQL.** Sibling/successor remote-call technologies covered in §4.

---

## 2. History and story

### 2.1 Origin (1997–1999): the bathtub, the politics, the IBM thaw

The story begins inside Microsoft in late 1997 / early 1998. **Bob Atkinson** and **Mohsen Al-Ghosein** (Microsoft, COM/MTS team) wanted a way to make COM (Component Object Model) calls travel through corporate firewalls, which by 1998 routinely blocked the proprietary DCOM ports. **Don Box** (then at DevelopMentor, later Microsoft) and **Dave Winer** (UserLand Software) joined the design discussions in Redmond. The four became the named co-designers of what would later be called SOAP [18][19][20]. [Edubilla +2](https://edubilla.com/invention/soap/)

According to Don Box's own retrospective "A Brief History of SOAP" (xml.com, April 4, 2001), the spec was effectively complete in 1998 but blocked inside Microsoft by a turf war between the COM/MTS team (who wanted to ship SOAP) and the XML group (who were busy with XML-Data, an antecedent of XML Schema). Frustrated by the delay, Dave Winer decided not to wait. He shipped a stripped-down subset of the SOAP type system as **XML-RPC**, in **UserLand Frontier 5.1**, **in June 1998** — that's the document RPC implementation that beat SOAP into the world by more than a year [21][22][23]. [Wikiwand](https://www.wikiwand.com/en/SOAP)

Microsoft finally let SOAP out: an **IETF Internet-Draft** was submitted **13 September 1999** (it never reached RFC status) [19]. Don Box has written that Winer's go-it-alone XML-RPC release directly motivated MS to stop sitting on SOAP [21]. [BNC](https://www.networxsecurity.org/members-area/glossary/s/soap.html)[BNC](https://www.networxsecurity.org/members-area/glossary/s/soap.html)

By the time SOAP began to look credible, the original acronym — *Simple Object Access Protocol* — was being actively re-interpreted; it had also been informally re-expanded as "Service-Oriented Architecture Protocol" in some circles [24]. In SOAP 1.2 the W3C explicitly dropped the expansion entirely: "In previous versions of this specification the SOAP name was an acronym. This is no longer the case." [25] [Medium + 3](https://murugesh-sujan.medium.com/services-oriented-architecture-soa-simple-object-access-protocol-soap-and-rest-technologies-45c6dd9ef51b)

### 2.2 W3C era (2000–2003): IBM joins, the spec gets serious

The pivotal moment was **8 May 2000**: SOAP 1.1 was submitted to the W3C as a Note, with a co-author list that for the first time included **IBM** alongside Microsoft, DevelopMentor, Lotus, and UserLand — a major credibility event. The 1.1 authors (alphabetical) were: **Don Box (DevelopMentor)**, **David Ehnebuske (IBM)**, **Gopal Kakivaya (Microsoft)**, **Andrew Layman (Microsoft)**, **Noah Mendelsohn (Lotus)**, **Henrik Frystyk Nielsen (Microsoft)** — the same Frystyk Nielsen who had been one of the architects of HTTP/1.1 — **Satish Thatte (Microsoft)**, and **Dave Winer (UserLand)** [26][27]. [Wikipedia](https://en.wikipedia.org/wiki/UserLand_Software)

A W3C Note is *not* a Recommendation — SOAP 1.1 has no formal W3C standing — but it nonetheless became the most-implemented version of SOAP in history [19]. [Wikiwand](https://www.wikiwand.com/en/SOAP)

In September 2000 the W3C chartered the **XML Protocol Working Group** to make SOAP a real standard. **SOAP 1.2** became a **W3C Recommendation on 24 June 2003** [19][28]. A **Second Edition** was issued **27 April 2007**, folding in errata and adding overview language for MTOM/XOP and the Resource Representation SOAP Header Block [29][30]. [O'Reilly + 2](https://www.oreilly.com/library/view/web-services-essentials/0596002246/ch03s05.html)

### 2.3 The WS-* boom (2003–2008) and the WS-Deathstar backlash

Around SOAP 1.2 a constellation of additional specifications grew up — collectively the WS-* (or "WS-star") stack: WS-Addressing, WS-Security, WS-ReliableMessaging, WS-Policy, WS-Trust, WS-SecureConversation, WS-AtomicTransaction, WS-BusinessActivity, WS-Federation, WS-Discovery, WS-MetadataExchange, and many more. Most were standardized at OASIS (security/transactions) or W3C (addressing).

The reaction from the web/REST community was unkind. The label **"WS-Deathstar"** became shorthand for the bloat and is widely attributed to David Heinemeier Hansson (Ruby on Rails). InfoWorld reported in July 2008: *"Some, including Ruby on Rails founder David Heinemeier Hansson, have called these specifications 'ws death star' — a takeoff on the enemy home base in the Star Wars movies."* [31] [InfoWorld](https://www.infoworld.com/article/2651733/sun-technologist--soap-stack-a--failure-.html)

That same week at OSCON 2008, **Tim Bray** (XML co-inventor) told InfoWorld's Paul Krill: *"The SOAP stack is generally regarded as an embarrassing failure these days."* [31] In a follow-up InfoQ interview Bray said *"that led us down this insane trail and the destruction of WS*"* and noted the specs were "mostly cooked up in back rooms at IBM and Microsoft" [32]. Bray's 2008 blog post "REST Questions" softened the rhetoric ("REST has been fortunate in its enemies") but did not retract it [33]. [InfoWorld + 5](https://www.infoworld.com/article/2651733/sun-technologist--soap-stack-a--failure-.html)

### 2.4 Alternatives that didn't win

- **CORBA** (OMG, 1991): heavyweight, binary IIOP wire protocol, awful with firewalls — a major reason SOAP existed at all [19].
- **DCOM** (Microsoft, 1996): Windows-only, fragile through NAT/firewalls.
- **XML-RPC** (Winer, June 1998): *did* ship and is still in niches (e.g., WordPress's XML-RPC endpoint, MetaWeblog API), but lacked schema support and extensibility [21][22]. [Wikipedia](https://en.wikipedia.org/wiki/UserLand_Software)
- **Java RMI**: Java-only; no cross-language story.

### 2.5 What changed in the last 24 months (2024–2026) — call-outs

- **Apache Axis 1.x is officially End-of-Life.** CVE-2023-40743 (Sept 2023) and CVE-2023-51441 (Dec 2023/Jan 2024) carry the explicit Apache statement: *"As Axis 1 has been EOL we recommend you migrate to a different SOAP engine, such as Apache Axis 2/Java."* [34][35] [CVE Details +2](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html)
- **Apache Axis2/Java 2.0.0 shipped 10 March 2025** — a multi-year release adding Jakarta EE namespace support; the previous release (1.8.2) was 2022. Apache Rampart 1.8.0 (WS-Security/WS-Trust/WS-SecureConversation) shipped 10 December 2024, the first Rampart release in over seven years [36]. [The Mail Archive](https://www.mail-archive.com/java-dev@axis.apache.org/msg22586.html)[Apache](https://whimsy.apache.org/board/minutes/Axis.html)
- **CoreWCF** — the community port of Microsoft Windows Communication Foundation to modern .NET — released **CoreWCF 1.8.0 on 28 July 2025** (last 1.x release tested against .NET 10 preview) [37]. Microsoft now offers official paid Product Support for CoreWCF in production, despite it being a community project [38]. [GitHub](https://github.com/CoreWCF/CoreWCF/releases)[CodeMag](https://www.codemag.com/Article/2211092/Using-CoreWCF-to-Move-WCF-Services-to-.NET-Core)
- **Microsoft WCF Client end-of-support extended:** WCF Client 4.10 support extended to **10 November 2026** because of breaking changes [39]. [.NET](https://dotnet.microsoft.com/en-us/platform/support/policy/wcf-client)
- **Salesforce SOAP API `login()` is being retired.** The call has been removed from API versions 65.0 and later, and is currently planned for full retirement for older versions (31.0–64.0) in the **Summer '27** release; legacy API versions 21.0–30.0 were retired in **Summer '25** [40][41]. [Infallibletechie](https://www.infallibletechie.com/2025/11/salesforce-soap-api-login-retirement.html)[Micronetbd](https://micronetbd.org/salesforce-automation-at-risk-api-retirement-could-break-your-org-in-summer-25/)
- **IATA NDC** (the airline-industry XML standard that replaced the EDIFACT teletype format) is still actively used and evolving; NDC 24.1 schemas were the focus of 2024-25 work and IATA's "Offers & Orders 2030" roadmap is the strategic horizon [42][43].

---

## 3. How it actually works

### 3.1 The message: Envelope, Header, Body, Fault

Every SOAP message is an XML document whose root element is `<Envelope>` in the SOAP namespace. The namespace URI is the version selector: `http://schemas.xmlsoap.org/soap/envelope/` for SOAP 1.1, `http://www.w3.org/2003/05/soap-envelope` for SOAP 1.2 [4][5].

Structure (SOAP 1.2 example):

xml

```
<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Header>
    <!-- zero or more header blocks; optional element -->
  </soap:Header>
  <soap:Body>
    <!-- application payload, OR a single soap:Fault element -->
  </soap:Body>
</soap:Envelope>
```

- **`Envelope`** is required; it MUST contain exactly one `Body`. If `Header` is present it MUST be the first child [4][44]. [TutorialsPoint](https://www.tutorialspoint.com/soap/soap_envelope.htm)
- **`Header`** carries metadata for intermediaries: routing, authentication tokens, transaction IDs, WS-Security wsse blocks. Each header block is namespace-qualified [4][5]. [W3Schools](https://www.w3schools.com/xml/xml_soap.asp)
- **`Body`** carries the payload — either an RPC call/response, a document, or a single `Fault` element on error [4][5].

### 3.2 Header block attributes

- **`mustUnderstand="1"` (1.1) / `mustUnderstand="true"` (1.2).** If a node targeted by the block does not understand it, it MUST generate a `MustUnderstand` fault and stop processing. SOAP 1.2 added a `NotUnderstood` header so the fault can name *which* block failed [44][45]. [Pearson Higher Education](https://www.pearsonhighered.com/assets/samplechapter/0/6/7/2/0672326418.pdf)[InformIT](https://www.informit.com/articles/article.aspx?p=327825&seqNum=11)
- **`actor`** (SOAP 1.1) / **`role`** (SOAP 1.2). A URI naming the SOAP node the header is targeted at. `next` means any intermediary, `ultimateReceiver` means the final destination, `none` means no node should process it [5][45]. [W3Schools](https://www.w3schools.com/xml/xml_soap.asp)[Wikipedia](https://en.wikipedia.org/wiki/SOAP)
- **`relay`** (SOAP 1.2 only). Whether an intermediary that doesn't process a block should forward it.
- **`encodingStyle`.** Identifies the serialization rules used (the SOAP 1.1 encoding URI is `http://schemas.xmlsoap.org/soap/encoding/`).

### 3.3 Style × Use: the four combinations

WSDL 1.1 SOAP bindings cross two axes [12]:

|  | Document | RPC |
|---|---|---|
| **Literal** | Body contains an XML element validated by an XSD (most modern; WS-I Basic Profile mandates this) | Body wraps method-name element; children are typed by XSD |
| **Encoded** | Body contains element + SOAP-encoding rules (rare) | Original "SOAP RPC encoding" — section 5 of SOAP 1.1; struct/array rules; mostly historical |

Document/literal "wrapped" (where the wrapper element name matches the operation) is what everyone actually deploys today.

### 3.4 HTTP binding — bytes on the wire

**SOAP 1.1 request (must use POST; `Content-Type: text/xml`; `SOAPAction` header required, value MAY be empty):**

```
POST /Webservice5/v2/AddressValidation.asmx HTTP/1.1
Host: 127.0.0.1
Content-Type: text/xml; charset=utf-8
Content-Length: 312
SOAPAction: "AddressDoctor/Webservice5/v2/Process"

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <Process xmlns="http://validator5.AddressDoctor.com/Webservice5/v2"/>
  </soap:Body>
</soap:Envelope>
```

[46]

**SOAP 1.2 request (no SOAPAction header; the action moves into the Content-Type as a parameter):**

```
POST /xml/tempconvert.asmx HTTP/1.1
Host: www.w3schools.com
Content-Type: application/soap+xml; charset=utf-8; action="urn:Convert"
Content-Length: 349

<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                 xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                 xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <FahrenheitToCelsius xmlns="https://www.w3schools.com/xml/">
      <Fahrenheit>75</Fahrenheit>
    </FahrenheitToCelsius>
  </soap12:Body>
</soap12:Envelope>
```

[5][47]

**Successful response:**

```
HTTP/1.1 200 OK
Content-Type: text/xml; charset=utf-8
Content-Length: 281

<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Body>
    <ProcessResponse xmlns="http://...Webservice5/v2"/>
  </soap:Body>
</soap:Envelope>
```

A SOAP fault is returned with **HTTP 500 Internal Server Error** (SOAP 1.1) or **400 Bad Request** for sender faults (SOAP 1.2). The ultimate signal of success/failure in SOAP is the presence/absence of `<Fault>`, not the HTTP code [3][45].

### 3.5 SOAP Fault — the standard error envelope

SOAP 1.1 Fault subelements (unqualified): **`faultcode`** (required, from a fixed set: `VersionMismatch`, `MustUnderstand`, `Client`, `Server`, prefixed with the SOAP namespace), **`faultstring`** (required, human-readable), **`faultactor`** (optional URI of the failing node), **`detail`** (optional, application-specific) [44][48]. [Pearson Higher Education](https://www.pearsonhighered.com/assets/samplechapter/0/6/7/2/0672326418.pdf)

xml

```
<soap:Fault>
  <faultcode>soap:Client</faultcode>
  <faultstring>Failed to locate method (ValidateCreditCard)</faultstring>
  <faultactor>http://example.org/ws/auth</faultactor>
  <detail>
    <e:InvalidCard xmlns:e="urn:examples:errors">
      <e:reason>checksum</e:reason>
    </e:InvalidCard>
  </detail>
</soap:Fault>
```

SOAP 1.2 overhauls the structure: fault subelements are namespace-qualified, `faultcode` becomes a `<Code><Value>` with optional nested `<Subcode>`s, `faultstring` becomes `<Reason><Text xml:lang="...">`, the four standard codes are renamed `VersionMismatch`, `MustUnderstand`, `DataEncodingUnknown`, `Sender` (was `Client`), `Receiver` (was `Server`) [45][48]. [Pearson Higher Education](https://www.pearsonhighered.com/assets/samplechapter/0/6/7/2/0672326418.pdf)

### 3.6 Sequence diagram: a SOAP exchange with one intermediary

Server (ultimateReceiver)Intermediary (SOAP node, role="next")ClientServer (ultimateReceiver)Intermediary (SOAP node, role="next")Client#mermaid-rgc{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rgc .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rgc .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rgc .error-icon{fill:#CC785C;}#mermaid-rgc .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rgc .edge-thickness-normal{stroke-width:1px;}#mermaid-rgc .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rgc .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rgc .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rgc .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rgc .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rgc .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rgc .marker.cross{stroke:#A1A1A1;}#mermaid-rgc svg{font-family:inherit;font-size:16px;}#mermaid-rgc p{margin:0;}#mermaid-rgc .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rgc text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgc .actor-line{stroke:#A1A1A1;}#mermaid-rgc .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rgc .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rgc #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rgc .sequenceNumber{fill:#5e5e5e;}#mermaid-rgc #sequencenumber{fill:#E5E5E5;}#mermaid-rgc #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rgc .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rgc .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rgc .labelText,#mermaid-rgc .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgc .loopText,#mermaid-rgc .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgc .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rgc .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rgc .noteText,#mermaid-rgc .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rgc .activation0{fill:transparent;stroke:#00000000;}#mermaid-rgc .activation1{fill:transparent;stroke:#00000000;}#mermaid-rgc .activation2{fill:transparent;stroke:#00000000;}#mermaid-rgc .actorPopupMenu{position:absolute;}#mermaid-rgc .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rgc .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rgc .actor-man circle,#mermaid-rgc line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rgc :root{--mermaid-font-family:inherit;}TLS handshake (if HTTPS)Process role="next" headers(e.g., WS-Security check),strip wsse:Security, forwardalt[Body processed OK][mustUnderstand failure]TCP SYNTCP SYN-ACKTCP ACKPOST /endpoint HTTP/1.1Content-Type: application/soap+xmlEnvelope{Header[wsse:Security, ws:MessageID], Body[Order]}POST /endpoint HTTP/1.1Envelope{Header[ws:MessageID], Body[Order]}200 OK Envelope{Body[OrderResponse]}200 OK Envelope{Body[OrderResponse]}400 Bad Request Envelope{Body[Fault Code=MustUnderstand]}400 Bad Request Envelope{Body[Fault]}

### 3.7 WSDL — the contract

A WSDL 1.1 document has five structural sections [12]:

1. `<types>` — XML Schema for messages.
2. `<message>` — abstract messages built from those types.
3. `<portType>` (renamed `<interface>` in WSDL 2.0) — abstract operations grouping messages into request/response, one-way, etc.
4. `<binding>` — concrete protocol mapping (SOAP 1.1, SOAP 1.2, HTTP-GET) and style/use (document/literal, RPC/encoded, etc.).
5. `<service>` — list of `<port>` (renamed `<endpoint>`) elements giving network addresses.

WSDL 2.0 became a Recommendation 27 June 2007 [13]; uptake was minimal — virtually all production SOAP services use WSDL 1.1.

### 3.8 UDDI — the directory nobody used

UDDI was the third leg of the original "SOAP/WSDL/UDDI" stool: a SOAP-described registry where services were listed and discovered. The **public IBM/Microsoft/SAP UDDI Business Registry was shut down on 12 January 2006**, and UDDI today exists only inside some enterprise ESBs `[needs source]`. Tim Bray's epitaph: *"Just because UDDI never took off, you can't conclude that service registries are dumb."* [33] [ongoing by Tim Bray](https://www.tbray.org/ongoing/When/200x/2008/08/18/On-REST)

### 3.9 MTOM/XOP — efficient binaries

XML-binary Optimized Packaging (XOP) became a W3C Recommendation 25 January 2005 [15]. SOAP MTOM uses XOP to send `xs:base64Binary` content as a separate MIME part referenced by `<xop:Include href="cid:..."/>`, eliminating the ~33% base64 size penalty [10][14]: [IBM + 2](https://www.ibm.com/docs/en/was/9.0.5?topic=mechanism-xml-binary-optimized-packaging)

```
Content-Type: multipart/related; boundary=MIME_boundary;
              type="application/xop+xml"; start="<root>"; start-info="application/soap+xml"

--MIME_boundary
Content-Type: application/xop+xml; charset=UTF-8; type="application/soap+xml"
Content-ID: <root>

<soap:Envelope ...>
 <soap:Body><m:photo><xop:Include xmlns:xop="http://www.w3.org/2004/08/xop/include"
                                  href="cid:image1@example.org"/></m:photo></soap:Body>
</soap:Envelope>
--MIME_boundary
Content-Type: image/png
Content-Transfer-Encoding: binary
Content-ID: <image1@example.org>
[raw PNG bytes]
--MIME_boundary--
```

[10][14]

---

## 4. Deep connections to other protocols

**HTTP/1.1.** SOAP's overwhelmingly dominant transport. SOAP 1.1 mandates HTTP `POST`, a `Content-Type` of `text/xml`, and a `SOAPAction` header whose value (a URI in quotes, possibly empty) lets HTTP intermediaries route by operation without parsing the XML body [3][4]. SOAP 1.2 swaps `Content-Type` to `application/soap+xml` and folds the action into a `;action=` parameter on Content-Type, reducing the role of the SOAPAction header [5][47]. SOAP layers semantically on top of HTTP rather than overriding it: the W3C 2000 Note explicitly says SOAP intermediaries are *not* the same as HTTP intermediaries [4]. [InformIT](https://www.informit.com/articles/article.aspx?p=102285&seqNum=5)[W3C](https://www.w3.org/TR/2000/NOTE-SOAP-20000508/)

**TCP.** SOAP never uses TCP directly; it sits on HTTP, which sits on TCP. The relevance is operational: long XML envelopes can interact poorly with small TCP send buffers and Nagle's algorithm; large WS-Security signatures can blow past default HTTP keep-alive timeouts.

**TLS.** SOAP can secure transport with HTTPS (TLS), giving hop-by-hop confidentiality and integrity and (with mTLS) mutual authentication. The WS-I Basic Profile 1.1 explicitly recommends HTTPS for transport security [19]. Where SOAP differs from REST is **message-level security**: WS-Security signs/encrypts XML *inside* the envelope so security survives intermediaries, store-and-forward queues, and offline replay — TLS cannot do this [16][49]. [Wikipedia](https://en.wikipedia.org/wiki/SOAP)[Wikipedia](https://en.wikipedia.org/wiki/WS-Security)

**REST.** Roy Fielding's 2000 UC Irvine dissertation *Architectural Styles and the Design of Network-based Software Architectures* defined REST as a constraint set — client-server, stateless, cacheable, uniform interface, layered, optional code-on-demand — derived chapter-by-chapter [17][50]. REST is an architectural *style*, not a protocol; SOAP is a protocol, not a style. The famous "REST won the public web" claim is empirically true: by 2026 surveys, ~83% of public web APIs are REST/JSON and SOAP is mainly maintained for legacy or enterprise back-ends [51]. Fielding himself noted the term has been routinely misused, sometimes to describe what he'd call RPC-over-HTTP-with-JSON [52]. [Katalon](https://katalon.com/resources-center/blog/soapui-vs-postman-katalon-api-tools)

**JSON-RPC.** A deliberately tiny, JSON-based RPC spec (1.0 in 2005, 2.0 in 2010). Where SOAP gives you envelope, headers, faults, namespaces, schemas, and 2,000 pages of WS-* extensions, JSON-RPC gives you `{ "jsonrpc": "2.0", "method": "...", "params": {...}, "id": 1 }`. Same RPC mental model, but no contract language, no header model, no security primitives — by design [22].

**gRPC.** Released by Google in 2015, gRPC is best understood as the modern, lessons-learned answer to SOAP's RPC story [53][54]. It uses **Protocol Buffers** (binary, schema-driven, like SOAP's typed RPC dream) over **HTTP/2** (multiplexed streams, compression) with built-in bidirectional streaming and code generation. Microsoft itself, when retiring WCF, told users on greenfield projects to use gRPC instead [55][56]. [Mertech + 2](https://www.mertech.com/blog/know-your-api-protocols)

**GraphQL.** Released by Facebook in 2015. It's a query language, not an RPC system: clients ask for exactly the fields they want and the server resolves a typed schema. Philosophically opposite to SOAP — instead of fixed, contract-defined operations, you compose queries on the fly [53].

**XML-RPC (the direct ancestor).** Dave Winer's June 1998 spec, shipped in UserLand Frontier 5.1 [22][23]. Two-page spec, no schema, no namespaces, no extension model. It is *literally* a subset of the original 1998 SOAP type system (Don Box's words [21]). Still alive in WordPress's `xmlrpc.php` and Pingback.

**WSDL.** Already covered (§3.7); SOAP and WSDL are usually deployed together — clients generate stubs from WSDL using tools like `wsdl2java`, `svcutil.exe`, `wsimport`, or `gsoap` [12][13].

**UDDI.** Defunct directory layer (§3.8).

**WS-Security (OASIS Standard 1.0 in 2004, 1.1 in 2006).** Defines a `<wsse:Security>` SOAP header that can carry security tokens (UsernameToken, BinarySecurityToken for X.509, Kerberos tickets, SAML assertions) and uses XML Signature / XML Encryption to provide end-to-end integrity and confidentiality at the message layer [16][49].

**WS-Addressing.** Standardizes endpoint references and message-correlation headers (`MessageID`, `RelatesTo`, `To`, `ReplyTo`) inside the SOAP header — independent of the transport. W3C Recommendation, 2006.

**WS-ReliableMessaging.** OASIS standard for guaranteed-once / in-order delivery using sequence numbers and acknowledgments in SOAP headers. Mostly implemented through Apache Sandesha / .NET WCF.

**WS-Policy** (W3C Recommendation 2007). A grammar for advertising what a service requires (e.g., "must use WS-Security with X.509 signing").

**MTOM/XOP.** SOAP-specific binary attachment optimization (§3.9) [10][14][15].

**XML Signature / XML Encryption** (W3C, 2002). The crypto primitives WS-Security stands on. Notoriously hard to implement safely — the foundation of the signature wrapping attacks in §6 [11][57].

**SAML.** Often carried as a `<saml:Assertion>` inside `<wsse:Security>` via the WS-Security SAML Token Profile; this is how eIDAS (EU cross-border identity) and many SSO systems plug into SOAP [16][58].

**SMTP, JMS, AMQP bindings.** SOAP 1.2 explicitly defines a binding framework, not just an HTTP binding. Real-world bindings exist for SMTP (mail-based store-and-forward), JMS (Java Message Service queues), MQ (IBM WebSphere MQ), and AMQP. These are common in healthcare/finance integration [5][19][59].

**MIME.** The packaging format SOAP uses for attachments (SOAP with Attachments and MTOM/XOP both produce `multipart/related` MIME bodies) [10].

**BEEP** (RFC 3080). A would-have-been peer-to-peer transport for SOAP that never caught on.

---

## 5. Real-world deployment

### 5.1 Implementations (named, with status)

- **Apache Axis 1.x (Java)** — 1.4 last released **April 2006**; project formally **End-of-Life** as confirmed in CVE-2023-40743 [34]. Migrate. [Apache](https://whimsy.apache.org/board/minutes/Axis.html)[Vumetric](https://cyber.vumetric.com/vulns/CVE-2019-0227/server-side-request-forgery-ssrf-vulnerability-in-multiple-products/)
- **Apache Axis2 (Java)** — successor; **2.0.0 released 10 March 2025** with Jakarta EE support [36]. [Wikipedia](https://en.wikipedia.org/wiki/Apache_Axis2)
- **Apache Axis2/C** — last release 1.6 in April 2009, but receives sporadic commits; PMC member Bill Blough is still active [36]. [Apache](https://whimsy.apache.org/board/minutes/Axis.html)[Apache](https://whimsy.apache.org/board/minutes/Axis.html)
- **Apache CXF (Java)** — actively maintained alternative; combines JAX-WS (SOAP) and JAX-RS (REST).
- **Apache Rampart** (WS-Security/Trust/SecureConversation for Axis2) — **1.8.0 released 10 December 2024** after a 7+ year gap [36]. [Apache](https://whimsy.apache.org/board/minutes/Axis.html)
- **gSOAP** (C/C++) — long-running, common in embedded and telecom; current commercial-friendly licensing.
- **JAX-WS** — standard Java EE SOAP API; bundled in Java 6–10, externalized in Jakarta EE 9+.
- **Spring-WS** — Spring's contract-first SOAP framework.
- **.NET Framework WCF** — Microsoft's "Indigo" — shipped in .NET 3.0 (2007). Still ships in **Windows-only** .NET Framework 4.8.x and continues to receive security fixes. **Not** ported to .NET Core/5+/6+/8+/9+; replaced by [55][56]:
- **CoreWCF** (community, MIT-licensed, .NET Foundation) — **1.0 released April 2022**; **1.8.0 released 28 July 2025**, supports .NET 8, .NET 9, tested on .NET 10 preview, and .NET Framework 4.6.2+; Microsoft offers paid Product Support [37][38][60]. [CodeMag + 2](https://www.codemag.com/Article/2211092/Using-CoreWCF-to-Move-WCF-Services-to-.NET-Core)
- **Microsoft WCF Client** (NuGet packages, dotnet/wcf repo) — separate from CoreWCF; for clients calling SOAP services. Versioned alongside .NET LTS releases. WCF Client 4.10 EOL extended to **10 November 2026** [39]. [.NET + 2](https://dotnet.microsoft.com/en-us/platform/support/policy/wcf-client)
- **ZSI / Suds / zeep** (Python) — `zeep` is the de-facto modern Python SOAP client.
- **SOAP::Lite** (Perl) — historical, still on CPAN.
- **NuSOAP** (PHP) — historical; modern PHP usually uses the built-in `SoapClient` / `SoapServer`.

### 5.2 Production systems still load-bearing in 2026

- **Healthcare — HL7 v3 over SOAP (IHE profiles).** IHE's IT Infrastructure Technical Framework Volume 2 Appendix V mandates SOAP 1.2 (with WS-I Basic Profile 2.0, optional Basic Security Profile 1.1, and Reliable Secure Profile 1.0) for transactions using HL7 V3 messages [59]. The UK NHS Spine still exposes synchronous HL7 V3 SOAP web services and asynchronous HL7 V3 ebXML messaging; CDC's national IIS WSDL for immunization data submission is a SOAP service [61][62]. The trend, however, is toward HL7 **FHIR** — REST/JSON — for new builds; FHIR R4 became normative in 2019 and is what ONC/CMS US regulations now mandate for certified EHRs [63]. [IHE IT Infrastructure + 4](https://profiles.ihe.net/ITI/TF/Volume2/ch-V.html)
- **Government / EU eGovernment.** eIDAS cross-border identity uses SAML 2.0 over the Web Browser SSO Profile (HTTP POST/Redirect bindings, not SOAP) — but many member-state attribute services and the underlying Specific Connector code base still use SOAP web services internally [58][64].
- **Banking / payments.** SWIFT's MT (legacy) format is being decommissioned for cross-border payment instructions on **22 November 2025**; ISO 20022 (XML over the SWIFT FINplus/MX framework) is now mandatory [65][66]. ISO 20022 messages are XML but are *not* SOAP — they're carried in SWIFT's own envelope, in MQ, or in proprietary HTTPS APIs. SOAP is still common in domestic clearing houses and corporate-to-bank channels [67]. [Banking](https://banking.vision/en/iso-20022-the-final-chapter-begins/)[Brickendon](https://www.brickendon.com/insights/iso-20022-the-transformation-from-swift-mt-to-mx-message-formats/)
- **Airlines — IATA NDC.** New Distribution Capability is XML/SOAP- and increasingly REST-based. As of 2025 NDC schemas 17.2 and 18.x dominate; 21.3 is the newest stable family. Amadeus exposes NDC over **SOAP APIs**; Sabre and Travelport offer REST/JSON over the same data; full migration to "Offers & Orders" is targeted for 2030 [42][43][68]. [AltexSoft](https://www.altexsoft.com/blog/ndc-api-versions/)[AltexSoft](https://www.altexsoft.com/blog/new-distribution-capability-ndc-in-air-travel-airlines-gdss-and-the-impact-on-the-industry/)
- **Salesforce SOAP API.** Still in heavy use; legacy versions 21.0–30.0 retired in **Summer '25**, and the SOAP `login()` method is to be retired in **Summer '27** for versions 31.0–64.0 [40][41]. Salesforce strongly recommends migrating to OAuth 2.0 + REST. [Micronetbd + 2](https://micronetbd.org/salesforce-automation-at-risk-api-retirement-could-break-your-org-in-summer-25/)
- **eBay Trading API, PayPal Classic API, Amazon MWS** — all originally SOAP, all in long-running deprecation. PayPal Classic SOAP/NVP APIs remain available for legacy merchants but are no longer the recommended path. `[needs source]` for 2026 specifics.
- **Telecom — TM Forum**, billing/OSS systems — SOAP still common in BSS layers.

### 5.3 Topology — Enterprise Service Buses

ESBs are the natural habitat of SOAP: IBM WebSphere ESB / IBM Integration Bus, Oracle Service Bus, MuleSoft Anypoint, Microsoft BizTalk Server (final version BizTalk Server 2020; mainstream support ended **9 January 2024**, extended to **10 January 2029** `[needs source]` for the exact lifecycle dates).

### 5.4 Performance characteristics — what we can actually measure

- **Message size.** Independent academic work (Aalto 2017 master's thesis) measured ~25% smaller payloads when moving from SOAP/XML to JSON/REST for equivalent small messages [69]. Industry blog estimates hover around 40–50% latency reductions on REST-vs-SOAP migrations [70]. These numbers vary wildly with message complexity and signed-vs-unsigned. [Aalto](https://aaltodoc.aalto.fi/bitstream/handle/123456789/29224/master_Makkonen_Joni_2017.pdf?sequence=1&isAllowed=y)[Superblocks](https://www.superblocks.com/blog/soap-vs-rest)
- **Parsing cost.** XML parsing is slower than JSON, and *signed* SOAP messages have a third cost: XML canonicalization (C14N) before signature verify. Server-side streaming WS-Security implementations exist but are rare [71].
- **Binary attachments.** Naïve base64 inflates by ~33%; MTOM/XOP eliminates that overhead at the cost of MIME parsing complexity [10]. [MetaCPAN](https://metacpan.org/dist/XML-Compile-SOAP/view/lib/XML/Compile/XOP.pod)
- **Throughput.** Enterprise SOAP services typically operate in the hundreds-to-low-thousands of req/s/core; modern gRPC benchmarks routinely hit 500k req/s/core on equivalent hardware [54]. Like-for-like comparisons are rare and tend to be marketing artifacts — flag any 10x claim.

---

## 6. Failure modes and famous incidents

### 6.1 XXE (XML External Entity) injection

XXE turns helpful XML features into a cross-site, cross-network attack: a malicious DTD pulls in `file:///etc/passwd` or fires off SSRF requests inside the network. PortSwigger's Web Security Academy notes this surface is *especially* common in SOAP services because they invariably parse XML on the server [72]. **CVE-2022-40705**: Apache `soap:soap` (the original Apache SOAP project, predecessor of Axis) — XXE through its `RPCRouterServlet` allowing arbitrary file read; no fix is planned because the project is EOL [73]. [PortSwigger](https://portswigger.net/web-security/xxe)[Snyk](https://security.snyk.io/vuln/SNYK-JAVA-SOAP-3034822)

### 6.2 XML Bomb / "Billion Laughs" (CWE-776)

The classic exponential-entity-expansion DoS: ten nested entities, ~1 KB on the wire, ~3 GB after expansion. First reported around 2002, popularised in 2008, and **still relevant in 2024–2025** (e.g., CVE-2024-1455 in LangChain, CVE-2025-3225 in a sitemap parser). Any SOAP server with DTD processing enabled is vulnerable [74][75]. [Wikipedia](https://en.wikipedia.org/wiki/Billion_laughs_attack)[Medium](https://medium.com/@instatunnel/billion-laughs-attack-the-xml-that-brings-servers-to-their-knees-f83ba617caa4)

### 6.3 XML Signature Wrapping (XSW)

Discovered by McIntosh & Austel (IBM, 2005) and systematically broken open by Juraj Somorovsky and Jörg Schwenk's group at Ruhr-Universität Bochum in a series of papers from 2009 onward (Gajek/Jensen/Liao/Schwenk, ICWS 2009; Jensen/Meyer/Somorovsky/Schwenk, IWSSC 2011; Somorovsky/Mayer/Schwenk/Kampmann/Jensen, USENIX Security 2012, "On Breaking SAML: Be Whoever You Want to Be") [76][77][78][79]. The trick: a valid signed element is moved (wrapped) elsewhere in the document while a malicious payload takes its place; signature verification still passes because it points by `Id` to the original. **All Your Clouds Are Belong to Us** (CCSW 2011) showed XSW worked against AWS and other major cloud APIs [80]. A 2021 paper showed XSW *still* broke Germany's national personal health record [81]. The standard countermeasures — XPath-based signature targets (Gajek et al. 2009), schema hardening (Jensen et al. 2011) — remain the reference fixes. [Springer +2 + 3](https://link.springer.com/chapter/10.1007/978-981-15-7834-2_70)

### 6.4 Apache Axis CVEs of note

- **CVE-2012-5784** (Axis 1.4) — failure to validate certificate hostname (CN/SAN); used by PayPal Payments Pro, ActiveMQ JMS [82]. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html)
- **CVE-2014-3596** — incomplete fix for the above [82]. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html)
- **CVE-2018-8032** — XSS in Axis 1.x default servlet [82]. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html)
- **CVE-2019-0227** (Axis 1.4) — SSRF via `StockQuoteService.jws` example service; Rhino Security Labs purchased the expired hard-coded `xmltoday.com` domain to demonstrate how SSRF in Axis was a path to RCE [83][84]. [Miggo](https://www.miggo.io/vulnerability-database/cve/CVE-2019-0227)
- **CVE-2023-40743** (Axis 1.x) — `ServiceFactory.getService` allows untrusted lookups (LDAP) → DoS/SSRF/RCE; carries the explicit "Axis 1 has been EOL" notice [34]. [CVE Details +2](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html)
- **CVE-2023-51441** (Axis ≤1.3) — SSRF through admin HTTP API [35]. [Securityvulnerability](https://securityvulnerability.io/vulnerability/CVE-2023-51441)
- Axis2 has its own list; the 2012 SAML Signature Exclusion attack (CVE-2012-4418) and signature-wrapping variants are the most often cited [85]. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-19507/Apache-Axis2.html)

### 6.5 Common production pitfalls

- **WSDL versioning hell.** Generated client stubs are tied to a specific WSDL; even a backwards-compatible-looking schema change (added optional element) often forces re-generation across consumers [86]. IATA NDC is a poster child: dozens of schema variants across versions 17.2, 18.x, 21.3 [42]. [AltexSoft](https://www.altexsoft.com/blog/ndc-api-versions/)
- **Namespace mismatches.** A receiver expecting SOAP 1.1 (`http://schemas.xmlsoap.org/soap/envelope/`) silently rejecting SOAP 1.2 envelopes with `VersionMismatch` faults — or worse, just 500-ing.
- **`mustUnderstand` misuse.** Setting `mustUnderstand="1"` on a custom header means *every* node along the path that doesn't recognize it MUST fault. This is by spec [4][45].
- **Character-encoding bugs.** UTF-16 envelopes through HTTP intermediaries that assume UTF-8. The HTTP `charset` parameter must agree with the XML prolog.
- **XML Schema validation explosion.** Some XSDs (cough, IATA NDC, cough HL7 V3) are huge; naïve validators load the entire schema graph into memory per message.
- **Chunked encoding + WS-Security streaming.** Some signature implementations require the entire message in memory; combined with HTTP chunked transfer, you get correctness bugs at hard-to-reproduce sizes.

### 6.6 Real outages

The literature has comparatively few *named* SOAP-caused outages in the 2024–2026 window. Most "SOAP outage" stories in industry post-mortems are aggregated under the broader "XML parsing exploded" or "ESB blew up" headings without specific CVEs attached. `[needs source]` for any specific named incident in 2024–2026.

---

## 7. Fun facts and anecdotes

- **Don Box gave a SOAP talk from a bathtub of suds at TechEd Europe 2001 in Barcelona.** The Microsoft news release announcing his hire confirms it: *"…not the least of which was conducting a discussion on SOAP while in a bathtub full of suds at TechEd Barcelona 2001."* [20]
- **The "Simple" died of embarrassment.** SOAP 1.2 explicitly stripped the acronym: *"In previous versions of this specification the SOAP name was an acronym. This is no longer the case."* [25] Around the same time, the industry quietly began re-expanding it as "Service-Oriented Architecture Protocol" — a backronym that never had W3C blessing [24]. [Wikiwand](https://www.wikiwand.com/en/SOAP)[Service Architecture](https://www.service-architecture.com/articles/web-services/soap.html)
- **Tim Bray, OSCON 2008:** *"The SOAP stack is generally regarded as an embarrassing failure these days."* [31] In a 2007 InfoQ interview he had already coined the WS-Deathstar critique: *"…huge universal schemas comprising thousands of pages of specifications, mostly cooked up in back rooms at IBM and Microsoft."* [32] [InfoQ](https://www.infoq.com/interviews/tim_bray_rails_and_more/)[InfoQ](https://www.infoq.com/news/infoq_interview_tim_bray/)
- **"WS-Deathstar" attribution.** InfoWorld attributed the term to Ruby on Rails creator David Heinemeier Hansson in July 2008 [31]. [InfoWorld](https://www.infoworld.com/article/2651733/sun-technologist--soap-stack-a--failure-.html)
- **Don Box on why SOAP shipped late:** *"So why didn't we ship SOAP back in 1998? That one's easy: Microsoft politics."* — *A Brief History of SOAP*, xml.com, April 2001 [21]. He apologized publicly to Andrew Layman "at least twice" for not getting XML-Data when he first encountered it.
- **Microsoft codename history.** WCF was codenamed **"Indigo"** during the Longhorn (Vista) era; survived Vista's reset and shipped with .NET 3.0 in 2007 [55]. [Wikipedia](https://en.wikipedia.org/wiki/Don_Box)[InfoWorld](https://www.infoworld.com/article/2335217/wcf-returns-core-wcf-gets-a-10-release.html)
- **Dave Winer shipped XML-RPC in protest.** Don Box: *"Unwilling to let the slow process of getting MS to act on SOAP beyond a press release, Dave Winer went out on his own and shipped the XML-RPC specification."* [21]
- **The W3C XML Protocol Working Group closed on 10 July 2009** — the body that maintained SOAP itself was wound up over a decade and a half ago [19]. [BNC](https://www.networxsecurity.org/members-area/glossary/s/soap.html)
- **A snarky response to the WS-Empire.** When IBM/Oracle/CA/EMC pushed for new W3C work on WS-Transfer, WS-ResourceTransfer, WS-Enumeration, and WS-MetadataExchange in 2008, Bray wrote: *"I guess that if you really do want to implement HTTP on top of the SOAP stack on top of HTTP, these are clearly the Right Vendors For The Job."* [33] [ongoing by Tim Bray](http://www.tbray.org/ongoing/When/200x/2008/07/03/The-Shambling-Undead)

---

## 8. Practical wisdom — using SOAP well in 2026

- **Pin SOAP versions explicitly.** Configure your client/server to advertise and accept exactly one of `http://schemas.xmlsoap.org/soap/envelope/` (1.1) or `http://www.w3.org/2003/05/soap-envelope` (1.2). Most production interop pain is one side guessing the other's version.
- **Always document/literal wrapped.** WS-I Basic Profile 1.1 effectively forbids RPC/encoded for interoperable services. Generate clients with `wsdl2java` (Apache CXF), `svcutil.exe` (CoreWCF/.NET), or `dotnet-svcutil`.
- **Disable DTDs and external entities** in every XML parser used for SOAP. This single change kills XXE and Billion-Laughs in one move. Java: `factory.setFeature("http://apache.org/xml/features/disallow-doctype-decl", true)`. .NET: `XmlReaderSettings.DtdProcessing = DtdProcessing.Prohibit`. Python `lxml`: pass `resolve_entities=False`. [72][74]
- **If you sign SOAP messages, validate the signature *and the structure*.** XML Signature Wrapping defenses require checking that the signed element is the one being processed — XPath-based signing (Gajek et al. 2009) or schema-hardened validation (Jensen et al. 2011) is the established countermeasure [76][77].
- **Default settings to be skeptical of:**
  - HTTP **chunked encoding** with WS-Security: some stacks buffer entirely; set explicit max message sizes.
    - HTTP **keep-alive** with proxies that idle-timeout at 60 s while your WS-RM session needs longer.
    - SOAPAction **empty or wildcarded** in WSDL — easy to send the wrong operation.
    - Default XSD **`xsi:type`** acceptance — RPC/encoded services that accept arbitrary types are XXE/SSRF magnets.
- **What to monitor:**
  - 5xx / SOAP `Receiver` / `Server` faults (server bugs).
    - 4xx / `Sender` / `Client` faults (consumer bugs — often namespace mismatch or schema validation).
    - `MustUnderstand` faults (someone added a new header block without telling clients).
    - Message-size distribution: signed envelopes with large attachments often drift past gateway limits.
    - C14N / signature-verify CPU time (can dominate when keys/algorithms are weak).
- **Debugging moves that work in 2026:**
  - **SoapUI / ReadyAPI** is still the gold standard for SOAP-specific testing — it parses WSDL, generates skeleton requests, drives load, and runs XML-Bomb / SQL-injection security scans natively [87][88]. [GeeksforGeeks](https://www.geeksforgeeks.org/software-engineering/difference-between-soapui-and-postman/)[PFLB](https://pflb.us/blog/soap-ui-vs-postman/)
    - **Postman** has a "SOAP Client" mode for ad-hoc requests and supports importing WSDL, but lacks deep WSDL-driven validation [88][89]. [PFLB](https://pflb.us/blog/soap-ui-vs-postman/)
    - **Wireshark** with the XML dissector decodes envelopes inline; pair with `ssl_keylog` to peek inside HTTPS.
    - **`curl -X POST -H "Content-Type: text/xml" -H 'SOAPAction: "..."' --data @env.xml`** — captures the raw envelope when you suspect your client library is silently mutating it.
    - For .NET Framework WCF: enable message logging and `System.ServiceModel` trace listeners.
    - For Java JAX-WS / CXF: set `com.sun.xml.ws.transport.http.client.HttpTransportPipe.dump=true` or CXF's `LoggingFeature`.
- **Common misconfigurations:**
  - `xmlns` declared on a non-root element so the receiver thinks it's a different namespace.
    - SOAPAction value missing the surrounding double-quotes (legal-looking, breaks routers).
    - Mixing SOAP 1.1 and SOAP 1.2 fault structures in one client.

---

## 9. Learning resources (current as of May 2026)

### 9.1 Authoritative specifications

- **W3C SOAP 1.1 Note** (08 May 2000) — [https://www.w3.org/TR/2000/NOTE-SOAP-20000508/](https://www.w3.org/TR/2000/NOTE-SOAP-20000508/) — the actual spec everyone implements (Note, not Recommendation). *Level: advanced. Last updated: 2000.* [27]
- **W3C SOAP 1.2 Part 0 Primer (2nd Ed., 27 April 2007)** — [https://www.w3.org/TR/soap12-part0/](https://www.w3.org/TR/soap12-part0/) — start here for SOAP 1.2 [29].
- **W3C SOAP 1.2 Part 1 Messaging Framework (2nd Ed.)** — [https://www.w3.org/TR/soap12-part1/](https://www.w3.org/TR/soap12-part1/) — normative core [30].
- **W3C SOAP 1.2 Part 2 Adjuncts (2nd Ed.)** — [https://www.w3.org/TR/soap12-part2/](https://www.w3.org/TR/soap12-part2/) — encoding, RPC convention, HTTP binding, MEPs [90].
- **W3C SOAP Specifications index** — [https://www.w3.org/TR/soap/](https://www.w3.org/TR/soap/) [91].
- **WSDL 1.1 Note (15 March 2001)** — [https://www.w3.org/TR/2001/NOTE-wsdl-20010315](https://www.w3.org/TR/2001/NOTE-wsdl-20010315) — the WSDL everyone uses.
- **WSDL 2.0 Part 1 Recommendation (26 June 2007)** — [https://www.w3.org/TR/2007/REC-wsdl20-20070626/](https://www.w3.org/TR/2007/REC-wsdl20-20070626/) [13].
- **OASIS WS-Security 1.1** — [https://www.oasis-open.org/standards#wssv1.1](https://www.oasis-open.org/standards#wssv1.1) — SOAP message security.
- **OASIS WS-SecurityPolicy, WS-Trust, WS-SecureConversation** — same OASIS landing page.
- **W3C XML-binary Optimized Packaging (XOP)** — [https://www.w3.org/TR/xop10/](https://www.w3.org/TR/xop10/) — January 2005 Recommendation.
- **W3C SOAP MTOM** — [https://www.w3.org/TR/soap12-mtom/](https://www.w3.org/TR/soap12-mtom/) — January 2005 Recommendation.
- **W3C XML Signature** — [https://www.w3.org/TR/xmldsig-core1/](https://www.w3.org/TR/xmldsig-core1/) — Recommendation 11 April 2013 [11].
- **W3C XML Encryption 1.1** — [https://www.w3.org/TR/xmlenc-core1/](https://www.w3.org/TR/xmlenc-core1/) — Recommendation 11 April 2013.

*Level for all: advanced. Last updated: 2007 (most), 2013 (XML Sig/Enc 1.1).*

### 9.2 Books (with chapter pointers)

- **Don Box, *Essential .NET, Volume 1: The Common Language Runtime*** (Addison-Wesley, 2002). For SOAP background and Indigo/WCF prehistory.
- **Sanjiva Weerawarana, Francisco Curbera, Frank Leymann, Tony Storey, Donald Ferguson, *Web Services Platform Architecture*** (Prentice Hall, 2005). Chapters on WSDL, WS-Addressing, WS-Reliable Messaging by the OASIS authors.
- **James Snell, Doug Tidwell, Pavel Kulchenko, *Programming Web Services with SOAP*** (O'Reilly, 2001). Dated, but the canonical SOAP-on-the-wire reference. *Level: intermediate. Last updated: 2001.*
- **Scott Seely, *SOAP: Cross Platform Web Services Development Using XML*** (Prentice Hall, 2001). Same era.
- **Leonard Richardson & Sam Ruby, *RESTful Web Services*** (O'Reilly, 2007). The contrast text: chapter 1 ("The Programmable Web and Its Inhabitants") frames the SOAP-vs-REST argument.

### 9.3 Academic papers (DOI / stable URL)

- McIntosh & Austel, "XML Signature Element Wrapping Attacks and Countermeasures," ACM SWS 2005 — DOI 10.1145/1103022.1103026 [76].
- Gajek, Jensen, Liao, Schwenk, "Analysis of Signature Wrapping Attacks and Countermeasures," ICWS 2009 — DOI 10.1109/ICWS.2009.12 [78].
- Jensen, Meyer, Somorovsky, Schwenk, "On the Effectiveness of XML Schema Validation for Countering XML Signature Wrapping Attacks," IWSSC 2011 — DOI 10.1109/IWSSC.2011.6142788 [77].
- Somorovsky et al., "On Breaking SAML: Be Whoever You Want to Be," USENIX Security 2012 — [https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/somorovsky](https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/somorovsky) [79].
- Somorovsky, Heiderich, Jensen, Schwenk, Gruschka, Lo Iacono, "All Your Clouds Are Belong to Us," ACM CCSW 2011 — DOI 10.1145/2046660.2046664 [80].
- Mainka, Jensen, Lo Iacono, Schwenk, "XSpRES: Robust and Effective XML Signatures for Web Services," CLOSER 2012 [76].
- Pastor et al., "XML Signature Wrapping Still Considered Harmful: A Case Study on the Personal Health Record in Germany," Springer 2021 — DOI 10.1007/978-3-030-78120-0_1 [81].

### 9.4 Long-form engineering blogs

- **Don Box, "A Brief History of SOAP"** — [https://www.xml.com/pub/a/ws/2001/04/04/soap.html](https://www.xml.com/pub/a/ws/2001/04/04/soap.html) — primary source for the origin story [21].
- **Tim Bray, "The Shambling WS-Undead"** — [http://www.tbray.org/ongoing/When/200x/2008/07/03/The-Shambling-Undead](http://www.tbray.org/ongoing/When/200x/2008/07/03/The-Shambling-Undead) [33].
- **Tim Bray, "REST Questions"** — [https://www.tbray.org/ongoing/When/200x/2008/08/18/On-REST](https://www.tbray.org/ongoing/When/200x/2008/08/18/On-REST) [33].
- **Microsoft .NET Blog, "CoreWCF 1.0 has been Released"** — [https://devblogs.microsoft.com/dotnet/corewcf-v1-released/](https://devblogs.microsoft.com/dotnet/corewcf-v1-released/) [60].
- **InfoWorld, "WCF returns: Core WCF gets a 1.0 release"** — [https://www.infoworld.com/article/2335217/](https://www.infoworld.com/article/2335217/) [55].
- **Salesforce SOAP API End-of-Life Policy** — [https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/api_eol_soap.htm](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/api_eol_soap.htm) [40].
- **AltexSoft, "NDC API Versions"** (2024) — [https://www.altexsoft.com/blog/ndc-api-versions/](https://www.altexsoft.com/blog/ndc-api-versions/) — best plain-English account of the airline industry's SOAP/XML mess [42].

### 9.5 Videos and channels

- **Don Box on SOAP, XML, REST, M** (InfoQ, QCon SF 2009) — [https://www.infoq.com/interviews/box-soap-xml-rest-m/](https://www.infoq.com/interviews/box-soap-xml-rest-m/) — the original architect reflecting on the wreckage [92].
- **Tim Bray on Rails, REST, XML, Java** (InfoQ, 2007) — [https://www.infoq.com/interviews/tim_bray_rails_and_more/](https://www.infoq.com/interviews/tim_bray_rails_and_more/) — source of the WS-Deathstar quote [32].
- **Microsoft On .NET — CoreWCF episodes** (Matthew Connew with James Montemagno) — discoverable on YouTube channel `dotnet`.

### 9.6 Podcasts

- **Software Engineering Daily** — search "SOAP", "WCF", "API protocols".
- **Software Engineering Radio** — episode 388 "Stefan Tilkov on REST and APIs" covers the SOAP comparison.
- **.NET Rocks!** — multiple WCF and CoreWCF episodes (e.g., episode 1738 "WCF and CoreWCF with Matt Connew").

### 9.7 Free courses

- **MIT 6.824 Distributed Systems** lecture notes touch on RPC patterns including SOAP — [https://pdos.csail.mit.edu/6.824/](https://pdos.csail.mit.edu/6.824/).
- **Stanford CS142 / CS193X** — covers REST in contrast to SOAP.

### 9.8 Hands-on tools

- **SoapUI Open Source / ReadyAPI** — [https://www.soapui.org/](https://www.soapui.org/) — the gold standard for SOAP testing, including data-driven and security tests (XML Bomb, SQL injection) [87][88].
- **Postman** — [https://www.postman.com/product/soap-client/](https://www.postman.com/product/soap-client/) — full SOAP client: WSDL import, encoded/raw bodies, OAuth/JWT, scripting, mocks [89]. [Postman](https://www.postman.com/product/soap-client/)
- **Apidog, Insomnia, Hoppscotch** — modern Postman-alternatives with varying SOAP fidelity [88].
- **Wireshark** with the XML dissector — wire-level decode.
- **`wsdl.exe` / `svcutil.exe` / `dotnet-svcutil`** — generate .NET clients from WSDL.
- **`wsimport` (JAX-WS), `wsdl2java` (Apache CXF, Axis2)** — Java client generation.
- **`gsoap` `wsdl2h` + `soapcpp2`** — C/C++.
- **`zeep`** — Python.

---

## 10. Where things are heading (2025–2026 frontier)

**The verdict.** SOAP is not dead, but it is firmly in *managed retirement* across every domain that has a choice. New systems use REST/JSON for public APIs, gRPC for internal microservice traffic, and GraphQL where flexible querying matters. SOAP survives where (a) the contract pre-dates 2010 and the cost of changing a regulated interface is enormous, or (b) end-to-end message-level security through intermediaries is genuinely required and TLS is not enough. [Grokipedia](https://grokipedia.com/page/Web_Services_Description_Language)

**Specifically in the last 24 months:**

- **Microsoft WCF** has effectively pushed all server-side investment to the **CoreWCF** community project; CoreWCF 1.8.0 (July 2025) supports .NET 8/9/10-preview and .NET Framework 4.6.2+ [37]. Microsoft offers paid Product Support for CoreWCF in production [38][60]. The official advice for *new* services is gRPC or ASP.NET Core minimal APIs, not CoreWCF [55][56]. [GitHub + 2](https://github.com/CoreWCF/CoreWCF/releases)
- **Apache Axis 1.x is EOL** (CVE-2023-40743 carries the explicit Apache statement) [34].
- **Apache Axis2** is still maintained — 2.0.0 in March 2025 with Jakarta EE — but it is a maintenance posture, not a growth project [36].
- **WS-* working groups at W3C** are largely closed; the XML Protocol WG was closed in 2009 [19]. OASIS WS-Security and related committees still exist for errata work but produce no new specs at meaningful pace. [BNC](https://www.networxsecurity.org/members-area/glossary/s/soap.html)
- **Salesforce SOAP API `login()` retirement** (Summer '27 for v31.0–64.0) is the highest-profile commercial deprecation in flight [40][41].
- **eBay, PayPal Classic** SOAP APIs continue in long-tail deprecation; no replacement of business-critical integrations is forced — yet.
- **Healthcare:** HL7 V3-over-SOAP (UK NHS Spine, IHE profiles, US IIS WSDL) coexists with HL7 **FHIR** (R4 normative since 2019, R5 in 2023). All new builds and US ONC/CMS-mandated certifications are FHIR — REST/JSON. Expect 5–10 more years of HL7 V3 SOAP runoff in regulated archives [62][63].
- **Banking:** SWIFT's MT/MX **coexistence ended 22 November 2025**; cross-border payment instructions are now ISO 20022 XML on FINplus — not SOAP, but XML-on-XML lives on [65][66].
- **Airlines / IATA NDC** is still actively versioned (24.1 schemas; "Offers & Orders 2030" target). Amadeus exposes NDC over SOAP, Sabre/Travelport over REST [42][43][68]. [AltexSoft](https://www.altexsoft.com/blog/new-distribution-capability-ndc-in-air-travel-airlines-gdss-and-the-impact-on-the-industry/)
- **EU eGovernment / eIDAS** uses SAML 2.0 over WebSSO (POST/Redirect) for cross-border identity; the underlying eIDAS-Node software still has SOAP web services internally; eIDAS 2.0 (Regulation EU 2024/1183, in force 20 May 2024) and the **EU Digital Identity Wallet** (mandatory by end-2026) push hard toward OpenID Connect / OAuth — not SOAP [64][93]. [Cyber Risk GmbH](https://www.european-digital-identity-regulation.com/)[asquared](https://asquared.company/en/blog/digital-identity-solutions-in-europe-2025-status-quo-1096/)

**Migration patterns we see in 2026:**

- **SOAP → REST/JSON**: most public APIs.
- **SOAP → gRPC**: internal microservices, especially in .NET shops moving off WCF [55].
- **SOAP → GraphQL**: rare; usually only when the client side is consolidating dozens of fine-grained SOAP calls into one query.
- **Strangler-pattern gateways**: a Mule/CXF/AWS API Gateway proxy that fronts the legacy SOAP service with a REST façade — a well-trodden bridge.

---

## 11. Hooks for the article, infographic, and podcast

### 60-second narrated hook (for the ear)

> *"In 1998, four engineers — three from Microsoft, one from a tiny shop called UserLand — sketched out a way for software to talk across the internet. They called it Simple Object Access Protocol. Then Microsoft's internal politics buried it for a year. So Dave Winer, the UserLand guy, shipped a rebellious half-version called XML-RPC anyway. By 2003 SOAP had become a W3C standard and the foundation of corporate computing. By 2008 the same Tim Bray who co-invented XML was calling it 'an embarrassing failure.' Today, in 2026, Apache Axis 1 is dead, Microsoft handed WCF to a community project, and Salesforce is retiring its SOAP login. But SOAP is still moving billions of dollars through banks, hospitals, and airlines every day — because in regulated industries, an XML envelope your auditor signed off on twenty years ago beats every shiny new thing you can build. This is the story of the protocol everyone loves to leave but nobody can quite kill."*

### Striking statistics

- **500k req/s/core**: gRPC's documented per-core throughput on modern hardware — a useful counterpoint to SOAP's hundreds-to-low-thousands [54].
- **~33%**: the size penalty SOAP pays for base64-encoding binary data in XML, eliminated by MTOM/XOP [10].
- **~3 GB**: the memory a 1 KB Billion-Laughs SOAP request can force a vulnerable parser to allocate [74]. [Wikipedia](https://en.wikipedia.org/wiki/Billion_laughs_attack)
- **22 November 2025**: the date SWIFT formally ended MT/ISO-20022 coexistence for cross-border payments — the largest XML migration in financial history, even though it bypasses SOAP itself [65].
- **Summer '27**: the planned end of Salesforce SOAP API `login()` for legacy API versions 31.0–64.0 [40][41]. [Infallibletechie](https://www.infallibletechie.com/2025/11/salesforce-soap-api-login-retirement.html)

### "Pause and think" moments

- **The W3C XML Protocol Working Group — the body that maintained SOAP — was closed on 10 July 2009.** Most engineers using SOAP today are working with a protocol whose maintainers wrapped up sixteen years ago [19].
- **SOAP 1.1 — by far the most widely deployed version — is technically not a standard.** It is a W3C Note. Only SOAP 1.2 ever became a W3C Recommendation, and even that received its last edition almost two decades ago, in April 2007 [27][29].
- **Don Box has said in writing that the *only* reason XML-RPC exists is Microsoft politics.** Dave Winer shipped XML-RPC in June 1998 because he was tired of waiting for Microsoft to release SOAP [21][22].

### Failure-story arc

> **Setup.** In 2011, Juraj Somorovsky and colleagues at Ruhr-Universität Bochum bought time on Amazon Web Services. AWS's control plane was — and still is, in places — a SOAP API protected by XML Signature. Each request the user makes is signed; AWS verifies the signature; if valid, your action runs.
> 
> **Mistake.** XML Signature was designed to sign *abstract* XML — but the SOAP processing logic operates on the *concrete* document. The signature library checks "is the bit I pointed to with this `Id` correctly signed?" The application logic asks "what's in the SOAP Body?" Nothing forces those two pieces of code to look at the *same* element.
> 
> **Consequence.** The Bochum team showed that they could take a legitimate signed request, *wrap* the original element somewhere harmless, and slip a malicious one into the Body — and AWS would dutifully verify the signature and execute the attacker's command. Their CCSW 2011 paper was titled, with academic understatement, "All Your Clouds Are Belong to Us." [80] Earlier work going back to McIntosh & Austel at IBM in 2005 had warned about exactly this class of attack [76]; subsequent work showed it kept reappearing in banks, healthcare, and as late as 2021 in Germany's national personal health record [81].
> 
> **Resolution.** Modern fixes include XPath-based signature targeting (Gajek et al., 2009), schema hardening (Jensen et al., 2011), and the simple operational rule: *the code that verifies a signature MUST be the same code that consumes the signed data, with no XML rewriting in between* [77][78]. AWS patched within days; the broader industry is, fifteen years later, still finding instances. The whole story is the canonical case study for *why* end-to-end XML message security is so much harder than TLS.

---

## 12. Citations

[1] Cloudflare, "What is the OSI Model?" — [https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/](https://www.cloudflare.com/learning/ddos/glossary/open-systems-interconnection-model-osi/)
[2] IANA, "Service Name and Transport Protocol Port Number Registry" — [https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)
[3] IETF RFC 9112, "HTTP/1.1" — [https://www.rfc-editor.org/rfc/rfc9112](https://www.rfc-editor.org/rfc/rfc9112)
[4] W3C, "Simple Object Access Protocol (SOAP) 1.1" Note, 8 May 2000 — [https://www.w3.org/TR/2000/NOTE-SOAP-20000508/](https://www.w3.org/TR/2000/NOTE-SOAP-20000508/)
[5] W3C, "SOAP Version 1.2 Part 1: Messaging Framework (Second Edition)" — [https://www.w3.org/TR/soap12-part1/](https://www.w3.org/TR/soap12-part1/)
[6] IETF RFC 8446, "TLS 1.3" — [https://www.rfc-editor.org/rfc/rfc8446](https://www.rfc-editor.org/rfc/rfc8446)
[7] InformIT (Hartman/Snell), "Introduction to the SOAP HTTP binding" — [https://www.informit.com/articles/article.aspx?p=102285&seqNum=5](https://www.informit.com/articles/article.aspx?p=102285&seqNum=5)
[8] W3C, "Extensible Markup Language (XML) 1.0" — [https://www.w3.org/TR/xml/](https://www.w3.org/TR/xml/)
[9] W3C, "XML Schema Part 2: Datatypes" — [https://www.w3.org/TR/xmlschema-2/](https://www.w3.org/TR/xmlschema-2/)
[10] Wikipedia, "XML-binary Optimized Packaging" — [https://en.wikipedia.org/wiki/XML-binary_Optimized_Packaging](https://en.wikipedia.org/wiki/XML-binary_Optimized_Packaging)
[11] W3C, "XML Signature Syntax and Processing Version 1.1" — [https://www.w3.org/TR/xmldsig-core1/](https://www.w3.org/TR/xmldsig-core1/)
[12] W3C, "Web Services Description Language (WSDL) 1.1" Note — [https://www.w3.org/TR/2001/NOTE-wsdl-20010315](https://www.w3.org/TR/2001/NOTE-wsdl-20010315)
[13] W3C, "Web Services Description Language (WSDL) Version 2.0 Part 1: Core Language" Recommendation, 26 June 2007 — [https://www.w3.org/TR/2007/REC-wsdl20-20070626/](https://www.w3.org/TR/2007/REC-wsdl20-20070626/)
[14] Apache Axis2 docs, "Handling Binary data with Axis2 (MTOM/SwA)" — [https://axis.apache.org/axis2/java/core/docs/mtom-guide.html](https://axis.apache.org/axis2/java/core/docs/mtom-guide.html)
[15] IBM Docs, "XML-binary Optimized Packaging" — [https://www.ibm.com/docs/en/was/9.0.5?topic=mechanism-xml-binary-optimized-packaging](https://www.ibm.com/docs/en/was/9.0.5?topic=mechanism-xml-binary-optimized-packaging)
[16] Wikipedia, "WS-Security" — [https://en.wikipedia.org/wiki/WS-Security](https://en.wikipedia.org/wiki/WS-Security)
[17] Roy T. Fielding, "Architectural Styles and the Design of Network-based Software Architectures," PhD diss., UC Irvine, 2000 — [https://roy.gbiv.com/pubs/dissertation/top.htm](https://roy.gbiv.com/pubs/dissertation/top.htm)
[18] Microsoft News, "COM and SOAP Pioneer Don Box Joins Microsoft" — [https://news.microsoft.com/source/2002/01/18/com-and-soap-pioneer-don-box-joins-microsoft/](https://news.microsoft.com/source/2002/01/18/com-and-soap-pioneer-don-box-joins-microsoft/)
[19] Wikipedia, "SOAP" — [https://en.wikipedia.org/wiki/SOAP](https://en.wikipedia.org/wiki/SOAP)
[20] Microsoft News, "COM and SOAP Pioneer Don Box Joins Microsoft" (bathtub anecdote) — [https://news.microsoft.com/source/2002/01/18/com-and-soap-pioneer-don-box-joins-microsoft/](https://news.microsoft.com/source/2002/01/18/com-and-soap-pioneer-don-box-joins-microsoft/)
[21] Don Box, "A Brief History of SOAP," xml.com, 4 April 2001 — [https://www.xml.com/pub/a/ws/2001/04/04/soap.html](https://www.xml.com/pub/a/ws/2001/04/04/soap.html)
[22] Wikipedia, "XML-RPC" — [https://en.wikipedia.org/wiki/XML-RPC](https://en.wikipedia.org/wiki/XML-RPC)
[23] Dave Winer, "XML-RPC Specification" — [https://xmlrpc.com/spec.md](https://xmlrpc.com/spec.md)
[24] TechTarget, "SOAP (Simple Object Access Protocol)" — [https://www.techtarget.com/searchapparchitecture/definition/SOAP-Simple-Object-Access-Protocol](https://www.techtarget.com/searchapparchitecture/definition/SOAP-Simple-Object-Access-Protocol)
[25] W3C, "SOAP Version 1.2 Part 1 (Second Edition)" §1 (note dropping the acronym) — [https://www.w3.org/TR/soap12-part1/](https://www.w3.org/TR/soap12-part1/)
[26] O'Reilly, "Web Services Essentials — SOAP and the W3C" — [https://www.oreilly.com/library/view/web-services-essentials/0596002246/ch03s05.html](https://www.oreilly.com/library/view/web-services-essentials/0596002246/ch03s05.html)
[27] W3C, "Simple Object Access Protocol (SOAP) 1.1" Note (author list) — [https://www.w3.org/TR/2000/NOTE-SOAP-20000508/](https://www.w3.org/TR/2000/NOTE-SOAP-20000508/)
[28] W3C Press Release, "World Wide Web Consortium Issues SOAP Version 1.2 as a W3C Recommendation," 24 June 2003 — [https://www.w3.org/2003/06/soap12-testimonial](https://www.w3.org/2003/06/soap12-testimonial)
[29] W3C, "SOAP Version 1.2 Part 0: Primer (Second Edition)" — [https://www.w3.org/TR/soap12-part0/](https://www.w3.org/TR/soap12-part0/)
[30] W3C News, "SOAP Version 1.2 Second Edition Is a W3C Recommendation," 27 April 2007 — [https://www.w3.org/news/2007/soap-version-12-second-edition-is-a-w3c-recommendation/](https://www.w3.org/news/2007/soap-version-12-second-edition-is-a-w3c-recommendation/)
[31] Paul Krill, "Sun technologist: SOAP stack a 'failure'," InfoWorld, July 2008 — [https://www.infoworld.com/article/2651733/sun-technologist--soap-stack-a--failure-.html](https://www.infoworld.com/article/2651733/sun-technologist--soap-stack-a--failure-.html)
[32] InfoQ, "Tim Bray on Rails, REST, XML, Java, and More" — [https://www.infoq.com/interviews/tim_bray_rails_and_more/](https://www.infoq.com/interviews/tim_bray_rails_and_more/)
[33] Tim Bray, "The Shambling WS-Undead" — [http://www.tbray.org/ongoing/When/200x/2008/07/03/The-Shambling-Undead](http://www.tbray.org/ongoing/When/200x/2008/07/03/The-Shambling-Undead) ; "REST Questions" — [https://www.tbray.org/ongoing/When/200x/2008/08/18/On-REST](https://www.tbray.org/ongoing/When/200x/2008/08/18/On-REST)
[34] GitHub Advisory, "Apache Axis 1.x (EOL) may allow RCE — CVE-2023-40743" — [https://github.com/advisories/GHSA-rmqp-9w4c-gc7w](https://github.com/advisories/GHSA-rmqp-9w4c-gc7w)
[35] Security Vulnerability, "CVE-2023-51441 — Apache Axis SSRF" — [https://securityvulnerability.io/vulnerability/CVE-2023-51441](https://securityvulnerability.io/vulnerability/CVE-2023-51441)
[36] Apache Whimsy, Axis Project Board Minutes — [https://whimsy.apache.org/board/minutes/Axis.html](https://whimsy.apache.org/board/minutes/Axis.html)
[37] GitHub, "CoreWCF Releases" — [https://github.com/CoreWCF/CoreWCF/releases](https://github.com/CoreWCF/CoreWCF/releases)
[38] CodeMag (Sam Spencer), "Using CoreWCF to Move WCF Services to .NET Core" — [https://www.codemag.com/Article/2211092/Using-CoreWCF-to-Move-WCF-Services-to-.NET-Core](https://www.codemag.com/Article/2211092/Using-CoreWCF-to-Move-WCF-Services-to-.NET-Core)
[39] Microsoft, "Official WCF Client support policy" — [https://dotnet.microsoft.com/en-us/platform/support/policy/wcf-client](https://dotnet.microsoft.com/en-us/platform/support/policy/wcf-client)
[40] Salesforce Developers, "SOAP API End-of-Life Policy" — [https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/api_eol_soap.htm](https://developer.salesforce.com/docs/atlas.en-us.api.meta/api/api_eol_soap.htm)
[41] InfallibleTechie, "Salesforce SOAP API login() Retirement," Nov 2025 — [https://www.infallibletechie.com/2025/11/salesforce-soap-api-login-retirement.html](https://www.infallibletechie.com/2025/11/salesforce-soap-api-login-retirement.html)
[42] AltexSoft, "NDC API Versions: How One Standard Leads to Endless Interpretations" — [https://www.altexsoft.com/blog/ndc-api-versions/](https://www.altexsoft.com/blog/ndc-api-versions/)
[43] IATA, "Distribution with Offers & Orders (NDC)" — [https://www.iata.org/en/programs/airline-distribution/retailing/ndc/](https://www.iata.org/en/programs/airline-distribution/retailing/ndc/)
[44] Pearson Higher Ed, "The SOAP Protocol" (sample chapter) — [https://www.pearsonhighered.com/assets/samplechapter/0/6/7/2/0672326418.pdf](https://www.pearsonhighered.com/assets/samplechapter/0/6/7/2/0672326418.pdf)
[45] InformIT, "Faults: Error Handling in SOAP" — [https://www.informit.com/articles/article.aspx?p=327825&seqNum=11](https://www.informit.com/articles/article.aspx?p=327825&seqNum=11)
[46] Informatica Docs, "SOAP 1.1 Headers and Envelope" — [https://docs.informatica.com/data-as-a-service/address-verification-(cloud)/2-0/developer-guide/informatica-addressdoctor-cloud-interface/soap-1-1-headers-and-envelope.html](https://docs.informatica.com/data-as-a-service/address-verification-(cloud)/2-0/developer-guide/informatica-addressdoctor-cloud-interface/soap-1-1-headers-and-envelope.html)
[47] Informatica Docs, "SOAP 1.2 Headers and Envelope" — [https://docs.informatica.com/data-as-a-service/address-verification-(cloud)/4-0/developer-guide/informatica-address-verification-interface/soap-1-2-headers-and-envelope.html](https://docs.informatica.com/data-as-a-service/address-verification-(cloud)/4-0/developer-guide/informatica-address-verification-interface/soap-1-2-headers-and-envelope.html)
[48] InformIT, "SOAP Faults" — [https://www.informit.com/articles/article.aspx?p=169106&seqNum=6](https://www.informit.com/articles/article.aspx?p=169106&seqNum=6)
[49] OASIS, "Web Services Security: SAML Token Profile 1.1" — [https://docs.oasis-open.org/wss/v1.1/wss-v1.1-spec-os-SAMLTokenProfile.pdf](https://docs.oasis-open.org/wss/v1.1/wss-v1.1-spec-os-SAMLTokenProfile.pdf)
[50] Roy T. Fielding, Dissertation Chapter 5 — [https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm](https://roy.gbiv.com/pubs/dissertation/rest_arch_style.htm)
[51] Katalon, "SoapUI vs Postman vs Katalon" (>95% REST+SOAP, 83% REST share) — [https://katalon.com/resources-center/blog/soapui-vs-postman-katalon-api-tools](https://katalon.com/resources-center/blog/soapui-vs-postman-katalon-api-tools)
[52] Two Bit History, "Roy Fielding's Misappropriated REST Dissertation" — [https://twobithistory.org/2020/06/28/rest.html](https://twobithistory.org/2020/06/28/rest.html)
[53] Mertech, "Know your API protocols: SOAP vs REST vs JSON-RPC vs gRPC vs GraphQL vs Thrift" — [https://www.mertech.com/blog/know-your-api-protocols](https://www.mertech.com/blog/know-your-api-protocols)
[54] Techlasi, "SOAP vs REST vs gRPC: What is the Difference (2026)" — [https://techlasi.com/savvy/soap-vs-rest-vs-grpc-what-is-the-difference/](https://techlasi.com/savvy/soap-vs-rest-vs-grpc-what-is-the-difference/)
[55] InfoWorld, "WCF returns: Core WCF gets a 1.0 release" — [https://www.infoworld.com/article/2335217/wcf-returns-core-wcf-gets-a-10-release.html](https://www.infoworld.com/article/2335217/wcf-returns-core-wcf-gets-a-10-release.html)
[56] Visual Studio Magazine, "Community Devs Revive WCF After Microsoft Deprecation" — [https://visualstudiomagazine.com/articles/2022/04/28/corewcf.aspx](https://visualstudiomagazine.com/articles/2022/04/28/corewcf.aspx)
[57] WS-Attacks, "XML Signature Wrapping" — [http://www.ws-attacks.org/XML_Signature_Wrapping](http://www.ws-attacks.org/XML_Signature_Wrapping)
[58] European Commission, "eIDAS SAML Attribute Profile v1.4.1," 2024 — [https://ec.europa.eu/digital-building-blocks/sites/download/attachments/467109280/eIDAS%20SAML%20Attribute%20Profile%20v1.4.1_final.pdf](https://ec.europa.eu/digital-building-blocks/sites/download/attachments/467109280/eIDAS%20SAML%20Attribute%20Profile%20v1.4.1_final.pdf)
[59] IHE, "Appendix V: Web Services for IHE Transactions" — [https://profiles.ihe.net/ITI/TF/Volume2/ch-V.html](https://profiles.ihe.net/ITI/TF/Volume2/ch-V.html)
[60] Microsoft .NET Blog, "CoreWCF 1.0 has been Released" — [https://devblogs.microsoft.com/dotnet/corewcf-v1-released/](https://devblogs.microsoft.com/dotnet/corewcf-v1-released/)
[61] NHS England Digital, "Legitimate Relationship Service - HL7 V3 API" — [https://digital.nhs.uk/developer/api-catalogue/legitimate-relationship-service-hl7-v3](https://digital.nhs.uk/developer/api-catalogue/legitimate-relationship-service-hl7-v3)
[62] CDC, "Transport (SOAP) | Immunization Information Systems" — [https://www.cdc.gov/iis/technical-guidance/services.html](https://www.cdc.gov/iis/technical-guidance/services.html)
[63] CapMinds, "HL7 V2, V3, and FHIR: Definitions and Scope" — [https://www.capminds.com/blog/hl7-vs-fhir-whats-the-real-difference/](https://www.capminds.com/blog/hl7-vs-fhir-whats-the-real-difference/)
[64] European Digital Identity Regulation portal, "eIDAS 2.0" — [https://www.european-digital-identity-regulation.com/](https://www.european-digital-identity-regulation.com/)
[65] PaymentExpert, "Swift's ISO 20022 cutover: The end of MT and a 20-year promise," 21 Nov 2025 — [https://paymentexpert.com/2025/11/21/swifts-iso-20022-cutover-the-end-of-mt-and-a-20-year-promise/](https://paymentexpert.com/2025/11/21/swifts-iso-20022-cutover-the-end-of-mt-and-a-20-year-promise/)
[66] Banking.Vision, "ISO 20022: The Final Chapter Begins" — [https://banking.vision/en/iso-20022-the-final-chapter-begins/](https://banking.vision/en/iso-20022-the-final-chapter-begins/)
[67] Swift, "ISO 20022 Standards" — [https://www.swift.com/standards/iso-20022/iso-20022-standards](https://www.swift.com/standards/iso-20022/iso-20022-standards)
[68] AltexSoft, "New Distribution Capability (NDC) in Air Travel" — [https://www.altexsoft.com/blog/new-distribution-capability-ndc-in-air-travel-airlines-gdss-and-the-impact-on-the-industry/](https://www.altexsoft.com/blog/new-distribution-capability-ndc-in-air-travel-airlines-gdss-and-the-impact-on-the-industry/)
[69] Joni Mäkkönen, "Performance and Usage Comparison Between REST and SOAP," Aalto University master's thesis, 2017 — [https://aaltodoc.aalto.fi/bitstream/handle/123456789/29224/master_Makkonen_Joni_2017.pdf](https://aaltodoc.aalto.fi/bitstream/handle/123456789/29224/master_Makkonen_Joni_2017.pdf)
[70] Superblocks, "SOAP vs REST: 9 Key Differences & When to Use Each in 2026" — [https://www.superblocks.com/blog/soap-vs-rest](https://www.superblocks.com/blog/soap-vs-rest)
[71] Gruschka, Jensen, Lo Iacono, Luttenberger, "Server-side streaming processing of WS-Security," IEEE T. Services Computing 4, 2011 — [https://link.springer.com/chapter/10.1007/978-3-319-04519-1_10](https://link.springer.com/chapter/10.1007/978-3-319-04519-1_10) (cited in)
[72] PortSwigger Web Security Academy, "What is XXE injection?" — [https://portswigger.net/web-security/xxe](https://portswigger.net/web-security/xxe)
[73] Snyk, "XML External Entity (XXE) Injection in soap:soap | CVE-2022-40705" — [https://security.snyk.io/vuln/SNYK-JAVA-SOAP-3034822](https://security.snyk.io/vuln/SNYK-JAVA-SOAP-3034822)
[74] Wikipedia, "Billion laughs attack" — [https://en.wikipedia.org/wiki/Billion_laughs_attack](https://en.wikipedia.org/wiki/Billion_laughs_attack)
[75] Medium / InstaTunnel, "Billion Laughs Attack: The XML That Brings Servers to Their Knees" (mentions CVE-2024-1455, CVE-2025-3225) — [https://medium.com/@instatunnel/billion-laughs-attack-the-xml-that-brings-servers-to-their-knees-f83ba617caa4](https://medium.com/@instatunnel/billion-laughs-attack-the-xml-that-brings-servers-to-their-knees-f83ba617caa4)
[76] Springer, "Making XML Signatures Immune to XML Signature Wrapping Attacks" — [https://link.springer.com/chapter/10.1007/978-3-319-04519-1_10](https://link.springer.com/chapter/10.1007/978-3-319-04519-1_10)
[77] Jensen, Meyer, Somorovsky, Schwenk, "On the Effectiveness of XML Schema Validation for Countering XML Signature Wrapping Attacks," IWSSC 2011 — [https://www.researchgate.net/publication/252053794](https://www.researchgate.net/publication/252053794)
[78] Gajek, Jensen, Liao, Schwenk, "Analysis of Signature Wrapping Attacks and Countermeasures," ICWS 2009 — [https://www.semanticscholar.org/paper/Analysis-of-Signature-Wrapping-Attacks-and-Gajek-Jensen/51bd3fbf030a369c3a1201d4d924e30076f96b87](https://www.semanticscholar.org/paper/Analysis-of-Signature-Wrapping-Attacks-and-Gajek-Jensen/51bd3fbf030a369c3a1201d4d924e30076f96b87)
[79] Somorovsky, Mayer, Schwenk, Kampmann, Jensen, "On Breaking SAML: Be Whoever You Want to Be," USENIX Security 2012 — [http://www.ws-attacks.org/XML_Signature_Wrapping](http://www.ws-attacks.org/XML_Signature_Wrapping)
[80] Somorovsky, Heiderich, Jensen, Schwenk, Gruschka, Lo Iacono, "All Your Clouds are Belong to us — Security Analysis of Cloud Management Interfaces," ACM CCSW 2011 — [http://www.ws-attacks.org/XML_Signature_Wrapping](http://www.ws-attacks.org/XML_Signature_Wrapping)
[81] Springer, "XML Signature Wrapping Still Considered Harmful: A Case Study on the Personal Health Record in Germany" — [https://link.springer.com/chapter/10.1007/978-3-030-78120-0_1](https://link.springer.com/chapter/10.1007/978-3-030-78120-0_1)
[82] CVE Details, "Apache Axis Security Vulnerabilities" — [https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-11016/Apache-Axis.html)
[83] Rhino Security Labs, "CVE-2019-0227: Expired Domain to RCE in Apache Axis" — [https://rhinosecuritylabs.com/application-security/cve-2019-0227-expired-domain-rce-apache-axis/](https://rhinosecuritylabs.com/application-security/cve-2019-0227-expired-domain-rce-apache-axis/)
[84] GitHub Advisory, "CVE-2019-0227 — Server Side Request Forgery in Apache Axis" — [https://github.com/advisories/GHSA-h9gj-rqrw-x4fq](https://github.com/advisories/GHSA-h9gj-rqrw-x4fq)
[85] CVE Details, "Apache Axis2 Security Vulnerabilities" — [https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-19507/Apache-Axis2.html](https://www.cvedetails.com/vulnerability-list/vendor_id-45/product_id-19507/Apache-Axis2.html)
[86] Wikipedia, "Apache Axis2" — [https://en.wikipedia.org/wiki/Apache_Axis2](https://en.wikipedia.org/wiki/Apache_Axis2)
[87] PFLB, "SOAP UI vs PostMan" — [https://pflb.us/blog/soap-ui-vs-postman/](https://pflb.us/blog/soap-ui-vs-postman/)
[88] Abstracta, "SoapUI vs Postman for API Testing: Full Comparison" — [https://abstracta.us/blog/testing-tools/soapui-vs-postman-for-api-testing/](https://abstracta.us/blog/testing-tools/soapui-vs-postman-for-api-testing/)
[89] Postman, "SOAP Client" — [https://www.postman.com/product/soap-client/](https://www.postman.com/product/soap-client/)
[90] W3C, "SOAP Version 1.2 Part 2: Adjuncts (Second Edition)" — [https://www.w3.org/TR/soap12-part2/](https://www.w3.org/TR/soap12-part2/)
[91] W3C, "SOAP Specifications" index — [https://www.w3.org/TR/soap/](https://www.w3.org/TR/soap/)
[92] InfoQ, "Don Box Discusses SOAP, XML, REST and M" — [https://www.infoq.com/interviews/box-soap-xml-rest-m/](https://www.infoq.com/interviews/box-soap-xml-rest-m/)
[93] Asquared, "Digital Identity Solutions in Europe 2025 — Status Quo" — [https://asquared.company/en/blog/digital-identity-solutions-in-europe-2025-status-quo-1096/](https://asquared.company/en/blog/digital-identity-solutions-in-europe-2025-status-quo-1096/)

---

*Notes for editorial review:* A handful of claims in the body are flagged `[needs source]` — specifically (a) the public IBM/Microsoft/SAP UDDI Business Registry shutdown date in §3.8, (b) BizTalk Server 2020 lifecycle dates in §5.3, (c) the absence of a specific *named* outage attributable to SOAP in 2024–2026 in §6.6, and (d) PayPal Classic SOAP API 2026-specific status in §5.2. Treat these as research follow-ups before publication.