/* eslint-disable */
/**
 * audit-acronyms.ts — Find ALL-CAPS acronyms in prose that are NOT
 * wrapped in `{{...}}` (concept tooltip), `[[...]]` (protocol/RFC link),
 * or inside backtick code spans.
 *
 * Output:
 *   scripts/output/acronym-audit.json — structured data
 *   scripts/output/acronym-audit.md   — human-readable report
 *
 * Categorization:
 *   - protocol: matches an entry in allProtocols (by id, uppercased)
 *   - concept:  matches an existing concept term (case-insensitive on the
 *               surface form before any parenthesised expansion)
 *   - unknown:  needs a new concept entry
 *
 * Run: npx tsx scripts/audit-acronyms.ts
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { concepts } from '../src/lib/data/concepts';
import { allProtocols } from '../src/lib/data/protocols';
import { rfcs } from '../src/lib/data/rfcs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const DATA_DIR = join(REPO, 'src/lib/data');
const OUT_DIR = join(REPO, 'scripts/output');

const SKIP_FILES = new Set([
	'rfcs.ts',
	'pioneers.ts',
	'concepts.ts',
	'glossary.ts',
	'types.ts',
	'index.ts',
	'name-highlights.ts'
]);

// Only consider content in these field names (TypeScript object keys that
// appear before the bare token).
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
	'transition',
	'subtitle',
	'summary',
	'tagline',
	'body',
	'content'
]);

// Common English ALL-CAPS words / placeholders we don't want to wrap.
const BLOCKLIST = new Set([
	'I',
	'A',
	'AN',
	'THE',
	'AND',
	'OR',
	'BUT',
	'IF',
	'IN',
	'ON',
	'AT',
	'TO',
	'OF',
	'BY',
	'IS',
	'IT',
	'AS',
	'BE',
	'DO',
	'GO',
	'NO',
	'SO',
	'UP',
	'US',
	'WE',
	'YOU',
	'WHO',
	'WHY',
	'HOW',
	'OK',
	'TBD',
	'TODO',
	'FIXME',
	'XXX',
	'NOTE',
	'AKA',
	'ETC',
	'I.E',
	'E.G',
	'VS',
	'PS',
	'EU',
	'US',
	'UK',
	'UN',
	'YES',
	'NO',
	'NEW',
	'OLD',
	'BIG',
	'TOP',
	'END',
	'ALL',
	'ANY',
	'NOT',
	'NOW',
	'OUT',
	'OFF',
	'ONE',
	'TWO',
	'BIT',
	'BYE',
	'CAN',
	'GET',
	'PUT',
	'SET',
	'SEE',
	'WAY',
	'JFK', // surface noise; could add later
	'OK',
	'CIA',
	'FBI',
	'NSA' // organisations covered elsewhere if needed
]);

// HTTP verbs — handled in their own way, not concepts.
const HTTP_VERBS = new Set([
	'GET',
	'PUT',
	'POST',
	'DELETE',
	'PATCH',
	'HEAD',
	'OPTIONS',
	'CONNECT',
	'TRACE'
]);

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

/**
 * Build a per-character map: literalStart[i] = the offset of the opening
 * quote of the string literal containing position i, or -1 outside any
 * literal. Adapted from wrap-bare-concepts.ts.
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

function findFieldForOffset(src: string, offset: number): string | null {
	const before = src.slice(0, offset);
	const lines = before.split('\n');
	for (let i = lines.length - 1; i >= 0; i--) {
		const m = lines[i].match(/^\s*([a-zA-Z_][\w]*):\s*/);
		if (m) return m[1];
	}
	return null;
}

function stripMarkup(src: string): string {
	let s = blankOut(src, /\*\*\[\[[^\]]+\]\]\*\*/g);
	s = blankOut(s, /\[\[[^\]]+\]\]/g);
	s = blankOut(s, /\*\*\{\{[^}]+\}\}\*\*/g);
	s = blankOut(s, /\{\{[^}]+\}\}/g);
	s = blankOut(s, /`[^`]*`/g);
	s = blankOut(s, /https?:\/\/\S+/g);
	return s;
}

function lineColOf(src: string, idx: number): { line: number; col: number } {
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

function snippet(src: string, idx: number, len: number): string {
	const start = Math.max(0, idx - 40);
	const end = Math.min(src.length, idx + len + 40);
	return src.slice(start, end).replace(/\s+/g, ' ').trim();
}

// Build lookup tables ─────────────────────────────────────────────────
const protocolIds = new Set(allProtocols.map((p) => p.id.toLowerCase()));
// Map upper-case surface forms to protocol id when the id is itself an
// acronym (e.g. 'tcp' → TCP). Also includes some hand-mapped synonyms.
const protocolSurfaceMap = new Map<string, string>();
for (const p of allProtocols) {
	const upper = p.id.toUpperCase().replace(/-/g, '');
	protocolSurfaceMap.set(upper, p.id);
	// Also map the id itself (handles 'json-rpc' → JSONRPC etc.)
	protocolSurfaceMap.set(p.id.toUpperCase(), p.id);
}
// Hand mapped friendly surface forms
protocolSurfaceMap.set('HTTP', 'http1');
protocolSurfaceMap.set('HTTPS', 'http1');
protocolSurfaceMap.set('HTTP/1', 'http1');
protocolSurfaceMap.set('HTTP/2', 'http2');
protocolSurfaceMap.set('HTTP/3', 'http3');
protocolSurfaceMap.set('JSONRPC', 'json-rpc');
protocolSurfaceMap.set('JSON-RPC', 'json-rpc');

// Map concept term surface forms to concept id. We index by the
// uppercase first surface chunk (before parens / em dash / comma).
const conceptSurfaceMap = new Map<string, string>(); // UPPER → id
for (const c of concepts) {
	const surface = c.term.split(/\s+\(|—| — |, /)[0].trim();
	if (!surface) continue;
	conceptSurfaceMap.set(surface.toUpperCase(), c.id);
	// Also index any abbreviation in parens, e.g. "MTU (Maximum Transmission Unit)"
	const m = c.term.match(/^([A-Z][A-Z0-9/.\-]*)\s+\(/);
	if (m) conceptSurfaceMap.set(m[1].toUpperCase(), c.id);
}

// Regex: an acronym surface form. We want 2-8 character tokens of
// uppercase letters, optionally with embedded digits / slashes / dots /
// hyphens, that AREN'T sentence-initial common words. Lookarounds
// prevent matching inside larger camelCase or word tokens.
const ACRONYM_RE =
	/(?<![A-Za-z0-9_])([A-Z][A-Z0-9](?:[A-Z0-9./-]*[A-Z0-9])?)(?:s|s')?(?![A-Za-z0-9_])/g;

// Plural-friendly variant: also catch "RTTs", "ACKs", etc.
// The capturing group is the acronym, the suffix is optional.
function findHits(src: string) {
	const stripped = stripMarkup(src);
	const litMap = buildLiteralMap(src);
	const hits: {
		offset: number;
		length: number;
		surface: string;
		stem: string; // canonical UPPER without plural 's'
		field: string;
		line: number;
		col: number;
		context: string;
	}[] = [];
	let m: RegExpExecArray | null;
	ACRONYM_RE.lastIndex = 0;
	while ((m = ACRONYM_RE.exec(stripped)) !== null) {
		const surface = m[0];
		const stem = m[1].toUpperCase().replace(/[.\-]$/, '');
		// Must really be there in original (not blanked-out residue)
		if (src.slice(m.index, m.index + surface.length) !== surface) continue;
		// Must be in a string literal
		const ls = litMap[m.index];
		if (ls < 0) continue;
		const field = findFieldForOffset(src, m.index);
		if (!field || !PARSED_FIELDS.has(field)) continue;
		if (BLOCKLIST.has(stem) || BLOCKLIST.has(stem.replace(/[./].*/, ''))) continue;
		// Skip very short numeric-only or letter+digit-only? Keep 2+ char.
		if (stem.length < 2) continue;
		// Skip pure-digit (we won't catch them anyway since regex starts with [A-Z])
		const lc = lineColOf(src, m.index);
		hits.push({
			offset: m.index,
			length: surface.length,
			surface,
			stem,
			field,
			line: lc.line,
			col: lc.col,
			context: snippet(src, m.index, surface.length)
		});
	}
	return hits;
}

// Run ────────────────────────────────────────────────────────────────
const files = walk(DATA_DIR);

interface Bucketed {
	stem: string;
	totalCount: number;
	files: Map<string, number>;
	sampleContext: string;
	suggestedId?: string;
	category: 'protocol' | 'concept' | 'http-verb' | 'unknown';
}

const buckets = new Map<string, Bucketed>();

for (const f of files) {
	const src = readFileSync(f, 'utf8');
	const hits = findHits(src);
	const rel = relative(REPO, f);
	for (const h of hits) {
		// Classify
		let category: Bucketed['category'] = 'unknown';
		let suggestedId: string | undefined;
		if (protocolSurfaceMap.has(h.stem)) {
			category = 'protocol';
			suggestedId = protocolSurfaceMap.get(h.stem);
		} else if (conceptSurfaceMap.has(h.stem)) {
			category = 'concept';
			suggestedId = conceptSurfaceMap.get(h.stem);
		} else if (HTTP_VERBS.has(h.stem)) {
			category = 'http-verb';
		}
		// Skip RFCxxxx tokens (handled by audit-terms.ts)
		if (/^RFC\d+$/.test(h.stem)) continue;

		let b = buckets.get(h.stem);
		if (!b) {
			b = {
				stem: h.stem,
				totalCount: 0,
				files: new Map(),
				sampleContext: h.context,
				suggestedId,
				category
			};
			buckets.set(h.stem, b);
		}
		b.totalCount++;
		b.files.set(rel, (b.files.get(rel) ?? 0) + 1);
	}
}

const sorted = [...buckets.values()].sort((a, b) => b.totalCount - a.totalCount);

// Write reports ──────────────────────────────────────────────────────
mkdirSync(OUT_DIR, { recursive: true });

const unknownAcronyms = sorted.filter((b) => b.category === 'unknown');
const knownConcept = sorted.filter((b) => b.category === 'concept');
const knownProtocol = sorted.filter((b) => b.category === 'protocol');
const httpVerbs = sorted.filter((b) => b.category === 'http-verb');

let md = `# Acronym densification audit\n\n`;
md += `Generated: ${new Date().toISOString()}\n\n`;
md += `Total distinct bare acronyms: **${sorted.length}**\n\n`;
md += `- protocol-mapped: **${knownProtocol.length}**\n`;
md += `- existing concept: **${knownConcept.length}**\n`;
md += `- HTTP verb: **${httpVerbs.length}**\n`;
md += `- **unknown (need new glossary entry): ${unknownAcronyms.length}**\n\n`;

function section(title: string, rows: Bucketed[]) {
	let out = `## ${title} (${rows.length})\n\n`;
	out += `| Acronym | Count | Files | Suggested ID | Sample |\n|---|---:|---:|---|---|\n`;
	for (const r of rows.slice(0, 300)) {
		const files = [...r.files.keys()].slice(0, 3).join(', ');
		out += `| \`${r.stem}\` | ${r.totalCount} | ${r.files.size} | ${r.suggestedId ?? '—'} | ${r.sampleContext.replace(/\|/g, '\\|').slice(0, 100)} |\n`;
	}
	return out + '\n';
}

md += section('Unknown — need new concept entries', unknownAcronyms);
md += section('Known concept (just needs wrapping)', knownConcept);
md += section('Known protocol (needs link)', knownProtocol);
md += section('HTTP verbs', httpVerbs);

writeFileSync(join(OUT_DIR, 'acronym-audit.md'), md);
writeFileSync(
	join(OUT_DIR, 'acronym-audit.json'),
	JSON.stringify(
		{
			unknown: unknownAcronyms.map((b) => ({
				stem: b.stem,
				count: b.totalCount,
				files: [...b.files.keys()],
				sample: b.sampleContext
			})),
			concept: knownConcept.map((b) => ({
				stem: b.stem,
				suggestedId: b.suggestedId,
				count: b.totalCount,
				files: [...b.files.keys()]
			})),
			protocol: knownProtocol.map((b) => ({
				stem: b.stem,
				suggestedId: b.suggestedId,
				count: b.totalCount
			}))
		},
		null,
		2
	)
);

console.log('Wrote', relative(REPO, join(OUT_DIR, 'acronym-audit.md')));
console.log('  unknown:', unknownAcronyms.length);
console.log('  concept (needs wrap):', knownConcept.length);
console.log('  protocol (needs link):', knownProtocol.length);
console.log('  http-verb:', httpVerbs.length);
console.log('\nTop unknowns:');
for (const u of unknownAcronyms.slice(0, 40)) {
	console.log(
		`  ${u.stem.padEnd(10)} ${u.totalCount.toString().padStart(4)}  ${u.sampleContext.slice(0, 80)}`
	);
}
