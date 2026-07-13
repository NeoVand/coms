import { describe, it, expect } from 'vitest';
import {
	encodeSignal,
	decodeSignal,
	sdpValue,
	parseCandidates,
	shorten,
	CODE_PREFIX
} from './webrtc-codec';

// A trimmed but realistic host+srflx SDP, like a browser produces for a data
// channel after ICE gathering completes.
const SAMPLE_SDP = [
	'v=0',
	'o=- 4611731400430051336 2 IN IP4 127.0.0.1',
	's=-',
	't=0 0',
	'a=group:BUNDLE 0',
	'm=application 9 UDP/DTLS/SCTP webrtc-datachannel',
	'c=IN IP4 0.0.0.0',
	'a=ice-ufrag:F7gI',
	'a=ice-pwd:x9cml/YzichV2+XlhiMu8g',
	'a=fingerprint:sha-256 AB:CD:EF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC',
	'a=setup:actpass',
	'a=candidate:1 1 udp 2113937151 192.168.1.42 51000 typ host',
	'a=candidate:2 1 udp 1677729535 47.188.69.20 51001 typ srflx raddr 192.168.1.42 rport 51000',
	'a=sctp-port:5000'
].join('\r\n');

describe('webrtc-codec — signaling round-trip', () => {
	it('encodes an offer and decodes back to the identical SDP', async () => {
		const code = await encodeSignal('offer', SAMPLE_SDP);
		const back = await decodeSignal(code);
		expect(back.type).toBe('offer');
		expect(back.sdp).toBe(SAMPLE_SDP);
	});

	it('encodes an answer and preserves its type', async () => {
		const code = await encodeSignal('answer', SAMPLE_SDP);
		const back = await decodeSignal(code);
		expect(back.type).toBe('answer');
		expect(back.sdp).toBe(SAMPLE_SDP);
	});

	it('compresses in this environment (PLW1 prefix) and shrinks the payload', async () => {
		const code = await encodeSignal('offer', SAMPLE_SDP);
		expect(code.startsWith(CODE_PREFIX)).toBe(true);
		// The shareable code must be shorter than base64 of the raw SDP.
		expect(code.length).toBeLessThan(SAMPLE_SDP.length * 1.4);
	});

	it('survives whitespace/newlines around a pasted code', async () => {
		const code = await encodeSignal('offer', SAMPLE_SDP);
		const back = await decodeSignal(`\n  ${code}  \n`);
		expect(back.sdp).toBe(SAMPLE_SDP);
	});

	it('rejects a code without the Protocol Lab prefix', async () => {
		await expect(decodeSignal('not-a-code')).rejects.toThrow(/Protocol Lab code/);
	});

	it('rejects a prefixed but corrupt code', async () => {
		await expect(decodeSignal(`${CODE_PREFIX}@@@notbase64@@@`)).rejects.toThrow();
	});
});

describe('webrtc-codec — SDP parsing', () => {
	it('reads the ICE ufrag and fingerprint from an SDP', () => {
		expect(sdpValue(SAMPLE_SDP, 'a=ice-ufrag:')).toBe('F7gI');
		expect(sdpValue(SAMPLE_SDP, 'a=fingerprint:')).toBe(
			'sha-256 AB:CD:EF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC'
		);
	});

	it('returns null for an absent attribute', () => {
		expect(sdpValue(SAMPLE_SDP, 'a=nonexistent:')).toBeNull();
	});

	it('summarises candidates by type', () => {
		expect(parseCandidates(SAMPLE_SDP).summary).toBe('2 (1 host, 1 srflx)');
	});

	it('reports "none yet" when no candidates have gathered', () => {
		expect(parseCandidates('v=0\r\na=ice-ufrag:xxxx').summary).toBe('none yet');
	});
});

describe('webrtc-codec — shorten', () => {
	it('leaves short strings untouched', () => {
		expect(shorten('hello', 10)).toBe('hello');
	});
	it('truncates long strings with an ellipsis', () => {
		expect(shorten('abcdefghij', 5)).toBe('abcd…');
	});
});
