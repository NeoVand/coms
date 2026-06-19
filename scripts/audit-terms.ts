/**
 * audit-terms.ts — Densification audit.
 *
 * Walks every prose-bearing TS file under `src/lib/data/` and flags places
 * where the prose mentions a known RFC / pioneer / concept *without* the
 * matching `[[…]]` or `{{…}}` link wrapper. Output is a markdown report at
 * `scripts/output/term-audit.md` plus a short summary on stdout.
 *
 * Editorial rule: we only report the first unwrapped mention per
 * (term, file) pair — wrapping every occurrence of "TCP" in tcp.ts would
 * drown the page in dotted underlines. The audit is a checklist, not a
 * rewrite engine.
 *
 * Run with:    npx tsx scripts/audit-terms.ts
 */
import { readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { rfcs } from '../src/lib/data/rfcs';
import { pioneers } from '../src/lib/data/pioneers';
import { concepts } from '../src/lib/data/concepts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const DATA_DIR = join(REPO, 'src/lib/data');
const OUT_DIR = join(REPO, 'scripts/output');
const OUT_FILE = join(OUT_DIR, 'term-audit.md');

// Files whose contents are the registry being checked — would trivially
// match every entry and produce nothing useful. Skip them.
const SKIP = new Set([
	'rfcs.ts',
	'pioneers.ts',
	'concepts.ts',
	'glossary.ts',
	'types.ts',
	'index.ts'
]);

// Concepts that are real terms in their dotted-tooltip sense but whose
// surface form is a generic English word — flagging every occurrence
// would create noise. We still want them wrapped on first appearance,
// so they stay in the audit, but they're grouped under "low-priority".
const LOW_PRIORITY_TERMS = new Set([
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
	'connection'
]);

// ─────────────────────────────────────────────────────────────────────────
// File walk
// ─────────────────────────────────────────────────────────────────────────

function walk(dir: string, out: string[] = []): string[] {
	for (const name of readdirSync(dir)) {
		const p = join(dir, name);
		const st = statSync(p);
		if (st.isDirectory()) walk(p, out);
		else if (name.endsWith('.ts') && !SKIP.has(name)) out.push(p);
	}
	return out;
}

// ─────────────────────────────────────────────────────────────────────────
// Strip already-wrapped markup so we don't false-positive on terms that
// are *already* tooltipped.  We replace each match with a same-length
// blank string so line/column offsets are preserved.
// ─────────────────────────────────────────────────────────────────────────

function blankOut(src: string, re: RegExp): string {
	return src.replace(re, (m) => ' '.repeat(m.length));
}

function stripWrappedMarkup(src: string): string {
	// Bracket cross-refs:  **[[…]]**, [[…]]
	let s = blankOut(src, /\*\*\[\[[^\]]+\]\]\*\*/g);
	s = blankOut(s, /\[\[[^\]]+\]\]/g);
	// Concept tooltips:  **{{…}}**, {{…}}
	s = blankOut(s, /\*\*\{\{[^}]+\}\}\*\*/g);
	s = blankOut(s, /\{\{[^}]+\}\}/g);
	// Backticked code spans (don't search inside `RFC 1234` literals)
	s = blankOut(s, /`[^`]*`/g);
	// URLs (lots of "rfc-editor.org/rfc/rfc1234" patterns we don't want)
	s = blankOut(s, /https?:\/\/\S+/g);
	return s;
}

// ─────────────────────────────────────────────────────────────────────────
// Detection
// ─────────────────────────────────────────────────────────────────────────

interface Hit {
	term: string;
	displayLabel: string; // what to suggest as wrap
	suggestion: string; // the literal `{{…}}` or `[[…]]` to insert
	priority: 'high' | 'low';
	line: number;
	col: number;
	context: string;
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
	const start = Math.max(0, idx - 30);
	const end = Math.min(src.length, idx + len + 30);
	return src.slice(start, end).replace(/\s+/g, ' ').trim();
}

function findFirstUnwrapped(
	stripped: string,
	original: string,
	pattern: RegExp
): { idx: number; matched: string } | null {
	pattern.lastIndex = 0;
	let m;
	while ((m = pattern.exec(stripped)) !== null) {
		// Confirm the same offset in `original` is genuinely the same text
		// (i.e., not blanked-out residue of removed markup).
		if (original.slice(m.index, m.index + m[0].length) === m[0]) {
			return { idx: m.index, matched: m[0] };
		}
	}
	return null;
}

// Build a regex that matches the term as a whole word, allowing for the
// kind of punctuation that surfaces in prose. We escape regex metachars
// in the term, then bracket with lookarounds so e.g. "TCP" won't match
// inside "TCPs" or "TCP/IP" (we want a separate match for each).
function wholeWordRegex(term: string, flags = 'g'): RegExp {
	const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	return new RegExp(`(?<![A-Za-z0-9_])${escaped}(?![A-Za-z0-9_])`, flags);
}

// ─────────────────────────────────────────────────────────────────────────
// Per-file scan
// ─────────────────────────────────────────────────────────────────────────

interface FileReport {
	path: string;
	missingRfcs: { number: string; line: number; col: number; context: string }[];
	unwrappedPioneers: Hit[];
	unwrappedConcepts: Hit[];
}

const rfcSet = new Set(rfcs.map((r) => r.number));

function scanFile(absPath: string): FileReport {
	const src = readFileSync(absPath, 'utf8');
	const stripped = stripWrappedMarkup(src);

	const rfcMentions = new Map<string, { idx: number }>();
	const rfcRe = /\bRFC[\s-]?(\d{1,5})\b/g;
	let m;
	while ((m = rfcRe.exec(stripped)) !== null) {
		const num = m[1];
		// Confirm it's really there in original
		if (src.slice(m.index, m.index + m[0].length) !== m[0]) continue;
		if (!rfcMentions.has(num)) rfcMentions.set(num, { idx: m.index });
	}

	const missingRfcs = [...rfcMentions.entries()]
		.filter(([num]) => !rfcSet.has(num))
		.map(([num, { idx }]) => {
			const lc = lineColOf(src, idx);
			return {
				number: num,
				line: lc.line,
				col: lc.col,
				context: snippet(src, idx, 4 + num.length)
			};
		})
		.sort((a, b) => Number(a.number) - Number(b.number));

	const unwrappedPioneers: Hit[] = [];
	for (const p of pioneers) {
		const hit = findFirstUnwrapped(stripped, src, wholeWordRegex(p.name));
		if (!hit) continue;
		const lc = lineColOf(src, hit.idx);
		unwrappedPioneers.push({
			term: p.name,
			displayLabel: p.name,
			suggestion: `[[pioneer:${p.id}|${p.name}]]`,
			priority: 'high',
			line: lc.line,
			col: lc.col,
			context: snippet(src, hit.idx, p.name.length)
		});
	}

	const unwrappedConcepts: Hit[] = [];
	for (const c of concepts) {
		// Case-insensitive match on the term surface form.
		const re = wholeWordRegex(c.term, 'gi');
		const hit = findFirstUnwrapped(stripped, src, re);
		if (!hit) continue;
		const lc = lineColOf(src, hit.idx);
		const priority: 'high' | 'low' = LOW_PRIORITY_TERMS.has(c.term.toLowerCase()) ? 'low' : 'high';
		unwrappedConcepts.push({
			term: c.term,
			displayLabel: hit.matched,
			suggestion: `{{${c.id}|${hit.matched}}}`,
			priority,
			line: lc.line,
			col: lc.col,
			context: snippet(src, hit.idx, hit.matched.length)
		});
	}

	return {
		path: relative(REPO, absPath),
		missingRfcs,
		unwrappedPioneers,
		unwrappedConcepts
	};
}

// ─────────────────────────────────────────────────────────────────────────
// Run
// ─────────────────────────────────────────────────────────────────────────

const files = walk(DATA_DIR);
const reports = files.map(scanFile);

// Aggregates ─────────────────────────────────────────────────────────────
const allMissingRfcs = new Map<string, number>(); // rfc number → file count
const allMissingPioneers = new Map<string, number>();
const allMissingConcepts = new Map<string, number>();

for (const r of reports) {
	for (const h of r.missingRfcs)
		allMissingRfcs.set(h.number, (allMissingRfcs.get(h.number) ?? 0) + 1);
	for (const h of r.unwrappedPioneers)
		allMissingPioneers.set(h.term, (allMissingPioneers.get(h.term) ?? 0) + 1);
	for (const h of r.unwrappedConcepts)
		allMissingConcepts.set(h.term, (allMissingConcepts.get(h.term) ?? 0) + 1);
}

// Render markdown ────────────────────────────────────────────────────────
function header(s: string, level = 2): string {
	return `${'#'.repeat(level)} ${s}\n\n`;
}

let md = '';
md += header('Term densification audit', 1);
md += `Generated: ${new Date().toISOString()}\n\n`;
md += `- Files scanned: **${reports.length}**\n`;
md += `- Distinct RFC numbers mentioned but **not in registry**: **${allMissingRfcs.size}**\n`;
md += `- Distinct pioneers mentioned without \`[[pioneer:…]]\` wrap: **${allMissingPioneers.size}** (of ${pioneers.length} catalogued)\n`;
md += `- Distinct concepts mentioned without \`{{…}}\` wrap: **${allMissingConcepts.size}** (of ${concepts.length} catalogued)\n\n`;

// ── Section 1: Missing RFCs (highest leverage) ──────────────────────────
md += header('1. RFCs mentioned in prose but missing from the registry');
md += `Add these to \`src/lib/data/rfcs.ts\`. Sorted by how many files mention them.\n\n`;
md += `| RFC | Files | Sample mention |\n|---|---:|---|\n`;
const sortedMissingRfcs = [...allMissingRfcs.entries()].sort((a, b) => b[1] - a[1]);
for (const [num, count] of sortedMissingRfcs) {
	const sample = reports
		.flatMap((r) => r.missingRfcs.filter((h) => h.number === num).map((h) => ({ r, h })))
		.slice(0, 1)[0];
	const ctx = sample ? sample.h.context.replace(/\|/g, '\\|') : '';
	md += `| RFC ${num} | ${count} | ${ctx} |\n`;
}
md += '\n';

// ── Section 2: Unwrapped pioneers ───────────────────────────────────────
md += header('2. Pioneers named without `[[pioneer:…]]`');
md += `Each row is the first unwrapped mention in a file. Apply once per section, not every occurrence.\n\n`;

const sortedPioneers = [...allMissingPioneers.entries()].sort((a, b) => b[1] - a[1]);
md += `| Pioneer | Files |\n|---|---:|\n`;
for (const [name, count] of sortedPioneers) md += `| ${name} | ${count} |\n`;
md += '\n';

md += header('Per-file pioneer hits', 3);
for (const r of reports) {
	if (!r.unwrappedPioneers.length) continue;
	md += `**\`${r.path}\`**\n`;
	for (const h of r.unwrappedPioneers) {
		md += `- L${h.line}:${h.col} — \`${h.suggestion}\`  · _${h.context.replace(/\|/g, '\\|')}_\n`;
	}
	md += '\n';
}

// ── Section 3: Unwrapped concepts ───────────────────────────────────────
md += header('3. Concepts in `concepts.ts` mentioned without `{{…}}`');
md += `Editorial rule: wrap on first appearance per section, not every time. \`low\` priority terms are common English words and should only be wrapped where the technical sense is the focus.\n\n`;

const sortedConcepts = [...allMissingConcepts.entries()].sort((a, b) => b[1] - a[1]);
md += `| Term | Files |\n|---|---:|\n`;
for (const [term, count] of sortedConcepts.slice(0, 60)) md += `| ${term} | ${count} |\n`;
if (sortedConcepts.length > 60) md += `| _…${sortedConcepts.length - 60} more_ | |\n`;
md += '\n';

md += header('Per-file concept hits (high priority)', 3);
for (const r of reports) {
	const high = r.unwrappedConcepts.filter((h) => h.priority === 'high');
	if (!high.length) continue;
	md += `**\`${r.path}\`** — ${high.length} term(s)\n`;
	for (const h of high.slice(0, 25)) {
		md += `- L${h.line} — \`${h.suggestion}\`  · _${h.context.replace(/\|/g, '\\|')}_\n`;
	}
	if (high.length > 25) md += `- _…${high.length - 25} more in this file_\n`;
	md += '\n';
}

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_FILE, md);

// stdout summary
console.log('Term audit complete →', relative(REPO, OUT_FILE));
console.log(`  Missing RFCs:        ${allMissingRfcs.size}`);
console.log(`  Unwrapped pioneers:  ${allMissingPioneers.size} / ${pioneers.length}`);
console.log(`  Unwrapped concepts:  ${allMissingConcepts.size} / ${concepts.length}`);
console.log('  Top missing RFCs (by file count):');
for (const [num, count] of sortedMissingRfcs.slice(0, 10))
	console.log(`    RFC ${num}  (${count} files)`);
