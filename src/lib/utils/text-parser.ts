import { getProtocolById } from '$lib/data/index';
import { getConceptById } from '$lib/data/concepts';

export type TextSegment =
	| { type: 'text'; value: string }
	| { type: 'bold'; value: string }
	| { type: 'bold-concept'; conceptId: string; label: string }
	| { type: 'bold-protocol-link'; protocolId: string; label: string }
	| { type: 'protocol-link'; protocolId: string; label: string }
	| { type: 'concept'; conceptId: string; label: string };

/**
 * Combined regex matching:
 *   **{{conceptId|label}}**   — bold-wrapped concept (must come first)
 *   **[[protocolId|label]]**  — bold-wrapped protocol link (must come first)
 *   [[protocolId|label]]      — protocol cross-references
 *   {{conceptId|display}}     — concept tooltips
 *   **bold text**             — bold formatting
 *
 * Bold-wrapped variants are matched first to prevent partial matches.
 */
const RICH_TEXT_RE =
	/\*\*\{\{([^}|]+)(?:\|([^}]+))?\}\}\*\*|\*\*\[\[([^\]|]+)(?:\|([^\]]+))?\]\]\*\*|\[\[([^\]|]+)(?:\|([^\]]+))?\]\]|\{\{([^}|]+)(?:\|([^}]+))?\}\}|\*\*([^*]+)\*\*/g;

/**
 * Parse a string containing [[protocol|label]], {{concept|display text}},
 * **bold**, **{{concept|text}}**, and **[[protocol|label]]** syntax
 * into a flat array of typed segments.
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
			// Bold protocol link: **[[protocolId|label]]**
			const protocolId = match[3];
			const proto = getProtocolById(protocolId);
			const label = match[4] || proto?.abbreviation || protocolId.toUpperCase();
			segments.push({ type: 'bold-protocol-link', protocolId, label });
		} else if (match[5] !== undefined) {
			// Protocol link: [[protocolId|label]]
			const protocolId = match[5];
			const proto = getProtocolById(protocolId);
			const label = match[6] || proto?.abbreviation || protocolId.toUpperCase();
			segments.push({ type: 'protocol-link', protocolId, label });
		} else if (match[7] !== undefined) {
			// Concept: {{conceptId|display text}}
			const conceptId = match[7];
			const concept = getConceptById(conceptId);
			const label = match[8] || concept?.term || conceptId;
			segments.push({ type: 'concept', conceptId, label });
		} else if (match[9] !== undefined) {
			// Bold: **text**
			segments.push({ type: 'bold', value: match[9] });
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
