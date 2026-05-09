/* eslint-disable */
/**
 * wrap-bare-protocols.ts — Auto-wrap bare protocol-name mentions
 * (TCP, UDP, HTTP/2, QUIC, …) into `[[id|surface]]` cross-references.
 *
 * Same safety model as wrap-bare-rfcs.ts:
 *   1. Skip matches already inside [[…]] / {{…}} / backticks / URLs.
 *   2. Skip matches in fields the renderer doesn't parse (alt, name,
 *      title, oneLiner, …).
 *   3. Skip 2-char abbreviations (IP) — too noisy.
 *   4. The replacement uses the surface form actually present, so
 *      "HTTP/2" links via [[http2|HTTP/2]].
 *
 * Run with:    npx tsx scripts/wrap-bare-protocols.ts [--dry] [--max=N]
 *   --dry: report only, don't modify
 *   --max=N: wrap at most N occurrences per (protocol, file) pair so
 *            the page doesn't drown in dotted underlines. Default 3.
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
const SKIP_FIELDS = new Set([
	'alt',
	'name',
	'title',
	'org',
	'label',
	'attribution',
	'authors'
]);

const dry = process.argv.includes('--dry');
const maxArg = process.argv.find((a) => a.startsWith('--max='));
const MAX_PER_PAIR = maxArg ? parseInt(maxArg.split('=')[1], 10) : 3;

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
	let s = blankOut(src, /\*\*\[\[[^\]]+\]\]\*\*/g);
	s = blankOut(s, /\[\[[^\]]+\]\]/g);
	s = blankOut(s, /\*\*\{\{[^}]+\}\}\*\*/g);
	s = blankOut(s, /\{\{[^}]+\}\}/g);
	s = blankOut(s, /`[^`]*`/g);
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

	// On the per-protocol page (e.g. protocols/tcp.ts) we don't want to
	// link "TCP" back to itself — the user is already there. Detect self
	// from filename.
	const selfMatch = file.match(/\/protocols\/([a-z0-9-]+)\.ts$/);
	const selfProtoId = selfMatch ? selfMatch[1] : null;

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
			const field = findFieldForOffset(orig, m.index);
			allHits.push({ off: m.index, len: surface.length, id: p.id, surface, field });
		}
	}

	// Filter to wrappable (parsed-field, not in skip list).
	const wrappable = allHits.filter(
		(h) => h.field && PARSED_FIELDS.has(h.field) && !SKIP_FIELDS.has(h.field)
	);

	// Cap per (protocol, file) to MAX_PER_PAIR, sorted by appearance order.
	const perProto = new Map<string, Hit[]>();
	wrappable.sort((a, b) => a.off - b.off);
	for (const h of wrappable) {
		const arr = perProto.get(h.id) ?? [];
		if (arr.length < MAX_PER_PAIR) arr.push(h);
		perProto.set(h.id, arr);
	}
	const finalHits = [...perProto.values()].flat().sort((a, b) => b.off - a.off); // descending for safe replace

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
console.log(`max per (protocol, file): ${MAX_PER_PAIR}`);
console.log(`wraps applied: ${total}`);
console.log('\nWraps per file:');
for (const r of reports.filter((x) => x.touched > 0).sort((a, b) => b.touched - a.touched)) {
	console.log(`  ${r.touched.toString().padStart(3)}  ${r.file}`);
}
