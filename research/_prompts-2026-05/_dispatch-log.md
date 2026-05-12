# Deep Research Dispatch Log — 2026-05-12

16 protocol prompts in flight via Claude.ai Research.
Up to 5 concurrent.

## Batch 1 (in progress — dispatched 2026-05-12)

| # | Protocol | Prompt file | Chat URL | Tab |
|---|----------|-------------|----------|-----|
| 01 | Bluetooth/BLE | 01-bluetooth-ble.md | https://claude.ai/chat/94860458-6595-48d0-8861-92471768ae3c | 882617707 |
| 02 | NAT-traversal (STUN/TURN/ICE) | 02-nat-traversal.md | https://claude.ai/chat/78cd7041-e7e5-4a74-920c-fcff57150c53 | 882617710 |
| 03 | IPsec | 03-ipsec.md | https://claude.ai/chat/f1581c82-088e-4c89-a8fd-dd5ad92fa7de | 882617713 |
| 04 | WireGuard | 04-wireguard.md | https://claude.ai/chat/7987f72a-5778-40eb-87e2-c476ad477b76 | 882617716 |
| 05 | OSPF | 05-ospf.md | https://claude.ai/chat/f463f51b-2b3b-4459-a99a-7b0cc8bacb85 | 882617719 |

## Batch 2 (queued)

| # | Protocol | Prompt file | Chat URL | Status |
|---|----------|-------------|----------|--------|
| 06 | mDNS / DNS-SD | 06-mdns-dns-sd.md | _queued_ | _queued_ |
| 07 | Kerberos | 07-kerberos.md | _queued_ | _queued_ |
| 08 | OIDC | 08-oidc.md | _queued_ | _queued_ |
| 09 | ACME | 09-acme.md | _queued_ | _queued_ |
| 10 | Email-auth (DKIM/SPF/DMARC) | 10-email-auth.md | _queued_ | _queued_ |

## Batch 3 (queued)

| # | Protocol | Prompt file | Chat URL | Status |
|---|----------|-------------|----------|--------|
| 11 | SAML | 11-saml.md | _queued_ | _queued_ |
| 12 | LDAP | 12-ldap.md | _queued_ | _queued_ |
| 13 | SNMP | 13-snmp.md | _queued_ | _queued_ |
| 14 | Matter + Thread | 14-matter-thread.md | _queued_ | _queued_ |
| 15 | DTLS | 15-dtls.md | _queued_ | _queued_ |
| 16 | PTP | 16-ptp.md | _queued_ | _queued_ |

## Dispatch playbook (lessons learned)

Claude.ai's `+` menu opens transiently and the a11y tree often misses it
between click and `find`. The reliable flow is:

1. `navigate` to https://claude.ai/new, wait 3-4s for full load.
2. `find` the `+` button (label "Add files, connectors, and more").
3. Use **JavaScript** to click `+` AND click "Research" menuitem in one
   call — DOM polling for 50ms × 40 iterations. (Coordinate-based clicks
   on the menu items keep hitting "Add connectors" because positions
   shift between renders.) Script:
   ```js
   (async () => {
     document.querySelector('button[aria-label="Add files, connectors, and more"]').click();
     for (let i = 0; i < 40; i++) {
       await new Promise(r => setTimeout(r, 50));
       const r = [...document.querySelectorAll('[role="menuitemcheckbox"]')].find(e => e.textContent.trim() === 'Research');
       if (r) { r.click(); return; }
     }
   })()
   ```
4. `Escape` to close the menu (just in case it stays open).
5. `find` textbox, click into it, `cmd+v` to paste, wait 3s, type intro.
6. `find` Send button, click.
7. Confirm URL changed from `/new` to `/chat/<id>` and save.

Long pastes (>~10K chars) become a "PASTED" attachment chip rather than
inline text — that's fine, Claude reads it the same way.
