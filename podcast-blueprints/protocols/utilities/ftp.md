---
id: ftp
type: protocol
name: File Transfer Protocol
abbreviation: FTP
etymology: "[F]ile [T]ransfer [P]rotocol"
category: utilities
year: 1971
rfc: RFC 959
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/ports-sockets
  - utilities-security/dns
  - utilities-security/ssh
related_protocols: [tcp, tls, ssh, ip, http1]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [114, 172, 765, 959, 1350, 1579, 1635, 1700, 2228, 2389, 2428, 2577, 2640, 3022, 3659, 4217, 4918, 5321, 5797, 7151, 9141, 9293]
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Passive_FTP_Verbindung.svg/500px-Passive_FTP_Verbindung.svg.png"
    caption: "FTP passive mode: the client connects to port 21 for commands, then the server tells the client which high port to dial for data. Passive mode solved the NAT and firewall problems that plagued the original active mode."
    credit: "Image: Wikimedia Commons / CC BY-SA 3.0"
visual_cues:
  - "A swimlane showing two TCP connections at once: a control channel on port 21 carrying USER, PASS, PASV, RETR in ASCII, and a separate data channel on an ephemeral port carrying raw bytes, with the data channel closing at end of file while control stays open"
  - "Active vs passive side by side: in active, the server dials the client from port 20 (red arrow blocked by a firewall icon); in passive, the client dials the server on a high port (green arrow passing through the firewall)"
  - "The three-digit reply-code grid: rows 1xx through 6xx, columns 0 syntax, 1 information, 2 connections, 3 auth, 4 unspecified, 5 file system, with examples like 220, 230, 331, 425, 530, 550 placed in the cells"
  - "A timeline ribbon from RFC 114 (April 16, 1971) through RFC 959 (October 1985), RFC 1579 (1994), RFC 4217 (2005), to Chrome 88 disabling FTP on January 19, 2021 and Firefox 90 removing it on July 13, 2021"
  - "A trojaned tarball labelled vsftpd-2.3.4.tar.gz with a smiley-face username triggering a root shell on TCP 6200, dated June 30 to July 3, 2011, with a broken GPG signature stamp next to it"
  - "A side-by-side architecture sketch: FTPS (two TCP connections, ports 21 and high, both wrapped in TLS, ALG cannot read the control channel) versus SFTP (one TCP connection on port 22, SSH subsystem, single firewall rule)"
---

# FTP — File Transfer Protocol

## In one breath

FTP is the 1971 application protocol that moves files between machines using two TCP connections at once: a control channel on port 21 for ASCII commands, and a separate data channel for the bytes themselves. Fifty-five years later it is the most thoroughly deprecated protocol still in routine use — browsers removed it, cloud providers wrap it for legacy migration only, and PCI auditors flag it on sight — yet it still feeds genome dumps out of NCBI, firmware into broadcast equipment, and Slackware ISOs into install scripts every day.

## The pitch (cold-open)

It is April 16, 1971. ARPANET is fifteen nodes. TCP does not exist. A graduate student at MIT named Abhay Bhushan publishes RFC 114, four pages titled simply "A File Transfer Protocol." That document, through nine major revisions and a dozen extensions, is still moving genomes across continents in 2026. It is also broken by design — every byte, including your password, travels in the clear — and an IETF Informational document has said so in plain English since 1999. This is the story of the oldest application protocol on the Internet: how it actually works, why two TCP connections turned out to be one too many, and what finally killed it on the public web.

## How it actually works

A single FTP session is built from two TCP connections. The client opens the control connection to the server's port 21 and keeps it open for the entire session. Commands are ASCII text — USER, PASS, CWD, LIST, RETR, STOR — and replies are three ASCII digits plus a human-readable string. For each file or directory listing, a second TCP connection — the data connection — opens, carries the bytes, and closes. The close itself signals end-of-file in stream mode.

RFC 959 names the two abstract halves on each side: the Protocol Interpreter, which runs the control-channel state machine, and the Data Transfer Process, which moves bytes on the data connection. There is a user-PI and user-DTP on the client and a server-PI and server-DTP on the server. The walkthrough below follows our simulator transcript, step by step.

The server greets you with `220 ftp.example.com FTP server ready`. You send `USER alice`; it answers `331 Password required for alice`. You send `PASS`; on success it answers `230 User alice logged in`. The third digit of those codes carries finer detail; the second digit groups them by topic — 0 syntax, 1 information, 2 connections, 3 auth, 4 unspecified, 5 file system. The first digit is the class. That grammar was so successful that SMTP, NNTP, POP3, and the early HTTP error structure copied it wholesale; RFC 5321 cites the FTP precedent by name.

You then ask `SYST` and `FEAT` to discover what the server supports — feature negotiation was added in RFC 2389 in 1998. You issue `TYPE I` to switch to binary mode. You send `PASV`; the server opens a listener on a high port and answers `227 Entering Passive Mode (192,0,2,7,195,80)`. The client multiplies 195 times 256 plus 80 to get port 49936 and dials the server there. You send `RETR linux-6.13.tar.xz`; the server answers `150 Opening BINARY mode data connection for linux-6.13.tar.xz (134217728 bytes)`, streams the bytes on the data connection, closes it, and answers `226 Transfer complete` on the control connection. You send `QUIT`; you get `221 Goodbye`.

### Header at a glance

FTP has no binary header — the control channel is ASCII Telnet conventions on a TCP connection, which is why you can literally `telnet host 21` and type FTP commands at vsftpd today. What you do have is structured fields scattered across the protocol:

- The three-digit reply code at the start of every server line, with the positional grammar above.
- Argument-bearing commands like `USER alice`, `PORT 192,0,2,5,195,80`, `PASV`, `EPSV`, `RETR somefile`, `STOR upload.txt`.
- Data representation knobs: `TYPE A` for NVT-ASCII (CRLF on the wire, end-of-line translated to local convention), `TYPE I` for binary verbatim, `TYPE E` for EBCDIC, `TYPE L <bits>` for local byte. Modern traffic is overwhelmingly `TYPE I`.
- Structure and mode knobs: `STRU F` (file, default), `R` (record), `P` (page); `MODE S` (stream, default), `B` (block), `C` (compressed). Almost no one uses anything but the defaults.
- The IPv6-and-NAT-friendly extended forms from RFC 2428: `EPRT |1|192.0.2.5|54321|` and `EPSV`. The reply `229 Entering Extended Passive Mode (|||p|)` deliberately omits the address — the client reuses the control-channel IP — which side-steps the NAT mismatch that plagues plain PASV.
- The TLS commands from RFC 4217: `AUTH TLS`, `PBSZ 0`, `PROT P`. We come back to those below.

### State machine in three sentences

The control connection is stateful: the client walks through unauthenticated, then user-given, then logged-in, and within logged-in carries representation type, working directory, and a current data-connection arrangement. Each data transfer is its own ephemeral state — a new TCP connection that opens at `150`, transfers, and closes by `226`. The state lives on the server because every command implicitly references the current directory and the current type; nothing in the protocol carries the session identifier explicitly.

### Reliability, security, and that second connection

FTP itself adds no checksum or framing beyond what TCP provides; reliability is entirely TCP's job, which is one reason RFC 959 is so short. The interesting mechanics are around the second connection.

In active mode — the original 1985 default — the client opens a listening socket on a high port and sends `PORT a,b,c,d,p1,p2`, encoding its IP and `p1*256+p2` for the port. The server then dials that port from its own port 20. In the open Internet of 1985 this was unremarkable. Once packet-filter firewalls and NAT arrived, the server's inbound TCP SYN to the client's high port looked indistinguishable from any other unsolicited connection, and the embedded address in the PORT command pointed at an RFC 1918 address the server could not reach.

Steve Bellovin's RFC 1579 in February 1994, "Firewall-Friendly FTP," made the case that clients should default to PASV — the server listens, the client dials out — and that is essentially what every modern client does. RFC 2428 in September 1998 from Allman, Ostermann, and Metz added EPRT and EPSV for IPv6 and made the passive reply omit the address entirely, which fixes one of NAT's footguns at the cost of admitting that the protocol's original framing was wrong.

Security is where the protocol simply does not match 2026. RFC 959 is cleartext: USER, PASS, every byte of every file, every directory listing. RFC 2577 in May 1999 said it in one sentence — "All data and control information (including passwords) is sent across the network in unencrypted form by standard FTP" — and that sentence has been an IETF Informational document for twenty-seven years. Explicit FTPS, standardised in RFC 4217 in October 2005, is the IETF answer: the client connects in cleartext to port 21, sends `AUTH TLS`, on `234 Proceed` performs a TLS handshake on the existing TCP connection, then `PBSZ 0` and `PROT P` to also encrypt the data channel. Implicit FTPS — TLS from byte zero on port 990 — is widely deployed but not actually specified in 4217. We come back to why FTPS lost to SFTP below.

## Where it shows up in production

NCBI at the National Library of Medicine still operates `ftp.ncbi.nlm.nih.gov` heavily. GenBank releases 265 in March 2025, 268 in August 2025, and 271 in April 2026 were all delivered over FTP and HTTPS. On 25 March 2026 NCBI announced it would retire rsync support on 1 June 2026 while keeping FTP and HTTPS — a rare 2026 case of an institution actively keeping FTP rather than dropping it. PubMed's December 2025 baseline was the first generated by the new pipeline.

GNU at `ftp.gnu.org` still serves anonymous FTP and HTTPS in 2026, though uneven mirror behaviour and slow FTP throughput have pushed the project to recommend `ftpmirror.gnu.org`. Slackware Linux is the other holdout: Patrick Volkerding has continuously released Slackware via FTP since 1993 and `ftp.slackware.com` is still a primary distribution channel alongside HTTP and rsync.

AWS Transfer Family is where modern enterprises terminate inbound FTP and FTPS. It accepts SFTP, FTPS, FTP, and AS2, lands the bytes in S3, and as of the `TransferSecurityPolicy-2025-03` and `TransferSecurityPolicy-FIPS-2025-03` policies supports ML-KEM hybrid post-quantum key exchange for SFTP. Plain FTP is still on the menu purely for legacy migration: it is restricted to VPC, passive mode only, image type only, stream mode only. The "AWS deprecated FTP" claim you see in trade press is overstated — what AWS deprecated is the older `VPC_ENDPOINT` endpoint type for new server creation, not the protocol.

The High-Energy Physics community is in the middle of turning off Globus GridFTP. The JASMIN GridFTP server was retired on 13 December 2024, and a CHEP 2024 paper published in 2025 confirms that "in the near future, all Globus GridFTP will be turned off" in favour of HTTP and WebDAV with third-party copy and JWT auth. The open-source Globus Toolkit was end-of-lifed in January 2018; only the commercial Globus Connect service continues, and even there the data plane is migrating to HTTPS with OAuth2.

The places that already left FTP for good are instructive. Debian shut down `ftp://ftp.debian.org` on 1 November 2017 in favour of `http://ftp.debian.org` and `deb.debian.org`; the wiki notes the `ftp.` name lingers purely for backward compatibility. kernel.org terminated `ftp://ftp.kernel.org/` on 1 March 2017 and `ftp://mirrors.kernel.org/` on 1 December 2017. The IETF retired its own `ftp.ietf.org` service, documented in RFC 9141 in 2021. None of those moves caused outages — they just deleted the legacy hostname and pointed people at HTTPS or rsync.

The broader long tail is legacy enterprise B2B and EDI exchanges, traditional shared-hosting control panels, embedded-device firmware updates for printers, broadcast equipment, and PLCs, and scientific data archives at NASA, NOAA, USGS, ESA, and EBI that mirror NCBI's pattern of maintaining the FTP face because pipelines hard-coded the URLs decades ago.

## Things that go wrong

### The vsftpd 2.3.4 backdoor, July 2011

Between 30 June and 3 July 2011, the `vsftpd-2.3.4.tar.gz` tarball on the master vsftpd download site was replaced with a trojaned copy. If a user logged in with a username ending in `:)` — a literal smiley face — the daemon spawned a root shell on TCP port 6200. Chris Evans, vsftpd's author and at the time leading Chrome security at Google, posted the disclosure on his Scary Beast Security blog on 4 July 2011 after a user reported that the GPG signature was failing. The trojaned tarball had sat on the master site for roughly seventy-two hours.

NVD assigned CVE-2011-2523. Evans moved the master copy to a Google App Engine appspot.com domain and revoked the bad tarball. The attacker was never publicly identified. Anyone who had downloaded vsftpd in those seventy-two hours and skipped signature verification compiled and shipped a permanent root backdoor — at the time vsftpd was being baked into appliance firmware, embedded NAS, and shared-hosting images, so the deployment count is unknown. The incident is now a textbook supply-chain compromise — the canary in the lineage that runs through event-stream in 2018, SolarWinds in 2020, and xz-utils in 2024 — and Metasploit's `vsftpd_234_backdoor` module along with nmap's `ftp-vsftpd-backdoor` NSE script remain fixtures of every pen test.

### The ProFTPD CVE march

ProFTPD's recent CVE list is a tour of the protocol's footguns. CVE-2010-4221 was a pre-auth Telnet IAC stack overflow that turned the control parser's Telnet-aware decoding into remote code execution. CVE-2015-3306 and CVE-2019-12815 were `mod_copy` flaws — `SITE CPFR` and `SITE CPTO` allowed unauthenticated arbitrary file read and write. CVE-2024-48651, published 29 November 2024, was a supplemental-group inheritance bug in `mod_sql` that quietly granted GID 0 access; it was fixed in commit `cec01cc`. CVE-2024-57392, published 6 February 2025, was a buffer overflow in the message parser allowing remote DoS and potential RCE.

Pure-FTPd's CVE-2024-48208 was an out-of-bounds read in `domlsd()` in `ls.c`, fixed in 1.0.52. vsftpd itself drew CVE-2025-14242, an integer overflow in `ls` parameter parsing reachable post-auth via STAT — Red Hat shipped the fix in advisory RHSA-2026:0605. None of these are exotic; they are the cost of running C network daemons that parse untrusted text and historically run as root.

### The FTP bounce attack

The PORT command places no restriction on the IP and port pair the server is told to dial. An attacker can upload a payload file to a third-party FTP server, send PORT pointing at another host, then RETR — turning the FTP server into a proxy that scans or attacks third parties. In the 1990s this was used to bypass perimeter firewalls (the FTP server was inside, the attacker outside) and as a free port-scanner anonymiser. CERT advisory CA-1997-27 documented it; RFC 2577 codified the mitigations: refuse PORT to ports below 1024, refuse PORT to addresses different from the control-connection peer, or disable PORT entirely.

### The Equifax misattribution

You will hear, in the wild, that the 2017 Equifax breach exposing roughly 143 to 147 million U.S. consumer records was an FTP failure. It was not. It was an unpatched Apache Struts vulnerability, CVE-2017-5638. The "FTP was involved" claim is folklore. Where FTP did contribute to that era was mass cleartext-credential exposure on shared web hosts — Akamai and others reported, through 2008 to 2015, ongoing campaigns that sniffed or brute-forced FTP credentials and used them to inject malware into customer sites. Different problem, different protocol, both real.

## Common pitfalls (for the practitioner)

ASCII-mode mangling binaries. Transferring a binary with `TYPE A` strips 0x0D bytes that happen to precede 0x0A. Symptom: ZIP and tar.gz extracts fail with "corrupt data." Cure: always `TYPE I` for non-text, and configure your client to default to binary.

Active mode breaking through NAT. Client behind NAT advertises its RFC 1918 address in PORT; server tries to dial it and fails. Cure: use PASV or EPSV. If the firewall is yours, consider an application-layer gateway like Linux's `nf_conntrack_ftp`, which parses the cleartext PORT and PASV strings and rewrites them on the fly.

The FTPS-and-NAT footgun. The same `nf_conntrack_ftp` ALG cannot read the control channel once it is wrapped in TLS — there is nothing to parse. Symptom: "FTPS works for control, hangs on listing." Cure: configure `pasv_address` to your public IP and pin `pasv_min_port`/`pasv_max_port` to a narrow range, then open exactly that range in the firewall. Do not "open 1024 to 65535 to make it just work" — that effectively exposes every ephemeral service on the host.

TLS data-channel session-reuse failures. RFC 4217 mandates TLS session resumption on data connections so that the data port shares the master secret with the control channel — without it a hijacker can take over the data port. Some clients do not reuse sessions; some OpenSSL versions have surprising session-cache behaviour. Cure: enforce reuse on the server (`require_ssl_reuse=YES` in vsftpd, the default since 2.1.0). Chris Evans and Tim Kosse have documented this fragility for years.

chroot escape via writable chroot. If you set `chroot_local_user=YES` without `allow_writeable_chroot=NO`, a hard link to `/etc/passwd` inside the chroot can break out.

Anonymous accounts that allow uploads. The historical "incoming/" model is how warez "pubstros" — anonymous-writable FTP servers that became free file-replication endpoints for the FXP scene — happened. If you must run anonymous FTP, make it read-only.

Pre-TLS-1.2 advertised in `AUTH TLS`. NIST SP 800-52 Rev. 2 has required TLS 1.2 since 2019 and TLS 1.3 since 1 January 2024 across federal endpoints. FTPS endpoints inherit that requirement.

## Debugging it

`tcpdump -i any -nn 'tcp port 21 or tcp portrange 49152-65535'` captures both the control channel and the PASV-assigned data ports. Adjust the range to whatever your server's `pasv_min_port` and `pasv_max_port` actually are.

`lftp -d` gives verbose client tracing — every command and reply, including the PASV negotiation and the data-channel TCP socket numbers. FileZilla's log panel set to "Debug verbose" gives the same, GUI-side.

`openssl s_client -starttls ftp -connect host:21` performs the AUTH TLS dialog and dumps the certificate chain and negotiated cipher. Note that `-starttls ftp` expects explicit FTPS and will fail against implicit-FTPS port 990 — for that, drop the `-starttls` flag and connect directly.

Wireshark's `ftp` and `ftp-data` dissectors decode reply codes inline; the filter `ftp.response.code == 530` finds your auth failures and `ftp.response.code == 425` finds the data-connection failures that usually mean NAT or firewall drift.

The nmap NSE script `ftp-vsftpd-backdoor` checks specifically for the 2.3.4 trojan signature. It is fast and worth running on any FTP daemon you inherit.

What to monitor in production: bursts of `530` on the control channel mean credential stuffing; bursts of `425` mean the data channel cannot open and your NAT or firewall has drifted; connections to ports outside the configured PASV range mean misconfiguration or scanning; and `AUTH TLS` failures on FTPS endpoints almost always mean a certificate rotation that someone forgot.

## What's changing in 2026

April 2026 — NCBI ships GenBank release 271 over FTP and HTTPS, the latest in an unbroken cadence of bulk-genomics deliveries that keeps the FTP face of `ftp.ncbi.nlm.nih.gov` alive.

March 2026 — NCBI announces it will retire rsync support on 1 June 2026 while keeping FTP and HTTPS. A rare case in 2026 of an institution moving away from rsync rather than toward it.

April 2025 — OpenSSH 10.0 makes `mlkem768x25519-sha256` its default key exchange, the first widely deployed post-quantum default in any mainstream protocol; OpenSSH 10.1 in October 2025 begins warning when a session is non-PQ. SFTP — which runs as a subsystem inside SSH — inherits this for free, which widens the gap with FTPS. RHEL 10 ships PQ-capable OpenSSH.

March 2025 — AWS Transfer Family ships `TransferSecurityPolicy-2025-03` and `TransferSecurityPolicy-FIPS-2025-03`, enabling ML-KEM hybrid quantum-resistant key exchange for SFTP. FTPS gets the same crypto for free wherever the underlying TLS library supports the hybrid groups in TLS 1.3.

31 March 2025 — PCI DSS 4.0's forty-seven new requirements become mandatory. Plain FTP cannot be the primary channel for cardholder data; if used inside the cardholder data environment it must be wrapped in SSH, TLS, or IPsec — effectively SFTP or FTPS. PCI Council FAQ #1076 is explicit.

December 2024 — JASMIN's GridFTP server is retired, part of the WLCG migration off Globus GridFTP onto HTTP-based third-party copy with WebDAV and JWT.

November 2024 — ProFTPD CVE-2024-48651 lands; February 2025 brings CVE-2024-57392; both reinforce the ongoing maintenance burden of running a 1985-shaped C daemon in 2026.

1 January 2024 — NIST SP 800-52 Rev. 2's TLS 1.3 requirement takes effect across federal TLS endpoints. FTPS endpoints inherit it; pre-1.3 deployments are now non-compliant.

The IETF picture: the original `ftpext` working group concluded years ago, its successor `ftpext2` (which produced RFC 7151) also concluded, and as of May 2026 there is no active IETF working group chartered for FTP. Future work, if any, would land through ART-area individual submissions. RFC 9141 in 2021, "Updating References to the IETF FTP Service," is itself a tombstone — the IETF retired its own `ftp.ietf.org`.

## Fun facts (host material)

The smiley-face backdoor was caught by GPG. The trigger that flagged vsftpd 2.3.4 as compromised was a single line: `gpg: BAD signature from "Chris Evans <chris@scary.beasts.org>"`. Anyone who actually verified signatures was safe. The lesson is twenty-six years old and we are still relearning it.

Why port 21. The early IANA "well-known port" assignments were curated by Jon Postel personally; FTP's 21-and-20 pair is documented in RFC 1700 from 1994 by Reynolds and Postel, and the assignment goes back to RFC 959 in 1985. The reason SSH ended up on port 22 is that Tatu Ylönen wanted it to sit between Telnet on 23 and FTP on 21 — it was Joyce Reynolds, the same Reynolds who co-authored RFC 959, who replied the next day in July 1995 and assigned it.

Joyce K. Reynolds. Co-author of RFC 959, RFC 854 for Telnet, and the long "Assigned Numbers" series; with Postel she effectively ran what became IANA. She passed away in 2015 and the RFC Editor named the Joyce K. Reynolds award in her honour.

Archie was the first Internet search engine, and it indexed FTP. Alan Emtage, then a graduate student at McGill, wrote a script in 1990 that polled anonymous-FTP listings on a schedule and built a searchable filename index — predating the web. The name is "archive" minus the "v"; despite the obvious comic-book reference, Emtage has said he disliked the comics. A new public-access Archie was opened by The Serial Port computer museum on 11 May 2024.

ftp.cdrom.com and the C10k problem. Walnut Creek CDROM's FTP site, the home of FreeBSD, moved 873 gigabytes in a single twenty-four-hour period in May 1999 and served roughly ten thousand concurrent clients. That made it Dan Kegel's original example of "the C10k problem" being solvable on commodity hardware. A single Cloudflare edge node in 2026 routinely handles that load per minute.

The reply codes that ate the Internet. RFC 5321 — the current SMTP standard — explicitly cites the FTP three-digit reply grammar as its precedent. NNTP and POP3 inherited it too. FTP came first; everyone else copied.

The FXP scene. Pirates were the most aggressive optimisers of FTP. RFC 959 actually permits a client to open two control connections — one to server A, one to server B — and instruct A to PORT directly to B's data port, causing A to stream the file straight to B without the client carrying the bytes. That is the original "proxy FTP," and the security hazard is exactly the bounce attack. In the late-1990s warez scene, multi-stream FXP, custom auto-trader bots, IRC announce channels, and "0-second pre" releases all came out of that community before academic networking adopted similar parallelism.

## Where this connects in the book

- Part Foundations, chapter "Ports & Sockets" — how one machine runs a hundred services without confusing them, and where FTP's 21-and-20 pair fits in the well-known-ports tradition.
- Part Utilities & Security, chapter "DNS" — the chapter notes that until 1983 every ARPANET host pulled the flat HOSTS.TXT file by FTP from the SRI-NIC, the impossibility of which is precisely what motivated DNS.
- Part Utilities & Security, chapter "SSH" — Tatu Ylönen wrote SSH in July 1995 after a password-sniffing attack on the Helsinki University network harvested credentials from Telnet, RSH, and FTP; SSH chose port 22 to sit next to FTP on 21, and SFTP eventually displaced FTPS as the way to move files securely.

## See also (other protocol episodes)

The TCP episode is the necessary backdrop for everything FTP does on the wire. FTP's signature design — two TCP connections per session, control on 21 and data on a separate ephemeral pair — is the single most consequential decision in the protocol. It works beautifully on the open Internet of 1985 and badly on the NATed, firewalled Internet of 2026. Every application-layer-gateway hack we use to keep active mode alive — Linux `nf_conntrack_ftp` parsing PORT strings, Cisco PIX and ASA "FTP fixup" — is a textbook violation of layering, and all of it breaks the moment the control channel is encrypted.

The TLS episode is where FTPS lives. FTPS via RFC 4217 is the IETF-standardised secure FTP. Certificate validation works exactly as in HTTPS; what is unique is the `PBSZ 0; PROT P` ritual and the TLS-session-resumption requirement on data connections. With TLS 1.3 and modern AEAD ciphers FTPS is technically secure, but operationally it is awkward enough that it lost the market to SFTP.

The SSH episode is the one to listen to right after this. SFTP is the most common point of confusion in this whole space: it is not "FTP over SSH." It is the SSH File Transfer Protocol, defined in the IETF `secsh-filexfer` Internet-Draft series — the most widely deployed version is draft 02, which OpenSSH implements — and it runs as a subsystem inside an SSH-2 channel. It has nothing in common with RFC 959 except the name. SFTP won and FTPS lost because one TCP connection on port 22 is trivial to firewall, SSH key authentication is vastly stronger than passwords, there are no NAT or ALG kludges, and the server side is ubiquitous via OpenSSH.

The IP episode sits underneath both. FTP relies on the addressing model that PORT and PASV embed by literal IPv4 octets — the reason RFC 2428's EPRT and EPSV exist at all is that IPv6 needed an address representation that a four-byte field could not carry.

The HTTP/1.1 episode is where the actual replacement for FTP-as-download-mechanism lives. HTTPS in front of a CDN — Cloudflare, Fastly, Akamai, CloudFront — solves the firewall problem with one connection on a well-known port, supports range requests as the moral equivalent of FTP's REST, supports caching at every hop (which FTP fundamentally cannot), and authenticates the server via the Web PKI. Debian, kernel.org, and most Linux distros switched their canonical mirror URLs to HTTP and HTTPS for these reasons.

## Visual cues for image generation

- A swimlane showing two TCP connections at once: a control channel on port 21 carrying USER, PASS, PASV, RETR in ASCII, and a separate data channel on an ephemeral port carrying raw bytes, with the data channel closing at end of file while control stays open.
- Active vs passive side by side: in active, the server dials the client from port 20 (red arrow blocked by a firewall icon); in passive, the client dials the server on a high port (green arrow passing through the firewall).
- The three-digit reply-code grid: rows 1xx through 6xx, columns 0 syntax, 1 information, 2 connections, 3 auth, 4 unspecified, 5 file system, with examples like 220, 230, 331, 425, 530, 550 placed in the cells.
- A timeline ribbon from RFC 114 (April 16, 1971) through RFC 959 (October 1985), RFC 1579 (1994), RFC 4217 (2005), to Chrome 88 disabling FTP on January 19, 2021 and Firefox 90 removing it on July 13, 2021.
- A trojaned tarball labelled vsftpd-2.3.4.tar.gz with a smiley-face username triggering a root shell on TCP 6200, dated June 30 to July 3, 2011, with a broken GPG signature stamp next to it.
- A side-by-side architecture sketch: FTPS (two TCP connections, ports 21 and high, both wrapped in TLS, ALG cannot read the control channel) versus SFTP (one TCP connection on port 22, SSH subsystem, single firewall rule).

## Sources

### RFCs

- [RFC 114 — A File Transfer Protocol (Bhushan, April 1971)](https://www.rfc-editor.org/rfc/rfc114)
- [RFC 172 — The File Transfer Protocol (Bhushan et al., June 1971)](https://datatracker.ietf.org/doc/html/rfc172)
- [RFC 959 — File Transfer Protocol (Postel & Reynolds, October 1985)](https://www.rfc-editor.org/rfc/rfc959)
- [RFC 1350 — TFTP, the Trivial File Transfer Protocol](https://www.rfc-editor.org/rfc/rfc1350)
- [RFC 1579 — Firewall-Friendly FTP (Bellovin, February 1994)](https://www.rfc-editor.org/rfc/rfc1579)
- [RFC 1635 — How to Use Anonymous FTP](https://www.rfc-editor.org/rfc/rfc1635)
- [RFC 2228 — FTP Security Extensions (Horowitz & Lunt, October 1997)](https://www.rfc-editor.org/rfc/rfc2228)
- [RFC 2389 — Feature Negotiation for FTP (Hethmon & Elz, August 1998)](https://www.rfc-editor.org/rfc/rfc2389)
- [RFC 2428 — FTP Extensions for IPv6 and NATs (Allman, Ostermann, Metz, September 1998)](https://www.rfc-editor.org/rfc/rfc2428)
- [RFC 2577 — FTP Security Considerations (Allman & Ostermann, May 1999)](https://www.rfc-editor.org/rfc/rfc2577)
- [RFC 2640 — Internationalization of FTP (Curtin, July 1999)](https://www.rfc-editor.org/rfc/rfc2640)
- [RFC 3022 — Traditional NAT](https://www.rfc-editor.org/rfc/rfc3022)
- [RFC 3659 — Extensions to FTP: SIZE, MDTM, MLST, MLSD (Hethmon, March 2007)](https://www.rfc-editor.org/rfc/rfc3659)
- [RFC 4217 — Securing FTP with TLS (Ford-Hutchinson, October 2005)](https://www.rfc-editor.org/rfc/rfc4217)
- [RFC 4918 — HTTP Extensions for WebDAV](https://www.rfc-editor.org/rfc/rfc4918)
- [RFC 5321 — Simple Mail Transfer Protocol](https://www.rfc-editor.org/rfc/rfc5321)
- [RFC 5797 — IANA FTP Command Registry (Klensin & Hoenes, March 2010)](https://www.rfc-editor.org/rfc/rfc5797)
- [RFC 7151 — FTP HOST Command for Virtual Hosts (Hethmon & McMurray, March 2014)](https://www.rfc-editor.org/rfc/rfc7151)
- [RFC 9141 — Updating References to the IETF FTP Service](https://www.rfc-editor.org/rfc/rfc9141.html)
- [RFC 9293 — Transmission Control Protocol](https://www.rfc-editor.org/rfc/rfc9293)
- [IANA FTP Commands and Extensions Registry](https://www.iana.org/assignments/ftp-commands-extensions/ftp-commands-extensions.xhtml)
- [IANA Service Name and Port Number Registry](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)

### Papers

- [Globus GridFTP (IEEE, 2005)](https://ieeexplore.ieee.org/document/1560006)
- [WLCG migration off GridFTP (CHEP 2024 / 2025 proceedings)](https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf)

### Vendor and engineering blogs

- [Chris Evans — Alert: vsftpd download backdoored (July 2011)](https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html)
- [Chris Evans — vsftpd-3.0.3 and the horrors of FTP over SSL (July 2015)](https://scarybeastsecurity.blogspot.com/2015/07/vsftpd-303-released-and-horrors-of-ftp.html)
- [vsftpd download site (security.appspot.com)](https://security.appspot.com/vsftpd.html)
- [Mozilla — Built-in FTP implementation to be removed in Firefox 90 (April 2021)](https://blog.mozilla.org/addons/2021/04/15/built-in-ftp-implementation-to-be-removed-in-firefox-90/)
- [Chrome — Deprecations and removals in Chrome 88 (December 2020)](https://developer.chrome.com/blog/chrome-88-deps-rems)
- [AWS Transfer Family — security policies](https://docs.aws.amazon.com/transfer/latest/userguide/security-policies.html)
- [AWS Transfer Family — post-quantum security policies](https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html)
- [AWS Transfer Family — what is AWS Transfer Family](https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html)
- [AWS Transfer Family — file transfer reference](https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html)
- [OpenSSH — Post-Quantum Cryptography (2025)](https://www.openssh.org/pq.html)
- [Red Hat — Post-quantum cryptography in RHEL 10](https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10)
- [NIST SP 800-52 Rev. 2 — TLS guidelines](https://csrc.nist.gov/pubs/sp/800/52/r2/final)
- [PCI Security Standards Council — FAQs](https://www.pcisecuritystandards.org/faqs/all/)
- [PCI DSS 4.0 requirements guide (Linford & Co)](https://linfordco.com/blog/pci-dss-4-0-requirements-guide/)
- [Debian — Shutting down public FTP services (LWN, April 2017)](https://lwn.net/Articles/720856/)
- [Debian — ftp.debian.org wiki](https://wiki.debian.org/ftp.debian.org)
- [kernel.org — Shutting down FTP services](https://www.kernel.org/shutting-down-ftp-services.html)
- [GNU — ftp.gnu.org guidance](https://www.gnu.org/prep/ftp.html)
- [NCBI — GenBank release 265 (March 2025)](https://ncbiinsights.ncbi.nlm.nih.gov/2025/03/11/genbank-release-265/)
- [NCBI — GenBank release 268 (August 2025)](https://ncbiinsights.ncbi.nlm.nih.gov/2025/08/26/genbank-release-268-0/)
- [NCBI — Retire rsync support for FTP downloads (March 2026)](https://ncbiinsights.ncbi.nlm.nih.gov/2026/03/25/retire-rsync-support-ftp-downloads/)
- [NLM — PubMed FTP data update](https://www.nlm.nih.gov/pubs/techbull/mj25/mj25_pubmed_ftp_data.html)
- [JASMIN GridFTP retirement (December 2024)](https://cms.ncas.ac.uk/news/gridftp/)
- [Globus Toolkit EOL (January 2018)](https://www.globus.org/blog/support-open-source-globus-toolkit-ends-january-2018)
- [netfilter — nf_conntrack_ftp](https://netfilter.org/projects/nf-conntrack/)
- [Wireshark FTP dissector reference](https://www.wireshark.org/docs/dfref/f/ftp.html)
- [FileZilla project](https://filezilla-project.org/)
- [WinSCP](https://winscp.net/)
- [lftp](https://lftp.yar.ru/)
- [Beej's Guide to Network Programming](https://beej.us/guide/bgnet/)

### News and security databases

- [NVD — CVE-2011-2523 (vsftpd 2.3.4 backdoor)](https://nvd.nist.gov/vuln/detail/CVE-2011-2523)
- [Rapid7 — Metasploit module for vsftpd 2.3.4 backdoor](https://www.rapid7.com/db/modules/exploit/unix/ftp/vsftpd_234_backdoor/)
- [nmap NSE — ftp-vsftpd-backdoor](https://nmap.org/nsedoc/scripts/ftp-vsftpd-backdoor.html)
- [CERT CA-1997-27 — FTP bounce (via nmap.org mirror)](https://nmap.org/CA-97.27.FTP_bounce.html)
- [CVE Details — ProFTPD vulnerability list](https://www.cvedetails.com/vulnerability-list/vendor_id-9520/product_id-16873/Proftpd-Proftpd.html)
- [CVE Details — CVE-2024-48651 (ProFTPD)](https://www.cvedetails.com/cve/CVE-2024-48651/)
- [CVE Details — CVE-2024-57392 (ProFTPD)](https://www.cvedetails.com/cve/CVE-2024-57392/)
- [GitHub Advisory — CVE-2024-48208 (Pure-FTPd)](https://github.com/advisories/GHSA-rrmj-qxgv-v296)
- [Wiz — CVE-2024-48208](https://www.wiz.io/vulnerability-database/cve/cve-2024-48208)
- [SentinelOne — CVE-2025-14242 (vsftpd)](https://www.sentinelone.com/vulnerability-database/cve-2025-14242/)
- [Red Hat advisory RHSA-2026:0605](https://access.redhat.com/errata/RHSA-2026:0605)
- [Apache Software Foundation — media alert on Struts (Equifax context)](https://news.apache.org/foundation/entry/media-alert-the-apache-software)
- [House Oversight — Equifax report (December 2018)](https://oversight.house.gov/wp-content/uploads/2018/12/Equifax-Report.pdf)
- [Black Duck — Equifax and Apache Struts CVE-2017-5638](https://www.blackduck.com/blog/equifax-apache-struts-vulnerability-cve-2017-5638.html)
- [Slashdot — Mozilla stops FTP support in Firefox 90](https://news.slashdot.org/story/21/07/24/0213220/mozilla-stops-ftp-support-in-firefox-90)

### Wikipedia

- [File Transfer Protocol](https://en.wikipedia.org/wiki/File_Transfer_Protocol)
- [SSH File Transfer Protocol](https://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol)
- [FTP bounce attack](https://en.wikipedia.org/wiki/FTP_bounce_attack)
- [FXP board](https://en.wikipedia.org/wiki/FXP_board)
- [Warez scene](https://en.wikipedia.org/wiki/Warez_scene)
- [Simtel](https://en.wikipedia.org/wiki/Simtel)
- [Archie (search engine)](https://en.wikipedia.org/wiki/Archie_(search_engine))
- [Alan Emtage](https://en.wikipedia.org/wiki/Alan_Emtage)
- [Firefox version history](https://en.wikipedia.org/wiki/Firefox_version_history)
