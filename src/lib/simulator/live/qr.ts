/**
 * QR helpers for the WebRTC signaling codes — encode a code to a crisp SVG to
 * display, and lazily load the decoder for camera scanning. Both libraries are
 * dynamically imported so they stay out of the main bundle and only load when a
 * user actually opens the QR flow in a live WebRTC session.
 */

export interface QrOptions {
	/** Error-correction level. 'L' maximises capacity for these ~700-char codes. */
	ecc?: 'L' | 'M' | 'Q' | 'H';
	/** Quiet-zone width in modules (the spec minimum is 4; 2 is fine on-screen). */
	quiet?: number;
}

export interface QrMatrix {
	/** Number of modules per side (not counting the quiet zone). */
	count: number;
	/** Quiet-zone width in modules included around the matrix. */
	quiet: number;
	/** modules[row][col] — true where the module is dark. */
	modules: boolean[][];
}

/** Encode `text` to its raw QR module matrix (byte mode, auto version). */
export async function encodeQrMatrix(text: string, opts: QrOptions = {}): Promise<QrMatrix> {
	const qrcode = (await import('qrcode-generator')).default;
	const qr = qrcode(0, opts.ecc ?? 'L'); // 0 = auto-pick the smallest version
	qr.addData(text, 'Byte');
	qr.make();
	const count = qr.getModuleCount();
	const modules: boolean[][] = [];
	for (let r = 0; r < count; r++) {
		const row: boolean[] = [];
		for (let c = 0; c < count; c++) row.push(qr.isDark(r, c));
		modules.push(row);
	}
	return { count, quiet: opts.quiet ?? 2, modules };
}

/**
 * Render `text` to a self-contained SVG string (black modules on white, so it
 * scans regardless of the page theme). Uses one `<path>` for all dark modules.
 */
export async function encodeQrSvg(text: string, opts: QrOptions = {}): Promise<string> {
	const { count, quiet, modules } = await encodeQrMatrix(text, opts);
	const dim = count + quiet * 2;

	let d = '';
	for (let r = 0; r < count; r++) {
		for (let c = 0; c < count; c++) {
			if (modules[r][c]) d += `M${c + quiet} ${r + quiet}h1v1h-1z`;
		}
	}

	return (
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dim} ${dim}" ` +
		`shape-rendering="crispEdges" width="100%" height="100%">` +
		`<rect width="${dim}" height="${dim}" fill="#ffffff"/>` +
		`<path d="${d}" fill="#000000"/></svg>`
	);
}

export type QrDecoder = (
	data: Uint8ClampedArray,
	width: number,
	height: number
) => { data: string } | null;

/** Lazily load the jsQR decoder (used to scan camera frames). */
export async function loadQrDecoder(): Promise<QrDecoder> {
	const mod = await import('jsqr');
	return mod.default as unknown as QrDecoder;
}
