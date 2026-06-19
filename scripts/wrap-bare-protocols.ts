/* eslint-disable */
/**
 * wrap-bare-protocols.ts — Auto-wrap bare protocol-name mentions
 * (TCP, UDP, HTTP/2, QUIC, …) into `[[id|surface]]` cross-references.
 *
 * Safety:
 *   1. Skip matches already inside [[…]] / {{…}} / backticks / URLs.
 *   2. Skip matches in fields the renderer doesn't parse (alt, name,
 *      title, …).
 *   3. Skip 2-char abbreviations (IP) — too noisy.
 *   4. Skip self-references (protocols/tcp.ts won't link "TCP" to itself).
 *   5. Within a single string-literal value, wrap only the FIRST
 *      occurrence per (protocol, literal). A paragraph that mentions
 *      "TCP" five times gets one dotted underline, not five — but a
 *      file with eight narratives gets eight wraps if TCP appears in
 *      each.
 *
 * Run with:    npx tsx scripts/wrap-bare-protocols.ts [--dry]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { allProtocols } from '../src/lib/data';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const DATA_DIR = join(REPO, 'src/lib/data');

const SKIP_FILES = new Set([
	'rfcs.ts',
	'pioneers.ts',
	'concepts.ts',
	'glossary.ts',
	'types.ts',
	'index.ts'
]);

// Parser-aware fields (the renderer walks these through parseRichText).
// `synopsis` and `oneLiner` were promoted to the parsed list when their
// renderers (BookPartView, ChapterView) were updated to use RichText.
const PARSED_FIELDS = new Set([
	'text',
	'description',
	'caption',
	'contribution',
	'narrative',
	'definition',
	'analogy',
	'mistake',
	'setup',
	'consequence',
	'resolution',
	'lesson',
	'overview',
	'longDefinition',
	'abstract',
	'synopsis',
	'oneLiner',
	'transition'
]);
const SKIP_FIELDS = new Set(['alt', 'name', 'title', 'org', 'label', 'attribution', 'authors']);

const dry = process.argv.includes('--dry');

function walk(dir: string, out: string[] = []): string[] {
	for (const n of readdirSync(dir)) {
		const p = join(dir, n);
		const st = statSync(p);
		if (st.isDirectory()) walk(p, out);
		else if (n.endsWith('.ts') && !SKIP_FILES.has(n)) out.push(p);
	}
	return out;
}

function blankOut(s: string, re: RegExp) {
	return s.replace(re, (m) => ' '.repeat(m.length));
}
function strip(src: string) {
	// Blank out already-wrapped markup so we don't re-match. We do NOT
	// strip backtick code spans here because most prose in this codebase
	// lives inside backtick TEMPLATE LITERALS — a naive `[^`]*` strip
	// would terminate at the first escaped \` and blank the entire
	// paragraph. The literal-map check (buildLiteralMap) prevents bad
	// matches in code; matching inside an inline `code` span inside a
	// template literal is acceptable.
	let s = blankOut(src, /\*\*\[\[[^\]]+\]\]\*\*/g);
	s = blankOut(s, /\[\[[^\]]+\]\]/g);
	s = blankOut(s, /\*\*\{\{[^}]+\}\}\*\*/g);
	s = blankOut(s, /\{\{[^}]+\}\}/g);
	s = blankOut(s, /https?:\/\/\S+/g);
	return s;
}

function lineColOf(src: string, idx: number) {
	let line = 1,
		col = 1;
	for (let i = 0; i < idx; i++) {
		if (src.charCodeAt(i) === 10) {
			line++;
			col = 1;
		} else col++;
	}
	return { line, col };
}

function findFieldForOffset(src: string, offset: number): string | null {
	const before = src.slice(0, offset);
	const lines = before.split('\n');
	for (let i = lines.length - 1; i >= 0; i--) {
		const m = lines[i].match(/^\s*([a-zA-Z_][\w]*):\s*/);
		if (m) return m[1];
	}
	return null;
}

/**
 * Build a per-character map: map[i] = the offset of the opening quote
 * of the string literal containing position i, or -1 if outside any
 * literal. Walks the file with a small state machine that handles
 * line/block comments and escaped quotes.
 *
 * The previous "scan backwards for nearest quote" heuristic was wrong
 * — it conflated separate literals with the gap between them and let
 * matches in TypeScript code (e.g. `protocols: ['tcp']`) be wrapped.
 */
function buildLiteralMap(src: string): Int32Array {
	const map = new Int32Array(src.length).fill(-1);
	let i = 0;
	while (i < src.length) {
		const c = src[i];
		const next = src[i + 1];
		if (c === '/' && next === '/') {
			while (i < src.length && src[i] !== '\n') i++;
			continue;
		}
		if (c === '/' && next === '*') {
			i += 2;
			while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
			i += 2;
			continue;
		}
		if (c === '"' || c === "'" || c === '`') {
			const quote = c;
			const start = i;
			i++;
			while (i < src.length) {
				if (src[i] === '\\') {
					i += 2;
					continue;
				}
				if (src[i] === quote) {
					for (let k = start; k <= i; k++) map[k] = start;
					i++;
					break;
				}
				i++;
			}
			continue;
		}
		i++;
	}
	return map;
}

function literalStartFor(map: Int32Array, offset: number): number {
	if (offset < 0 || offset >= map.length) return -1;
	return map[offset];
}

// Build the regex for a protocol surface form. Uses lookarounds that
// disallow alphanumeric/underscore on either side, AND disallow `/` and
// `-` so we don't grab "TCP/IP" or "TCP-AO" which would mis-link.
function surfaceRegex(surface: string): RegExp {
	const escaped = surface.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(?<![A-Za-z0-9_/-])${escaped}(?![A-Za-z0-9_/-])`, 'g');
}

interface Hit {
	off: number;
	len: number;
	id: string;
	surface: string;
	field: string | null;
}

const reports: { file: string; touched: number; hits: Hit[] }[] = [];

for (const file of walk(DATA_DIR)) {
	const orig = readFileSync(file, 'utf8');
	const stripped = strip(orig);
	const litMap = buildLiteralMap(orig);

	// On the per-protocol page (e.g. protocols/tcp.ts) we don't want to
	// link "TCP" back to itself — the user is already there. Detect self
	// from filename.
	const selfMatch = file.match(/\/protocols\/([a-z0-9-]+)\.ts$/);
	const selfProtoId = selfMatch ? selfMatch[1] : null;

	// In diagram-definitions.ts the `definition` field holds Mermaid
	// sequence-diagram syntax, not prose. Skip it so the captions and
	// per-step explanations are the only places that get wrapped.
	const isDiagramFile = file.endsWith('diagram-definitions.ts');

	const allHits: Hit[] = [];
	for (const p of allProtocols) {
		if (p.id === selfProtoId) continue; // skip self-references
		const surface = p.abbreviation || p.id.toUpperCase();
		if (surface.length < 3) continue; // 2-char abbreviations would be too noisy
		const re = surfaceRegex(surface);
		let m: RegExpExecArray | null;
		while ((m = re.exec(stripped)) !== null) {
			// Confirm same offset in `orig` is the literal surface (not
			// blanked-out residue from removed markup).
			if (orig.slice(m.index, m.index + surface.length) !== surface) continue;
			// Only wrap inside string literals (skip bare TypeScript code
			// like `protocols: ['tcp']`).
			if (literalStartFor(litMap, m.index) < 0) continue;
			const field = findFieldForOffset(orig, m.index);
			allHits.push({ off: m.index, len: surface.length, id: p.id, surface, field });
		}
	}

	// Filter to wrappable (parsed-field, not in skip list).
	const wrappable = allHits.filter(
		(h) =>
			h.field &&
			PARSED_FIELDS.has(h.field) &&
			!SKIP_FIELDS.has(h.field) &&
			!(isDiagramFile && h.field === 'definition')
	);

	// Resolve overlap: if two protocols match overlapping spans, keep
	// the longer surface (e.g. "HTTP/2" beats "HTTP" if both could ever
	// match the same place). Defensive — should be rare for protocols
	// but the rule is uniform with the concept wrapper.
	wrappable.sort((a, b) => b.len - a.len || a.off - b.off);
	const claimed: Array<[number, number]> = [];
	const nonOverlap: Hit[] = [];
	for (const h of wrappable) {
		const start = h.off,
			end = h.off + h.len;
		if (claimed.some(([s, e]) => start < e && end > s)) continue;
		claimed.push([start, end]);
		nonOverlap.push(h);
	}

	// Enforce "first occurrence per (protocol, literal)" so a paragraph
	// that mentions TCP five times only gets the first wrapped.
	nonOverlap.sort((a, b) => a.off - b.off);
	const seen = new Set<string>(); // key: `${id}|${literalStart}`
	const accepted: Hit[] = [];
	for (const h of nonOverlap) {
		const lstart = literalStartFor(litMap, h.off);
		const key = `${h.id}|${lstart}`;
		if (seen.has(key)) continue;
		seen.add(key);
		accepted.push(h);
	}
	const finalHits = accepted.sort((a, b) => b.off - a.off); // descending for safe replace

	if (finalHits.length === 0) {
		reports.push({ file: relative(REPO, file), touched: 0, hits: [] });
		continue;
	}

	let out = orig;
	for (const h of finalHits) {
		const wrap = `[[${h.id}|${h.surface}]]`;
		out = out.slice(0, h.off) + wrap + out.slice(h.off + h.len);
	}
	if (!dry && out !== orig) writeFileSync(file, out);
	reports.push({ file: relative(REPO, file), touched: finalHits.length, hits: finalHits });
}

let total = 0;
for (const r of reports) total += r.touched;
console.log(dry ? '— DRY RUN —' : '— APPLIED —');
console.log('rule: first match per (protocol, string literal)');
console.log(`wraps applied: ${total}`);
console.log('\nWraps per file:');
for (const r of reports.filter((x) => x.touched > 0).sort((a, b) => b.touched - a.touched)) {
	console.log(`  ${r.touched.toString().padStart(3)}  ${r.file}`);
}
