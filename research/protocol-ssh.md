---
prompt_source: deep-research-prompts.txt:7552-7729 (PROTOCOL · SSH)
run_date: 2026-05-05
claude_chat: https://claude.ai/chat/a7bb9434-0565-427a-8832-ad11a0aef0e3
research_mode: claude.ai Research
---

# SSH (Secure Shell): A Comprehensive Source Report for Engineers

*Compiled May 5, 2026. Sources prioritise primary documents (RFCs, OpenSSH release notes, original disclosures, peer-reviewed papers) from 2024–2026 where possible, with older material flagged. Marked as `[needs source]` are claims I could not pin to a verifiable URL within the research window.*

---

## 1. Prerequisites and glossary

These definitions assume zero prior SSH knowledge. Each term has a one-line gloss and an authoritative explainer.

**Networking layers and primitives**

- **OSI / TCP-IP layers** — SSH is an application-layer protocol that runs on top of a reliable transport (almost always TCP). RFC 4251 explicitly says it can run on any "8-bit clean, binary-transparent transport." See `https://datatracker.ietf.org/doc/html/rfc4251`. [Hjp](https://www.hjp.at/doc/rfc/rfc4253.html)
- **TCP (Transmission Control Protocol)** — Connection-oriented, reliable, ordered byte-stream transport. SSH defaults to TCP port 22. (RFC 9293.)
- **UDP / datagram** — Connectionless message protocol. Mosh (an SSH "front end") uses UDP after authenticating via SSH. See `https://mosh.org/`.
- **Socket** — OS abstraction for one endpoint of a network connection (IP + port + protocol).
- **Header / frame / segment / datagram** — A *header* is the metadata prefix of a network unit. A *TCP segment* is the unit of TCP, a *frame* the unit of layer 2 (Ethernet), a *datagram* the unit of UDP/IP.
- **Port** — 16-bit identifier inside a host that selects a service. SSH = 22 (assigned by IANA in July 1995).
- **Stream** — Ordered, reliable byte sequence. SSH presents application data as multiplexed bidirectional streams ("channels").
- **Checksum** — Integrity field over a packet (e.g. CRC-32 in Ethernet/SSHv1, HMAC in SSHv2).
- **Handshake** — A multi-message exchange that establishes shared state (keys, parameters) before bulk traffic.

**Cryptographic primitives**

- **Symmetric encryption** — Same key encrypts and decrypts (AES, ChaCha20).
- **AEAD (Authenticated Encryption with Associated Data)** — One primitive provides confidentiality + integrity. SSH uses ChaCha20-Poly1305 and AES-GCM as AEADs. (`https://en.wikipedia.org/wiki/ChaCha20-Poly1305`)
- **MAC (Message Authentication Code)** — Keyed integrity tag (HMAC-SHA-256, etc.). RFC 4253 §6.4 defines SSH MAC slot.
- **KDF (Key Derivation Function)** — Expands a shared secret into multiple keys. SSH derives six keys from the kex shared secret K and exchange hash H per RFC 4253 §7.2 (`https://datatracker.ietf.org/doc/html/rfc4253`).
- **Asymmetric / public-key crypto** — Key pairs where one signs/encrypts, the other verifies/decrypts.
- **Diffie-Hellman (DH)** / **ECDH** — Two parties derive a shared secret over a public channel. SSH uses both (modp DH groups, x25519, NIST curves).
- **RSA / DSA / ECDSA / Ed25519 / Ed448** — Signature algorithms. RFC 8709 (Feb 2020) standardised Ed25519/Ed448 in SSH (`https://datatracker.ietf.org/doc/html/rfc8709`). DSA was removed in OpenSSH 10.0 (April 2025) (`https://www.openssh.org/releasenotes.html`). [IETF](https://datatracker.ietf.org/doc/html/rfc8709)
- **ML-KEM / Kyber** — NIST-standardised lattice-based post-quantum key encapsulation (FIPS 203). Used in SSH's `mlkem768x25519-sha256` hybrid (`https://www.openssh.com/pq.html`). [Red Hat](https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10)
- **sntrup761 (Streamlined NTRU Prime)** — Alternative PQ KEM used in `sntrup761x25519-sha512` (draft-ietf-sshm-ntruprime-ssh, `https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/`). [IETF](https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/)
- **Hybrid KEX** — Combines a PQ KEM with classical ECDH so the result is at least as strong as either; the default in OpenSSH 10.0+ (`https://www.openssh.com/pq.html`).
- **Forward secrecy** — Compromise of long-term keys does not decrypt prior sessions. SSH provides this via ephemeral DH/ECDH.

**SSH-specific vocabulary**

- **Host key** — Server's long-term key pair. Identifies the *server* to clients. (RFC 4251 §4.1)
- **Fingerprint** — Short hash of a public key, displayed for human verification. OpenSSH defaults to base64 SHA-256.
- **`known_hosts`** — Client file mapping host → trusted host key. Drives "Trust On First Use."
- **`authorized_keys`** — Server file listing user public keys allowed to log in.
- **TOFU (Trust On First Use)** — Accept the host key on first connection, warn on change. SSH's default trust model.
- **Channel** — Logical bidirectional stream multiplexed inside a single SSH connection (RFC 4254). Types include `session`, `direct-tcpip`, `forwarded-tcpip`, `x11`.
- **Multiplexing** — Many channels over one TCP connection; OpenSSH adds *connection* multiplexing via `ControlMaster`.
- **Port forwarding** — Tunnel TCP through SSH (`-L`, `-R`, `-D`).
- **Agent / agent forwarding** — `ssh-agent` holds decrypted keys in memory; `-A` forwards access to remote hops (risky).
- **PEM vs OpenSSH key formats** — PEM is the legacy PKCS#1/8 base64 format; the OpenSSH format (default since OpenSSH 7.8) is described in `PROTOCOL.key` and uses bcrypt-pbkdf for passphrase protection.
- **PTY / terminal** — Pseudo-terminal pair giving interactive shell semantics. SSH allocates one via the `pty-req` channel request.
- **SFTP** — File-transfer subsystem riding inside an SSH `session` channel (`draft-ietf-secsh-filexfer-13`, never published as RFC).
- **SCP** — Older BSD utility; OpenSSH 9.0 (April 2022) switched `scp` to use SFTP under the hood (`https://www.openssh.org/txt/release-9.0`). [Linux Adictos](https://en.linuxadictos.com/openssh-9-0-arrives-with-sftp-instead-of-scp-improvements-and-more.html)

---

## 2. History and story

**1995, Helsinki.** Tatu Ylönen, a researcher at Helsinki University of Technology, wrote SSH after a password-sniffing attack on the university network. His goal was to replace `telnet`, `rlogin`, `rsh`, and `ftp` with a single encrypted protocol (`https://en.wikipedia.org/wiki/Secure_Shell`). He released SSH-1 as freeware in July 1995; by year-end it had ~20,000 users in 50 countries.

**Port 22.** Ylönen's own retelling: he chose 22 because it sat between telnet/23 and ftp/21. On 10 July 1995 he emailed IANA's Joyce K. Reynolds; she replied the next day assigning port 22 with him as point of contact (`https://www.linux.com/news/story-getting-ssh-port-22/`, `https://www.nextofwindows.com/the-story-of-how-ssh-got-the-port-number-22`).

**SSH Communications Security & SSH-2.** Ylönen founded SSH Communications Security in 1995. SSH-2, a complete protocol redesign with separate transport/auth/connection layers, was drafted from 1996 onward. Later versions of his SSH became proprietary, prompting the free-software community to fork. [GIAC](https://www.giac.org/paper/gsec/1460/secure-shell-daemon-crc32-compensations-attack-detector-vulnerability/102715)

**OpenSSH (1999).** The OpenBSD team forked OSSH (a clean re-derivation by Björn Grönvall of Ylönen's last freely licensed `ssh-1.2.12`) on 26 September 1999. Core contributors: Theo de Raadt, Markus Friedl, Niels Provos, Bob Beck, Aaron Campbell, Dug Song, and (for portability) Damien Miller and Darren Tucker (`https://www.openssh.org/history.html`). OpenSSH 1.2.2 shipped with OpenBSD 2.6 in December 1999. SSH-2 support arrived with OpenSSH 2.0 in June 2000. [Wikibooks + 3](https://en.wikibooks.org/wiki/OpenSSH/Overview)

**The 2001 CRC32 incident.** In 1998 Ariel Futoransky and Emiliano Kargieman (Core-SDI) showed that SSH-1's CRC-32 packet integrity could be defeated by an "insertion attack." A patch (`deattack.c`) was added; in February 2001 Michał Zalewski showed the *patch itself* was exploitable for unauthenticated RCE — CVE-2001-0144, used widely in the wild against OpenSSH ≤ 2.1.1 and SSH.com 1.2.31 (`https://www.coresecurity.com/core-labs/advisories/ssh1-crc-32-compensation-attack-detector-vulnerability`, `https://static.lwn.net/2001/1115/a/ssh-exploit.php3`). This event accelerated migration to SSH-2. [Doyensec](https://blog.doyensec.com/2025/02/27/exploitable-sshd.html)[Lwn](https://static.lwn.net/2001/1115/a/ssh-exploit.php3)

**IETF SECSH and the 2006 RFCs.** The IETF SECSH WG produced the core SSH-2 standards in January 2006 — RFC 4250 (assigned numbers), RFC 4251 (architecture), RFC 4252 (auth), RFC 4253 (transport), RFC 4254 (connection) — edited by Tatu Ylönen and Chris Lonvick (Cisco) (`https://www.rfc-editor.org/rfc/rfc4251`, `https://www.rfc-editor.org/rfc/rfc4253`). [Studocu](https://www.studocu.vn/vn/document/hutech-university-of-technology/hutech/rfc-4251-ssh-protocol-architecture-overview-and-standards-track/142535122)

**Major follow-on RFCs (verified status at rfc-editor.org):**

- RFC 4255 SSHFP DNS records, RFC 4256 keyboard-interactive, RFC 4335 session-channel break, RFC 4344 transport encryption modes, RFC 4345 improved Arcfour, RFC 4419 DH group exchange, RFC 4432 RSA key exchange, RFC 4462 GSS-API, RFC 4716 public-key file format. [GlobalSpec](https://standards.globalspec.com/std/1521680/IETF%20RFC%204251)
- RFC 5647 AES-GCM, RFC 5656 ECC, RFC 6187 X.509, RFC 6239 Suite B, RFC 6242 NETCONF over SSH, RFC 6594 SHA-256 in SSHFP, RFC 6668 SHA-256 HMAC. [GlobalSpec](https://standards.globalspec.com/std/1521680/IETF%20RFC%204251)
- RFC 8268 more MODP groups, RFC 8308 extension negotiation, RFC 8332 RSA-SHA-2, RFC 8709 Ed25519/Ed448 (Feb 2020, `https://datatracker.ietf.org/doc/html/rfc8709`), RFC 8731 Curve25519 KEX, RFC 8732 GSS-API updates, RFC 8758 deprecate arcfour. [IETF](https://datatracker.ietf.org/doc/html/rfc8709)
- **RFC 9142** (January 2022) — Key Exchange method updates and recommendations; Updates 4250/4253/4432/4462 (`https://datatracker.ietf.org/doc/html/rfc9142`). Currently the authoritative recommended-algorithms document. [GlobalSpec](https://standards.globalspec.com/std/14493553/rfc-9142)[IETF](https://datatracker.ietf.org/doc/html/rfc9142)

**The IETF "sshm" Working Group (2024–).** The Secure Shell Maintenance WG was chartered August 2024 with chairs Job Snijders (Fastly) and Stephen Farrell (Trinity College Dublin), under Security AD Deb Cooley (`https://datatracker.ietf.org/group/sshm/about/`). Active drafts:

- `draft-ietf-sshm-ntruprime-ssh` (sntrup761x25519-sha512) — adopted, latest revision -06 (Sept 2025), authors Markus Friedl, Jan Mojzis, Simon Josefsson; expires April 2026 (`https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/`). Note: re-targeted Standards Track→Informational, then back; verify before publication. [IETF](https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/)
- `draft-ietf-sshm-mlkem-hybrid-kex` (Kampanakis, Stebila, Hansen) for `mlkem768x25519-sha256` (`https://datatracker.ietf.org/submit/status/148662/`). [IETF Datatracker](https://datatracker.ietf.org/submit/status/148662/)
- `draft-miller-sshm-strict-kex` — codifies OpenSSH's strict-KEX Terrapin mitigation; WG adoption call closed April 2025.

**Last 24 months — what changed:**

- **OpenSSH 9.6** (18 Dec 2023): Implemented "strict KEX" to mitigate Terrapin (`https://www.openssh.org/releasenotes.html`).
- **OpenSSH 9.7** (Mar 2024): DSA made compile-time optional.
- **OpenSSH 9.8** (Jul 2024): Patched **CVE-2024-6387 (regreSSHion)**; introduced split `sshd-session` binary (`https://www.openssh.org/releasenotes.html`).
- **OpenSSH 9.9** (19 Sept 2024): Added `mlkem768x25519-sha256` hybrid KEX.
- **OpenSSH 9.9p2** (18 Feb 2025): Patched CVE-2025-26465 (VerifyHostKeyDNS MITM logic error).
- **OpenSSH 10.0** (9 April 2025): **Removed DSA entirely**; made `mlkem768x25519-sha256` the default; split user-auth into `sshd-auth`; disabled finite-field DH on the server side by default (`https://www.openssh.org/releasenotes.html`, `https://www.phoronix.com/news/OpenSSH-10.0-Released`). [Openssh](https://www.openssh.org/releasenotes.html)[Openssh](https://www.openssh.org/releasenotes.html)
- **OpenSSH 10.1** (October 2025): Warns when a non-PQ KEX is selected (`https://www.openssh.com/pq.html`, `https://solcyber.com/openssh-now-warns-about-non-post-quantum-connections/`).
- **OpenSSH 10.2** (10 Oct 2025) and **10.3** (2 April 2026): bug- and security-fix releases. Multiple late-2025/early-2026 CVEs (CVE-2025-61984, CVE-2025-61985, CVE-2026-3497, CVE-2026-35385–35414) were patched in 10.2/10.3 (`https://tracker.debian.org/pkg/openssh`).
- **SHA-1 signatures** for `ssh-rsa` were disabled by default in OpenSSH 8.8 (2021) and remain off; SHA-1 in DH KEX is "to be retired as soon as possible" per RFC 9142 §1.1. [IETF](https://www.ietf.org/rfc/rfc9142.pdf)[RFC Editor](https://www.rfc-editor.org/rfc/rfc9142.pdf)
- **DSA** support is gone from OpenSSH as of 10.0; use Ed25519 or RSA ≥ 3072 bits.

**Design alternatives that lost.** Telnet+Kerberos was deployed at MIT/large institutions but never reached the ergonomic accessibility of SSH (no client-side trust UX, painful Kerberos realm setup). SSL/TLS-based remote shell wrappers (e.g. `stunnel`+telnet) failed because they lacked an integrated user-auth model — SSH bundled transport security, server identity, and user authentication in one tool.

**Funding.** Tatu's original work was university-funded; SSH Communications Security commercialised the protocol. OpenSSH is funded by donations to the OpenBSD Foundation (`https://www.openssh.com/donations.html`), with periodic corporate funding (Google, Facebook/Meta, others) and Damien Miller's long-term work historically supported by his employer.

---

## 3. How it actually works

This section is at re-implementation depth.

### 3.1 Connection setup

1. Client opens a TCP connection to the server's port 22 (RFC 4253 §4.1).
2. **Version exchange (banner).** Each side sends `SSH-protoversion-softwareversion[ comments]\r\n` in printable US-ASCII, max 255 bytes. Example: `SSH-2.0-OpenSSH_10.0\r\n` (RFC 4253 §4.2; `https://datatracker.ietf.org/doc/html/rfc4253`). The portion before CRLF is mixed into the exchange hash later.

### 3.2 Binary Packet Protocol (BPP) — RFC 4253 §6

Every packet after banner:

```
uint32   packet_length      (length of packet not including 'mac' or this field)
byte     padding_length     (4..255)
byte[n1] payload             n1 = packet_length - padding_length - 1
byte[n2] random padding      n2 = padding_length, ≥4 bytes
byte[m]  mac                 m depends on negotiated MAC; sent in clear (or AEAD tag)
```

Constraints: total `(packet_length + 4) % cipher_block_size == 0`, packet_length ≤ 35000, minimum packet ≥ 16 bytes (or block size). Each direction has an independent monotonically increasing 32-bit sequence number that feeds the MAC.

For AEAD modes (`chacha20-poly1305@openssh.com`, `aes*-gcm`), the length field handling differs (length is encrypted with a separate key for chacha20-poly1305; encrypted but not MAC'd separately for AES-GCM, which is precisely why **Terrapin** worked — see §6).

### 3.3 KEXINIT and algorithm negotiation

Each side sends `SSH_MSG_KEXINIT` (msg-id 20):

```
byte      SSH_MSG_KEXINIT (20)
byte[16]  cookie (random)
name-list kex_algorithms                 e.g. mlkem768x25519-sha256,sntrup761x25519-sha512,curve25519-sha256
name-list server_host_key_algorithms     e.g. ssh-ed25519,rsa-sha2-512,rsa-sha2-256
name-list encryption_algs_c2s
name-list encryption_algs_s2c
name-list mac_algs_c2s
name-list mac_algs_s2c
name-list compression_algs_c2s
name-list compression_algs_s2c
name-list languages_c2s
name-list languages_s2c
boolean   first_kex_packet_follows
uint32    reserved (0)
```

Negotiation rule (RFC 4253 §7.1): for each category, server's preference does not matter — the *client*'s first-listed algorithm that the server also supports wins, except for KEX and host-key where there is a guess/agreement procedure.

**Strict KEX (post-Terrapin).** If both sides advertise `kex-strict-c-v00@openssh.com` / `kex-strict-s-v00@openssh.com` pseudo-algorithms in their first KEXINIT, sequence numbers are reset on `NEWKEYS` and any unexpected message during KEX terminates the connection (`https://terrapin-attack.com/`, OpenSSH 9.6 release notes). [nsoftware](https://www.nsoftware.com/kb/articles/terrapin)

### 3.4 Key exchange (mlkem768x25519-sha256, the new default)

For ML-KEM hybrid (draft-ietf-sshm-mlkem-hybrid-kex):

1. Client generates an ML-KEM-768 keypair `(pk_pq, sk_pq)` and an X25519 ephemeral `(pk_c, sk_c)`. Sends `SSH_MSG_KEX_ECDH_INIT` containing concatenation `pk_pq || pk_c`.
2. Server generates X25519 ephemeral `(pk_s, sk_s)`, encapsulates against `pk_pq` getting `(ct, ss_pq)`, computes ECDH `ss_ec = X25519(sk_s, pk_c)`. Sends `SSH_MSG_KEX_ECDH_REPLY` with: server host public key `K_S`, `ct || pk_s`, signature over the *exchange hash* `H`.
3. Client decapsulates `ss_pq = ML-KEM.Decap(sk_pq, ct)`, computes `ss_ec = X25519(sk_c, pk_s)`.
4. Shared secret: `K = SHA-256(ss_pq || ss_ec)`. Exchange hash:
`H = SHA-256(V_C || V_S || I_C || I_S || K_S || pk_pq||pk_c || ct||pk_s || K)`
where `V_C/V_S` are banner strings, `I_C/I_S` are KEXINIT payloads.
5. Server signs `H` with its host private key. Client verifies against `K_S` and the user's `known_hosts` entry.

Other KEX flows (curve25519-sha256, ECDH P-256/384/521, modp DH group14/16/18) are structurally similar with different encapsulation specifics (RFC 5656, RFC 8731, RFC 9142).

### 3.5 NEWKEYS and the six derived keys

Both sides send `SSH_MSG_NEWKEYS` (21). Then, per RFC 4253 §7.2, six values are derived from `K, H, session_id` (where `session_id = H` of the *first* KEX) using the negotiated hash: [IETF](https://www.ietf.org/rfc/rfc9142.pdf)

```
IV  c→s  = HASH(K || H || "A" || session_id)
IV  s→c  = HASH(K || H || "B" || session_id)
Enc c→s  = HASH(K || H || "C" || session_id)
Enc s→c  = HASH(K || H || "D" || session_id)
MAC c→s  = HASH(K || H || "E" || session_id)
MAC s→c  = HASH(K || H || "F" || session_id)
```

Each is extended by additional hash invocations (`HASH(K||H||K1||K2||...)`) until long enough. Note that for AEAD ciphers there is no separate MAC key — the encryption key acts as both.

### 3.6 Host-key verification

Client compares `K_S` against `~/.ssh/known_hosts`. Three outcomes: known and matches (silent), unknown (TOFU prompt — *"The authenticity of host '...' can't be established… Are you sure you want to continue connecting (yes/no)?"*), or known and mismatched (loud refusal). Optional verification mechanisms: SSHFP DNS records (RFC 4255, RFC 6594, RFC 7479); SSH certificates signed by a trusted CA (`@cert-authority` line); `UpdateHostKeys` extension.

### 3.7 User authentication — RFC 4252

Client sends `SSH_MSG_SERVICE_REQUEST` for `ssh-userauth`. Then a series of `SSH_MSG_USERAUTH_REQUEST` messages, each carrying a method: [RFC Editor](https://www.rfc-editor.org/rfc/rfc4253)

- `none` (always rejected, used to discover allowed methods)
- `password`
- `publickey` — client signs the session_id + auth payload with its private key
- `keyboard-interactive` (RFC 4256) — server-driven challenge/response, used for OTPs/PAM
- `hostbased`
- `gssapi-with-mic` (RFC 4462) — Kerberos/GSS-API
- Certificate-based auth uses `publickey` with cert-typed key (`ssh-ed25519-cert-v01@openssh.com` etc.; OpenSSH-defined, not standardised until sshm WG completes documentation).

Server replies with `USERAUTH_FAILURE` (with a list of methods that can continue and a "partial success" boolean — drives multi-factor) or `USERAUTH_SUCCESS`.

### 3.8 Connection protocol — RFC 4254

After auth, client sends `SERVICE_REQUEST` for `ssh-connection`, then opens channels.

- `SSH_MSG_CHANNEL_OPEN` (90) carries: `string channel_type`, `uint32 sender_channel`, `uint32 initial_window_size`, `uint32 maximum_packet_size`. [IETF](https://datatracker.ietf.org/doc/html/rfc4254)
- Channel types: `session` (interactive shell/exec), `direct-tcpip` (local→remote forward), `forwarded-tcpip` (remote→local), `x11`.
- Server replies `SSH_MSG_CHANNEL_OPEN_CONFIRMATION` (91) or `_FAILURE` (92).
- **Per-channel flow control**: window starts at the advertised size; each side decrements its remote window by data sent and refills via `SSH_MSG_CHANNEL_WINDOW_ADJUST` (93). Implementations must support windows up to 2³²−1. [IETF](https://www.ietf.org/rfc/rfc4254.txt)
- Data: `SSH_MSG_CHANNEL_DATA` (94) and `_EXTENDED_DATA` (95, e.g. stderr). [Studocu](https://www.studocu.vn/vn/document/hutech-university-of-technology/hutech/rfc-4251-ssh-protocol-architecture-overview-and-standards-track/142535122)[IETF](https://www.ietf.org/rfc/rfc4254.txt)
- Channel requests (98): `pty-req`, `env`, `shell`, `exec`, `subsystem` (used by `sftp`), `window-change`, `signal`, `exit-status`, `exit-signal`.
- Multiplexing: a single SSH connection carries many channels concurrently; OpenSSH adds *connection multiplexing* via `ControlMaster`/`ControlPath`/`ControlPersist`, where subsequent `ssh` invocations to the same host reuse one TCP+SSH connection through a Unix socket. [DeepWiki](https://deepwiki.com/openssh/openssh-portable/6.1-channel-system)

### 3.9 Sequence diagram (mermaid-compatible)

ServerClientServerClient#mermaid-rf5{font-family:inherit;font-size:16px;fill:#E5E5E5;}@keyframes edge-animation-frame{from{stroke-dashoffset:0;}}@keyframes dash{to{stroke-dashoffset:0;}}#mermaid-rf5 .edge-animation-slow{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 50s linear infinite;stroke-linecap:round;}#mermaid-rf5 .edge-animation-fast{stroke-dasharray:9,5!important;stroke-dashoffset:900;animation:dash 20s linear infinite;stroke-linecap:round;}#mermaid-rf5 .error-icon{fill:#CC785C;}#mermaid-rf5 .error-text{fill:#3387a3;stroke:#3387a3;}#mermaid-rf5 .edge-thickness-normal{stroke-width:1px;}#mermaid-rf5 .edge-thickness-thick{stroke-width:3.5px;}#mermaid-rf5 .edge-pattern-solid{stroke-dasharray:0;}#mermaid-rf5 .edge-thickness-invisible{stroke-width:0;fill:none;}#mermaid-rf5 .edge-pattern-dashed{stroke-dasharray:3;}#mermaid-rf5 .edge-pattern-dotted{stroke-dasharray:2;}#mermaid-rf5 .marker{fill:#A1A1A1;stroke:#A1A1A1;}#mermaid-rf5 .marker.cross{stroke:#A1A1A1;}#mermaid-rf5 svg{font-family:inherit;font-size:16px;}#mermaid-rf5 p{margin:0;}#mermaid-rf5 .actor{stroke:#A1A1A1;fill:transparent;}#mermaid-rf5 text.actor>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf5 .actor-line{stroke:#A1A1A1;}#mermaid-rf5 .messageLine0{stroke-width:1.5;stroke-dasharray:none;stroke:#E5E5E5;}#mermaid-rf5 .messageLine1{stroke-width:1.5;stroke-dasharray:2,2;stroke:#E5E5E5;}#mermaid-rf5 #arrowhead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rf5 .sequenceNumber{fill:#5e5e5e;}#mermaid-rf5 #sequencenumber{fill:#E5E5E5;}#mermaid-rf5 #crosshead path{fill:#E5E5E5;stroke:#E5E5E5;}#mermaid-rf5 .messageText{fill:#E5E5E5;stroke:none;}#mermaid-rf5 .labelBox{stroke:#A1A1A1;fill:transparent;}#mermaid-rf5 .labelText,#mermaid-rf5 .labelText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf5 .loopText,#mermaid-rf5 .loopText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf5 .loopLine{stroke-width:2px;stroke-dasharray:2,2;stroke:#A1A1A1;fill:#A1A1A1;}#mermaid-rf5 .note{stroke:#A1A1A1;fill:#2D2D2D;}#mermaid-rf5 .noteText,#mermaid-rf5 .noteText>tspan{fill:#E5E5E5;stroke:none;}#mermaid-rf5 .activation0{fill:transparent;stroke:#00000000;}#mermaid-rf5 .activation1{fill:transparent;stroke:#00000000;}#mermaid-rf5 .activation2{fill:transparent;stroke:#00000000;}#mermaid-rf5 .actorPopupMenu{position:absolute;}#mermaid-rf5 .actorPopupMenuPanel{position:absolute;fill:transparent;box-shadow:0px 8px 16px 0px rgba(0,0,0,0.2);filter:drop-shadow(3px 5px 2px rgb(0 0 0 / 0.4));}#mermaid-rf5 .actor-man line{stroke:#A1A1A1;fill:transparent;}#mermaid-rf5 .actor-man circle,#mermaid-rf5 line{stroke:#A1A1A1;fill:transparent;stroke-width:2px;}#mermaid-rf5 :root{--mermaid-font-family:inherit;}Each derives K, H, six session keysAll subsequent traffic encrypted+MACdTCP SYN (port 22)TCP SYN-ACKTCP ACKSSH-2.0-OpenSSH_10.0\r\nSSH-2.0-OpenSSH_10.0\r\nSSH_MSG_KEXINIT (algo lists, kex-strict-c)SSH_MSG_KEXINIT (algo lists, kex-strict-s)SSH_MSG_KEX_ECDH_INIT (pk_pq || pk_c)SSH_MSG_KEX_ECDH_REPLY (K_S, ct||pk_s, sig(H))SSH_MSG_NEWKEYSSSH_MSG_NEWKEYSSERVICE_REQUEST "ssh-userauth"SERVICE_ACCEPTUSERAUTH_REQUEST publickey (sig over session_id)USERAUTH_SUCCESSSERVICE_REQUEST "ssh-connection"CHANNEL_OPEN sessionCHANNEL_OPEN_CONFIRMATIONCHANNEL_REQUEST pty-req, shellCHANNEL_DATA (PS1)

---

## 4. Deep connections to other protocols

- **TCP.** SSH's transport is TCP. RFC 4253 §4.1 mandates "an underlying transport protocol that protects against transmission errors." SCTP variants exist but are vanishingly rare.
- **TLS.** Parallel evolution: both achieve confidentiality + integrity + auth, both now AEAD-only by best practice. **Design contrasts:** TLS uses an X.509 PKI rooted in CAs; SSH uses TOFU plus optional CA certificates inside a non-X.509 format. TLS 1.3 and SSH-2 use very similar key schedules (HKDF-style derivation from a shared secret, separate keys per direction). SSH separates user authentication from transport entirely (RFC 4252); TLS does not have a built-in user-auth phase. SSH never adopted TLS as its transport because (a) TLS pre-1.3 did not have the right session-ID semantics for SSH's exchange-hash signatures and (b) the SSH community valued a single, audited codebase that did not depend on OpenSSL-style PKI surface area. [IETF](https://datatracker.ietf.org/doc/html/rfc4251)[RFC Editor](https://www.rfc-editor.org/info/rfc4251)
- **FTP / SFTP / SCP.** SSH replaced cleartext FTP. **SFTP is *not* FTP-over-SSH** — it is a wholly distinct file-transfer protocol that runs as a *subsystem* request inside an SSH session channel, defined in `draft-ietf-secsh-filexfer` (latest popular draft is -13 from 2006; never published as RFC, an embarrassment the sshm WG has now formally chartered itself to fix per `https://datatracker.ietf.org/doc/charter-ietf-sshm/`). SCP is the older BSD `rcp`-derived utility; OpenSSH 9.0 (April 2022) switched the `scp` command to use SFTP under the hood by default (`-O` re-enables legacy) (`https://www.openssh.org/txt/release-9.0`). RHEL 9 deprecated the SCP protocol entirely (`https://www.redhat.com/en/blog/openssh-scp-deprecation-rhel-9-what-you-need-know`). [Openssh](https://www.openssh.org/txt/release-9.0)[Red Hat](https://www.redhat.com/en/blog/openssh-scp-deprecation-rhel-9-what-you-need-know)
- **Telnet (port 23) / rlogin (513) / rsh (514) / rcp.** The cleartext protocols SSH directly displaced. SSH-1's design goal was explicitly to replace them.
- **Mosh.** "Mobile shell" by Keith Winstein (MIT). Uses SSH only for initial authentication, then drops the SSH session and runs its own UDP-based State Synchronization Protocol with AES-128-OCB AEAD; survives roaming and disconnects (`https://mosh.org/`, USENIX ATC 2012 paper `https://www.usenix.org/conference/atc12/technical-sessions/presentation/winstein`). [GitHub](https://github.com/mobile-shell/mosh)
- **QUIC / HTTP/3.** Same multiplexing problem space. The `draft-michel-ssh3` ("SSH3") work by François Michel and Olivier Bonaventure (UCLouvain) re-implements an SSH-equivalent on HTTP/3+QUIC, claiming 3-RTT session establishment vs SSH's 5–7 (`https://arxiv.org/abs/2312.08396`, `https://github.com/francoismichel/ssh3`). Status: research prototype; has *not* been adopted by sshm WG. [GitHub](https://github.com/francoismichel/ssh3)
- **Kerberos / GSS-API.** RFC 4462 defines `gssapi-with-mic` and GSS-keyex methods; widely used inside enterprises with Active Directory. RFC 8732 (2020) modernised the algorithms. (Note 2026: a GSSAPI key-exchange weak-default issue, CVE-2026-3497, was patched in OpenSSH 10.2p1-6.) [Launchpad](https://launchpad.net/debian/+source/openssh/+changelog)
- **WireGuard.** Cousin in spirit — minimal ciphersuite (Curve25519, ChaCha20-Poly1305, BLAKE2s), no algorithm negotiation. SSH's pluggable algorithms are powerful but produced the Terrapin downgrade attack surface that WireGuard simply doesn't have.
- **HTTP/2 and HTTP/3.** Stream multiplexing parallels SSH's channels: per-stream flow control, head-of-line considerations, distinct purposes per stream.
- **X11.** SSH's `x11` channel forwards X protocol traffic so a remote GUI app renders locally. Historically a primary use case; now declining.
- **Git.** Uses SSH as its preferred authenticated transport (`git@github.com:user/repo.git` translates to an SSH connection that runs `git-upload-pack` / `git-receive-pack` as a subsystem-style channel exec).
- **DNSSEC + SSHFP (RFC 4255).** Lets a server's public key fingerprint be published in a signed DNS record (`SSHFP`). With `VerifyHostKeyDNS yes` the client can skip TOFU. (Caveat: CVE-2025-26465 was a logic flaw in this very path, fixed in 9.9p2.)
- **TLS 1.3 PSK / 0-RTT.** SSH does not have a 0-RTT mode and does not support resumption; every connection re-runs the full KEX. The sshm WG is exploring resumption via the channel-mux drafts but nothing is standardised.

---

## 5. Real-world deployment

**Implementations (status as of May 2026):**

- **OpenSSH** — overwhelming default; latest 10.3 (2 April 2026) (`https://www.openssh.org/releasenotes.html`). Microsoft ships it natively in Windows 10/11/Server (`https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/upgrade-in-box-openssh-to-latest-openssh-release`). [Openssh](https://www.openssh.org/releasenotes.html)
- **libssh** (C, BSD-licensed, `libssh.org`) — used by KDE, Ansible (via `paramiko` fallback), GitHub's libgit2.
- **libssh2** (different C library) — used by curl, cURL's PHP/Perl bindings.
- **Paramiko** (Python).
- **JSch** and **Apache MINA SSHD** (Java).
- **Russh** (Rust).
- **wolfSSH** (commercial, embedded).
- **Dropbear** (small embedded; default in OpenWRT-style routers).
- **Tectia SSH** — commercial descendant of Tatu Ylönen's original SSH.
- **PuTTY** by Simon Tatham — the canonical Windows client; 0.80 patches Terrapin.
- **Bitvise**, **Tera Term**, **MobaXterm**, **WinSCP**, **FileZilla** — Windows-focused clients.

**Production scale.** GitHub, GitLab, Bitbucket all host millions of `git` operations per day over SSH. Qualys' 2024 internet scan saw "over 14 million OpenSSH server instances exposed to the Internet" (`https://blog.qualys.com/vulnerabilities-threat-research/2024/07/01/regresshion-remote-unauthenticated-code-execution-vulnerability-in-openssh-server`). Wikipedia/OpenBSD report ~32 million internet-facing SSH endpoints; this number should be cited carefully (`[needs source]` for the exact 32M). [Vivian Voss](https://vivianvoss.net/blog/technical-beauty-openssh)

**Cloud and zero-trust products:**

- **AWS EC2 Instance Connect** — short-lived SSH key pushed via AWS API.
- **Cloudflare One / Access for Infrastructure** — SSH proxy with short-lived certificates and command logging (`https://blog.cloudflare.com/intro-access-for-infrastructure-ssh/`, `https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/ssh/`). [Cloudflare](https://developers.cloudflare.com/cloudflare-one/traffic-policies/network-policies/ssh-logging/)[Cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/ssh/ssh-infrastructure-access/)
- **Tailscale SSH** — identity-based, certificate-less, leverages WireGuard tailnet plus identity provider; GA announced (`https://tailscale.com/blog/tailscale-ssh-ga`). [Tailscale](https://tailscale.com/blog/tailscale-ssh-ga)[Tailscale](https://tailscale.com/blog/tailscale-ssh-ga)
- **Teleport** — open-source "access plane" with SSH CA, recording proxy, RBAC.
- **HashiCorp Boundary** and **Vault SSH secrets engine** — short-lived signed SSH cert workflows.
- **smallstep `step-ca`** — open-source SSH CA with OIDC SSO bridge (`https://smallstep.com/blog/use-ssh-certificates/`).
- **Bastion architecture** — single hardened jumphost with `ProxyJump`/`ProxyCommand` from clients.
- **PAM/CASB products** (CyberArk, BeyondTrust, Delinea) front SSH with privileged-session brokers.

**Performance:**

- AEAD throughput on modern CPUs with AES-NI: AES-256-GCM typically beats ChaCha20-Poly1305 by ~1.5–3× per core; on CPUs without AES-NI ChaCha20 wins. A 2025 set of benchmarks across AWS server SKUs showed AES-256-GCM "now beats ChaCha20-Poly1305 by up to 3× on every modern CPU with hardware acceleration" (`https://ashvardanian.com/posts/chacha-vs-aes-2025/`). [Ash's Blog](https://ashvardanian.com/posts/chacha-vs-aes-2025/)
- Connection setup latency: SSHv2 typically completes the full handshake in 5–7 RTT including TCP and auth (`https://github.com/francoismichel/ssh3`).
- Per-connection memory: roughly 5–10 MB resident for a typical OpenSSH server child `[needs source]`. With multiplexing one connection serves many sessions.
- Per-channel flow-control window default in OpenSSH is 2 MB.

---

## 6. Failure modes and famous incidents

### 6.1 CVE-2024-3094 — XZ Utils backdoor (March 2024)

**Year/org/people.** 29 March 2024. Andres Freund, a Microsoft/PostgreSQL engineer, while investigating a 500 ms regression in SSH login latency on Debian sid, found a multi-stage backdoor in `liblzma` 5.6.0/5.6.1 introduced by maintainer "Jia Tan" (`JiaT75`), who had spent over two years (Nov 2021 → Feb 2024) gaining maintainer status through apparent sock-puppetry from accounts including "Jigar Kumar" and "Hans Jansen" (`https://en.wikipedia.org/wiki/XZ_Utils_backdoor`, `https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27`).

**What happened.** The release tarballs (not the git tree) contained obfuscated test files plus a `build-to-host.m4` script that, during RPM/Deb x86_64 builds, modified `liblzma`'s Makefile to ship a malicious object file. At runtime, when `liblzma` was loaded into a process named `/usr/sbin/sshd` (because some distros patch `sshd` to link `libsystemd`, which links `liblzma`), it hooked OpenSSL's `RSA_public_decrypt` via IFUNC. The hook examined the RSA modulus `N` of the public key supplied during pubkey auth and, if it contained a payload signed by an attacker's Ed448 key, executed arbitrary commands via `system()` *before* authentication completed (`https://jfrog.com/blog/xz-backdoor-attack-cve-2024-3094/`, `https://www.akamai.com/blog/security-research/critical-linux-backdoor-xz-utils-discovered-what-to-know`, `https://securitylabs.datadoghq.com/articles/xz-backdoor-cve-2024-3094/`).

**Impact.** CVSS 10.0. Affected Fedora 40 beta, Fedora Rawhide, Debian unstable/testing, openSUSE Tumbleweed, Kali rolling, Arch *briefly*. No stable distro shipped it. Discovered before mass exploitation.

**Root cause.** Long-game social-engineering attack on OSS supply chain; Jia Tan's earlier commits had also disabled relevant fuzzing hooks to evade detection (`https://www.wiz.io/blog/cve-2024-3094-critical-rce-vulnerability-found-in-xz-utils`).

### 6.2 CVE-2023-48795 — Terrapin (December 2023)

**Year/org/people.** 18 December 2023. Fabian Bäumer, Marcus Brinkmann, Jörg Schwenk at Ruhr University Bochum (USENIX Security 2024 best paper) (`https://terrapin-attack.com/`, `https://arxiv.org/pdf/2312.12422`).

**What happened.** A MITM can delete a chosen number of encrypted packets from the *start* of an SSH channel without detection because (a) SSH's per-direction sequence numbers begin counting *before* the first encrypted message and (b) for `chacha20-poly1305@openssh.com` and `*-etm@openssh.com` (encrypt-then-MAC) modes the early sequence-number gap is recoverable by injecting `SSH_MSG_IGNORE` messages. This breaks SSH extension negotiation (RFC 8308), enabling downgrade of pubkey signature algorithms and disabling OpenSSH 9.5's keystroke-timing obfuscation. [arxiv](https://arxiv.org/pdf/2312.12422)

**Impact.** Logical, not catastrophic — does not give RCE, but enables algorithm downgrade and (in AsyncSSH, CVE-2023-46445/46446) full session hijack.

**Mitigation.** "Strict KEX" extension implemented in OpenSSH 9.6 (Dec 2023) and adopted by libssh 0.10.6/0.9.8, PuTTY 0.80, Go x/crypto/ssh 0.17, AsyncSSH 2.14.2, Apache MINA SSHD 2.12.0 (`https://terrapin-attack.com/patches.html`). [Baeldung](https://www.baeldung.com/linux/terrapin-ssh-attack-mitigate)

### 6.3 CVE-2024-6387 — regreSSHion (July 2024)

**Year/org/people.** 1 July 2024. Qualys Threat Research Unit (`https://blog.qualys.com/vulnerabilities-threat-research/2024/07/01/regresshion-remote-unauthenticated-code-execution-vulnerability-in-openssh-server`).

**What happened.** Pre-auth, unauthenticated **RCE as root** in `sshd` on glibc-based Linux. A signal handler race: when a connecting client fails to authenticate within `LoginGraceTime` (default 120 s), `sshd` raises `SIGALRM`, whose handler calls `syslog()` — which is *not* async-signal-safe and calls `malloc`/`free`. By interrupting `malloc` at the right instant, an attacker can corrupt the heap and ultimately get RCE.

**Lineage.** This is a regression of CVE-2006-5051 (Mark Dowd's original report). The original 2006 fix wrapped the unsafe code in `#ifdef DO_LOG_SAFE_IN_SIGHAND`. In October 2020, OpenSSH 8.5p1's logging refactor accidentally dropped the directive — re-introducing the bug. **OpenSSH 4.4p1 ≤ version < 8.5p1** is *not* vulnerable (transformative patch). Versions 8.5p1 ≤ x < 9.8p1 are vulnerable. OpenBSD itself is unaffected because it had separately developed a safe `sigdie()` in 2001.

**Exploit difficulty.** ~10,000 connection attempts (3–4 hours at default `MaxStartups`/`LoginGraceTime`) on 32-bit x86; 6–8 hours including ASLR bypass. 64-bit exploitation conjectured but not publicly demonstrated. Qualys identified ~14 M internet-exposed OpenSSH instances potentially in scope. [Vivian Voss](https://vivianvoss.net/blog/technical-beauty-openssh)

### 6.4 CVE-2008-0166 — Debian OpenSSL PRNG (May 2008)

**Year/org/people.** Reported by Luciano Bello of Debian; fixes coordinated by Debian security team (DSA-1571-1 for OpenSSL, DSA-1576-1 for OpenSSH) (`https://www.debian.org/security/2008/dsa-1571`, `https://www.debian.org/security/2008/dsa-1576`).

**What happened.** A Debian maintainer in September 2006, in response to Valgrind/Purify warnings about uninitialised memory reads in OpenSSL, removed the lines that were *the primary entropy source* for `RAND_add()`. The PRNG was then seeded almost solely by the process ID — 32,768 possible values per architecture/key-type/key-size on Linux. Every SSL/SSH key generated on Debian or derivative systems between September 2006 and May 2008 was guessable by brute force.

**Impact.** ~20 months of weak keys in the wild; required sweeping re-issuance across Debian/Ubuntu fleets and DSA key revocation everywhere a Debian-generated DSA signature had ever been used.

### 6.5 CVE-2006-5051 (signal-handler race — original; July 2006).

The bug that became CVE-2024-6387 eighteen years later. Originally reported by Mark Dowd; technically a pre-auth signal-handler reentrancy issue in OpenSSH < 4.4 (`https://www.qualys.com/regresshion-cve-2024-6387`).

### 6.6 The 2001 CRC32 compensation-attack exploit.

CVE-2001-0144. Disclosure by Michał Zalewski on Bugtraq, 8 Feb 2001. Integer overflow in `deattack.c` (Core-SDI's mitigation for the 1998 SSH-1 insertion attack) gave remote root on OpenSSH ≤ 2.1.1 and SSH.com 1.2.31 (`https://www.coresecurity.com/core-labs/advisories/ssh1-crc-32-compensation-attack-detector-vulnerability`). [Doyensec](https://blog.doyensec.com/2025/02/27/exploitable-sshd.html)[Exploit-DB](https://www.exploit-db.com/exploits/20617)

### 6.7 GitHub host-key exposure (March 2023)

24 March 2023, ~05:00 UTC. GitHub's RSA SSH host private key was briefly inadvertently published in a public GitHub repo. CSO Mike Hanley posted the rotation announcement (`https://github.blog/news-insights/company-news/we-updated-our-rsa-ssh-host-key/`, `https://www.bleepingcomputer.com/news/security/githubcom-rotates-its-exposed-private-ssh-key/`). The new fingerprint: `SHA256:uNiVztksCsDhcc0u9e8BujQXVUpKZIDTMczCvj3tD2s :antCitation[]{citations="374498cb-5c06-4e92-b1c7-492c341029ea" injected="space"}`. ECDSA and Ed25519 host keys were not rotated. Users worldwide had to `ssh-keygen -R github.com` and re-trust. Highlights why rotation/discovery via `UpdateHostKeys` and SSHFP matters.

### 6.8 Other recurring failure patterns

- **TOFU bypass.** Users mash `yes` at the host-key prompt without verifying. Attackers exploit by hijacking DHCP/DNS at coffee shops.
- **Agent forwarding (`-A`) hijack.** A compromised intermediate host can use the forwarded agent socket to authenticate as you to anything it can reach. Use `-J` (ProxyJump) instead.
- **`ProxyCommand` injection.** `ssh user@$HOSTNAME` where `$HOSTNAME` is attacker-controlled and `ProxyCommand` uses `%h` can lead to command injection. CVE-2023-51385 and CVE-2025-61985 are recent examples; 10.0p1-7 patches the 2025 issue.
- **Weak ciphers / SHA-1 still negotiated** by ancient deployments.
- **Port-22 brute force.** Real-world traffic to any open `:22` is dominated by automated credential stuffing.
- **SSH key sprawl.** Thousands of unaudited `authorized_keys` entries accreted over years; surveys show many enterprise networks have more SSH keys than employees `[needs source]`.
- **Untracked `authorized_keys` outside `~/.ssh/`** via `AuthorizedKeysFile /etc/ssh/authorized_keys.d/%u`.
- **Heninger et al., "Mining Your Ps and Qs"** (USENIX Security 2012) — internet-wide scan found 0.03% of RSA SSH host keys and 1.03% of DSA keys exposed because of weak entropy at first boot; computed thousands of private keys via batch-GCD (`https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/heninger`, `https://factorable.net/weakkeys12.extended.pdf`). [ResearchGate](https://www.researchgate.net/publication/262407252_Mining_your_Ps_and_Qs_detection_of_widespread_weak_keys_in_network_devices)

---

## 7. Fun facts and anecdotes

- **The "SSH" trademark fight.** "SSH" and "Secure Shell" became contested between SSH Communications Security and the OpenSSH project around 2000–2001 after Tatu Ylönen's company asserted trademark rights. The IETF SECSH working group chose to keep "SSH" as the protocol name and the dispute eventually faded; the OpenSSH project deliberately uses "OpenSSH" as the implementation name (`https://en.wikibooks.org/wiki/OpenSSH/Overview`).
- **The IANA email** (10 July 1995). Tatu's request to `iana@isi.edu` is reproduced verbatim on his SSH Academy page; Joyce K. Reynolds replied within a day and assigned port 22 — "Tatu, We have assigned port number 22 to ssh, with you as the point of contact. Joyce" (`https://www.linux.com/news/story-getting-ssh-port-22/`). [Quora](https://www.quora.com/Why-do-we-use-port-number-22-for-the-secure-shell-SSH)
- **The puffer fish.** OpenSSH inherits OpenBSD's `Puffy` blowfish mascot, indirectly named after Bruce Schneier's Blowfish cipher. The OpenSSH website uses Puffy too (`https://www.openssh.org/`).
- **The original SSH-1 codebase** was a few thousand lines of C (`[needs source]` — popularly cited at ~3000–5000 LOC).
- **Randomart (the "Drunken Bishop")**. Added to OpenSSH 5.1 (2008) by Alexander von Gernler, motivated by Dan Kaminsky's 23C3 talk on hash visualization. The algorithm is described in Dirk Loss, Tobias Limmer, and Alexander von Gernler's paper *The Drunken Bishop: An Analysis of the OpenSSH Fingerprint Visualization Algorithm* (`https://www.dirk-loss.de/sshvis/drunken_bishop.pdf`). A bishop walks diagonally on a 9×17 grid starting from the centre; each pair of fingerprint bits chooses a diagonal; cells are inked in proportion to visits with the symbols ` .o+=*BOX@%&#/^`. Enable via `VisualHostKey yes`. (Tyler Cipriani's writeup at `https://tylercipriani.com/blog/2017/09/26/ssh-key-fingerprints-identicons-and-ascii-art/` is excellent.)
- **The TOFU prompt.** *"The authenticity of host '...' can't be established. RSA key fingerprint is …. Are you sure you want to continue connecting (yes/no)?"* — perhaps the most-clicked-through security UX in computing history.
- **Damien Miller's release notes.** A small literary form: terse, dry, technically meticulous, often funny, signed `-djm`. Compare 9.6, 9.8, 10.0 release announcements.
- **The `moduli` file.** `/etc/ssh/moduli` contains primes for diffie-hellman-group-exchange. They are generated by `ssh-keygen -M generate` (sieving) and `ssh-keygen -M screen` (Miller-Rabin), a process that takes hours on a workstation. OpenSSH 10.0 disables FF DH on the server side by default (`https://www.openssh.org/releasenotes.html`).
- **Theo de Raadt's quotes.** Famously asked *why* OpenBSD bothers auditing every line: "Because if you don't, then it doesn't matter how much you trust your software, because you can't." He has also said about cryptography library quality, in defending the LibreSSL fork: OpenSSL was "a chainsaw in a nursery" `[needs source — paraphrase]`.
- **The 9p / Plan 9 connection.** Tangential: SSH does not borrow from Plan 9, but Plan 9's `9p` protocol shares the channel/multiplex aesthetic; both are influenced by 1980s Unix-shell-as-RPC thinking.
- **Why `.ssh/`?** Just by convention from Tatu's original implementation; like `.cshrc` and `.netrc` it's a per-user dotfile directory.
- **April Fools' RFCs.** SSH itself has not been the subject of an April Fools' RFC, but RFC 9522 (Apr 2024, "Reflections on Ten Years Past the Snowden Revelations") is a relevant nearby read; classic IETF April 1 jokes (RFC 1149 IP over Avian Carriers, RFC 2324 HTCPCP) are unrelated to SSH but live in the same cultural milieu.

---

## 8. Practical wisdom

**Tuning parameters worth knowing (`man sshd_config`, `man ssh_config`):**

- `Ciphers chacha20-poly1305@openssh.com,aes256-gcm@openssh.com,aes128-gcm@openssh.com,aes256-ctr,aes192-ctr,aes128-ctr` (Mozilla guideline, `https://infosec.mozilla.org/guidelines/openssh`). [Mozilla](https://infosec.mozilla.org/guidelines/openssh)[MozillaWiki](https://wiki.mozilla.org/Security/Guidelines/OpenSSH)
- `MACs hmac-sha2-512-etm@openssh.com,hmac-sha2-256-etm@openssh.com,umac-128-etm@openssh.com`. [MozillaWiki](https://wiki.mozilla.org/Security/Guidelines/OpenSSH)[DTU Physics](https://wiki.fysik.dtu.dk/ITwiki_archive/24.06/OpenSSH_configuration/)
- `KexAlgorithms mlkem768x25519-sha256,sntrup761x25519-sha512,curve25519-sha256,curve25519-sha256@libssh.org,diffie-hellman-group16-sha512,diffie-hellman-group18-sha512`.
- `HostKeyAlgorithms ssh-ed25519,sk-ssh-ed25519@openssh.com,rsa-sha2-512,rsa-sha2-256` (no SHA-1).
- `PubkeyAcceptedAlgorithms` mirrors the above for client-side keys.
- `ServerAliveInterval 60` / `ServerAliveCountMax 3` to keep connections alive through stateful firewalls.
- `ControlMaster auto`, `ControlPath ~/.ssh/cm-%C`, `ControlPersist 10m` for connection multiplexing.

**Defaults to be skeptical of:**

- `StrictHostKeyChecking ask` / `accept-new` — if set to `no`, you accept any change; if `accept-new`, you accept first-time hosts silently.
- Agent forwarding (`ForwardAgent`) — never on by default in OpenSSH; never enable it casually.
- `PermitRootLogin prohibit-password` is the default since 7.0; do not relax to `yes`.
- `PasswordAuthentication yes` is on by default in many distros; turn off in favor of pubkey/cert.

**What to monitor:**

- Auth failures (`/var/log/auth.log` or `journalctl -u ssh`).
- Key age — rotate user keys annually; certificates expire on their own.
- Login geographies / impossible-travel patterns.
- Unusual subsystem requests (sftp from accounts that should never use it).

**Debugging:**

- `ssh -vvv user@host` (three levels of verbosity).
- `sshd -ddd -p 2222` to run a debug server on an alt port.
- `ssh-keyscan host` to fetch and inspect host keys.
- `ssh-add -L` to list keys in agent.
- `ssh -Q kex|key|cipher|mac|sig` to enumerate algorithms supported by the local binary. [Mozilla](https://infosec.mozilla.org/guidelines/openssh)
- Compare fingerprints with `ssh-keygen -lf <key>`.

**Common misconfigurations:**

- `PermitRootLogin yes`.
- `PasswordAuthentication yes` plus open port 22.
- Weak `Match` blocks that override stricter global settings.
- `AuthorizedKeysFile` permissions wrong: home dir must be 700/750, `~/.ssh` 700, `authorized_keys` 600 — `StrictModes yes` (the default) refuses otherwise.
- Broken `Include` directives (`Include /etc/ssh/sshd_config.d/*.conf`).
- PAM misconfig: `PasswordAuthentication no` is *not* enough if PAM still allows password via keyboard-interactive (Mozilla's guide is the canonical fix). [Mozilla](https://infosec.mozilla.org/guidelines/openssh)
- SELinux contexts wrong on rotated host keys (`restorecon -R /etc/ssh`).

**SSH certificates vs raw keys.** Certs are signed by a trusted CA, expire automatically, can carry principals and force commands. Operationally far better than `authorized_keys` sprawl. Smallstep, Teleport, Cloudflare, HashiCorp Vault all provide SSH CA workflows. [Cloudflare](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/ssh/ssh-infrastructure-access/)[Smallstep](https://smallstep.com/blog/diy-single-sign-on-for-ssh/)

**`ssh-agent` best practices:** lock with `ssh-add -x` when stepping away; use `AddKeysToAgent confirm`; prefer hardware-backed keys.

**FIDO2 / U2F (`-sk`).** OpenSSH 8.2+ (Feb 2020) supports `ed25519-sk` and `ecdsa-sk` keys backed by a hardware security key. Resident keys (`-O resident`) let you carry the credential on the device itself; `-O verify-required` adds PIN. This is the strongest practical SSH credential available today (`https://www.openssh.org/txt/release-8.2`, `https://developers.yubico.com/SSH/Securing_SSH_with_FIDO2.html`). [Zeph Tech + 2](https://zephtech.net/feed/2020-02-14-openssh-8-2-release.html)

---

## 9. Learning resources (current as of May 2026)

**Authoritative specifications** — all available at `rfc-editor.org/info/rfcXXXX`. Status verified at IETF datatracker:

- **RFC 4250 / 4251 / 4252 / 4253 / 4254** (Jan 2006, Proposed Standard) — the SSH-2 core. (`https://datatracker.ietf.org/doc/html/rfc4251` etc.)
- **RFC 4255** (Jan 2006) — SSHFP DNS records.
- **RFC 4256** — keyboard-interactive.
- **RFC 4344** — encryption modes.
- **RFC 4419** — DH group exchange.
- **RFC 4432** — RSA KEX.
- **RFC 4716** — public-key file format.
- **RFC 5656** (Dec 2009) — ECC for SSH.
- **RFC 6187** — X.509 certificates in SSH.
- **RFC 6668** — SHA-256 HMAC.
- **RFC 8268** (Dec 2017) — additional MODP DH groups.
- **RFC 8308** — extension negotiation.
- **RFC 8332** — RSA-SHA-2.
- **RFC 8709** (Feb 2020) — Ed25519/Ed448. (`https://datatracker.ietf.org/doc/html/rfc8709`) [IETF](https://datatracker.ietf.org/doc/html/rfc8709)
- **RFC 8731** — Curve25519 KEX.
- **RFC 8732** — modern GSS-API KEX.
- **RFC 8758** (Apr 2020) — deprecate Arcfour.
- **RFC 9142** (Jan 2022) — Key exchange method updates and recommendations. Updates 4250/4253/4432/4462. *This is the current authoritative recommendations document.* (`https://datatracker.ietf.org/doc/html/rfc9142`) [GlobalSpec](https://standards.globalspec.com/std/14493553/rfc-9142)[Hjp](https://www.hjp.at/doc/rfc/rfc9142.html)
- **draft-ietf-sshm-ntruprime-ssh** (latest -06, Sept 2025; expires Apr 2026) (`https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/`). [IETF](https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/)
- **draft-ietf-sshm-mlkem-hybrid-kex** (Kampanakis/Stebila/Hansen) — verify latest revision at `https://datatracker.ietf.org/group/sshm/documents/`.

**Books:**

- *SSH Mastery: OpenSSH, PuTTY, Tunnels and Keys* — Michael W Lucas, Tilted Windmill Press. The 2nd edition (ISBN 978-1642350029) is the latest widely-available revision; Lucas confirmed direct print sales for SSH Mastery in March 2025 (`https://mwl.io/archives/24012`). Intermediate. (Note: I could not locate a published 3rd edition by May 2026.) [Amazon](https://www.amazon.com/SSH-Mastery-OpenSSH-PuTTY-Tunnels/dp/1642350028)[Michael W Lucas](https://mwl.io/archives/24012)
- *SSH, the Secure Shell: The Definitive Guide* — Barrett, Silverman, Byrnes. O'Reilly. 2nd edition 2005. **Datedness:** very dated; predates Ed25519, AEAD, SHA-2 RSA, FIDO, post-quantum. Useful only for historical or SSH-1 understanding.
- *Real-World Cryptography* — David Wong, Manning, 2021. Has clear chapters on SSH and the underlying primitives. Intermediate.
- *Serious Cryptography*, 2nd ed. — Jean-Philippe Aumasson, No Starch, 2024. The 2nd edition adds post-quantum coverage. Intermediate/advanced.

**Academic papers:**

- Ylönen 1995 *SSH — Secure Login Connections over the Internet* (USENIX Security 1996) — historical.
- *Mining Your Ps and Qs: Detection of Widespread Weak Keys in Network Devices* — Heninger, Durumeric, Wustrow, Halderman, USENIX Security 2012. Best paper award. (`https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/heninger`)
- *Terrapin Attack: Breaking SSH Channel Integrity by Sequence Number Manipulation* — Bäumer, Brinkmann, Schwenk, USENIX Security 2024. (`https://arxiv.org/abs/2312.12422`)
- *Finding SSH Strict Key Exchange Violations by State Learning* — Bäumer, Brinkmann, Maehren, Schwenk, 2025 follow-up (`https://arxiv.org/abs/2509.10895`).
- *Towards SSH3: how HTTP/3 improves secure shells* — Michel & Bonaventure, UCLouvain, 2023 (`https://arxiv.org/abs/2312.08396`).
- regreSSHion technical writeup — Qualys (`https://www.qualys.com/2024/07/01/cve-2024-6387/regresshion.txt`).

**Engineering blog posts:**

- Cloudflare *Fearless SSH: short-lived certificates bring Zero Trust to infrastructure* (`https://blog.cloudflare.com/intro-access-for-infrastructure-ssh/`).
- Tailscale SSH design (`https://tailscale.com/blog/tailscale-ssh-ga`).
- Teleport blog on SFTP (`https://goteleport.com/blog/sftp/`).
- ssh.com (Ylönen) port-22 history (`https://www.ssh.com/academy/ssh/port`).
- Filippo Valsorda's `words.filippo.io` — SSH-key-as-encryption posts; `yubikey-agent` (`https://words.filippo.io/`).
- smallstep — *If you're not using SSH certificates you're doing SSH wrong* (`https://smallstep.com/blog/use-ssh-certificates/`); *DIY Single Sign-On for SSH* (`https://smallstep.com/blog/diy-single-sign-on-for-ssh/`).
- Mozilla Infosec OpenSSH guidelines (`https://infosec.mozilla.org/guidelines/openssh`).

**YouTube / talks:**

- USENIX Security 2024 Terrapin presentation (search "USENIX Terrapin 2024").
- Computerphile's SSH explainer (Mike Pound).
- Damien Miller has spoken at AsiaBSDCon, BSDCan, EuroBSDCon — search those proceedings.

**Podcasts:**

- *Security Now* (Steve Gibson) — episodes #968 (XZ), #982 (regreSSHion).
- *Risky Business* — XZ episode (April 2024); regreSSHion (July 2024).
- *Oxide and Friends* — XZ Utils retrospective.
- *Darknet Diaries* — has not done a full SSH-incident episode but XZ is a likely future subject.

**University courses:**

- **Stanford CS155** Computer and Network Security — lectures on TLS/SSH.
- **MIT 6.5660 / 6.858** Computer Systems Security — historically includes SSH and SSL.
- **Berkeley CS161** — Computer Security; covers public-key crypto and SSH at intro level.

**Hands-on tools:**

- **`ssh-audit`** by Joe Testa (`https://github.com/jtesta/ssh-audit`) — audits server and client configurations, scores against hardening guides, tests for Terrapin and DHEat. Latest stable 3.3.0+ as of Oct 2024. [GitHub](https://github.com/jtesta/ssh-audit)
- **Wireshark SSH dissector** — protocol-level inspection.
- **Terrapin scanner** (`https://github.com/RUB-NDS/Terrapin-Scanner`).
- **`ssh-keygen -y`, `ssh-keygen -lf`** — built-in inspection.
- **`badkeys.info`** — checks against known weak-key blacklists (Debian PRNG, ROCA, etc.).

---

## 10. Where things are heading (2025–2026 frontier)

**Active deprecations:**

- **DSA** — gone in OpenSSH 10.0 (April 2025) (`https://www.openssh.org/releasenotes.html`).
- **SHA-1 signatures** — `ssh-rsa` (RSA-SHA-1) disabled by default since OpenSSH 8.8; RFC 9142 calls for retiring SHA-1 KEX "as soon as possible." [IETF](https://www.ietf.org/rfc/rfc9142.pdf)[RFC Editor](https://www.rfc-editor.org/rfc/rfc9142.pdf)
- **Finite-field DH** — disabled by default on OpenSSH 10.0 server side.
- **Weak ciphers** (3DES-CBC, blowfish-CBC, arcfour) — gone or off by default everywhere modern.

**Post-quantum migration:**

- `mlkem768x25519-sha256` is the **default** since OpenSSH 10.0 (Apr 2025), with `sntrup761x25519-sha512` as fallback (`https://www.openssh.com/pq.html`).
- OpenSSH 10.1 (Oct 2025) adds the user-facing warning: *"WARNING: connection is not using a post-quantum key exchange algorithm. This session may be vulnerable to 'store now, decrypt later' attacks."* (`https://solcyber.com/openssh-now-warns-about-non-post-quantum-connections/`).
- Australia's ASD has a 2030 migration deadline; US NSA's CNSA 2.0 sets 2035. SSH stacks must update server-side.
- Red Hat ships ML-KEM-capable OpenSSH in RHEL 10.0 (May 2025) (`https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10`).
- The IETF sshm WG is shepherding both `ntruprime-ssh` and `mlkem-hybrid-kex` to RFC; both are expected published as Informational/Standards Track within 2026.

**Other research / deployment trends:**

- **SSH3** (Michel & Bonaventure, UCLouvain) — academic prototype on HTTP/3+QUIC, 3 RTT establishment. *Not adopted by any standards body, not production-ready, prototype only* (`https://github.com/francoismichel/ssh3`).
- **SSH-over-QUIC** drafts more broadly are inactive in sshm; the WG charter explicitly excludes new transports.
- **FIDO2 / `-sk` keys** are increasingly the recommended default for human users; GitHub, GitLab, Cloudflare, AWS IAM Identity Center all accept them.
- **SSH certificate ecosystems** — smallstep, Teleport, HashiCorp Vault, AWS EC2 Instance Connect, Cloudflare Access for Infrastructure. The sshm WG has an explicit milestone to *standardise* the OpenSSH certificate format that has been the de-facto standard since 2010.
- **Zero-trust / identity-bound SSH** (Tailscale SSH, Cloudflare, Teleport) bypasses TOFU entirely by binding authorisation to an identity-provider session; the host key still matters but it's brokered by the platform.
- **sshm WG output expected 2026:** RFC for `mlkem768x25519-sha256`, RFC for `sntrup761x25519-sha512`, ChaCha20-Poly1305 SSH RFC, OpenSSH agent protocol draft, SFTP draft (finally!), and a `bis` of RFC 9519 recommendations.
- **Possible obsoletions:** RFC 4344 (encryption modes) and RFC 4345 (Arcfour) are candidates for moving to Historic.

---

## 11. Hooks for the article, infographic, and podcast

**60-second narrated hook (for non-experts):**

> Every second of every day, somewhere in the world, a developer types `ssh prod-db-1` and gets a working command line on a machine in another country. They don't think about it. They shouldn't have to. Behind that single keystroke, a 30-year-old protocol negotiates encryption keys with a server it's never spoken to before, proves that the server is who it claims to be, proves that the developer is who *they* claim to be, opens up a private channel, and starts streaming bytes — all in less than a second, and all without anyone in between being able to read or change a single character. That protocol is SSH. It was written by one Finnish graduate student in the spring of 1995 after his university got hacked. It now runs on tens of millions of servers — every Linux box, every router, every cloud VM, every git push you've ever done. And in March 2024, it almost got backdoored by an attacker who had spent two years pretending to be a helpful open-source contributor. This is the story of how that worked, why it almost worked, and the small army of paranoid programmers in OpenBSD who keep it from happening again.

**Striking statistic with source:**
*"In July 2024, Qualys identified more than 14 million OpenSSH server instances exposed to the public Internet, all potentially vulnerable to a regression of a bug that was first patched in 2006."* — Qualys Threat Research Unit, `https://blog.qualys.com/vulnerabilities-threat-research/2024/07/01/regresshion-remote-unauthenticated-code-execution-vulnerability-in-openssh-server`.

**"Pause and think" moment:**
SSH's default trust model is *Trust On First Use*. The first time you connect to a server, you're shown a fingerprint and asked, "Are you sure?" You almost certainly type "yes." You almost certainly didn't verify the fingerprint against any out-of-band channel. Now ask yourself: how would you even *know* if you'd been man-in-the-middled the very first time you connected to your company's bastion host five years ago?

**Failure-story arc — XZ Utils, told dramatically:**

> In late February 2024, Andres Freund, a database engineer at Microsoft, noticed something small. SSH logins on his Debian sid laptop were taking about half a second longer than he was used to. Nobody else would have cared. He noticed because he is the kind of engineer who notices.
> 
> He ran `perf`. He saw `liblzma` — a compression library — at the top of the CPU profile inside `sshd`, where it had no business being. He pulled the threads. By March 29 he had unraveled what is now considered one of the most sophisticated software supply-chain attacks in history.
> 
> A maintainer calling himself "Jia Tan" had, over more than two years, built up reputation in the XZ Utils project — submitting helpful patches, reviewing other people's code, and slowly elbowing aside the original maintainer through a chorus of email accounts pressing him to share the burden. By February 2024, "Jia Tan" had release authority. Versions 5.6.0 and 5.6.1 of XZ shipped with a backdoor hidden inside test files, activated at build time on x86_64 RPM and Deb packages, that hooked the OpenSSH server's RSA verification routine and turned a specific Ed448-signed payload into root code execution before the user had even authenticated.
> 
> It was caught two weeks before it would have hit Debian stable, Ubuntu LTS, and Red Hat. If it had, the attacker would have had pre-auth root on every internet-facing Linux server in the world that linked sshd against systemd against liblzma — which is to say, most of them.
> 
> One engineer noticed half a second of latency. That was the whole margin.

---

## 12. Citations

1. [https://www.openssh.org/releasenotes.html](https://www.openssh.org/releasenotes.html) — OpenSSH release notes (10.0, 10.1, 10.2, 10.3 details; DSA removal; mlkem768x25519-sha256 default; sshd-auth split; CVE patches).
2. [https://www.openssh.com/pq.html](https://www.openssh.com/pq.html) — OpenSSH post-quantum cryptography page (mlkem768x25519-sha256 default in 10.0; 9.0 sntrup761; 10.1 warning).
3. [https://www.openssh.org/history.html](https://www.openssh.org/history.html) — OpenSSH project history (1999 fork, contributors).
4. [https://www.openssh.org/portable.html](https://www.openssh.org/portable.html) — OpenSSH portable releases.
5. [https://www.openssh.org/txt/release-9.0](https://www.openssh.org/txt/release-9.0) — OpenSSH 9.0 (April 2022, scp→sftp, sntrup761x25519).
6. [https://www.openssh.org/txt/release-8.2](https://www.openssh.org/txt/release-8.2) — OpenSSH 8.2 (Feb 2020, FIDO2/U2F).
7. [https://www.openssh.org/txt/release-9.7](https://www.openssh.org/txt/release-9.7) — OpenSSH 9.7 (Mar 2024).
8. [https://lists.mindrot.org/pipermail/openssh-unix-announce/2024-January/000156.html](https://lists.mindrot.org/pipermail/openssh-unix-announce/2024-January/000156.html) — DSA removal timeline announcement by Damien Miller.
9. [https://lwn.net/Articles/958048/](https://lwn.net/Articles/958048/) — LWN summary of DSA removal plan.
10. [https://www.phoronix.com/news/OpenSSH-10.0-Released](https://www.phoronix.com/news/OpenSSH-10.0-Released) — Phoronix coverage of OpenSSH 10.0 release.
11. [https://quantumcomputingreport.com/openssh-10-0-introduces-default-post-quantum-key-exchange-algorithm/](https://quantumcomputingreport.com/openssh-10-0-introduces-default-post-quantum-key-exchange-algorithm/) — coverage of OpenSSH 10.0 PQ default.
12. [https://solcyber.com/openssh-now-warns-about-non-post-quantum-connections/](https://solcyber.com/openssh-now-warns-about-non-post-quantum-connections/) — OpenSSH 10.1 PQ warning.
13. [https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10](https://www.redhat.com/en/blog/post-quantum-cryptography-red-hat-enterprise-linux-10) — RHEL 10 PQ (ML-KEM in OpenSSH).
14. [https://github.com/golang/go/issues/76281](https://github.com/golang/go/issues/76281) — Go proposal mentioning mlkem768x25519-sha256 as OpenSSH's current default.
15. [https://tracker.debian.org/pkg/openssh](https://tracker.debian.org/pkg/openssh) — Debian package tracker (CVE-2025-61984/61985, CVE-2026-3497, CVE-2026-35385–35414).
16. [https://launchpad.net/ubuntu/+source/openssh/+changelog](https://launchpad.net/ubuntu/+source/openssh/+changelog) — Ubuntu/Debian package changelogs.
17. [https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/upgrade-in-box-openssh-to-latest-openssh-release](https://learn.microsoft.com/en-us/troubleshoot/windows-server/system-management-components/upgrade-in-box-openssh-to-latest-openssh-release) — Windows OpenSSH bundling.
18. [https://www.versio.io/en/product-release-end-of-life-eol-openssh-ssh-server.html](https://www.versio.io/en/product-release-end-of-life-eol-openssh-ssh-server.html) — OpenSSH lifecycle (10.3p1 latest).
19. [https://datatracker.ietf.org/group/sshm/about/](https://datatracker.ietf.org/group/sshm/about/) — IETF sshm WG.
20. [https://datatracker.ietf.org/doc/charter-ietf-sshm/](https://datatracker.ietf.org/doc/charter-ietf-sshm/) — sshm WG charter.
21. [https://mailarchive.ietf.org/arch/msg/ssh/lZ4n_pmzeQX9TgQNty5yf2SKHRQ/](https://mailarchive.ietf.org/arch/msg/ssh/lZ4n_pmzeQX9TgQNty5yf2SKHRQ/) — sshm WG formation (chairs Job Snijders, Stephen Farrell).
22. [https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/](https://datatracker.ietf.org/doc/draft-ietf-sshm-ntruprime-ssh/) — sntrup761x25519 draft.
23. [https://datatracker.ietf.org/submit/status/148662/](https://datatracker.ietf.org/submit/status/148662/) — mlkem-hybrid-kex draft.
24. [https://mailarchive.ietf.org/arch/msg/ssh/JjKq6gqjMp0KomYq6K3TzmqzRwo/](https://mailarchive.ietf.org/arch/msg/ssh/JjKq6gqjMp0KomYq6K3TzmqzRwo/) — strict-KEX adoption call.
25. [https://datatracker.ietf.org/doc/html/rfc4251](https://datatracker.ietf.org/doc/html/rfc4251) — RFC 4251 SSH Architecture.
26. [https://datatracker.ietf.org/doc/html/rfc4253](https://datatracker.ietf.org/doc/html/rfc4253) — RFC 4253 SSH Transport.
27. [https://www.rfc-editor.org/rfc/rfc4253](https://www.rfc-editor.org/rfc/rfc4253) — RFC 4253 (mirror).
28. [https://www.rfc-editor.org/info/rfc4253](https://www.rfc-editor.org/info/rfc4253) — RFC 4253 status.
29. [https://datatracker.ietf.org/doc/html/rfc4254](https://datatracker.ietf.org/doc/html/rfc4254) — RFC 4254 Connection Protocol.
30. [https://www.ietf.org/rfc/rfc4254.txt](https://www.ietf.org/rfc/rfc4254.txt) — RFC 4254 (channel/window mechanics).
31. [https://datatracker.ietf.org/doc/html/rfc8709](https://datatracker.ietf.org/doc/html/rfc8709) — RFC 8709 Ed25519/Ed448 (Feb 2020).
32. [https://datatracker.ietf.org/doc/html/rfc9142](https://datatracker.ietf.org/doc/html/rfc9142) — RFC 9142 KEX recommendations (Jan 2022).
33. [https://www.cs.ru.nl/~erikpoll/papers/ssh.pdf](https://www.cs.ru.nl/~erikpoll/papers/ssh.pdf) — Erik Poll, "Rigorous specifications of the SSH Transport Layer" (overview of RFC 4250–4254 set).
34. [https://terrapin-attack.com/](https://terrapin-attack.com/) — Terrapin attack site (CVE-2023-48795).
35. [https://terrapin-attack.com/patches.html](https://terrapin-attack.com/patches.html) — Terrapin patches (libssh, OpenSSH 9.6, PuTTY 0.80, AsyncSSH 2.14.2, MINA SSHD 2.12.0).
36. [https://arxiv.org/pdf/2312.12422](https://arxiv.org/pdf/2312.12422) — Terrapin paper (Bäumer, Brinkmann, Schwenk).
37. [https://seclists.org/oss-sec/2023/q4/292](https://seclists.org/oss-sec/2023/q4/292) — Terrapin oss-sec disclosure.
38. [https://arxiv.org/pdf/2509.10895](https://arxiv.org/pdf/2509.10895) — *Finding SSH Strict Key Exchange Violations by State Learning* (2025).
39. [https://blog.qualys.com/vulnerabilities-threat-research/2024/07/01/regresshion-remote-unauthenticated-code-execution-vulnerability-in-openssh-server](https://blog.qualys.com/vulnerabilities-threat-research/2024/07/01/regresshion-remote-unauthenticated-code-execution-vulnerability-in-openssh-server) — regreSSHion (CVE-2024-6387) Qualys blog.
40. [https://www.qualys.com/regresshion-cve-2024-6387](https://www.qualys.com/regresshion-cve-2024-6387) — regreSSHion analysis page.
41. [https://www.cynet.com/blog/regresshion-cve-2024-6387-mitigating-the-critical-openssh-vulnerability/](https://www.cynet.com/blog/regresshion-cve-2024-6387-mitigating-the-critical-openssh-vulnerability/) — regreSSHion historical lineage (CVE-2006-5051 → 8.5p1 regression).
42. [https://www.splunk.com/en_us/blog/security/cve-2024-6387-regresshion-vulnerability.html](https://www.splunk.com/en_us/blog/security/cve-2024-6387-regresshion-vulnerability.html) — regreSSHion technical detail.
43. [https://www.armosec.io/blog/cve-2024-6387-regresshion-rce-vulnerability-openssh/](https://www.armosec.io/blog/cve-2024-6387-regresshion-rce-vulnerability-openssh/) — regreSSHion timing/exploitation analysis.
44. [https://en.wikipedia.org/wiki/XZ_Utils_backdoor](https://en.wikipedia.org/wiki/XZ_Utils_backdoor) — XZ Utils backdoor overview.
45. [https://blog.qualys.com/vulnerabilities-threat-research/2024/03/29/xz-utils-sshd-backdoor](https://blog.qualys.com/vulnerabilities-threat-research/2024/03/29/xz-utils-sshd-backdoor) — XZ disclosure summary.
46. [https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27](https://gist.github.com/thesamesam/223949d5a074ebc3dce9ee78baad9e27) — Sam James' canonical XZ situation gist.
47. [https://www.akamai.com/blog/security-research/critical-linux-backdoor-xz-utils-discovered-what-to-know](https://www.akamai.com/blog/security-research/critical-linux-backdoor-xz-utils-discovered-what-to-know) — Akamai XZ analysis.
48. [https://jfrog.com/blog/xz-backdoor-attack-cve-2024-3094-all-you-need-to-know/](https://jfrog.com/blog/xz-backdoor-attack-cve-2024-3094-all-you-need-to-know/) — JFrog XZ analysis (timeline, payload).
49. [https://www.wiz.io/blog/cve-2024-3094-critical-rce-vulnerability-found-in-xz-utils](https://www.wiz.io/blog/cve-2024-3094-critical-rce-vulnerability-found-in-xz-utils) — Wiz XZ analysis.
50. [https://securitylabs.datadoghq.com/articles/xz-backdoor-cve-2024-3094/](https://securitylabs.datadoghq.com/articles/xz-backdoor-cve-2024-3094/) — Datadog XZ writeup.
51. [https://www.redhat.com/en/blog/understanding-red-hats-response-xz-security-incident](https://www.redhat.com/en/blog/understanding-red-hats-response-xz-security-incident) — Red Hat's behind-the-scenes XZ response.
52. [https://pentest-tools.com/blog/xz-utils-backdoor-cve-2024-3094](https://pentest-tools.com/blog/xz-utils-backdoor-cve-2024-3094) — XZ technical detail.
53. [https://www.coresecurity.com/core-labs/advisories/ssh1-crc-32-compensation-attack-detector-vulnerability](https://www.coresecurity.com/core-labs/advisories/ssh1-crc-32-compensation-attack-detector-vulnerability) — Core SDI 2001 SSH-1 CRC32 advisory.
54. [https://static.lwn.net/2001/1115/a/ssh-exploit.php3](https://static.lwn.net/2001/1115/a/ssh-exploit.php3) — Dave Dittrich's analysis of CRC32 exploit.
55. [https://blog.doyensec.com/2025/02/27/exploitable-sshd.html](https://blog.doyensec.com/2025/02/27/exploitable-sshd.html) — modern retrospective on the 1998 CRC32 issue and 2001 exploit.
56. [https://www.debian.org/security/2008/dsa-1571](https://www.debian.org/security/2008/dsa-1571) — DSA-1571-1 OpenSSL Debian PRNG fix (CVE-2008-0166).
57. [https://www.debian.org/security/2008/dsa-1576](https://www.debian.org/security/2008/dsa-1576) — DSA-1576-1 OpenSSH Debian re-key advisory.
58. [https://www.cvedetails.com/cve/CVE-2008-0166/](https://www.cvedetails.com/cve/CVE-2008-0166/) — CVE record.
59. [https://www.finnie.org/2024/05/13/i-discovered-the-debian-openssl-bug/](https://www.finnie.org/2024/05/13/i-discovered-the-debian-openssl-bug/) — first-person retrospective on Debian PRNG bug.
60. [https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/heninger](https://www.usenix.org/conference/usenixsecurity12/technical-sessions/presentation/heninger) — Heninger et al. "Mining Your Ps and Qs."
61. [https://factorable.net/weakkeys12.extended.pdf](https://factorable.net/weakkeys12.extended.pdf) — extended paper.
62. [https://github.blog/news-insights/company-news/we-updated-our-rsa-ssh-host-key/](https://github.blog/news-insights/company-news/we-updated-our-rsa-ssh-host-key/) — GitHub RSA host-key rotation announcement (March 2023).
63. [https://www.bleepingcomputer.com/news/security/githubcom-rotates-its-exposed-private-ssh-key/](https://www.bleepingcomputer.com/news/security/githubcom-rotates-its-exposed-private-ssh-key/) — GitHub incident reporting.
64. [https://thehackernews.com/2023/03/github-swiftly-replaces-exposed-rsa-ssh.html](https://thehackernews.com/2023/03/github-swiftly-replaces-exposed-rsa-ssh.html) — incident coverage.
65. [https://www.linux.com/news/story-getting-ssh-port-22/](https://www.linux.com/news/story-getting-ssh-port-22/) — Tatu Ylönen on port-22 assignment.
66. [https://www.nextofwindows.com/the-story-of-how-ssh-got-the-port-number-22](https://www.nextofwindows.com/the-story-of-how-ssh-got-the-port-number-22) — port 22 history.
67. [https://blog.apnic.net/2024/05/03/how-ssh-got-to-be-on-port-22/](https://blog.apnic.net/2024/05/03/how-ssh-got-to-be-on-port-22/) — APNIC retrospective.
68. [https://en.wikipedia.org/wiki/Secure_Shell](https://en.wikipedia.org/wiki/Secure_Shell) — SSH overview.
69. [https://en.wikipedia.org/wiki/OpenSSH](https://en.wikipedia.org/wiki/OpenSSH) — OpenSSH overview.
70. [https://en.wikibooks.org/wiki/OpenSSH/Overview](https://en.wikibooks.org/wiki/OpenSSH/Overview) — Wikibooks history (trademarks, fork details).
71. [https://www.openbsd.org/innovations.html](https://www.openbsd.org/innovations.html) — OpenBSD innovations including OpenSSH origins.
72. [https://en.wikipedia.org/wiki/Theo_de_Raadt](https://en.wikipedia.org/wiki/Theo_de_Raadt) — Theo de Raadt biography.
73. [https://www.openssh.com/donations.html](https://www.openssh.com/donations.html) — OpenSSH funding.
74. [https://www.usenix.org/conference/atc12/technical-sessions/presentation/winstein](https://www.usenix.org/conference/atc12/technical-sessions/presentation/winstein) — Mosh paper (Winstein & Balakrishnan, USENIX ATC 2012).
75. [https://mosh.org/](https://mosh.org/) — Mosh project.
76. [https://web.mit.edu/keithw/www/Winstein-Balakrishnan-Mosh.pdf](https://web.mit.edu/keithw/www/Winstein-Balakrishnan-Mosh.pdf) — Mosh paper PDF.
77. [https://arxiv.org/abs/2312.08396](https://arxiv.org/abs/2312.08396) — SSH3 paper.
78. [https://github.com/francoismichel/ssh3](https://github.com/francoismichel/ssh3) — SSH3 implementation.
79. [https://blog.apnic.net/2024/02/02/towards-ssh3-how-http-3-improves-secure-shells/](https://blog.apnic.net/2024/02/02/towards-ssh3-how-http-3-improves-secure-shells/) — APNIC SSH3 explainer.
80. [https://datatracker.ietf.org/meeting/119/materials/slides-119-alldispatch-towards-ssh3-secure-shell-over-http3-connections-00](https://datatracker.ietf.org/meeting/119/materials/slides-119-alldispatch-towards-ssh3-secure-shell-over-http3-connections-00) — IETF SSH3 slides.
81. [https://goteleport.com/blog/sftp/](https://goteleport.com/blog/sftp/) — Teleport on SCP vs SFTP.
82. [https://www.redhat.com/en/blog/openssh-scp-deprecation-rhel-9-what-you-need-know](https://www.redhat.com/en/blog/openssh-scp-deprecation-rhel-9-what-you-need-know) — RHEL 9 SCP deprecation.
83. [https://wiki.archlinux.org/title/SCP_and_SFTP](https://wiki.archlinux.org/title/SCP_and_SFTP) — Arch wiki on SCP/SFTP defaults.
84. [https://en.wikipedia.org/wiki/ChaCha20-Poly1305](https://en.wikipedia.org/wiki/ChaCha20-Poly1305) — ChaCha20-Poly1305 overview.
85. [https://ashvardanian.com/posts/chacha-vs-aes-2025/](https://ashvardanian.com/posts/chacha-vs-aes-2025/) — 2025 AES-GCM vs ChaCha20-Poly1305 benchmarks.
86. [https://www.newsoftwares.net/blog/stream-vs-block-where-chacha20-poly1305-beats-aes-gcm/](https://www.newsoftwares.net/blog/stream-vs-block-where-chacha20-poly1305-beats-aes-gcm/) — comparison overview.
87. [https://devops.aibit.im/article/benchmarking-ssh-ciphers-fastest-encryption](https://devops.aibit.im/article/benchmarking-ssh-ciphers-fastest-encryption) — SSH cipher benchmarking practical guide.
88. [https://www.dirk-loss.de/sshvis/drunken_bishop.pdf](https://www.dirk-loss.de/sshvis/drunken_bishop.pdf) — Loss/Limmer/von Gernler "Drunken Bishop" paper.
89. [https://tylercipriani.com/blog/2017/09/26/ssh-key-fingerprints-identicons-and-ascii-art/](https://tylercipriani.com/blog/2017/09/26/ssh-key-fingerprints-identicons-and-ascii-art/) — randomart explainer.
90. [https://diploi.com/blog/what_is_ssh_randomart_for](https://diploi.com/blog/what_is_ssh_randomart_for) — randomart explainer.
91. [https://pthree.org/2013/05/30/openssh-keys-and-the-drunken-bishop/](https://pthree.org/2013/05/30/openssh-keys-and-the-drunken-bishop/) — Aaron Toponce on randomart.
92. [https://infosec.mozilla.org/guidelines/openssh](https://infosec.mozilla.org/guidelines/openssh) — Mozilla OpenSSH hardening guidelines.
93. [https://wiki.mozilla.org/Security/Guidelines/OpenSSH](https://wiki.mozilla.org/Security/Guidelines/OpenSSH) — Mozilla wiki version.
94. [https://github.com/jtesta/ssh-audit](https://github.com/jtesta/ssh-audit) — ssh-audit by Joe Testa.
95. [https://github.com/jtesta/ssh-audit/releases/tag/v3.1.0](https://github.com/jtesta/ssh-audit/releases/tag/v3.1.0) — ssh-audit Terrapin support.
96. [https://sshaudit.online/](https://sshaudit.online/) — hosted ssh-audit.
97. [https://tailscale.com/blog/tailscale-ssh-ga](https://tailscale.com/blog/tailscale-ssh-ga) — Tailscale SSH GA.
98. [https://tailscale.com/use-cases/zero-trust-networking](https://tailscale.com/use-cases/zero-trust-networking) — Tailscale zero-trust architecture.
99. [https://blog.cloudflare.com/intro-access-for-infrastructure-ssh/](https://blog.cloudflare.com/intro-access-for-infrastructure-ssh/) — Cloudflare Access for Infrastructure SSH.
100. [https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/ssh/](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/ssh/) — Cloudflare SSH product docs.
101. [https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/ssh/ssh-infrastructure-access/](https://developers.cloudflare.com/cloudflare-one/networks/connectors/cloudflare-tunnel/use-cases/ssh/ssh-infrastructure-access/) — Cloudflare SSH with infrastructure access.
102. [https://smallstep.com/blog/use-ssh-certificates/](https://smallstep.com/blog/use-ssh-certificates/) — smallstep SSH certificates rationale.
103. [https://smallstep.com/blog/diy-single-sign-on-for-ssh/](https://smallstep.com/blog/diy-single-sign-on-for-ssh/) — smallstep DIY SSO.
104. [https://smallstep.com/blog/clever-uses-of-ssh-certificate-templates/](https://smallstep.com/blog/clever-uses-of-ssh-certificate-templates/) — smallstep cert templates.
105. [https://smallstep.com/docs/ssh/how-it-works/](https://smallstep.com/docs/ssh/how-it-works/) — smallstep SSH how-it-works.
106. [https://github.com/smallstep/certificates](https://github.com/smallstep/certificates) — step-ca repo.
107. [https://www.openssh.org/txt/release-9.0](https://www.openssh.org/txt/release-9.0) — OpenSSH 9.0 release notes (sntrup761x25519, scp→sftp).
108. [https://developers.yubico.com/SSH/Securing_SSH_with_FIDO2.html](https://developers.yubico.com/SSH/Securing_SSH_with_FIDO2.html) — Yubico FIDO2 SSH guide.
109. [https://korg.docs.kernel.org/fido2.html](https://korg.docs.kernel.org/fido2.html) — kernel.org's 2-factor SSH guide.
110. [https://words.filippo.io/](https://words.filippo.io/) — Filippo Valsorda's blog (Ed25519/X25519, SSH crypto context).
111. [https://blog.gitguardian.com/github-exposed-private-ssh-key/](https://blog.gitguardian.com/github-exposed-private-ssh-key/) — GitHub key incident analysis.
112. [https://www.bankinfosecurity.com/github-replaces-private-rsa-ssh-key-after-public-exposure-a-21516](https://www.bankinfosecurity.com/github-replaces-private-rsa-ssh-key-after-public-exposure-a-21516) — GitHub incident reporting.
113. [https://www.amazon.com/SSH-Mastery-OpenSSH-PuTTY-Tunnels/dp/1642350028](https://www.amazon.com/SSH-Mastery-OpenSSH-PuTTY-Tunnels/dp/1642350028) — *SSH Mastery* 2nd ed by Michael W Lucas.
114. [https://mwl.io/archives/24012](https://mwl.io/archives/24012) — Lucas: SSH Mastery direct print sales (March 2025).
115. [https://www.qualys.com/2024/07/01/cve-2024-6387/regresshion.txt](https://www.qualys.com/2024/07/01/cve-2024-6387/regresshion.txt) — Qualys regreSSHion advisory.
116. [https://lists.mindrot.org/pipermail/openssh-unix-dev/2024-August/041534.html](https://lists.mindrot.org/pipermail/openssh-unix-dev/2024-August/041534.html) — sshm WG forming announcement to OpenSSH list.
117. [https://datatracker.ietf.org/iesg/decisions/](https://datatracker.ietf.org/iesg/decisions/) — IESG decisions list (sshm document approvals).
118. [https://www.celestialsoftware.net/terrapin/](https://www.celestialsoftware.net/terrapin/) — strict KEX adoption.
119. [https://github.com/twisted/twisted/issues/12057](https://github.com/twisted/twisted/issues/12057) — strict KEX in twisted (description of the mitigation mechanic).
120. [https://www.baeldung.com/linux/terrapin-ssh-attack-mitigate](https://www.baeldung.com/linux/terrapin-ssh-attack-mitigate) — Terrapin mitigation guide.

*(Where a fact is marked `[needs source]` above, it indicates I could not locate a primary verifiable URL within the research budget for this report. Treat those as plausible but unverified and seek primary confirmation before publication.)*