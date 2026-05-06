---
prompt_source: deep-research-prompts.txt:7913-8090 (PROTOCOL · DHCP)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/6dc13dd3-b531-43e6-abf5-9afed2f3c84e
research_mode: claude.ai Research
---

# DHCP: A Deep Educational Reference (2026 Edition)

> A long-form, citation-backed reference on the Dynamic Host Configuration Protocol — for engineers new to networking and engineers who want serious depth. All factual claims carry verifiable URLs; speculative or future-tense statements are flagged. Current as of **5 May 2026**.

---

## Prerequisites and glossary

Before DHCP makes sense, you need a working mental model for everything below. Each term is defined briefly with a link to an authoritative explainer.

- **OSI / TCP-IP stack layers** — Layered model: Physical (L1), Data Link (L2), Network (L3), Transport (L4), Session/Presentation/Application (L5–L7). DHCP is an application-layer protocol that runs over UDP (transport) and configures IP (network) parameters delivered over a Link layer (Ethernet/Wi‑Fi). See ISO/IEC 7498-1 background at [https://en.wikipedia.org/wiki/OSI_model](https://en.wikipedia.org/wiki/OSI_model) and the IETF host-requirements view in RFC 1122 ([https://www.rfc-editor.org/rfc/rfc1122](https://www.rfc-editor.org/rfc/rfc1122)).
- **Frame / packet / datagram** — A *frame* is an L2 unit (e.g., Ethernet); a *packet* is an L3 unit (IP); a *datagram* is a connectionless transport unit (UDP). DHCP messages are UDP datagrams encapsulated in IP packets in Ethernet frames. ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768) — UDP).
- **IP address (IPv4)** — A 32-bit identifier (e.g., 192.0.2.5) for a network interface, defined in RFC 791 ([https://www.rfc-editor.org/rfc/rfc791](https://www.rfc-editor.org/rfc/rfc791)).
- **IP address (IPv6)** — A 128-bit identifier (e.g., 2001:db8::1), defined in RFC 8200 ([https://www.rfc-editor.org/rfc/rfc8200](https://www.rfc-editor.org/rfc/rfc8200)).
- **Subnet mask / prefix** — Bitmask separating the network and host portions of an IPv4 address (RFC 950, [https://www.rfc-editor.org/rfc/rfc950](https://www.rfc-editor.org/rfc/rfc950)); IPv6 uses CIDR-style prefix lengths.
- **Default gateway** — Router IP used for traffic destined off the local subnet; delivered to clients via DHCP option 3.
- **MAC address** — 48-bit IEEE-802 Layer-2 hardware identifier; clients normally identify themselves to DHCP servers using their MAC. [https://standards.ieee.org/products-programs/regauth/](https://standards.ieee.org/products-programs/regauth/)
- **Broadcast / unicast / multicast** — *Unicast* = one-to-one; *broadcast* = one-to-all on a link (255.255.255.255 in IPv4); *multicast* = one-to-many subscribers (e.g., the DHCPv6 server group `ff02::1:2`). DHCPv4 DISCOVERs are broadcast; DHCPv6 messages are multicast (RFC 8415 §7.1, [https://www.rfc-editor.org/rfc/rfc8415](https://www.rfc-editor.org/rfc/rfc8415)).
- **UDP datagram / port numbers** — UDP (RFC 768) is connectionless. DHCPv4 uses **UDP/67** (server) and **UDP/68** (client). DHCPv6 uses **UDP/546** (client) and **UDP/547** (server/relay) (RFC 8415 §7.2, [https://www.rfc-editor.org/rfc/rfc8415](https://www.rfc-editor.org/rfc/rfc8415)). [IETF](https://datatracker.ietf.org/doc/html/rfc8415)
- **Header / checksum** — Fixed-format prefix on a packet/datagram describing its meaning. UDP includes a 16-bit checksum that BOOTP allowed to be zero to ease PROM implementations (RFC 951 §3, [https://www.rfc-editor.org/rfc/rfc951](https://www.rfc-editor.org/rfc/rfc951)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc951)
- **Socket** — OS abstraction for an endpoint (IP, port, protocol) used to send/receive datagrams.
- **Lease** — A time-bounded grant of an IP address from a DHCP server to a client. Renewable. (RFC 2131 §1, [https://www.rfc-editor.org/rfc/rfc2131](https://www.rfc-editor.org/rfc/rfc2131)).
- **BOOTP** — Bootstrap Protocol, the direct ancestor of DHCP, defined by Bill Croft and John Gilmore in RFC 951 (1985) ([https://www.rfc-editor.org/rfc/rfc951](https://www.rfc-editor.org/rfc/rfc951)). [Grokipedia](https://grokipedia.com/page/Bootstrap_Protocol)
- **ARP** — Address Resolution Protocol; resolves an IPv4 address to a MAC on a link (RFC 826, [https://www.rfc-editor.org/rfc/rfc826](https://www.rfc-editor.org/rfc/rfc826)). DHCP servers and clients use ARP for conflict probing (RFC 2131 §2.2 / 4.4.1).
- **DNS** — Domain Name System (RFC 1034/1035, [https://www.rfc-editor.org/rfc/rfc1035](https://www.rfc-editor.org/rfc/rfc1035)). DHCP commonly delivers DNS resolver IPs via option 6 and the domain search list via option 119 (RFC 3397, [https://www.rfc-editor.org/rfc/rfc3397](https://www.rfc-editor.org/rfc/rfc3397)).
- **DDNS** — Dynamic DNS updates (RFC 2136, [https://www.rfc-editor.org/rfc/rfc2136](https://www.rfc-editor.org/rfc/rfc2136)); DHCP servers can register/deregister A/AAAA/PTR records on a client's behalf.
- **SLAAC** — IPv6 Stateless Address Autoconfiguration via Router Advertisements (RFC 4862, [https://www.rfc-editor.org/rfc/rfc4862](https://www.rfc-editor.org/rfc/rfc4862)). The non-DHCP path to address configuration in IPv6.
- **Router Advertisement (RA) / Neighbor Discovery (ND)** — IPv6 mechanisms (RFC 4861, [https://www.rfc-editor.org/rfc/rfc4861](https://www.rfc-editor.org/rfc/rfc4861)) that complement or compete with DHCPv6.
- **Magic cookie 99.130.83.99** — The 4-byte sentinel `0x63 0x82 0x53 0x63` at the start of the BOOTP/DHCP options field, originally standardized in RFC 1048 ([https://www.rfc-editor.org/rfc/rfc1048](https://www.rfc-editor.org/rfc/rfc1048)) and required by RFC 2131.
- **DUID / IAID** — DHCPv6 Unique Identifier and Identity-Association Identifier, replacing the IPv4 client-identifier model (RFC 8415 §11).
- **PXE / TFTP** — Preboot eXecution Environment uses DHCP options 60/66/67 (vendor class identifier, TFTP server name, boot filename) plus TFTP (RFC 1350, [https://www.rfc-editor.org/rfc/rfc1350](https://www.rfc-editor.org/rfc/rfc1350)) to network-boot machines.
- **Link-local addresses** — IPv4 169.254.0.0/16 (RFC 3927, [https://www.rfc-editor.org/rfc/rfc3927](https://www.rfc-editor.org/rfc/rfc3927)) used when DHCP fails; IPv6 `fe80::/10` is mandatory on every interface.

---

## History and story

**The pre-history (1984–1985).** Before DHCP, a diskless Sun-3 or Apollo workstation got its IP address from RARP (RFC 903, June 1984), a Layer-2 protocol that required a server on every broadcast domain because RARP packets were not IP-routable ([https://en.wikipedia.org/wiki/Bootstrap_Protocol](https://en.wikipedia.org/wiki/Bootstrap_Protocol)). In September 1985, **Bill Croft (Stanford University)** and **John Gilmore (Sun Microsystems)** published **RFC 951, BOOTP** ([https://www.rfc-editor.org/rfc/rfc951](https://www.rfc-editor.org/rfc/rfc951)). BOOTP fixed two RARP shortcomings: it ran over UDP/IP (so it could be relayed across routers) and it carried a boot-file name and server name in a 236-byte fixed header for diskless boot. BOOTP introduced the *relay agent* idea — the still-existing notion that an L3 device sets `giaddr` and forwards client broadcasts to a central server. [Wikipedia](https://en.wikipedia.org/wiki/Bootstrap_Protocol)[Wikipedia](https://en.wikipedia.org/wiki/Bootstrap_Protocol)

**The "vendor extensions" era (1988–1993).** BOOTP's `vend` field was unstructured. RFC 1048 (Philip Prindeville, 1988, [https://www.rfc-editor.org/rfc/rfc1048](https://www.rfc-editor.org/rfc/rfc1048)) standardized the magic cookie `99.130.83.99` and TLV-encoded options; RFC 1497, RFC 1533 followed. By 1991 it was clear that BOOTP's static, hand-built mapping table didn't match the new world of laptops, dorm rooms, and dial-up labs.

**Birth of the DHC working group (1989).** **Ralph Droms** (then on the Computer Science faculty at Bucknell University) and **Phil Gross** organized the IETF Dynamic Host Configuration working group in 1989; Droms chaired it until 2009 ([http://summit.riot-os.org/blog/team/ralph-droms/](http://summit.riot-os.org/blog/team/ralph-droms/)). Droms is "responsible for many of the DHCP specifications and has authored more than 20 RFCs as well as 'The DHCP Handbook'" ([https://www.abebooks.com/9780672323270/DHCP-Handbook-Ralph-Droms-Ted-0672323273/plp](https://www.abebooks.com/9780672323270/DHCP-Handbook-Ralph-Droms-Ted-0672323273/plp)). He is still listed as an active IETF participant as of 2026-02-20 ([https://datatracker.ietf.org/person/rdroms.ietf@gmail.com](https://datatracker.ietf.org/person/rdroms.ietf@gmail.com)). [Riot-os](http://summit.riot-os.org/blog/team/ralph-droms/)[Riot-os](http://summit.riot-os.org/blog/team/ralph-droms/)

**The DHCPv4 RFC chain.**

- **RFC 1531** (October 1993) — first DHCP draft standard, by Droms at Bucknell.
- **RFC 1541** (October 1993) — refined DHCPv4.
- **RFC 1534** (October 1993, [https://www.hjp.at/doc/rfc/rfc1534.html](https://www.hjp.at/doc/rfc/rfc1534.html)) — DHCP/BOOTP interoperation; DHCP deliberately reused the BOOTP packet format so existing relay agents would forward DHCP traffic without modification. As Droms himself wrote on the dhcp-users list: "DHCP reused the BOOTP packet format because, at the time the dhc WG was developing DHCP, we wanted to reuse the BOOTP forwarding (relay) agents that were just starting to appear in routers" ([https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html](https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html)). [Hjp](https://www.hjp.at/doc/rfc/rfc1534.html)[Grokipedia](https://grokipedia.com/page/Bootstrap_Protocol)
- **RFC 2131** (March 1997, Droms, Bucknell, [https://www.rfc-editor.org/rfc/rfc2131](https://www.rfc-editor.org/rfc/rfc2131)) — the canonical DHCPv4 specification, still in force.
- **RFC 2132** (March 1997, Alexander & Droms, [https://www.rfc-editor.org/rfc/rfc2132.txt](https://www.rfc-editor.org/rfc/rfc2132.txt)) — DHCP options.

**The implementations.** Ted Lemon, then at Digital Equipment Corporation, was approached in 1996 by **Paul Vixie** of the Internet Software Consortium because "there was no high-quality open-source implementation of DHCP." The result was the ISC DHCP distribution (`dhcpd`/`dhclient`) ([https://www.abebooks.com/9780672323270/DHCP-Handbook-Ralph-Droms-Ted-0672323273/plp](https://www.abebooks.com/9780672323270/DHCP-Handbook-Ralph-Droms-Ted-0672323273/plp)). Microsoft shipped a DHCP server in NT 3.5 (1994); Cisco IOS shipped one in 12.0; **dnsmasq** was first released by Simon Kelley around 2000 as a small footprint DNS-and-DHCP server for home routers ([https://joshuakugler.com/an-interview-with-simon-kelley-the-author-of-dnsmasq.html](https://joshuakugler.com/an-interview-with-simon-kelley-the-author-of-dnsmasq.html)). [AbeBooks](https://www.abebooks.com/9780672323270/DHCP-Handbook-Ralph-Droms-Ted-0672323273/plp)[Linux Command Library](https://linuxcommandlibrary.com/man/dnsmasq)

**DHCPv6.** RFC 3315 (2003, Droms et al.) defined DHCPv6 from scratch — different message format, different ports (546/547), DUID-based identity, multicast (`ff02::1:2`) instead of broadcast. RFC 3315 was obsoleted by **RFC 8415** (November 2018, Mrugalski et al., ISC) which folded prefix delegation (RFC 3633), stateless DHCPv6 (RFC 3736), and several other RFCs into one ([https://www.rfc-editor.org/rfc/rfc8415.html](https://www.rfc-editor.org/rfc/rfc8415.html)). [IETF](https://datatracker.ietf.org/doc/html/rfc8415)

**The last 24 months — what actually changed (2024–2026).**

1. **ISC DHCP is dead.** ISC formally announced End-of-Life for the ISC DHCP server in 2022; client/relay components reached EOL with version 4.4.3 in mid-2022; the server was EOL'd at the end of 2022 and gets only paying-customer support ([https://kb.isc.org/docs/aa-00896](https://kb.isc.org/docs/aa-00896)). pfSense, OPNsense, and OpenWrt have all been migrating away ([https://forums.lawrencesystems.com/t/isc-dhcp-has-reached-end-of-life-and-will-be-removed-in-a-future-version-of-pfsense/19333](https://forums.lawrencesystems.com/t/isc-dhcp-has-reached-end-of-life-and-will-be-removed-in-a-future-version-of-pfsense/19333); [https://forum.openwrt.org/t/isc-dhcp-end-of-life-migrate-to-kea/249023](https://forum.openwrt.org/t/isc-dhcp-end-of-life-migrate-to-kea/249023)). OPNsense announced Kea would become the default in version 25.7 ([https://docs.opnsense.org/releases/CE_25.1.html#may-08-2025](https://docs.opnsense.org/releases/CE_25.1.html#may-08-2025)). [ISC](https://kb.isc.org/docs/aa-00896)[Nuxt](https://hn.nuxt.dev/item/44390962)
2. **Kea 3.0 LTS shipped 18 June 2025.** First Long-Term Support release with a 3-year support window, opensourced 12 previously-commercial hooks, native HTTPS API, and removal of the Control Agent (CA) is scheduled for the next development branch ([https://www.isc.org/blogs/kea-3-0/](https://www.isc.org/blogs/kea-3-0/); [https://www.isc.org/blogs/2025-dhcp-report/](https://www.isc.org/blogs/2025-dhcp-report/)). [ISC](https://www.isc.org/blogs/kea-3-0/)[ISC](https://www.isc.org/blogs/2025-dhcp-report/)
3. **RFC 9663 (October 2024)** — Colitti, Linkova & Ma (Google) published "Using DHCPv6 Prefix Delegation to Allocate Unique IPv6 Prefixes per Client in Large Broadcast Networks" ([https://datatracker.ietf.org/doc/rfc9663/](https://datatracker.ietf.org/doc/rfc9663/)). RFC 9762 added the corresponding "P" flag in Router Advertisements ([https://www.rfc-editor.org/rfc/rfc9762](https://www.rfc-editor.org/rfc/rfc9762)). [The Mail Archive](https://www.mail-archive.com/ietf-announce@ietf.org/msg24812.html)
4. **RFC 8415bis** (the next DHCPv6 spec) — `draft-ietf-dhc-rfc8415bis-12`, dated 4 June 2025, is on the IETF Standards Track and obsoletes RFC 8415; it removes IA_TA temporary-address assignment and the Server Unicast option ([https://datatracker.ietf.org/doc/draft-ietf-dhc-rfc8415bis/](https://datatracker.ietf.org/doc/draft-ietf-dhc-rfc8415bis/)). As of 5 May 2026 it is still an Internet-Draft, not yet a numbered RFC. (Note: a search-engine result referred to "RFC 9915" as superseding RFC 8415; that number does not appear in the IETF Datatracker as of writing and should be treated as suspect — `[needs source]`). [IETF](https://datatracker.ietf.org/doc/html/draft-ietf-dhc-rfc8415bis-12)[IETF](https://www.ietf.org/archive/id/draft-ietf-dhc-rfc8415bis-10.html)
5. **TunnelVision (CVE-2024-3661)** — Disclosed 6 May 2024 by Leviathan Security Group, redefined DHCP option 121 as a VPN-bypass primitive; the discussion below.
6. **Kea CVEs.** SUSE's security team found seven local issues in 2025 → CVE-2025-32801 / -32802 / -32803 (local root via REST API, arbitrary file overwrite, world-readable lease/log files), all fixed in Kea 2.4.2/2.6.3/2.7.9 on 28 May 2025 ([https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html](https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html)). CVE-2025-40779 (single-packet DoS, August 2025) and CVE-2025-11232 (malformed-hostname DoS, late 2025) followed ([https://kb.isc.org/docs/cve-2025-40779](https://kb.isc.org/docs/cve-2025-40779); [https://securityonline.info/isc-patches-high-severity-kea-dhcpv4-dos-cve-2025-11232-flaw-allows-crash-via-malformed-hostname/](https://securityonline.info/isc-patches-high-severity-kea-dhcpv4-dos-cve-2025-11232-flaw-allows-crash-via-malformed-hostname/)). CVE-2026-3608 (stack overflow via crafted control-channel/HA messages on Kea 2.6 and 3.0, fixed in 2.6.5 and 3.0.3) was disclosed 25 March 2026 ([https://gbhackers.com/isc-issues-critical-warning-over-kea-dhcp-vulnerability/](https://gbhackers.com/isc-issues-critical-warning-over-kea-dhcp-vulnerability/)) — note that this was reported by a single news outlet citing the ISC advisory; treat the exact CVSS scoring as the outlet reports until cross-checked at NVD.
7. **Microsoft DHCP server outage from a security update.** The June 2025 Patch Tuesday updates KB5060526/KB5060531/KB5060842/KB5061010 caused the Windows Server DHCP service to "intermittently stop responding"; Microsoft acknowledged the issue and pushed a fix in the July 2025 cumulative updates ([https://www.bleepingcomputer.com/news/microsoft/microsoft-june-windows-server-security-updates-cause-dhcp-issues/](https://www.bleepingcomputer.com/news/microsoft/microsoft-june-windows-server-security-updates-cause-dhcp-issues/); [https://www.ivanti.com/blog/july-2025-patch-tuesday](https://www.ivanti.com/blog/july-2025-patch-tuesday)). [Microsoft Learn + 2](https://learn.microsoft.com/en-us/answers/questions/2284323/about-kb5060526-dhcp-issue)

---

## How it actually works

### DHCPv4 packet format

DHCPv4 reuses the BOOTP fixed header (RFC 951 / RFC 2131 §2). All fields are network byte order.

| Field | Bytes | Bits | Meaning |
|---|---|---|---|
| `op` | 1 | 8 | 1 = BOOTREQUEST (client → server), 2 = BOOTREPLY [RFC Editor](https://www.rfc-editor.org/rfc/rfc951) |
| `htype` | 1 | 8 | Hardware address type (1 = 10 Mb Ethernet, per IANA "Assigned Numbers") [RFC Editor](https://www.rfc-editor.org/rfc/rfc951) |
| `hlen` | 1 | 8 | Hardware address length (6 for Ethernet) [RFC Editor](https://www.rfc-editor.org/rfc/rfc951) |
| `hops` | 1 | 8 | 0 by client; relay agents increment [RFC Editor](https://www.rfc-editor.org/rfc/rfc951) |
| `xid` | 4 | 32 | Transaction ID, random — pairs requests with replies [RFC Editor](https://www.rfc-editor.org/rfc/rfc951) |
| `secs` | 2 | 16 | Seconds since the client started trying to acquire/renew [RFC Editor](https://www.rfc-editor.org/rfc/rfc951) |
| `flags` | 2 | 16 | Bit 0 = Broadcast flag (B); other bits MUST be zero |
| `ciaddr` | 4 | 32 | Client IP address — only set if client is BOUND/RENEW/REBIND |
| `yiaddr` | 4 | 32 | "Your" IP address — server fills in offered/assigned address |
| `siaddr` | 4 | 32 | Next-server IP for boot |
| `giaddr` | 4 | 32 | **Gateway/relay agent IP** — set by relay agents, drives subnet selection |
| `chaddr` | 16 | 128 | Client hardware address (left-padded; first `hlen` bytes used) |
| `sname` | 64 | 512 | Optional server hostname (null-terminated) |
| `file` | 128 | 1024 | Boot filename (null-terminated) |
| Magic cookie | 4 | 32 | `0x63 0x82 0x53 0x63` (99.130.83.99) — required [RFC Editor](https://www.rfc-editor.org/rfc/rfc2131) (RFC 2131 §3, [https://www.rfc-editor.org/rfc/rfc2131](https://www.rfc-editor.org/rfc/rfc2131)) |
| `options` | var | — | TLV-encoded options ending with code 255 |

The fixed BOOTP header is **236 bytes** before options ([https://grokipedia.com/page/Bootstrap_Protocol](https://grokipedia.com/page/Bootstrap_Protocol)).

### DORA — the four-message exchange

DHCP server (UDP/67)Relay agent (optional)Client (UDP/68)DHCP server (UDP/67)Relay agent (optional)Client (UDP/68)#mermaid-ri8{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-ri8 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-ri8 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-ri8 .error-icon{fill:#CC785C;}#mermaid-ri8 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-ri8 .edge-thickness-normal{stroke-width:1px;}#mermaid-ri8 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-ri8 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-ri8 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-ri8 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-ri8 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-ri8 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-ri8 .marker.cross{stroke:#A1A1A1;}#mermaid-ri8 svg{font-family:inherit;font-size:16px;}#mermaid-ri8 p{margin:0;}#mermaid-ri8 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-ri8 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-ri8 .actor-line{stroke:#A1A1A1;}#mermaid-ri8 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-ri8 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-ri8 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-ri8 .sequenceNumber{fill:#5e5e5e;}#mermaid-ri8 #sequencenumber{fill:#E5E5E5;}#mermaid-ri8 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-ri8 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-ri8 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-ri8 .labelText,#mermaid-ri8 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-ri8 .loopText,#mermaid-ri8 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-ri8 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-ri8 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-ri8 .noteText,#mermaid-ri8 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-ri8 .activation0{fill:transparent;stroke:#00000000;}#mermaid-ri8 .activation1{fill:transparent;stroke:#00000000;}#mermaid-ri8 .activation2{fill:transparent;stroke:#00000000;}#mermaid-ri8 .actorPopupMenu{position:absolute;}#mermaid-ri8 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-ri8 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-ri8 .actor-man circle,#mermaid-ri8 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-ri8 :root{--mermaid-font-family:inherit;}INIT stateChoose lease, ARP-probe yiaddrSELECTING — picks one OFFERCommit binding, ARP probeBOUND — set timers T1, T2, leaseDHCPDISCOVER (broadcast 255.255.255.255)op=1, ciaddr=0, xid=R, options: 53(1)=DISCOVER, 55=PRL, 61=client-idDHCPOFFER (unicast or broadcast)yiaddr=192.0.2.55, options: 53(2)=OFFER, 54=server-id, 51=lease-time, 1=mask, 3=router, 6=DNS, 51=leaseDHCPREQUEST (broadcast)options: 53(3)=REQUEST, 50=requested-IP, 54=server-idDHCPACKoptions: 53(5)=ACK, 51=lease, 58=T1, 59=T2, ...

**State machine** (RFC 2131 §4.4): INIT → SELECTING → REQUESTING → BOUND → RENEWING (at T1) → REBINDING (at T2) → INIT (on lease expiry). Side branches: INIT-REBOOT (cached lease on boot) and DHCPNAK (server refuses) → INIT.

**T1 / T2 timers.** RFC 2131 default: T1 = 0.5 × lease, T2 = 0.875 × lease. At T1 the client unicasts a RENEW to the original server; at T2 it broadcasts a REBIND to any server ([https://www.professormesser.com/network-plus/n10-006/dhcp-leases-2/](https://www.professormesser.com/network-plus/n10-006/dhcp-leases-2/); [https://itfreetraining.com/lesson/leases/](https://itfreetraining.com/lesson/leases/)). [Professor Messer](https://www.professormesser.com/network-plus/n10-006/dhcp-leases-2/)

### Other message types (RFC 2131 §3)

- **DHCPDECLINE** — Client tells server "the offered address conflicts on the wire" (after ARP-probing).
- **DHCPRELEASE** — Voluntary surrender of the lease before expiry.
- **DHCPNAK** — Server refuses (e.g., wrong subnet for `requested-IP`).
- **DHCPINFORM** — Client already has an IP (statically configured) but wants other parameters.
- **FORCERENEW** — RFC 3203 ([https://www.rfc-editor.org/rfc/rfc3203](https://www.rfc-editor.org/rfc/rfc3203)), server can ask client to re-renew; rarely deployed because authentication wasn't.

### Key options (RFC 2132 + IANA registry)

| Code | Name | Use |
|---|---|---|
| 1 | Subnet Mask | Assigned mask |
| 3 | Router | Default gateway list |
| 6 | Domain Name Server | Resolver IPs |
| 12 | Host Name | Suggested hostname |
| 15 | Domain Name | Domain suffix |
| 50 | Requested IP Address | "I want this address" |
| 51 | IP Address Lease Time | Seconds |
| 53 | DHCP Message Type | DISCOVER/OFFER/REQUEST/DECLINE/ACK/NAK/RELEASE/INFORM |
| 54 | Server Identifier | Selected server's IP |
| 55 | Parameter Request List | Options the client wants |
| 58 | Renewal (T1) Time | Default lease/2 |
| 59 | Rebinding (T2) Time | Default lease·7/8 |
| 60 | Vendor Class Identifier | "PXEClient", "MSFT 5.0", etc. |
| 61 | Client Identifier | DUID/MAC-based |
| 66 | TFTP Server Name | PXE boot |
| 67 | Bootfile Name | PXE boot file |
| 82 | Relay Agent Information | RFC 3046 — circuit-id, remote-id |
| 119 | Domain Search List | RFC 3397 |
| 121 | Classless Static Routes | RFC 3442 — **central to TunnelVision** |

**Magic cookie origin.** Ralph Droms recounted on the dhcp-users list that Philip Prindeville suggested **"OREO"** in ASCII for the cookie, but **Jon Postel** changed it to `99.130.83.99` (likely for trademark reasons) when standardizing what became RFC 1048 ([https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html](https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html)). The four bytes have no meaning beyond being a fixed 32-bit sentinel separating BOOTP-only from DHCP options.

### Relay agents and `giaddr`

When a client broadcasts on a subnet without a local DHCP server, an L3 router can act as a *DHCP relay agent* (RFC 1542). It rewrites the destination to a unicast server, sets `giaddr` to its own ingress interface IP, increments `hops`, and may insert option 82 with a circuit-id (port) and remote-id (switch identity) sub-options (RFC 3046, [https://ipcisco.com/lesson/dhcp-option-82/](https://ipcisco.com/lesson/dhcp-option-82/)). The server uses `giaddr` to pick the right address pool. Cisco IOS rejects DHCP packets with `giaddr=0` on default config but Catalyst switches in DHCP-snooping mode use `giaddr=0` — a long-standing source of misconfiguration ([https://ine.com/blog/2009-07-22-understanding-dhcp-option-82](https://ine.com/blog/2009-07-22-understanding-dhcp-option-82)). [INE](https://ine.com/blog/2009-07-22-understanding-dhcp-option-82)[INE](https://ine.com/blog/2009-07-22-understanding-dhcp-option-82)

### Security model

In a word: **none.** DHCPv4 has no integrity, no authenticity, no confidentiality. RFC 2131 §7 acknowledges this. RFC 3118 (2001, Droms & Arbaugh, [https://datatracker.ietf.org/doc/html/rfc3118](https://datatracker.ietf.org/doc/html/rfc3118)) added an Authentication option (delayed authentication, HMAC-MD5), but Wikipedia summarizes the historical consensus accurately: "It has never been widely deployed… The challenges of key management and processing delays… have been deemed too heavy a price to pay" ([https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)). Various IETF drafts to revisit the problem (e.g., `draft-ietf-dhc-sedhcpv6` for public-key Secure DHCPv6) expired without consensus ([https://datatracker.ietf.org/doc/html/draft-ietf-dhc-sedhcpv6-21](https://datatracker.ietf.org/doc/html/draft-ietf-dhc-sedhcpv6-21)). The deployed substitute is **L2 access control** (802.1X port authentication, DHCP snooping, DHCPv6-Shield). [Wikipedia](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)

### DHCPv6 — what's different

DHCPv6 (RFC 8415, [https://www.rfc-editor.org/rfc/rfc8415](https://www.rfc-editor.org/rfc/rfc8415)) is *not* a transliteration of DHCPv4. [Army Futures Command](https://www.hpc.mil/solution-areas/networking/ipv6-knowledge-base/infrastructure/dhcp-and-slaac-on-ipv6-networks)

- **Transport**: UDP/546 (client) ↔ UDP/547 (server/relay).
- **Discovery**: link-scoped multicast `ff02::1:2` (`All_DHCP_Relay_Agents_and_Servers`); also `ff05::1:3` (site scope, all servers).
- **Source addresses**: link-local `fe80::/10`.
- **Identifier**: DUID (variable length, up to 128 bytes per content; types DUID-LLT, DUID-EN, DUID-LL, DUID-UUID per RFC 6355). [Wikipedia](https://en.wikipedia.org/wiki/DHCPv6)
- **Message exchange**: **SOLICIT → ADVERTISE → REQUEST → REPLY** (or two-message Solicit/Reply with Rapid Commit, RFC 8415 §18). Other messages: CONFIRM, RENEW, REBIND, RELEASE, DECLINE, RECONFIGURE, INFORMATION-REQUEST, RELAY-FORW, RELAY-REPL.
- **Stateless mode**: Information-request; clients use SLAAC for addresses.
- **Prefix Delegation (IA_PD)**: A client can ask for an entire prefix (e.g., a /56 to a home gateway), defined originally in RFC 3633 and now in RFC 8415 §6.3. [IETF](https://www.ietf.org/archive/id/draft-ietf-dhc-rfc8415bis-10.html)

Server (UDP/547)Client (fe80::a:1, UDP/546)Server (UDP/547)Client (fe80::a:1, UDP/546)#mermaid-rig{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rig .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rig .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rig .error-icon{fill:#CC785C;}#mermaid-rig .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rig .edge-thickness-normal{stroke-width:1px;}#mermaid-rig .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rig .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rig .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rig .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rig .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rig .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rig .marker.cross{stroke:#A1A1A1;}#mermaid-rig svg{font-family:inherit;font-size:16px;}#mermaid-rig p{margin:0;}#mermaid-rig .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rig text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rig .actor-line{stroke:#A1A1A1;}#mermaid-rig .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rig .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rig #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rig .sequenceNumber{fill:#5e5e5e;}#mermaid-rig #sequencenumber{fill:#E5E5E5;}#mermaid-rig #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rig .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rig .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rig .labelText,#mermaid-rig .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rig .loopText,#mermaid-rig .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rig .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rig .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rig .noteText,#mermaid-rig .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rig .activation0{fill:transparent;stroke:#00000000;}#mermaid-rig .activation1{fill:transparent;stroke:#00000000;}#mermaid-rig .activation2{fill:transparent;stroke:#00000000;}#mermaid-rig .actorPopupMenu{position:absolute;}#mermaid-rig .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rig .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rig .actor-man circle,#mermaid-rig line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rig :root{--mermaid-font-family:inherit;}SOLICIT → [ff02::1:2]:547options: Client-ID, IA_NA/IA_PD, Option RequestADVERTISE → src fe80::s:1, dst fe80::a:1options: Server-ID, Client-ID, IA_NA(addr), PreferenceREQUEST → [ff02::1:2]:547options: Client-ID, Server-ID, IA_NAREPLY → fe80::a:1options: Server-ID, Client-ID, IA_NA(committed)

---

## Deep connections to other protocols

- **UDP** — DHCP runs on UDP because BOOTP needed a connectionless protocol that diskless clients with no IP address could send (a TCP three-way handshake requires you to already know your own IP). RFC 768 ([https://www.rfc-editor.org/rfc/rfc768](https://www.rfc-editor.org/rfc/rfc768)).
- **DNS** — DHCP delivers resolver addresses (option 6) and the search domain (option 119/15). DDNS (RFC 2136) lets the DHCP server insert/remove A/AAAA/PTR records on the client's behalf — Kea integrates this through its `kea-dhcp-ddns` daemon ([https://www.isc.org/kea/](https://www.isc.org/kea/)).
- **ARP** — DHCP servers SHOULD ARP-probe an offered address before assignment (RFC 2131 §2.2); clients SHOULD ARP-probe before using `yiaddr` and DHCPDECLINE on conflict.
- **BOOTP** — DHCP's direct ancestor; same packet format; DHCP servers can serve BOOTP clients via the magic cookie + option 53 differentiation. RFC 1534 ([https://www.hjp.at/doc/rfc/rfc1534.html](https://www.hjp.at/doc/rfc/rfc1534.html)).
- **RARP** — Predecessor; replaced by BOOTP because RARP is L2-only and required a server per broadcast domain.
- **TFTP** — Used with PXE; DHCP options 66/67 point clients at a TFTP boot image ([https://oneuptime.com/blog/post/2026-03-20-configure-dhcp-option-66-67-tftp-boot/view](https://oneuptime.com/blog/post/2026-03-20-configure-dhcp-option-66-67-tftp-boot/view)). [OneUptime](https://oneuptime.com/blog/post/2026-03-20-configure-dhcp-option-66-67-tftp-boot/view)
- **PXE** — Preboot eXecution Environment; uses DHCP options 60 ("PXEClient" vendor-class), 66, 67, plus optional ProxyDHCP on UDP/4011 ([https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/pxe-clients-not-start-dhcp-60-66-67-option](https://learn.microsoft.com/en-us/troubleshoot/windows-server/networking/pxe-clients-not-start-dhcp-60-66-67-option)).
- **RA / SLAAC** — IPv6's alternative path. RFC 8504 *requires* SLAAC support; DHCPv6 is only a SHOULD. The famous Android-vs-DHCPv6 standoff (Android still does not support DHCPv6 IA_NA; it now optionally requests IA_PD per RFC 9663) is documented in [https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/](https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/) and [https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/](https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/). [Wordpress](https://theinternetprotocolblog.wordpress.com/2021/01/04/a-holistic-look-on-slaac-and-dhcpv6/)
- **Neighbor Discovery (ICMPv6)** — IPv6's analog to ARP; replaces it entirely. RFC 4861 ([https://www.rfc-editor.org/rfc/rfc4861](https://www.rfc-editor.org/rfc/rfc4861)).
- **ICMP** — Servers MAY ICMP-echo offered addresses for conflict detection.
- **802.1X / RADIUS** — Common authentication wrappers; 802.1X happens *before* DHCP, gating port access; RADIUS attributes can drive DHCP option selection (e.g., framed-IP).
- **DHCP snooping** — Switch feature to drop server-typed messages on untrusted ports and bind {IP, MAC, port} pairs to defeat spoofing. Often the trust anchor for **IP Source Guard** and **Dynamic ARP Inspection**.
- **DHCPv6-Shield (RFC 7610, BCP 199)** — L2 filtering for rogue DHCPv6 servers, the v6 analog of DHCP snooping ([https://datatracker.ietf.org/doc/html/rfc7610](https://datatracker.ietf.org/doc/html/rfc7610)). [RFC Editor](https://www.rfc-editor.org/rfc/rfc7610)
- **mDNS / Bonjour** — Zero-config alternative for *service* discovery on a local link; complementary, not competitive.
- **Link-local addressing (RFC 3927)** — IPv4 169.254.0.0/16; what Windows assigns when DHCP fails ("APIPA"). Often a smoking gun.
- **DDNS / GSS-TSIG** — Authenticated dynamic DNS updates; ISC Kea's premium GSS-TSIG hook is the production path to Active-Directory DNS integration ([https://forum.netgate.com/topic/187506/kea-dhcp-feature-roadmap](https://forum.netgate.com/topic/187506/kea-dhcp-feature-roadmap)).

---

## Real-world deployment

**Open-source servers.**

- **ISC Kea** — Current flagship, written in C++, JSON config, REST API, MySQL/PostgreSQL/memfile backends, hooks library; **3.0 LTS** released 18 June 2025 with a 3-year support window ([https://www.isc.org/blogs/kea-3-0/](https://www.isc.org/blogs/kea-3-0/); [https://en.wikipedia.org/wiki/Kea_(software)](https://en.wikipedia.org/wiki/Kea_(software))). Mozilla Public License 2.0. [ISC + 2](https://www.isc.org/blogs/kea-3-0/)
- **ISC DHCP (`dhcpd`)** — End-of-life since end of 2022 ([https://kb.isc.org/docs/aa-00896](https://kb.isc.org/docs/aa-00896)). Still ubiquitous in older deployments.
- **dnsmasq** — Simon Kelley's lightweight DNS+DHCP+TFTP+RA server, born ~2000; default in OpenWrt, DD-WRT, Android tethering, OpenStack Neutron, Home Assistant, and many home routers ([https://thekelleys.org.uk/dnsmasq/doc.html](https://thekelleys.org.uk/dnsmasq/doc.html); [https://en.wikipedia.org/wiki/Dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq)). OPNsense will make dnsmasq DHCP its default starting 25.7 ([https://docs.opnsense.org/releases/CE_25.1.html#may-08-2025](https://docs.opnsense.org/releases/CE_25.1.html#may-08-2025)). [GitHub](https://github.com/imp/dnsmasq/blob/master/doc.html)[Nuxt](https://hn.nuxt.dev/item/44390962)
- **systemd-networkd** — Built-in client and small server.
- **udhcpc / BusyBox** — Embedded standby.
- **dhcpcd** — Roy Marples' configurable client, default in many BSDs and Alpine.

**Vendor servers and infra.**

- **Microsoft Windows DHCP Server** — Bundled with Windows Server (NT 3.5 onward); supports option 82 policies natively ([https://learn.microsoft.com/en-us/archive/blogs/teamdhcp/dhcp-policies-based-on-relay-agent-information-option-option-82-dhcp-snooping-and-ip-source-guard](https://learn.microsoft.com/en-us/archive/blogs/teamdhcp/dhcp-policies-based-on-relay-agent-information-option-option-82-dhcp-snooping-and-ip-source-guard)).
- **Cisco IOS DHCP** — Ubiquitous on Cisco routers/switches.
- **Infoblox / BlueCat / EfficientIP / Men&Mice** — Enterprise DDI ("DNS, DHCP, IP Address Management") appliances.
- **Akamai (formerly Nominum) DNS+DHCP** — Carrier-grade.
- **AWS VPC DHCP options sets** — Each VPC has exactly one option set defining domain name, DNS servers, NTP servers, NetBIOS settings; instances pick up changes "within a few hours, depending on how frequently the instance renews its DHCP lease" ([https://tonghuaroot.com/2019/05/23/AWS-VPC-DHCP-Options-Set-change-Effective-immediately/](https://tonghuaroot.com/2019/05/23/AWS-VPC-DHCP-Options-Set-change-Effective-immediately/)). Maximum four DNS servers per option set ([https://oneuptime.com/blog/post/2026-02-12-dhcp-option-sets-in-vpc/view](https://oneuptime.com/blog/post/2026-02-12-dhcp-option-sets-in-vpc/view)). [OneUptime + 2](https://oneuptime.com/blog/post/2026-02-12-dhcp-option-sets-in-vpc/view)

**Hyperscaler / at-scale war stories.**

- **Meta**'s public engineering posts are the gold standard. They originally ran ISC dhcpd, then began migrating to **ISC Kea in 2014** for data-center provisioning (Angelo Failla's SRECon EU talk, [https://engineering.fb.com/2015/07/21/core-infra/using-isc-kea-dhcp-in-our-data-centers/](https://engineering.fb.com/2015/07/21/core-infra/using-isc-kea-dhcp-in-our-data-centers/)). They open-sourced **dhcplb** as a load-balancer for v4 and v6 in 2016 ([https://engineering.fb.com/2016/09/13/data-infrastructure/dhcplb-an-open-source-load-balancer/](https://engineering.fb.com/2016/09/13/data-infrastructure/dhcplb-an-open-source-load-balancer/)). In **May 2019** they replaced Kea entirely with their Go-based DHCPLB-as-server, claiming "we are now handling the same volume of traffic with **10× fewer servers**" ([https://engineering.fb.com/2019/05/28/data-infrastructure/dhcplb-server/](https://engineering.fb.com/2019/05/28/data-infrastructure/dhcplb-server/)). [FB + 2](https://engineering.fb.com/2015/07/21/core-infra/using-isc-kea-dhcp-in-our-data-centers/)
- **Hacker News, June 2025** — A user reported deploying "20,000 PS5 APUs (AsRock BC-250) each is a individual blade computer that was PXE booted… eventually we traced it down to dnsmasq being unable to keep up with all the DHCP UDP traffic… Switched to Kea and all of our problems magically went away" ([https://news.ycombinator.com/item?id=44390962](https://news.ycombinator.com/item?id=44390962)). Anecdotal but illustrative of dnsmasq's small-scale ceiling. [Hacker News](https://news.ycombinator.com/item?id=44390962)
- **Google Cloud** — "the only way to get a VM IPv6 address in Google Cloud is to use DHCPv6" ([https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/](https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/)), itself a counterpoint to Android's continuing refusal to implement DHCPv6 IA_NA. [ipSpace.net](https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/)

**HA / failover topologies.** ISC DHCP supported a proprietary failover protocol; DHCPv6 failover was standardized as **RFC 8156** (June 2017, Mrugalski/Kinnear, [https://www.rfc-editor.org/rfc/rfc8156.html](https://www.rfc-editor.org/rfc/rfc8156.html)) — primary-secondary with binding sync. Kea's modern path is its `high_availability` hook plus a shared MySQL/PostgreSQL backend. [Spinics.net](https://www.spinics.net/lists/ietf-ann/msg104071.html)

**Performance characteristics.** Public, peer-reviewed numbers are scarce. Kea reportedly handles "tens of thousands of clients simultaneously" on commodity hardware ([https://www.abit.ee/en/soft/2104-kea-3-0-major-release-of-open-source-dhcp-server-with-new-capabilities](https://www.abit.ee/en/soft/2104-kea-3-0-major-release-of-open-source-dhcp-server-with-new-capabilities)) — note that this comes from a third-party news write-up summarizing ISC's own marketing claims; for definitive throughput numbers consult ISC's Kea performance KB articles. Meta's claim of 10× server reduction is qualitative — they did not publish absolute QPS in the public blog.

---

## Failure modes and famous incidents

- **CVE-2024-3661 — TunnelVision (May 2024).** Disclosed by Leviathan Security on 6 May 2024 ([https://www.leviathansecurity.com/blog/tunnelvision](https://www.leviathansecurity.com/blog/tunnelvision)). A rogue DHCP server (or a starvation+spoof combo) injects DHCP **option 121** classless-static-routes into the victim, installing /1 routes that override the VPN's default route, causing traffic to leak in cleartext while the VPN stays "up." CVSS-BT 2.1 / CVSS-B 2.1 (per Palo Alto's analysis, [https://security.paloaltonetworks.com/CVE-2024-3661](https://security.paloaltonetworks.com/CVE-2024-3661)); CVSS scores at NVD differ. Affects Windows, Linux, macOS, iOS — not Android (Android does not implement option 121). CISA, Zscaler, Fortinet, Palo Alto, and WatchGuard all issued advisories. Mitigations: VPN firewall rules dropping traffic to non-VPN interfaces, Linux network namespaces, DHCP snooping at the switch ([https://www.zscaler.com/blogs/security-research/cve-2024-3661-k-tunnelvision-exposes-vpn-bypass-vulnerability](https://www.zscaler.com/blogs/security-research/cve-2024-3661-k-tunnelvision-exposes-vpn-bypass-vulnerability)).
- **CVE-2018-1111 — DynoRoot (May 2018).** Felix Wilhelm at Google found that Red Hat's `/etc/NetworkManager/dispatcher.d/11-dhclient` script `eval`'d DHCP option values without escaping. A rogue server returning `option 252 "x'; touch /tmp/pwn #"` ran arbitrary commands as root on RHEL 6/7, CentOS 6/7, Fedora 28 ([https://unit42.paloaltonetworks.com/unit42-analysis-dhcp-client-script-code-execution-vulnerability-cve-2018-1111/](https://unit42.paloaltonetworks.com/unit42-analysis-dhcp-client-script-code-execution-vulnerability-cve-2018-1111/); [https://www.exploit-db.com/exploits/44890](https://www.exploit-db.com/exploits/44890)). PoC fit in a tweet. [Palo Alto Networks](https://unit42.paloaltonetworks.com/unit42-analysis-dhcp-client-script-code-execution-vulnerability-cve-2018-1111/)[Rapid7](https://www.rapid7.com/db/modules/exploit/unix/dhcp/rhel_dhcp_client_command_injection/)
- **CVE-2017-3144 — ISC DHCP OMAPI socket exhaustion.** Failure to clean up closed OMAPI control connections let an attacker exhaust the server's file-descriptor pool ([https://kb.isc.org/docs/aa-01541](https://kb.isc.org/docs/aa-01541)). Affects ISC DHCP 4.1.0–4.1-ESV-R15, 4.2.0–4.2.8, 4.3.0–4.3.6. [ISC](https://kb.isc.org/docs/aa-01541)[Ubuntu](https://ubuntu.com/security/CVE-2017-3144)
- **CVE-2025-32801 / -32802 / -32803 — Kea local root (May 2025).** SUSE security team (Matthias Gerstner) found that Kea's `set-config` REST API allowed loading arbitrary hook libraries; many Linux distros shipped Kea with the REST API unauthenticated and the daemon running as root, yielding **local root** ([https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html](https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html); [https://www.openwall.com/lists/oss-security/2025/05/28/8](https://www.openwall.com/lists/oss-security/2025/05/28/8)). Fixed in Kea 2.4.2/2.6.3/2.7.9; Kea 3.0 hardened defaults further.
- **CVE-2025-40779 — Kea single-packet DoS (August 2025).** A unicast DHCPv4 request with specific options causes `kea-dhcp4` to abort on assertion failure ([https://kb.isc.org/docs/cve-2025-40779](https://kb.isc.org/docs/cve-2025-40779)). Fixed in 2.7.10 / 3.0.1. [CVE Details](https://www.cvedetails.com/vulnerability-list/vendor_id-64/ISC.html)
- **CVE-2025-11232 — Malformed-hostname DoS (late 2025).** Specially crafted hostname characters crash `kea-dhcp4` when `ddns-qualifying-suffix` is non-empty ([https://securityonline.info/isc-patches-high-severity-kea-dhcpv4-dos-cve-2025-11232-flaw-allows-crash-via-malformed-hostname/](https://securityonline.info/isc-patches-high-severity-kea-dhcpv4-dos-cve-2025-11232-flaw-allows-crash-via-malformed-hostname/)). Fixed in 3.0.2/3.1.3.
- **CVE-2026-3608 — Kea stack overflow (March 2026).** Reported by Ali Norouzi (Keysight); a crafted message on any Kea API socket or HA listener crashes `kea-ctrl-agent`/`kea-dhcp-ddns`/`kea-dhcp4`/`kea-dhcp6`. Fixed in 2.6.5 and 3.0.3 ([https://gbhackers.com/isc-issues-critical-warning-over-kea-dhcp-vulnerability/](https://gbhackers.com/isc-issues-critical-warning-over-kea-dhcp-vulnerability/)). *Source caveat: this is a single news write-up summarizing the ISC advisory; verify the exact CVSS at NVD before publication.*
- **CVE-2023-28231 — Microsoft DHCPv6 RCE.** Heap overflow in `dhcpssvc.dll`'s `ProcessRelayForwardMessage()` when a RELAY-FORW carries >32 nested Relay-Message options. RCE as NETWORK SERVICE; patched April 2023 ([https://www.thezdi.com/blog/2023/5/1/cve-2023-28231-rce-in-the-microsoft-windows-dhcpv6-service](https://www.thezdi.com/blog/2023/5/1/cve-2023-28231-rce-in-the-microsoft-windows-dhcpv6-service)). [Zero Day Initiative](https://www.thezdi.com/blog/2023/5/1/cve-2023-28231-rce-in-the-microsoft-windows-dhcpv6-service)[Zero Day Initiative](https://www.thezdi.com/blog/2023/5/1/cve-2023-28231-rce-in-the-microsoft-windows-dhcpv6-service)
- **Akamai's "Abusing the DHCP Administrators Group" (May 2024).** Not a CVE — an abuse of legitimate Microsoft DHCP-administrator privileges (writable DHCP options + AD CS Web Enrollment ESC8) to coerce Kerberos auth and obtain the DHCP server machine's NTLM hash. Akamai observed Microsoft DHCP server running in 40% of monitored networks ([https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains](https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains)). [Akamai](https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains)
- **CVE-2021-26891 — Microsoft DHCP server.** Heap overflow (Microsoft Security Update Guide entry, [https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-26891](https://msrc.microsoft.com/update-guide/vulnerability/CVE-2021-26891)). Limited public detail beyond MSRC.
- **Windows Server June 2025 cumulative updates (KB5060526/-531/-842; KB5061010 for 2016).** Caused the DHCP service to "intermittently stop responding" on Server 2016/2019/2022/2025; clients couldn't renew leases; rolling back the update restored DHCP. Microsoft acknowledged the issue and shipped a fix in the July 2025 cumulative updates ([https://www.bleepingcomputer.com/news/microsoft/microsoft-june-windows-server-security-updates-cause-dhcp-issues/](https://www.bleepingcomputer.com/news/microsoft/microsoft-june-windows-server-security-updates-cause-dhcp-issues/); [https://www.ivanti.com/blog/july-2025-patch-tuesday](https://www.ivanti.com/blog/july-2025-patch-tuesday)). [Windows Latest + 4](https://www.windowslatest.com/2025/06/17/microsoft-dhcp-issue-hits-kb5060526-kb5060531-of-windows-server/)
- **DHCP starvation (Yersinia).** Classic Layer-2 attack: spoof thousands of MACs, send DHCPDISCOVERs, exhaust the pool, optionally raise a rogue server. Defenses: switch port-security limit on MAC count; DHCP snooping ([https://www.cbtnuggets.com/blog/technology/networking/what-is-a-dhcp-starvation-attack](https://www.cbtnuggets.com/blog/technology/networking/what-is-a-dhcp-starvation-attack); [https://www.prosec-networks.com/en/blog/dhcp-starvation-attack/](https://www.prosec-networks.com/en/blog/dhcp-starvation-attack/)). [ProSec](https://www.prosec-networks.com/en/blog/dhcp-starvation-attack/)[ProSec](https://www.prosec-networks.com/en/blog/dhcp-starvation-attack/)

**Older incidents.** Frequently-cited stories like "the Comcast 2010 DHCP outage" and "the Stanford 2007 DHCP rogue server incident" appear in industry folklore, but I could not locate primary, authoritative reporting (Comcast post-mortem; Stanford ITS bulletin) in current search results — `[needs source]`. Treat these as oral tradition until independently verified. Public Comcast/Xfinity DHCP discussion in their own forums is plentiful but is mostly customer-router troubleshooting rather than a 2010-class network-wide outage ([https://forums.xfinity.com/conversations/your-home-network/dhcp-problems/61097e4bff99d14ca21ca588](https://forums.xfinity.com/conversations/your-home-network/dhcp-problems/61097e4bff99d14ca21ca588)).

---

## Fun facts and anecdotes

- **The magic cookie was almost "OREO."** Per Ralph Droms on the dhcp-users list: "Philip [Prindeville] told me he suggested 'OREO' (in ASCII, I assume), but Jon Postel changed it to the current value when the RFC was published (likely due to trademark issues)" ([https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html](https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html)). The actual bytes 99-130-83-99 (`0x63825363`) are arbitrary; their value is that they're *fixed*.
- **DHCP is BOOTP that "swallowed its host."** ISC's David Hankins put it best on the same thread: "DHCP is a thing that rides inside BOOTP. It's an extension that swallowed its host (people now think of these as DHCP packets rather than BOOTP packets using the DHCP protocol)" ([https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html](https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html)). The packet you sniff in 2026 still has BOOTP's `op`, `htype`, `chaddr`, `sname`, `file` fields — pure 1985 fossils.
- **RFC 2322 — Peg-DHCP.** A real April 1, 1998 RFC by Koos van den Hout, André Koopal, and Remco van Mook documenting how the Hacking-in-Progress 1997 conference handed out IP addresses by writing them on **wooden clothes-pegs** that attendees clipped to their network cables. "DHCP, almost completely defenseless against rogue servers, was not retained considering the traditionally creative use of the network." ([https://datatracker.ietf.org/doc/html/rfc2322](https://datatracker.ietf.org/doc/html/rfc2322)). Still used today at hacker camps. [HandWiki](https://handwiki.org/wiki/Peg_DHCP)
- **Why UDP, not TCP?** A client doing DHCPDISCOVER has *no IP address yet* — TCP requires a SYN exchange between two known-IP endpoints, which is impossible in INIT state. UDP also lets the broadcast reach multiple servers in parallel.
- **The broadcast flag controversy.** RFC 2131 added a 1-bit "B" flag in `flags` so clients (e.g., older Windows IP stacks that couldn't accept unicast frames before their stack was bound) could request the server reply by broadcast. Most modern stacks do not set it. Some buggy switches drop the unicast reply because the destination MAC isn't yet in their CAM table — leading to occasional "DHCPACK never arrives" mysteries.
- **DHCP authentication failed because DHCP's own bootstrap problem.** RFC 3118 needed pre-shared keys, but the entire point of DHCP is to configure machines that *haven't yet been configured*. The IETF later acknowledged this circular dependency and pushed authentication out to L2 (802.1X) and L3 (IPsec/PANA), which is why the Authentication option is approximately a museum exhibit ([https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)).
- **Ralph Droms is still active.** As of his IETF profile (2026-02-20), he still participates in DHC, dnssd, and 6lo work ([https://datatracker.ietf.org/person/rdroms.ietf@gmail.com](https://datatracker.ietf.org/person/rdroms.ietf@gmail.com)). The man whose 1989 Bucknell mailing list `dhcp-v4@bucknell.edu` started this whole thing is still here.
- **Why DHCPv6 ports 546/547?** They are 67/68 + 479 — no semantic meaning; just sequentially-assigned IANA UDP ports that didn't conflict.

---

## Practical wisdom

**Lease times.** RFC 2131 defaults: T1 = lease/2, T2 = lease·7/8.

| Environment | Suggested lease |
|---|---|
| Wired enterprise / data center | 4–8 days |
| Wireless office | 1–2 days |
| Guest / hotspot Wi-Fi | 1–2 hours |
| IoT factory floor | 8 hours |
| Carrier residential | ISP-defined (often 24h–7d) |

A common mistake is *short* lease times "for safety" — at 1-hour leases each client renews ~12× per day, which on 100k devices is ~33 QPS just for renewals ([https://lazyadmin.nl/home-network/dhcp-lease-time/](https://lazyadmin.nl/home-network/dhcp-lease-time/)).

**Defaults to be skeptical of.**

- Kea's pre-3.0 `kea-ctrl-agent` ran an HTTP REST API on `localhost:8000` *without authentication*, often as root — see CVE-2025-32801 ([https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html](https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html)). Kea 3.0 changed defaults; verify on upgrade.
- Cisco IOS rejects DHCPv4 with `giaddr=0` by default, but Catalyst switches in DHCP-snooping mode use `giaddr=0` — be ready to override.
- ISC `dhcpd`'s `ddns-update-style none` default produces orphan DNS records.
- Microsoft DHCP echoes option 82 by default — ensure the relay's untrusted-port policy.

**What to monitor.**

- Lease pool utilization (alert at 80%, 90%, 95%).
- DHCPNAK rate (any sustained NAKs ⇒ pool/relay/policy mismatch).
- `DHCPDECLINE` rate (sudden spike ⇒ duplicate addresses on the wire ⇒ rogue static config or rogue server).
- Renewal-vs-DISCOVER ratio (lots of DISCOVERs from the same MAC ⇒ client losing state).
- Conflict-detection events (server's ARP/ICMP probe getting replies).

**Common debugging moves.**

bash

```
# Wireshark / tshark
tshark -i any -f "udp port 67 or udp port 68"  # DHCPv4
tshark -i any -f "udp port 546 or udp port 547"  # DHCPv6
tshark -r dhcp.pcap -Y "bootp.option.type == 82"  # Decode option 82

# Linux client
sudo dhclient -v eth0
sudo dhcpcd -B -d eth0
journalctl -u systemd-networkd -f
nmcli device show eth0

# Kea
sudo journalctl -u kea-dhcp4-server -f
kea-shell --host 127.0.0.1 --port 8000 lease4-get-all

# ISC dhcpd
tail -f /var/log/syslog | grep dhcpd
omshell  # OMAPI — yes the same OMAPI from CVE-2017-3144

# Active probe
sudo dhcping -s 192.0.2.1 -c 192.0.2.50 -h aa:bb:cc:dd:ee:ff
```

**Common misconfigurations.**

- Overlapping pools across two HA partners.
- Missing `ip helper-address` on the relay → DHCP traffic dies at the L3 boundary.
- Option-82 `trusted` set on a downstream port → rogue clients can spoof circuit-id.
- Static reservations duplicated into the dynamic pool.
- DHCPv6 server replying with too-short `valid-lifetime`, causing churn.
- `next-server` (siaddr) unset for PXE while option 66 is set, causing iPXE to fail ([https://github.com/ipxe/ipxe/discussions/1279](https://github.com/ipxe/ipxe/discussions/1279)). [GitHub](https://github.com/ipxe/ipxe/discussions/1279)

---

## Learning resources (current as of 2026)

**Authoritative specifications**

- RFC 951 — BOOTP (Croft & Gilmore, 1985). [https://www.rfc-editor.org/rfc/rfc951](https://www.rfc-editor.org/rfc/rfc951) — Foundational, intro/intermediate.
- RFC 2131 — DHCPv4 (Droms, 1997). [https://www.rfc-editor.org/rfc/rfc2131](https://www.rfc-editor.org/rfc/rfc2131) — *The* spec; advanced.
- RFC 2132 — DHCP Options (1997). [https://www.rfc-editor.org/rfc/rfc2132.txt](https://www.rfc-editor.org/rfc/rfc2132.txt) — reference.
- RFC 3046 — Relay Agent Information (Option 82, 2001). [https://www.rfc-editor.org/rfc/rfc3046](https://www.rfc-editor.org/rfc/rfc3046)
- RFC 3118 — Authentication for DHCP (2001). [https://datatracker.ietf.org/doc/html/rfc3118](https://datatracker.ietf.org/doc/html/rfc3118) — historical.
- RFC 3315 — original DHCPv6 (2003); now obsoleted.
- RFC 3442 — Classless Static Routes Option 121. [https://www.rfc-editor.org/rfc/rfc3442](https://www.rfc-editor.org/rfc/rfc3442)
- RFC 3927 — IPv4 Link-Local 169.254.0.0/16. [https://www.rfc-editor.org/rfc/rfc3927](https://www.rfc-editor.org/rfc/rfc3927)
- RFC 7610 — DHCPv6-Shield (BCP 199, 2015). [https://datatracker.ietf.org/doc/html/rfc7610](https://datatracker.ietf.org/doc/html/rfc7610)
- RFC 7844 — Anonymity Profiles for DHCP Clients (2016). [https://datatracker.ietf.org/doc/html/rfc7844](https://datatracker.ietf.org/doc/html/rfc7844)
- RFC 8156 — DHCPv6 Failover Protocol (2017). [https://www.rfc-editor.org/rfc/rfc8156.html](https://www.rfc-editor.org/rfc/rfc8156.html) [Spinics.net](https://www.spinics.net/lists/ietf-ann/msg104071.html)
- RFC 8415 — DHCPv6 (2018), still the in-force DHCPv6 spec. [https://www.rfc-editor.org/rfc/rfc8415](https://www.rfc-editor.org/rfc/rfc8415)
- RFC 9663 — DHCPv6-PD per client in large broadcast networks (Oct 2024). [https://datatracker.ietf.org/doc/rfc9663/](https://datatracker.ietf.org/doc/rfc9663/) [RFC Editor](https://www.rfc-editor.org/info/rfc9663)
- RFC 9762 — RA "P" flag signaling DHCPv6-PD preference. [https://www.rfc-editor.org/rfc/rfc9762](https://www.rfc-editor.org/rfc/rfc9762) [RFC Editor](https://www.rfc-editor.org/rfc/rfc9762)
- `draft-ietf-dhc-rfc8415bis-12` — DHCPv6 revision in IETF Last Call. [https://datatracker.ietf.org/doc/draft-ietf-dhc-rfc8415bis/](https://datatracker.ietf.org/doc/draft-ietf-dhc-rfc8415bis/)
- IETF DHC working group GitHub. [https://github.com/dhcwg](https://github.com/dhcwg)

**Books**

- *The DHCP Handbook*, 2nd ed., Droms & Lemon (2002, Sams, ISBN 0-672-32327-3) — still the canonical book on DHCPv4 internals; advanced; dated on DHCPv6 and Kea but unmatched on packet semantics. [https://www.amazon.com/DHCP-Handbook-Ralph-Droms-Ph-D/dp/0672323273](https://www.amazon.com/DHCP-Handbook-Ralph-Droms-Ph-D/dp/0672323273)
- *TCP/IP Illustrated, Vol. 1: The Protocols* — Stevens; intermediate; DHCP coverage is brief but the surrounding stack is essential context.
- *Computer Networking: A Top-Down Approach*, Kurose & Ross (8th ed., 2020) — intro; DHCP is in the network layer chapter.
- *IPv6 Address Planning*, Tom Coffeen (O'Reilly, 2014) — intermediate; helps you make sense of DHCPv6-PD design.

**Engineering blog posts (2024–2026 emphasis)**

- Leviathan Security — TunnelVision disclosure (May 2024). [https://www.leviathansecurity.com/blog/tunnelvision](https://www.leviathansecurity.com/blog/tunnelvision) — advanced.
- ISC blog — "Kea 3.0, our first LTS version" (June 2025). [https://www.isc.org/blogs/kea-3-0/](https://www.isc.org/blogs/kea-3-0/)
- ISC blog — "2025 Stork, Kea, and DHCP Development Report." [https://www.isc.org/blogs/2025-dhcp-report/](https://www.isc.org/blogs/2025-dhcp-report/)
- Meta — "DHCPLB: An open-source load balancer" (2016) and "Extending DHCPLB: from load balancer to server" (2019). [https://engineering.fb.com/2019/05/28/data-infrastructure/dhcplb-server/](https://engineering.fb.com/2019/05/28/data-infrastructure/dhcplb-server/)
- Akamai — "Abusing the DHCP Administrators Group" (2024). [https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains](https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains)
- SUSE Security — Kea local root report (May 2025). [https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html](https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html)
- ipSpace.net — "A Holistic Look on SLAAC and DHCPv6" and "Android Phones Might Ask for /64 Delegated Prefix." [https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/](https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/)

**University courses**

- **Stanford CS144 — Introduction to Computer Networking** (Levis & McKeown). [https://cs144.github.io/](https://cs144.github.io/) — intermediate. Lecture series available on YouTube; the assignments build a TCP/IP stack in C++.
- MIT 6.829 / 6.5820 — Computer Networks. Recent lecture notes online.
- CMU 15-441 — Computer Networks.

**Hands-on**

- Wireshark with `bootp` filter (legacy name) or `dhcp` (post-3.0). [https://wiki.wireshark.org/DHCPv6](https://wiki.wireshark.org/DHCPv6)
- ISC Kea + Stork sandbox (Docker images). [https://gitlab.isc.org/isc-projects/kea](https://gitlab.isc.org/isc-projects/kea)
- Cisco Packet Tracer / GNS3 / EVE-NG with virtual switches and routers.
- `dhcping`, `dhcdump`, `dhcpdump`, `nping --dhcp`.

**Podcasts / video**

- *Packet Pushers — Heavy Networking* — has multiple long-form DHCP episodes; search the back catalog at [https://packetpushers.net](https://packetpushers.net).
- David Bombal on YouTube has multiple DHCPv4 packet-walkthrough videos.
- Practical Networking — "DHCP Fundamentals" series.
- Computerphile — "How DHCP Works" (intro level).

---

## Where things are heading (2025–2026 frontier)

The honest summary: **DHCPv4 is in maintenance mode; DHCPv6 is being dragged toward "prefix-per-device"; security work is happening at L2/L3, not inside DHCP itself.**

- **ISC DHCP is dead and Kea has won the open-source race.** Kea 3.0 LTS (June 2025) is the platform of record; the Control Agent is being removed; the OPNsense/pfSense/MAAS/OpenWrt ecosystems are all migrating ([https://www.isc.org/blogs/kea-3-0/](https://www.isc.org/blogs/kea-3-0/); [https://maas.io/blog/no-more-dhcpd](https://maas.io/blog/no-more-dhcpd); [https://docs.opnsense.org/releases/CE_25.1.html#may-08-2025](https://docs.opnsense.org/releases/CE_25.1.html#may-08-2025)). [ISC](https://www.isc.org/blogs/kea-3-0/)
- **DHCPv6 standards work is concentrated in 8415bis.** `draft-ietf-dhc-rfc8415bis-12` is dated 4 June 2025 and intends to obsolete RFC 8415 by removing IA_TA temporary addresses and Server Unicast — both little-used and a source of complexity ([https://datatracker.ietf.org/doc/draft-ietf-dhc-rfc8415bis/](https://datatracker.ietf.org/doc/draft-ietf-dhc-rfc8415bis/)). As of May 2026 it is still an Internet-Draft.
- **The big shift: prefix-per-device (RFC 9663).** Google's authors argue that giving every host a /64 (or even /60) via DHCPv6-PD scales better than ND caches of dozens of addresses per client, especially in VXLAN fabrics and on Wi-Fi controllers with hard client-MAC limits ([https://datatracker.ietf.org/doc/rfc9663/](https://datatracker.ietf.org/doc/rfc9663/)). Android Core Networking has adopted this model in 2025, which finally puts a DHCPv6 client in Android — but only for IA_PD, not IA_NA, prolonging the SLAAC-vs-stateful war ([https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/](https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/)). [IETF](https://datatracker.ietf.org/doc/rfc9663/)[ipSpace.net](https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/)
- **The SLAAC vs DHCPv6 debate is alive, ugly, and political.** RFC 8504 makes SLAAC mandatory and DHCPv6 only "SHOULD"; until 2024 Android refused DHCPv6 outright; enterprise operators want DHCPv6 for tracking and policy. Recent v6ops drafts and RFC 9663/9762 are an attempt at peace by giving operators a third option (prefix-per-device) ([https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/](https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/)). [Wordpress](https://theinternetprotocolblog.wordpress.com/2021/01/04/a-holistic-look-on-slaac-and-dhcpv6/)
- **TunnelVision changed the option-121 conversation.** The May 2024 disclosure forced VPN vendors (Mullvad, Fortinet, Palo Alto, WatchGuard, Zscaler) to publish advisories; mitigations rely on firewall rules, network namespaces, or ignoring option 121 — none are inside the DHCP protocol itself ([https://www.leviathansecurity.com/blog/tunnelvision](https://www.leviathansecurity.com/blog/tunnelvision); [https://thehackernews.com/2024/05/new-tunnelvision-attack-allows.html](https://thehackernews.com/2024/05/new-tunnelvision-attack-allows.html)). Expect VPN clients shipped from 2025 onward to harden default behavior, but the underlying fact — DHCP is unauthenticated — stays.
- **Privacy via RFC 7844 anonymity profiles** is now widely supported in Apple, Microsoft, and Linux clients (NetworkManager, systemd-networkd) when MAC randomization is enabled. Adoption is strongest in mobile-class clients; enterprise managed devices typically opt out for asset tracking.
- **Authentication via RFC 3118 is effectively dead.** No mainstream server or client implements it; ISC stated they have no plans to add it ([https://dhcp-users.isc.narkive.com/PzhhfwGd/support-for-rfc-3203](https://dhcp-users.isc.narkive.com/PzhhfwGd/support-for-rfc-3203)). The Secure-DHCPv6 draft expired in 2017. Expect *no* in-protocol DHCP authentication standard to ship by 2027 — security will continue to live at 802.1X/MACsec/IPsec layers. [Narkive](https://dhcp-users.isc.narkive.com/PzhhfwGd/support-for-rfc-3203)
- **Cloud-native DHCP** is mostly invisible API plumbing. AWS VPC, Azure VNet, GCP all hand IPs through their own control planes; for users they expose only "DHCP options sets" or equivalents that customize ancillary fields like DNS suffix and NTP. AWS specifically caps you at four DNS servers and forbids per-subnet DHCP options ([https://oneuptime.com/blog/post/2026-02-12-dhcp-option-sets-in-vpc/view](https://oneuptime.com/blog/post/2026-02-12-dhcp-option-sets-in-vpc/view)). [OneUptime](https://oneuptime.com/blog/post/2026-02-12-dhcp-option-sets-in-vpc/view)
- **Kubernetes** does not use DHCP for pod IPs (CNI plugins assign directly), so Kea/dhcpd in containers is generally for *out-of-cluster* devices the cluster manages (e.g., bare-metal-as-a-service via Tinkerbell or Metal³).
- **Matter / Thread for IoT** — Thread is IPv6-only, uses SLAAC + Mesh-Local addresses + Off-Mesh routing through a Border Router; it does not require DHCPv6, though Matter commissioning paths in the Wi-Fi LAN do depend on standard DHCPv4/DHCPv6 working. Home Assistant's Matter docs explicitly note "no requirement to have an IPv6-enabled internet connection or DHCPv6 server" ([https://www.home-assistant.io/integrations/matter/](https://www.home-assistant.io/integrations/matter/)). Treat DHCP as adjacent infrastructure, not a Matter primitive. [Home Assistant](https://www.home-assistant.io/integrations/matter/)

---

## Hooks for the article, infographic, and podcast

**60-second narrated hook.**

> "Right now, your laptop's connection started with a 1985 protocol pretending to be its replacement. When you joined this Wi-Fi, your computer shouted into the void on UDP port 67 and the first stranger to answer told it: here's your IP, here's your DNS, here's the route to the internet. No password. No certificate. No questions. We've been running the modern Internet on this trust-the-stranger handshake for forty years — and in 2024, security researchers showed how an attacker on the same Wi-Fi can use one obscure option in that handshake to silently siphon traffic out of your VPN. The protocol is DHCP. It's everywhere. And almost nobody understands what it actually does."

**Striking statistic.**

> "Akamai's 2024 research observed Microsoft DHCP Server running in **40% of the enterprise networks they monitored** — and demonstrated that any DHCP administrator could escalate to full DHCP-server compromise without a single exploitable bug, because the design itself trusts that group." ([https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains](https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains))

**Pause-and-think moment.**

> "The 'magic cookie' that every DHCP packet starts with — `99.130.83.99` — was very nearly the four ASCII bytes spelling **OREO**. Phil Prindeville suggested it; Jon Postel changed it before publication, almost certainly to avoid Nabisco's trademark. Forty years and trillions of packets later, the bytes are arbitrary, fixed, and cannot be changed. Your network booted today on a number that was someone's joke about cookies." (Source: Ralph Droms, dhcp-users mailing list, [https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html](https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html))

**Failure-story arc — TunnelVision.**

> *Setup.* It's spring 2024. Hundreds of millions of people pay for VPNs to keep their laptops safe on coffee-shop Wi-Fi. The VPN model is simple: install a virtual interface with a default route through it, and the OS sends all traffic through the encrypted tunnel.
> 
> *Mistake.* In 1999, the IETF added DHCP option 121 — Classless Static Routes (RFC 3442). It lets the network operator push specific routes to clients. It's useful, mandatory in many specs, and **completely unauthenticated**. Almost every operating system implements it. Android, by historical accident, never did.
> 
> *Consequence.* Researchers at Leviathan Security set up a rogue DHCP server, handed VPN users two routes — `0.0.0.0/1` and `128.0.0.0/1` — both more specific than the VPN's default `0.0.0.0/0`. The OS dutifully installed them. The VPN stayed connected, the kill-switch never tripped, and every byte of traffic flowed in cleartext to the attacker. They named it **TunnelVision**, filed CVE-2024-3661, and showed the world that the multi-billion-dollar consumer-VPN industry was relying on a 1999 trust assumption ([https://www.leviathansecurity.com/blog/tunnelvision](https://www.leviathansecurity.com/blog/tunnelvision)).
> 
> *Resolution.* Mullvad, Fortinet, Palo Alto, WatchGuard, and Zscaler shipped firewall-rule mitigations that drop non-tunnel traffic regardless of the routing table. Linux users are advised to use network namespaces. The DHCP protocol itself was not changed and probably will not be. **Android, the one OS that ignored the standard, was the only one immune.**

---

## Caveats

- **Single-source claims flagged:** CVE-2026-3608 details rely on a single news write-up of the ISC advisory; verify CVSS at NVD before publishing. Comcast 2010 and Stanford 2007 rogue-DHCP stories are widely repeated industry folklore but I could not locate primary post-mortem sources in current search; marked `[needs source]`. Tesla and corporate-guest-network DHCP-exhaustion stories were not confirmed in primary sources and should not be reported as fact without further research.
- **Marketing/speculation marked:** Kea performance numbers ("tens of thousands of clients simultaneously") come from ISC's own marketing and a third-party news summary. Meta's "10× fewer servers" claim is qualitative and absolute QPS is not public.
- **Future-tense items:** `draft-ietf-dhc-rfc8415bis-12` is described as "intends to obsolete RFC 8415" — as of 5 May 2026 it is still an Internet-Draft. A search result referenced "RFC 9915" superseding RFC 8415 in the context of prefix delegation; that RFC number could not be independently confirmed in the IETF Datatracker and is treated as suspect.
- **Sources favored when conflicting:** IETF/IANA/ISC primary sources outrank summaries; NVD/MITRE outrank vendor PSIRT advisories on CVSS; vendor PSIRT advisories outrank journalism on which products are/are not affected.
- **Older sources verified:** Where 1990s and 2000s material was used (RFC 951, RFC 1048, RFC 2131/2132, RFC 3118), the claims were cross-checked against the current IETF/RFC Editor canonical text. Wikipedia is cited only where it summarizes well-sourced primary material that is itself linked.