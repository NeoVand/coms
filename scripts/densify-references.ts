/* eslint-disable */
/**
 * densify-references.ts — Wrap unwrapped pioneer names and RFC
 * citations in prose.
 *
 * Companion to densify-protocols.ts (which handles `[[id|label]]`
 * protocol links) and densify-concepts.ts (which handles
 * `{{conceptId|label}}` tooltips). This script picks up the *typed*
 * cross-reference syntax for two more entity classes:
 *
 *   [[pioneer:vint-cerf|Vint Cerf]]   — pioneer bio link
 *   [[rfc:793|RFC 793]]               — RFC citation link
 *
 * Both render through `RichText` as colored links with hover behavior.
 * The book chapters were already linking some pioneers/RFCs manually,
 * but plenty of plain-text mentions still sit unlinked ("Vint Cerf and
 * Bob Kahn saw what others didn't…") — those are what this script
 * catches.
 *
 * Run:
 *   npx tsx scripts/densify-references.ts          # dry run
 *   npx tsx scripts/densify-references.ts --apply  # write
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';
import { pioneers } from '../src/lib/data/pioneers';
import { rfcs } from '../src/lib/data/rfcs';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');

// ─────────────────────────────────────────────────────────────────────
// Alias entries — each one is (pattern, replacement-wrap).
// ─────────────────────────────────────────────────────────────────────

interface RefAlias {
	kind: 'pioneer' | 'rfc';
	id: string;
	pattern: string;
	/** Builds the replacement wrap given the matched surface form. */
	wrap: (match: string) => string;
}

function buildAliases(): RefAlias[] {
	const out: RefAlias[] = [];

	// Pioneers: full-name match → [[pioneer:id|<matched>]].
	// We do not match surnames alone (too ambiguous: "Cerf" could
	// reference a relative, a paper, a building). Full names are
	// reliably about the pioneer entry.
	for (const p of pioneers) {
		const name = p.name.trim();
		if (!name.includes(' ')) continue; // skip single-token "names"
		out.push({
			kind: 'pioneer',
			id: p.id,
			pattern: name,
			wrap: (m) => `[[pioneer:${p.id}|${m}]]`
		});
	}

	// RFCs: "RFC <number>" → [[rfc:<number>|RFC <number>]]. We match
	// the *number* registered in rfcs.ts rather than using a generic
	// `RFC \d+` regex, so unregistered RFC numbers stay plain text
	// (visible to the audit script as something to add a stub for).
	for (const r of rfcs) {
		out.push({
			kind: 'rfc',
			id: r.number,
			pattern: `RFC ${r.number}`,
			wrap: (m) => `[[rfc:${r.number}|${m}]]`
		});
	}

	// Longest first so multi-token pioneer names win over single tokens
	// they share (none today, but safe for future entries).
	out.sort((a, b) => b.pattern.length - a.pattern.length);
	return out;
}

const ALIASES = buildAliases();

// ─────────────────────────────────────────────────────────────────────
// Same denylist + Mermaid heuristic as the other densifiers.
// ─────────────────────────────────────────────────────────────────────

const PROPERTY_DENYLIST = new Set([
	'imagePath',
	'src',
	'credit',
	'url',
	'href',
	'code',
	'mermaid',
	'id',
	'kind',
	'partId',
	'chapterId',
	'protocolId',
	'pioneerId',
	'outageId',
	'frontierId',
	'conceptId',
	'rfcId',
	'number',
	'title',
	'alt',
	'attribution',
	'name',
	'years',
	'org',
	'role',
	'date',
	'duration',
	'scale',
	'time',
	'category',
	'tagline',
	'abbreviation',
	'port',
	'rfc',
	'rfcNumber',
	'language',
	'label',
	'key',
	'filter',
	'bits',
	'format',
	'latency',
	'throughput',
	'overhead',
	'status',
	'term',
	'value',
	'aspect'
]);

function looksLikeMermaid(s: string): boolean {
	const head = s.replace(/^\s+/, '').slice(0, 40);
	return /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|erDiagram|C4Context|xychart-beta)\b/.test(
		head
	);
}

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

interface WrapStat {
	id: string;
	count: number;
	samples: string[];
}

function applyAlias(text: string, alias: RefAlias, stat: WrapStat): string {
	const startsWord = /^[A-Za-z0-9_]/.test(alias.pattern);
	const endsWord = /[A-Za-z0-9_]$/.test(alias.pattern.slice(-1));
	// The text we scan is *source code*, not interpreted strings. `\n`,
	// `\t`, `\"` etc. appear as two characters where the second one is
	// a word char (n / t / etc.). A naive `[^A-Za-z0-9_]` left boundary
	// then refuses to fire and a name right after `\n\n` in a template
	// literal goes unmatched. Treat any `\X` escape as a logical
	// non-word boundary on the left side.
	const left = startsWord ? '(?:^|[^A-Za-z0-9_]|\\\\.)' : '';
	const right = endsWord ? '(?![A-Za-z0-9_])' : '';
	const re = new RegExp(`${left}(${escapeRegex(alias.pattern)})${right}`, 'g');

	return text.replace(re, (m, captured: string, offset: number) => {
		stat.count++;
		if (stat.samples.length < 3) {
			const ctx = text.slice(Math.max(0, offset - 20), offset + m.length + 20);
			stat.samples.push(ctx.replace(/\s+/g, ' ').trim());
		}
		const lead = m.slice(0, m.length - captured.length);
		return `${lead}${alias.wrap(captured)}`;
	});
}

function densifyString(src: string, stats: Map<string, WrapStat>): string {
	let work = src;
	for (const alias of ALIASES) {
		const key = `${alias.kind}:${alias.id}`;
		const stat = stats.get(key) ?? { id: key, count: 0, samples: [] };
		stats.set(key, stat);

		const tokenRe = /(\[\[[^\]]+\]\]|\(\([^)]+\)\)|\{\{[^}]+\}\})/g;
		const out: string[] = [];
		let lastIdx = 0;
		let m: RegExpExecArray | null;
		while ((m = tokenRe.exec(work)) !== null) {
			if (m.index > lastIdx) out.push(applyAlias(work.slice(lastIdx, m.index), alias, stat));
			out.push(m[0]);
			lastIdx = m.index + m[0].length;
		}
		if (lastIdx < work.length) out.push(applyAlias(work.slice(lastIdx), alias, stat));
		work = out.join('');
	}
	return work;
}

function enclosingPropertyName(node: ts.Node): string | undefined {
	let n: ts.Node | undefined = node.parent;
	while (n) {
		if (ts.isPropertyAssignment(n)) {
			const name = n.name;
			if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
			return undefined;
		}
		if (ts.isArrayLiteralExpression(n)) {
			n = n.parent;
			continue;
		}
		if (ts.isParenthesizedExpression(n) || ts.isAsExpression(n) || ts.isSatisfiesExpression(n)) {
			n = n.parent;
			continue;
		}
		return undefined;
	}
	return undefined;
}

interface FileResult {
	path: string;
	wrappedTotal: number;
	stats: Map<string, WrapStat>;
	updated: string;
	changed: boolean;
}

function processFile(filePath: string): FileResult {
	const sourceText = readFileSync(filePath, 'utf8');
	const sf = ts.createSourceFile(filePath, sourceText, ts.ScriptTarget.Latest, true);

	const stats = new Map<string, WrapStat>();
	const edits: { start: number; end: number; replacement: string }[] = [];

	function visit(node: ts.Node) {
		if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
			const propName = enclosingPropertyName(node);
			const innerStart = node.getStart() + 1;
			const innerEnd = node.getEnd() - 1;
			const inner = sourceText.slice(innerStart, innerEnd);

			if (propName && PROPERTY_DENYLIST.has(propName)) {
				// skip
			} else if (looksLikeMermaid(inner)) {
				// skip
			} else {
				const updated = densifyString(inner, stats);
				if (updated !== inner) {
					edits.push({ start: innerStart, end: innerEnd, replacement: updated });
				}
			}
		}
		ts.forEachChild(node, visit);
	}
	visit(sf);

	edits.sort((a, b) => b.start - a.start);
	let updated = sourceText;
	for (const e of edits) updated = updated.slice(0, e.start) + e.replacement + updated.slice(e.end);

	let total = 0;
	for (const s of stats.values()) total += s.count;
	return { path: filePath, wrappedTotal: total, stats, updated, changed: total > 0 };
}

function listDir(p: string, ext: string): string[] {
	return readdirSync(p)
		.filter((n) => n.endsWith(ext))
		.map((n) => join(p, n));
}

function defaultTargets(): string[] {
	const parts = listDir(join(REPO, 'src/lib/data/book/parts'), '.ts');
	const stories = listDir(join(REPO, 'src/lib/data/category-stories'), '.ts').filter(
		(p) => !p.endsWith('/index.ts') && !p.endsWith('/types.ts')
	);
	const protocols = listDir(join(REPO, 'src/lib/data/protocols'), '.ts').filter(
		(p) => !p.endsWith('/index.ts')
	);
	const foundations = join(REPO, 'src/lib/data/concept-foundations.ts');
	const others = [
		'src/lib/data/concepts.ts',
		'src/lib/data/frontier.ts',
		'src/lib/data/journeys.ts',
		'src/lib/data/category-deep-dives.ts',
		'src/lib/data/outages.ts',
		'src/lib/data/comparison/pairs.ts'
		// pioneers.ts + rfcs.ts deliberately excluded — they're the
		// source-of-truth registries, no need to self-link inside.
	].map((p) => join(REPO, p));
	return [...parts, ...stories, ...protocols, foundations, ...others];
}

function parseArgs(argv: string[]): { apply: boolean; files: string[] } {
	const args: { apply: boolean; files: string[] } = { apply: false, files: [] };
	for (const a of argv.slice(2)) {
		if (a === '--apply') args.apply = true;
		else if (a.startsWith('--files=')) {
			const list = a.slice('--files='.length).split(',').filter(Boolean);
			args.files = list.map((p) => (p.startsWith('/') ? p : join(REPO, p)));
		} else if (a === '--help' || a === '-h') {
			console.log(`Usage: npx tsx scripts/densify-references.ts [--apply] [--files=path,path]`);
			process.exit(0);
		}
	}
	return args;
}

function main() {
	const { apply, files } = parseArgs(process.argv);
	const targets = files.length > 0 ? files : defaultTargets();

	console.log(
		`Pioneer aliases: ${pioneers.length}, RFC aliases: ${rfcs.length} (× 2 spacing variants)`
	);

	let grandTotal = 0;
	const grandStats = new Map<string, number>();
	const fileSummaries: { path: string; total: number }[] = [];

	for (const f of targets) {
		const result = processFile(f);
		grandTotal += result.wrappedTotal;
		for (const [id, s] of result.stats) {
			grandStats.set(id, (grandStats.get(id) ?? 0) + s.count);
		}
		fileSummaries.push({ path: f, total: result.wrappedTotal });
		if (result.changed) {
			const rel = relative(REPO, f);
			console.log(`\n${rel}  +${result.wrappedTotal} wraps`);
			const top = [...result.stats.values()]
				.filter((s) => s.count > 0)
				.sort((a, b) => b.count - a.count)
				.slice(0, 8);
			for (const s of top) {
				console.log(
					`  ${s.id.padEnd(28)} ${String(s.count).padStart(4)}   e.g. ${s.samples[0] ?? ''}`
				);
			}
			if (apply) {
				writeFileSync(f, result.updated, 'utf8');
			}
		}
	}

	console.log('\n──────────────────────────────────────────');
	console.log(
		`Total wraps: ${grandTotal} across ${fileSummaries.filter((f) => f.total > 0).length} files`
	);
	const sorted = [...grandStats.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
	for (const [id, n] of sorted.slice(0, 25)) {
		console.log(`  ${id.padEnd(28)} ${String(n).padStart(4)}`);
	}
	if (!apply) {
		console.log('\n(dry run — pass --apply to write)');
	} else {
		console.log('\nWritten.');
	}
}

main();
