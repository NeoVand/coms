/* eslint-disable */
/**
 * densify-protocols.ts — Wrap unlinked protocol mentions in book prose.
 *
 * The book chapters under `src/lib/data/book/parts/`, the foundation
 * conceptual sections in `concept-foundations.ts`, and the per-category
 * stories under `src/lib/data/category-stories/` are full of plain-text
 * mentions of protocols ("TCP", "QUIC", "HTTP/2", "Wi-Fi", …) that
 * should be `[[id|label]]` links so they render in the protocol's
 * category color and pop the hover card on hover.
 *
 * Strategy:
 *   1. For each target file, parse with the TypeScript compiler and
 *      collect every string literal / no-substitution template literal.
 *      We never touch comments, identifiers, imports, or template
 *      interpolation — the AST guarantees we only edit prose.
 *   2. For each string, walk the contents segment by segment, treating
 *      `[[…]]`, `((…))`, `{{…}}` as already-protected zones.
 *   3. In the unprotected zones, run the alias table (longer aliases
 *      first; case-sensitive; word-boundary anchored) and rewrite each
 *      match as `[[id|match]]`.
 *
 * Run:
 *   npx tsx scripts/densify-protocols.ts          # dry run + report
 *   npx tsx scripts/densify-protocols.ts --apply  # write changes
 *   npx tsx scripts/densify-protocols.ts --apply --files=src/lib/data/book/parts/transport.ts
 */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ts from 'typescript';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');

// ─────────────────────────────────────────────────────────────────────
// Alias table — ordered longest-first within each protocol so that
// "Multipath TCP" wins over "TCP" and "IPv4" wins over "IP".
// ─────────────────────────────────────────────────────────────────────

interface AliasEntry {
	id: string;
	aliases: string[];
}

/**
 * Order in this list also matters: alias matches happen top-down. Put
 * the more-specific aliases (longer string, or the one whose label
 * contains another protocol's label) before the less-specific ones.
 */
const ALIASES: AliasEntry[] = [
	// Multi-token / compound aliases first — these contain other protocol
	// abbreviations as substrings, so they MUST run before the bare ones.
	{ id: 'mptcp', aliases: ['Multipath TCP', 'MPTCP'] },
	{ id: 'oauth2', aliases: ['OAuth 2.0', 'OAuth2', 'OAuth'] },
	{ id: 'sse', aliases: ['Server-Sent Events', 'SSE'] },
	{ id: 'wifi', aliases: ['Wi-Fi', 'WiFi', '802.11'] },
	{ id: 'http1', aliases: ['HTTP/1.1', 'HTTP/1.0', 'HTTP/1'] },
	{ id: 'http2', aliases: ['HTTP/2'] },
	{ id: 'http3', aliases: ['HTTP/3'] },
	{ id: 'json-rpc', aliases: ['JSON-RPC'] },
	{ id: 'websockets', aliases: ['WebSockets', 'WebSocket'] },
	{ id: 'webrtc', aliases: ['WebRTC'] },
	{ id: 'graphql', aliases: ['GraphQL'] },
	{ id: 'ipv6', aliases: ['IPv6'] },
	{ id: 'ip', aliases: ['IPv4', 'IP'] }, // IPv4 first; IP runs last across the file
	// Single-token uppercase abbreviations.
	{ id: 'tcp', aliases: ['TCP'] },
	{ id: 'udp', aliases: ['UDP'] },
	{ id: 'quic', aliases: ['QUIC'] },
	{ id: 'sctp', aliases: ['SCTP'] },
	{ id: 'tls', aliases: ['TLS'] },
	{ id: 'ssh', aliases: ['SSH'] },
	{ id: 'dns', aliases: ['DNS'] },
	{ id: 'dhcp', aliases: ['DHCP'] },
	{ id: 'ntp', aliases: ['NTP'] },
	{ id: 'smtp', aliases: ['SMTP'] },
	{ id: 'ftp', aliases: ['FTP'] },
	{ id: 'imap', aliases: ['IMAP'] },
	{ id: 'bgp', aliases: ['BGP'] },
	{ id: 'icmp', aliases: ['ICMP'] },
	{ id: 'arp', aliases: ['ARP'] },
	{ id: 'rtp', aliases: ['RTP'] },
	{ id: 'sip', aliases: ['SIP'] },
	{ id: 'hls', aliases: ['HLS'] },
	{ id: 'rtmp', aliases: ['RTMP'] },
	{ id: 'sdp', aliases: ['SDP'] },
	{ id: 'dash', aliases: ['DASH'] }, // case-sensitive — never matches "dashed"
	{ id: 'soap', aliases: ['SOAP'] },
	{ id: 'mqtt', aliases: ['MQTT'] },
	{ id: 'amqp', aliases: ['AMQP'] },
	{ id: 'coap', aliases: ['CoAP'] },
	{ id: 'stomp', aliases: ['STOMP'] },
	{ id: 'xmpp', aliases: ['XMPP'] },
	{ id: 'mcp', aliases: ['MCP'] },
	{ id: 'a2a', aliases: ['A2A'] },
	{ id: 'rest', aliases: ['REST'] }, // case-sensitive — never matches "rest"
	{ id: 'grpc', aliases: ['gRPC'] },
	{ id: 'kafka', aliases: ['Kafka'] },
	{ id: 'ethernet', aliases: ['Ethernet'] }
];

// ─────────────────────────────────────────────────────────────────────
// Scope: the files we densify.
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
	const foundations = join(REPO, 'src/lib/data/concept-foundations.ts');
	return [...parts, ...stories, foundations];
}

// ─────────────────────────────────────────────────────────────────────
// Densification core.
// ─────────────────────────────────────────────────────────────────────

function escapeRegex(s: string): string {
	return s.replace(/[.*+?^${}()|[\]\\\/]/g, '\\$&');
}

interface WrapStat {
	id: string;
	count: number;
	samples: string[];
}

/**
 * Run one alias against a plain-text segment. Returns the rewritten
 * text and a count of replacements made. Word boundaries (`\b`) keep
 * us from matching inside larger words (e.g. "TCP" in "MTCP" or "IP"
 * in "IPv6").
 */
function applyAlias(
	text: string,
	id: string,
	alias: string,
	stat: WrapStat
): string {
	// `\b` only fires next to ASCII word chars. The alias may *start* or
	// *end* with a non-word char (e.g. "Wi-Fi"), in which case the inner
	// `\b` is meaningless on that side; emulate the boundary with a
	// negative lookaround on word chars instead.
	const startsWord = /^[A-Za-z0-9_]/.test(alias);
	const endsWord = /[A-Za-z0-9_]$/.test(alias[alias.length - 1]);
	const left = startsWord ? '(?:^|[^A-Za-z0-9_])' : '';
	const right = endsWord ? '(?![A-Za-z0-9_])' : '';
	const re = new RegExp(`${left}(${escapeRegex(alias)})${right}`, 'g');

	return text.replace(re, (m, captured: string, offset: number) => {
		stat.count++;
		if (stat.samples.length < 3) {
			const ctx = text.slice(Math.max(0, offset - 20), offset + m.length + 20);
			stat.samples.push(ctx.replace(/\s+/g, ' ').trim());
		}
		const lead = m.slice(0, m.length - captured.length);
		return `${lead}[[${id}|${captured}]]`;
	});
}

/** Tokenise a string into protected (`[[…]]`, `((…))`, `{{…}}`) and
 *  plain regions, run a single alias on the plain ones, and rejoin. */
function densifyString(
	src: string,
	stats: Map<string, WrapStat>
): string {
	let work = src;
	for (const entry of ALIASES) {
		const stat = stats.get(entry.id) ?? { id: entry.id, count: 0, samples: [] };
		stats.set(entry.id, stat);
		for (const alias of entry.aliases) {
			const tokenRe = /(\[\[[^\]]+\]\]|\(\([^)]+\)\)|\{\{[^}]+\}\})/g;
			const out: string[] = [];
			let lastIdx = 0;
			let m: RegExpExecArray | null;
			while ((m = tokenRe.exec(work)) !== null) {
				if (m.index > lastIdx)
					out.push(applyAlias(work.slice(lastIdx, m.index), entry.id, alias, stat));
				out.push(m[0]);
				lastIdx = m.index + m[0].length;
			}
			if (lastIdx < work.length)
				out.push(applyAlias(work.slice(lastIdx), entry.id, alias, stat));
			work = out.join('');
		}
	}
	return work;
}

// ─────────────────────────────────────────────────────────────────────
// File-level rewrite via TypeScript AST.
// ─────────────────────────────────────────────────────────────────────

interface FileResult {
	path: string;
	wrappedTotal: number;
	stats: Map<string, WrapStat>;
	updated: string;
	changed: boolean;
}

/**
 * Property names whose string values are NOT prose and must not be
 * rewritten. Two reasons a field appears here:
 *
 *  1. The string is consumed verbatim by another renderer that knows
 *     nothing about `[[…]]` (Mermaid diagram source, image URLs,
 *     identifiers, code blocks). Wrapping `[[ip|IPv4]]` inside a
 *     Mermaid `definition` would break the diagram outright.
 *  2. The string is rendered as raw text in the DOM (story titles,
 *     captions on diagrams/images, pioneer card headers, outage dates,
 *     pull-quote attributions). Wrapping a mention here would surface
 *     the literal `[[tcp|TCP]]` in the page heading.
 *
 * In both cases the safe move is "leave it alone" — these fields can be
 * upgraded to rich-text later in a separate pass if we want the linking.
 */
const PROPERTY_DENYLIST = new Set([
	// Embedded source consumed by another renderer.
	'definition',
	'imagePath',
	'src',
	'credit',
	'url',
	'href',
	'code',
	'mermaid',
	// Identifiers / keys.
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
	// Raw-rendered DOM text — short headings, captions, names.
	'title',
	'caption',
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
	'oneLiner',
	'category'
]);

/**
 * Heuristic: is this string a Mermaid diagram source? Mermaid begins
 * with one of a small set of keywords. We allow optional leading
 * whitespace/newlines.
 */
function looksLikeMermaid(s: string): boolean {
	const head = s.replace(/^\s+/, '').slice(0, 40);
	return /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|journey|gitGraph|mindmap|timeline|quadrantChart|requirementDiagram|erDiagram|C4Context|xychart-beta)\b/.test(
		head
	);
}

/**
 * Walk up the AST to find the property name (or array property name)
 * a string literal is being assigned to. Returns undefined when the
 * node isn't a property value.
 */
function enclosingPropertyName(node: ts.Node): string | undefined {
	let n: ts.Node | undefined = node.parent;
	while (n) {
		if (ts.isPropertyAssignment(n)) {
			const name = n.name;
			if (ts.isIdentifier(name) || ts.isStringLiteral(name)) return name.text;
			return undefined;
		}
		// String inside an array literal — keep walking up to the array's
		// owning property.
		if (ts.isArrayLiteralExpression(n)) {
			n = n.parent;
			continue;
		}
		// String inside a parenthesised / template / conditional expression —
		// keep climbing.
		if (
			ts.isParenthesizedExpression(n) ||
			ts.isAsExpression(n) ||
			ts.isSatisfiesExpression(n)
		) {
			n = n.parent;
			continue;
		}
		return undefined;
	}
	return undefined;
}

function processFile(filePath: string): FileResult {
	const sourceText = readFileSync(filePath, 'utf8');
	const sf = ts.createSourceFile(
		filePath,
		sourceText,
		ts.ScriptTarget.Latest,
		/* setParentNodes */ true
	);

	const stats = new Map<string, WrapStat>();
	const edits: { start: number; end: number; replacement: string }[] = [];

	function visit(node: ts.Node) {
		if (
			ts.isStringLiteral(node) ||
			ts.isNoSubstitutionTemplateLiteral(node)
		) {
			const propName = enclosingPropertyName(node);
			const innerStart = node.getStart() + 1;
			const innerEnd = node.getEnd() - 1;
			const inner = sourceText.slice(innerStart, innerEnd);

			if (propName && PROPERTY_DENYLIST.has(propName)) {
				// Mermaid source / URL / identifier — never rewrite.
			} else if (looksLikeMermaid(inner)) {
				// Defensive: even if the property name is something we'd
				// normally rewrite, the content tells us this is Mermaid.
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
	for (const e of edits) {
		updated = updated.slice(0, e.start) + e.replacement + updated.slice(e.end);
	}

	let total = 0;
	for (const s of stats.values()) total += s.count;
	return { path: filePath, wrappedTotal: total, stats, updated, changed: total > 0 };
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
			console.log(
				`Usage: npx tsx scripts/densify-protocols.ts [--apply] [--files=path,path]`
			);
			process.exit(0);
		}
	}
	return args;
}

function main() {
	const { apply, files } = parseArgs(process.argv);
	const targets = files.length > 0 ? files : defaultTargets();

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
				console.log(`  ${s.id.padEnd(10)} ${String(s.count).padStart(4)}   e.g. ${s.samples[0] ?? ''}`);
			}
			if (apply) {
				writeFileSync(f, result.updated, 'utf8');
			}
		}
	}

	console.log('\n──────────────────────────────────────────');
	console.log(`Total wraps: ${grandTotal} across ${fileSummaries.filter((f) => f.total > 0).length} files`);
	const sorted = [...grandStats.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
	for (const [id, n] of sorted) {
		console.log(`  ${id.padEnd(10)} ${String(n).padStart(4)}`);
	}
	if (!apply) {
		console.log('\n(dry run — pass --apply to write)');
	} else {
		console.log('\nWritten.');
	}
}

main();
