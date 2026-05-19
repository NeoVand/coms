/* eslint-disable */
/**
 * wrap-bare-concepts.ts — Auto-wrap bare technical-term mentions
 * (RTT, handshake, retransmission, sliding window, …) into
 * `{{concept-id|surface}}` glossary tooltips.
 *
 * Companion to wrap-bare-rfcs.ts and wrap-bare-protocols.ts.
 *
 * Safety:
 *   1. Skip matches already inside [[…]] / {{…}} / backticks / URLs.
 *   2. Skip non-parsed fields (alt:, name:, title:, …).
 *   3. Skip very common English-word terms that would generate noise
 *      ("port", "header", "packet", …) — see LOW_PRIORITY.
 *   4. Skip terms shorter than 4 chars (NAT, IP, CDN — too noisy or
 *      handled by the protocol wrapper).
 *   5. Within a single string-literal value (one `text:` field), wrap
 *      only the FIRST occurrence per (concept, literal). Repeated
 *      mentions in the same paragraph would drown the page in dotted
 *      underlines.
 *
 * Run:    npx tsx scripts/wrap-bare-concepts.ts [--dry]
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { concepts } from '../src/lib/data/concepts';

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

// Same parser-aware fields as the other auto-wrappers.
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

// Concept terms that ARE technical concepts but whose surface form is a
// generic English word or an extremely common technical word. Wrapping
// every occurrence would drown the page.
const LOW_PRIORITY = new Set([
	'port',
	'socket',
	'frame',
	'packet',
	'header',
	'segment',
	'datagram',
	'gateway',
	'route',
	'session',
	'stream',
	'message',
	'request',
	'response',
	'address',
	'protocol',
	'service',
	'client',
	'server',
	'connection',
	'cache',
	'queue',
	'buffer',
	'broker',
	'channel',
	'token'
]);

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
	// Blank already-wrapped markup. We do NOT strip backtick code spans
	// here because most prose in this codebase lives inside backtick
	// TEMPLATE LITERALS — a naive `[^`]*` strip would terminate at the
	// first escaped \` and blank the entire paragraph. The literal-map
	// check (buildLiteralMap) prevents bad matches in code.
	let s = blankOut(src, /\*\*\[\[[^\]]+\]\]\*\*/g);
	s = blankOut(s, /\[\[[^\]]+\]\]/g);
	s = blankOut(s, /\*\*\{\{[^}]+\}\}\*\*/g);
	s = blankOut(s, /\{\{[^}]+\}\}/g);
	s = blankOut(s, /https?:\/\/\S+/g);
	return s;
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
 * Build a per-character map: literalStart[i] = the offset of the
 * opening quote of the string literal containing position i, or -1
 * if i is outside any literal. Walks the file once with a tiny state
 * machine that tracks line-comments, block-comments, and the three
 * quote kinds. Robust against the previous "find nearest preceding
 * quote" heuristic which conflated separate literals with the gap
 * between them.
 */
function buildLiteralMap(src: string): Int32Array {
	const map = new Int32Array(src.length).fill(-1);
	let i = 0;
	while (i < src.length) {
		const c = src[i];
		const next = src[i + 1];
		// Line comment
		if (c === '/' && next === '/') {
			while (i < src.length && src[i] !== '\n') i++;
			continue;
		}
		// Block comment
		if (c === '/' && next === '*') {
			i += 2;
			while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i++;
			i += 2;
			continue;
		}
		// String literal — single, double, or backtick
		if (c === '"' || c === "'" || c === '`') {
			const quote = c;
			const start = i;
			i++;
			while (i < src.length) {
				if (src[i] === '\\') {
					i += 2; // skip escaped char
					continue;
				}
				if (src[i] === quote) {
					// Mark every char from start..i (the quotes themselves
					// included) as belonging to this literal. The wrap
					// guards check `offset > start && offset < end`, so
					// the quote chars themselves are excluded.
					for (let k = start; k <= i; k++) map[k] = start;
					i++;
					break;
				}
				// Inside a backtick template, ${...} is an interpolation
				// — re-enter code mode until the matching `}`. We don't
				// track this for now (treat the whole template as one
				// literal); rare in this codebase.
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

function wholeWordRegex(term: string, flags = 'g'): RegExp {
	const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	// Use a softer boundary than the protocol script: allow trailing
	// apostrophes and hyphenated continuations to NOT count as boundary
	// breakers if the next char is alpha. We still avoid matching
	// inside larger words.
	return new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`, flags);
}

interface Hit {
	off: number;
	len: number;
	id: string;
	surface: string;
}

const reports: { file: string; touched: number }[] = [];
let grandTotal = 0;

for (const file of walk(DATA_DIR)) {
	const orig = readFileSync(file, 'utf8');
	const stripped = strip(orig);
	const litMap = buildLiteralMap(orig);

	// Per-file skip overrides. In diagram-definitions.ts the `definition`
	// field holds Mermaid sequence-diagram syntax, not prose — wrapping
	// inside it pollutes the diagram with tooltip markup the renderer
	// doesn't process. Captions and per-step explanations stay wrappable.
	const isDiagramFile = file.endsWith('diagram-definitions.ts');
	const skipDefinition = isDiagramFile;

	const allHits: Hit[] = [];

	for (const c of concepts) {
		// Skip: too short, low-priority, or term containing characters
		// the auto-wrap can't safely use as a label.
		if (c.term.length < 4) continue;
		if (LOW_PRIORITY.has(c.term.toLowerCase())) continue;

		// Some `term` strings are decorated, e.g. "MTU (Maximum
		// Transmission Unit)" — the parenthesised expansion should not
		// be part of the regex. Use the *first word group* before any
		// `(`, ` — `, or `,`.
		const surface = c.term.split(/\s+\(|—| — |, /)[0].trim();
		if (!surface || surface.length < 4) continue;
		if (LOW_PRIORITY.has(surface.toLowerCase())) continue;

		const re = wholeWordRegex(surface, 'gi');
		let m: RegExpExecArray | null;
		while ((m = re.exec(stripped)) !== null) {
			if (orig.slice(m.index, m.index + m[0].length) !== m[0]) continue;
			// CRITICAL: only wrap if the match is genuinely inside a string
			// literal (not bare TypeScript code like `topic: FrontierTopic`).
			const lstart = literalStartFor(litMap, m.index);
			if (lstart < 0) continue;
			const field = findFieldForOffset(orig, m.index);
			if (!field || !PARSED_FIELDS.has(field) || SKIP_FIELDS.has(field)) continue;
			if (skipDefinition && field === 'definition') continue;
			allHits.push({ off: m.index, len: m[0].length, id: c.id, surface: m[0] });
		}
	}

	// Resolve OVERLAPPING hits first: when two different concepts both
	// match the same span (e.g. "Handshake" matching inside the surface
	// of "Three-Way Handshake"), keep the longer surface — the more
	// specific concept wins. Without this, sequential right-to-left
	// replacement corrupts the wrap by inserting markup mid-token.
	allHits.sort((a, b) => (b.len - a.len) || (a.off - b.off));
	const claimed: Array<[number, number]> = []; // [start, end) ranges already claimed
	const nonOverlap: Hit[] = [];
	for (const h of allHits) {
		const start = h.off,
			end = h.off + h.len;
		const overlaps = claimed.some(([s, e]) => start < e && end > s);
		if (overlaps) continue;
		claimed.push([start, end]);
		nonOverlap.push(h);
	}

	// Then enforce "first occurrence per (concept, literal)" so a paragraph
	// that says "RTT" five times only gets the first wrapped.
	nonOverlap.sort((a, b) => a.off - b.off);
	const seen = new Set<string>(); // key: `${id}|${literalStart}`
	const finalHits: Hit[] = [];
	for (const h of nonOverlap) {
		const lstart = literalStartFor(litMap, h.off);
		const key = `${h.id}|${lstart}`;
		if (seen.has(key)) continue;
		seen.add(key);
		finalHits.push(h);
	}

	if (finalHits.length === 0) {
		reports.push({ file: relative(REPO, file), touched: 0 });
		continue;
	}

	// Apply right-to-left so offsets stay valid.
	finalHits.sort((a, b) => b.off - a.off);
	let out = orig;
	for (const h of finalHits) {
		const wrap = `{{${h.id}|${h.surface}}}`;
		out = out.slice(0, h.off) + wrap + out.slice(h.off + h.len);
	}
	if (!dry && out !== orig) writeFileSync(file, out);
	reports.push({ file: relative(REPO, file), touched: finalHits.length });
	grandTotal += finalHits.length;
}

console.log(dry ? '— DRY RUN —' : '— APPLIED —');
console.log(`wraps applied: ${grandTotal}`);
console.log('\nWraps per file (top 30):');
for (const r of reports
	.filter((x) => x.touched > 0)
	.sort((a, b) => b.touched - a.touched)
	.slice(0, 30))
	console.log(`  ${r.touched.toString().padStart(3)}  ${r.file}`);
