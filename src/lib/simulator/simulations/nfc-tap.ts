import type { SimulationConfig } from '../types';
import { createNFCALayer, createNDEFLayer, createAPDULayer } from '../layers/nfc';

export const nfcTap: SimulationConfig = {
	protocolId: 'nfc',
	title: 'NFC Tap — Apple Pay / EMV Contactless',
	description:
		"Watch a phone present an EMV cryptogram to a contactless terminal in ~300 ms. The same nine beats — REQA → ATQA → SEL → SAK → RATS → ATS → SELECT PPSE → SELECT AID → GPO → READ RECORD → GENERATE AC — that runs ~$7.6 trillion in annualised Apple Pay transactions and every plastic contactless card on Earth.",
	tier: 'client',
	actors: [
		{ id: 'phone', label: 'Phone (PICC)', icon: 'device', position: 'left' },
		{ id: 'terminal', label: 'POS Terminal (PCD)', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'kernel',
			label: 'EMV kernel',
			type: 'select',
			defaultValue: 'Kernel 2 (Mastercard)',
			options: ['Kernel 2 (Mastercard)', 'Kernel 3 (Visa qVSDC)', 'Kernel 7 (UnionPay)']
		},
		{
			id: 'mode',
			label: 'Card emulation source',
			type: 'select',
			defaultValue: 'eSE (Apple Pay)',
			options: ['eSE (Apple Pay)', 'HCE (Android wallet)', 'HCE (iOS 17.4 EEA wallet)']
		},
		{
			id: 'amount',
			label: 'Transaction amount',
			type: 'text',
			defaultValue: '£28.50',
			placeholder: 'currency + amount'
		}
	],
	steps: [
		{
			id: 'field-on',
			label: 'Field on — phone enters the magnetic field',
			description:
				"The terminal's antenna is energising the 13.56 MHz carrier continuously. When the phone is brought within ~4 cm, its NFC controller and eSE harvest enough power from the magnetic field to wake up — no battery contribution needed for the eSE side. The biometric release (Face ID / Touch ID, double-click side button) had to happen *before* this point on iPhone; the eSE applet is now armed and waiting.",
			fromActor: 'phone',
			toActor: 'terminal',
			duration: 800,
			highlight: ['Carrier'],
			layers: [createNFCALayer({ frame: 'RF field (continuous)', direction: '13.56 MHz carrier from PCD', payload: 'Power transfer + clock recovery', crc: '(none — physical layer)' })]
		},
		{
			id: 'reqa',
			label: 'REQA — terminal asks "any Type A cards here?"',
			description:
				"The terminal sends a 7-bit short frame `0x26` — Request-A — on the carrier. Any IDLE Type A PICC in the field transitions to READY and prepares to answer. (For deep-sleep cards the terminal would use `WUPA = 0x52` instead, which also wakes HALT cards.)",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 700,
			highlight: ['Frame', 'Payload'],
			layers: [createNFCALayer({ frame: 'Short frame (7 bits, no CRC)', direction: 'PCD → PICC', payload: '0x26 (REQA)', crc: '(none — short frame)' })]
		},
		{
			id: 'atqa',
			label: 'ATQA — phone declares its anti-collision capability',
			description:
				"The phone's NFC controller replies with `ATQA = 0x04 0x00` — declaring a 4-byte UID and standard bit-frame anti-collision support. The 5 anti-collision bits in byte 1 encode which collision-resolution scheme the card will use; the 2 'UID size' bits in byte 2 say 00=4B, 01=7B, 10=10B (cascaded).",
			fromActor: 'phone',
			toActor: 'terminal',
			duration: 700,
			highlight: ['Frame', 'Payload'],
			layers: [createNFCALayer({ frame: 'Standard frame (16 bits, no CRC)', direction: 'PICC → PCD', payload: '0x04 0x00 (ATQA — 4-byte UID, std anti-collision)', crc: '(none)' })]
		},
		{
			id: 'sel',
			label: 'SEL/NVB — bit-frame anti-collision converges on the UID',
			description:
				"The terminal sends `SEL = 0x93` (cascade level 1), `NVB = 0x20` (no bits known yet). The card returns its 4 UID bytes + BCC (the XOR check byte). The terminal echoes them back with `NVB = 0x70` and a CRC_A. The card responds with `SAK = 0x28` — bit 6 set says *I support ISO 14443-4* (so RATS/ATS will follow); bit 3 clear says *the UID is complete, no further cascade needed*.",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 900,
			highlight: ['Frame', 'Payload', 'CRC_A'],
			layers: [createNFCALayer({ frame: 'Full frame (CRC_A protected)', direction: 'PCD ↔ PICC (multi-frame exchange)', payload: 'SEL=0x93 NVB=0x20 → UID=04 1A 2B 3C BCC=4D → SEL=0x93 NVB=0x70 ... → SAK=0x28', crc: 'CRC_A on SEL+NVB+UID' })]
		},
		{
			id: 'rats',
			label: 'RATS / ATS — negotiate frame size and timing',
			description:
				"Now in 14443-4 mode. The terminal sends `RATS = 0xE0 0x80` (Request for ATS, with CID=0 and FSDI=8 meaning *I can accept up to 256-byte frames*). The phone replies with **ATS** — `06 75 33 81 02 80` — declaring its Frame Size for the Card (FSCI=5 = 64 bytes max), Frame Waiting Time (FWI=3), and supports CID/NAD options. Both ends now know the framing budget for the rest of the conversation.",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 800,
			highlight: ['Frame', 'Payload'],
			layers: [createNFCALayer({ frame: 'Full frame (CRC_A protected)', direction: 'PCD ↔ PICC', payload: 'RATS=E0 80 → ATS=06 75 33 81 02 80 (FSCI=5, FWI=3, CID supported)', crc: 'CRC_A' })]
		},
		{
			id: 'ppse',
			label: 'SELECT PPSE — terminal enumerates supported payment AIDs',
			description:
				"First APDU on top of 14443-4. The terminal SELECTs the **Proximity Payment System Environment** — AID `2PAY.SYS.DDF01`. The phone's eSE returns an FCI Template listing every payment AID it can play (and in what priority order). On a multi-card wallet (Apple Pay with Mastercard, Visa, and Amex), the user-selected default card is returned first.",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 900,
			highlight: ['CLA INS P1 P2', 'Data', 'Response Data / SW1 SW2'],
			layers: [createAPDULayer({ header: '00 A4 04 00', lc: '0E', data: "32 50 41 59 2E 53 59 53 2E 44 44 46 30 31 (PPSE AID '2PAY.SYS.DDF01')", le: '00', response: '6F .. A5 .. BF0C 1C 61 1A 4F 07 A0000000041010 50 0A MASTERCARD ... 90 00' })]
		},
		{
			id: 'select-aid',
			label: 'SELECT AID — terminal picks Mastercard',
			description:
				"The terminal SELECTs the highest-priority AID returned in the PPSE — here Mastercard's `A0000000041010`. The phone returns an FCI Template with the **PDOL** (Processing Options Data Object List) — a TLV list of EMV tags the card needs filled in to compute the cryptogram (amount, currency code, country, TVR, terminal type, transaction date, unpredictable number).",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 900,
			highlight: ['CLA INS P1 P2', 'Data', 'Response Data / SW1 SW2'],
			layers: [createAPDULayer({ header: '00 A4 04 00', lc: '07', data: 'A0 00 00 00 04 10 10 (AID: Mastercard credit/debit)', le: '00', response: '6F .. A5 .. 9F38 (PDOL list: amount, currency, country, TVR, ...) 90 00' })]
		},
		{
			id: 'gpo',
			label: 'GET PROCESSING OPTIONS — card sees the transaction terms',
			description:
				"`80 A8 00 00` GET PROCESSING OPTIONS, carrying the PDOL-filled data: the £28.50 amount, GBP currency code (0826), UK country code (0826), the terminal's TVR template, and the Unpredictable Number. The card returns **AIP** (Application Interchange Profile — declares what authentication modes it supports: SDA, DDA, CDA, cardholder verification, terminal risk management) and **AFL** (Application File Locator — pointers to which on-card files to READ next).",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 1100,
			highlight: ['CLA INS P1 P2', 'Data', 'Response Data / SW1 SW2'],
			layers: [createAPDULayer({ header: '80 A8 00 00', lc: '23', data: '83 21 ...PDOL filled: amount £28.50, currency GBP, country UK, TVR, UN...', le: '00', response: '77 .. 82 02 19 80 (AIP: CDA, CVM, RRP) 94 0C 18 01 02 00 ... (AFL) 90 00' })]
		},
		{
			id: 'read-records',
			label: 'READ RECORD ×N — pull PAN, expiry, public-key certificates',
			description:
				"For each entry in the AFL, the terminal issues `00 B2 <rec> <(sfi<<3)|0x04>` READ RECORD. The card returns the **PAN-equivalent** (DPAN, not the real card number — that lives at the issuer), expiry, CDOL1 (which tags GENERATE AC needs), the **Issuer Public-Key Certificate** and **ICC Public-Key Certificate** for offline CDA verification. Three to five READ RECORDs is typical.",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 1100,
			highlight: ['CLA INS P1 P2', 'Data', 'Response Data / SW1 SW2'],
			layers: [createAPDULayer({ header: '00 B2 01 0C', lc: '(none)', data: '(no command body)', le: '00', response: '70 .. 5F24 (expiry 12/27) 5A 08 5413 33xx xxxx xxxx (DPAN) 8F 01 ... (cert chain) 90 00' })]
		},
		{
			id: 'generate-ac',
			label: 'GENERATE AC — card mints the cryptogram',
			description:
				"`80 AE 80 00` GENERATE AC with CDOL1 data. The phone's eSE composes the cryptogram inputs (amount, currency, country, TVR, ATC, Unpredictable Number, AIP, IAD) and runs them through AES-MAC under the per-DPAN key, producing the **Application Cryptogram (AC)**. CID byte `0x80` = ARQC (Authorisation Request Cryptogram — must go online). The ATC has already incremented by 1; the cryptogram is unforgeable without the eSE key.",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 1300,
			highlight: ['CLA INS P1 P2', 'Data', 'Response Data / SW1 SW2'],
			layers: [createAPDULayer({ header: '80 AE 80 00', lc: '1F', data: '...CDOL1 data: amount £28.50, currency GBP, TVR, UN 0x9C2A3B4D...', le: '00', response: '77 .. 9F27 80 (CID=ARQC) 9F36 02 00 7A (ATC) 9F26 08 1A 2B 3C 4D 5E 6F 70 81 (Application Cryptogram) 9F10 ...IAD... 90 00' })]
		},
		{
			id: 'authorize',
			label: 'Issuer authorisation — terminal sends ARQC online, gets ARPC back',
			description:
				"The terminal hands the ARQC to the acquirer (Stripe, Square, Worldpay), which routes it through the payment network (Mastercard) to the **issuing bank**. The issuer verifies the cryptogram against the per-DPAN key in its HSM and returns an **ARPC** (Authorisation Response Cryptogram) — `APPROVED`. Total time including network round-trip: typically 300–800 ms. The terminal beeps green; the phone vibrates with the Apple Pay success animation. Total airtime in the magnetic field was less than half a second.",
			fromActor: 'terminal',
			toActor: 'phone',
			duration: 1000,
			highlight: ['Response Data / SW1 SW2'],
			layers: [createAPDULayer({ header: '(issuer round-trip via acquirer + payment network — not in-field)', lc: '—', data: 'ARQC → issuer HSM → ARPC (APPROVED, ARC=00)', le: '—', response: 'Terminal beeps green; phone shows Apple Pay tick' })]
		}
	]
};

export const nfcTagRead: SimulationConfig = {
	protocolId: 'nfc',
	title: 'NFC Tag Read — Type 2 NDEF Smart Poster',
	description:
		"Watch a phone pick up an NDEF URL from a passive transit-poster tag in a single tap. Same physics as Apple Pay, simpler stack: REQA → ATQA → SEL → SAK (without 14443-4) → T2T READ → NDEF parse → hand off to the browser.",
	tier: 'client',
	actors: [
		{ id: 'phone', label: 'Phone (PCD)', icon: 'device', position: 'left' },
		{ id: 'tag', label: 'Passive Tag (PICC)', icon: 'server', position: 'right' }
	],
	userInputs: [
		{
			id: 'tagType',
			label: 'Tag type',
			type: 'select',
			defaultValue: 'NTAG216 (T2T, 924 bytes)',
			options: ['NTAG213 (T2T, 144 bytes)', 'NTAG216 (T2T, 924 bytes)', 'MIFARE Classic 1k (legacy)', 'ICODE SLIX2 (T5T)']
		}
	],
	steps: [
		{
			id: 'reqa',
			label: 'REQA / ATQA — phone polls, tag responds',
			description:
				"The phone's NFC controller energises 13.56 MHz and polls with REQA. The passive NTAG harvests power, transitions IDLE → READY, and answers with ATQA = `0x00 0x44` — Type A, 7-byte UID, supports anti-collision (cascade required).",
			fromActor: 'phone',
			toActor: 'tag',
			duration: 800,
			highlight: ['Frame', 'Payload'],
			layers: [createNFCALayer({ frame: 'Short → standard frames', direction: 'PCD → PICC → PCD', payload: 'REQA 0x26 → ATQA 0x00 0x44 (7-byte UID)', crc: '(none / short)' })]
		},
		{
			id: 'sel',
			label: 'SEL cascade — converge on the 7-byte UID',
			description:
				"Two cascade levels are needed for a 7-byte UID. Level 1 (SEL=0x93) returns bytes 0–3 (with the cascade tag CT=0x88 in byte 0) + BCC. Level 2 (SEL=0x95) returns bytes 4–6 + BCC. Final SAK is `0x00` — meaning *Type 2 tag, no ISO 14443-4*. We go straight to T2T commands.",
			fromActor: 'phone',
			toActor: 'tag',
			duration: 900,
			highlight: ['Frame', 'Payload', 'CRC_A'],
			layers: [createNFCALayer({ frame: 'Full frame, multi-step', direction: 'PCD ↔ PICC', payload: 'CL1 → UID-CL1 (with CT=0x88) + BCC → CL2 → UID-CL2 + BCC → SAK 0x00 (T2T)', crc: 'CRC_A' })]
		},
		{
			id: 'read-cc',
			label: 'T2T READ — fetch the Capability Container',
			description:
				"NDEF tags begin with a CC at page 3 (16 bytes). T2T READ command (`0x30 0x03`) returns 4 pages = 16 bytes. The CC is the first 4 bytes: `E1 10 6D 00` — magic byte 0xE1, version 1.0, memory size 0x6D × 8 = 872 bytes available, read/write access flags 0x00. The reader knows this tag has NDEF content.",
			fromActor: 'phone',
			toActor: 'tag',
			duration: 800,
			highlight: ['Frame', 'Payload'],
			layers: [createNFCALayer({ frame: 'Full frame, CRC_A', direction: 'PCD ↔ PICC', payload: 'READ 0x30 0x03 → 16 bytes: E1 10 6D 00 (CC) + first NDEF page', crc: 'CRC_A' })]
		},
		{
			id: 'read-ndef',
			label: 'T2T READ — pull the NDEF TLV',
			description:
				"Continue reading pages 4..N. Tag memory has an NDEF TLV: byte 0x03 (NDEF Message), 1-byte length, then the NDEF message bytes. One TLV may chain multiple NDEF records.",
			fromActor: 'phone',
			toActor: 'tag',
			duration: 800,
			highlight: ['Frame', 'Payload'],
			layers: [createNFCALayer({ frame: 'Full frame, CRC_A', direction: 'PCD ↔ PICC', payload: 'READ 0x30 0x04..., 0x30 0x08, ...: 03 19 D1 01 15 55 03 t r a n s i t . e x a m p l e . c o m / q r', crc: 'CRC_A' })]
		},
		{
			id: 'parse-ndef',
			label: 'NDEF parse — decode the URI record',
			description:
				"The NDEF message contains one record: MB=ME=SR=1, IL=0, TNF=1 (Well-Known), TYPE='U' (URI). Payload starts with 0x03 (the `https://` prefix shorthand) followed by `transit.example.com/qr`. Total record overhead: 4 bytes for a 21-byte URI.",
			fromActor: 'tag',
			toActor: 'phone',
			duration: 800,
			highlight: ['Header byte', 'Type', 'Payload'],
			layers: [createNDEFLayer({ header: 'MB=1 ME=1 SR=1 IL=0 TNF=1 (Well-Known)', typeLen: 1, payloadLen: 21, type: "'U' (URI Record)", payload: '0x03 transit.example.com/qr  →  https://transit.example.com/qr' })]
		},
		{
			id: 'handoff',
			label: 'Hand-off — phone OS opens the URL',
			description:
				"The phone OS receives the parsed NDEF URL and hands it off to the default browser. On iOS the tap-to-launch notification appears (if `com.apple.developer.nfc.readersession.iso7816.select-identifiers` is in the app entitlement); on Android the URL launches directly. Total time from tap to browser load: typically <300 ms.",
			fromActor: 'phone',
			toActor: 'tag',
			duration: 800,
			highlight: ['Payload'],
			data: 'OS opens https://transit.example.com/qr',
			layers: [createNDEFLayer({ header: 'parsed', typeLen: 1, payloadLen: 21, type: "'U' (URI)", payload: 'https://transit.example.com/qr → handed to default browser' })]
		}
	]
};
