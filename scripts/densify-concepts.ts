/* eslint-disable */
/**
 * densify-concepts.ts — Wrap unwrapped concept-term mentions in prose.
 *
 * Companion to densify-protocols.ts. That one handles `[[id|label]]`
 * protocol links; this one handles `{{conceptId|label}}` glossary
 * tooltips. The renderers already understand both — most prose just
 * doesn't *use* the tooltip syntax aggressively yet, so chapters look
 * sparse compared to how rich they could read.
 *
 * Strategy mirrors the protocol densifier:
 *   1. Walk every target file with the TypeScript AST, find string
 *      literals + no-substitution template literals, skip identifier /
 *      raw-rendered fields via PROPERTY_DENYLIST.
 *   2. Inside each prose string, tokenize around protected zones
 *      (`[[…]]`, `((…))`, `{{…}}`) and only operate on plain spans.
 *   3. For each concept alias (longest first), wrap as `{{id|matched}}`.
 *
 * Differences from the protocol densifier:
 *   - Aliases are built dynamically from the live `concepts` registry,
 *     not hand-curated.
 *   - Term casing is mixed (multi-word terms, acronyms in parens), so
 *     the matcher handles both case-insensitive multi-word forms AND
 *     case-sensitive acronyms extracted from parenthetical expansions.
 *   - An explicit BLOCKLIST drops overly-generic single-word terms
 *     ("port", "packet", "frame", …) — wrapping every "packet" in
 *     the corpus turns the prose into a sea of dotted underlines and
 *     adds no value.
 *
 * Run:
 *   npx tsx scripts/densify-concepts.ts          # dry run
 *   npx tsx scripts/densify-concepts.ts --apply  # write
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';
import { concepts } from '../src/lib/data/concepts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');

// ─────────────────────────────────────────────────────────────────────
// BLOCKLIST — concept IDs whose surface form is too generic to wrap
// liberally. Wrapping every "packet" or "client" pollutes the prose.
// These concepts remain in the registry (so existing `{{packet|…}}`
// wraps still resolve), they're just not *auto-added* by this script.
// ─────────────────────────────────────────────────────────────────────

const BLOCKLIST = new Set([
	'port',
	'socket',
	'frame',
	'packet',
	'header',
	'segment',
	'datagram',
	'gateway',
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
	'broadcast',
	'cookie',
	'certificate',
	'codec',
	'route',
	'queue',
	'cache',
	'checksum',
	'firewall',
	'router',
	'switch',
	'middlebox',
	'payload',
	'exchange',
	// Too common in casual prose ("in transit", "the handshake"…).
	// Skipping bulk auto-wrap; the existing manual `{{transit|…}}`
	// and `{{handshake|…}}` wraps still resolve.
	'transit',
	'handshake'
]);

// ─────────────────────────────────────────────────────────────────────
// Build alias entries from the live concepts registry.
//
// For a concept like `term: 'CIDR (Classless Inter-Domain Routing)'`
// we emit *both* the bare acronym "CIDR" (case-sensitive — the
// uppercase letters carry the semantics) and the expansion "Classless
// Inter-Domain Routing" (case-insensitive multi-word phrase).
//
// For a concept like `term: 'Connection-Oriented'` we emit just
// "Connection-Oriented", case-insensitive.
// ─────────────────────────────────────────────────────────────────────

interface ConceptAlias {
	id: string;
	pattern: string;
	caseSensitive: boolean;
}

function buildAliases(): ConceptAlias[] {
	const out: ConceptAlias[] = [];

	/** ALL-CAPS / hyphenated acronyms like "RTT", "CIDR", "TCP/IP". */
	const isAcronym = (s: string) => /^[A-Z][A-Z0-9./-]*$/.test(s);
	/** Multi-token phrases — at least one space or hyphen between
	 *  letter clusters, e.g. "Round-Trip Time" or "Bandwidth-Delay
	 *  Product". Hyphenated *single* words like "Connection-Oriented"
	 *  count too. */
	const isMultiWord = (s: string) => /[\s-]/.test(s);

	for (const c of concepts) {
		if (BLOCKLIST.has(c.id)) continue;

		const term = c.term.trim();

		// Acronym + expansion split: `Foo (Bar Baz)`.  Treat the parens
		// as an alias *only* if at least one side is an acronym — that's
		// what marks them as equivalent surface forms.  Cases like
		// "Transit (Network)" or "Partition (Kafka)" use parens as a
		// scope disambiguator, not an alias, so we drop the parens
		// content there.
		const m = term.match(/^([^()]+?)\s*\(([^)]+)\)\s*$/);
		if (m) {
			const lead = m[1].trim();
			const inside = m[2].trim();
			const leadAcr = isAcronym(lead);
			const insideAcr = isAcronym(inside);

			out.push({
				id: c.id,
				pattern: lead,
				// Single-word non-acronym leads ("Transit", "Notification",
				// "Partition") match case-sensitively so we don't bulk-wrap
				// every casual lowercase usage.
				caseSensitive: leadAcr || !isMultiWord(lead)
			});

			// Only emit the parens alias when it's clearly an alternate
			// surface form (i.e. one side is an acronym).
			if ((leadAcr || insideAcr) && inside !== lead) {
				out.push({
					id: c.id,
					pattern: inside,
					caseSensitive: insideAcr || !isMultiWord(inside)
				});
			}
		} else {
			out.push({
				id: c.id,
				pattern: term,
				// Acronyms + single-word common terms → case-sensitive.
				// Multi-word phrases → case-insensitive (specific enough
				// that "round-trip time" and "Round-Trip Time" should
				// both wrap).
				caseSensitive: isAcronym(term) || !isMultiWord(term)
			});
		}
	}

	// Longest pattern first so "Round-Trip Time" wins over "RTT" when
	// the former appears as a substring of context. Equal-length ties
	// break alphabetically for stable output.
	out.sort((a, b) => {
		if (b.pattern.length !== a.pattern.length) return b.pattern.length - a.pattern.length;
		return a.pattern.localeCompare(b.pattern);
	});
	return out;
}

const ALIASES = buildAliases();

// ─────────────────────────────────────────────────────────────────────
// Property denylist — same idea as the protocol densifier. These
// fields either render raw in the DOM or feed another non-Markdown
// renderer (Mermaid, code, URLs).
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

function applyAlias(text: string, alias: ConceptAlias, stat: WrapStat): string {
	// Word-boundary handling: avoid matching mid-word. For multi-word
	// terms `\b` works fine at start/end since they start/end with word
	// characters most of the time. For terms with leading/trailing
	// non-word chars we approximate.
	const startsWord = /^[A-Za-z0-9_]/.test(alias.pattern);
	const endsWord = /[A-Za-z0-9_]$/.test(alias.pattern.slice(-1));
	const left = startsWord ? '(?:^|[^A-Za-z0-9_]|\\\\.)' : '';
	const right = endsWord ? '(?![A-Za-z0-9_])' : '';
	const flags = alias.caseSensitive ? 'g' : 'gi';
	const re = new RegExp(`${left}(${escapeRegex(alias.pattern)})${right}`, flags);

	return text.replace(re, (m, captured: string, offset: number) => {
		stat.count++;
		if (stat.samples.length < 3) {
			const ctx = text.slice(Math.max(0, offset - 20), offset + m.length + 20);
			stat.samples.push(ctx.replace(/\s+/g, ' ').trim());
		}
		const lead = m.slice(0, m.length - captured.length);
		return `${lead}{{${alias.id}|${captured}}}`;
	});
}

function densifyString(src: string, stats: Map<string, WrapStat>): string {
	let work = src;
	for (const alias of ALIASES) {
		const stat = stats.get(alias.id) ?? { id: alias.id, count: 0, samples: [] };
		stats.set(alias.id, stat);

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

// ─────────────────────────────────────────────────────────────────────
// AST file walk — identical to the protocol densifier.
// ─────────────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────────────
// Targets — same scope as the protocol densifier.
// ─────────────────────────────────────────────────────────────────────

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
		'src/lib/data/pioneers.ts',
		'src/lib/data/rfcs.ts',
		'src/lib/data/frontier.ts',
		'src/lib/data/journeys.ts',
		'src/lib/data/category-deep-dives.ts',
		'src/lib/data/outages.ts',
		'src/lib/data/comparison/pairs.ts'
		// concepts.ts deliberately excluded — auto-linking a concept's
		// definition to other concepts is a separate editorial pass.
	].map((p) => join(REPO, p));
	return [...parts, ...stories, ...protocols, foundations, ...others];
}

// ─────────────────────────────────────────────────────────────────────
// CLI
// ─────────────────────────────────────────────────────────────────────

function parseArgs(argv: string[]): { apply: boolean; files: string[] } {
	const args: { apply: boolean; files: string[] } = { apply: false, files: [] };
	for (const a of argv.slice(2)) {
		if (a === '--apply') args.apply = true;
		else if (a.startsWith('--files=')) {
			const list = a.slice('--files='.length).split(',').filter(Boolean);
			args.files = list.map((p) => (p.startsWith('/') ? p : join(REPO, p)));
		} else if (a === '--help' || a === '-h') {
			console.log(`Usage: npx tsx scripts/densify-concepts.ts [--apply] [--files=path,path]`);
			process.exit(0);
		}
	}
	return args;
}

function main() {
	const { apply, files } = parseArgs(process.argv);
	const targets = files.length > 0 ? files : defaultTargets();

	console.log(
		`Concept aliases: ${ALIASES.length} (from ${concepts.length} concepts, ${BLOCKLIST.size} blocked)`
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
					`  ${s.id.padEnd(20)} ${String(s.count).padStart(4)}   e.g. ${s.samples[0] ?? ''}`
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
	for (const [id, n] of sorted.slice(0, 20)) {
		console.log(`  ${id.padEnd(20)} ${String(n).padStart(4)}`);
	}
	if (!apply) {
		console.log('\n(dry run — pass --apply to write)');
	} else {
		console.log('\nWritten.');
	}
}

main();
