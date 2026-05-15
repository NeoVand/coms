---
id: ssh
type: protocol
name: Secure Shell
abbreviation: SSH
etymology: "[S]ecure [SH]ell"
category: utilities-security
year: 1995
rfc: RFC 4253
standards_body: ietf
podcast_target_minutes: 22
related_book_chapters:
  - foundations/what-is-a-protocol
  - foundations/layer-model
  - foundations/addressing
  - foundations/ports-sockets
  - foundations/client-server-p2p
  - transport/tcp
  - utilities-security/ssh
  - patterns-failures/patterns
  - famous-outages/mitnick-1994
related_protocols: [tcp, tls, ftp, kerberos]
related_pioneers: []
related_outages: []
related_frontier: []
related_rfcs: [4250, 4251, 4252, 4253, 4254, 4255, 4256, 4344, 4419, 4432, 4716, 5656, 6187, 6668, 8268, 8308, 8332, 8709, 8731, 8732, 8758, 9142]
related_journeys: []
images:
  - { src: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Ssh_binary_packet_alt.svg/500px-Ssh_binary_packet_alt.svg.png", caption: "The SSH binary packet structure — packet length, padding length, encrypted payload, random padding, and a MAC. The padding hides traffic patterns; the MAC catches tampering. This is the wrapper around every SSH message after the banner.", credit: "Wikimedia Commons / CC BY 2.5" }
visual_cues:
  - "Two-column timeline: 'Telnet 1969 — sends your password in clear text' next to 'SSH 1995 — encrypted by the second packet'"
  - "Diagram of SSH's six derived keys (IV/Enc/MAC for each direction) sprouting from a single shared secret K and exchange hash H"
  - "The 'mlkem768x25519-sha256' default KEX as two key envelopes — a classical X25519 ECDH and an ML-KEM-768 lattice KEM — feeding into one SHA-256"
  - "regreSSHion call graph: SIGALRM fires inside malloc, syslog re-enters the allocator, heap corruption, root shell"
  - "XZ Utils backdoor stack: liblzma → libsystemd → sshd, with an Ed448 signature in the RSA modulus unlocking pre-auth code execution"
  - "OpenSSH version timeline 9.6 → 10.3 with Terrapin, regreSSHion, ML-KEM default, sshd-auth split, and PQ warning all marked"
---

# SSH — Secure Shell

## In one breath
SSH is the encrypted remote-shell protocol everyone uses without thinking — every `ssh prod-db-1`, every `git push`, every SCP, every cloud bastion. It opens a TCP connection on port 22, negotiates fresh session keys, proves the server's identity against a `known_hosts` file, authenticates the user with a public key, and then multiplexes interactive shells, file transfers, and tunnels over one encrypted stream. Tens of millions of servers run it; in 2024 it was the target of two of the most consequential security stories of the decade.

## The pitch (cold-open)
In late February 2024, a Microsoft database engineer named Andres Freund noticed his Debian sid laptop was taking about 500 milliseconds longer than usual to log in over SSH. He ran `perf`. By the end of March he had unraveled a multi-stage backdoor that had been quietly merged into a compression library called XZ Utils by a maintainer who had been building credibility for over two years. Two weeks more and that backdoor would have shipped to Debian stable, Ubuntu LTS, and Fedora — pre-auth root on basically every Linux server on the internet. One engineer noticed half a second of latency. That was the entire margin. This is the episode about what SSH actually is, why everyone runs it, and why a 30-year-old protocol written by a Finnish grad student is now the most-attacked surface in the world.

## How it actually works

A modern SSH connection has four phases: TCP setup and a plain-text version banner, an algorithm negotiation and key exchange, host-key verification and user authentication, and then the long-running connection protocol with multiplexed channels.

The client opens TCP to port 22. Both sides immediately send a single line in printable ASCII, capped at 255 bytes, of the form `SSH-2.0-OpenSSH_10.0\r\n`. That string gets mixed into the exchange hash later, which means a man-in-the-middle who rewrites it breaks the handshake. After the banners, every byte is wrapped in SSH's binary packet protocol.

Each side then sends `SSH_MSG_KEXINIT` with ten name-lists: kex algorithms, host-key algorithms, encryption algorithms in each direction, MAC algorithms in each direction, and compression in each direction, plus a 16-byte random cookie. Per RFC 4253 the client's preference order wins, not the server's. As of OpenSSH 10.0 the default first choice is `mlkem768x25519-sha256`, a hybrid post-quantum exchange that combines ML-KEM-768 with classical X25519 — more on that in the post-quantum section.

The KEX produces a shared secret K and an exchange hash H. The server signs H with its long-term host key and sends the signature plus its public host key. The client checks the host key against `~/.ssh/known_hosts`. Three outcomes: known and matches, in which case nothing happens visibly; unknown, which produces the famous Trust On First Use prompt — *"The authenticity of host '...' can't be established. Are you sure you want to continue connecting (yes/no)?"*; or known and changed, which produces a loud refusal and almost everyone has seen at least once.

Both sides send `SSH_MSG_NEWKEYS`, derive six keys from K, H, and the session ID per RFC 4253 §7.2 — IV client-to-server, IV server-to-client, encryption keys for each direction, MAC keys for each direction — and switch on the cipher. AEAD ciphers like ChaCha20-Poly1305 and AES-GCM use the encryption key for both confidentiality and integrity, so the MAC slot is unused.

Then user authentication. The client sends `SSH_MSG_USERAUTH_REQUEST` with a method: `publickey` is the path you actually want, `password` is what most distros allow by default, `keyboard-interactive` is what PAM and one-time passwords ride on, `gssapi-with-mic` is what enterprise Kerberos shops use. For pubkey, the client signs the session ID plus an authentication payload with its private key; the server checks the signature against an `authorized_keys` entry and replies `USERAUTH_SUCCESS`.

Once authenticated, the client opens channels. `session` for an interactive shell or remote command. `direct-tcpip` for `-L` local forwarding. `forwarded-tcpip` for `-R` remote forwarding. `x11` for forwarding GUI traffic. Each channel has its own flow-control window — OpenSSH defaults to 2 MB, refilled with `WINDOW_ADJUST` messages. One TCP connection, many concurrent channels, all encrypted under the same keys.

### Header at a glance
Every packet after the banner has the same shape: a four-byte big-endian packet length; a one-byte padding length; the payload; four to 255 bytes of random padding so the total length lines up to the cipher's block size; and a MAC tag at the end. The whole thing is at least 16 bytes and never exceeds 35,000. Each direction has an independent 32-bit sequence number that gets fed into the MAC — which is exactly why Terrapin worked, because those sequence numbers start counting before the first encrypted packet.

### State machine in three sentences
SSH has a simple state machine: TCP-open, banner-exchanged, KEX-in-progress, encrypted-but-unauthenticated, encrypted-and-authenticated, channels-open. Re-keying is allowed at any point and produces a fresh exchange hash and six fresh keys without breaking the connection. There is no resumption and no 0-RTT; every new connection re-runs the full handshake, which is one reason SSH3 prototypes on QUIC are interesting research.

### Reliability, flow, security mechanics
SSH leans on TCP for reliability and ordering — it cannot tolerate missing or reordered bytes inside its encrypted stream, which is why SCTP variants exist but never caught on. Per-channel flow control is sliding-window with an explicit `WINDOW_ADJUST` message, deliberately separate from TCP's flow control underneath. Confidentiality and integrity come from AEAD ciphers since OpenSSH 6.2: ChaCha20-Poly1305 and AES-GCM dominate, with HMAC-SHA-256 in encrypt-then-MAC mode as a fallback. Forward secrecy comes from the ephemeral DH or ECDH on every connection — long-term host-key compromise does not decrypt past sessions.

## Where it shows up in production

**OpenSSH everywhere.** OpenSSH is the overwhelming default. The latest release as of writing is 10.3, shipped 2 April 2026. It is the OpenBSD project's portable codebase that downstream Linux distros and *BSDs all consume. Microsoft ships it natively in Windows 10, 11, and Server. Qualys' 2024 internet scan counted more than 14 million OpenSSH server instances directly exposed to the public internet — and that is just the ones you can find by scanning port 22.

**Git over SSH.** GitHub, GitLab, and Bitbucket each handle millions of `git` operations per day over SSH. The pattern is `git@github.com:user/repo.git`, which translates to an SSH connection that runs `git-upload-pack` or `git-receive-pack` as a channel exec. GitHub's 24 March 2023 host-key exposure — covered in the incidents section — was a forced reminder of just how many people trust a single SSH fingerprint.

**Embedded and the rest of the long tail.** libssh and libssh2 are both widely used C libraries — libssh by KDE and libgit2, libssh2 by curl. Paramiko is the dominant Python implementation; JSch and Apache MINA SSHD cover Java; Russh covers Rust. Dropbear is the small embedded SSH that ships in OpenWRT-style routers. Tectia is the commercial descendant of Tatu Ylönen's original codebase. PuTTY by Simon Tatham remains the canonical Windows client.

**Cloud and zero-trust products.** AWS EC2 Instance Connect pushes a short-lived SSH key via the AWS API instead of relying on a static `authorized_keys`. Cloudflare One's Access for Infrastructure proxies SSH with short-lived certificates and command logging. Tailscale SSH ditches certificates entirely — it bridges WireGuard's tailnet to your identity provider so the host key still matters but authorization is brokered by the platform; it went GA in 2024. Teleport offers an SSH CA, recording proxy, and RBAC over the top. HashiCorp Boundary and Vault's SSH secrets engine, smallstep's `step-ca`, and the privileged-session brokers from CyberArk, BeyondTrust, and Delinea all sit in the same niche: turn `authorized_keys` sprawl into something an audit team can actually reason about.

**Performance numbers worth knowing.** AEAD throughput on modern CPUs with AES-NI: AES-256-GCM beats ChaCha20-Poly1305 by 1.5x to 3x per core; on CPUs without hardware AES, ChaCha20 wins. A 2025 cross-AWS-SKU benchmark by Ash Vardanian showed AES-256-GCM beating ChaCha20-Poly1305 by up to 3x on every modern server CPU with hardware acceleration. Connection setup is typically 5 to 7 RTTs end-to-end including TCP and auth — which is why the academic SSH3 prototype claiming 3 RTTs over QUIC keeps coming up.

## Things that go wrong

**XZ Utils — March 2024.** This one has its own chapter episode in the Utilities and Security part — the SSH chapter is where the supply-chain narrative lives. The short version: a maintainer using the name "Jia Tan" spent more than two years gaining commit and release authority on the XZ Utils compression library, then pushed obfuscated test files plus a build script into version 5.6.0 and 5.6.1 that quietly modified `liblzma`'s Makefile during x86_64 RPM and Deb builds. At runtime, when `liblzma` ended up loaded into a process named `/usr/sbin/sshd` — which happens because some distros patch sshd to link `libsystemd`, which links `liblzma` — the backdoor hooked OpenSSL's `RSA_public_decrypt` via IFUNC, examined the RSA modulus N of the key the client offered for pubkey auth, and if it contained a payload signed by an attacker's Ed448 key, it called `system()` before authentication ever completed.

CVSS 10.0. Affected Fedora 40 beta, Fedora Rawhide, Debian unstable and testing, openSUSE Tumbleweed, Kali rolling, and Arch briefly. Caught two weeks before it would have hit Debian stable and Ubuntu LTS. The reason it was caught was Andres Freund's curiosity about a 500-millisecond regression in SSH login latency. The deeper lesson is the one the chapter episode unpacks: the social engineering — the sock puppets pressuring the burned-out original maintainer to share the burden, the patient two-year buildup — was the part nobody had a defense against.

**regreSSHion — CVE-2024-6387, 1 July 2024.** Qualys' Threat Research Unit disclosed pre-auth, unauthenticated remote code execution as root in `sshd` on glibc-based Linux. The mechanism is a signal-handler race: when a connecting client fails to authenticate within `LoginGraceTime` — default 120 seconds — `sshd` raises `SIGALRM`, whose handler calls `syslog()`. `syslog()` is not async-signal-safe; it calls `malloc` and `free`. Interrupt `malloc` at the wrong instant and you can corrupt the heap, and from there you can build to RCE.

The lineage is the part that hurts. This is a regression of CVE-2006-5051, originally reported by Mark Dowd. The 2006 fix wrapped the unsafe code in `#ifdef DO_LOG_SAFE_IN_SIGHAND`. In October 2020, OpenSSH 8.5p1's logging refactor accidentally dropped the directive — so versions 8.5p1 up to but not including 9.8p1 are vulnerable, and versions 4.4p1 up to 8.5p1 are not, and OpenBSD itself was never vulnerable because its base system separately had a safe `sigdie()` since 2001. Exploitation took about 10,000 connection attempts — 3 to 4 hours at default `MaxStartups` and `LoginGraceTime` — on 32-bit x86. 64-bit was conjectured but not publicly demonstrated. Qualys put 14 million internet-exposed instances potentially in scope.

**Terrapin — CVE-2023-48795, 18 December 2023.** Fabian Bäumer, Marcus Brinkmann, and Jörg Schwenk at Ruhr University Bochum, USENIX Security 2024 best paper. A man-in-the-middle can delete a chosen number of encrypted packets from the start of an SSH channel without detection, because the per-direction sequence numbers begin counting before the first encrypted message and because for `chacha20-poly1305@openssh.com` and `*-etm@openssh.com` modes the early gap is recoverable by injecting `SSH_MSG_IGNORE`. It is a logical break, not RCE — but it can be used to downgrade pubkey signature algorithms by stripping extension negotiation and to disable OpenSSH 9.5's keystroke-timing obfuscation. In AsyncSSH, paired bugs CVE-2023-46445 and CVE-2023-46446 turned it into full session hijack. The mitigation is the "strict KEX" extension shipped in OpenSSH 9.6 that same December, and adopted by libssh, PuTTY 0.80, Go x/crypto/ssh, AsyncSSH, and Apache MINA SSHD within months.

**Debian OpenSSL PRNG — CVE-2008-0166.** A Debian maintainer in September 2006, trying to silence Valgrind warnings about uninitialised memory reads in OpenSSL, deleted the lines that were the primary entropy source for `RAND_add()`. For 20 months, every SSL and SSH key generated on Debian or any derivative — Ubuntu, Knoppix, every Debian-based VM image — was seeded almost entirely by the process ID. That is 32,768 possible keys per architecture, key type, and key size on Linux. Brute-forceable in seconds. The cleanup involved sweeping re-keying across every Debian-derived fleet and revocation of every signature any of those keys had ever made.

**The 2001 CRC32 compensation-attack RCE.** CVE-2001-0144. Disclosed by Michał Zalewski on Bugtraq, 8 February 2001. The 1998 SSH-1 insertion attack by Ariel Futoransky and Emiliano Kargieman at Core-SDI had been mitigated with a `deattack.c` patch — and the patch itself contained an integer overflow that gave remote root on OpenSSH up to 2.1.1 and SSH.com 1.2.31. Widely exploited in the wild. The single biggest accelerant for migration from SSH-1 to SSH-2.

**GitHub host-key exposure — 24 March 2023, around 05:00 UTC.** GitHub's RSA SSH host private key was briefly published in a public GitHub repo. CSO Mike Hanley posted the rotation announcement. The new fingerprint was `SHA256:uNiVztksCsDhcc0u9e8BujQXVUpKZIDTMczCvj3tD2s`. ECDSA and Ed25519 host keys were not rotated. Every SSH user in the world who had ever pulled or pushed via SSH had to `ssh-keygen -R github.com` and re-trust. The deeper lesson is the one the SSH chapter underlines: rotation discovery via `UpdateHostKeys` and SSHFP DNS records exists for exactly this case, and almost nobody had it on.

**Mining Your Ps and Qs — Heninger et al., USENIX Security 2012.** Best paper. An internet-wide scan found 0.03% of RSA SSH host keys and 1.03% of DSA host keys exposed, because embedded devices generated their first-boot keys before they had any meaningful entropy. The authors recovered thousands of private keys via batch-GCD. This is one of the underlying reasons DSA was finally removed from OpenSSH 10.0 in April 2025: DSA's per-signature random number is too easy to get wrong, and weak entropy at first boot turned that fragility into mass key compromise.

## Common pitfalls (for the practitioner)

- **TOFU bypass.** The Trust On First Use prompt is the most-clicked-through security UX in computing. Users mash `yes`. Attackers exploit by hijacking DHCP or DNS at coffee shops on the very first connection.
- **Agent forwarding hijack.** `ssh -A` sounds convenient and is dangerous: any compromised intermediate host can reach back through the forwarded agent socket and authenticate as you to anything you can reach. Use `ssh -J` (ProxyJump) instead — it tunnels TCP and never exposes your agent.
- **`ProxyCommand` injection.** `ssh user@$HOSTNAME` where `$HOSTNAME` is attacker-controlled and `ProxyCommand` uses the `%h` substitution can let an attacker inject shell commands. CVE-2023-51385 was the canonical case; CVE-2025-61985 is a recent re-occurrence patched in OpenSSH 10.0p1-7.
- **`PasswordAuthentication yes` on a public IP.** Real-world traffic to any open `:22` is dominated by automated credential stuffing. Either turn passwords off or move the daemon, but do not pretend brute force is theoretical.
- **PAM still allowing passwords.** Setting `PasswordAuthentication no` is not enough if PAM is configured to accept passwords through `keyboard-interactive`. The Mozilla OpenSSH guidelines have the canonical fix.
- **`AuthorizedKeysFile` permission mistakes.** Home directory must be 700 or 750; `~/.ssh` 700; `authorized_keys` 600. `StrictModes yes` is the default and refuses anything else, silently denying logins until you read the server log.
- **SSH key sprawl.** Thousands of unaudited `authorized_keys` entries accreted over years. Surveys repeatedly find enterprise networks with more SSH keys than employees. Certificates with expiry dates are the structural fix.
- **DSA still negotiated** by ancient deployments — gone in OpenSSH 10.0, but anything older than April 2025 may still accept it. SHA-1 in `ssh-rsa` was disabled by default in 8.8.

## Debugging it

- `ssh -vvv user@host` — three levels of verbosity. Most "why won't this work" answers are in here.
- `sshd -ddd -p 2222` — run a debug server on an alt port without touching production.
- `ssh-keyscan host` — fetch the server's host keys without connecting interactively.
- `ssh-add -L` — list the keys currently in your agent.
- `ssh -Q kex|key|cipher|mac|sig` — enumerate the algorithms your local binary supports.
- `ssh-keygen -lf <key>` — print a fingerprint you can compare to what the server prompted for.
- `ssh-audit` by Joe Testa — audit a server or client, score it against hardening guides, test for Terrapin and DHEat.
- Wireshark's SSH dissector for the banner and KEXINIT; everything after `NEWKEYS` is opaque.
- `journalctl -u ssh` or `/var/log/auth.log` for the server-side view.
- `Ciphers`, `MACs`, `KexAlgorithms`, `HostKeyAlgorithms`, `PubkeyAcceptedAlgorithms` in `sshd_config` and `ssh_config` — the Mozilla guideline values are a sane starting point.
- `ServerAliveInterval 60` and `ServerAliveCountMax 3` to keep connections alive through stateful firewalls that drop idle state.
- `ControlMaster auto`, `ControlPath ~/.ssh/cm-%C`, `ControlPersist 10m` — connection multiplexing so the second `ssh` to the same host reuses the first connection through a Unix socket. Cuts subsequent connection setup to milliseconds.

## What's changing in 2026

**OpenSSH 10.3 — 2 April 2026.** Bug- and security-fix release. Multiple late-2025 and early-2026 CVEs (CVE-2025-61984, CVE-2025-61985, CVE-2026-3497, CVE-2026-35385 through 35414) were patched in 10.2 and 10.3.

**OpenSSH 10.1 — October 2025.** Added the user-facing warning *"WARNING: connection is not using a post-quantum key exchange algorithm. This session may be vulnerable to 'store now, decrypt later' attacks."* This is the first major protocol stack to nudge users toward PQ at the UI layer.

**OpenSSH 10.0 — 9 April 2025.** Three big things in one release. DSA removed entirely. `mlkem768x25519-sha256` made the default key exchange — SSH became the first widely deployed protocol to ship post-quantum crypto on by default, six months before TLS X25519MLKEM768 reached default-on in iOS 26. User-auth split into a separate `sshd-auth` binary as a follow-on to the post-CVE-2024-6387 hardening of 9.8's `sshd-session`. Finite-field DH disabled on the server side by default.

**The IETF Secure Shell Maintenance WG — chartered August 2024.** First IETF working group dedicated to SSH in over a decade. Chairs Job Snijders at Fastly and Stephen Farrell at Trinity College Dublin, under Security AD Deb Cooley. Active drafts include `draft-ietf-sshm-mlkem-hybrid-kex` from Kampanakis, Stebila, and Hansen for `mlkem768x25519-sha256`; `draft-ietf-sshm-ntruprime-ssh` for `sntrup761x25519-sha512`; `draft-miller-sshm-strict-kex` codifying the OpenSSH Terrapin mitigation. The WG also has an explicit milestone to finally publish SFTP as an RFC — a draft has existed since 2006 and never made it to RFC, an embarrassment the WG charter calls out.

**Red Hat shipped ML-KEM-capable OpenSSH in RHEL 10.0 — May 2025.** Australia's ASD has set 2030 as a PQ migration deadline; the US NSA's CNSA 2.0 sets 2035. SSH stacks are already there; the long pole is server-side rollout in enterprise.

**FIDO2 hardware-backed keys (`-sk` keys).** OpenSSH 8.2 in February 2020 added `ed25519-sk` and `ecdsa-sk` keys backed by a YubiKey or other authenticator. Resident keys (`-O resident`) put the credential on the device itself; `-O verify-required` adds a PIN. GitHub, GitLab, Cloudflare, AWS IAM Identity Center all accept them. This is the strongest practical SSH credential available.

**SSH3 — research only.** François Michel and Olivier Bonaventure at UCLouvain have a prototype called SSH3 that re-implements an SSH-equivalent on HTTP/3 plus QUIC, claiming 3-RTT establishment versus SSH's 5 to 7. Not adopted by sshm. The WG charter explicitly excludes new transports. Interesting paper, not a product.

## Fun facts (host material)

**Port 22, the aesthetic choice.** Tatu Ylönen wanted a port between telnet on 23 and FTP on 21. On 10 July 1995 he emailed `iana@isi.edu`. Joyce K. Reynolds at IANA replied the next day: *"Tatu, We have assigned port number 22 to ssh, with you as the point of contact. Joyce."* That short email assigned a port that has since handled tens of millions of servers' worth of traffic for 30 years.

**Why it was written at all.** July 1995, Helsinki University of Technology. Ylönen wrote SSH after a password-sniffing attack on the university network. The whole thing — replacement for telnet, rlogin, rsh, and FTP, in one encrypted protocol — was the work of one graduate student responding to one incident. By the end of 1995 it had about 20,000 users in 50 countries.

**The OpenBSD fork, 26 September 1999.** Theo de Raadt, Markus Friedl, Niels Provos, Bob Beck, Aaron Campbell, Dug Song — and for portability Damien Miller and Darren Tucker — forked Björn Grönvall's OSSH (itself a clean re-derivation of Ylönen's last freely licensed `ssh-1.2.12`) into what became OpenSSH. SSH-2 support arrived with OpenSSH 2.0 in June 2000. OpenSSH still ships from OpenBSD; everything you run downstream is the portable build.

**Randomart, the drunken bishop.** The little ASCII art block you see when you generate a key with `ssh-keygen` — added to OpenSSH 5.1 in 2008 by Alexander von Gernler, motivated by Dan Kaminsky's 23C3 talk on hash visualization. The algorithm: a bishop walks diagonally on a 9-by-17 grid starting from the centre, each pair of fingerprint bits chooses a diagonal, cells get inked in proportion to visits, and the symbols are ` .o+=*BOX@%&#/^`. Turn it on per session with `VisualHostKey yes`. Catches host-key changes by shape, which humans are surprisingly good at.

**SFTP is not "FTP over SSH."** It is a wholly separate file-transfer protocol that runs as a subsystem request inside an SSH `session` channel. The spec is `draft-ietf-secsh-filexfer-13` from 2006 and was never published as an RFC. OpenSSH 9.0 in April 2022 switched the `scp` command to use SFTP under the hood by default; RHEL 9 deprecated the SCP wire protocol entirely. After 27 years, the protocol that was supposed to replace SCP is finally replacing SCP.

**The puffer fish.** OpenSSH inherits OpenBSD's Puffy mascot — indirectly named after Bruce Schneier's Blowfish cipher. Damien Miller's release notes are a small literary form, signed `-djm`: terse, dry, technically meticulous, often quietly funny. Compare the 9.6, 9.8, and 10.0 announcements.

**The `moduli` file.** `/etc/ssh/moduli` contains primes for diffie-hellman-group-exchange. They are generated by `ssh-keygen -M generate` (sieving) and `ssh-keygen -M screen` (Miller-Rabin), a process that takes hours on a workstation. OpenSSH 10.0 disables finite-field DH on the server side by default, which makes `moduli` largely a historical artifact on new installs.

## Where this connects in the book

- *Foundations — What Is a Protocol?*: SSH is the canonical example of "protocols are written agreements that cost nothing to break and everything to fix" — the chapter uses it to motivate why we have specs in the first place.
- *Foundations — The Layer Model*: SSH lives at L7 over TCP, and the chapter uses it to show the seam where transport reliability ends and application semantics begin.
- *Foundations — Addressing & Identity*: how a packet finds your laptop — and how SSH's host-key model adds cryptographic identity on top of IP-level addressing.
- *Foundations — Ports & Sockets*: the port-22 origin story — Tatu Ylönen's email to IANA — is a recurring thread; this is where it lives.
- *Foundations — Client-Server vs Peer-to-Peer*: SSH as the textbook client-server protocol with multiplexed channels.
- *Transport — TCP*: SSH's reliability guarantees come straight from TCP; this chapter is also where the head-of-line-blocking discussion lands and where you'll find the connection between TCP's reliability cost and SSH's 5-to-7-RTT setup.
- *Utilities & Security — SSH*: the history chapter — Ylönen in Helsinki, the 1999 OpenBSD fork, the 2024 year of CVEs, post-quantum SSH shipping before TLS, the IETF sshm WG. This is the historical and cultural narrative; the protocol blueprint stays focused on mechanism and production.
- *How Networks Actually Behave — Recurring Patterns*: SSH is one of the four protocols (with TLS, MQTT, SCTP) the chapter uses to introduce the universal handshake pattern, and the chapter on keepalives uses SSH's 30-second pings as the canonical example.
- *Famous Outages — Mitnick vs Shimomura, 1994*: the TCP sequence-prediction attack on Christmas Day 1994 is the chapter that explains *why* SSH was written — Tatu Ylönen wrote SSH in 1995 partly in response to incidents like this one. The chapter walks through how `.rhosts` trusted source IP addresses and how SSH replaced that model with cryptographic identity within five years.

## See also (other protocol episodes)

**The TLS episode.** Both protocols achieve confidentiality, integrity, and authentication; both are now AEAD-only by best practice. The contrast is everything. TLS uses an X.509 PKI rooted in Certificate Authorities; SSH uses Trust On First Use plus optional CA certificates in a non-X.509 format. TLS is a transparent wrapper around any protocol, with no built-in user-authentication phase; SSH bundles transport security, server identity, and user authentication in one tool. The TLS episode is the right one to listen to next if you want to see why two protocols solving similar problems made nearly opposite design choices.

**The TCP episode.** SSH's encrypted stream cannot tolerate missing or reordered bytes, which is the entire reason SSH lives on TCP and not UDP. The TCP episode is where the head-of-line blocking story lives — the same reason QUIC exists, and the same reason the SSH3 prototype is interesting. Listen to TCP first if you want to understand why SSH connection setup costs 5 to 7 round-trips.

**The FTP episode.** SSH replaced cleartext FTP, but the more interesting bit is that "SFTP" is not FTP over SSH — it is a wholly different binary protocol that runs as a subsystem inside an SSH `session` channel. The FTP episode covers the original active and passive modes; the contrast with SFTP is the whole story of why everyone moved.

**The Kerberos episode.** GSS-API key exchange — `gssapi-with-mic` per RFC 4462, modernised by RFC 8732 — is how enterprise Active Directory environments do single sign-on for SSH. The Kerberos episode explains why an institution that has Kerberos already gets SSH integration for almost free.

## Visual cues for image generation

- A clean side-by-side: a Telnet packet on the left with the password `hunter2` visible in clear ASCII; an SSH packet on the right with the same password buried inside an opaque ChaCha20-Poly1305 ciphertext block.
- The four-phase SSH handshake as a swimlane diagram: TCP setup, plain banner exchange, KEXINIT plus key exchange producing K and H, then `NEWKEYS` switching the cipher, then user-auth, then channel open. Mark the plaintext-vs-ciphertext boundary with a strong colour change.
- The hybrid `mlkem768x25519-sha256` KEX visualised as two parallel envelopes — one labelled X25519 (classical), one labelled ML-KEM-768 (post-quantum) — both feeding into a single SHA-256 that produces the shared secret K.
- The regreSSHion call chain: a timer fires `SIGALRM` inside `malloc`, the handler calls `syslog`, `syslog` calls `malloc` again, the heap is corrupted, control flow ends in a root shell. Annotate with the 18-year regression: 2006 fix, 2020 refactor accidentally drops the `#ifdef`, 2024 disclosure.
- The XZ Utils backdoor as a layered stack: `liblzma` (compressed) compromised by Jia Tan, linked from `libsystemd`, linked from a distro-patched `sshd`. Inside an RSA modulus N, an Ed448 signature acts as a key that unlocks `system()` execution before authentication completes.
- An OpenSSH version timeline from 9.6 (December 2023, strict KEX) through 10.3 (April 2026, security fixes), with Terrapin, regreSSHion, ML-KEM default, sshd-auth split, and the post-quantum warning each marked at the right release.

## Sources

**RFCs**
- [RFC 4250 — SSH Protocol Assigned Numbers](https://datatracker.ietf.org/doc/html/rfc4250)
- [RFC 4251 — SSH Protocol Architecture](https://datatracker.ietf.org/doc/html/rfc4251)
- [RFC 4252 — SSH Authentication Protocol](https://datatracker.ietf.org/doc/html/rfc4252)
- [RFC 4253 — SSH Transport Layer Protocol](https://datatracker.ietf.org/doc/html/rfc4253)
- [RFC 4254 — SSH Connection Protocol](https://datatracker.ietf.org/doc/html/rfc4254)
- [RFC 4255 — Using DNS to Securely Publish SSH Key Fingerprints](https://datatracker.ietf.org/doc/html/rfc4255)
- [RFC 8709 — Ed25519 and Ed448 Public Key Algorithms for SSH](https://datatracker.ietf.org/doc/html/rfc8709)
- [RFC 9142 — Key Exchange Method Updates and Recommendations for SSH](https://datatracker.ietf.org/doc/html/rfc9142)
- [draft-ietf-sshm-ntruprime-ssh — sntrup761x25519-sha512](https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/)
- [IETF sshm WG charter](https://datatracker.ietf.org/doc/charter-ietf-sshm/)

**Papers**
- [Bäumer, Brinkmann, Schwenk — Terrapin Attack (USENIX Security 2024)](https://arxiv.org/pdf/2312.12422)
- [Heninger, Durumeric, Wustrow, Halderman — Mining Your Ps and Qs (USENIX Security 2012)](https://factorable.net/weakkeys12.extended.pdf)
- [Michel & Bonaventure — Towards SSH3 (UCLouvain, 2023)](https://arxiv.org/abs/2312.08396)
- [Winstein & Balakrishnan — Mosh (USENIX ATC 2012)](https://www.usenix.org/conference/atc12/technical-sessions/presentation/winstein)
- [Loss, Limmer, von Gernler — The Drunken Bishop](https://www.dirk-loss.de/sshvis/drunken_bishop.pdf)
- [Erik Poll — Rigorous specifications of the SSH Transport Layer](https://www.cs.ru.nl/~erikpoll/papers/ssh.pdf)

**Vendor and engineering blogs**
- [OpenSSH release notes](https://www.openssh.org/releasenotes.html)
- [OpenSSH post-quantum cryptography page](https://www.openssh.com/pq.html)
- [OpenSSH project history](https://www.openssh.org/history.html)
- [Qualys — regreSSHion (CVE-2024-6387)](https://blog.qualys.com/vulnerabilities-threat-research/2024/07/01/regresshion-remote-unauthenticated-code-execution-vulnerability-in-openssh-server)
- [Terrapin attack site](https://terrapin-attack.com/)
- [Sam James — XZ Utils backdoor situation gist](https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27)
- [JFrog — XZ backdoor analysis](https://jfrog.com/blog/xz-backdoor-attack-cve-2024-3094-all-you-need-to-know/)
- [Akamai — XZ Utils backdoor analysis](https://www.akamai.com/blog/security-research/critical-linux-backdoor-xz-utils-discovered-what-to-know)
- [Datadog — XZ backdoor writeup](https://securitylabs.datadoghq.com/articles/xz-backdoor-cve-2024-3094/)
- [Mozilla Infosec — OpenSSH guidelines](https://infosec.mozilla.org/guidelines/openssh)
- [Cloudflare — Fearless SSH: Access for Infrastructure](https://blog.cloudflare.com/intro-access-for-infrastructure-ssh/)
- [Tailscale SSH GA](https://tailscale.com/blog/tailscale-ssh-ga)
- [smallstep — If you're not using SSH certificates you're doing SSH wrong](https://smallstep.com/blog/use-ssh-certificates/)
- [Yubico — Securing SSH with FIDO2](https://developers.yubico.com/SSH/Securing_SSH_with_FIDO2.html)
- [Red Hat — Post-quantum cryptography in RHEL 10](https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10)
- [Red Hat — RHEL 9 SCP deprecation](https://www.redhat.com/en/blog/openssh-scp-deprecation-rhel-9-what-you-need-know)
- [Doyensec — Modern retrospective on the 1998 SSH-1 CRC32 issue](https://blog.doyensec.com/2025/02/27/exploitable-sshd.html)
- [ssh-audit by Joe Testa](https://github.com/jtesta/ssh-audit)
- [Ash Vardanian — AES-GCM vs ChaCha20-Poly1305 in 2025](https://ashvardanian.com/posts/chacha-vs-aes-2025/)

**News**
- [Phoronix — OpenSSH 10.0 Released](https://www.phoronix.com/news/OpenSSH-10.0-Released)
- [SolCyber — OpenSSH 10.1 PQ warning](https://solcyber.com/openssh-now-warns-about-non-post-quantum-connections/)
- [BleepingComputer — GitHub rotates exposed RSA SSH host key (March 2023)](https://www.bleepingcomputer.com/news/security/githubcom-rotates-its-exposed-private-ssh-key/)
- [GitHub Blog — RSA SSH host key rotation announcement](https://github.blog/news-insights/company-news/we-updated-our-rsa-ssh-host-key/)
- [Linux.com — Tatu Ylönen on the port-22 assignment](https://www.linux.com/news/story-getting-ssh-port-22/)
- [APNIC — How SSH got to be on port 22](https://blog.apnic.net/2024/05/03/how-ssh-got-to-be-on-port-22/)

**Wikipedia**
- [Secure Shell](https://en.wikipedia.org/wiki/Secure_Shell)
- [OpenSSH](https://en.wikipedia.org/wiki/OpenSSH)
- [XZ Utils backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor)
- [ChaCha20-Poly1305](https://en.wikipedia.org/wiki/ChaCha20-Poly1305)
