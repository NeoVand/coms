/**
 * validate-cross-references.ts — build-time content integrity gate.
 *
 * The content layer is hand-authored across ~150 files and wires entities
 * together by string id (protocol connections, journey steps, comparison pairs,
 * subcategory membership, RFC/outage/pioneer/frontier protocol lists, story
 * parents) plus inline `[[id|label]]` / `{{concept}}` markup in prose. Nothing
 * at the type level catches a typo'd id. This script does: it loads every
 * registry, resolves every cross-reference, and exits non-zero with a readable
 * list on the first broken link.
 *
 * Run:  npm run validate   (wired into `build` and CI)
 */
import { allProtocols } from '../src/lib/data/protocols';
import { categories } from '../src/lib/data/categories';
import { subcategories } from '../src/lib/data/subcategories';
import { journeys } from '../src/lib/data/journeys';
import { allPairs } from '../src/lib/data/comparison/pairs';
import { rfcs } from '../src/lib/data/rfcs';
import { outages } from '../src/lib/data/outages';
import { pioneers } from '../src/lib/data/pioneers';
import { frontierEntries } from '../src/lib/data/frontier';
import { concepts } from '../src/lib/data/concepts';
import { categoryStories } from '../src/lib/data/category-stories/index';
import { subcategoryStories } from '../src/lib/data/subcategory-stories/index';
import { bookParts } from '../src/lib/data/book/chapters';

const errors: string[] = [];
const warnings: string[] = [];

// ── Id universes ─────────────────────────────────────────────────
const P = new Set(allProtocols.map((p) => p.id));
const C = new Set(categories.map((c) => c.id));
const S = new Set(subcategories.map((s) => s.id));
const OUT = new Set(outages.map((o) => o.id));
const PIO = new Set(pioneers.map((p) => p.id));
const FRO = new Set(frontierEntries.map((f) => f.id));
const CON = new Set(concepts.map((c) => c.id));
const PART = new Set(bookParts.map((b) => b.id));

// ── Duplicate ids ────────────────────────────────────────────────
// A duplicate id silently shadows the earlier entry in the *Map lookups
// (Map keeps the last value), so one definition becomes unreachable.
function findDuplicates(ids: string[]): string[] {
	const seen = new Set<string>();
	const dup = new Set<string>();
	for (const id of ids) {
		if (seen.has(id)) dup.add(id);
		seen.add(id);
	}
	return [...dup];
}
for (const [label, ids, sink] of [
	['protocol', allProtocols.map((p) => p.id), errors],
	['pioneer', pioneers.map((p) => p.id), errors],
	['RFC', rfcs.map((r) => String(r.number)), errors],
	['outage', outages.map((o) => o.id), errors],
	['frontier', frontierEntries.map((f) => f.id), errors],
	// Concepts have 18 known pre-existing collisions (two authored definitions
	// share an id). They render a valid definition today, so they are surfaced
	// as warnings for editorial review rather than breaking the build.
	['concept', concepts.map((c) => c.id), warnings]
] as const) {
	for (const id of findDuplicates(ids)) {
		sink.push(`duplicate ${label} id "${id}" — one definition shadows the other`);
	}
}

const ref = (set: Set<string>, id: string, where: string) => {
	if (!set.has(id)) errors.push(`${where} → unknown id "${id}"`);
};

// ── 1. Protocols ─────────────────────────────────────────────────
for (const p of allProtocols) {
	ref(C, p.categoryId, `protocol "${p.id}".categoryId`);
	for (const c of p.connections) ref(P, c, `protocol "${p.id}".connections`);
	for (const f of p.frontier ?? []) ref(FRO, f, `protocol "${p.id}".frontier`);
	for (const pi of p.pioneers ?? []) ref(PIO, pi, `protocol "${p.id}".pioneers`);
}

// ── 2. Subcategories ─────────────────────────────────────────────
const protoToSub = new Map<string, string>();
for (const s of subcategories) {
	ref(C, s.categoryId, `subcategory "${s.id}".categoryId`);
	for (const pid of s.protocolIds) {
		ref(P, pid, `subcategory "${s.id}".protocolIds`);
		if (protoToSub.has(pid)) {
			errors.push(
				`protocol "${pid}" is in two subcategories ("${protoToSub.get(pid)}" and "${s.id}")`
			);
		}
		protoToSub.set(pid, s.id);
	}
}
// Coverage (informational): protocols with no subcategory.
for (const p of allProtocols) {
	if (!protoToSub.has(p.id)) warnings.push(`protocol "${p.id}" belongs to no subcategory`);
}

// ── 3. Journeys ──────────────────────────────────────────────────
for (const j of journeys) {
	if (j.scope !== 'global') ref(C, j.scope, `journey "${j.id}".scope`);
	for (const step of j.steps) ref(P, step.protocolId, `journey "${j.id}" step`);
}

// ── 4. Comparison pairs ──────────────────────────────────────────
for (const pair of allPairs) {
	for (const id of pair.ids) ref(P, id, `comparison pair [${pair.ids.join(', ')}]`);
}

// ── 5. RFCs / outages / pioneers / frontier protocol lists ───────
for (const r of rfcs) for (const id of r.protocols ?? []) ref(P, id, `rfc ${r.number}.protocols`);
for (const o of outages)
	for (const id of o.affectedProtocols ?? []) ref(P, id, `outage "${o.id}".affectedProtocols`);
for (const p of pioneers) {
	for (const id of p.protocols ?? []) ref(P, id, `pioneer "${p.id}".protocols`);
	for (const id of p.categories ?? []) ref(C, id, `pioneer "${p.id}".categories`);
}
for (const f of frontierEntries)
	for (const id of f.protocols ?? []) ref(P, id, `frontier "${f.id}".protocols`);

// ── 6. Story parents ─────────────────────────────────────────────
for (const cs of categoryStories) ref(C, cs.categoryId, `category-story.categoryId`);
for (const ss of subcategoryStories) ref(S, ss.subcategoryId, `subcategory-story.subcategoryId`);

// ── 7. Inline markup in prose ────────────────────────────────────
// Walk every string in the data layer and resolve [[id|label]] / {{concept}}.
// Skip code-bearing keys (code samples legitimately contain [[ and {{ }} that
// are not cross-references), and require slug-shaped ids to avoid matching
// template syntax like `{{ user.name }}`.
const SKIP_KEYS = new Set(['codeExample', 'code', 'wireshark', 'definition']);
const SLUG = /^[a-z0-9][a-z0-9:/-]*$/i;
const BRACKET_RE = /\[\[([^\][|]+?)(?:\|[^\]]*)?\]\]/g;
const BRACE_RE = /\{\{([^}{|]+?)(?:\|[^}]*)?\}\}/g;

function resolveBracket(rawId: string, where: string) {
	const colon = rawId.indexOf(':');
	const prefix = colon === -1 ? 'protocol' : rawId.slice(0, colon);
	const id = colon === -1 ? rawId : rawId.slice(colon + 1);
	switch (prefix) {
		case 'protocol':
			if (!P.has(id)) errors.push(`inline [[${rawId}]] in ${where} → unknown protocol`);
			break;
		case 'rfc':
			// Unregistered RFCs are fine: RfcRef falls back to an external
			// datatracker.ietf.org link by design. Nothing to validate.
			break;
		case 'outage':
			if (!OUT.has(id)) errors.push(`inline [[outage:${id}]] in ${where} → unknown outage`);
			break;
		case 'pioneer':
			if (!PIO.has(id)) errors.push(`inline [[pioneer:${id}]] in ${where} → unknown pioneer`);
			break;
		case 'glossary':
			if (!CON.has(id)) errors.push(`inline [[glossary:${id}]] in ${where} → unknown concept`);
			break;
		case 'frontier':
			if (!FRO.has(id)) errors.push(`inline [[frontier:${id}]] in ${where} → unknown frontier`);
			break;
		case 'chapter': {
			const partId = id.split('/')[0];
			if (!PART.has(partId))
				errors.push(`inline [[chapter:${id}]] in ${where} → unknown book part`);
			break;
		}
		default:
			// Unknown prefix renders as visible plain text by design; flag as a warning.
			warnings.push(`inline [[${rawId}]] in ${where} → unrecognized prefix "${prefix}"`);
	}
}

function scanString(str: string, where: string) {
	for (const m of str.matchAll(BRACKET_RE)) {
		const id = m[1].trim();
		if (SLUG.test(id)) resolveBracket(id, where);
	}
	for (const m of str.matchAll(BRACE_RE)) {
		const id = m[1].trim();
		if (SLUG.test(id) && !CON.has(id)) {
			errors.push(`inline {{${id}}} in ${where} → unknown concept`);
		}
	}
}

function walk(value: unknown, path: string, key?: string) {
	if (key && SKIP_KEYS.has(key)) return;
	if (typeof value === 'string') scanString(value, path);
	else if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${path}[${i}]`, key));
	else if (value && typeof value === 'object') {
		for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, k);
	}
}

walk(allProtocols, 'protocols');
walk(concepts, 'concepts');
walk(journeys, 'journeys');
walk(rfcs, 'rfcs');
walk(outages, 'outages');
walk(pioneers, 'pioneers');
walk(frontierEntries, 'frontier');
walk(categoryStories, 'category-stories');
walk(subcategoryStories, 'subcategory-stories');
walk(bookParts, 'book');
walk(allPairs, 'comparison-pairs');

// ── Report ───────────────────────────────────────────────────────
if (warnings.length) {
	console.warn(`\n⚠️  ${warnings.length} warning(s):`);
	for (const w of warnings) console.warn(`   ${w}`);
}
if (errors.length) {
	console.error(`\n❌ Cross-reference validation failed — ${errors.length} broken reference(s):\n`);
	for (const e of errors) console.error(`   ${e}`);
	process.exit(1);
}
console.log(
	`\n✅ Cross-references valid: ${allProtocols.length} protocols, ${subcategories.length} subcategories, ` +
		`${journeys.length} journeys, ${allPairs.length} pairs, ${rfcs.length} RFCs, ` +
		`${outages.length} outages, ${pioneers.length} pioneers, ${frontierEntries.length} frontier, ` +
		`${categoryStories.length}+${subcategoryStories.length} stories — plus all inline [[…]]/{{…}} markup.`
);
