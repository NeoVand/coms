import { getProtocolById } from '$lib/data/index';
import { getConceptById } from '$lib/data/concepts';
import { getOutageById } from '$lib/data/outages';
import { getPioneerById } from '$lib/data/pioneers';
import { getRfcByNumber } from '$lib/data/rfcs';
import { getFrontierById } from '$lib/data/frontier';

/**
 * Inline rich-text segments produced by `parseRichText`.
 *
 * Syntax supported (all backwards-compatible — existing prose works
 * unchanged):
 *
 *   `**text**`                 → bold
 *   `{{conceptId|label}}`      → concept tooltip
 *   `**{{conceptId|label}}**`  → bold concept tooltip
 *   `[[id|label]]`             → cross-reference (typed; see below)
 *   `**[[id|label]]**`         → bold cross-reference
 *
 * The `id` portion of `[[id|label]]` may carry an optional type prefix:
 *
 *   `[[tcp]]`                  → protocol link (default — backwards compat)
 *   `[[protocol:tcp|TCP]]`     → protocol link (explicit)
 *   `[[rfc:9293]]`             → RFC citation
 *   `[[outage:facebook-2021]]` → famous-incident link
 *   `[[pioneer:radia-perlman]]`→ pioneer bio link
 *   `[[glossary:cwnd]]`        → glossary entry link
 *
 * If the label is omitted, the renderer falls back to a sensible
 * default — protocol abbreviation, "RFC <N>", outage title, pioneer
 * name, or glossary term.
 */
export type TextSegment =
	| { type: 'text'; value: string }
	| { type: 'bold'; value: string }
	| { type: 'italic'; value: string }
	| { type: 'code'; value: string }
	| { type: 'bold-concept'; conceptId: string; label: string }
	| { type: 'bold-protocol-link'; protocolId: string; label: string }
	| { type: 'protocol-link'; protocolId: string; label: string }
	| { type: 'concept'; conceptId: string; label: string }
	| { type: 'rfc-ref'; number: string; label: string }
	| { type: 'outage-link'; outageId: string; label: string }
	| { type: 'pioneer-link'; pioneerId: string; label: string }
	| { type: 'glossary-link'; conceptId: string; label: string }
	| { type: 'frontier-link'; frontierId: string; label: string }
	| { type: 'chapter-link'; partId: string; chapterId: string; label: string };

/**
 * Combined regex matching, in priority order:
 *   **{{conceptId|label}}**   — bold-wrapped concept
 *   **[[id|label]]**          — bold-wrapped cross-reference
 *   [[id|label]]              — cross-reference (protocol / rfc / outage / pioneer / glossary / frontier / chapter)
 *   {{conceptId|display}}     — concept tooltip
 *   **bold text**             — bold
 *   `code text`               — inline code
 *   *italic text*             — italic (single-asterisk; must NOT start/end with whitespace
 *                               so we don't match math-style multiplication)
 *
 * Bold-wrapped variants are matched first to prevent partial matches.
 *
 * Note: the `id` character class is `[^\]|]` which intentionally
 * permits `:` so that typed prefixes like `rfc:9293` parse cleanly.
 */
const RICH_TEXT_RE =
	/\*\*\{\{([^}|]+)(?:\|([^}]+))?\}\}\*\*|\*\*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\*\*|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\{\{([^}|]+)(?:\|([^}]+))?\}\}|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*\s][^*]*[^*\s]|[^*\s])\*/g;

/**
 * Resolve a `[[id|label]]` raw match into a typed segment, honoring the
 * optional `<type>:` prefix. Falls back to a plain-text segment when an
 * unknown prefix is encountered (so typos surface visibly in the UI
 * rather than disappearing silently).
 */
function buildBracketSegment(
	rawId: string,
	rawLabel: string | undefined,
	bold: boolean
): TextSegment {
	const colonIdx = rawId.indexOf(':');
	const prefix = colonIdx === -1 ? 'protocol' : rawId.slice(0, colonIdx);
	const id = colonIdx === -1 ? rawId : rawId.slice(colonIdx + 1);

	switch (prefix) {
		case 'protocol': {
			const proto = getProtocolById(id);
			const label = rawLabel || proto?.abbreviation || id.toUpperCase();
			return bold
				? { type: 'bold-protocol-link', protocolId: id, label }
				: { type: 'protocol-link', protocolId: id, label };
		}
		case 'rfc': {
			const rfc = getRfcByNumber(id);
			const label = rawLabel || (rfc ? `RFC ${rfc.number}` : `RFC ${id}`);
			return { type: 'rfc-ref', number: id, label };
		}
		case 'outage': {
			const outage = getOutageById(id);
			const label = rawLabel || outage?.title || id;
			return { type: 'outage-link', outageId: id, label };
		}
		case 'pioneer': {
			const pioneer = getPioneerById(id);
			const label = rawLabel || pioneer?.name || id;
			return { type: 'pioneer-link', pioneerId: id, label };
		}
		case 'glossary': {
			const concept = getConceptById(id);
			const label = rawLabel || concept?.term || id;
			return { type: 'glossary-link', conceptId: id, label };
		}
		case 'frontier': {
			const fe = getFrontierById(id);
			const label = rawLabel || fe?.title || id;
			return { type: 'frontier-link', frontierId: id, label };
		}
		case 'chapter': {
			// Format: chapter:partId/chapterId — id has a "/" separator.
			const slash = id.indexOf('/');
			if (slash === -1) {
				return { type: 'text', value: rawLabel ? `[[${rawId}|${rawLabel}]]` : `[[${rawId}]]` };
			}
			const partId = id.slice(0, slash);
			const chapterId = id.slice(slash + 1);
			const label = rawLabel || chapterId;
			return { type: 'chapter-link', partId, chapterId, label };
		}
		default: {
			// Unknown prefix — surface as plain text so the typo is visible.
			const reconstructed = rawLabel ? `[[${rawId}|${rawLabel}]]` : `[[${rawId}]]`;
			return { type: 'text', value: reconstructed };
		}
	}
}

/**
 * Parse a string containing `[[id|label]]`, `{{conceptId|label}}`,
 * `**bold**`, `**{{...}}**`, and `**[[...]]**` syntax into a flat
 * array of typed segments suitable for incremental rendering.
 */
export function parseRichText(raw: string): TextSegment[] {
	const segments: TextSegment[] = [];
	const regex = new RegExp(RICH_TEXT_RE.source, RICH_TEXT_RE.flags);
	let lastIndex = 0;
	let match: RegExpExecArray | null;

	while ((match = regex.exec(raw)) !== null) {
		// Text before this match
		if (match.index > lastIndex) {
			segments.push({ type: 'text', value: raw.slice(lastIndex, match.index) });
		}

		if (match[1] !== undefined) {
			// Bold concept: **{{conceptId|label}}**
			const conceptId = match[1];
			const concept = getConceptById(conceptId);
			const label = match[2] || concept?.term || conceptId;
			segments.push({ type: 'bold-concept', conceptId, label });
		} else if (match[3] !== undefined) {
			// Bold cross-reference: **[[id|label]]**
			segments.push(buildBracketSegment(match[3], match[4], true));
		} else if (match[5] !== undefined) {
			// Cross-reference: [[id|label]]
			segments.push(buildBracketSegment(match[5], match[6], false));
		} else if (match[7] !== undefined) {
			// Concept: {{conceptId|display text}}
			const conceptId = match[7];
			const concept = getConceptById(conceptId);
			const label = match[8] || concept?.term || conceptId;
			segments.push({ type: 'concept', conceptId, label });
		} else if (match[9] !== undefined) {
			// Bold: **text**
			segments.push({ type: 'bold', value: match[9] });
		} else if (match[10] !== undefined) {
			// Inline code: `text`
			segments.push({ type: 'code', value: match[10] });
		} else if (match[11] !== undefined) {
			// Italic: *text*
			segments.push({ type: 'italic', value: match[11] });
		}

		lastIndex = regex.lastIndex;
	}

	// Remaining text after last match
	if (lastIndex < raw.length) {
		segments.push({ type: 'text', value: raw.slice(lastIndex) });
	}

	return segments;
}

/**
 * Parse multi-paragraph text (split on double newlines) into an array of
 * segment arrays — one per paragraph.
 */
export function parseParagraphs(raw: string): TextSegment[][] {
	return raw.split('\n\n').map((p) => parseRichText(p));
}
