import type { Protocol } from '../types';

export const kerberos: Protocol = {
	id: 'kerberos',
	name: 'Kerberos',
	abbreviation: 'krb5',
	categoryId: 'utilities',
	port: 88,
	year: 1988,
	rfc: 'RFC 4120',
	oneLiner:
		'The three-headed dog that guards every Windows domain, every Hadoop cluster, every NFSv4-with-security mount on Earth. Tickets, not tokens; trusted third party; mutual authentication without ever sending the password.',
	overview: `[[kerberos|Kerberos]] is a network authentication protocol built on **tickets** — short-lived, {{encryption|encrypted}} credentials issued by a trusted third party (the **Key Distribution Center**, or {{kerberos-kdc|KDC}}) — that lets a client prove its identity to a service without ever sending a password, and without the service ever needing to talk to the {{kerberos-kdc|KDC}} for the auth check. The trick is {{symmetric-encryption|symmetric cryptography}} plus a clock: every principal shares a long-term key with the {{kerberos-kdc|KDC}}; the {{kerberos-kdc|KDC}} mints session keys and embeds them in tickets encrypted under the service's long-term key; the client presents the ticket and proves it owns the session key by encrypting an authenticator with a fresh timestamp.

Designed at **{{mit|MIT}} Project Athena** (1983–1991) by Steve Miller, [[pioneer:clifford-neuman|Clifford Neuman]], Jerome Saltzer, and Jeffrey Schiller — *the three-headed dog* in Greek mythology (Cerberus → Kerberos) that guards the gates of Hades. Version 4 was {{mit|MIT}}-only and closed-source for export-control reasons; **Version 5** ([[rfc:4120|RFC 4120]], current since 2005) is what every implementation actually deploys.

The protocol's reach in 2026 is colossal: **every Active Directory domain on Earth** ({{microsoft|Microsoft}} has used Kerberos as {{ad-active-directory|AD}}'s primary auth since Windows 2000), **every Hadoop / HDFS / Hive / Impala cluster**, **NFSv4 with sec=krb5**, FreeIPA, {{apple|Apple}} Open Directory historically, and "enterprise {{sso|SSO}}" in nearly every university research network ({{mit|MIT}} Athena still runs on it). Two reference implementations dominate: **{{mit|MIT}} Kerberos** (the canonical C codebase, [[pioneer:greg-hudson|Greg Hudson]] as lead since the mid-2010s) and **Heimdal** ({{bsd|BSD}}-licensed, Love Hörnquist Åstrand and Jelmer Vernooij; what {{apple|Apple}} shipped in macOS).

The famous architectural decision: Kerberos requires **time synchronisation** across all participants (default ±5 minutes), and runs almost everything over **{{well-known-port|UDP/88}} with [[tcp|TCP]]/88 fallback** when the response exceeds the \`udp_preference_limit\`. The {{replay-attack|replay defence}} is the encrypted timestamp in the **authenticator** — if your client clock is wrong, every auth attempt fails. The result: every enterprise Kerberos deployment depends on [[ntp|NTP]] as much as it depends on {{aes|AES}}.`,
	howItWorks: [
		{
			title: 'AS-REQ → AS-REP — get a Ticket Granting Ticket',
			description:
				"Client sends an **AS-REQ** to the {{kerberos-kdc|KDC}}'s Authentication Service with its principal name (`alice@EXAMPLE.COM`). {{kerberos-kdc|KDC}} looks up Alice's long-term key in its database, generates a fresh session key, and returns an **{{kerberos-as-rep-acr|AS-REP}}** containing: (a) a **Ticket Granting Ticket ({{kerberos-tgt|TGT}})** {{encryption|encrypted}} under the **{{kerberos-krbtgt|krbtgt}}** principal's key (so only the {{kerberos-kdc|KDC}} can later decrypt it), and (b) the session key encrypted under Alice's long-term key (so only Alice can decrypt it). Alice never sends her password."
		},
		{
			title: 'Pre-authentication (the modern default)',
			description:
				'Modern KDCs reject an unauthenticated AS-REQ. The client must include a **{{kerberos-pa-enc-timestamp|PA-ENC-TIMESTAMP}}** — a fresh timestamp encrypted under its long-term key — so the {{kerberos-kdc|KDC}} can verify the client actually knows the password before issuing a {{kerberos-tgt|TGT}}. (The old behaviour of returning the {{kerberos-as-rep-acr|AS-REP}} without pre-auth is what enables **{{kerberos-as-rep-acr|AS-REP}} roasting** — an attacker harvests the {{encryption|encrypted}} blob and brute-forces it offline.)'
		},
		{
			title: 'TGS-REQ → TGS-REP — get a service ticket',
			description:
				"When Alice wants to access `HTTP/web1.example.com`, she sends a **TGS-REQ** to the {{kerberos-kdc|KDC}}'s {{kerberos-tgs|Ticket Granting Service}}, presenting her {{kerberos-tgt|TGT}} plus a fresh authenticator (an {{anti-replay|anti-replay}} timestamp encrypted under the {{kerberos-tgt|TGT}} session key). {{kerberos-kdc|KDC}} decrypts the {{kerberos-tgt|TGT}} (it knows {{kerberos-krbtgt|krbtgt}}'s key), validates the authenticator, mints a new session key for Alice↔web1, and returns a **TGS-REP** with a **service ticket** encrypted under web1's long-term key."
		},
		{
			title: 'AP-REQ — present the service ticket',
			description:
				"Alice connects to web1 and sends an **{{kerberos-ap-req-acr|AP-REQ}}** containing the service ticket + a fresh authenticator. web1 decrypts the ticket using its own long-term key (no round trip to the {{kerberos-kdc|KDC}} needed!), extracts the session key, and uses it to decrypt the authenticator. If the timestamp is within the 5-minute skew window and the authenticator isn't already in web1's replay cache, Alice is authenticated — defeating any {{replay-attack|replay attack}} that reuses an old {{kerberos-ap-req-acr|AP-REQ}}. Optionally web1 returns an **{{ap-access-point|AP}}-REP** that echoes Alice's own authenticator timestamp encrypted under the session key, proving to her it holds the right keytab ({{mtls|mutual auth}})."
		},
		{
			title: 'Cross-realm referrals',
			description:
				'When Alice in EXAMPLE.COM wants to access a service in PARTNER.COM, her {{kerberos-kdc|KDC}} issues a **referral {{kerberos-tgt|TGT}}** for the {{kerberos-krbtgt|krbtgt}}/PARTNER.COM principal (encrypted under a cross-realm shared key). Alice presents that to the PARTNER.COM {{kerberos-kdc|KDC}}, gets a service ticket. The trust topology is a graph of shared keys between {{kerberos-krbtgt|krbtgt}} principals — the same mechanism Active Directory uses to scale to forests.'
		},
		{
			title: 'GSS-API and SPNEGO — the application bindings',
			description:
				'Applications rarely speak Kerberos directly. They speak **GSS-{{api|API}}** (Generic Security Service {{api|API}}, [[rfc:2743|RFC 2743]]), which abstracts authentication mechanisms behind `gss_init_sec_context` / `gss_accept_sec_context`. **SPNEGO** ([[rfc:4178|RFC 4178]]) is the protocol negotiation layer that lets [[http1|HTTP]] (`Authorization: Negotiate <base64>`), SMB, LDAP, and other applications transparently use Kerberos when available and fall back to {{ntlm|NTLM}} (NTLMSSP) otherwise — SPNEGO negotiates GSS-API mechanisms, so non-GSS schemes like OAuth are not candidates. Every "Windows Integrated Authentication" prompt in Internet Explorer / Edge / Chrome is SPNEGO over {{http-method|HTTP}} wrapping a {{kerberos-ap-req|Kerberos AP-REQ}}.'
		}
	],
	useCases: [
		'**Active Directory** — every Microsoft AD domain on Earth, primary authentication since Windows 2000',
		'**Hadoop / Spark / Kafka** in enterprise — sec=krb5 is the only way to authenticate jobs at scale',
		'**NFSv4** with `sec=krb5` / `sec=krb5i` / `sec=krb5p` — the classic path to integrity + confidentiality on NFS (RPC-over-TLS, RFC 9289, is the newer alternative)',
		"**FreeIPA** — Red Hat's integrated identity solution (Kerberos + LDAP + DNS + CA)",
		'**MIT Athena** — still operational at MIT in 2026, four decades after the protocol was designed there',
		"**SSH with GSSAPIAuthentication** — passwordless SSH within a Kerberos realm via the user's TGT"
	],
	codeExample: {
		language: 'cli',
		code: `# MIT Kerberos — the canonical CLI toolchain.
# Acquire a TGT (interactive password or PKINIT smart-card).
$ kinit alice@EXAMPLE.COM
Password for alice@EXAMPLE.COM:

# See your tickets.
$ klist
Ticket cache: KEYRING:persistent:1000:1000
Default principal: alice@EXAMPLE.COM

Valid starting       Expires              Service principal
05/12/2026 09:00:00  05/12/2026 19:00:00  krbtgt/EXAMPLE.COM@EXAMPLE.COM
        renew until 05/19/2026 09:00:00

# Get a service ticket by talking to the service (or force it).
$ kvno HTTP/web1.example.com
HTTP/web1.example.com@EXAMPLE.COM: kvno = 2

# Now klist shows the service ticket too.
$ klist
...
05/12/2026 09:05:00  05/12/2026 19:00:00  HTTP/web1.example.com@EXAMPLE.COM

# Use it transparently — curl with --negotiate sends SPNEGO/Kerberos AP-REQ.
$ curl --negotiate -u : https://web1.example.com/

# Inspect ticket flags. F=forwardable, R=renewable, A=pre-authenticated.
$ klist -f

# Wipe the cache (logout).
$ kdestroy

# Server-side: keytabs. The service's long-term key, stored as bytes.
$ ktutil
ktutil:  read_kt /etc/krb5.keytab
ktutil:  list -e -k
slot  KVNO Principal                           Encryption type
----  ---- ------------------------------------ ------------------
   1     2 HTTP/web1.example.com@EXAMPLE.COM    aes256-cts-hmac-sha384-192
   2     2 HTTP/web1.example.com@EXAMPLE.COM    aes128-cts-hmac-sha256-128`,
		caption:
			'A full [[kerberos|Kerberos]] {{login-auth|login}} + service-ticket flow on {{mit|MIT}} krb5 — the toolchain that has powered {{mit|MIT}} Athena since 1988.',
		alternatives: [
			{
				language: 'python',
				code: `# python-gssapi — the canonical Python binding to GSS-API / Kerberos.
import gssapi

# Service principal we want to authenticate to.
service = gssapi.Name(
    'HTTP@web1.example.com',
    gssapi.NameType.hostbased_service,
)

# Acquire our existing credential (from \`kinit\`-populated cache).
creds = gssapi.Credentials(usage='initiate')

# Initiate a security context — produces a SPNEGO/Kerberos AP-REQ token.
ctx = gssapi.SecurityContext(
    name=service,
    creds=creds,
    usage='initiate',
)

# Step the context. First step produces the token to send.
token = ctx.step()

# The base64'd token goes into the HTTP Authorization header.
import base64, requests
resp = requests.get(
    'https://web1.example.com/',
    headers={'Authorization': 'Negotiate ' + base64.b64encode(token).decode()},
)

# On 200 OK, optionally feed the returned WWW-Authenticate to ctx.step()
# again for mutual authentication.
if resp.headers.get('WWW-Authenticate', '').startswith('Negotiate '):
    server_token = base64.b64decode(resp.headers['WWW-Authenticate'].split()[1])
    ctx.step(server_token)
    print('Mutually authenticated. complete=' + str(ctx.complete))`
			},
			{
				language: 'javascript',
				code: `// There is no first-party JavaScript Kerberos client — Kerberos lives in
// the OS credential cache, and the browser handles SPNEGO transparently
// via \`Authorization: Negotiate\`. Below: a Node.js server that ACCEPTS
// Kerberos auth via the \`kerberos\` npm package (MongoDB's
// node-kerberos), used by every MongoDB Enterprise + Kerberos deployment.

import http from 'node:http';
import kerberos from 'kerberos';

const server = http.createServer(async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Negotiate ')) {
    res.writeHead(401, { 'WWW-Authenticate': 'Negotiate' });
    return res.end('Authentication required');
  }

  const token = authHeader.slice('Negotiate '.length);
  try {
    const server = await kerberos.initializeServer('HTTP@web1.example.com');
    await server.step(token);
    const principal = server.username;
    console.log('Authenticated:', principal);

    // Send response with mutual-auth token (so the client can verify the server)
    res.writeHead(200, {
      'WWW-Authenticate': 'Negotiate ' + server.response,
      'Content-Type': 'text/plain',
    });
    res.end(\`Welcome, \${principal}\`);
  } catch (err) {
    res.writeHead(403);
    res.end('Auth failed: ' + err.message);
  }
});

server.listen(443);`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'AS-REQ (UDP/88, plain DER ASN.1)',
						code: `KRB-AS-REQ ::= [APPLICATION 10] KDC-REQ {
  pvno          = 5                          -- protocol version
  msg-type      = 10                         -- AS-REQ
  padata        = SEQUENCE {
    PA-ENC-TIMESTAMP {
      etype     = aes256-cts-hmac-sha384-192
      cipher    = <encrypted client timestamp>
    }
  }
  req-body = KDC-REQ-BODY {
    kdc-options  = forwardable, renewable, proxiable
    cname        = alice                      -- client name
    realm        = EXAMPLE.COM
    sname        = krbtgt/EXAMPLE.COM         -- requesting a TGT
    till         = 2026-05-12T19:00:00Z
    nonce        = 0xA1B2C3D4
    etype        = { aes256, aes128, ... }    -- supported encryption types
  }
}`
					},
					{
						title: 'AS-REP — the magic two-key payload',
						code: `KRB-AS-REP ::= [APPLICATION 11] KDC-REP {
  pvno = 5, msg-type = 11
  crealm  = EXAMPLE.COM
  cname   = alice
  ticket  = Ticket {
    realm     = EXAMPLE.COM
    sname     = krbtgt/EXAMPLE.COM
    enc-part  = EncTicketPart encrypted with KRBTGT's long-term key {
      flags    = forwardable, renewable, pre-authent
      key      = <fresh session key K_alice/krbtgt>
      cname    = alice
      transited = empty
      authtime, starttime, endtime, renew-till
    }
  }
  enc-part = encrypted with ALICE's long-term key {
    key       = <K_alice/krbtgt — the same session key>
    nonce     = 0xA1B2C3D4 (echoed)
    flags, times, sname
  }
}

→ Alice decrypts enc-part with her long-term key (derived from password).
  She now has the session key AND the TGT (which she cannot decrypt — only
  the KDC can — but she can present it back to the KDC as proof of identity).`
					},
					{
						title: 'AP-REQ (client → service)',
						code: `KRB-AP-REQ ::= [APPLICATION 14] SEQUENCE {
  pvno         = 5
  msg-type     = 14
  ap-options   = mutual-required
  ticket       = <service ticket from TGS-REP>
  authenticator = encrypted with K_session {
    crealm    = EXAMPLE.COM
    cname     = alice
    cusec     = 123456
    ctime     = 2026-05-12T09:05:23Z          -- fresh timestamp
    seq-number = 0x4A2B
    subkey    = <optional sub-session key for the application>
  }
}

→ Service decrypts ticket with its own keytab key, extracts K_session,
  decrypts authenticator. If ctime is within ±5 minutes and this
  authenticator (cname/ctime/cusec) is not already in the replay cache,
  AUTHENTICATED.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'1 RTT for AS-REQ/AS-REP (initial login), 1 RTT for TGS-REQ/TGS-REP (per service), 1 RTT for AP-REQ/AP-REP (per session). After login, subsequent service tickets cache locally — no further KDC round trips needed until the TGT expires (default 10 hours)',
		throughput:
			'Protocol overhead is small — DER-encoded ASN.1 messages typically 500–1500 bytes. UDP/88 is preferred until the message exceeds `udp_preference_limit` (default ~1465 bytes) or until the network drops fragmented UDP, at which point clients fall back to TCP/88',
		overhead:
			'Each ticket is ~500–1000 bytes. AP-REQ adds an authenticator (~150 bytes). Session establishment burns 2 ticket exchanges (~3 KB total) but amortises across the session lifetime. Clock skew tolerance default ±5 minutes (configurable via `clockskew` in `krb5.conf`)'
	},
	connections: ['udp', 'tcp', 'tls', 'oauth2', 'ssh', 'ntp', 'dns'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Kerberos_(protocol)',
		rfc: 'https://www.rfc-editor.org/rfc/rfc4120',
		official: 'https://web.mit.edu/kerberos/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Cerberus-Blake.jpeg/500px-Cerberus-Blake.jpeg',
		alt: 'William Blake painting of Cerberus, the three-headed dog of Greek mythology that the Kerberos protocol is named after',
		caption:
			"William Blake's **Cerberus** (c.1825). The three-headed dog from Greek mythology that guards the gates of Hades is the namesake of the protocol designed at {{mit|MIT}} Project Athena in 1983 — its three heads are often mapped to *client*, *server*, and *Key Distribution Center*. The protocol's motto could be the same as Cerberus's: nothing in, nothing out, without showing me a ticket.",
		credit: 'Image: Wikimedia Commons / Public Domain (William Blake, c.1825)'
	},

	recentChanges: [
		{
			date: '2024-06',
			title: 'MIT krb5 1.21.3 — CVE-2024-37370 / CVE-2024-37371',
			description:
				'Critical GSS message-token handling bugs in the {{mit|MIT}} codebase. {{cve|CVE}}-2024-37370 let an attacker tamper with the confidential Extra Count field of a wrap token so the unwrapped message appears truncated (an integrity bypass); {{cve|CVE}}-2024-37371 caused invalid memory reads from malformed token length fields. Patched in 1.21.3, picked up downstream by every {{linux|Linux}} distro within days.',
			source: {
				url: 'https://nvd.nist.gov/vuln/detail/CVE-2024-37370',
				label: 'NVD CVE-2024-37370'
			}
		},
		{
			date: '2025-08',
			title: 'MIT krb5 1.22 — PKINIT ECDH, IAKerb, Unix-domain transport',
			description:
				'5 August 2025 release. Headline features: **PKINIT {{ecdh|ECDH}}/EC certs** (smart-card auth on {{curve25519|Curve25519}} / P-384), **paChecksum2** support (longer FAST-armored {{checksum|checksum}} to retire {{sha1|SHA-1}}), **IAKerb** for realm discovery without [[dns|DNS]], and the first **Unix-domain socket transport** for in-host {{kerberos-kdc|KDC}} traffic. A GSS per-message-token vuln (CVE-2025-57736) was patched in 1.22.1, released 20 August 2025.',
			source: {
				url: 'https://web.mit.edu/kerberos/krb5-1.22/',
				label: 'MIT krb5 1.22 release notes'
			}
		},
		{
			date: '2025-09',
			title: 'Microsoft enforces strong certificate binding (KB5014754 / CVE-2022-34691)',
			description:
				"9 September 2025 — {{microsoft|Microsoft}}'s permanent enforcement deadline for **strong {{certificate|certificate}} binding** (KB5014754, fixing CVE-2022-26931 / CVE-2022-34691) on Active Directory Domain Controllers. After this date, {{ad-active-directory|AD}} DCs refuse Kerberos PKINIT with weakly-bound certs by default.",
			source: {
				url: 'https://msrc.microsoft.com/update-guide/vulnerability/CVE-2022-34691',
				label: 'MSRC CVE-2022-34691'
			}
		},
		{
			date: '2026-04',
			title: 'Windows Server 2025 / Win11 24H2 — IAKerb + Local KDC GA',
			description:
				"Phase 2 of {{microsoft|Microsoft}}'s {{ntlm|NTLM}} phase-out. **IAKerb** (Initial and Pass-Through Authentication using Kerberos) lets clients authenticate through a proxy when they cannot reach a {{kerberos-kdc|KDC}} directly. **Local {{kerberos-kdc|KDC}}** for workgroup machines (no domain join needed). Together they cover the residual use cases {{ntlm|NTLM}} was holding onto.",
			source: {
				url: 'https://techcommunity.microsoft.com/t5/windows-it-pro-blog/the-evolution-of-windows-authentication/ba-p/3926341',
				label: 'Microsoft Windows IT Pro blog'
			}
		},
		{
			date: '2026-10',
			title: 'NTLMv1 SSO blocked by default — BlockNTLMv1SSO enforce',
			description:
				'The `BlockNTLMv1SSO` registry-key default flips from Audit to Enforce on Windows Server 2025 / Win11 24H2 (Phase 3 of {{ntlm|NTLM}} phase-out). NTLMv1 single-sign-on is disabled by default; NTLMv2 remains available but audited. Kerberos is now the only auth {{microsoft|Microsoft}} actually recommends.',
			source: {
				url: 'https://techcommunity.microsoft.com/t5/windows-it-pro-blog/the-evolution-of-windows-authentication/ba-p/3926341',
				label: 'Microsoft Windows IT Pro blog'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Microsoft Active Directory',
			scale: 'Every AD domain on Earth (>500M Windows endpoints, every Fortune 1000)',
			description:
				"Kerberos has been {{ad-active-directory|AD}}'s primary authentication since Windows 2000. Every domain-joined Windows machine, every {{ad-active-directory|AD}}-integrated {{exchange|Exchange}} / Outlook, every SharePoint, every {{sql|SQL}} Server with Windows Authentication runs Kerberos under the hood. The single largest [[kerberos|Kerberos]] deployment ever."
		},
		{
			org: 'MIT Kerberos (krb5)',
			scale: 'The canonical C codebase; ships in every Linux distro',
			description:
				'Maintained by the {{mit|MIT}} Kerberos Consortium ([[pioneer:greg-hudson|Greg Hudson]] as lead). Used by every {{linux|Linux}} distribution, FreeIPA, Hadoop, Spark, [[kafka|Kafka]], and a long tail of enterprise auth. The reference implementation behind {{rfc-doc|RFC}} 4120.'
		},
		{
			org: 'Heimdal',
			scale: "Apple's macOS, Samba, FreeBSD",
			description:
				'{{bsd|BSD}}-licensed alternative to {{mit|MIT}} Kerberos, originated at SU/KTH in Sweden. {{apple|Apple}} used {{mit|MIT}} Kerberos through 10.6 and switched to Heimdal in OS X 10.7 Lion (2011); Samba 4 uses it for {{ad-active-directory|AD}} compatibility. Love Hörnquist Åstrand has been the long-running maintainer.'
		},
		{
			org: 'Hadoop / Spark / Kafka',
			scale: 'Every Cloudera CDH / Hortonworks HDP / Confluent Platform install',
			description:
				'`hadoop.security.authentication = kerberos` is the only path to authenticated jobs at scale in a Hadoop cluster. The 2015–2025 enterprise-Hadoop era ran on krb5 keytabs distributed via Ambari/Cloudera Manager. Spark, Hive, Impala, HBase, ZooKeeper all bind to the same {{kerberos-kdc|KDC}}.'
		}
	],

	funFacts: [
		{
			title: 'Named after the three-headed dog that guards Hades',
			text: "**Cerberus** in Greek mythology had three heads — one for *past*, *present*, and *future*, or for *birth*, *youth*, and *old age*, depending on the source. The three heads are often mapped to the three principals — **client**, **server**, **{{kerberos-kdc|KDC}}** — with the dog's job: nothing crosses without a ticket. Pronounced *KER-ber-os* in English; in modern Greek (Κέρβερος) the β is a /v/, so roughly *KER-ve-ros*."
		},
		{
			title: 'V4 was held back by US export controls',
			text: '[[kerberos|Kerberos]] **Version 4** was released as public open source in the US (~1989), but its DES crypto could not be exported without State Department approval — so {{mit|MIT}} shipped a separate "Bones" distribution with the crypto stubbed out so the rest of the world could build Kerberos-shaped applications. **V5** was first standardized as RFC 1510 (1993) and revised by [[rfc:4120|RFC 4120]] (2005), with multiple cipher suites and extensible principal names; the export era is the reason Kerberos\' early adoption was so US-centric.'
		},
		{
			title: '"AS-REP roasting" is when you forget pre-auth',
			text: "A principal with `DONT_REQUIRE_PREAUTH` flag set can be queried by *anyone* with a network path to the {{kerberos-kdc|KDC}} — no password required. The {{kerberos-kdc|KDC}} returns an {{kerberos-as-rep-acr|AS-REP}} encrypted under the principal's long-term key, which the attacker can then brute-force offline. **{{kerberos-as-rep-acr|AS-REP}} roasting** (Will Schroeder / harmj0y, 2017) is the standard penetration-test move against {{ad-active-directory|AD}} environments where service-account pre-auth was accidentally disabled. Sister technique: **Kerberoasting** (Tim Medin, 2014) requests TGS-REPs for service principals and brute-forces those."
		},
		{
			title: 'Clock skew is the silent killer',
			text: "Default `clockskew` in `krb5.conf` is **±5 minutes**. If a client's clock drifts more than that, every authentication fails with `KRB_AP_ERR_SKEW`. Every enterprise Kerberos outage of the 2010s eventually traced back to [[ntp|NTP]] — broken [[ntp|NTP]] servers, firewalls blocking UDP/123, virtualised {{hosts-bare|hosts}} with drift. The protocol's most operationally fragile dependency isn't crypto; it's time."
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Time skew kills authentication silently',
				text: 'A client whose clock has drifted past `clockskew` (default ±5 minutes) gets `KRB_AP_ERR_SKEW` on every auth attempt — but applications often surface this as a generic "auth failed", and operators end up debugging keytabs and [[dns|DNS]] for hours. **Cure:** every Kerberos host MUST run [[ntp|NTP]] with a tight sync; monitor for skew >1 min; never run KDCs on virtualised hardware without paravirtualised clocks; if clock skew is genuinely unavoidable, widen `clockskew` to ±10 min in `krb5.conf` rather than disabling it.'
			},
			{
				title: 'Service Principal Names (SPNs) must match exactly',
				text: 'The {{spn|SPN}} in the ticket (`{{http-method|HTTP}}/web1.example.com@EXAMPLE.COM`) must match the hostname the client connected to — including capitalisation and [[dns|DNS]] canonicalisation. A client typing `web1` will request a ticket for `{{http-method|HTTP}}/web1.example.com`; if the keytab only has `{{http-method|HTTP}}/web1` registered, the {{kerberos-ap-req-acr|AP-REQ}} fails. **Cure:** register both short and FQDN SPNs in the keytab; set `dns_canonicalize_hostname = false` in `krb5.conf` if your [[dns|DNS]] rewrites unpredictably; use `kvno {{http-method|HTTP}}/web1.example.com` to force-test {{spn|SPN}} resolution.'
			},
			{
				title: 'Weak encryption types still lurk in old keytabs',
				text: 'Every keytab includes a list of {{encryption|encryption}} types the principal supports. Old {{ad-active-directory|AD}} environments have **{{rc4|RC4}} (etype 23, arcfour-hmac)** still enabled — the {{encryption|encryption}} type **Kerberoasting** specifically targets, because {{rc4|RC4}} keys are derived from NT hash and brute-force in hours. **Cure:** set `default_tkt_enctypes = aes256-cts-{{hmac|hmac}}-sha384-192 aes128-cts-{{hmac|hmac}}-sha256-128` in `krb5.conf`; remove {{rc4|RC4}} from the supported list with `Set-ADUser -KerberosEncryptionType AES128,AES256`; audit with {{wireshark|Wireshark}} filter `kerberos.etype == 23` to find any remaining {{rc4|RC4}} traffic.'
			}
		]
	}
};
