/**
 * Pure, side-effect-free helpers for the WebRTC live chat: the shareable
 * signaling codec and small SDP parsers. Kept out of `webrtc.svelte.ts` (which
 * holds the runes-based session class) so this logic is unit-testable in a
 * plain Node environment.
 */

export const CODE_PREFIX = 'PLW1:'; // compressed, base64url
export const CODE_PREFIX_RAW = 'PLR1:'; // uncompressed fallback

export interface Signal {
	type: 'offer' | 'answer';
	sdp: string;
}

/** Encode an SDP into a compact, shareable code (deflate-raw + base64url). */
export async function encodeSignal(type: 'offer' | 'answer', sdp: string): Promise<string> {
	const json = JSON.stringify({ t: type[0], s: sdp });
	const bytes = new TextEncoder().encode(json);
	const gz = await deflate(bytes);
	if (gz) return CODE_PREFIX + toBase64Url(gz);
	return CODE_PREFIX_RAW + toBase64Url(bytes);
}

/** Decode a code produced by {@link encodeSignal} back into an SDP + type. */
export async function decodeSignal(code: string): Promise<Signal> {
	const trimmed = code.trim();
	let bytes: Uint8Array;
	if (trimmed.startsWith(CODE_PREFIX)) {
		const inflated = await inflate(fromBase64Url(trimmed.slice(CODE_PREFIX.length)));
		if (!inflated) throw new Error('This browser cannot read compressed codes.');
		bytes = inflated;
	} else if (trimmed.startsWith(CODE_PREFIX_RAW)) {
		bytes = fromBase64Url(trimmed.slice(CODE_PREFIX_RAW.length));
	} else {
		throw new Error('That is not a Protocol Lab code — check you copied all of it.');
	}
	let obj: { t?: unknown; s?: unknown };
	try {
		obj = JSON.parse(new TextDecoder().decode(bytes));
	} catch {
		throw new Error('That code is malformed.');
	}
	if ((obj.t !== 'o' && obj.t !== 'a') || typeof obj.s !== 'string')
		throw new Error('That code is malformed.');
	return { type: obj.t === 'o' ? 'offer' : 'answer', sdp: obj.s };
}

/** First value of an SDP attribute line, e.g. sdpValue(sdp, 'a=ice-ufrag:'). */
export function sdpValue(sdp: string, prefix: string): string | null {
	const line = sdp.split(/\r?\n/).find((l) => l.startsWith(prefix));
	return line ? line.slice(prefix.length).trim() : null;
}

/** Summarise the ICE candidates in an SDP, e.g. "3 (2 host, 1 srflx)". */
export function parseCandidates(sdp: string): { summary: string } {
	const lines = sdp.split(/\r?\n/).filter((l) => l.includes('candidate:'));
	if (lines.length === 0) return { summary: 'none yet' };
	const counts: Record<string, number> = {};
	for (const l of lines) {
		const t = /typ (\w+)/.exec(l)?.[1] ?? 'host';
		counts[t] = (counts[t] ?? 0) + 1;
	}
	const label: Record<string, string> = {
		host: 'host',
		srflx: 'srflx',
		prflx: 'prflx',
		relay: 'relay'
	};
	const parts = Object.entries(counts).map(([t, n]) => `${n} ${label[t] ?? t}`);
	return { summary: `${lines.length} (${parts.join(', ')})` };
}

export function shorten(s: string, max: number): string {
	return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

// ---- base64url + deflate --------------------------------------------------

async function deflate(bytes: Uint8Array): Promise<Uint8Array | null> {
	if (typeof CompressionStream === 'undefined') return null;
	try {
		const cs = new CompressionStream('deflate-raw');
		const stream = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(cs));
		return new Uint8Array(await stream.arrayBuffer());
	} catch {
		return null;
	}
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array | null> {
	if (typeof DecompressionStream === 'undefined') return null;
	try {
		const ds = new DecompressionStream('deflate-raw');
		const stream = new Response(new Blob([bytes as BlobPart]).stream().pipeThrough(ds));
		return new Uint8Array(await stream.arrayBuffer());
	} catch {
		return null;
	}
}

export function toBase64Url(bytes: Uint8Array): string {
	let bin = '';
	for (const b of bytes) bin += String.fromCharCode(b);
	return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromBase64Url(s: string): Uint8Array {
	const b64 = s.replace(/-/g, '+').replace(/_/g, '/');
	const pad = b64.length % 4 ? '='.repeat(4 - (b64.length % 4)) : '';
	const bin = atob(b64 + pad);
	const out = new Uint8Array(bin.length);
	for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
	return out;
}
