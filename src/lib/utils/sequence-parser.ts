/**
 * Tiny parser for the subset of mermaid `sequenceDiagram` syntax used in our
 * diagram-definitions. Returns an ordered list of "steps" — each is one note,
 * one message arrow, or a block marker (par/loop/alt/and/end). Order matches
 * the source which also matches the visual top-to-bottom order in mermaid's
 * rendered SVG.
 */

export type ArrowKind = 'solid' | 'dashed' | 'lost-solid' | 'lost-dashed';

export type SequenceStep =
	| {
			kind: 'note';
			actors: string[];
			placement: 'over' | 'left' | 'right';
			text: string;
	  }
	| {
			kind: 'message';
			from: string;
			to: string;
			arrow: ArrowKind;
			text: string;
	  }
	| { kind: 'block-start'; type: 'par' | 'loop' | 'alt' | 'opt'; label: string }
	| { kind: 'block-and'; label: string }
	| { kind: 'block-end' };

const NOTE_RE = /^Note\s+(over|left of|right of)\s+([^:]+):\s*(.*)$/i;
// Order matters: longer arrow tokens first so "->>" doesn't get matched as "->".
const MSG_RE = /^(\w+)\s*(-->>|->>|-->|->|--x|-x)\s*(\w+)\s*:\s*(.*)$/;

function classifyArrow(token: string): ArrowKind {
	if (token === '--x') return 'lost-dashed';
	if (token === '-x') return 'lost-solid';
	if (token === '-->>' || token === '-->') return 'dashed';
	return 'solid';
}

export function parseSequenceSteps(src: string): SequenceStep[] {
	const steps: SequenceStep[] = [];
	for (const raw of src.split('\n')) {
		const line = raw.trim();
		if (!line || line.startsWith('%%')) continue;
		if (line.startsWith('sequenceDiagram')) continue;
		if (line.startsWith('participant') || line.startsWith('actor')) continue;
		if (line.startsWith('autonumber')) continue;

		const noteMatch = line.match(NOTE_RE);
		if (noteMatch) {
			const placementWord = noteMatch[1].toLowerCase();
			const placement: 'over' | 'left' | 'right' = placementWord.startsWith('over')
				? 'over'
				: placementWord.startsWith('left')
					? 'left'
					: 'right';
			steps.push({
				kind: 'note',
				placement,
				actors: noteMatch[2].split(',').map((s) => s.trim()),
				text: noteMatch[3].trim()
			});
			continue;
		}

		if (/^par(\s+|$)/.test(line)) {
			steps.push({ kind: 'block-start', type: 'par', label: line.slice(3).trim() });
			continue;
		}
		if (/^loop(\s+|$)/.test(line)) {
			steps.push({ kind: 'block-start', type: 'loop', label: line.slice(4).trim() });
			continue;
		}
		if (/^alt(\s+|$)/.test(line)) {
			steps.push({ kind: 'block-start', type: 'alt', label: line.slice(3).trim() });
			continue;
		}
		if (/^opt(\s+|$)/.test(line)) {
			steps.push({ kind: 'block-start', type: 'opt', label: line.slice(3).trim() });
			continue;
		}
		if (/^and(\s+|$)/.test(line)) {
			steps.push({ kind: 'block-and', label: line.slice(3).trim() });
			continue;
		}
		if (/^else(\s+|$)/.test(line)) {
			steps.push({ kind: 'block-and', label: line.slice(4).trim() });
			continue;
		}
		if (line === 'end') {
			steps.push({ kind: 'block-end' });
			continue;
		}

		const msgMatch = line.match(MSG_RE);
		if (msgMatch) {
			steps.push({
				kind: 'message',
				from: msgMatch[1],
				to: msgMatch[3],
				arrow: classifyArrow(msgMatch[2]),
				text: msgMatch[4].trim()
			});
		}
	}
	return steps;
}

/** Steps that bind to visible DOM elements (notes + messages, not block markers). */
export type VisibleStep = Extract<SequenceStep, { kind: 'note' } | { kind: 'message' }>;

export function visibleSteps(steps: SequenceStep[]): VisibleStep[] {
	return steps.filter((s): s is VisibleStep => s.kind === 'note' || s.kind === 'message');
}
