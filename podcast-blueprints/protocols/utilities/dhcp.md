---
id: dhcp
type: protocol
name: Dynamic Host Configuration Protocol
abbreviation: DHCP
etymology: "[D]ynamic [H]ost [C]onfiguration [P]rotocol"
category: utilities
year: 1993
rfc: RFC 2131
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - layer-2-3/arp-and-ndp
  - transport/udp
related_protocols: [udp, dns, arp, ip, ipv6, wifi]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [951, 1048, 1534, 2131, 2132, 3046, 3118, 3315, 3442, 3927, 7610, 7844, 8156, 8415, 9663, 9762]
related_journeys: []
images:
  - src: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/DHCP_session.svg/500px-DHCP_session.svg.png"
    caption: "The DHCP DORA exchange — Discover, Offer, Request, Acknowledge — between a client with no IP yet and a server that hands out a lease, a subnet mask, a default gateway, and DNS resolvers in roughly a hundred milliseconds."
    credit: "Image: Wikimedia Commons / CC BY-SA 4.0"
visual_cues:
  - "A swimlane diagram of the DORA exchange: client at 0.0.0.0 broadcasts DISCOVER to 255.255.255.255 on UDP 67, server replies OFFER on UDP 68, client REQUESTs the chosen offer by broadcast, server ACKs with the lease — four arrows, four message-type option values 1, 2, 3, 5."
  - "The 236-byte BOOTP fixed header laid out field by field — op, htype, hlen, hops, xid, secs, flags, ciaddr, yiaddr, siaddr, giaddr, chaddr, sname, file — followed by the four magic-cookie bytes 99, 130, 83, 99 and the variable TLV options ending in 255. A label points at the magic cookie reading 'almost spelled OREO'."
  - "The DHCPv4 client state machine as a directed graph: INIT to SELECTING to REQUESTING to BOUND, with renewal at T1 unicast to the original server and rebinding at T2 broadcast to any server, plus the DHCPNAK arrow back to INIT."
  - "A timeline ribbon from 1985 BOOTP through 1993 DHCPv4 to 1997 RFC 2131, then 2018 RFC 8415 DHCPv6, October 2024 RFC 9663 prefix-per-device, and June 2025 Kea 3.0 LTS. Annotated with the 2022 ISC dhcpd end-of-life."
  - "The TunnelVision attack: rogue DHCP server hands the laptop two routes — 0.0.0.0/1 and 128.0.0.0/1 via attacker — both more specific than the VPN's default 0.0.0.0/0. Encrypted traffic siphoned off in cleartext while the VPN icon stays green."
  - "Meta's data-center DHCP arc as a bar chart: ISC dhcpd to ISC Kea in 2014, Kea plus dhcplb load balancer in 2016, dhcplb-as-server replacing Kea in May 2019 with the caption 'same volume, ten times fewer servers'."
---

# DHCP — Dynamic Host Configuration Protocol

## In one breath

DHCP is the four-message handshake that lets a device with no IP address shout into the broadcast domain and walk away with a complete network configuration: an IP, a subnet mask, a default gateway, DNS resolvers, and a time-bounded lease. Ralph Droms and the IETF DHC working group standardized it in March 1997 as RFC 2131. Twenty-nine years later it still runs every Wi-Fi join, every cable-modem boot, and every container that asks the host for an address — and it still has no authentication, which is why a rogue server on the same Wi-Fi can quietly redirect your VPN traffic into the clear.

## The pitch (cold-open)

When you joined this Wi-Fi, your laptop shouted into the void on UDP port 67 and the first stranger to answer told it: here is your IP, here is your DNS, here is the route to the internet. No password. No certificate. No questions. We have been running the modern internet on this trust-the-stranger handshake for forty years — and in May 2024, security researchers at Leviathan Security showed that one obscure option in that handshake lets an attacker on the same Wi-Fi silently siphon traffic out of any commercial VPN. The protocol is DHCP. It is everywhere. The packet on the wire is still the 1985 BOOTP fixed header that DHCP swallowed whole.

## How it actually works

A device with no IP address has a problem. It cannot do TCP — TCP requires a SYN exchange between two endpoints that already know their own IP addresses. So DHCP runs over UDP, and the first message goes out as a broadcast. The four-message exchange is called DORA: Discover, Offer, Request, Acknowledge.

The client crafts a DHCPDISCOVER. The IP source is 0.0.0.0 because it has no address yet; the IP destination is 255.255.255.255, the all-ones limited broadcast; the UDP source port is 68 and the destination port is 67. Inside, the client identifies itself by its 48-bit MAC, picks a random 32-bit transaction ID called xid, and lists the parameters it wants — subnet mask, router, DNS, domain name — in option 55, the Parameter Request List. The frame goes to the Ethernet broadcast address FF:FF:FF:FF:FF:FF, so every device on the segment receives it.

Each DHCP server on the segment, hearing the discover, picks an address from a pool, optionally ARP-probes it to make sure no one else is using it, and unicasts or broadcasts back a DHCPOFFER. The offer fills in the yiaddr field — "your IP" — with the proposed address, and stuffs the requested options into the TLV options block: option 1 for the subnet mask, option 3 for the router list, option 6 for DNS resolvers, option 51 for the lease time in seconds. Multiple servers may offer simultaneously.

The client picks one offer and broadcasts a DHCPREQUEST. The broadcast is deliberate — it tells the unsuccessful servers their offers were declined, so they can return the addresses to their pools. The chosen server replies with a DHCPACK that commits the binding. The client configures its interface with the assigned IP, mask, gateway, and DNS, and starts two timers: T1 at half the lease, when it will unicast a renew to the original server, and T2 at seven-eighths of the lease, when it will broadcast a rebind to anyone who will listen. The whole DORA exchange takes a hundred to five hundred milliseconds. Renewal takes one round trip.

### Header at a glance

DHCP reuses the BOOTP fixed header from RFC 951 — 236 bytes before options, every field a 1985 fossil:

- op, 1 byte. 1 means BOOTREQUEST from a client; 2 means BOOTREPLY from a server.
- htype and hlen, 1 byte each. Hardware address type and length. 1 and 6 for Ethernet.
- hops, 1 byte. Zero from the client; relay agents increment it as they forward the packet across subnet boundaries.
- xid, 4 bytes. Random transaction ID that pairs requests with replies.
- secs, 2 bytes. Seconds the client has been trying to acquire or renew.
- flags, 2 bytes. Only one bit defined: the broadcast flag, which lets older stacks ask the server to reply by broadcast instead of unicast.
- ciaddr, 4 bytes. Client IP, only set when the client is already BOUND, RENEWING, or REBINDING.
- yiaddr, 4 bytes. The "your IP" field that the server fills in with the offered or assigned address.
- siaddr, 4 bytes. Next-server IP, used for PXE network boot.
- giaddr, 4 bytes. The gateway-or-relay IP, set by relay agents to drive subnet selection on the server.
- chaddr, 16 bytes. Client hardware address — left-padded; only the first hlen bytes count.
- sname and file, 64 and 128 bytes. Optional server hostname and boot filename, both null-terminated.
- The four-byte magic cookie 99.130.83.99 — the sentinel that separates BOOTP-only packets from DHCP packets.
- options. TLV-encoded, ending in option 255. The most important is option 53, the message type, which carries values 1 through 8 for DISCOVER, OFFER, REQUEST, DECLINE, ACK, NAK, RELEASE, and INFORM.

### State machine in three sentences

RFC 2131 section 4.4 defines the DHCPv4 client state machine as INIT to SELECTING to REQUESTING to BOUND, then RENEWING at T1 (lease over two), then REBINDING at T2 (lease times seven-eighths), and back to INIT when the lease expires. There are two side branches: INIT-REBOOT, where a client with a cached lease tries to confirm it after a restart, and the DHCPNAK path, where a server refuses — usually because the requested IP belongs to a different subnet — and the client falls back to INIT. Side messages outside the DORA loop include DHCPDECLINE for "your offered address conflicts on the wire," DHCPRELEASE for voluntary surrender, DHCPINFORM for "I have an IP statically but want the rest of the parameters," and the rarely-deployed FORCERENEW from RFC 3203.

### Reliability, options, and security mechanics

There is no encryption, no integrity check, no authenticity. RFC 2131 section 7 acknowledges this; RFC 3118 in 2001 added an Authentication option using HMAC-MD5 with pre-shared keys, but it has never been widely deployed because the entire point of DHCP is to configure machines that have not yet been configured — so where does the pre-shared key come from? The IETF eventually pushed the problem to lower layers: 802.1X port authentication gates the port before DHCP runs, DHCP snooping on the switch drops server-typed messages on untrusted ports, and DHCPv6-Shield (RFC 7610, BCP 199) is the IPv6 analog. Defense lives in L2 and the switch, not in the protocol itself.

Reliability comes from the application: lost messages just get retransmitted with the same xid. Conflict detection is two-sided — RFC 2131 says servers SHOULD ARP-probe an offered address before assignment, and clients SHOULD ARP-probe before using it and DHCPDECLINE on conflict. DHCPv6 is structurally different: UDP 546 client to UDP 547 server, link-scoped multicast to ff02::1:2 instead of broadcast, DUIDs instead of MAC-based client identifiers, and the four-message exchange is SOLICIT, ADVERTISE, REQUEST, REPLY — or two messages with Rapid Commit. DHCPv6 also adds Prefix Delegation (IA_PD), where a client asks for a whole prefix like a /56 to hand out further downstream, defined originally in RFC 3633 and folded into RFC 8415 in 2018.

The most important options to know by number: 1 subnet mask, 3 router, 6 DNS, 12 hostname, 15 domain name, 50 requested IP, 51 lease time, 53 message type, 54 server identifier, 55 parameter request list, 58 and 59 the renewal and rebinding times, 60 vendor class identifier ("PXEClient", "MSFT 5.0"), 61 client identifier, 66 and 67 TFTP server name and boot filename for PXE, 82 the relay agent information option from RFC 3046 with circuit-id and remote-id sub-options, 119 the domain search list, and 121 — Classless Static Routes from RFC 3442. Option 121 is the one you should remember; it is the centerpiece of the TunnelVision attack.

## Where it shows up in production

**Meta**'s public engineering blog is the gold standard. They migrated from ISC dhcpd to ISC Kea in 2014 for data-center provisioning, open-sourced their dhcplb load balancer in 2016, and in May 2019 replaced Kea entirely with their Go-based DHCPLB-as-server, claiming "the same volume of traffic with ten times fewer servers." The arc — proprietary, then ISC, then ISC plus a custom load balancer, then a Go reimplementation — is the canonical hyperscaler DHCP story.

**Microsoft Windows DHCP Server**, bundled with Windows Server since NT 3.5 in 1994, is still everywhere. Akamai's 2024 research observed it running in **40% of the enterprise networks they monitored**. Microsoft's June 2025 Patch Tuesday updates — KB5060526, KB5060531, KB5060842 for Server 2019/2022/2025 and KB5061010 for Server 2016 — caused the DHCP service to "intermittently stop responding," and the fix shipped in the July 2025 cumulative updates.

**ISC Kea** is the open-source flagship now that ISC dhcpd has reached end of life. Kea 3.0 LTS shipped on 18 June 2025 with a three-year support window, opensourced twelve previously-commercial hooks, added a native HTTPS API, and announced that the standalone Control Agent will be removed in the next development branch. Mozilla Public License 2.0; C++ with JSON config and MySQL/PostgreSQL/memfile backends. OPNsense announced Kea would become its default in version 25.7.

**dnsmasq**, Simon Kelley's lightweight DNS-and-DHCP server from around 2000, is the default in OpenWrt, DD-WRT, Android tethering, OpenStack Neutron, Home Assistant, and most home routers. It scales fine for hundreds of clients but breaks at fleet scale. A Hacker News post from June 2025 reports a deployment of 20,000 PS5-derived APUs PXE-booting through dnsmasq: "eventually we traced it down to dnsmasq being unable to keep up with all the DHCP UDP traffic… switched to Kea and all of our problems magically went away." OPNsense is moving the other direction at small scale and making dnsmasq DHCP its default starting 25.7.

**AWS VPC DHCP options sets** are how DHCP looks in the cloud. Each VPC has exactly one option set, defining DNS servers, domain name, NTP servers, and NetBIOS settings. Maximum four DNS servers per option set. When you change the set, instances pick up the change "within a few hours, depending on how frequently the instance renews its DHCP lease." Per-subnet DHCP options are not supported. **Google Cloud** is more interesting on the v6 side: per ipSpace.net, "the only way to get a VM IPv6 address in Google Cloud is to use DHCPv6" — a quiet counterpoint to Android's continuing refusal to implement DHCPv6 IA_NA.

**Enterprise DDI vendors** — Infoblox, BlueCat, EfficientIP, Men&Mice, Akamai (formerly Nominum) — sell appliance-grade DHCP combined with DNS and IPAM. Cisco IOS ships its own DHCP server. The high-availability story for open-source is Kea's `high_availability` hook plus a shared MySQL/PostgreSQL backend; for DHCPv6, RFC 8156 from June 2017 standardized a primary-secondary failover protocol with binding sync.

## Things that go wrong

**TunnelVision (CVE-2024-3661, May 2024).** Leviathan Security disclosed it on 6 May 2024. The setup: hundreds of millions of people pay for VPNs to keep their laptops safe on coffee-shop Wi-Fi. The VPN model is simple — install a virtual interface with a default route through it, and the OS sends all traffic through the encrypted tunnel. The mistake: in 1999 the IETF added DHCP option 121, Classless Static Routes, in RFC 3442. It lets the network operator push specific routes to clients. It is useful, mandatory in many specs, and completely unauthenticated. The exploit: Leviathan stood up a rogue DHCP server, handed VPN users two routes — 0.0.0.0/1 and 128.0.0.0/1 — both more specific than the VPN's default 0.0.0.0/0. The OS dutifully installed them. The VPN stayed connected, the kill-switch never tripped, and every byte flowed in cleartext to the attacker.

The resolution: Mullvad, Fortinet, Palo Alto, WatchGuard, and Zscaler all shipped firewall-rule mitigations that drop non-tunnel traffic regardless of the routing table; CISA issued an advisory; Linux users were advised to use network namespaces. Android, the one OS that never implemented option 121, was the only one immune. The DHCP protocol itself was not changed, and probably will not be.

**DynoRoot (CVE-2018-1111, May 2018).** Felix Wilhelm at Google found that Red Hat's `/etc/NetworkManager/dispatcher.d/11-dhclient` script `eval`-ed DHCP option values without escaping. A rogue server returning `option 252 "x'; touch /tmp/pwn #"` ran arbitrary commands as root on RHEL 6 and 7, CentOS 6 and 7, and Fedora 28. The proof of concept fit in a tweet. The lesson — never `eval` server-supplied bytes — was old in 1998, but it took a DHCP option to land it as a remote-root CVE in 2018.

**Akamai's "Abusing the DHCP Administrators Group" (May 2024).** Not a CVE — an abuse of legitimate Microsoft DHCP-administrator privileges. Combine writable DHCP options with AD CS Web Enrollment ESC8 and you can coerce Kerberos auth and obtain the DHCP server machine's NTLM hash. The fix is operational hygiene: do not put untrusted users in the DHCP Administrators group. Akamai's report is also where the "40% of enterprise networks run Microsoft DHCP" number comes from.

**Microsoft DHCPv6 RCE (CVE-2023-28231).** A heap overflow in `dhcpssvc.dll`'s `ProcessRelayForwardMessage()` when a RELAY-FORW carries more than 32 nested Relay-Message options. RCE as NETWORK SERVICE; patched April 2023. ZDI's writeup is the readable account.

**The Kea CVE wave (2025–2026).** SUSE's security team (Matthias Gerstner) found that Kea's `set-config` REST API allowed loading arbitrary hook libraries; many distros shipped Kea with the API unauthenticated and the daemon running as root, yielding local root — CVE-2025-32801, -32802, -32803, fixed in Kea 2.4.2/2.6.3/2.7.9 on 28 May 2025. CVE-2025-40779 in August 2025 was a single-packet DoS via a unicast DHCPv4 request with specific options. CVE-2025-11232 in late 2025 was a malformed-hostname crash when `ddns-qualifying-suffix` is non-empty. CVE-2026-3608 in March 2026 was a stack overflow on Kea API or HA listeners, fixed in 2.6.5 and 3.0.3. Pattern: as Kea grew its REST and HA surface, that surface grew CVEs.

**ISC DHCP OMAPI (CVE-2017-3144).** Failure to clean up closed OMAPI control connections let an attacker exhaust the server's file-descriptor pool. Affected ISC DHCP 4.1 through 4.3.6. Mostly historical now that ISC dhcpd is end-of-life — but a useful reminder that if you still run dhcpd, the box is a museum.

**DHCP starvation (Yersinia).** The classic Layer-2 attack: spoof thousands of MACs, send DHCPDISCOVERs, exhaust the pool, then optionally raise a rogue server to fill the vacuum. Defense is also classic: switch port-security limit on MAC count, plus DHCP snooping to drop server-typed messages on untrusted ports.

**Microsoft June 2025 patch-Tuesday DHCP outage.** Already mentioned in production: KB5060526 and friends caused the DHCP service to stop responding on Server 2016 through 2025. Clients could not renew leases. Rolling back the update fixed it. Microsoft acknowledged and shipped a fix in the July 2025 cumulative updates.

## Common pitfalls (for the practitioner)

- **Lease times set short "for safety."** At 1-hour leases each client renews about 12 times per day. On 100,000 devices that is ~33 renewals per second, every second, for no benefit. Wired data center leases should be 4 to 8 days; office Wi-Fi 1 to 2 days; guest Wi-Fi 1 to 2 hours; carrier residential 24 hours to 7 days.
- **Overlapping pools across two HA partners.** Same address handed twice; the only way you find out is the first DHCPDECLINE.
- **Missing `ip helper-address` on the relay.** DHCP traffic dies at the L3 boundary because the broadcast does not cross subnets. Symptom: clients on the remote subnet sit in INIT forever and end up with a 169.254 link-local address.
- **Option 82 `trusted` set on a downstream port.** A rogue client can spoof its circuit-id and remote-id and steal another tenant's pool. Trust option 82 only on uplinks toward the core.
- **Static reservations duplicated into the dynamic pool.** Two clients eventually argue over the same address.
- **DHCPv6 server replying with too-short `valid-lifetime`**, causing constant renewal churn.
- **`next-server` (siaddr) unset for PXE while option 66 is set.** iPXE fails at boot because it cannot find the TFTP server.
- **Pre-3.0 Kea defaults.** The `kea-ctrl-agent` ran an HTTP REST API on `localhost:8000` without authentication, often as root. That is CVE-2025-32801. Kea 3.0 changed defaults; verify on upgrade.
- **Cisco IOS rejecting DHCPv4 with `giaddr=0`** while Catalyst switches in DHCP-snooping mode use `giaddr=0`. Long-standing source of misconfiguration; have an explicit override.

## Debugging it

Wireshark and tshark on UDP 67/68 for v4, 546/547 for v6:

```
tshark -i any -f "udp port 67 or udp port 68"
tshark -i any -f "udp port 546 or udp port 547"
tshark -r dhcp.pcap -Y "bootp.option.type == 82"
```

Note the legacy `bootp` filter name in older Wireshark versus `dhcp` in 3.0+.

Linux client-side:

```
sudo dhclient -v eth0
sudo dhcpcd -B -d eth0
journalctl -u systemd-networkd -f
nmcli device show eth0
cat /var/lib/dhcp/dhclient.leases
ip addr show eth0
```

ISC dhcpd (legacy):

```
tail -f /var/log/syslog | grep dhcpd
omshell    # OMAPI control — same OMAPI as CVE-2017-3144
```

Kea:

```
sudo journalctl -u kea-dhcp4-server -f
kea-shell --host 127.0.0.1 --port 8000 lease4-get-all
```

Active probing:

```
sudo dhcping -s 192.0.2.1 -c 192.0.2.50 -h aa:bb:cc:dd:ee:ff
sudo nping --dhcp
```

Things to monitor: lease pool utilization (alert at 80, 90, 95%), DHCPNAK rate (sustained NAKs mean pool/relay/policy mismatch), DHCPDECLINE rate (a sudden spike means duplicate addresses on the wire — rogue static config or rogue server), DISCOVER-vs-renew ratio per MAC (lots of DISCOVERs from one client means the client is losing state), and conflict-detection events from the server's ARP/ICMP probe getting replies.

## What's changing in 2026

- **March 2026 — CVE-2026-3608.** Stack overflow via crafted control-channel or HA messages on Kea 2.6 and 3.0. Crashes `kea-ctrl-agent`, `kea-dhcp-ddns`, `kea-dhcp4`, and `kea-dhcp6`. Fixed in 2.6.5 and 3.0.3. Reported by Ali Norouzi at Keysight.
- **Late 2025 — CVE-2025-11232.** Malformed-hostname DoS in `kea-dhcp4` when `ddns-qualifying-suffix` is non-empty. Fixed in 3.0.2 and 3.1.3.
- **August 2025 — CVE-2025-40779.** Single-packet DoS on `kea-dhcp4`. Fixed in 2.7.10 and 3.0.1.
- **July 2025 — Microsoft ships the fix** for the June 2025 DHCP-service-hang regression in the cumulative updates.
- **18 June 2025 — Kea 3.0 LTS.** First Long-Term Support release with a three-year support window. Opensources twelve previously-commercial hooks, adds a native HTTPS API, hardens defaults (the unauthenticated REST API was the May 2025 local-root vector), and signals that the standalone Control Agent will be removed in the next development branch.
- **4 June 2025 — `draft-ietf-dhc-rfc8415bis-12`.** The next DHCPv6 spec, on the IETF Standards Track, intends to obsolete RFC 8415 by removing IA_TA temporary-address assignment and the Server Unicast option — both little-used and a source of complexity. As of May 2026 it is still an Internet-Draft, not yet a numbered RFC.
- **28 May 2025 — Kea local-root CVEs disclosed.** SUSE's writeup of CVE-2025-32801/-32802/-32803 — `set-config` REST API loading arbitrary hook libraries on a daemon running as root.
- **May 2025 — OPNsense announces Kea will be the default** in CE 25.7, completing the open-source migration off ISC dhcpd.
- **October 2024 — RFC 9663.** Colitti, Linkova, and Ma at Google publish "Using DHCPv6 Prefix Delegation to Allocate Unique IPv6 Prefixes per Client in Large Broadcast Networks." The argument: give every host its own /64 (or /60) via DHCPv6-PD, scale better than ND caches in VXLAN fabrics and on Wi-Fi controllers with hard client-MAC limits. Companion RFC 9762 adds the corresponding "P" flag in Router Advertisements. Android Core Networking adopted the model in 2025 — finally a DHCPv6 client in Android, but only for IA_PD, not IA_NA.
- **6 May 2024 — TunnelVision (CVE-2024-3661).** Leviathan Security publishes the disclosure. CISA, Mullvad, Fortinet, Palo Alto, WatchGuard, and Zscaler all issue advisories. The protocol itself is not changed.
- **End of 2022 — ISC dhcpd reaches End of Life.** Client and relay components EOL'd in mid-2022; the server EOL'd at the end of 2022 and gets only paying-customer support. pfSense, OPNsense, OpenWrt, and MAAS all begin migrating to Kea.

The honest summary: DHCPv4 is in maintenance mode; DHCPv6 is being dragged toward prefix-per-device by Google's authors and the v6ops working group; security work is happening at L2 and L3, not inside DHCP itself. RFC 3118 authentication is effectively dead — ISC has stated they have no plans to add it — and the Secure-DHCPv6 draft expired in 2017. Expect no in-protocol DHCP authentication standard to ship by 2027.

## Fun facts (host material)

- **The magic cookie was almost OREO.** Per Ralph Droms on the dhcp-users mailing list, Philip Prindeville suggested "OREO" in ASCII for the four-byte sentinel that separates BOOTP-only from DHCP options. Jon Postel changed it to 99.130.83.99 before publication, almost certainly to avoid Nabisco's trademark. Forty years and trillions of packets later, the bytes are arbitrary, fixed, and cannot be changed. Your network booted today on a number that was someone's joke about cookies.

- **DHCP is BOOTP that swallowed its host.** ISC's David Hankins put it best on the same dhcp-users thread: "DHCP is a thing that rides inside BOOTP. It's an extension that swallowed its host — people now think of these as DHCP packets rather than BOOTP packets using the DHCP protocol." The packet you sniff in 2026 still has BOOTP's `op`, `htype`, `chaddr`, `sname`, and `file` fields. Pure 1985 fossils.

- **RFC 2322 — Peg-DHCP.** A real April Fool's RFC from 1 April 1998 by Koos van den Hout, André Koopal, and Remco van Mook documenting how the Hacking-in-Progress 1997 conference handed out IP addresses by writing them on **wooden clothes-pegs** that attendees clipped to their network cables. The justification: "DHCP, almost completely defenseless against rogue servers, was not retained considering the traditionally creative use of the network." Still used today at hacker camps.

- **The broadcast flag controversy.** RFC 2131 added a one-bit "B" flag in `flags` so older Windows IP stacks that could not accept unicast frames before their stack was fully bound could ask the server to reply by broadcast. Most modern stacks do not set it. Some buggy switches drop the unicast reply because the destination MAC is not yet in their CAM table — leading to occasional "DHCPACK never arrives" mysteries.

- **DHCP authentication died of its own bootstrap problem.** RFC 3118 needed pre-shared keys, but the entire point of DHCP is to configure machines that have not yet been configured. The IETF eventually pushed authentication to L2 (802.1X) and L3 (IPsec/PANA), which is why the Authentication option is approximately a museum exhibit.

- **Why DHCPv6 ports 546/547?** They are 67 plus 479, and 68 plus 479. No semantic meaning — just sequentially-assigned IANA UDP ports that did not conflict with anything else.

- **Ralph Droms is still active.** As of his IETF profile dated 2026-02-20, the man whose 1989 Bucknell mailing list `dhcp-v4@bucknell.edu` started this whole thing still participates in DHC, dnssd, and 6lo work. He chaired the DHC working group from 1989 to 2009, authored or co-authored RFC 1531, 1541, 1534, 2131, 2132, and the 2002 Sams *DHCP Handbook*.

## Where this connects in the book

- Part Layer 2–3, chapter "ARP and NDP" — the chapter pairs DHCP with ARP as the two halves of bootstrapping a host onto the wire: DHCP hands out the IP, ARP turns it into a MAC. Also the place to hear about IPv6's Neighbor Discovery, SLAAC, and the IPv6-mostly experiment with DHCP option 108 (RFC 8925).
- Part Transport, chapter "UDP" — the chapter on why UDP exists names DHCP as one of its three founding use cases (alongside DNS and NTP): you cannot do TCP if you have no IP address, and UDP broadcast is the only way a host without an address can ask the network for one.

## See also (other protocol episodes)

- **The UDP episode.** DHCP is one of UDP's archetypal applications. The reason DHCP runs on UDP at all is that a client doing DHCPDISCOVER has no IP address — TCP requires a SYN exchange between two known-IP endpoints, which is impossible in INIT state. UDP also lets the broadcast reach multiple servers in parallel. If you have heard the UDP episode, the contrast with TCP is everything.
- **The DNS episode.** DHCP's job is to tell the client where the DNS resolver lives. Option 6 carries the resolver IPs; option 119 carries the search list. The dynamic DNS update path (RFC 2136) lets the DHCP server insert and remove A, AAAA, and PTR records on the client's behalf; Kea integrates this through its `kea-dhcp-ddns` daemon.
- **The ARP episode.** DHCP and ARP are the two halves of the same bootstrap. DHCP servers SHOULD ARP-probe an offered address before assignment; clients SHOULD ARP-probe before using it and DHCPDECLINE on conflict. The ARP cache on a freshly-DHCPed host is empty, and the first thing it usually resolves is the gateway whose IP DHCP just told it about.
- **The IP episode.** DHCP exists because IPv4 addresses are a scarce, allocatable resource that must be assigned per-interface. Without scarcity there would be no leases.
- **The IPv6 episode.** IPv6 turned the question on its head: SLAAC (RFC 4862) lets a host generate its own address from a router-advertised prefix without any DHCP server at all. RFC 8504 makes SLAAC mandatory and DHCPv6 only "SHOULD." DHCPv6 fights back with stateful address assignment (IA_NA), prefix delegation (IA_PD), and the new RFC 9663 prefix-per-device model that Android finally adopted in 2025.
- **The Wi-Fi episode.** Every Wi-Fi join ends with a DHCP exchange. The captive portal in a hotel or airport intercepts the first HTTP request that follows the DHCPACK; iOS 18 and macOS Sequoia's "Rotate Wi-Fi Address" mode breaks MAC-based DHCP reservations because the MAC keeps changing.

## Visual cues for image generation

- "A swimlane diagram of the DORA exchange: client at 0.0.0.0 broadcasts DISCOVER to 255.255.255.255 on UDP 67, server replies OFFER on UDP 68, client REQUESTs the chosen offer by broadcast, server ACKs with the lease — four arrows, four message-type option values 1, 2, 3, 5."
- "The 236-byte BOOTP fixed header laid out field by field — op, htype, hlen, hops, xid, secs, flags, ciaddr, yiaddr, siaddr, giaddr, chaddr, sname, file — followed by the four magic-cookie bytes 99, 130, 83, 99 and the variable TLV options ending in 255. A label points at the magic cookie reading 'almost spelled OREO'."
- "The DHCPv4 client state machine as a directed graph: INIT to SELECTING to REQUESTING to BOUND, with renewal at T1 unicast to the original server and rebinding at T2 broadcast to any server, plus the DHCPNAK arrow back to INIT."
- "A timeline ribbon from 1985 BOOTP through 1993 DHCPv4 to 1997 RFC 2131, then 2018 RFC 8415 DHCPv6, October 2024 RFC 9663 prefix-per-device, and June 2025 Kea 3.0 LTS. Annotated with the 2022 ISC dhcpd end-of-life."
- "The TunnelVision attack: rogue DHCP server hands the laptop two routes — 0.0.0.0/1 and 128.0.0.0/1 via attacker — both more specific than the VPN's default 0.0.0.0/0. Encrypted traffic siphoned off in cleartext while the VPN icon stays green."
- "Meta's data-center DHCP arc as a bar chart: ISC dhcpd to ISC Kea in 2014, Kea plus dhcplb load balancer in 2016, dhcplb-as-server replacing Kea in May 2019 with the caption 'same volume, ten times fewer servers'."

## Sources

**RFCs**

- [RFC 951 — BOOTP (Croft & Gilmore, 1985)](https://www.rfc-editor.org/rfc/rfc951)
- [RFC 1048 — BOOTP Vendor Information Extensions (1988)](https://www.rfc-editor.org/rfc/rfc1048)
- [RFC 1534 — DHCP/BOOTP Interoperation (1993)](https://www.hjp.at/doc/rfc/rfc1534.html)
- [RFC 2131 — DHCPv4 (Droms, 1997)](https://www.rfc-editor.org/rfc/rfc2131)
- [RFC 2132 — DHCP Options (1997)](https://www.rfc-editor.org/rfc/rfc2132.txt)
- [RFC 2322 — Peg-DHCP (1998)](https://datatracker.ietf.org/doc/html/rfc2322)
- [RFC 3046 — Relay Agent Information Option 82 (2001)](https://www.rfc-editor.org/rfc/rfc3046)
- [RFC 3118 — Authentication for DHCP (2001)](https://datatracker.ietf.org/doc/html/rfc3118)
- [RFC 3203 — FORCERENEW](https://www.rfc-editor.org/rfc/rfc3203)
- [RFC 3442 — Classless Static Routes Option 121](https://www.rfc-editor.org/rfc/rfc3442)
- [RFC 3927 — IPv4 Link-Local 169.254.0.0/16](https://www.rfc-editor.org/rfc/rfc3927)
- [RFC 7610 — DHCPv6-Shield (BCP 199, 2015)](https://datatracker.ietf.org/doc/html/rfc7610)
- [RFC 7844 — Anonymity Profiles for DHCP Clients (2016)](https://datatracker.ietf.org/doc/html/rfc7844)
- [RFC 8156 — DHCPv6 Failover Protocol (2017)](https://www.rfc-editor.org/rfc/rfc8156.html)
- [RFC 8415 — DHCPv6 (2018)](https://www.rfc-editor.org/rfc/rfc8415)
- [RFC 9663 — DHCPv6-PD per client (October 2024)](https://datatracker.ietf.org/doc/rfc9663/)
- [RFC 9762 — RA "P" flag for DHCPv6-PD preference](https://www.rfc-editor.org/rfc/rfc9762)
- [draft-ietf-dhc-rfc8415bis-12 — DHCPv6 revision](https://datatracker.ietf.org/doc/draft-ietf-dhc-rfc8415bis/)

**Vendor / engineering blogs**

- [Leviathan Security — TunnelVision disclosure (May 2024)](https://www.leviathansecurity.com/blog/tunnelvision)
- [ISC — Kea 3.0, our first LTS version (June 2025)](https://www.isc.org/blogs/kea-3-0/)
- [ISC — 2025 Stork, Kea, and DHCP Development Report](https://www.isc.org/blogs/2025-dhcp-report/)
- [ISC — ISC DHCP End of Life KB](https://kb.isc.org/docs/aa-00896)
- [ISC — CVE-2025-40779 advisory](https://kb.isc.org/docs/cve-2025-40779)
- [ISC — CVE-2017-3144 OMAPI advisory](https://kb.isc.org/docs/aa-01541)
- [SUSE Security — Kea local root issues (May 2025)](https://security.opensuse.org/2025/05/28/kea-dhcp-security-issues.html)
- [Meta — Using ISC Kea DHCP in our data centers (2015)](https://engineering.fb.com/2015/07/21/core-infra/using-isc-kea-dhcp-in-our-data-centers/)
- [Meta — dhcplb open-source load balancer (2016)](https://engineering.fb.com/2016/09/13/data-infrastructure/dhcplb-an-open-source-load-balancer/)
- [Meta — Extending dhcplb from load balancer to server (2019)](https://engineering.fb.com/2019/05/28/data-infrastructure/dhcplb-server/)
- [Akamai — Abusing the DHCP Administrators Group (2024)](https://www.akamai.com/blog/security-research/abusing-dhcp-administrators-group-for-privilege-escalation-in-windows-domains)
- [ZDI — CVE-2023-28231 RCE in Microsoft DHCPv6](https://www.thezdi.com/blog/2023/5/1/cve-2023-28231-rce-in-the-microsoft-windows-dhcpv6-service)
- [Palo Alto Unit 42 — DHCP client script code execution (CVE-2018-1111)](https://unit42.paloaltonetworks.com/unit42-analysis-dhcp-client-script-code-execution-vulnerability-cve-2018-1111/)
- [Zscaler — TunnelVision analysis](https://www.zscaler.com/blogs/security-research/cve-2024-3661-k-tunnelvision-exposes-vpn-bypass-vulnerability)
- [Palo Alto — CVE-2024-3661 advisory](https://security.paloaltonetworks.com/CVE-2024-3661)
- [ipSpace.net — Android DHCPv6 Prefix Delegation (2025)](https://blog.ipspace.net/2025/09/android-dhcpv6-prefix-delegation/)
- [ipSpace.net — IPv6 SLAAC Unintended Consequences (2024)](https://blog.ipspace.net/2024/04/ipv6-slaac-unintended-consequences/)
- [INE — Understanding DHCP Option 82](https://ine.com/blog/2009-07-22-understanding-dhcp-option-82)
- [MAAS — No more dhcpd](https://maas.io/blog/no-more-dhcpd)
- [OPNsense CE 25.1 release notes (May 2025)](https://docs.opnsense.org/releases/CE_25.1.html#may-08-2025)
- [Microsoft — DHCP policies and option 82](https://learn.microsoft.com/en-us/archive/blogs/teamdhcp/dhcp-policies-based-on-relay-agent-information-option-option-82-dhcp-snooping-and-ip-source-guard)
- [Joshua Kugler — Interview with Simon Kelley, author of dnsmasq](https://joshuakugler.com/an-interview-with-simon-kelley-the-author-of-dnsmasq.html)
- [dhcp-users — Magic cookie origin (Droms, 2006)](https://lists.isc.org/pipermail/dhcp-users/2006-June/000978.html)

**News**

- [BleepingComputer — Microsoft June Windows Server security updates cause DHCP issues](https://www.bleepingcomputer.com/news/microsoft/microsoft-june-windows-server-security-updates-cause-dhcp-issues/)
- [Ivanti — July 2025 Patch Tuesday](https://www.ivanti.com/blog/july-2025-patch-tuesday)
- [The Hacker News — TunnelVision (May 2024)](https://thehackernews.com/2024/05/new-tunnelvision-attack-allows.html)
- [GBHackers — ISC critical warning over Kea DHCP vulnerability (CVE-2026-3608)](https://gbhackers.com/isc-issues-critical-warning-over-kea-dhcp-vulnerability/)
- [Security Online — Kea DHCPv4 DoS via malformed hostname (CVE-2025-11232)](https://securityonline.info/isc-patches-high-severity-kea-dhcpv4-dos-cve-2025-11232-flaw-allows-crash-via-malformed-hostname/)
- [Hacker News — 20,000-PXE-boot dnsmasq-to-Kea anecdote (June 2025)](https://news.ycombinator.com/item?id=44390962)

**Wikipedia**

- [Dynamic Host Configuration Protocol](https://en.wikipedia.org/wiki/Dynamic_Host_Configuration_Protocol)
- [Bootstrap Protocol](https://en.wikipedia.org/wiki/Bootstrap_Protocol)
- [DHCPv6](https://en.wikipedia.org/wiki/DHCPv6)
- [Dnsmasq](https://en.wikipedia.org/wiki/Dnsmasq)
- [Kea (software)](https://en.wikipedia.org/wiki/Kea_(software))
