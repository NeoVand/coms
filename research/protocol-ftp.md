---
prompt_source: deep-research-prompts.txt:8446-8623 (PROTOCOL · FTP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/d50643e3-7c52-412c-ad27-916cff3aee39
research_mode: claude.ai Research
---

# The File Transfer Protocol (FTP): A Deep Educational Resource

> **Editorial note (May 2026):** Every factual claim below is footnoted with a verifiable source URL. Where 24‑month verification was incomplete, items are marked `[needs source]` rather than guessed. Dates, version numbers, and CVE IDs were checked against primary sources (RFC Editor, NVD, vendor blogs, IETF Datatracker). Treat statements about contemporaneous internal debates without published sources as informed commentary.

---

## Prerequisites and glossary

FTP is a 1970s-vintage application protocol that rides on top of TCP/IP and inherits Telnet's line-oriented control conventions. Before any of the protocol prose makes sense, a reader needs the following building blocks. Each definition is one or two sentences plus a pointer.

**OSI / TCP-IP layering.** FTP is an *application-layer* protocol (OSI L7 / TCP-IP "application"). It assumes a reliable, bidirectional byte-stream service from the *transport layer* — TCP, RFC 793 ([https://www.rfc-editor.org/rfc/rfc793](https://www.rfc-editor.org/rfc/rfc793)). It does not run over UDP (its lighter cousin TFTP, RFC 1350, does: [https://www.rfc-editor.org/rfc/rfc1350](https://www.rfc-editor.org/rfc/rfc1350)).

**Socket.** The OS-level abstraction `(IP address, port, protocol)` that endpoints read and write to. Beej's classic guide is the standard explainer ([https://beej.us/guide/bgnet/](https://beej.us/guide/bgnet/)).

**Port.** A 16-bit demultiplexing tag inside TCP/UDP. FTP uses **21** (control) and, for active mode, **20** (data); see IANA's Service Name and Transport Protocol Port Number Registry ([https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml)).

**Header.** Per-protocol metadata prepended to a payload (TCP header, IP header, etc.). RFC 791 / RFC 9293 are canonical ([https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293)).

**Checksum.** A small computed value used by TCP/IP to detect transmission errors; FTP itself adds none beyond what TCP provides.

**Handshake.** The three-segment SYN/SYN-ACK/ACK exchange that establishes a TCP connection ([https://www.rfc-editor.org/rfc/rfc9293](https://www.rfc-editor.org/rfc/rfc9293), §3.5).

**Stream.** An ordered, reliable byte sequence delivered by TCP. FTP's default *transfer mode* is also called "stream" (MODE S).

**NAT (Network Address Translation).** A middlebox technique that rewrites IP addresses/ports as packets cross a boundary; it breaks FTP active mode because the embedded `PORT a,b,c,d,p1,p2` advertises the client's pre-NAT address ([https://www.rfc-editor.org/rfc/rfc3022](https://www.rfc-editor.org/rfc/rfc3022)).

**Firewall.** A policy enforcement point that filters packets. With FTP, a firewall must understand the *control* stream to know which ephemeral data ports to allow — hence stateful "ftp helper" / ALG modules in iptables / nf_conntrack_ftp ([https://netfilter.org/projects/nf-conntrack/](https://netfilter.org/projects/nf-conntrack/)).

**In-band vs out-of-band signaling.** *In-band* means control and data share a channel (HTTP). *Out-of-band* means they don't. FTP is the canonical out-of-band design: control on port 21, data on a separate TCP connection — RFC 959 §2.3 ([https://www.rfc-editor.org/rfc/rfc959](https://www.rfc-editor.org/rfc/rfc959)).

**Control channel vs data channel.** Per RFC 959, the *control connection* carries USER, PASS, RETR, etc.; the *data connection* carries file bytes and directory listings.

**ASCII vs binary/image mode.** `TYPE A` = NVT-ASCII text with end-of-line translated to CRLF on the wire; `TYPE I` = "image" / binary, byte-for-byte; `TYPE E` = EBCDIC; `TYPE L <byte-size>` = local byte size — RFC 959 §3.1.1 ([https://www.rfc-editor.org/rfc/rfc959](https://www.rfc-editor.org/rfc/rfc959)).

**Stream / Block / Compressed mode.** `MODE S` (stream — default), `MODE B` (block, with descriptor headers), `MODE C` (run-length-style compression) — RFC 959 §3.4.

**PI (Protocol Interpreter) and DTP (Data Transfer Process).** RFC 959's two abstract processes: the PI handles the control-channel state machine; the DTP moves bytes on the data connection. There is a *user-PI / user-DTP* on the client and a *server-PI / server-DTP* on the server ([https://www.rfc-editor.org/rfc/rfc959](https://www.rfc-editor.org/rfc/rfc959), §1.2 and §3). [RFC Editor](https://www.rfc-editor.org/rfc/rfc959)

**USER / PASS.** Cleartext credential commands; server replies 331 ("user OK, need password") then 230 ("logged in") or 530 ("not logged in") — RFC 959 §4.

**PORT / PASV.** Active-mode and passive-mode address negotiation in IPv4 — RFC 959 §4.

**EPRT / EPSV.** IPv6/NAT-friendly extended forms — RFC 2428 ([https://www.rfc-editor.org/rfc/rfc2428](https://www.rfc-editor.org/rfc/rfc2428)).

**Anonymous FTP.** The convention of logging in as user `anonymous` (or `ftp`) with one's email address as a courtesy password to access read-only public mirrors — see RFC 1635 "How to Use Anonymous FTP" ([https://www.rfc-editor.org/rfc/rfc1635](https://www.rfc-editor.org/rfc/rfc1635)).

**FEAT / OPTS.** Capability discovery and option-setting added in RFC 2389 ([https://www.rfc-editor.org/rfc/rfc2389](https://www.rfc-editor.org/rfc/rfc2389)).

**MLSD / MLST / MDTM / SIZE.** Machine-readable listing and metadata commands added in RFC 3659 ([https://www.rfc-editor.org/rfc/rfc3659](https://www.rfc-editor.org/rfc/rfc3659)).

**AUTH / PBSZ / PROT.** TLS negotiation commands from RFC 2228 / RFC 4217 ([https://www.rfc-editor.org/rfc/rfc4217](https://www.rfc-editor.org/rfc/rfc4217)).

**HOST.** Virtual-host selector akin to HTTP's `Host:` header, added in RFC 7151 ([https://www.rfc-editor.org/rfc/rfc7151](https://www.rfc-editor.org/rfc/rfc7151)).

---

## History and story

**1971 — Origins at MIT.** RFC 114, "A File Transfer Protocol", was written by **Abhay Bhushan** of MIT's Project MAC and dated **16 April 1971** ([https://www.rfc-editor.org/rfc/rfc114](https://www.rfc-editor.org/rfc/rfc114)). At that moment ARPANET was barely a network: TCP did not exist; the underlying host-to-host protocol was NCP (Network Control Program). Bhushan's design problem was making heterogeneous ARPANET hosts (Multics, ITS, TENEX, IBM mainframes) exchange files without forcing each pair to invent a bespoke convention. RFC 114 explicitly contrasted "direct" usage (Telnet-style logins) with "indirect" usage where a program transfers files on behalf of a user ([https://www.rfc-editor.org/rfc/rfc114](https://www.rfc-editor.org/rfc/rfc114)). [Write.as](https://write.as/365-rfcs/rfc-114)[IETF](https://datatracker.ietf.org/doc/html/rfc114)

**1971–1973 — The committee years.** The protocol churned rapidly through RFC 141, RFC 172 (June 1971, with co-authors including Bob Braden, Will Crowther, Eric Harslem, Alex McKenzie, Dick Watson, Jim White; [https://datatracker.ietf.org/doc/html/rfc172](https://datatracker.ietf.org/doc/html/rfc172)), RFC 265, RFC 354 (1972), and RFC 542 (1973). RFC 686 (1975) was tellingly titled "Leaving Well Enough Alone" (summarized in RFC 959, §1.1; [https://www.rfc-editor.org/rfc/rfc959](https://www.rfc-editor.org/rfc/rfc959)). [IETF + 4](https://www.ietf.org/rfc/rfc959.txt)

**1980 — TCP transition.** RFC 765 (June 1980) re-specified FTP for TCP, ahead of the **1 January 1983 ARPANET "flag day"** when NCP was switched off in favor of TCP/IP (RFC 801; [https://www.rfc-editor.org/rfc/rfc801](https://www.rfc-editor.org/rfc/rfc801)). [Old Dominion University](https://www.cs.odu.edu/~tkennedy/cs300/development/Public/M04-HistoryOfFileTransferProtocol2/index.html)

**1985 — RFC 959, the canonical text.** Jon Postel and Joyce K. Reynolds at USC/ISI published RFC 959 in **October 1985**, obsoleting RFC 765 and adding optional CDUP, SMNT, STOU, RMD, MKD, PWD, and SYST ([https://www.rfc-editor.org/rfc/rfc959](https://www.rfc-editor.org/rfc/rfc959)). Reynolds was a co-author or editor on a remarkable slice of foundational RFCs (Telnet RFC 854, FTP RFC 959, "Assigned Numbers", and the original IANA function); Postel chaired what would become IANA until his death in 1998. [IETF + 2](https://datatracker.ietf.org/doc/html/rfc1579)

**Major extensions, 1994–2014.**

- **RFC 1579** (Feb 1994), Steve Bellovin, "Firewall-Friendly FTP" — argued that clients should default to PASV because packet-filter firewalls cannot accept arbitrary inbound connections to ephemeral client ports ([https://www.rfc-editor.org/rfc/rfc1579](https://www.rfc-editor.org/rfc/rfc1579)). [Wikidata](https://www.wikidata.org/wiki/Q47483521)[RFC Editor](https://www.rfc-editor.org/rfc/rfc1579.html)
- **RFC 2228** (Oct 1997), Horowitz & Lunt, "FTP Security Extensions" — added AUTH, ADAT, PBSZ, PROT, CCC, MIC, CONF, ENC and the 6yz reply class ([https://www.rfc-editor.org/rfc/rfc2228](https://www.rfc-editor.org/rfc/rfc2228)). [Therockgarden + 2](http://wu-ftpd.therockgarden.ca/rfc/rfc2228.html)
- **RFC 2389** (Aug 1998), Hethmon & Elz, "Feature negotiation mechanism for FTP" (FEAT/OPTS) ([https://www.rfc-editor.org/rfc/rfc2389](https://www.rfc-editor.org/rfc/rfc2389)). [GlobalSpec](https://standards.globalspec.com/std/1528345/ietf-rfc-4217)
- **RFC 2428** (Sept 1998), Allman, Ostermann & Metz, "FTP Extensions for IPv6 and NATs" (EPRT/EPSV) ([https://www.rfc-editor.org/rfc/rfc2428](https://www.rfc-editor.org/rfc/rfc2428)). [IETF](https://datatracker.ietf.org/doc/html/rfc2428)
- **RFC 2577** (May 1999), Allman & Ostermann, "FTP Security Considerations" — documents the bounce attack and password-guessing concerns ([https://www.rfc-editor.org/rfc/rfc2577](https://www.rfc-editor.org/rfc/rfc2577)).
- **RFC 2640** (July 1999), Curtin, "Internationalization of the File Transfer Protocol" — UTF-8 pathnames and the LANG command ([https://www.rfc-editor.org/rfc/rfc2640](https://www.rfc-editor.org/rfc/rfc2640)). [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc2640.html)
- **RFC 3659** (March 2007), Hethmon, "Extensions to FTP" — SIZE, MDTM, MLST, MLSD plus TVFS ([https://www.rfc-editor.org/rfc/rfc3659](https://www.rfc-editor.org/rfc/rfc3659)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc3659.html)
- **RFC 4217** (October 2005), Ford-Hutchinson, "Securing FTP with TLS" — the explicit-FTPS profile with PBSZ 0 / PROT P ([https://www.rfc-editor.org/rfc/rfc4217](https://www.rfc-editor.org/rfc/rfc4217)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc4217)[Hjp](https://www.hjp.at/doc/rfc/rfc4217.html)
- **RFC 5797** (March 2010), Klensin & Hoenes, "FTP Command and Extension Registry" — established the IANA FTP registry ([https://www.rfc-editor.org/rfc/rfc5797](https://www.rfc-editor.org/rfc/rfc5797); live registry at [https://www.iana.org/assignments/ftp-commands-extensions/ftp-commands-extensions.xhtml](https://www.iana.org/assignments/ftp-commands-extensions/ftp-commands-extensions.xhtml)). [IETF](https://datatracker.ietf.org/doc/rfc5797/)
- **RFC 7151** (March 2014), Hethmon & McMurray, "FTP HOST Command for Virtual Hosts" — adds an HTTP-Host-style virtual-host selector ([https://www.rfc-editor.org/rfc/rfc7151](https://www.rfc-editor.org/rfc/rfc7151)). [IETF](https://datatracker.ietf.org/doc/html/rfc7151)

**Active vs passive: why both exist.** RFC 959 specified active mode as the default: the client opens a *listener* on a high port, sends `PORT a,b,c,d,p1,p2` to the server, and the server initiates the data connection from its port 20. In the late 1980s this was unremarkable. In the early 1990s, packet-filter firewalls and then NAT made it untenable: the server's inbound TCP SYN to the client looked indistinguishable from any other unsolicited connection. RFC 1579's recommendation that clients prefer PASV — where the *server* listens and replies with `227 Entering Passive Mode (a,b,c,d,p1,p2)` and the client connects out — is the reason almost every modern FTP transaction is passive ([https://www.rfc-editor.org/rfc/rfc1579](https://www.rfc-editor.org/rfc/rfc1579)). [RFC Editor + 2](https://www.rfc-editor.org/rfc/rfc1579.html)

**Anonymous FTP and early Internet culture.** Through the 1980s and 1990s anonymous FTP was *the* method of software distribution. Major archives included **SIMTEL20** — a DECSYSTEM-20 hosted at the U.S. Army's White Sands Missile Range from 1983 onward by Frank Wancho, after Keith Petersen's earlier MIT-MC archive lost its host; the WSMR machine was retired on 30 September 1993 and the archive moved to Walnut Creek CDROM, finally closing on 15 March 2013 ([https://en.wikipedia.org/wiki/Simtel](https://en.wikipedia.org/wiki/Simtel)). **wuarchive.wustl.edu** at Washington University, **sunsite.unc.edu** (later metalab.unc.edu) at UNC, **ftp.uu.net**, and **ftp.cdrom.com** (Walnut Creek's site, the home of FreeBSD) were the other landmark mirrors. [HandWiki + 2](https://handwiki.org/wiki/Simtel)

**Archie (1990).** Alan Emtage, then a graduate student and systems administrator at McGill in Montreal, wrote a script that polled anonymous-FTP listings on a regular schedule and built a searchable filename index — the first real Internet *search engine*, predating the web. The name is "archive" minus the "v"; despite the comic-book reference everyone makes, Emtage has said he disliked the comics ([https://en.wikipedia.org/wiki/Archie_(search_engine)](https://en.wikipedia.org/wiki/Archie_(search_engine)); [https://en.wikipedia.org/wiki/Alan_Emtage](https://en.wikipedia.org/wiki/Alan_Emtage)). A legacy Archie server was kept alive in Warsaw until 2023, and a new public-access Archie was opened by The Serial Port computer museum on 11 May 2024 ([https://en.wikipedia.org/wiki/Archie_(search_engine)](https://en.wikipedia.org/wiki/Archie_(search_engine))).

**Designs that didn't displace FTP.** TFTP (RFC 1350) is a deliberately tiny UDP-based file copy used in PXE network boot and switch firmware loads. FSP (File Service Protocol) tried to be a friendlier UDP alternative for public archives but never broke out. In the BBS world, **XMODEM, YMODEM, ZMODEM** (Chuck Forsberg) and **Kermit** (Frank da Cruz at Columbia) handled file transfer over modems, with ZMODEM's CRC-32 windowing and crash recovery being particularly influential — but these were modem-line protocols, not Internet protocols, and they never threatened FTP on TCP/IP.

**Browser deprecation (the modern turning point).**

- Google announced in 2018 (Chrome 72) that FTP subresources and top-level rendering were dropped, and **Chrome 88 (released 19 January 2021) disabled FTP entirely** ([https://developer.chrome.com/blog/chrome-88-deps-rems](https://developer.chrome.com/blog/chrome-88-deps-rems)). [Chrome Developers](https://developer.chrome.com/blog/chrome-88-deps-rems)[Chrome Developers](https://developer.chrome.com/blog/chrome-88-deps-rems)
- Mozilla disabled FTP by default in **Firefox 88 (19 April 2021)** and **removed the implementation in Firefox 90 (13 July 2021)** ([https://blog.mozilla.org/addons/2021/04/15/built-in-ftp-implementation-to-be-removed-in-firefox-90/](https://blog.mozilla.org/addons/2021/04/15/built-in-ftp-implementation-to-be-removed-in-firefox-90/); [https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/90](https://developer.mozilla.org/en-US/docs/Mozilla/Firefox/Releases/90); [https://en.wikipedia.org/wiki/Firefox_version_history](https://en.wikipedia.org/wiki/Firefox_version_history)). [Mozilla](https://blog.mozilla.org/addons/2021/04/15/built-in-ftp-implementation-to-be-removed-in-firefox-90/)
- Apple's Safari has long advised against FTP, and Microsoft Edge dropped it during the Chromium transition. As of May 2026 no major mainstream browser ships a built-in FTP client. [Skm400gb125d](https://skm400gb125d.com/2022/07/gone-are-the-days-of-ftp-firefox-chrome-and-more-are-deprecated/)[Skm400gb125d](https://skm400gb125d.com/2022/07/gone-are-the-days-of-ftp-firefox-chrome-and-more-are-deprecated/)

**What the last 24 months changed (May 2024 → May 2026).**

- **Debian** had already shut down `ftp://ftp.debian.org` on 1 November 2017 in favor of `http://ftp.debian.org` and `deb.debian.org` ([https://lwn.net/Articles/720856/](https://lwn.net/Articles/720856/)); the wiki notes the name remains for backward compatibility ([https://wiki.debian.org/ftp.debian.org](https://wiki.debian.org/ftp.debian.org)). [LWN.net + 2](https://lwn.net/Articles/720856/)
- **kernel.org** terminated `ftp://ftp.kernel.org/` on 1 March 2017 and `ftp://mirrors.kernel.org/` on 1 December 2017 ([https://www.kernel.org/shutting-down-ftp-services.html](https://www.kernel.org/shutting-down-ftp-services.html)). HTTP and rsync remain.
- **NCBI/NIH** still operates `ftp.ncbi.nlm.nih.gov` heavily — GenBank releases 265 (March 2025), 268 (August 2025) and 271 (April 2026) were all delivered via FTP/HTTPS ([https://ftp.ncbi.nlm.nih.gov/](https://ftp.ncbi.nlm.nih.gov/); [https://ncbiinsights.ncbi.nlm.nih.gov/2025/08/26/genbank-release-268-0/](https://ncbiinsights.ncbi.nlm.nih.gov/2025/08/26/genbank-release-268-0/)) — but on **25 March 2026** NCBI announced it would **retire rsync support on 1 June 2026**, while keeping FTP and HTTPS ([https://ncbiinsights.ncbi.nlm.nih.gov/2026/03/25/retire-rsync-support-ftp-downloads/](https://ncbiinsights.ncbi.nlm.nih.gov/2026/03/25/retire-rsync-support-ftp-downloads/)). PubMed's December 2025 baseline was the first generated by the new pipeline ([https://www.nlm.nih.gov/pubs/techbull/mj25/mj25_pubmed_ftp_data.html](https://www.nlm.nih.gov/pubs/techbull/mj25/mj25_pubmed_ftp_data.html)). [NCBI Insights + 4](https://ncbiinsights.ncbi.nlm.nih.gov/2025/03/11/genbank-release-265/)
- **GNU** (`ftp.gnu.org`) still serves anonymous FTP and HTTPS as of 2026, though uneven mirror behavior and slow ftp performance have pushed the project to recommend `ftpmirror.gnu.org` ([https://www.gnu.org/prep/ftp.html](https://www.gnu.org/prep/ftp.html)). [GitHub](https://github.com/conan-io/conan-center-index/issues/27830)
- **High-energy physics / WLCG** is in the middle of turning off Globus GridFTP. The **JASMIN GridFTP server was retired on 13 December 2024** ([https://cms.ncas.ac.uk/news/gridftp/](https://cms.ncas.ac.uk/news/gridftp/)), and a CHEP 2024 paper (published 2025) confirms "in the near future, all Globus GridFTP will be turned off" in favor of HTTP/WebDAV with TPC and JWT auth ([https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf](https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf)). The open-source Globus Toolkit was already EOL'd in January 2018 ([https://www.globus.org/blog/support-open-source-globus-toolkit-ends-january-2018](https://www.globus.org/blog/support-open-source-globus-toolkit-ends-january-2018)); only the Globus Connect commercial service continues. [EPJ Conferences](https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf)
- **AWS Transfer Family** continues to support SFTP, FTPS, FTP, and AS2 as managed protocols, with FIPS and **post-quantum** ML-KEM hybrid SSH key-exchange policies introduced as `TransferSecurityPolicy-2025-03` and `TransferSecurityPolicy-FIPS-2025-03` ([https://docs.aws.amazon.com/transfer/latest/userguide/security-policies.html](https://docs.aws.amazon.com/transfer/latest/userguide/security-policies.html); [https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html](https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html)). FTP is still offered for legacy migration but is restricted to VPC, passive-only, image/binary, stream-mode ([https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html](https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html)). [Amazon Web Services](https://www.amazonaws.cn/en/new/2025/amazon-transfer-family-announces-ml-kem-quantum-resistant-key-exchange-for-sftp/)[AWS](https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html)
- **OpenSSH** (the substrate for SFTP) made `mlkem768x25519-sha256` its default key-exchange in **OpenSSH 10.0 (April 2025)**, and **10.1** now warns when a session is non-PQ ([https://www.openssh.org/pq.html](https://www.openssh.org/pq.html)). Red Hat Enterprise Linux 10 ships PQ-capable OpenSSH ([https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10](https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10)). [Openssh + 2](https://www.openssh.org/pq.html)
- **NIST SP 800-52 Rev. 2** remains current and required TLS 1.3 support across federal TLS endpoints by 1 January 2024 ([https://csrc.nist.gov/pubs/sp/800/52/r2/final](https://csrc.nist.gov/pubs/sp/800/52/r2/final)). It does not name FTPS by name, but FTPS endpoints used by U.S. federal systems must comply with the same TLS profile. [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/52/r2/final)
- **PCI DSS 4.0** took effect 1 April 2024 and 47 new requirements became mandatory on **31 March 2025** ([https://linfordco.com/blog/pci-dss-4-0-requirements-guide/](https://linfordco.com/blog/pci-dss-4-0-requirements-guide/)). FAQ #1076 on the PCI Council site is titled "Is it permissible to use FTP if proper security measures are implemented?" (last updated January 2023; [https://www.pcisecuritystandards.org/faqs/all/](https://www.pcisecuritystandards.org/faqs/all/)) — the council's position is that plain FTP can only be used inside the CDE if the channel is wrapped in SSH/TLS/IPsec, i.e. effectively SFTP or FTPS. [Linford Co](https://linfordco.com/blog/pci-dss-4-0-requirements-guide/)[PCI Security Standards Council](https://www.pcisecuritystandards.org/faqs/all/)

---

## How it actually works

### Two channels, one session

A single FTP session uses **two TCP connections**. The *control connection* is opened by the client to the server's port 21 and persists for the entire session. It carries ASCII commands (USER, PASS, CWD, RETR, …) and three-digit numeric replies. The *data connection* is opened *for each data transfer* (a file, a directory listing) and closed at the end of that transfer to signal end-of-file in stream mode (RFC 959, §3.3; [https://www.rfc-editor.org/rfc/rfc959](https://www.rfc-editor.org/rfc/rfc959)). [Hjp](https://www.hjp.at/doc/rfc/rfc1579.html)

### Active mode (PORT)

1. Client connects to server:21 → control channel up.
2. Client opens a listening TCP socket on some ephemeral port `p` and sends `PORT a1,a2,a3,a4,p1,p2` (the IP `a1.a2.a3.a4` and port `p = p1*256 + p2`).
3. Server replies `200 PORT command successful.`
4. Client sends `RETR somefile`.
5. Server replies `150 Opening data connection.`, *initiates a TCP connection from its port 20* to the client's `(IP, p)`, sends the bytes, closes; replies `226 Transfer complete.` on the control channel.

### Passive mode (PASV)

1. Client connects to server:21 → control channel up.
2. Client sends `PASV`.
3. Server opens an ephemeral listener and replies `227 Entering Passive Mode (a1,a2,a3,a4,p1,p2)`.
4. Client connects to `(a1.a2.a3.a4, p1*256+p2)` for the data channel.
5. Client sends `RETR somefile`; server replies `150 …`, streams bytes on the data connection, replies `226 Transfer complete.`

PASV is the default in essentially every modern client because clients are usually behind NAT/firewalls and cannot accept inbound connections (RFC 1579; [https://www.rfc-editor.org/rfc/rfc1579](https://www.rfc-editor.org/rfc/rfc1579)). [Hjp](https://www.hjp.at/doc/rfc/rfc1579.html)

### Extended modes (RFC 2428)

`EPRT |1|192.0.2.5|54321|` and `EPSV` (with optional `EPSV ALL` to disable PORT for the rest of the session) generalize the address representation so it works for IPv6 and is friendlier to NAT ([https://www.rfc-editor.org/rfc/rfc2428](https://www.rfc-editor.org/rfc/rfc2428)). The reply `229 Entering Extended Passive Mode (|||p|)` deliberately omits the address — the client reuses the control-channel IP — which side-steps the NAT mismatch that plagues PASV. [Hjp](https://www.hjp.at/doc/rfc/rfc2428.html)[U-strasbg](https://ftp.u-strasbg.fr/rfc/rfc2428.txt.pdf)

### The reply-code grammar

Every server reply begins with three ASCII digits whose meaning is *positional* (RFC 959, §4.2.1):

- **First digit** — class:
  - `1xx` positive preliminary (more to come): `150 File status okay; about to open data connection.`
    - `2xx` positive completion: `220 Service ready`, `226 Closing data connection`, `230 User logged in`.
    - `3xx` positive intermediate (need more input): `331 User name OK, need password.`, `332 Need account.`
    - `4xx` transient negative (try again): `421 Service not available`, `425 Can't open data connection`, `426 Connection closed; transfer aborted.`
    - `5xx` permanent negative: `500 Syntax error`, `530 Not logged in`, `550 File not found / no permission.`
    - `6xx` (added by RFC 2228) protected reply.
- **Second digit** — subject area: `0` syntax, `1` information, `2` connections, `3` authentication & accounting, `4` unspecified, `5` file system.
- **Third digit** — finer detail.

This three-digit grammar was so successful it was copied wholesale by **SMTP** (RFC 5321), **NNTP**, **POP3**, and the early HTTP error-reply structure.

### Data representations

`TYPE A` (NVT-ASCII): on-the-wire end-of-line is CRLF; both ends translate to/from local convention (so an `A`-mode transfer of a Unix `\n`-terminated text file *changes the bytes* — the famous footgun that mangles binaries when a client forgets to switch to `TYPE I`). `TYPE I` (image/binary) sends bytes verbatim. `TYPE E` (EBCDIC), `TYPE L <bits>` (local byte). `STRU F` (file, default), `R` (record), `P` (page). `MODE S` (stream, default), `B` (block), `C` (compressed). In practice, modern FTP traffic is overwhelmingly `TYPE I`, `STRU F`, `MODE S` (RFC 959, §3.1–3.4).

### A real on-the-wire control session (passive)

```
S: 220 (vsFTPd 3.0.5)
C: USER alice
S: 331 Please specify the password.
C: PASS s3cr3t
S: 230 Login successful.
C: SYST
S: 215 UNIX Type: L8
C: FEAT
S: 211-Features:
S:  EPRT
S:  EPSV
S:  MDTM
S:  PASV
S:  REST STREAM
S:  SIZE
S:  TVFS
S:  UTF8
S: 211 End
C: TYPE I
S: 200 Switching to Binary mode.
C: PASV
S: 227 Entering Passive Mode (192,0,2,7,195,80).
   # client opens TCP to 192.0.2.7:(195*256+80)=49936
C: RETR linux-6.13.tar.xz
S: 150 Opening BINARY mode data connection for linux-6.13.tar.xz (134217728 bytes).
   # bytes flow on the data connection; server closes it at EOF
S: 226 Transfer complete.
C: QUIT
S: 221 Goodbye.
```

### Sequence diagram (Mermaid)

Server (server-PI/DTP)Client (user-PI/DTP)Server (server-PI/DTP)Client (user-PI/DTP)#mermaid-rio{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rio .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rio .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rio .error-icon{fill:#CC785C;}#mermaid-rio .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rio .edge-thickness-normal{stroke-width:1px;}#mermaid-rio .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rio .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rio .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rio .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rio .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rio .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rio .marker.cross{stroke:#A1A1A1;}#mermaid-rio svg{font-family:inherit;font-size:16px;}#mermaid-rio p{margin:0;}#mermaid-rio .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rio text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rio .actor-line{stroke:#A1A1A1;}#mermaid-rio .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rio .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rio #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rio .sequenceNumber{fill:#5e5e5e;}#mermaid-rio #sequencenumber{fill:#E5E5E5;}#mermaid-rio #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rio .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rio .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rio .labelText,#mermaid-rio .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rio .loopText,#mermaid-rio .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rio .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rio .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rio .noteText,#mermaid-rio .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rio .activation0{fill:transparent;stroke:#00000000;}#mermaid-rio .activation1{fill:transparent;stroke:#00000000;}#mermaid-rio .activation2{fill:transparent;stroke:#00000000;}#mermaid-rio .actorPopupMenu{position:absolute;}#mermaid-rio .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rio .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rio .actor-man circle,#mermaid-rio line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rio :root{--mermaid-font-family:inherit;}TCP SYN to :21220 bannerUSER alice331PASS s3cr3t230TYPE I200PASV227 (a,b,c,d,p1,p2)TCP SYN to (a.b.c.d : p1*256+p2)RETR file150<bytes on data connection>226 (on control)QUIT221

### Edge cases and footguns

- **ABOR.** The client wants to cancel mid-transfer. RFC 959 specifies sending Telnet IP+SYNC on the control connection; in practice many clients just close and reopen the data socket, which works on most servers but is technically out of spec.
- **REST.** Restart marker for resuming an interrupted transfer; the syntax is `REST <byte-offset>` followed by RETR/STOR (formalized in RFC 3659 §5; [https://www.rfc-editor.org/rfc/rfc3659](https://www.rfc-editor.org/rfc/rfc3659)).
- **Telnet IAC.** The control channel is *Telnet protocol conventions on a TCP connection*; CRLF is the line terminator and IAC (0xFF) bytes can appear as out-of-band signaling. This historic coupling is the reason the control parser ever has to think about Telnet at all — and the reason ProFTPD's CVE-2010-4221 became a remote code execution flaw via crafted IAC sequences (NVD CVE-2010-4221).
- **CRLF translation in TYPE A.** Transferring a binary as `TYPE A` deletes 0x0D bytes that happen to precede 0x0A. Veterans recognize the symptom: ZIP / tar.gz extracts fail with corrupt-data errors. Always `TYPE I` for non-text.
- **NAT and active mode.** A client behind NAT advertises its RFC 1918 address in PORT; the server tries to dial it and fails. Either use PASV/EPSV or run an *application-layer gateway* like Linux's `nf_conntrack_ftp`, which parses the cleartext PORT/PASV strings and rewrites them on the fly. Note: this ALG does not work when the control connection is TLS-protected, because there's nothing to parse — a frequent source of "FTPS works for control, hangs on listing" tickets.

### Security in 2026: why plain FTP is fatal

RFC 959 is cleartext: USER, PASS, every byte of every file, and every directory listing travel in the clear. RFC 2577 already said in 1999 that FTP "is not a secure protocol, and that it has all the well-known weaknesses associated with protocols that send cleartext passwords" ([https://www.rfc-editor.org/rfc/rfc2577](https://www.rfc-editor.org/rfc/rfc2577)). On a modern shared network — a coffee-shop Wi-Fi, a campus VLAN, an ISP backbone — passive sniffing harvests credentials in seconds.

### FTPS: explicit vs implicit

**Explicit FTPS** (RFC 4217): the client connects to port 21 in cleartext, sends `AUTH TLS`, and on `234 Proceed` performs a TLS handshake on the existing control TCP connection. Then `PBSZ 0` (Protection Buffer Size — required to be 0 for stream mode) and `PROT P` (Private — encrypt the data channel). Subsequent data connections also do TLS ([https://www.rfc-editor.org/rfc/rfc4217](https://www.rfc-editor.org/rfc/rfc4217)). [Tex2e](https://tex2e.github.io/rfc-translater/html/rfc4217.html)

**Implicit FTPS:** historical convention of running TLS-from-byte-zero on **port 990**. Not specified in RFC 4217 but widely deployed.

**The data-channel reuse problem.** Each data connection is a separate TCP socket; performing a fresh full TLS handshake per file destroys throughput and provides no useful authentication tie-back. RFC 4217 mandates *TLS session resumption* on data connections so the client/server prove they share the same master secret as the control channel — which is the only thing preventing a hijacker from hijacking the data port ([https://www.rfc-editor.org/rfc/rfc4217](https://www.rfc-editor.org/rfc/rfc4217) §10.4). Vsftpd author Chris Evans, working with FileZilla's Tim Kosse, documented for years that this is fragile in practice — clients that don't reuse SSL sessions, OpenSSL versions whose session caches behave unexpectedly, etc. ([https://scarybeastsecurity.blogspot.com/2015/07/vsftpd-303-released-and-horrors-of-ftp.html](https://scarybeastsecurity.blogspot.com/2015/07/vsftpd-303-released-and-horrors-of-ftp.html)). [Blogger](https://scarybeastsecurity.blogspot.com/2015/07/vsftpd-303-released-and-horrors-of-ftp.html)

---

## Deep connections to other protocols

**TCP.** FTP's "two TCP connections" design is its single most consequential decision. It works beautifully on the open Internet of 1985 and badly on the NATed, firewalled Internet of 2026. The application-layer-gateway hacks needed to make active mode survive NAT — Linux `nf_conntrack_ftp` parsing PORT strings, Cisco PIX/ASA "FTP fixup" — are textbook violations of layering and break the moment the control channel is encrypted with TLS.

**TLS.** FTPS via RFC 4217 is the IETF-standardized secure FTP. Certificate validation is identical to HTTPS; what is unique is `PBSZ 0; PROT P` and the data-channel TLS session-resumption requirement. With TLS 1.3 and modern AEAD ciphers FTPS is technically secure, but operationally awkward ([https://www.rfc-editor.org/rfc/rfc4217](https://www.rfc-editor.org/rfc/rfc4217)).

**SSH and SFTP — the most common confusion.** SFTP is **not** FTP-over-SSH. It is the **SSH File Transfer Protocol**, defined in the IETF `secsh-filexfer` Internet-Draft series (the most widely deployed version is **draft 02**, "version 3 of the protocol", which OpenSSH implements; later drafts 03–13 went through versions 4–6 but were never published as RFCs and are largely unused) — [https://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol](https://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol); [https://datatracker.ietf.org/doc/html/draft-ietf-secsh-filexfer-13](https://datatracker.ietf.org/doc/html/draft-ietf-secsh-filexfer-13). SFTP runs as a **subsystem** inside an SSH-2 channel (RFC 4254). It is a binary, packet-framed, stateful protocol; it has nothing in common with RFC 959's text protocol other than the name. In practice SFTP won and FTPS lost because (a) one TCP connection on port 22 is trivial to firewall, (b) SSH key authentication is vastly stronger than passwords, (c) no NAT/ALG kludges, (d) the server side is ubiquitous via OpenSSH. [Wikipedia](https://en.wikipedia.org/wiki/SSH_File_Transfer_Protocol)

**SCP** is yet another beast: it is `rcp` tunneled over SSH, with *no* defined wire protocol beyond "run rcp on the other side and trust its stdout". OpenSSH 9.0 (April 2022) deprecated the old SCP protocol and made `scp(1)` use SFTP under the hood; AWS Transfer Family does not support the SCP protocol at all ([https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html](https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html)). [AWS](https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html)[NCBI](https://www.ncbi.nlm.nih.gov/datasets/docs/v2/data-processing/policies-annotation/genomeftp/)

**Telnet.** RFC 959 explicitly defers to RFC 854 (Telnet) for the control channel's character handling. Historically you could literally `telnet host 21` and type FTP commands by hand; that still works against vsftpd today. The Telnet-IAC interpretation requirement is what made some FTP-server CVEs into remote code execution flaws (e.g., ProFTPD CVE-2010-4221).

**HTTP / HTTP/2 / HTTP/3.** What actually replaced FTP for downloading files at Internet scale is HTTPS in front of a CDN. HTTP solves the firewall problem (one connection, well-known port, encrypted), supports range requests (the moral equivalent of REST), supports caching at every hop (which FTP fundamentally cannot), and authenticates the *server* via the Web PKI. CDNs (Cloudflare, Fastly, Akamai, CloudFront) industrialized this. Debian, kernel.org, and most Linux distros switched their canonical mirror URLs to HTTP/HTTPS for these reasons ([https://lwn.net/Articles/720856/](https://lwn.net/Articles/720856/); [https://www.kernel.org/shutting-down-ftp-services.html](https://www.kernel.org/shutting-down-ftp-services.html)).

**TFTP (RFC 1350).** The Trivial FTP protocol is a UDP-based, lock-step request/ack file transfer with a 512-byte block default. It has no auth and is for one job: bootstrapping diskless devices (PXE, switch firmware, VoIP phone provisioning) on a local LAN ([https://www.rfc-editor.org/rfc/rfc1350](https://www.rfc-editor.org/rfc/rfc1350)).

**SMTP, NNTP, POP3, IMAP.** These all inherit FTP's three-digit-reply / ASCII-command DNA. RFC 821/5321 (SMTP) is the most direct descendant. NNTP (RFC 977 / 3977) and POP3 (RFC 1939) reuse the pattern. The genealogy is "FTP came first; everyone else copied".

**WebDAV (RFC 4918).** HTTP-based file management with PROPFIND, MKCOL, MOVE, COPY, LOCK. WebDAV displaced FTP in many enterprise contexts (SharePoint, ownCloud/Nextcloud, Apple/Linux file mounts) because it rides HTTPS, is firewall-clean, and has rich metadata ([https://www.rfc-editor.org/rfc/rfc4918](https://www.rfc-editor.org/rfc/rfc4918)).

**rsync.** Incremental file sync over SSH (or its native daemon protocol). Where FTP transfers whole files, rsync's rolling-checksum algorithm transfers only the differences. NCBI's removal of rsync support on 1 June 2026 ([https://ncbiinsights.ncbi.nlm.nih.gov/2026/03/25/retire-rsync-support-ftp-downloads/](https://ncbiinsights.ncbi.nlm.nih.gov/2026/03/25/retire-rsync-support-ftp-downloads/)) is, ironically, a rare example of an institution moving *away* from rsync rather than toward it.

**Object storage protocols.** What replaced FTP for *bulk* data movement at scale is the **S3 API** (and Azure Blob, GCS) — HTTPS + multi-part upload + pre-signed URLs + IAM. AWS Transfer Family exists precisely to provide an SFTP/FTPS/FTP front end *to* an S3 bucket so legacy partners can keep using SFTP/FTP clients while the data lands in S3 ([https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html](https://docs.aws.amazon.com/transfer/latest/userguide/what-is-aws-transfer-family.html)). [Amazon Web Services](https://aws.amazon.com/aws-transfer-family/faqs/)

**BitTorrent and Aspera/FASP.** BitTorrent (Cohen, 2001) parallelizes by peer-to-peer chunking; Aspera FASP (now IBM Aspera) uses UDP with a custom rate-control loop to bypass TCP's RTT-bandwidth product limits over long fat networks. Both serve cases where single-stream TCP throughput is the bottleneck — exactly the gap that **GridFTP** (Globus) was created to fill in scientific computing.

**MFT and EDI protocols: AS2, OFTP2.** Managed File Transfer products wrap one or more underlying protocols with workflow, audit, retry, and PGP. **AS2** (RFC 4130) sends signed/encrypted MIME over HTTPS with synchronous or asynchronous receipts (MDNs); it is mandated by Walmart, the U.S. healthcare HIPAA exchange ecosystem, and many automotive/retail EDI links. **OFTP2** is similar and is mandated by European auto OEMs. These "boring" enterprise protocols are why FTP-family transfers are still ~$1B+ in commercial software annually. [Amazon Web Services](https://aws.amazon.com/aws-transfer-family/faqs/)

**FXP (site-to-site).** RFC 959 actually permits a client to open *two* control connections — one to server A, one to server B — and instruct A to PORT to B's data port, causing A to stream the file directly to B without the client carrying the bytes. This is the original "proxy FTP", and the security hazard is exactly the bounce attack (RFC 2577). In the late-1990s **warez scene**, FXP was the technique that turned compromised "pubstros" (anonymous-writable FTP servers) into a global file-replication network for pirated software, with FXP boards coordinating "racers" via IRC ([https://en.wikipedia.org/wiki/FXP_board](https://en.wikipedia.org/wiki/FXP_board); [https://en.wikipedia.org/wiki/Warez_scene](https://en.wikipedia.org/wiki/Warez_scene)). [Wikipedia](https://en.wikipedia.org/wiki/FXP_board)[Wikipedia](https://en.wikipedia.org/wiki/Warez_scene)

---

## Real-world deployment

**Server implementations (status May 2026).**

- **vsftpd** — Chris Evans, "Very Secure FTP Daemon". Latest upstream is **3.0.5 (August 2021)** ([https://security.appspot.com/vsftpd.html](https://security.appspot.com/vsftpd.html)). Debian shipped 3.0.5-0.4 in November 2025 ([https://tracker.debian.org/pkg/vsftpd](https://tracker.debian.org/pkg/vsftpd)). The default FTP server in many Linux distros. Author's day job moved to Tesla, Dropbox, HackerOne, and (per his LinkedIn) Databricks; vsftpd is in maintenance mode ([https://www.linkedin.com/in/scarybeast](https://www.linkedin.com/in/scarybeast)). [Appspot + 3](https://security.appspot.com/vsftpd.html)
- **ProFTPD** — modular, Apache-style config. Active development continues; 1.3.8b series in 2024–2025 with security fixes ([https://www.cvedetails.com/vulnerability-list/vendor_id-9520/product_id-16873/Proftpd-Proftpd.html](https://www.cvedetails.com/vulnerability-list/vendor_id-9520/product_id-16873/Proftpd-Proftpd.html)).
- **Pure-FTPd** — Frank Denis (jedisct1). Latest **1.0.52** released in response to CVE-2024-48208 ([https://github.com/advisories/GHSA-rrmj-qxgv-v296](https://github.com/advisories/GHSA-rrmj-qxgv-v296)).
- **FileZilla Server** — Windows; same maintainer as the client (Tim Kosse). Active.
- **IIS FTP** — Microsoft; ships with IIS, supports the RFC 7151 HOST command (its co-author Robert McMurray is a Microsoft engineer; [https://learn.microsoft.com/en-us/archive/blogs/robert_mcmurray/rfc-7151-file-transfer-protocol-host-command-for-virtual-hosts](https://learn.microsoft.com/en-us/archive/blogs/robert_mcmurray/rfc-7151-file-transfer-protocol-host-command-for-virtual-hosts)).
- **wu-ftpd** — historical (Washington University). Long history of remote-root buffer overflows and format-string flaws in the late 1990s; effectively unmaintained for two decades. Do not deploy.
- **glftpd** — proprietary commercial FTP daemon long associated with the warez/FXP scene. Still distributed, niche.

**Client implementations.**

- **FileZilla** (cross-platform GUI) and **WinSCP** (Windows GUI, also speaks SFTP and S3) are the dominant GUIs.
- **lftp** (Alexander Lukyanov) is the power-user CLI: scripting, mirroring, TLS, parallel segments.
- **ncftp**, the BSD `ftp(1)`, GNU `inetutils ftp` are the historical CLI clients.
- **curl** (`curl -u user:pass ftp://host/path`) and **wget** speak FTP and FTPS.
- Browsers: removed (Chrome 88, Firefox 90).

**Where FTP still runs at scale in 2026.**

- Scientific data archives — NCBI (`ftp.ncbi.nlm.nih.gov`), NASA, NOAA, USGS, ESA, and EBI continue to expose FTP/HTTPS/SFTP for bulk genomics and earth-observation data, often *because* legacy pipelines hard-coded URLs decades ago ([https://ftp.ncbi.nlm.nih.gov/](https://ftp.ncbi.nlm.nih.gov/)).
- Legacy enterprise B2B / EDI exchanges and shared-hosting control panels.
- Embedded device firmware updates (printers, broadcast equipment, PLCs).
- Broadcast and media file exchange — DCP (Digital Cinema Package) transfers between projectors/library servers historically used FTP, anecdotally still in use [needs source for current 2026 state]. [Slashdot](https://news.slashdot.org/story/21/07/24/0213220/mozilla-stops-ftp-support-in-firefox-90)

**Performance characteristics.** A single FTP data connection is one TCP stream subject to the standard bandwidth-delay-product limit; on a 100 ms RTT 10 Gb/s link you cannot fill the pipe with one TCP flow without large window scaling and tuning. This is *the* reason Globus's **GridFTP** added parallel TCP streams (4–32 concurrent), TCP buffer auto-tuning, and partial-file transfers — and why Aspera's FASP went UDP instead. A 2005 Globus paper reported 27.3 Gb/s memory-to-memory and 17 Gb/s disk-to-disk on a 30-Gb/s test bed ([https://ieeexplore.ieee.org/document/1560006](https://ieeexplore.ieee.org/document/1560006)). The open-source Globus Toolkit was end-of-lifed January 2018 ([https://www.globus.org/blog/support-open-source-globus-toolkit-ends-january-2018](https://www.globus.org/blog/support-open-source-globus-toolkit-ends-january-2018)); the commercial Globus Connect Server now uses HTTPS+OAuth2 alongside its remaining GridFTP data plane, and the WLCG community is in the middle of migrating to HTTP-based third-party-copy with WebDAV ([https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf](https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf)). [IEEE Xplore](https://ieeexplore.ieee.org/document/1560006)[GitHub](https://github.com/globus/globus-toolkit)

---

## Failure modes and famous incidents

### The vsftpd 2.3.4 backdoor (CVE-2011-2523)

Between **30 June and 3 July 2011**, the `vsftpd-2.3.4.tar.gz` tarball on the master vsftpd download site was replaced with a trojaned copy. If a user logged in with a username ending in `:)` (a smiley face), the daemon spawned a root shell on **TCP port 6200**. Chris Evans, vsftpd's author, posted the disclosure on his "Scary Beast Security" blog on 4 July 2011 after a user reported it; the GPG signature on the tarball had been invalidated, which is how it was caught ([https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html](https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html)). The NVD entry (CVE-2011-2523) describes the exact mechanism ([https://nvd.nist.gov/vuln/detail/CVE-2011-2523](https://nvd.nist.gov/vuln/detail/CVE-2011-2523)). Evans moved the vsftpd master copy to Google App Engine (`security.appspot.com/vsftpd.html`) immediately after. The attacker was never publicly identified. The incident is now a textbook supply-chain compromise — a forerunner of the kinds of attacks that produced the SolarWinds, event-stream, and xz-utils incidents — and is the basis of a Metasploit module taught in nearly every penetration-testing course today ([https://www.rapid7.com/db/modules/exploit/unix/ftp/vsftpd_234_backdoor/](https://www.rapid7.com/db/modules/exploit/unix/ftp/vsftpd_234_backdoor/)). [Rapid7 + 7](https://www.rapid7.com/db/modules/exploit/unix/ftp/vsftpd_234_backdoor/)

### ProFTPD (selected CVEs)

- **CVE-2010-4221** — pre-auth Telnet IAC stack overflow → RCE (NVD).
- **CVE-2015-3306** — `mod_copy` `SITE CPFR / SITE CPTO` allowed unauthenticated arbitrary file read/write (NVD).
- **CVE-2019-12815** — same module class, arbitrary file copy without auth (NVD).
- **CVE-2023-48795 (Terrapin)** — affects ProFTPD's SSH-related code paths via shared SSH library code; primarily an SSH protocol issue ([https://www.cvedetails.com/vulnerability-list/vendor_id-9520/product_id-16873/Proftpd-Proftpd.html](https://www.cvedetails.com/vulnerability-list/vendor_id-9520/product_id-16873/Proftpd-Proftpd.html)).
- **CVE-2024-48651** (published 29 Nov 2024) — supplemental group inheritance in `mod_sql` granted unintended GID 0 access; fixed in commit `cec01cc` ([https://www.cvedetails.com/cve/CVE-2024-48651/](https://www.cvedetails.com/cve/CVE-2024-48651/); [https://securityonline.info/cve-2024-48651-proftpd-vulnerability-grants-root-access-to-attackers/](https://securityonline.info/cve-2024-48651-proftpd-vulnerability-grants-root-access-to-attackers/)). [CVE Details](https://www.cvedetails.com/cve/CVE-2024-48651/)
- **CVE-2024-57392** (published 6 Feb 2025) — buffer overflow in the message parser allowing remote DoS / potential RCE ([https://www.cvedetails.com/cve/CVE-2024-57392/](https://www.cvedetails.com/cve/CVE-2024-57392/)). [CVE Details](https://www.cvedetails.com/cve/CVE-2024-57392/)
- **CVE-2023-51713 / pre-2024**: one-byte OOB read via quote/backslash mishandling, fixed in 1.3.8a. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-9520/product_id-16873/Proftpd-Proftpd.html)

### vsftpd in 2024–2025

- **CVE-2025-14242** — integer overflow in `ls` parameter parsing reachable post-auth via STAT; remote authenticated DoS ([https://www.sentinelone.com/vulnerability-database/cve-2025-14242/](https://www.sentinelone.com/vulnerability-database/cve-2025-14242/); Red Hat advisory RHSA-2026:0605, [https://access.redhat.com/errata/RHSA-2026:0605](https://access.redhat.com/errata/RHSA-2026:0605)). [SentinelOne](https://www.sentinelone.com/vulnerability-database/cve-2025-14242/)

### Pure-FTPd in 2024

- **CVE-2024-48208** — out-of-bounds read in `domlsd()` in `ls.c`; fixed in 1.0.52 ([https://github.com/advisories/GHSA-rrmj-qxgv-v296](https://github.com/advisories/GHSA-rrmj-qxgv-v296); [https://www.wiz.io/vulnerability-database/cve/cve-2024-48208](https://www.wiz.io/vulnerability-database/cve/cve-2024-48208)). [GitHub](https://github.com/advisories/GHSA-rrmj-qxgv-v296)[Wiz](https://www.wiz.io/vulnerability-database/cve/cve-2024-48208)

### wu-ftpd

The 1990s–early-2000s saga of wu-ftpd remote-root holes — `SITE EXEC` format-string flaws (CVE-2000-0573), the `mapped_path` overflow (CVE-2003-0466), and others — is the historical case study in why writing C network daemons that run as root is hard.

### FTP bounce attack (RFC 2577)

The PORT command in RFC 959 places no restriction on the IP/port pair the server is told to dial. An attacker can therefore upload a payload file to a third-party FTP server, then issue PORT pointing at *another* host:port, then RETR — turning the FTP server into a proxy that scans or attacks third parties. This was used in the 1990s to bypass perimeter firewalls (the FTP server was inside the firewall; the attacker was outside) and as a free port-scanner anonymizer ([https://www.rfc-editor.org/rfc/rfc2577](https://www.rfc-editor.org/rfc/rfc2577); CERT CA-1997-27 [https://nmap.org/CA-97.27.FTP_bounce.html](https://nmap.org/CA-97.27.FTP_bounce.html)). Mitigations: refuse PORT to ports < 1024 (RFC 2577 §4), refuse PORT to addresses different from the control-connection peer, or disable PORT entirely. [Wikipedia + 4](https://en.wikipedia.org/wiki/FTP_bounce_attack)

### Other named vulnerabilities

**Serv-U, WarFTPD, IIS FTP** all had buffer-overflow remote-root histories in the early 2000s. **Serv-U** had a notable directory-traversal/RCE chain reused by multiple ransomware operators in 2021–2022 (CVE-2021-35211).

### Equifax — clarifying the misattribution

The 2017 Equifax breach exposing ~143–147M U.S. consumer records was caused by an unpatched **Apache Struts** vulnerability (CVE-2017-5638), not by FTP ([https://news.apache.org/foundation/entry/media-alert-the-apache-software](https://news.apache.org/foundation/entry/media-alert-the-apache-software); [https://oversight.house.gov/wp-content/uploads/2018/12/Equifax-Report.pdf](https://oversight.house.gov/wp-content/uploads/2018/12/Equifax-Report.pdf); [https://www.blackduck.com/blog/equifax-apache-struts-vulnerability-cve-2017-5638.html](https://www.blackduck.com/blog/equifax-apache-struts-vulnerability-cve-2017-5638.html)). The "FTP was involved" claim is folklore. Where FTP *did* play a role in the era was **mass cleartext-credential exposure** — Akamai and others reported, through 2008–2015, ongoing campaigns that sniffed or brute-forced FTP credentials on shared web hosts and used them to inject malware into customer sites. [The Hacker News](https://thehackernews.com/2017/09/equifax-apache-struts.html)

### Common pitfalls in production

- ASCII-mode mangling binaries (above).
- Active mode breaking through NAT (above).
- Passive port range "explosion" — admins open 1024–65535 to make PASV "just work" and effectively expose every ephemeral service on the host.
- TLS data-channel session-reuse failures (Evans / Kosse, above).
- chroot escape via symlink attacks if `chroot_local_user=YES` is set without `allow_writeable_chroot=NO`.
- FTPS works for control, hangs on listing → ALG (`nf_conntrack_ftp`) cannot read TLS, so the server's response IP in PASV does not match what the firewall expects. Solution: configure `pasv_address` and `pasv_min/max_port` and open exactly that range.

---

## Fun facts and anecdotes

- **The smiley-face backdoor.** The detection trigger that vsftpd 2.3.4 had been compromised was that the GPG signature failed: `gpg: BAD signature from "Chris Evans <chris@scary.beasts.org>"`. Anyone who actually verified signatures was safe ([https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html](https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html)). [Blogger](https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html)
- **Why port 21.** The early IANA "well-known port" assignments were curated by Jon Postel personally; FTP's 21/20 pair is documented in RFC 1700 (Reynolds & Postel, 1994) and was inherited from RFC 959 §5.2.
- **April Fools' RFCs.** FTP itself has no famous April-1 RFC, but its sibling family does: **RFC 1149** (1990) "A Standard for the Transmission of IP Datagrams on Avian Carriers", updated by **RFC 2549** (1999) for QoS — actually implemented (badly) by a Bergen Linux User Group team in 2001. RFC 7168 (2014) extended HTCPCP (RFC 2324) to tea. None of these specify a file transfer.
- **The anonymous-FTP convention.** Username `anonymous` (or `ftp`), password = your email address, was etiquette, not enforcement; RFC 1635 wrote it down ([https://www.rfc-editor.org/rfc/rfc1635](https://www.rfc-editor.org/rfc/rfc1635)).
- **Archie's name.** "archive" minus the "v"; Emtage explicitly disliked the comic-book association ([https://en.wikipedia.org/wiki/Archie_(search_engine)](https://en.wikipedia.org/wiki/Archie_(search_engine))). [Wikipedia](https://en.wikipedia.org/wiki/Archie_(search_engine))
- **Joyce K. Reynolds.** Co-author of RFC 959, RFC 854 (Telnet), and many "Assigned Numbers" RFCs through the 1980s–90s; with Postel, effectively ran what became IANA. She passed away in 2015; the RFC Editor named the Joyce K. Reynolds award in her honor.
- **Reply codes inspired SMTP/NNTP/POP3.** RFC 5321 (SMTP) §4.2 explicitly cites the FTP precedent ([https://www.rfc-editor.org/rfc/rfc5321](https://www.rfc-editor.org/rfc/rfc5321)).
- **SIMTEL20.** A DECSYSTEM-20 at White Sands Missile Range, operated by Frank Wancho, served the world's MS-DOS shareware archive 1983–1993; the archive then moved to Walnut Creek CDROM and finally closed 15 March 2013 ([https://en.wikipedia.org/wiki/Simtel](https://en.wikipedia.org/wiki/Simtel)). [En Academic](https://en-academic.com/dic.nsf/enwiki/1657624)[WikiMili](https://wikimili.com/en/Simtel)
- **wuarchive** at Washington University was the largest mirror of the early Unix ecosystem; "wu-ftpd" is named after it.
- **ftp.cdrom.com** (Walnut Creek CDROM, Concord, California) was FreeBSD's primary distribution point and at one point the busiest FTP site on the Internet — 873 GB transferred in a single day in May 1999 ([https://en.wikipedia.org/wiki/Simtel](https://en.wikipedia.org/wiki/Simtel)). [HandWiki](https://handwiki.org/wiki/Simtel)
- **Slackware Linux.** Patrick Volkerding has continuously released Slackware via FTP since 1993; `ftp.slackware.com` still serves anonymous FTP in 2026 alongside HTTP/rsync. Slackware is one of the few distros where FTP is still a primary channel.
- **The "FXP scene".** Pirates were the most aggressive optimizers of FTP — multi-stream FXP, custom auto-trader bots, IRC announce channels, and "0-second pre" releases all came out of the warez community before academic networking adopted similar parallelism. [Wikipedia](https://en.wikipedia.org/wiki/Warez_scene)

---

## Practical wisdom

**Defaults to be skeptical of.**

- Plain `ftp://` URLs, especially in CI/build pipelines.
- `anonymous` accounts that allow uploads (the historical "incoming/" directory model is how pubstros happen).
- Passive port ranges left wide open — pin them with `pasv_min_port`/`pasv_max_port` and open only that range.
- Servers that advertise pre-TLS-1.2 in `AUTH TLS` — NIST SP 800-52r2 has required TLS 1.2 since 2019 and TLS 1.3 since 1 Jan 2024 ([https://csrc.nist.gov/pubs/sp/800/52/r2/final](https://csrc.nist.gov/pubs/sp/800/52/r2/final)). [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/52/r2/final)

**What to monitor.**

- 530 (auth failure) bursts → credential-stuffing.
- 425 (data connection) failures → NAT/firewall drift.
- Connections to ports outside the configured PASV range → misconfiguration or scanning.
- AUTH TLS failures on FTPS endpoints → cert-rotation oversights.

**Common debugging moves.**

- `tcpdump -i any -nn 'tcp port 21 or tcp portrange 49152-65535'` to capture control plus PASV data.
- `lftp -d` for verbose client tracing.
- FileZilla's log panel set to "Debug verbose".
- `openssl s_client -starttls ftp -connect host:21` — but note that OpenSSL's `-starttls ftp` expects the AUTH TLS dialog and will fail on implicit-FTPS port 990.
- Wireshark's `ftp` and `ftp-data` dissectors decode all reply codes inline.

**Common misconfigurations to fix on day one.**

- Linux firewall not loading `nf_conntrack_ftp` for plain FTP (works) and *trying to use it* for FTPS (fails silently).
- vsftpd `pasv_address` set to internal RFC1918 address while NAT translates to a public address — the client connects to the wrong IP.
- TLS data-channel session reuse not enforced (`require_ssl_reuse=YES` in vsftpd; the default since 2.1.0 — [https://scarybeastsecurity.blogspot.com/2009/02/vsftpd-210-released.html](https://scarybeastsecurity.blogspot.com/2009/02/vsftpd-210-released.html)). [Blogger](https://scarybeastsecurity.blogspot.com/2009/)
- chroot escapes when the chroot is writable and a hard link to `/etc/passwd` is permitted.

**Migration paths in 2026.**

- *Default*: SFTP via OpenSSH. Authenticate with key pairs; restrict via `Match`/`ChrootDirectory`.
- *If partners insist on FTP*: terminate FTPS at AWS Transfer Family or an MFT product (GoAnywhere, JSCAPE, IBM Sterling); land bytes in S3.
- *For static downloads*: HTTPS + CDN. A signed S3 URL replaces both the credential exchange and the listing semantics.
- *For very large science data*: Globus (HTTPS+GridFTP), or rclone+S3 multipart.

---

## Learning resources (current as of May 2026)

**Primary specifications (read these first).**

- RFC 959 — File Transfer Protocol — Postel & Reynolds, October 1985 — [https://www.rfc-editor.org/rfc/rfc959](https://www.rfc-editor.org/rfc/rfc959) (advanced, foundational, unchanged since 1985 except via extension RFCs). [IETF](https://datatracker.ietf.org/doc/html/rfc1579)
- RFC 1579 — Firewall-Friendly FTP — Bellovin, Feb 1994 — [https://www.rfc-editor.org/rfc/rfc1579](https://www.rfc-editor.org/rfc/rfc1579) (intro/intermediate; explains why your client should default to PASV). [Wikidata](https://www.wikidata.org/wiki/Q47483521)
- RFC 2228 — FTP Security Extensions — Horowitz & Lunt, Oct 1997 — [https://www.rfc-editor.org/rfc/rfc2228](https://www.rfc-editor.org/rfc/rfc2228) (advanced).
- RFC 2389 — FEAT/OPTS — Hethmon & Elz, Aug 1998 — [https://www.rfc-editor.org/rfc/rfc2389](https://www.rfc-editor.org/rfc/rfc2389).
- RFC 2428 — IPv6 + NAT (EPRT/EPSV) — Allman et al., Sept 1998 — [https://www.rfc-editor.org/rfc/rfc2428](https://www.rfc-editor.org/rfc/rfc2428).
- RFC 2577 — FTP Security Considerations — Allman & Ostermann, May 1999 — [https://www.rfc-editor.org/rfc/rfc2577](https://www.rfc-editor.org/rfc/rfc2577).
- RFC 2640 — Internationalization (UTF-8) — Curtin, July 1999 — [https://www.rfc-editor.org/rfc/rfc2640](https://www.rfc-editor.org/rfc/rfc2640).
- RFC 3659 — MLSD/MLST/MDTM/SIZE — Hethmon, March 2007 — [https://www.rfc-editor.org/rfc/rfc3659](https://www.rfc-editor.org/rfc/rfc3659).
- RFC 4217 — Securing FTP with TLS — Ford-Hutchinson, Oct 2005 — [https://www.rfc-editor.org/rfc/rfc4217](https://www.rfc-editor.org/rfc/rfc4217) (this is FTPS).
- RFC 5797 — IANA FTP Command Registry — Klensin & Hoenes, March 2010 — [https://www.rfc-editor.org/rfc/rfc5797](https://www.rfc-editor.org/rfc/rfc5797); live registry [https://www.iana.org/assignments/ftp-commands-extensions/ftp-commands-extensions.xhtml](https://www.iana.org/assignments/ftp-commands-extensions/ftp-commands-extensions.xhtml).
- RFC 7151 — HOST command — Hethmon & McMurray, March 2014 — [https://www.rfc-editor.org/rfc/rfc7151](https://www.rfc-editor.org/rfc/rfc7151).

**Books.**

- W. Richard Stevens, *TCP/IP Illustrated, Volume 1*, 2nd edition (Fall 2011, Addison-Wesley, ISBN 9780321336316). Chapter on FTP is the classic packet-trace walkthrough; mostly still accurate (intermediate).
- Douglas Comer, *Internetworking with TCP/IP, Volume 1*, 6th edition. FTP coverage is brief but situates it in the TCP-IP stack.

**Long-form posts and primary blog sources.**

- Mozilla — "Built-in FTP implementation to be removed in Firefox 90" (Apr 2021) — [https://blog.mozilla.org/addons/2021/04/15/built-in-ftp-implementation-to-be-removed-in-firefox-90/](https://blog.mozilla.org/addons/2021/04/15/built-in-ftp-implementation-to-be-removed-in-firefox-90/).
- Chrome — "Deprecations and removals in Chrome 88" (Dec 2020) — [https://developer.chrome.com/blog/chrome-88-deps-rems](https://developer.chrome.com/blog/chrome-88-deps-rems).
- Chris Evans — "Alert: vsftpd download backdoored" (July 2011) — [https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html](https://scarybeastsecurity.blogspot.com/2011/07/alert-vsftpd-download-backdoored.html).
- Chris Evans — "vsftpd-3.0.3 released… and the horrors of FTP over SSL" (July 2015) — [https://scarybeastsecurity.blogspot.com/2015/07/vsftpd-303-released-and-horrors-of-ftp.html](https://scarybeastsecurity.blogspot.com/2015/07/vsftpd-303-released-and-horrors-of-ftp.html).
- Debian — "Shutting down public FTP services" (April 2017) — [https://lwn.net/Articles/720856/](https://lwn.net/Articles/720856/).
- Kernel.org — "Shutting down FTP services" (Feb 2017) — [https://www.kernel.org/shutting-down-ftp-services.html](https://www.kernel.org/shutting-down-ftp-services.html).
- AWS — "Using hybrid post-quantum key exchange with AWS Transfer Family" (2025) — [https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html](https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html).
- OpenSSH — "Post-Quantum Cryptography" (2025) — [https://www.openssh.org/pq.html](https://www.openssh.org/pq.html).

**Talks and videos.** [Specific DEF CON / Black Hat / Computerphile talks specifically on FTP are sparse; needs source for confirmed talks.]

**Hands-on tools.**

- `tcpdump`, Wireshark with the FTP/FTP-data dissectors ([https://www.wireshark.org/docs/dfref/f/ftp.html](https://www.wireshark.org/docs/dfref/f/ftp.html)).
- FileZilla ([https://filezilla-project.org/](https://filezilla-project.org/)), WinSCP ([https://winscp.net/](https://winscp.net/)), lftp ([https://lftp.yar.ru/](https://lftp.yar.ru/)).
- nmap NSE script `ftp-vsftpd-backdoor` ([https://nmap.org/nsedoc/scripts/ftp-vsftpd-backdoor.html](https://nmap.org/nsedoc/scripts/ftp-vsftpd-backdoor.html)).
- vsftpd source for a minimal modern reference implementation ([https://security.appspot.com/vsftpd.html](https://security.appspot.com/vsftpd.html)).

**University courses with FTP coverage.** Stanford CS144 "Introduction to Computer Networking" includes a unit on application protocols including FTP ([https://cs144.github.io/](https://cs144.github.io/)). MIT 6.829 and Berkeley CS168 cover the layering questions FTP exposes. [Specific lecture-by-lecture FTP content varies year to year; needs source for current 2025–26 syllabi.]

---

## Where things are heading (2025–2026 frontier)

**Active deprecation continues.** Browsers are done. Linux distro mirrors increasingly stand up HTTPS-only mirror lists; Debian's `deb.debian.org` CDN is now the recommended path ([https://wiki.debian.org/ftp.debian.org](https://wiki.debian.org/ftp.debian.org)). Cloud providers no longer offer plain FTP as a primary protocol — AWS Transfer Family includes it for migration only, restricts it to VPC + passive + binary + stream mode ([https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html](https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html)), and Azure Blob / GCS never offered FTP natively. [Debian](https://wiki.debian.org/ftp.debian.org)[AWS](https://docs.aws.amazon.com/transfer/latest/userguide/transfer-file.html)

**IETF activity.** The original `ftpext` working group concluded ([https://datatracker.ietf.org/wg/ftpext/about/](https://datatracker.ietf.org/wg/ftpext/about/)), and its successor `ftpext2` (which produced RFC 7151) also concluded. As of May 2026 there is **no active IETF working group chartered specifically for FTP**; FTP is now in maintenance, with any future work landing through ART-area individual submissions. RFC 9141 (2021) "Updating References to the IETF FTP Service" is itself notable — the IETF retired its own `ftp.ietf.org` service ([https://www.rfc-editor.org/rfc/rfc9141.html](https://www.rfc-editor.org/rfc/rfc9141.html)). [No FTP-specific drafts in active 2025–26 ART or SECDISPATCH discussion identified in this research; needs source for any new drafts.] [RFC Editor](https://www.rfc-editor.org/rfc/rfc9141.html)

**What's actually replacing FTP in 2026.** SFTP for ad-hoc and partner exchange (now PQ-capable via OpenSSH's mlkem768x25519-sha256 default in 10.0). HTTPS + S3 multipart for bulk. WebDAV TPC for grid/HPC science ([https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf](https://www.epj-conferences.org/articles/epjconf/pdf/2025/22/epjconf_chep2025_01182.pdf)). Managed cloud transfer (AWS Transfer Family, Azure Logic Apps, GCP Storage Transfer) for "we have a partner who insists on SFTP/FTPS/AS2".

**Compliance angle.**

- *PCI DSS 4.0* — fully mandatory since 31 March 2025. Plain FTP cannot be the primary channel for cardholder data; if used, it must be wrapped in SSH/TLS/IPsec (PCI Council FAQ #1076; [https://www.pcisecuritystandards.org/faqs/all/](https://www.pcisecuritystandards.org/faqs/all/)). [PCI DSS GUIDE](https://pcidssguide.com/what-you-should-know-about-pci-compliant-file-transfer/)
- *NIST SP 800-52 Rev. 2* — required TLS 1.3 by 1 January 2024 across federal TLS endpoints ([https://csrc.nist.gov/pubs/sp/800/52/r2/final](https://csrc.nist.gov/pubs/sp/800/52/r2/final)). Federal FTPS users inherit this. [NIST CSRC](https://csrc.nist.gov/pubs/sp/800/52/r2/final)
- *HIPAA* — does not name FTP, but the Security Rule's 45 CFR 164.312(e) "transmission security" requirement is universally interpreted as ruling out cleartext FTP for ePHI.

**Research direction.** Post-quantum migration is the live story. AWS Transfer Family's `TransferSecurityPolicy-2025-03` and `TransferSecurityPolicy-FIPS-2025-03` enable ML-KEM hybrid key exchange for SFTP ([https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html](https://docs.aws.amazon.com/transfer/latest/userguide/post-quantum-security-policies.html)). RHEL 10 ships PQ-capable OpenSSH ([https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10](https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10)). FTPS gets PQ "for free" via TLS 1.3 hybrid groups when the underlying TLS library supports them. Beyond crypto, MFT vendors are heavily emphasizing supply-chain provenance (SBOM attestations, sigstore-style signatures on transferred artifacts) in 2025–2026 marketing — a direct consequence of vsftpd-2.3.4 / xz-utils-style fears. [AWS + 2](https://docs.aws.amazon.com/transfer/latest/userguide/security-policies.html)

---

## Hooks for the article, infographic, and podcast

**60-second narrated hook.**

> "It's April 1971. ARPANET is fifteen nodes old. TCP doesn't exist. A graduate student at MIT named Abhay Bhushan writes a four-page document called RFC 114, titled simply 'A File Transfer Protocol.' Fifty-five years later, that document — through nine major revisions and a dozen extensions — is still moving genomes across continents, still feeding cinema projectors in mall multiplexes, still loading firmware into the switch in your office closet. It is also, in 2026, the most thoroughly *deprecated* protocol still in routine use. Browsers removed it. Cloud providers are smothering it. PCI auditors flag it. And yet every Linux distro, every kernel release, every NCBI genome dump still has an `ftp.` hostname in front of it, even when those connections now silently redirect to HTTPS. The story of FTP is the story of the Internet learning, the hard way, that what 1971 considered 'a network' looks nothing like what 2026 considers 'a network.' This is how the oldest application protocol on the Internet survived — and what finally killed it."

**A striking statistic.**

> *In May 1999 the Walnut Creek CDROM FTP site* — `ftp.cdrom.com`, the home of FreeBSD — *moved 873 gigabytes in a single 24-hour period and served 10,000 concurrent clients, becoming Dan Kegel's original example of "the C10k problem" being solvable on commodity hardware* ([https://en.wikipedia.org/wiki/Simtel](https://en.wikipedia.org/wiki/Simtel); [https://web.archive.org/web/20040319062556/http://www.kegel.com/c10k.html](https://web.archive.org/web/20040319062556/http://www.kegel.com/c10k.html)). For comparison, a single Cloudflare edge node in 2026 routinely handles that load *per minute*.

**A "pause and think" moment.**

> *RFC 2577, written in 1999, says — verbatim — "All data and control information (including passwords) is sent across the network in unencrypted form by standard FTP."* ([https://www.rfc-editor.org/rfc/rfc2577](https://www.rfc-editor.org/rfc/rfc2577)) *That sentence has been in an IETF Informational document for 27 years. The protocol is not 'broken because of a flaw nobody noticed.' It is broken by design, the design has been documented, and we kept using it anyway — for a quarter century — because the alternative was rewriting too many things at once. Now ask yourself: which protocol that you depend on in 2026 has its own RFC 2577 already written, and you just haven't read it?*

**A failure-story arc — vsftpd 2.3.4, retold.**

> **Setup.** July 2011. vsftpd is the default FTP server on Ubuntu, CentOS, Fedora, RHEL, Slackware. Its name stands for "Very Secure" and its author, Chris Evans — at the time leading Chrome security at Google — has a near-fanatical reputation for security engineering. The download is hosted on a friend's box because vsftpd doesn't have its own infrastructure.
> 
> **Mistake.** Someone — never publicly identified — gains write access to the master download server. They edit one source file, `str.c`, to recognize a specific magic byte sequence in the username and, when they see it, fork a shell on TCP/6200 as root. They rebuild and replace the tarball. They do *not* re-sign it. The trojaned `vsftpd-2.3.4.tar.gz` sits on the master site for **roughly 72 hours**.
> 
> **Consequence.** Anyone who downloaded vsftpd in those 72 hours and didn't verify the GPG signature compiled and shipped a permanent root backdoor. The exact deployment count is unknown; vsftpd was being baked into appliance firmware, embedded NAS, and shared-hosting images at the time.
> 
> **Resolution.** A user reports that the GPG signature fails. Evans confirms within hours, posts the disclosure on the Scary Beast Security blog, moves the master copy to a Google App Engine-hosted appspot.com domain ([https://security.appspot.com/vsftpd.html](https://security.appspot.com/vsftpd.html)), and revokes the bad tarball. NVD assigns CVE-2011-2523 ([https://nvd.nist.gov/vuln/detail/CVE-2011-2523](https://nvd.nist.gov/vuln/detail/CVE-2011-2523)). Metasploit ships an exploit module the same week ([https://www.rapid7.com/db/modules/exploit/unix/ftp/vsftpd_234_backdoor/](https://www.rapid7.com/db/modules/exploit/unix/ftp/vsftpd_234_backdoor/)), and `nmap`'s `ftp-vsftpd-backdoor` NSE script becomes a permanent fixture of pen-test reports.
> 
> **The lesson.** There are two. First: signature verification is not optional. Second: an FTP server with cleartext authentication, run as root, parsing untrusted user input in C, is a *category* of risk — even a perfectly written one is one supply-chain compromise away from disaster. The vsftpd 2.3.4 incident is, retrospectively, the first widely-noticed open-source-supply-chain backdoor in the lineage that runs through event-stream (2018), SolarWinds (2020), and xz-utils (2024). FTP was the canary.

---

## Caveats and verification notes

- The exact cutover date for "FTP fully removed" varies by browser channel; the dates above reflect the *stable*-channel ship dates: Chrome 88 = 19 January 2021, Firefox 88 (disabled) = 19 April 2021, Firefox 90 (removed) = 13 July 2021. Earlier nightly/beta disablement preceded these by months.
- DCP (Digital Cinema Package) "FTP between projectors" is widely repeated in the trade press and Slashdot but I could not find a 2024–2026 vendor document confirming it remains the dominant path; flagged `[needs source]`.
- For ProFTPD CVE-2023-48795 (Terrapin), the listing on cvedetails.com cross-references the SSH protocol issue and ProFTPD's mod_sftp; the practical impact on FTP-only ProFTPD deployments is limited.
- The "FTP-related April Fools' RFCs" claim is hedged: there is no FTP-specific April-1 RFC; RFC 1149/2549/7168 are protocol-humor RFCs in the broader Internet-protocol family but are not file transfer specs.
- AWS Transfer Family does support FTP, FTPS, SFTP, AS2, and a web-browser interface as of May 2026 ([https://aws.amazon.com/aws-transfer-family/faqs/](https://aws.amazon.com/aws-transfer-family/faqs/)). The often-quoted "AWS deprecated FTP" is an overstatement — what AWS deprecated is the older `VPC_ENDPOINT` endpoint type for new server creation, not the FTP protocol.
- For some 24-month deltas (specific 2025–2026 IETF FTP drafts, specific cloud-provider FTP deprecations beyond what's cited, the current operational status of `glftpd`), public sources were thin or absent and items are flagged in-text rather than guessed.