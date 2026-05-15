---
id: kerberos
type: protocol
name: Kerberos
abbreviation: krb5
etymology: "[K]erberos (Greek Kerberos / Latin Cerberus — the three-headed dog of Hades)"
category: utilities
year: 1988
rfc: RFC 4120
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters: []
related_protocols: [udp, tcp, tls, oauth2, ssh, ntp, dns, http1]
related_pioneers: [clifford-neuman, greg-hudson]
related_outages: []
related_frontier: []
related_rfcs: [4120, 2743, 4178]
related_journeys: []
images:
  - src: https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Cerberus-Blake.jpeg/500px-Cerberus-Blake.jpeg
    caption: William Blake's Cerberus, c.1825. The three-headed dog from Greek mythology that guards the gates of Hades is the namesake of the protocol designed at MIT Project Athena in 1983 — three heads for client, server, and Key Distribution Center.
    credit: Image — Wikimedia Commons / Public Domain (William Blake, c.1825)
visual_cues:
  - "The six-message Kerberos sequence diagram across three columns labelled Client, KDC, and Service. AS-REQ and AS-REP between Client and KDC, then TGS-REQ and TGS-REP between Client and KDC, then AP-REQ and AP-REP between Client and Service. Each arrow colour-coded by which key encrypts the payload — long-term key in red, krbtgt key in dark blue, session key in green."
  - "An exploded view of an AS-REP showing two encrypted blobs side by side: on the left the TGT, sealed with the krbtgt key and labelled 'only the KDC can open this'; on the right the enc-part, sealed with Alice's long-term key and labelled 'only Alice can open this'. The shared session key sits in both, glowing."
  - "A timeline running 1983 → 2026 with five anchor points: Project Athena (1983), Steiner-Neuman-Schiller USENIX paper (1988), Windows 2000 ships AD with Kerberos (2000), Tim Medin invents Kerberoasting at DerbyCon (2014), MIT krb5 1.22 ships PKINIT ECDH and IAKerb (August 2025)."
  - "A diagram of NTP feeding clocks at every Kerberos node — Client, KDC, Service — with a 5-minute skew window drawn as a green band. A drifting client clock outside the band shows a red KRB_AP_ERR_SKEW error blocking auth. Caption: 'The protocol's most operationally fragile dependency isn't crypto. It's time.'"
  - "Four attack panels arranged as a quadrant: AS-REP roasting (no pre-auth → offline crack), Kerberoasting (request RC4 service ticket → offline crack), Golden Ticket (steal krbtgt hash → forge any TGT), Bronze Bit (flip the forwardable bit on a service ticket). Each panel shows the protocol step abused and the patch year that closed it."
  - "A 2026 Microsoft NTLM phase-out roadmap as a horizontal bar: enhanced auditing (2025), IAKerb + Local KDC GA (2026 H2), BlockNTLMv1SSO Audit-to-Enforce flip (October 2026). Kerberos is the only remaining recommended auth on the right edge of the chart."
---

# Kerberos — The Three-Headed Dog That Guards Every Enterprise Network

## In one breath

Kerberos is a network authentication protocol built on tickets — short-lived, encrypted credentials minted by a trusted third party called the Key Distribution Center, or KDC — that lets a client prove its identity to a service without ever sending a password and without the service ever calling back to the KDC. Symmetric cryptography plus a shared clock; that is the whole trick. In 2026 it is still the load-bearing authentication primitive of the enterprise world: every Active Directory domain on Earth, every Hadoop and Kafka cluster running SASL/GSSAPI, every NFSv4 mount with sec=krb5p, and Apple's Heimdal-derived stack.

## The pitch (cold-open)

Forty-five years ago a team at MIT Project Athena needed a way for thousands of untrusted Unix workstations in the public computer cluster to prove who was actually at the keyboard — without sending a password to a machine they could not trust. They built a trusted third party, a ticket system, and named the whole thing after Cerberus, the three-headed dog that guards the gates of Hades. The protocol they shipped in 1988 is what every Active Directory domain on Earth — more than 500 million Windows endpoints, every Fortune 1000 — runs underneath today. And in 2026 it is finally about to absorb the last cases NTLM was holding onto.

## How it actually works

The mental model is one ticket per service, one session key per ticket, and a timestamped authenticator you sign every time you actually use the ticket. The KDC issues tickets. It never sees the application traffic.

When Alice logs in with `kinit alice@EXAMPLE.COM`, her client encrypts the current timestamp with a key derived from her password and sends that — the PA-ENC-TIMESTAMP — inside an AS-REQ to the KDC's Authentication Service on UDP port 88. The KDC looks up Alice's long-term key in its database, verifies the timestamp, mints a fresh session key, and returns an AS-REP containing two encrypted blobs. The first is the Ticket Granting Ticket, or TGT, encrypted under the krbtgt principal's key — only the KDC can ever decrypt it. The second is the session key, encrypted under Alice's long-term key — only Alice can decrypt that. Alice's password never crosses the wire.

When Alice wants to talk to a web server — `HTTP/web1.example.com` — her client sends a TGS-REQ to the KDC's Ticket Granting Service. The request carries the TGT plus a fresh authenticator timestamp encrypted under the TGT's session key. The KDC decrypts the TGT (it knows the krbtgt key), validates the authenticator, mints a new session key for Alice and web1, and returns a TGS-REP. Inside it: a service ticket encrypted under web1's keytab key, plus the new session key encrypted under the previous TGT's session key.

Now Alice connects to web1 over HTTPS or SMB or NFS or SSH and sends an AP-REQ — the service ticket plus a fresh authenticator. web1 reads its keytab from disk, finds the right key version and encryption type, decrypts the ticket, extracts the session key, decrypts the authenticator. If the timestamp is within the 5-minute skew window and the sequence number has not been seen before, Alice is authenticated. There is no round trip to the KDC at this step. If Alice asked for mutual auth, web1 returns an AP-REP containing its own encrypted timestamp so Alice knows she is talking to the real web1 — the one with the right keytab — and not an impostor.

For cross-realm: when Alice in EXAMPLE.COM wants a service in PARTNER.COM, her local KDC issues a referral TGT for the krbtgt/PARTNER.COM principal, encrypted under a cross-realm shared key. Alice presents that to the PARTNER.COM KDC and gets a service ticket. The trust topology is just a graph of shared keys between krbtgt principals — the same mechanism Active Directory uses to scale to forests.

Applications almost never speak Kerberos directly. They speak GSS-API — the Generic Security Service API from RFC 2743 — and call `gss_init_sec_context` and `gss_accept_sec_context`. SPNEGO, RFC 4178, is the negotiation layer that lets HTTP, SMB, LDAP, and other applications transparently use Kerberos when available and fall back to NTLM or OAuth when not. Every "Windows Integrated Authentication" prompt in Edge or Chrome is SPNEGO over HTTP wrapping a Kerberos AP-REQ.

### Header at a glance

Kerberos messages are ASN.1 DER, identified by an APPLICATION tag. The six core messages are:

- **AS-REQ** (`[APPLICATION 10]`): protocol version 5, message type 10, padata (PA-ENC-TIMESTAMP and others), then a request body with kdc-options, client name, realm, requested service name (`krbtgt/REALM` for an initial ask), expiry, nonce, and the list of supported encryption types.
- **AS-REP** (`[APPLICATION 11]`): the TGT plus the enc-part — the session key, expiry, flags — encrypted under the client's long-term key.
- **TGS-REQ** (`[APPLICATION 12]`): same shape as AS-REQ, but the padata carries a PA-TGS-REQ wrapping an AP-REQ over the TGT.
- **TGS-REP** (`[APPLICATION 13]`): the service ticket plus the new session key encrypted under the TGT's session key.
- **AP-REQ** (`[APPLICATION 14]`): ap-options (including `mutual-required`), the ticket, and an authenticator carrying client realm, client name, microseconds, current time, sequence number, and an optional sub-session key.
- **AP-REP** (`[APPLICATION 15]`): the server's encrypted echo of the client's timestamp, optionally with a sub-session key — proof the server held the right keytab key.

There are also `KRB-SAFE` (APPLICATION 20) for integrity-protected payloads, `KRB-PRIV` (APPLICATION 21) for integrity plus confidentiality, `KRB-CRED` (APPLICATION 22) for forwarding tickets between processes, and `KRB-ERROR` (APPLICATION 30), which is unencrypted and unauthenticated — an acknowledged limitation in RFC 4120.

KDC traffic runs on UDP port 88 by default, with TCP port 88 fallback when the message exceeds `udp_preference_limit` (about 1465 bytes by default in MIT). `kpasswd` lives on UDP and TCP port 464. Since MIT krb5 1.22 in August 2025, Unix-domain sockets are also supported for in-host KDC traffic.

### State machine in three sentences

The client lives in one of five states: NoCreds, ASExchange, TGTHeld, TGSExchange, AuthenticatedSession — with TGTRenewal as a side excursion when a renewable TGT is approaching expiry. From NoCreds you do an AS exchange and either land back at NoCreds (bad password, clock skew) or arrive at TGTHeld with a TGT cached in `/tmp/krb5cc_<UID>`. From there each application call drives a TGSExchange that either populates a service ticket and goes to AP exchange, or expires you all the way back to NoCreds when renew-till runs out.

### Reliability, freshness, and security mechanics

Three things keep Kerberos honest. First, every long-term key — the user's password-derived key, the krbtgt key, every service keytab key — is symmetric. Tickets are encrypted under the service's key; session keys are encrypted under the client's key. Knowledge of one key never reveals another. Second, freshness comes from timestamps inside the authenticator. The server checks that the client's `ctime` is within `clockskew` (default 300 seconds) and that the sequence number has not been seen before. That is the entire replay defence. Third, pre-authentication is mandatory in modern deployments — the client must encrypt the current timestamp under its long-term key before the KDC will issue a TGT, which is why an attacker cannot just request an AS-REP for a random user and brute-force it offline. (When that pre-auth requirement is accidentally turned off, the result is AS-REP roasting.)

Modern hardening lives in two RFCs: **PKINIT** (RFC 4556, 2006, with algorithm agility added in RFC 8636 in 2019) replaces the password-derived long-term key with an X.509 certificate, which is how smart-card logon and Windows Hello for Business work. **FAST** (RFC 6113, 2011) tunnels pre-authentication inside an armor TGT so a weak user password cannot be brute-forced from a captured AS-REP. After AES-only enctypes, FAST is the single most cost-effective defence in the protocol.

The encryption types you actually want in 2026 are AES-256-CTS-HMAC-SHA384-192 (etype 20) and AES-128-CTS-HMAC-SHA256-128 (etype 19), both standardised in RFC 8009 in 2017. The ones you want gone are RC4-HMAC (etype 23), DES-CBC-CRC (etype 1), and DES-CBC-MD5 (etype 3). MIT krb5 1.21, in June 2023, stopped issuing 3DES and RC4 session keys by default, and Microsoft is on a parallel RC4-retirement glide path landing in 2026 cumulative updates.

## Where it shows up in production

**Microsoft Active Directory.** Every AD domain on Earth — north of 500 million Windows endpoints, every Fortune 1000 — has used Kerberos as primary authentication since Windows 2000 shipped in February 2000. Every domain-joined Windows machine, every AD-integrated Exchange and Outlook, every SharePoint, every SQL Server with Windows Authentication runs Kerberos under the hood. This is the single largest Kerberos deployment in history and the reason the protocol matters in 2026.

**MIT krb5.** The reference C codebase, maintained by the MIT Kerberos Consortium with Greg Hudson as release engineer since the mid-2010s. Ships in every Linux distribution. Used by FreeIPA, Hadoop, Spark, Kafka, NFSv4, and a long tail of enterprise auth. Recent releases — 1.21 in 2023, 1.21.3 in June 2024 (the CVE-2024-37370 / CVE-2024-37371 fix for GSS message-token bugs), 1.22 in August 2025 — set the ground truth on how the protocol actually behaves.

**Heimdal.** The BSD-licensed alternative, started in Sweden in May 1992 — the project's name is a Nordic nod, and the work descends directly from the "Bones" / "eBones" non-US Kerberos releases of the export-control era. Apple has shipped Heimdal in every macOS from 10.5 onward (2007) as `com.apple.Kerberos.kdc`. Samba 4 uses it for AD-DC compatibility. Long-running maintainer: Love Hörnquist Åstrand. Heimdal 7.7.1, in November 2022, shipped fixes for CVE-2022-44640 — a potential CVSS-10 RCE in the KDC ASN.1 CHOICE codec.

**Hadoop, Spark, Kafka, Hive, Impala, HBase, ZooKeeper.** In every Cloudera CDH, Hortonworks HDP, and Confluent Platform install. `hadoop.security.authentication = kerberos` is the only path to authenticated jobs at scale in a Hadoop cluster, and `security.protocol=SASL_SSL` with `sasl.mechanism=GSSAPI` is the standard production pattern for on-prem Kafka. The 2015–2025 enterprise-Hadoop era ran on krb5 keytabs distributed via Ambari and Cloudera Manager.

**FreeIPA / Red Hat IdM.** MIT krb5 plus 389-DS LDAP plus Dogtag CA plus integrated DNS via BIND. Tens of thousands of RHEL and Fedora environments. RHEL IdM works fine for a few hundred users out of the box and tunes well to thousands of users, hundreds of hosts, and dozens of replicas.

**MIT Project Athena.** Still operational at MIT in 2026, four decades after the protocol was designed there. The `ATHENA.MIT.EDU` realm and the `kerberos.mit.edu` KDCs have been running continuously since 1988.

**University SSO.** Stanford, MIT, CMU, U-Mich, U-Washington, U-Penn, Iowa State, Carnegie Mellon, Columbia, Cornell — all identified as past sponsors of the MIT Kerberos Consortium and all built on krb5 (with Stanford historically running Heimdal in parallel).

**SSH.** `GSSAPIAuthentication yes` plus `GSSAPIDelegateCredentials yes` lets a user's TGT log them into SSH inside a realm without typing a password. The mechanism name is `gssapi-with-mic` (RFC 4462).

## Things that go wrong

**Thanksgiving 2014 — MS14-068, CVE-2014-6324.** The Active Directory KDC was supposed to validate the PAC signature on every incoming ticket using one of three valid algorithms — HMAC-MD5 for RC4, HMAC-SHA1-AES-128, HMAC-SHA1-AES-256. Inside `kdcsvc.dll` on Server 2008 R2 and earlier, the function `KdcVerifyPacSignature` accepted any signature whose size was 20 bytes or less — including non-keyed plain MD5. An authenticated domain user could request a TGT without a PAC, forge a PAC asserting Domain Admins membership, sign it with plain MD5, submit it in a TGS-REQ's `enc-authorization-data` field, and receive back a TGT containing the forged PAC fully blessed by the KDC. Any domain user to Domain Admin in seconds. Exploited in the wild before disclosure. Microsoft shipped an out-of-band patch on November 18, 2014 — the Tuesday before Thanksgiving — restricting accepted signature types to the proper keyed variants. The same class of bug — checksum trust — had surfaced as MS11-013 / CVE-2011-0043 three years earlier.

**Kerberoasting — Tim Medin, DerbyCon 2014.** A service ticket's `enc-part` is encrypted with the service account's long-term key. Any authenticated user may request a service ticket for any SPN — the KDC does not check the requester will actually use the service. AD service accounts historically have human-set passwords, often weak; for backward compatibility Microsoft issues service tickets with RC4-HMAC-MD5 (etype 23), derived directly from the account's NTLM hash — exactly the offline-crackable shape. Result: any domain user enumerates SPNs over LDAP, requests tickets via `Rubeus kerberoast` or Impacket's `GetUserSPNs.py`, dumps the RC4 blob, cracks it with hashcat — no traffic to the target service, no logs at the target. The 2021 Conti playbook leak confirmed Kerberoasting as Job One for ransomware affiliates: the operator manuals instruct the team to "prefer the Kerberoasting attack if a large volume of more than 3k hosts is discovered." The defences are gMSA accounts (240-byte rotating passwords, impossible to crack in the rotation window), AES-only via `msDS-SupportedEncryptionTypes`, and event 4769 alerts on `Ticket Encryption Type = 0x17`. Microsoft's 2026 RC4-retirement track ultimately removes the offending etype.

**AS-REP roasting — same vintage, smaller blast radius.** A principal with `DONT_REQ_PREAUTH` set can be queried by anyone with a network path to the KDC — no password required. The KDC returns an AS-REP encrypted under the principal's long-term key, and the attacker cracks it offline. Discovered by `GetNPUsers.py` or `Rubeus asreproast`. The fix is one line of policy: never set `DONT_REQ_PREAUTH`.

**Golden Ticket and Silver Ticket — Mimikatz / Sean Metcalf.** If you possess the krbtgt account's long-term key, you can forge any TGT — a Golden Ticket — that the KDC will bless forever. If you possess a service account's key, you can forge any service ticket for that service — a Silver Ticket. KRBTGT password rotation in many enterprises is essentially never. A DC compromise plus a DCSync gives a forever-persistent backdoor. The fix is operational, not cryptographic: rotate KRBTGT twice with a gap longer than the maximum TGT lifetime — once is not enough, because the KDC keeps the previous key (kvno N-1) to validate in-flight tickets — every six months, and immediately after any suspected DC compromise. Microsoft ships `Reset-KrbtgtKeyInteractive.ps1` for it.

**NoPac — CVE-2021-42278 plus CVE-2021-42287, November 2021.** Active Directory machine accounts conventionally end with `$` (`DC01$`). On TGS-REQ, if the KDC cannot find the requested service it retries with `$` appended. Two bugs: AD did not validate that machine `sAMAccountName`s actually end in `$` (42278), and the `$`-retry fallback (42287) allowed name confusion. Seven steps from any domain user to Domain Admin: create a machine account `bob$`, rename its sAMAccountName to `DC01`, get a TGT for `DC01`, reset the name back, request S4U2Self, the KDC retries with `$` and returns a service ticket for `DC01$` — the domain controller — then DCSync. Sixteen seconds in Secureworks' demo video. Patched in the November 9, 2021 cumulative updates: KB5008102 prevents arbitrary sAMAccountName modifications, KB5008380 adds the original-requester PAC structure that closes 42287.

**Bronze Bit — CVE-2020-17049, November 2020.** Discovered by Jake Karnes at NetSPI. S4U2Self produces a ticket marked non-forwardable when the user is in Protected Users or marked sensitive. But the KDC-options flags inside that ticket are encrypted only under the service's long-term key — not also signed by the KDC. A service whose hash is compromised can decrypt the ticket, flip the `forwardable` bit, re-encrypt, and the next S4U2Proxy validation accepts it. Compromise of one constrained-delegation service account becomes impersonation of any user, including the protected ones. Patches landed November and December 2020; full enforcement May 11, 2021. The MS-SFU spec was revised to require both server and KDC PAC signature verification on the evidence ticket.

**CVE-2022-37967 — PAC signature, again.** S4U2Proxy requires an evidence ticket whose PAC carries valid server and KDC signatures. The signatures did not cover the full PAC structure. KB5020805 added a full PAC checksum on a phased Audit-to-Enforce rollout through 2022 and 2023, and Microsoft set a permanent enforcement deadline of September 9, 2025 for the strong certificate-binding companion change.

**Skeleton Key, January 2015.** Documented and named by Dell SecureWorks. An attacker with Domain Admin patches the LSASS process on a domain controller in memory, installing a master password the KDC accepts in addition to every legitimate password. No AD object change to detect — only forensic memory analysis or LSA Protection (RunAsPPL). Reboot of the DC clears it. The malware is memory-resident.

## Common pitfalls (for the practitioner)

**Time skew kills authentication silently.** A client whose clock has drifted past `clockskew` (default 300 seconds) gets `KRB_AP_ERR_SKEW` on every auth attempt — but applications often surface that as a generic "auth failed", and operators end up debugging keytabs and DNS for hours. Every enterprise Kerberos outage of the 2010s eventually traced back to NTP — broken NTP servers, firewalls blocking UDP port 123, virtualised hosts with clock drift after suspend or migration. The cure: every Kerberos host runs NTP or chrony with monitoring; alert on skew over one minute; never run KDCs on virtualised hardware without paravirtualised clocks. If skew is genuinely unavoidable, widen `clockskew` to 600 seconds in `krb5.conf` rather than disabling it.

**Service Principal Names must match exactly.** The SPN inside the ticket — `HTTP/web1.example.com@EXAMPLE.COM` — must match the hostname the client connected to, including capitalisation and DNS canonicalisation. A client typing `web1` will request a ticket for `HTTP/web1.example.com`; if the keytab only registers `HTTP/web1`, the AP-REQ fails. Cure: register both short and FQDN SPNs in the keytab, set `dns_canonicalize_hostname = false` in `krb5.conf` if your DNS rewrites unpredictably, use `kvno HTTP/web1.example.com` to force-test SPN resolution, and run `setspn -X` regularly to find duplicates.

**Realm-name case is the single most common misconfiguration.** Realms are case-sensitive in Kerberos. `ATHENA.MIT.EDU` is not `athena.mit.edu`. Always uppercase your realm names everywhere — `/etc/krb5.conf`, DNS, keytab — and never mix.

**Reverse-DNS dependency.** Historical default was `rdns = true`. If reverse DNS returns a different name than the SPN, the client requests a ticket for the wrong service and you get "Server not found in Kerberos database." Set `rdns = false` in `[libdefaults]` and align your A and PTR records.

**Weak encryption types lurking in old keytabs.** Every keytab carries a list of supported enctypes. Old AD environments still have RC4 enabled — exactly what Kerberoasting targets, because RC4 keys derive from the NT hash and brute-force in hours. Cure: set `default_tkt_enctypes = aes256-cts-hmac-sha384-192 aes128-cts-hmac-sha256-128` and `permitted_enctypes` to the AES family in `krb5.conf`; remove RC4 from the supported list with `Set-ADUser -KerberosEncryptionType AES128,AES256`; never set `allow_weak_crypto = true`. Audit with the Wireshark filter `kerberos.etype == 23` to find any remaining RC4 traffic.

**Pre-auth disabled per-account.** An admin-set `DONT_REQ_PREAUTH` flag on a user account is an open invitation to AS-REP roasting. Audit it during pentest scoping; remove it.

**KRBTGT never rotated.** Rotate twice (with a gap longer than the maximum TGT lifetime) every six months, and immediately after any DC compromise. Use `Reset-KrbtgtKeyInteractive.ps1`.

## Debugging it

The MIT toolchain is the canonical entry point: `kinit alice@EXAMPLE.COM` runs an AS exchange (interactive password or PKINIT smart card); `klist` shows cached tickets; `klist -e` adds the encryption type for each one — invaluable when you want to confirm AES is actually being negotiated; `klist -f` shows ticket flags (F = forwardable, R = renewable, A = pre-authenticated); `kvno HTTP/web1.example.com` forces a TGS-REQ to populate the cache and is the cheapest way to test an SPN; `kdestroy` wipes the cache. Server-side, `ktutil` reads and edits keytab files: `ktutil:  read_kt /etc/krb5.keytab` followed by `list -e -k` shows every `(principal, kvno, enctype, key-bytes)` tuple. The keytab is the crown jewel on every web and file server — protect it like a private key.

For HTTP, `curl --negotiate -u : https://web1.example.com/` rides SPNEGO over the user's existing TGT. For SSH, `ssh -K user@host` enables GSSAPI delegation.

In Wireshark, the dissector is excellent. The filters you actually want:

- `kerberos` — every Kerberos packet on the wire.
- `kerberos.msg_type == 10` — AS-REQ only; `== 11` AS-REP, `== 12` TGS-REQ, `== 13` TGS-REP, `== 14` AP-REQ, `== 15` AP-REP, `== 30` KRB-ERROR.
- `kerberos.realm == "EXAMPLE.COM"` — scope to a realm.
- `kerberos.CNameString == "alice"` — by client principal.
- `kerberos.etype == 23` — flag any RC4-HMAC use, the Kerberoasting candidate.

For Active Directory operations, enable Audit Kerberos Service Ticket Operations. Event 4769 logs every TGS-REQ; alert when `Ticket Encryption Type` is 0x17 outside an explicit allow-list. Event 4768 covers TGT issuance. Event 4624 with logon type 3 and `Authentication Package: Kerberos` confirms a successful Kerberos logon. For NoPac detection: event 4781 with `OldTargetUserName: *$` and `NewTargetUserName: not *$`. For Kerberoast reconnaissance specifically: `Rubeus.exe kerberoast /stats` enumerates Kerberoastable accounts without requesting any tickets — useful both for offence and for defensive baselining.

Configuration levers worth knowing in `/etc/krb5.conf`: `clockskew = 300` (seconds — the freshness window), `udp_preference_limit` (~1465 bytes — the UDP-to-TCP fallback threshold), `ticket_lifetime` (24h on MIT, 10h on AD), `renew_lifetime` (7 days on AD), `permitted_enctypes` (lock to AES), `rdns = false`, `dns_canonicalize_hostname = false`. Enable FAST whenever both client and KDC support it.

## What's changing in 2026

**October 2026 — NTLMv1 SSO blocked by default.** The `BlockNTLMv1SSO` registry default flips from Audit to Enforce on Windows Server 2025 and Windows 11 24H2 — Phase 3 of Microsoft's NTLM phase-out. NTLMv1 single sign-on is disabled by default; NTLMv2 stays available but audited. Kerberos becomes the only auth Microsoft actually recommends.

**Second half of 2026 — IAKerb and Local KDC GA.** Phase 2 of the NTLM phase-out. IAKerb (Initial and Pass-Through Authentication using Kerberos) lets clients authenticate through a relay when they cannot reach a KDC directly — exactly the case NTLM was holding onto. Local KDC brings Kerberos to workgroup machines with no domain join. MIT krb5 1.22 already ships an IAKerb implementation that complies with the latest IETF draft and supports realm discovery without DNS.

**September 9, 2025 — strong certificate binding enforced.** Microsoft's permanent enforcement deadline for strong certificate binding on Active Directory Domain Controllers, closing the long-tail of the CVE-2022-37967 / Bronze-Bit class. After this date, AD DCs refuse PKINIT with weakly-bound certs by default.

**August 2025 — MIT krb5 1.22.** Headline features: PKINIT ECDH and elliptic-curve client certs (smart-card auth on Curve25519 and P-384), `paChecksum2` support to retire SHA-1 in FAST armoring, IAKerb with realm discovery without DNS, the first Unix-domain socket KDC transport, systemd socket activation, a new `request_timeout` libdefault, and a `GSS_C_CHANNEL_BOUND` flag for strict channel-binding enforcement. The initial 1.22 was withdrawn on August 17 for a critical vulnerability and re-issued as 1.22.2 — a rare event for a project this conservative.

**June 2024 — MIT krb5 1.21.3 (CVE-2024-37370 / CVE-2024-37371).** Critical GSS message-token handling bugs in the MIT codebase: an out-of-bounds write in `gss_unwrap` triggerable by a malformed token, and a related integrity bypass. Patched in 1.21.3, picked up downstream by every Linux distro within days.

**Microsoft's RC4 retirement.** A parallel track to the NTLM phase-out, landing in 2026 cumulative updates. The auditing tools `List-AccountKeys.ps1` and `Get-KerbEncryptionUsage.ps1` are already in the public `Microsoft/Kerberos-Crypto` GitHub repository. By the end of 2026 most enterprise tooling that still depends on RC4-HMAC will break.

**Post-quantum Kerberos — pre-draft.** Engineer guidance lives in `draft-ietf-pquip-pqc-engineers-14` (August 2025). TLS already has hybrid ML-KEM landing (`draft-ietf-tls-mlkem`) and IPsec has KEM-based authentication drafts. The KITTEN working group does not yet have a published post-quantum Kerberos draft as of May 2026, but the architectural direction is broadly understood: hybrid PQ KEM inside PKINIT key establishment via the RFC 8636 algorithm-agility framework. Lattice public keys and ciphertexts will balloon AS-REQ and AS-REP sizes well past common UDP MTU, forcing TCP and Unix-domain-socket transport as the default. MIT 1.22's TCP-first behaviour and `request_timeout` are partial preparation. Expect a KITTEN draft cycle through 2026 and 2027.

## Fun facts (host material)

**The three heads.** Cerberus in Greek mythology had three heads — for past, present, and future, or for birth, youth, and old age, depending on the source. (Hesiod's Theogony in the 8th–7th century BCE actually gave him fifty heads, with a serpent tail and a lion's mane in some classical sources.) The MIT team picked "three" because the protocol has three principals — client, server, KDC — and the marketing fit better than the mythology. Pronounced KER-ber-os in English; KEHR-ber-os in modern Greek.

**Bones and eBones.** Because US export controls forbade exporting DES code in 1989, MIT released V4 with the cryptography stripped out — the "Bones" of the protocol. Outside-US developers, especially in Sweden, re-implemented DES locally and re-linked, producing "eBones." This is why early Kerberos adoption was so US-centric. The Heimdal project descends directly from that Nordic origin — its name is a Norse mythology nod, and the project was started "largely in Sweden, which was important when we started writing it."

**The PAC controversy of 2000.** When Microsoft shipped Kerberos in Windows 2000, they added the proprietary PAC — Privilege Attribute Certificate, the SID and group-membership blob — inside Kerberos's standardised `authorization-data` field. Microsoft initially refused to publish the PAC structure, demanding an NDA-license click-through to even view it. A famous moment in open-standards politics. The structure is now openly documented as `[MS-PAC]` — the same spec abused by every PAC vulnerability in the last decade.

**Mimikatz.** Benjamin "gentilkiwi" Delpy started Mimikatz in 2007 as a hobby project to demonstrate `WDigest` storing plaintext passwords in LSASS memory. Within a decade it became the central Kerberos-abuse tool of the 2010s — Pass-the-Hash, Pass-the-Ticket, Golden Ticket, Silver Ticket, DCSync, Skeleton Key are all Mimikatz primitives. Delpy presented it at BlueHat IL in 2014; the Conti playbook leak in 2021 confirmed it as the operational ground truth of every modern intrusion.

**MIT 1.22 was withdrawn five days after release.** MIT krb5 1.22 shipped August 5, 2025 and was pulled on August 17 due to a critical vulnerability before re-release as 1.22.2. A rare event for a project this conservative, and a useful reminder that "stable LTS" is never quite that.

**Kerberos depends on NTP more than it depends on AES.** The protocol's most operationally fragile dependency is not its cryptography. It is wall-clock time. A client whose clock drifts more than five minutes from the KDC fails every authentication. Every enterprise Kerberos outage of the 2010s eventually traced back to NTP — bad upstream servers, firewalls blocking UDP port 123, virtualised hosts without paravirtualised clocks.

## Where this connects in the book

The dump lists no book chapters that reference Kerberos directly. The historical and contextual narrative — Project Athena, Saltzer and Schroeder's principles, the Microsoft adoption, the decade of exploitation — currently lives in this episode. If chapter coverage is added later, defer the storytelling there and keep this blueprint focused on mechanism, production, and what is changing.

## See also (other protocol episodes)

The dump does not ship any explicit comparison cards for Kerberos, but the most important neighbours are these.

**Kerberos versus OAuth 2.0.** The cleanest contrast in identity. Kerberos tickets are cryptographically bound to a session key the holder must also possess; OAuth bearer tokens are pure capability tokens — whoever has the bytes wins. Kerberos lives below GSS-API and is protocol-agnostic, sitting on UDP and TCP port 88; OAuth lives at the application layer over HTTPS. Kerberos depends on a centralised KDC and is the right answer inside a corporate network; OAuth scales horizontally and is the right answer for SaaS, mobile, and federated APIs. Modern Microsoft hybrid stacks use Primary Refresh Tokens to broker between Entra ID OAuth tokens and on-prem Kerberos TGTs. If you have heard the OAuth 2.0 episode, the contrast is everything.

**Kerberos and TLS.** Different trust models. TLS uses PKI — X.509 certificates rooted in a CA hierarchy. Kerberos uses realm and KDC shared keys. They meet in two places: PKINIT bridges PKI into Kerberos initial auth, and HTTPS-plus-Negotiate runs SPNEGO and Kerberos over TLS for SSO. Kerberos does not provide forward secrecy on its own — RFC 4120 is explicit that applications needing forward secrecy must layer TLS or a Diffie-Hellman exchange underneath.

**Kerberos and NTP.** A soft dependency that is harder than it looks. Kerberos requires clocks within `clockskew` (default 300 seconds), or the authenticator timestamp check fails. Every story about "the new VM cannot authenticate" eventually traces back to ntpd. The NTP episode's discussion of monotonic time and pool drift is directly relevant operational ground truth here.

**Kerberos and DNS.** A hard dependency. KDC discovery uses SRV records — `_kerberos._tcp.REALM`, `_kerberos._udp.REALM`, `_kpasswd._udp.REALM`. Reverse-DNS lookups for SPN canonicalisation are the most common Kerberos misconfiguration in the field.

**Kerberos and SSH.** The cleanest application binding. `GSSAPIAuthentication yes` plus `GSSAPIDelegateCredentials yes` lets a Kerberos TGT log you into SSH inside a realm without typing a password — RFC 4462's `gssapi-with-mic` mechanism.

**Kerberos and HTTP.** Every "Windows Integrated Authentication" prompt in Edge, Chrome, or Firefox is `Authorization: Negotiate <base64>` — SPNEGO over HTTP wrapping a Kerberos AP-REQ. No Kerberos library in the browser; the OS credential cache does the work.

**Kerberos and UDP / TCP.** The transport choice is operational, not theoretical. UDP port 88 is preferred until the KDC message exceeds `udp_preference_limit` — typically about 1465 bytes — at which point clients fall back to TCP port 88. PKINIT messages and post-quantum hybrid messages routinely cross that threshold, which is why MIT 1.22's Unix-domain socket transport and TCP-first behaviour are partial preparation for the PQ era.

## Visual cues for image generation

- The six-message Kerberos sequence diagram across three columns labelled Client, KDC, and Service. AS-REQ and AS-REP between Client and KDC, then TGS-REQ and TGS-REP between Client and KDC, then AP-REQ and AP-REP between Client and Service. Each arrow colour-coded by which key encrypts the payload — long-term key in red, krbtgt key in dark blue, session key in green.
- An exploded view of an AS-REP showing two encrypted blobs side by side: on the left the TGT, sealed with the krbtgt key and labelled "only the KDC can open this"; on the right the enc-part, sealed with Alice's long-term key and labelled "only Alice can open this." The shared session key sits in both, glowing.
- A timeline running 1983 through 2026 with five anchor points: Project Athena (1983), Steiner-Neuman-Schiller USENIX paper (1988), Windows 2000 ships AD with Kerberos (2000), Tim Medin invents Kerberoasting at DerbyCon (2014), MIT krb5 1.22 ships PKINIT ECDH and IAKerb (August 2025).
- A diagram of NTP feeding clocks at every Kerberos node — Client, KDC, Service — with the 5-minute skew window drawn as a green band. A drifting client clock outside the band shows a red `KRB_AP_ERR_SKEW` error blocking auth. Caption: "The protocol's most operationally fragile dependency isn't crypto. It's time."
- Four attack panels arranged as a quadrant: AS-REP roasting (no pre-auth, offline crack), Kerberoasting (request RC4 service ticket, offline crack), Golden Ticket (steal krbtgt hash, forge any TGT), Bronze Bit (flip the forwardable bit on a service ticket). Each panel shows the protocol step abused and the patch year that closed it.
- A 2026 Microsoft NTLM phase-out roadmap as a horizontal bar: enhanced auditing (2025), IAKerb plus Local KDC GA (2026 H2), `BlockNTLMv1SSO` Audit-to-Enforce flip (October 2026). Kerberos is the only remaining recommended auth on the right edge of the chart.

## Sources

### RFCs

- [RFC 4120 — The Kerberos Network Authentication Service (V5)](https://www.rfc-editor.org/rfc/rfc4120)
- [RFC 4120 (datatracker)](https://datatracker.ietf.org/doc/rfc4120/)
- [RFC 4120 full text (IETF)](https://www.ietf.org/rfc/rfc4120.txt)
- [RFC 4120 explorer (Tech Invite, page 3)](https://www.tech-invite.com/y40/tinv-ietf-rfc-4120-3.html)
- [RFC 4120 explorer (page 4)](https://www.tech-invite.com/y40/tinv-ietf-rfc-4120-4.html)
- [RFC 4120 explorer (page 5)](https://www.tech-invite.com/y40/tinv-ietf-rfc-4120-5.html)
- [RFC 8636 — PKINIT Algorithm Agility](https://www.rfc-editor.org/rfc/rfc8636.html)
- [RFC 8636 (datatracker)](https://datatracker.ietf.org/doc/rfc8636/)
- [draft-ietf-pquip-pqc-engineers — Post-Quantum Cryptography for Engineers](https://datatracker.ietf.org/doc/draft-ietf-pquip-pqc-engineers/)
- [draft-ietf-tls-mlkem — ML-KEM for TLS 1.3](https://datatracker.ietf.org/doc/draft-ietf-tls-mlkem/)
- [draft-wang-ipsecme-kem-auth-ikev2-02](https://datatracker.ietf.org/doc/draft-wang-ipsecme-kem-auth-ikev2/02/)

### Papers and historical references

- [Steiner, Neuman, Schiller — Kerberos: An Authentication Service for Open Network Systems (USENIX Winter 1988)](https://people.eecs.berkeley.edu/~prabal/resources/osprelim/SNS88.pdf)
- [Neuman and Ts'o — Kerberos: An Authentication Service for Computer Networks (IEEE 1994)](https://gost.isi.edu/publications/kerberos-neuman-tso.html)
- [MIT Kerberos Papers index](https://web.mit.edu/kerberos/papers.html)

### Vendor and engineering blogs

- [MIT Kerberos](https://web.mit.edu/kerberos/)
- [MIT krb5 1.21 release notes](https://web.mit.edu/kerberos/krb5-1.21/krb5-1.21.html)
- [MIT krb5 1.21.3 README](https://web.mit.edu/kerberos/krb5-1.21/README-1.21.3.txt)
- [MIT krb5 1.22 announcement](https://mailman.mit.edu/pipermail/kerberos/2025-August/023271.html)
- [MIT krb5 1.22 README](http://web.mit.edu/kerberOS/krb5-1.22/README-1.22.txt)
- [MIT Kerberos distribution and 1.22 withdrawal note](https://kerberos.org/dist/index.html)
- [MIT Kerberos old news](https://web.mit.edu/kerberos/oldnews.html)
- [MIT Kerberos enctype documentation](https://web.mit.edu/kerberos/krb5-1.20/doc/admin/enctypes.html)
- [Heimdal on GitHub](https://github.com/heimdal/heimdal)
- [Heimdal releases](https://github.com/heimdal/heimdal/releases)
- [Apple Open Source — Heimdal](https://github.com/apple-oss-distributions/Heimdal)
- [aosm Heimdal — com.apple.Kerberos.kdc plist](https://github.com/aosm/Heimdal/blob/master/packages/mac/com.apple.Kerberos.kdc.plist)
- [MKShim — Heimdal-to-MIT compatibility layer](https://github.com/heimdal/MKShim/blob/master/Kerberos/Kerberos.h)
- [FreeIPA — Kerberos](https://www.freeipa.org/page/Kerberos)
- [FreeIPA — Collaboration with Kerberos](https://www.freeipa.org/page/Collaboration_with_Kerberos)
- [FreeIPA — V4 PKINIT design](https://www.freeipa.org/page/V4/Kerberos_PKINIT)
- [OneUptime — Tuning IdM performance for large-scale RHEL 9](https://oneuptime.com/blog/post/2026-03-04-tune-idm-performance-large-scale-rhel-9/view)
- [Microsoft Tech Community — Advancing Windows security: Disabling NTLM by default](https://techcommunity.microsoft.com/blog/windows-itpro-blog/advancing-windows-security-disabling-ntlm-by-default/4489526)
- [Microsoft Support — KB5020805 (CVE-2022-37967)](https://support.microsoft.com/en-us/topic/kb5020805-how-to-manage-kerberos-protocol-changes-related-to-cve-2022-37967-997e9acc-67c5-48e1-8d0d-190269bf4efb)
- [Microsoft Support — Managing PAC validation for CVE-2024-26248 / CVE-2024-29056](https://support.microsoft.com/en-gb/topic/how-to-manage-pac-validation-changes-related-to-cve-2024-26248-and-cve-2024-29056-6e661d4f-799a-4217-b948-be0a1943fef1)
- [Microsoft Q&A — NTLM sunset questions](https://learn.microsoft.com/en-au/answers/questions/5861263/ntlm-sunset-questions-need-more-info-please)
- [HBS — RC4 retirement and NTLM phase out in 2026](https://www.hbs.net/blog/rc4-ntlm-retirement)
- [Adremsoft — NTLM is ending: securing WMI monitoring with Kerberos](https://www.adremsoft.com/blog/view/blog/36141330344227/ntlm-is-ending-how-to-secure-wmi-monitoring-with-kerberos-authentication)
- [adsecurity.org — Detecting Kerberoasting Activity](https://adsecurity.org/?p=3458)
- [adsecurity.org — Cracking Kerberos TGS Tickets Using Kerberoast](https://adsecurity.org/?p=2293)
- [The Hacker Recipes — MS14-068 forged tickets](https://www.thehacker.recipes/ad/movement/kerberos/forged-tickets/ms14-068)
- [The Hacker Recipes — sAMAccountName spoofing (NoPac)](https://www.thehacker.recipes/ad/movement/kerberos/samaccountname-spoofing)
- [Bluefrostsecurity — Understanding emergency Windows update MS14-068](https://labs.bluefrostsecurity.de/blog/2015/12/21/understanding-emergency-windows-update-ms14-068/)
- [WithSecure Labs — Digging into MS14-068, exploitation and defence](https://labs.withsecure.com/publications/digging-into-ms14-068-exploitation-and-defence)
- [Black Hat EU 2015 — Watching the Watchdog: Protecting Kerberos with Network Monitoring](https://blackhat.com/docs/eu-15/materials/eu-15-Beery-Watching-The-Watchdog-Protecting-Kerberos-Authentication-With-Network-Monitoring-wp.pdf)
- [Tim Medin DerbyCon 2014 — Kicking the Guard Dog of Hades (video)](https://www.irongeek.com/i.php?page=videos/derbycon4/t120-attacking-microsoft-kerberos-kicking-the-guard-dog-of-hades-tim-medin)
- [Bridgewater IJCIC — Kerberoasting case studies](https://vc.bridgew.edu/cgi/viewcontent.cgi?article=1136&context=ijcic)
- [Palo Alto Networks — Detecting Kerberos NoPac with Cortex XDR](https://www.paloaltonetworks.com/blog/security-operations/detecting-the-kerberos-nopac-vulnerabilities-with-cortex-xdr/)
- [Secureworks — Understanding NoPac vulnerabilities](https://www.secureworks.com/blog/nopac-a-tale-of-two-vulnerabilities-that-could-end-in-ransomware)
- [NetSPI — CVE-2020-17049 Kerberos Bronze Bit overview](https://www.netspi.com/blog/technical/network-penetration-testing/cve-2020-17049-kerberos-bronze-bit-overview/)
- [NetSPI — CVE-2020-17049 Bronze Bit theory](https://www.netspi.com/blog/technical-blog/network-pentesting/cve-2020-17049-kerberos-bronze-bit-theory/)
- [Trimarc — Leveraging the Bronze Bit attack to compromise AD](https://www.hub.trimarcsecurity.com/post/leveraging-the-kerberos-bronze-bit-attack-cve-2020-17049-scenarios-to-compromise-active-directory)
- [Silverfort — Bronze Bit (CVE-2020-17049)](https://www.silverfort.com/blog/silverfort-bronze-bit-cve-2020-17049/)
- [Samba — CVE-2022-37967 advisory](https://www.samba.org/samba/security/CVE-2022-37967.html)

### News

- [Microsoft Security Response Center — Additional information about CVE-2014-6324](https://msrc.microsoft.com/blog/2014/11/additional-information-about-cve-2014-6324/)
- [BleepingComputer — Angry Conti ransomware affiliate leaks the gang's playbook](https://www.bleepingcomputer.com/news/security/angry-conti-ransomware-affiliate-leaks-gangs-attack-playbook/)
- [Black Kite — The Conti playbook leak explained](https://blackkite.com/reports/the-conti-playbook-leak-your-questions-answered)
- [WithSecure — Effective ransomware prevention: insights from the Conti playbook](https://www2.withsecure.com/en/expertise/resources/effective-ransomware-prevention)
- [eSentire — Analysis of leaked Conti intrusion procedures](https://www.esentire.com/blog/analysis-of-leaked-conti-intrusion-procedures-by-esentires-threat-response-unit-tru)
- [Qomplx — Conti University: four lessons from the playbook](https://www.qomplx.com/blog/conti-university-4-lessons-in-defense-from-ransomware-gang-playbook/)
- [CYFIRMA — Inside the Conti leaks](https://www.cyfirma.com/blogs/look-inside-ransomware-gang-through-conti-leaks/)
- [Redscan — Key insights from the Conti ransomware playbook leak](https://www.redscan.com/news/key-insights-from-the-conti-ransomware-playbook-leak-foothold/)
- [Neowin — Microsoft confirms NTLM is dead beyond Windows 11 24H2 and Server 2025](https://www.neowin.net/news/microsoft-confirms-ntlm-is-dead-beyond-windows-11-24h2-and-server-2025/)
- [Security Boulevard / PowerDMARC — NTLM deprecation: what Microsoft's phase-out means for MSPs and IT teams](https://securityboulevard.com/2026/05/ntlm-deprecation-what-microsofts-phaseout-means-for-msps-and-it-teams/)
- [PowerDMARC — NTLM deprecation Microsoft phase-out](https://powerdmarc.com/ntlm-deprecation-microsoft-phaseout/)
- [CVE Details — CVE-2014-6324](https://www.cvedetails.com/cve/CVE-2014-6324/)

### Wikipedia and reference

- [Wikipedia — Kerberos (protocol)](https://en.wikipedia.org/wiki/Kerberos_(protocol))
- [TechTarget — What is Kerberos?](https://www.techtarget.com/searchsecurity/definition/Kerberos)
- [Theoi — Cerberus, three-headed hound of Hades](https://www.theoi.com/Ther/KuonKerberos.html)
- [World History Encyclopedia — Cerberus](https://www.worldhistory.org/Cerberus/)
