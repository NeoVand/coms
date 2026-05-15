---
id: wireless-tap-to-pay
type: journey
title: Tap to Pay — what happens in the 300 ms after you touch the terminal
scope: wireless
podcast_target_minutes: 15
step_count: 6
protocols_in_order: [nfc, nfc, nfc, nfc, cellular, tls]
related_protocols: [nfc, cellular, tls, ipsec, ipv4]
related_book_chapters: []
visual_cues:
  - "Six-node graph lighting up in sequence: NFC field-on, NFC anti-collision, NFC PPSE select, NFC cryptogram, cellular backhaul, TLS to issuer — with a single 300 ms wall-clock timeline underneath"
  - "Cross-section of phone-on-terminal showing the 13.56 MHz magnetic field coupling at ~4 cm, with the eSE drawing microwatts directly from the field"
  - "Stacked layer diagram of one tap: ISO 14443-3 framing at the bottom, then ISO 14443-4 blocks, then ISO 7816-4 APDUs, then the EMV cryptogram payload at the top"
  - "World-spanning chain: phone to terminal to gNB to UPF over IPsec, terminal-to-acquirer over TLS, acquirer through Mastercard or Visa to issuer HSM, ARPC returning the same way"
  - "300 to 800 ms wall-clock timeline from tap to green beep, with the NFC airtime slice (under half a second) shown next to the cellular and TLS slices"
---

# Tap to Pay — what happens in the 300 ms after you touch the terminal

## In one breath
A contactless EMV payment is the most-deployed cryptographic protocol on
Earth, and it runs end-to-end in under a second. This journey follows
one tap from the moment the phone harvests power out of the terminal's
magnetic field, through the EMV cryptogram, across the cellular core,
and back from the issuer bank's HSM with an APPROVED.

## The hook (cold-open)
You tap your phone on a terminal. Half a second later it beeps green.
In that window, six different protocols cooperated, in a strict order,
across maybe ten thousand kilometres of network. The phone drew power
out of thin air. A secure element minted a one-shot cryptogram a bank
on the other side of the world will recognise. A cellular backhaul,
itself wrapped in IPsec, carried that cryptogram to the acquirer over
TLS. We're going to walk all six steps, one protocol at a time, in the
order the tap actually happened.

## The journey

### Step 1 — Field on, phone harvests power inductively (NFC)
The terminal's antenna is radiating a 13.56 MHz magnetic field
continuously, all day, whether anyone is paying or not. When you bring
your phone within about 4 cm, the phone's NFC controller and embedded
Secure Element — the eSE — harvest microwatts directly out of that
field. The secure element doesn't need to draw on the phone's battery;
inductive coupling powers it from the terminal itself. That's also why
NFC's range is so short: the field falls off as one over r cubed, so
ten centimetres of working distance isn't a limitation, it's a security
feature. The biometric release, your Face ID or Touch ID, had to happen
just before this point — by the time the field couples, the eSE applet
is armed and waiting. The full mechanism of how 13.56 MHz coupling and
the eSE work is in the NFC episode; here we just need to know the
phone is now powered and listening.

The phone is awake in the field. The terminal still doesn't know what
kind of card it's looking at, or even whether there's one card or two
in range. ISO 14443 has a tight little anti-collision sequence that
sorts that out in under twenty milliseconds.

### Step 2 — Anti-collision and RATS, negotiate framing (NFC)
The terminal sends a short seven-bit probe — REQA, hex 0x26 — and the
eSE replies with ATQA, declaring that it has a four-byte UID and
supports standard anti-collision. The terminal then runs the bit-frame
loop, walking SEL 0x93 and NVB values, converging on a single UID and
ending in a SAK byte of 0x28. That bit 6 set in the SAK is the eSE
saying I speak ISO 14443-4. The terminal sends a RATS request, the eSE
replies with an ATS that declares its frame-size budget — FSCI of 5,
meaning 64 bytes per frame. Both ends now know exactly how to packetise
the EMV exchange that's about to happen. The deeper details of the
14443 family, REQA, ATQA, SEL, SAK, all the framing — that's all in
the NFC episode. For this journey, the takeaway is simple: framing is
agreed, the radio link is up.

With ISO 14443-4 framing in place, the terminal switches into ISO
7816-4 APDU mode and asks the canonical EMV opening question: which
payment networks do you support?

### Step 3 — SELECT PPSE then SELECT AID, enumerate payment apps (NFC)
The terminal sends a SELECT command for a magic application identifier
called 2PAY.SYS.DDF01 — the Proximity Payment System Environment, or
PPSE. Think of it as the directory of payment apps the eSE is willing
to expose. The eSE answers with an FCI Template listing every payment
network it supports, in priority order — Mastercard at AID
A0000000041010, Visa at A0000000031010, and so on. The terminal picks
the highest-priority entry and SELECTs it directly. The card responds
with a PDOL, the Processing Options Data Object List — basically a
shopping list of EMV tags the card needs filled in to compute the
cryptogram. Amount, currency, country, terminal type, and a fresh
Unpredictable Number. The full PPSE-then-AID dance is in the NFC
episode; here, what matters is that the card has chosen its network and
told the terminal exactly what data to feed it next.

The card now knows what payment network it's on; the terminal knows
what data the card wants. Time to bind this specific transaction —
amount, currency, a fresh random nonce — and ask the secure element to
sign it.

### Step 4 — GENERATE AC, the cryptogram (NFC)
After GET PROCESSING OPTIONS comes back with the AIP and AFL, and a
quick volley of READ RECORD commands pulls the DPAN, the expiry, and
the certificate chain off the card, the terminal sends the request the
whole tap is built around: GENERATE AC, hex 80 AE 80 00, with the CDOL1
data filled in. Inside the eSE, the applet composes the inputs —
amount, currency, country, the Terminal Verification Results, the
Application Transaction Counter, that Unpredictable Number, the AIP —
and runs the lot through an AES-MAC under the per-DPAN key. Out comes
the Application Cryptogram, the ARQC. The Application Transaction
Counter has already incremented by one, so even an identical tap a
moment later would produce a different cryptogram. Without the eSE's
key, the ARQC is unforgeable. The deep mechanism — DPAN tokenisation,
ARQC composition, ATC anti-replay — is all in the NFC episode and the
EMV chapters. For this journey, what matters is what the terminal is
holding: a one-shot, transaction-bound cryptogram that only the issuer
bank can verify.

The cryptogram is in the terminal's hand. But the eSE has no internet
connection of its own — it can't authorise this transaction itself.
The terminal has to get the ARQC out of the radio link and onto the
carrier network, headed for the issuer bank.

### Step 5 — Backhaul over LTE or 5G to the acquirer (cellular)
Modern wireless POS terminals — Square, Stripe, Verifone Engage — send
the ARQC to the acquirer over a cellular data connection. LTE Cat-1 in
most of the field today, 5G NR where it's available in 2026. The
terminal opens a TLS connection out to the acquirer's API endpoint and
posts a JSON body containing the cryptogram and the transaction
details. Underneath, the carrier's core wraps the IP traffic in GTP-U
running over IPsec ESP between the gNB — the cell tower — and the UPF,
the user-plane function deep in the carrier core. Per 3GPP TS 33.501,
every backhaul hop is IPsec-wrapped, which makes the cellular core
quietly the largest enterprise IPsec deployment on Earth. The full
story of how the 3GPP radio family gets a phone an IP address from a
base station fifty kilometres away is in the cellular episode, and the
mechanics of GTP-U-over-IPsec are in the IPsec episode. For this
journey, hold on to the picture: the cryptogram leaves the terminal,
crosses the radio, traverses the carrier's encrypted backbone, and
arrives at the acquirer.

The cryptogram reaches the acquirer; the acquirer routes it through
the payment network — Mastercard or Visa — to the issuing bank's HSM,
where the actual decision gets made.

### Step 6 — Issuer verification and ARPC return (TLS)
The issuer bank's HSM decrypts the cryptogram inputs using the
per-DPAN key it minted at tokenisation time, re-derives the ARQC, and
compares. Match, plus sufficient balance, plus no fraud flag, equals
APPROVED. The issuer then sends back its own one-shot cryptogram —
the ARPC, the Authorisation Response Cryptogram — over its own
TLS-protected connection, back through the payment network to the
acquirer, and from the acquirer back over cellular to the terminal in
your hand. The full mechanism of TLS — certificates, the handshake,
session keys — is in the TLS episode. The number worth holding on to is
the wall-clock total: typically 300 to 800 milliseconds, round trip,
phone to issuer and back. The terminal beeps green. Your phone vibrates
with the success animation. Total NFC airtime in the field was less
than half a second — but the cryptographic chain just stretched from
the eSE in your phone, through IPsec inside the carrier, across TLS to
the bank, and back.

## What the listener now understands
A tap-to-pay is the layered stack at full stretch. NFC doesn't know
anything about banks or TLS. The eSE doesn't know there's a cellular
network involved. The cellular core doesn't know it's carrying a
payment cryptogram — it just sees IPsec-wrapped IP. TLS doesn't know
what's inside the JSON body it's encrypting. Each layer minds its own
concern and trusts the others to mind theirs. The result is the
most-deployed cryptographic protocol on Earth, running unforgeably,
end-to-end, in less time than it takes to blink twice.

## Where this connects in the book
- The chapter on the Wireless Family sets the stage for why a 13.56 MHz
  inductive link sits next to a 5G radio in the same story — they are
  both wireless, but they are solving very different problems at very
  different scales.
- The NFC chapter goes deep on inductive coupling, the eSE, the ISO
  14443 family, and the EMV exchange that produces the ARQC — the four
  steps of this journey that all live on the radio link.
- The cellular chapter unpacks how the 3GPP radio family hands a phone
  an IP address from a base station kilometres away, and where IPsec
  fits inside the carrier core.
- The TLS chapter covers certificates, the handshake, and session
  keys — the encryption that protects the cryptogram on its trip from
  the terminal to the issuer and back.

## See also (other journeys and protocol episodes)

- For another tap-driven story that lives on the same NFC radio but
  ends in a very different place, the Phone as Key journey is the
  obvious next listen — same 13.56 MHz field, same secure element,
  but the destination is a car door instead of a bank.

- The Wireless Hue Bulb journey takes the opposite tack: instead of
  one tap that touches half the planet, it shows how a constellation
  of low-power radios cooperate locally to turn a light on. It's a
  good counterweight to the global reach of the payments chain.

- If the secure-element and cryptogram parts felt like the most
  magical step, the NFC episode is where to go next — it covers the
  eSE, the EMV cryptogram, and why the magnetic-field range of ten
  centimetres is doing real security work.

- The cellular episode and the TLS episode together explain the back
  half of this journey: how the cryptogram actually moves from the
  terminal across the carrier core to the issuer bank, and how it
  stays confidential the whole way.

## Visual cues for image generation

- Six-node graph lighting up in sequence: NFC field-on, NFC
  anti-collision, NFC PPSE select, NFC cryptogram, cellular backhaul,
  TLS to issuer — with a single 300 ms wall-clock timeline underneath.
- Cross-section of phone-on-terminal showing the 13.56 MHz magnetic
  field coupling at about 4 cm, with the eSE drawing microwatts
  directly from the field.
- Stacked layer diagram of one tap: ISO 14443-3 framing at the bottom,
  then ISO 14443-4 blocks, then ISO 7816-4 APDUs, then the EMV
  cryptogram payload at the top.
- World-spanning chain: phone to terminal to gNB to UPF over IPsec,
  terminal-to-acquirer over TLS, acquirer through Mastercard or Visa
  to the issuer's HSM, ARPC returning the same way.
- A 300 to 800 ms wall-clock timeline from tap to green beep, with
  the NFC airtime slice — under half a second — shown next to the
  cellular and TLS slices.
