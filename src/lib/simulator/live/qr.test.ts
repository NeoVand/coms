import { describe, it, expect } from 'vitest';
import jsQR from 'jsqr';
import { encodeQrMatrix, encodeQrSvg } from './qr';
import { encodeSignal } from './webrtc-codec';

/** Rasterise a QR matrix to an RGBA pixel buffer jsQR can decode. */
function rasterize(count: number, quiet: number, modules: boolean[][], scale = 6) {
	const dim = (count + quiet * 2) * scale;
	const data = new Uint8ClampedArray(dim * dim * 4).fill(255); // white
	for (let r = 0; r < count; r++) {
		for (let c = 0; c < count; c++) {
			if (!modules[r][c]) continue;
			const x0 = (c + quiet) * scale;
			const y0 = (r + quiet) * scale;
			for (let y = y0; y < y0 + scale; y++) {
				for (let x = x0; x < x0 + scale; x++) {
					const i = (y * dim + x) * 4;
					data[i] = data[i + 1] = data[i + 2] = 0; // black
				}
			}
		}
	}
	return { data, dim };
}

describe('qr — encode → scan round-trip', () => {
	it('round-trips a short string through jsQR', async () => {
		const text = 'PLW1:hello-world';
		const { count, quiet, modules } = await encodeQrMatrix(text, { quiet: 4 });
		const { data, dim } = rasterize(count, quiet, modules);
		const decoded = jsQR(data, dim, dim);
		expect(decoded?.data).toBe(text);
	});

	it('round-trips a realistic ~700-char signaling code', async () => {
		// Build a real compressed invite code, then scan it back.
		const sdp = Array.from(
			{ length: 40 },
			(_, i) => `a=candidate:${i} 1 udp 1 10.0.0.${i} 5000 typ host`
		).join('\r\n');
		const code = await encodeSignal('offer', `v=0\r\n${sdp}`);
		expect(code.length).toBeGreaterThan(300); // genuinely large payload
		const { count, quiet, modules } = await encodeQrMatrix(code, { quiet: 4 });
		const { data, dim } = rasterize(count, quiet, modules);
		const decoded = jsQR(data, dim, dim);
		expect(decoded?.data).toBe(code);
	});

	it('produces a self-contained SVG with a white ground', async () => {
		const svg = await encodeQrSvg('PLW1:abc');
		expect(svg.startsWith('<svg')).toBe(true);
		expect(svg).toContain('fill="#ffffff"');
		expect(svg).toContain('<path');
	});
});
