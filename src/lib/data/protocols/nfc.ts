import type { Protocol } from '../types';

export const nfc: Protocol = {
	id: 'nfc',
	name: 'Near Field Communication',
	abbreviation: 'NFC',
	categoryId: 'wireless',
	port: undefined,
	year: 2003,
	rfc: 'ISO/IEC 18092 (ECMA-340)',
	oneLiner:
		'13.56 MHz inductively-coupled short-range (≤10 cm) protocol family for payments, {{transit|transit}}, identity, access, and tap-to-pair commissioning.',
	overview: `[[nfc|NFC]] is the umbrella name for a tightly defined family of contactless protocols operating in the 13.56 MHz {{ism-band|ISM}} band over {{inductive-coupling|inductive coupling}} at typically ≤10 cm — extended to a 20 mm operating volume in **NFC Forum Release 15** (June 2025). It encompasses {{iso-iec|ISO/IEC}} 14443 Type A/B (proximity), {{iso-iec|ISO/IEC}} 15693 (vicinity, ~1 m), and JIS X 6319-4 FeliCa (Type F — the parallel Asian {{transit|transit}} standard), unified by {{iso-iec|ISO/IEC}} 18092 (NFCIP-1, 2003/2013) and {{iso-iec|ISO/IEC}} 21481 (NFCIP-2, 2012). The **NFC Forum** (founded 2004 by Sony, Philips, and Nokia) adds the application layer: {{ndef|NDEF}} data format, Tag Types T2T–T5T (T1T retired 2021), {{llcp|LLCP}}/{{snep|SNEP}} {{peer-to-peer|peer-to-peer}} (deprecated in practice), Connection Handover to [[bluetooth|Bluetooth]]/[[wifi|Wi-Fi]], NCI for host-controller interface, and NFC Wireless Charging (WLC, up to 1 W).

[[nfc|NFC]] supports **four operating modes**: *Reader/Writer* (phone reads a passive tag), *Card Emulation* (phone presents itself as a card via {{ese|Secure Element}} on {{apple|Apple}} Pay or via {{hce|Host Card Emulation}} on {{android|Android}} 4.4+ / iOS 17.4+ EEA), *{{peer-to-peer|Peer-to-Peer}}* (largely deprecated), and *Wireless Charging* (added 2020). On top of NFC's transport sit several full vertical stacks: {{iso7816|ISO/IEC 7816}}-4 {{apdu|APDUs}} and **EMVCo Contactless** Books C-1 through C-7 + Book E (cards and payments); **{{icao|ICAO}} Doc 9303 Part 11** BAC/PACE (e-passports); {{ccc-digital-key|CCC Digital Key}} (vehicles); {{aliro|Aliro 1.0}} (access control, finalised Feb 2026); NFC Forum WLC (wireless charging); and {{matter|Matter}} 1.3+ NFC commissioning.

The hinge of the modern story is **9 September 2014**, when Tim Cook announced {{apple|Apple}} Pay at Flint Center, Cupertino — three pillars: NFC, {{ese|embedded Secure Element}}, and Touch {{id-identifier|ID}}, all built atop EMVCo Payment Tokenisation so the real {{pan-id|PAN}} never leaves the card issuer. The protocol that runs the British contactless economy was published in 2000; the protocol your phone uses to pay your barista was published as {{iso18092|ISO/IEC 18092}} in December 2003 — three years before the iPhone existed. NFC is rare among software stacks in that **the wire format has not changed in 20 years** — every iteration has been at the certification, security, and application-layer level. [[wifi|Wi-Fi]] is the protocol you stream from; [[bluetooth|Bluetooth]] is the protocol you carry with you; [[nfc|NFC]] is the protocol you tap with.`,
	howItWorks: [
		{
			title: '13.56 MHz inductive coupling in the ISM band',
			description:
				'All NFC variants operate at a carrier of 13.56 MHz ± 7 kHz, the unlicensed {{ism-band|ISM}} allocation that is the legacy of {{iso|ISO}} 14443. Coupling is *inductive* (magnetic) between two loop antennas — the magnetic field falls off as 1/r³, vs 1/r² for far-field radiative coupling. Effective range is ≤10 cm for {{iso|ISO}} 14443 (NFC-A/B/F) and historically ≤1 m for {{iso|ISO}} 15693 ({{nfc-v|NFC-V}}). The {{pcd|PCD}} (Proximity Coupling Device — the reader) energises its loop antenna; the passive {{picc|PICC}} (Proximity Integrated Circuit Card) harvests power from the field and communicates back via {{load-modulation|load modulation}} — switching a resistor on its own antenna at an 847.5 kHz subcarrier (13.56 MHz/16), perceived by the reader as small amplitude/phase changes in its own resonant loop. Modern phones use *active {{load-modulation|load modulation}}* (ALM) instead, generating a small reflected carrier — which is why an iPhone can be read across a metal-backed case where a plain plastic card cannot.'
		},
		{
			title: 'Three flavours of NFC on the air',
			description:
				'**NFC-A** ({{iso|ISO}} 14443-A): {{pcd|PCD}}→{{picc|PICC}} is 100 % {{ask-modulation|ASK}} modified-Miller; {{picc|PICC}}→{{pcd|PCD}} is OOK Manchester on the 847.5 kHz subcarrier. Base rate 106 kbit/s, scaling to 848. This is what {{mifare|MIFARE}}, {{emv-cryptogram|EMV}} Mastercard, and most access cards use. **NFC-B** ({{iso|ISO}} 14443-B): {{pcd|PCD}}→{{picc|PICC}} is 10 % {{ask-modulation|ASK}} NRZ-L; {{picc|PICC}}→{{pcd|PCD}} is {{bpsk|BPSK}} on the subcarrier — used by some {{emv-cryptogram|EMV}} cards and many {{icao|ICAO}} e-passports. **{{nfc-f|NFC-F}}** (FeliCa / JIS X 6319-4): 212/424 kbit/s Manchester-coded ASK, *no subcarrier* — dominant in Japan {{transit|transit}} (Suica, PASMO) and Hong Kong Octopus, present on iPhones since the iPhone 7 (Sep 2016, Japan-only) and globally from iPhone 8. **{{nfc-v|NFC-V}}** ({{iso-iec|ISO/IEC}} 15693) is a fourth, longer-range vicinity-coupling mode at lower data rates — used in industrial tagging, library books, and the {{apple|Apple}} Vision Pro Light Seal NFC tag.'
		},
		{
			title: 'Anti-collision: REQA → ATQA → SEL/NVB → SAK',
			description:
				'When a {{picc|PICC}} enters the field it begins in {{imap-idle|IDLE}}. The reader broadcasts a 7-bit {{reqa|REQA}} (0x26) or WUPA (0x52) short frame; the card responds with **{{atqa|ATQA}}** (2 bytes) declaring its {{uid|UID}} size (4/7/10 bytes) and {{anti-collision|anti-collision}} support. The reader then runs the **bit-frame {{anti-collision|anti-collision}}** loop with {{sel-iso|SEL}}+NVB frames ({{sel-iso|SEL}}=0x93 for cascade level 1, 0x95 for CL2, 0x97 for CL3), converging on each byte of the {{uid|UID}} a bit at a time when multiple cards are in the field. When the {{uid|UID}} is complete the card answers with **{{sak|SAK}}**; if bit 6 of {{sak|SAK}} is set, the card supports {{iso|ISO}} 14443-4 and the reader proceeds with {{rats|RATS}}→{{ats-nfc|ATS}} to negotiate frame size (FSCI) and timing (FWI). T2T cards skip {{rats|RATS}} and go straight to T2T {{read-record|READ}} commands.'
		},
		{
			title: 'Card Emulation: SELECT PPSE → SELECT AID → GET PROCESSING OPTIONS → GENERATE AC',
			description:
				'For card-emulation mode ({{apple|Apple}} Pay, {{transit|transit}}, access), once 14443-4 is established the reader speaks **{{iso|ISO}} 7816-4 APDUs**: 4-byte header `CLA INS P1 P2` + optional command body. The first command is *{{imap-select|SELECT}} {{ppse|PPSE}}* — the Proximity Payment System Environment {{aid|AID}} `2PAY.SYS.DDF01` — and the card returns an FCI listing all supported {{aid|payment AIDs}} in priority order. The reader picks one (e.g. Mastercard `A0000000041010`), SELECTs it, gets back a {{pdol|PDOL}} listing parameters the card needs (amount, currency, country, terminal-type, unpredictable number), then sends *GET PROCESSING OPTIONS* with those parameters. The card returns AIP+{{afl|AFL}} telling the reader which files to read; {{read-record|READ}} RECORDs pull the {{pan-id|PAN}}, expiry, and public-key {{certificate-chain|certificate chain}}. Finally *{{generate-ac|GENERATE AC}}* with CDOL1 data asks the card for an {{emv-cryptogram|Application Cryptogram}} — either an {{arqc|ARQC}} (online) or TC (offline). The cryptogram is signed in the eSE/{{hce|HCE}} app and is what proves the transaction to the issuer.'
		},
		{
			title: 'NDEF: the data format for everything that is not a payment',
			description:
				'NFC Forum **{{ndef|NDEF}}** (NFC Data {{exchange|Exchange}} Format) is the binary record container that lives in tags and rides over {{llcp|LLCP}}/{{snep|SNEP}}. Each record begins with a 1-byte header — bits MB/ME (Message Begin/End), CF (Chunk Flag), SR (Short Record — 1-byte length vs 4), IL ({{id-identifier|ID}} Length present), and a 3-bit TNF (Type Name Format: 0=Empty, 1=Well-Known like `U` for {{uri|URI}} or `T` for Text, 2={{mime|MIME}} media, 3=Absolute {{uri|URI}}, 4=External, 5=Unknown). The {{uri|URI}} Well-Known record uses a single-byte prefix shorthand — 0x03 for `https://` saves 8 bytes per record on tags as small as 48 bytes. {{ndef|NDEF}} was formally adopted as an IEC standard in **March 2026** alongside NFC-WLC.'
		},
		{
			title: 'Three transports, one tap: Connection Handover to Bluetooth / Wi-Fi / Matter',
			description:
				'For higher-throughput sessions NFC is almost always a *bootstrap*. The **Connection Handover** spec (v1.5) defines {{ndef|NDEF}} records of TNF=0x02 with {{mime|MIME}} `application/vnd.bluetooth.le.oob` carrying the [[bluetooth|Bluetooth]] {{mac-address|MAC address}}, name, and Security Manager {{oob|OOB}} key — a single tap replaces a discovery/pairing dialog. The parallel Wi-Fi handover record carries {{ssid|SSID}}/key/security mode — used for tap-to-join on printers and some smart-plug commissioning. **{{matter|Matter}} 1.3+** adds NFC as one of the three permitted commissioning paths alongside QR and {{ble|BLE}}. **{{ccc-digital-key|CCC Digital Key}} 3.0/4.0** uses NFC to bootstrap a credential into a phone, then {{ble|BLE}} for proximity and [[uwb|UWB]] for centimetre-accurate ranging. {{aliro|Aliro}} 1.0 likewise spans NFC tap-to-access + {{ble|BLE}} proximity + {{ble|BLE}}/UWB ranged — three transports, one credential.'
		},
		{
			title: 'Tokenisation: why your real card number never leaves the bank',
			description:
				"The 2014 {{apple|Apple}} Pay launch did not just add an NFC chip to the iPhone — it baked **EMVCo Payment Tokenisation** into the architecture. The cardholder's real Funding {{pan-id|PAN}} (FPAN) is never stored on the device; instead the bank issues a **Device {{pan-id|PAN}} ({{dpan|DPAN}})** that is provisioned (via the Token Service Provider, typically Visa Token Service or Mastercard Digital Enablement Service) into the {{ese|embedded Secure Element}} or the {{hce|HCE}} keystore. Every tap generates a per-transaction cryptogram bound to the {{dpan|DPAN}}, the {{atc|ATC}} (Application Transaction Counter), and the Unpredictable Number from the terminal. A stolen {{dpan|DPAN}} is worthless without the keys in the {{se-secure-element|SE}}; a stolen cryptogram is worthless because the {{atc|ATC}} has already moved on. This is the reason {{apple|Apple}} Pay fraud rates are now broadly in line with card-not-present rates, despite the initial 2015 'yellow path' enrolment disaster."
		}
	],
	useCases: [
		'Contactless EMV payment — [[nfc|NFC]] tap at Apple Pay, Google Wallet, Samsung Pay, and every plastic contactless card on Earth',
		'Public-transit fare media — Suica, Octopus, ICOCA, TfL contactless (>2 billion taps/year on TfL alone)',
		'Electronic passports (ICAO Doc 9303) and ICAO Digital Travel Credentials — ~1 billion eMRTDs in circulation',
		'Corporate, hotel, residential, multi-family access — MIFARE DESFire and the new {{aliro|Aliro 1.0}} PKI standard',
		'Phone-as-key for vehicles — {{ccc-digital-key|CCC Digital Key 2/3/4}}, 115 vehicle/module products certified in 2025',
		'Tap-to-pair commissioning for [[bluetooth|Bluetooth]] / [[wifi|Wi-Fi]] / Matter devices',
		'Smart posters, NFC business cards, anti-counterfeiting authenticity tags (T2T NDEF)',
		'Low-power NFC Wireless Charging (WLC 2.0, up to 1 W) for hearing aids, smart rings, earbuds, styluses'
	],
	codeExample: {
		language: 'javascript',
		code: `// Web NFC — Chromium on Android only (no iOS, no desktop). Reads NDEF tags.
const reader = new NDEFReader();
await reader.scan();
reader.onreading = ({ message, serialNumber }) => {
  console.log('UID:', serialNumber);
  for (const record of message.records) {
    if (record.recordType === 'url') {
      const url = new TextDecoder().decode(record.data);
      console.log('URL:', url);
      // Phone OS hands off to the browser if you assign it
      window.location.href = url;
    } else if (record.recordType === 'text') {
      console.log('Text:', new TextDecoder(record.encoding).decode(record.data));
    } else if (record.recordType === 'mime') {
      console.log('MIME:', record.mediaType, record.data);
    }
  }
};
reader.onreadingerror = () => console.warn('cannot read — tag empty or unsupported');`,
		caption:
			"The Web NFC {{api|API}} exposes only {{ndef|NDEF}} read/write — no card emulation, no raw 14443 — and only on {{android|Android}} Chromium. {{apple|Apple}} has not implemented it. The {{handshake|handshake}} ({{reqa|REQA}} → {{atqa|ATQA}} → {{sel-iso|SEL}} → {{sak|SAK}} → {{rats|RATS}} → {{ats-nfc|ATS}} → {{read-record|READ}} {{ndef|NDEF}} {{tlv|TLV}}) happens inside the platform's NFC controller; the page sees only the {{ndef|NDEF}} abstraction.",
		alternatives: [
			{
				language: 'python',
				code: `# nfcpy — the canonical cross-platform Python NFC library. Works with PN532-based
# readers (ACR122U, SCL3711) over USB. The exact same code emulates a tag, reads
# a tag, or runs peer-to-peer LLCP — depending on the protocol selected.
import nfc

def on_connect(tag):
    print('Tag:', tag)
    print('UID:', tag.identifier.hex())
    print('Tech:', type(tag).__name__)  # Type2Tag, Type4Tag, ...

    if tag.ndef:
        print(f'NDEF capacity: {tag.ndef.capacity} bytes, locked: {tag.ndef.is_locked}')
        for i, record in enumerate(tag.ndef.records):
            print(f'  record[{i}]: type={record.type!r}', record.data)
    else:
        print('No NDEF; raw bytes available via tag.read()')
    return True

with nfc.ContactlessFrontend('usb') as clf:
    print('Reader:', clf.device)
    clf.connect(rdwr={'on-connect': on_connect})  # blocks until a tag is tapped`
			},
			{
				language: 'cli',
				code: `# libnfc — userland NFC reader/writer stack. Most readers (ACR122U, PN532) are
# supported; \`libnfc.conf\` lists devices and transports.
nfc-list                                  # enumerate NFC reader devices and any visible tags
nfc-poll                                  # continuously poll, single-tag mode
nfc-mfultralight r dump.bin               # dump a Type 2 (MIFARE Ultralight / NTAG) tag

# Proxmark3 (Iceman/RRG firmware) — the deepest tool. Type A/B/V/F at HF + LF;
# sniff, emulate, replay, simulate, crack, brute, dictionary.
proxmark3 /dev/ttyACM0
> hf 14a info                             # identify a Type A tag — ATQA, UID, SAK, ATS
> hf 14a sniff                            # capture reader↔tag exchange (24 hours buffer)
> hf list 14a                             # decode the buffered sniff with ISO 14443-3 + APDU dissector
> hf mf rdsc 0 A FFFFFFFFFFFF             # read MIFARE Classic sector 0 with default key
> hf mfdes auth 0 1 0 16 \\
    --kdf 0 --ki 0                        # MIFARE DESFire EV3 AES auth on app 0, key 1

# Android dumpsys + logcat for HCE debugging
adb shell dumpsys nfc                     # controller state, AID routing table
adb logcat -s NfcAdapter NfcService NfcDispatcher

# Wireshark filters (NFCGate PCAPNG captures)
nfc.llcp                                  # LLCP frames
nfc.ndef                                  # decoded NDEF records
nfc                                       # any NFC dissector match`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'ISO 14443-3 Type A anti-collision — REQA → ATQA → SEL/NVB → SAK',
						code: `PCD: REQA  (7-bit short frame)
+----------+
| 7 bits   |       0x26 = REQA   (0x52 = WUPA)
+----------+

PICC: ATQA  (2 bytes)
 byte 1                  byte 2
 b8 b7 b6 b5 b4 b3 b2 b1 | b16 b15 b14 b13 b12 b11 b10 b9
 [proprietary    ][RFU ][bit-frame anti-collision (5 bits)]
                                   [UID size: 00=4B, 01=7B, 10=10B] [RFU]

PCD: ANTICOLLISION / SELECT
+-----+-----+----------------------+-----+
| SEL | NVB | UID-CLn (partial)    | BCC | (+ CRC_A if NVB=0x70)
+-----+-----+----------------------+-----+
  1B    1B          0–4B               1B
  SEL = 0x93 (CL1) / 0x95 (CL2) / 0x97 (CL3)
  NVB upper nibble = byte-count (incl. SEL+NVB); lower nibble = bit-count mod 8
  BCC = XOR of the 4 UID-CLn bytes

PICC: SAK  (1 byte + 2-byte CRC_A)
 b8 b7 b6 b5 b4 b3 b2 b1
              |
              +---- bit 6 = ISO/IEC 14443-4 compliant (RATS/ATS supported)
              +---- bit 3 = cascade bit (UID incomplete, do next CLn)`
					},
					{
						title: 'NDEF record header — the universal NFC payload container',
						code: `Byte 0  (status byte; bit numbering 7 = MSB)
 7  6  5  4  3  2  1  0
[MB][ME][CF][SR][IL][  TNF (3 bits)  ]

  MB = Message Begin    (1 = first record of message)
  ME = Message End      (1 = last record of message)
  CF = Chunk Flag       (1 = first or middle chunk)
  SR = Short Record     (1 = PAYLOAD LENGTH is 1 byte; 0 = 4 bytes)
  IL = ID Length present
  TNF= Type Name Format: 0=Empty, 1=Well-Known, 2=Media (MIME),
                         3=Absolute URI, 4=External, 5=Unknown,
                         6=Unchanged, 7=Reserved

Byte 1     TYPE LENGTH         (1 byte)
Bytes ...  PAYLOAD LENGTH      (1 byte if SR=1, else 4 bytes big-endian)
Bytes ...  ID LENGTH           (1 byte if IL=1)
Bytes ...  TYPE                (TYPE LENGTH bytes)
Bytes ...  ID                  (ID LENGTH bytes, present iff IL=1)
Bytes ...  PAYLOAD             (PAYLOAD LENGTH bytes)

Example — a URI record pointing at https://example.com/info:
  D1 01 0F 55 03 65 78 61 6D 70 6C 65 2E 63 6F 6D 2F 69 6E 66 6F
  ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
   |  |  |  |  |
   |  |  |  |  +-- URI body bytes (0x65 = 'e' ...)
   |  |  |  +-- URI prefix code: 0x03 = "https://"
   |  |  +-- payload length = 15 bytes
   |  +-- type length = 1 byte
   +-- header byte: MB=1, ME=1, SR=1, TNF=1 (Well-Known); type byte is 'U'`
					},
					{
						title: 'ISO 7816-4 APDU — the EMV / eMRTD / Aliro command alphabet',
						code: `Command APDU
+-----+-----+-----+-----+------+----------+------+
| CLA | INS | P1  | P2  |  Lc  |   Data   |  Le  |
+-----+-----+-----+-----+------+----------+------+
   1B    1B    1B    1B   0/1/3B  0–65535B  0/1/3B

  CLA  Class byte: interindustry (00) or proprietary (80+); chaining and
       secure messaging bits in the upper nibble
  INS  Instruction:  0xA4 SELECT FILE, 0xB0 READ BINARY, 0xC0 GET RESPONSE,
                     0x88 INTERNAL AUTHENTICATE, 0x82 EXTERNAL AUTHENTICATE,
                     0xAE GENERATE AC (EMV), 0x84 GET CHALLENGE
  P1,P2 Instruction parameters (e.g. SELECT by name vs by FID)
  Lc   Length of command data (1 byte short / 3 bytes extended; omitted if no data)
  Le   Expected response length (0x00 = 256; absent = 0)

Response APDU
+----------+-----+-----+
|   Data   | SW1 | SW2 |
+----------+-----+-----+
              1B    1B
  Common status words:
    9000  OK
    61xx  more data available — issue GET RESPONSE with Le=xx
    6Cxx  wrong Le — retry with Le=xx
    6982  security status not satisfied (no authentication)
    6985  conditions not satisfied (terminal state mismatch)
    6A82  file not found
    6300  warning (counter decreased; partial auth)`
					},
					{
						title: 'A real Apple Pay tap — Mastercard kernel 2',
						code: `─── 1. ISO 14443-3 anti-collision ────────────────────────────────────────────
REQA: 26
ATQA: 04 00                       # Type A, 4-byte UID, std anti-collision
SEL/NVB: 93 20
UID-CL1: 04 1A 2B 3C   BCC: 4D
SEL/NVB: 93 70 04 1A 2B 3C 4D  CRC_A
SAK: 28  CRC_A                    # b6 set → ISO 14443-4 compliant
RATS: E0 80  CRC_A
ATS:  06 75 33 81 02 80           # supports CID, FSCI=5 (64B max)

─── 2. EMV PPSE → AID → GPO → READ RECORD → GENERATE AC (ARQC) ────────────────
> 00 A4 04 00 0E 32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 00   # SELECT PPSE
< 6F .. 84 0E 32 50 41 59... A5... BF0C 1C 61 1A 4F 07 A0000000041010
   50 0A 4D 41 53 54 45 52 43 41 52 44 87 01 01   90 00
> 00 A4 04 00 07 A0 00 00 00 04 10 10 00            # SELECT AID = Mastercard
< 6F .. A5 .. 9F38 (PDOL list)  90 00
> 80 A8 00 00 23 83 21 ...PDOL data...              # GET PROCESSING OPTIONS
< 77 .. 82 02 19 80   94 0C 18 01 02 00 ...AFL...   90 00
> 00 B2 01 0C 00                                    # READ RECORD SFI=1 rec=1
< 70 .. 5F24 (expiry) 5A 08 5413... (PAN) 8F 01 ...  90 00
... (more READ RECORDs per AFL)
> 80 AE 80 00 1F ...CDOL1 data...                   # GENERATE AC requesting ARQC
< 77 .. 9F27 80                                     # CID = 0x80 = ARQC
       9F36 02 00 7A                                # ATC
       9F26 08 1A 2B 3C 4D 5E 6F 70 81              # Application Cryptogram
       9F10 ...IAD...                               90 00

Total airtime from field-on to ARQC: ~300–800 ms on a real terminal.`
					}
				]
			}
		]
	},
	performance: {
		latency:
			'50–200 ms typical for tap-and-go contactless EMV; ~300–800 ms full EMV CDA online (REQA through ARQC return); ~100 ms for a Type 2 NDEF read on a transit poster',
		throughput:
			'NFC-A/B: 106 / 212 / 424 / 848 kbit/s. NFC-F (FeliCa): 212 / 424 kbit/s. NFC-V (15693): typically 1.65 / 26.48 kbit/s; up to 6.78 Mbit/s in ISO 15693-3 high-speed amendments',
		overhead:
			'16-bit CRC_A per ISO 14443-3 frame; ISO 14443-4 I-blocks add 2–3 bytes PCB+CID; ISO 7816-4 APDU header is 4–7 bytes. NDEF status byte 1 + variable type/id/payload-length fields'
	},
	connections: ['bluetooth', 'wifi', 'tls', 'cellular', 'uwb'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Near-field_communication',
		official: 'https://nfc-forum.org/build/specifications'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/75/NFC_logo.svg/330px-NFC_logo.svg.png',
		alt: 'The NFC Forum "N-Mark" — a stylised lowercase "n" used to identify NFC-capable surfaces and devices since 2010.',
		caption:
			'The NFC Forum "N-Mark" replaced the older "ContactLess" branding around 2010 and is now a registered trademark. Where Bluetooth\'s logo is a bind-rune of King Harald Bluetooth\'s initials in Younger Futhark, NFC simply turned the first letter of its name into a single character.',
		credit: 'Image: Wikimedia Commons / NFC Forum trademark'
	},

	recentChanges: [
		{
			date: '2024-03',
			title: 'iOS 17.4 opens NFC HCE to EEA wallets (DMA)',
			description:
				'On 25 January 2024 {{apple|Apple}} announced — and in March 2024 iOS 17.4 shipped — the **NFC & Secure Element Platform** entitlement for the European Economic Area. For the first time on iPhone, third-party wallets can do {{hce|Host Card Emulation}} contactless payments without going through {{apple|Apple}} Pay. PayPal Germany was the first to ship; the entitlement covers {{hce|HCE}} access, side-button shortcut, Face/Touch {{id-identifier|ID}}, and Field-Detect. Available **only inside the EEA** (27 EU states + Iceland, Liechtenstein, Norway) and **only on iPhone** — not {{apple|Apple}} Watch, not iPad.',
			source: {
				url: 'https://www.apple.com/newsroom/2024/01/apple-announces-changes-to-ios-safari-and-the-app-store-in-the-european-union/',
				label: 'Apple newsroom, 25 Jan 2024'
			}
		},
		{
			date: '2024-07',
			title: "EU Commission accepts Apple's 10-year NFC opening commitments",
			description:
				"On **17 July 2024** the European Commission's commitments decision {{ip-address|IP}}/24/3706 made {{apple|Apple}}'s NFC opening legally binding for **ten years**, monitored by an independent trustee. The first time any regulator has compelled an {{oem|OEM}} to open NFC card emulation. The pattern is now templated and the watch-items are the UK CMA, Japan JFTC, and Australian ACCC.",
			source: {
				url: 'https://ec.europa.eu/commission/presscorner/detail/en/ip_24_3706',
				label: 'EC press release IP/24/3706'
			}
		},
		{
			date: '2025-06',
			title: 'NFC Forum Release 15 — operating volume quadrupled',
			description:
				"On **17 June 2025** the NFC Forum opened Release 15 to its members. Headline change: the certified operating volume quadrupled from 5 mm to **20 mm** — a geometrically harder problem the Forum's chair [[pioneer:preeti-ohri-khemani|Preeti Ohri Khemani]] called the most demanding standardisation effort to date. Digital Protocol moves to v2.4, Activity to v2.3, Analog to v3.0 (the new operating volume). Certification Release 15 (CR15) accepts applications by early 2026; full public availability fall 2025.",
			source: {
				url: 'https://nfc-forum.org/news/2025-06-nfc-release-15-the-what-why-and-how/',
				label: 'NFC Forum: NFC Release 15 — the what, why and how'
			}
		},
		{
			date: '2025-07',
			title: 'CCC Digital Key 4.0 announced',
			description:
				'The Car Connectivity Consortium announced **Digital Key 4.0** in July 2025 and tested it at the 13th Plugfest, hosted by {{apple|Apple}}. Headline: *cross-version compatibility* — a DK3 phone unlocks a DK4 car and vice versa. **115 vehicle/module products** were certified in 2025 alone, including the first Chinese OEMs (NIO, XPENG, Geely group brands). Devices must support at least one of NFC, {{ble|BLE}}, or [[uwb|UWB]]; NFC remains the fallback that works even on a phone with a dead battery (>5 hours on iPhone reserve power).',
			source: {
				url: 'https://carconnectivity.org/',
				label: 'Car Connectivity Consortium'
			}
		},
		{
			date: '2026-02',
			title: 'Aliro 1.0 finalised — "Matter for doors"',
			description:
				'On **26 February 2026** the Connectivity Standards Alliance — the same group that runs {{matter|Matter}} — finalised {{aliro|Aliro 1.0}}, a {{pki|PKI}}-based access-control credential standard. {{ecdsa|ECDSA}} mutual authentication, support for NFC tap-to-access, {{ble|BLE}} proximity, and {{ble|BLE}}+[[uwb|UWB]] ranged unlock, with credentials provisioned into {{apple|Apple}}/{{google|Google}}/Samsung wallets. First certifications: {{apple|Apple}}, Allegion, Aqara, {{google|Google}}, HID, Kastle, Kwikset, Last Lock, Nordic, Nuki, {{nxp|NXP}}, {{qorvo|Qorvo}}, Samsung, STMicro. Target verticals: corporate, hospitality, residential, multi-family, university.',
			source: {
				url: 'https://csa-iot.org/newsroom/introducing-aliro-1-0/',
				label: 'CSA: Introducing Aliro 1.0'
			}
		},
		{
			date: '2026-03',
			title: 'NFC WLC and NDEF adopted as IEC standards',
			description:
				"In **March 2026** the IEC formally adopted two NFC Forum specs as international standards: **NFC Wireless Charging** (WLC 2.0, up to 1 W) and **{{ndef|NDEF}}** (the data record format). {{ndef|NDEF}} being standardised removes one barrier for regulators integrating NFC tags into product passports under the EU's Ecodesign for Sustainable Products Regulation (ESPR).",
			source: {
				url: 'https://nfc-forum.org/news/2026-03-two-nfc-forum-specifications-adopted-as-iec-standards/',
				label: 'NFC Forum: two specs adopted by IEC'
			}
		}
	],

	realWorldDeployments: [
		{
			org: 'Apple Pay',
			scale:
				'Available in 85+ countries; ~$9.4 B revenue 2025 (3.4 % of all Apple); ~54 % share of US in-store mobile wallet',
			description:
				"Announced 9 September 2014 at Flint Center, Cupertino — the same hall where Steve Jobs unveiled the original Macintosh in 1984. Tim Cook held up a leather wallet: 'Our vision is to replace this — we're going to start with payments.' Launched in the US on 20 October 2014 with American Express, Bank of America, Capital One, Chase, Citi, and Wells Fargo. The three pillars — NFC, {{ese|embedded Secure Element}}, and Touch {{id-identifier|ID}} — set the template every mobile wallet has followed since. {{apple|Apple}} Pay generated ~\\$7.6 trillion in annualised transaction volume by 2025."
		},
		{
			org: 'Tap to Pay on iPhone',
			scale:
				'More than 50 countries and regions by Q1 2026; available on iPhone XS or newer; no extra hardware',
			description:
				"{{apple|Apple}} acquired Mobeewave in 2020 and launched Tap to Pay on iPhone in the US in February 2022 via Stripe. By April 2026 {{apple|Apple}} stated availability in **more than 50 countries and regions** — 18 European countries on 27 May 2025, 5 Nordic + Baltic + Monaco on 23 September 2025, Singapore 2 December 2025, Malaysia 22 April 2026. Turns the merchant's iPhone into a contactless terminal — the protocol shift is that the iPhone is now usually on **both ends** of the tap."
		},
		{
			org: 'JR East Suica + Hong Kong Octopus',
			scale:
				'95.64 M Suica issued (Oct 2023), 6.6 M daily taps; >35 M Octopus cards on a population of 7.5 M',
			description:
				"Sony's FeliCa team began work in the late 1980s; the protocol shipped commercially as the **Hong Kong Octopus card on 1 September 1997** — four years before NFC was named, seven before the NFC Forum existed. **Suica** launched on **18 November 2001** at 424 metropolitan Tokyo stations. {{apple|Apple}} Pay Suica became available on 7 September 2016 with the iPhone 7 (Japan-only), then went global on the iPhone 8. By 2021 Japan had ~200 M IC cards across nine mutually-usable regional schemes — more cards than people."
		},
		{
			org: 'Transport for London contactless EMV',
			scale: '>2 billion taps per year; largest contactless EMV deployment globally',
			description:
				"TfL added {{emv-cryptogram|EMV}} contactless on **buses in 2012** and the **Tube in 2014** — and the UK contactless economy lifted off behind it. Where the rest of the world's {{transit|transit}} operators issued proprietary smart cards ({{mifare|MIFARE}}, FeliCa, CIPURSE), TfL bet on **bank-issued {{emv-cryptogram|EMV}}** as the fare media. The bet paid: by 2023 UK contactless accounted for over 80 % of in-person Visa transactions. In the US, contactless went from 1 % of Visa face-to-face transactions in 2017 to roughly one-in-three by 2023 — {{apple|Apple}} Pay is widely credited as the demand driver."
		},
		{
			org: 'ICAO eMRTD passports + DTC',
			scale:
				'~1 billion electronic passports in circulation worldwide; DTC airport pilots active 2024–26',
			description:
				'Belgium issued the first {{icao|ICAO}} Doc 9303-compliant eMRTD in **2004**. By 2026 ~1 billion are in circulation. The chip is an {{iso|ISO}} 14443 {{picc|PICC}} running {{iso|ISO}} 7816-4 with a small {{icao|ICAO}} file system (DG1 {{mrz|MRZ}}, DG2 photo, EF.SOD signature, EF.COM index, plus optional DG3 fingerprints / DG4 iris). The reader cannot get any data without **BAC** (legacy 3DES from MRZ) or **PACE** (modern {{ecdh|ECDH}} from MRZ or 6-digit CAN). The Digital Travel Credential (DTC-PC/VC) — passport on phone — is in airport pilots in Finland, the Netherlands, and Singapore.'
		},
		{
			org: 'NXP MIFARE family',
			scale: '>10 billion MIFARE ICs shipped cumulatively',
			description:
				"Philips ({{nxp|NXP}} from 2006) shipped {{mifare|MIFARE}} Classic in **1994**, DESFire EV1 in **2006**, {{mifare|MIFARE}} Plus in **2011**, DESFire EV2 in 2016, EV3 in the early 2020s. The Classic Crypto1 break in 2007 (Nohl/Plötz/Starbug at 24C3 Berlin) is the canonical 'security by obscurity does not buy two decades' lesson. DESFire EV3 is now standard for new {{transit|transit}} and access deployments — full {{aes|AES}}, Common Criteria EAL5+, side-channel hardened. Dutch OV-chipkaart's last Classic mainline cards were not retired until 2024 — 17 years after the original break."
		},
		{
			org: 'CCC Digital Key',
			scale:
				'115 vehicle/module products certified in 2025; BMW first to certify (late 2024); first Chinese OEMs in 2025',
			description:
				"The Car Connectivity Consortium's Digital Key turns a phone into a vehicle key. v1.0 was proprietary; v2.0 standardised NFC; v3.0 added {{ble|BLE}} proximity + [[uwb|UWB]] ranging (so the car can tell *which side* of the door you are on); **v4.0** (announced July 2025) brings cross-version interoperability. BMW + {{nxp|NXP}} were the first to certify (late 2024). 115 products certified in 2025 alone; Mercedes, Hyundai/Kia/Genesis, Audi (new in 2025), Volvo, Porsche, GM, Ford, plus a wave of Chinese OEMs (NIO, XPENG, Geely group — Volvo, Polestar, ZEEKR, Lynk & Co., smart, Lotus)."
		}
	],

	funFacts: [
		{
			title: 'Charles Walton died the same year Google Wallet launched',
			text: '[[pioneer:charles-walton|Charles Walton]], the {{ibm|IBM}} disk-drive engineer who founded **Proximity Devices in 1970** and holds the canonical {{rfid|RFID}} ancestor patent (US 4,384,288, 1983, *Portable Radio Frequency Emitting Identifier*) plus 50+ others, earned several million dollars in royalties before the bulk of his patents expired in the mid-1990s — just before the wave of {{rfid|RFID}} adoption from Walmart and the US Department of Defense. He died in Los Gatos on **6 November 2011**, three months after {{google|Google}} launched **{{google|Google}} Wallet 1.0** on the Nexus S 4G in May 2011. Two pioneers of the same field, separated by 60 years, in the same calendar year.'
		},
		{
			title: 'FeliCa beat the NFC Forum to commercial deployment by seven years',
			text: "Sony's FeliCa team began work in the late 1980s. The **Hong Kong Octopus card** went live on **1 September 1997**, *four years before NFC was even named* and *seven years before the NFC Forum was founded*. By the time Sony, Philips, and Nokia announced the Forum in 2004, FeliCa was already running tens of millions of taps a day on a single Hong Kong subway. FeliCa became one of three permitted technologies in {{iso-iec|ISO/IEC}} 18092 in 2003 — which is why iPhones sold in Japan from the **iPhone 7 (September 2016)** have a FeliCa stack while the iPhone 6 (September 2014) does not. Japanese visitors with iPhone 6 could not tap through Tokyo gates; tourists with iPhone 8 could, without changing a single region setting."
		},
		{
			title: 'The unassuming "N" logo has no runes',
			text: "[[bluetooth|Bluetooth]]'s logo (since 1998) is a bind-rune combining the Younger Futhark letters ᚼ (Hagall) and ᛒ (Bjarkan) — the initials of King Harald Blåtand. NFC just abbreviated 'Near Field Communication' into a single character N, trademarked by the NFC Forum, and replaced the older 'ContactLess' branding around 2010. No mythology, no medieval Danish kings — just a typographic placeholder that happened to stick. (Like Bluetooth, in fact, where [[pioneer:jim-kardach|Jim Kardach]]'s placeholder name also never got replaced.)"
		},
		{
			title: 'Security by obscurity buys ten years of denial, not twenty',
			text: "{{mifare|MIFARE}} Classic shipped in **1994** with a proprietary 48-bit Crypto1 stream cipher whose security depended on the algorithm being secret. By 2007 the world owned roughly 1 billion of them — Dutch OV-chipkaart, London Oyster, Boston Charlie Card, hotel-keys, office-badges, university canteens. On **28 December 2007 at 24C3 in Berlin**, [[pioneer:karsten-nohl|Karsten Nohl]], [[pioneer:henryk-plotz|Henryk Plötz]], and 'Starbug' presented *{{mifare|MIFARE}} — little security despite obscurity*: they had decapped the chip, photographed ~10 000 gates with an optical microscope, recognised that only ~70 unique gates were used, and isolated the Crypto1 logic. By 2008 the Nijmegen group had published *Dismantling {{mifare|MIFARE}} Classic*. The Dutch OV-chipkaart's last {{mifare|MIFARE}} Classic mainline cards were retired in **2024** — seventeen years after the break."
		},
		{
			title: '"We are going to start with payments"',
			text: "On **9 September 2014** at the Flint Center in Cupertino — the same hall where Steve Jobs unveiled the original Macintosh in 1984 — Tim Cook held up a leather wallet and said: 'Our vision is to replace this — we're going to start with payments.' Eleven years later, the {{apple|Apple}} Wallet holds driver's licences, hotel and home keys, car keys ({{ccc-digital-key|CCC}}), {{transit|transit}} cards, event tickets, vaccine cards, employee badges, and {{aliro|Aliro}} residential credentials — and every one of them rides the same 13.56 MHz inductive link defined in **{{iso-iec|ISO/IEC}} 18092 in December 2003**, three years before the iPhone existed."
		},
		{
			title: 'The "switch off NFC to save battery" myth',
			text: '{{imap-idle|Idle}} NFC controllers draw on the order of **single-digit microamps** in their lowest poll states — orders of magnitude less than the display, baseband, or {{ap-access-point|AP}}. Disabling NFC has no measurable battery effect on any modern phone. The option survives in {{os|OS}} settings only as a *security/privacy* toggle, not a power one. If you have ever turned NFC off to make your phone last longer, you have done exactly nothing for your battery.'
		}
	],

	practicalWisdom: {
		pitfalls: [
			{
				title: 'Antenna tuning at 13.56 MHz — the silent NFC killer',
				text: "The single biggest source of 'NFC doesn't work' complaints is poor antenna tuning. The {{pcd|PCD}} and {{picc|PICC}} each present an LC resonant tank around 13.56 MHz; small detuning (e.g. a metal sheet within 5 mm of the antenna) reduces the magnetic coupling factor *k* and starves the {{picc|PICC}}'s chip and load-modulation amplitude. **Rules of thumb:** target the {{picc|PICC}} resonant frequency *1–3 MHz above* 13.56 MHz on the bench — the card-to-reader mutual inductance pulls it down to the design point. Treat any metal sheet within 5 mm of the antenna as catastrophic — phones with metal backs (post-2014) require either a ferrite separator (0.1–0.3 mm thick) or active {{load-modulation|load modulation}} in the controller ({{nxp|NXP}} PN553 onward). Q factor: lower Q broadens the peak for interoperability at the cost of lower peak induced voltage; readers typically Q ≈ 20–30, cards 25–40."
			},
			{
				title: 'HCE AID conflicts and cold-start latency on Android',
				text: "When two installed apps claim the same {{aid|AID}} (e.g. both a banking app and a {{transit|transit}} app claiming `A000000003101001`), {{android|Android}} resolves via the `apduservice.xml` category ('payment', 'other') and the user-selected default for that category. Apps declaring a *wildcard {{aid|AID}} prefix* can intercept others; {{android|Android}} tightened the checks but `aid-prefix-filter` is still a footgun. **Equally important:** {{hce|HCE}} service activation has a non-trivial cold-start {{latency|latency}} budget (~70–150 ms), and {{emv-cryptogram|EMV}} terminals time out aggressively. Keep the `HostApduService` warm by avoiding heavy initialisation in `processCommandApdu`. Inspect routing with `adb shell dumpsys nfc` (look at the {{routing-table|Routing Table}} / {{aid|AID}} routing section) and `adb logcat -s NfcAdapter NfcService NfcDispatcher`."
			},
			{
				title: 'EMV "fast tap" and the AIP byte trap',
				text: "Mastercard's PayPass and Visa's qVSDC contactless flows have two execution profiles: **Mag-Stripe Mode** (legacy, deprecated in modern terminals) and **{{emv-cryptogram|EMV}} Mode** (normal 'fast tap' with CDA). The card returns an AIP byte that signals whether DDA/CDA is supported. A common custom-{{hce|HCE}} wallet bug: returning an AIP claiming DDA/CDA support but failing to produce a valid signature in `{{generate-ac|GENERATE AC}}` — the terminal aborts after ~600 ms with status word `6985`. **Cure:** match the AIP bits exactly to what your cryptogram code can produce, and test with terminals from at least three networks (Visa, Mastercard, Amex) before launch — kernels diverge in their corner cases."
			},
			{
				title: 'HCE relay attacks: the protocol does not know if the phone is in the room',
				text: "{{hce|HCE}} terminates {{apdu|APDUs}} in a normal application, which means a malicious app or an attacker phone close to the victim can relay the entire {{apdu|APDU}} stream over the internet to a confederate's phone at a terminal. TU Darmstadt's **NFCGate** (2015+) made this trivial. The protocol cannot tell the difference — an {{apdu|APDU}} stream tunnelled over {{ip-address|IP}} is structurally indistinguishable from a local tap. **Mitigations:** {{emv-cryptogram|EMV}} **Relay Resistance Protocol (RRP)** in Kernel 2 v2.6+ binds round-trip timing into the cryptogram (real NFC ≤ 5 ms, internet relay ≥ 50 ms); {{apple|Apple}} Pay's eSE architecture sidesteps it entirely. If you ship {{hce|HCE}} without RRP, your safety net is *back-end velocity and geo-anomaly monitoring* — not phone-side time bounds."
			}
		]
	}
};
