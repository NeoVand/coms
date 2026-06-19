/* eslint-disable */
/**
 * wrap-bare-rfcs.ts — Auto-wrap every bare `RFC NNNN` mention into
 * `[[rfc:NNNN|RFC NNNN]]` so the link renders as a real reference.
 *
 * Safety rules:
 *   1. Skip matches already inside [[...]] or {{...}} or backticks or URLs.
 *   2. Only rewrite occurrences inside prose-bearing fields the renderer
 *      actually parses (text, description, caption, contribution, narrative,
 *      synopsis, oneLiner, ...). A whitelist below.
 *   3. Skip matches inside string-literal values for fields known not to be
 *      parsed (alt, name, title, org, label).  We detect "what field is this
 *      in" by scanning backwards line-by-line for the nearest `<key>:` token.
 *   4. Only wrap RFCs that exist in the registry — otherwise the link
 *      resolves to a "title TBD" stub, which is ugly. Audit-add missing
 *      RFCs to rfcs.ts first (already done in Phase 1).
 *
 * Run with:    npx tsx scripts/wrap-bare-rfcs.ts [--dry]
 *   --dry: print the would-edit summary, don't modify files
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

import { rfcs } from '../src/lib/data/rfcs';

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

// Fields whose string-literal values get rendered through parseRichText.
// Only matches inside one of these field assignments are wrapped.
// Parser-aware fields. `synopsis` and `oneLiner` were promoted to this
// list once their renderers (BookPartView, ChapterView, OutageView,
// FrontierView) were updated to use the shared RichText component.
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

// Fields we will explicitly skip even if a match lands on one of their lines.
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

const haveRfc = new Set(rfcs.map((r) => r.number));

interface Hit {
	file: string;
	line: number;
	col: number;
	match: string; // "RFC 9293" etc.
	number: string;
	field: string | null;
	skip?: 'unwrappedField' | 'unknownRfc' | 'inMarkup' | 'inCode';
}

function findFieldForOffset(src: string, offset: number): string | null {
	// Walk backwards line by line, find the closest line that has `<key>:`
	// at the start (with optional indentation).
	const before = src.slice(0, offset);
	const lines = before.split('\n');
	for (let i = lines.length - 1; i >= 0; i--) {
		// Allow trailing chars after key: like `text: '...`, `text:` newline
		const m = lines[i].match(/^\s*([a-zA-Z_][\w]*):\s*/);
		if (m) return m[1];
		// If we hit an opening brace on its own (a new array entry / object), stop
		if (/^\s*[{\[]/.test(lines[i])) {
			// Continue — the field key might be on the previous line still
		}
	}
	return null;
}

function isInsideMarkupOrCode(stripped: string, src: string, offset: number, len: number): boolean {
	// We rely on the same blanking strategy used by audit-terms.ts:
	// after stripping markup/backticks/URLs to spaces, if the bare match
	// is still readable in `stripped`, the original was unwrapped.
	return src.slice(offset, offset + len) !== stripped.slice(offset, offset + len);
}

function blankOut(s: string, re: RegExp) {
	return s.replace(re, (m) => ' '.repeat(m.length));
}

function strip(src: string) {
	// See wrap-bare-protocols.ts — no backtick stripping, otherwise the
	// outer template literal that holds most prose in this codebase
	// gets blanked at the first escaped backtick.
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

const reports: { file: string; touched: number; skipped: Hit[] }[] = [];

for (const file of walk(DATA_DIR)) {
	const orig = readFileSync(file, 'utf8');
	const stripped = strip(orig);

	// In diagram-definitions.ts the `definition` field holds Mermaid
	// sequence-diagram syntax — wraps inside it pollute the diagram, so
	// the captions and per-step text are the only places that get wrapped.
	const isDiagramFile = file.endsWith('diagram-definitions.ts');

	// Find every bare RFC mention in stripped (so wrapped ones are skipped).
	const hits: Hit[] = [];
	const re = /\bRFC[\s-]?(\d{1,5})\b/g;
	let m: RegExpExecArray | null;
	while ((m = re.exec(stripped)) !== null) {
		// Confirm the same offset in orig is the literal match (not
		// blanked-out residue from removed markup).
		if (orig.slice(m.index, m.index + m[0].length) !== m[0]) continue;
		const lc = lineColOf(orig, m.index);
		const field = findFieldForOffset(orig, m.index);
		const number = m[1];
		const hit: Hit = {
			file: relative(REPO, file),
			line: lc.line,
			col: lc.col,
			match: m[0],
			number,
			field
		};
		if (!haveRfc.has(number)) hit.skip = 'unknownRfc';
		else if (!field) hit.skip = 'unwrappedField';
		else if (SKIP_FIELDS.has(field)) hit.skip = 'unwrappedField';
		else if (!PARSED_FIELDS.has(field)) hit.skip = 'unwrappedField';
		else if (isDiagramFile && field === 'definition') hit.skip = 'unwrappedField';
		hits.push(hit);
	}

	const wrappable = hits.filter((h) => !h.skip);
	if (wrappable.length === 0) {
		reports.push({ file: relative(REPO, file), touched: 0, skipped: hits.filter((h) => h.skip) });
		continue;
	}

	// Apply replacements right-to-left so offsets stay valid.
	let out = orig;
	wrappable.sort((a, b) => b.col + b.line * 1e6 - (a.col + a.line * 1e6));
	// More robustly, sort by absolute offset descending.
	const offsets = wrappable.map((h) => {
		// Recompute offset from line/col since we don't store offset directly.
		// But we can also rederive: lineColOf walks bytes; reverse it.
		const lines = orig.split('\n');
		let off = 0;
		for (let i = 0; i < h.line - 1; i++) off += lines[i].length + 1;
		off += h.col - 1;
		return { off, len: h.match.length, num: h.number };
	});
	offsets.sort((a, b) => b.off - a.off);
	for (const o of offsets) {
		// The replacement: e.g., "RFC 9293" -> "[[rfc:9293|RFC 9293]]"
		const slice = out.slice(o.off, o.off + o.len);
		const wrap = `[[rfc:${o.num}|${slice}]]`;
		out = out.slice(0, o.off) + wrap + out.slice(o.off + o.len);
	}

	if (!dry && out !== orig) writeFileSync(file, out);
	reports.push({
		file: relative(REPO, file),
		touched: wrappable.length,
		skipped: hits.filter((h) => h.skip)
	});
}

// Summary
let totalTouched = 0;
let totalSkipped = 0;
for (const r of reports) {
	totalTouched += r.touched;
	totalSkipped += r.skipped.length;
}
console.log(dry ? '— DRY RUN —' : '— APPLIED —');
console.log(`wrapped: ${totalTouched}    skipped: ${totalSkipped}`);
console.log('\nWraps applied:');
for (const r of reports.filter((x) => x.touched > 0).sort((a, b) => b.touched - a.touched)) {
	console.log(`  ${r.touched.toString().padStart(3)}  ${r.file}`);
}
console.log('\nSkipped (sample):');
const skippedByReason = new Map<string, number>();
for (const r of reports)
	for (const h of r.skipped) skippedByReason.set(h.skip!, (skippedByReason.get(h.skip!) ?? 0) + 1);
for (const [reason, count] of skippedByReason) console.log(`  ${reason}: ${count}`);
const sampleUnwrappedField = reports
	.flatMap((r) =>
		r.skipped.filter((h) => h.skip === 'unwrappedField').map((h) => ({ ...h, file: r.file }))
	)
	.slice(0, 8);
for (const h of sampleUnwrappedField) {
	console.log(`    ${h.file}:${h.line}  field=${h.field}  ${h.match}`);
}
