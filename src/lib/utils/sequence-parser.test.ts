import { describe, it, expect } from 'vitest';
import { parseSequenceSteps, visibleSteps } from './sequence-parser';

describe('parseSequenceSteps', () => {
	it('ignores diagram preamble, declarations, comments and blank lines', () => {
		const src = `sequenceDiagram
			autonumber
			participant A
			actor B
			%% a comment

		`;
		expect(parseSequenceSteps(src)).toEqual([]);
	});

	it('parses notes with placement and multiple actors', () => {
		const steps = parseSequenceSteps('Note over A,B: shared state');
		expect(steps).toEqual([
			{ kind: 'note', placement: 'over', actors: ['A', 'B'], text: 'shared state' }
		]);
	});

	it('maps "left of" / "right of" placements', () => {
		expect(parseSequenceSteps('Note left of A: x')[0]).toMatchObject({ placement: 'left' });
		expect(parseSequenceSteps('Note right of A: y')[0]).toMatchObject({ placement: 'right' });
	});

	it('classifies all arrow kinds and prefers the longest token', () => {
		const arrows = parseSequenceSteps(
			[
				'A->B: solid',
				'A->>B: solid-head',
				'A-->B: dashed',
				'A-->>B: dashed-head',
				'A-xB: lost-solid',
				'A--xB: lost-dashed'
			].join('\n')
		);
		expect(arrows.map((s) => (s.kind === 'message' ? s.arrow : null))).toEqual([
			'solid',
			'solid',
			'dashed',
			'dashed',
			'lost-solid',
			'lost-dashed'
		]);
	});

	it('captures message from/to/text', () => {
		const [msg] = parseSequenceSteps('Client->>Server: SYN');
		expect(msg).toEqual({
			kind: 'message',
			from: 'Client',
			to: 'Server',
			arrow: 'solid',
			text: 'SYN'
		});
	});

	it('parses block markers (par/loop/alt/opt/and/else/end)', () => {
		const steps = parseSequenceSteps(
			['par fan out', 'and branch', 'end', 'alt ok', 'else fail', 'end', 'loop retry', 'end'].join(
				'\n'
			)
		);
		expect(steps.map((s) => s.kind)).toEqual([
			'block-start',
			'block-and',
			'block-end',
			'block-start',
			'block-and',
			'block-end',
			'block-start',
			'block-end'
		]);
		expect(steps[0]).toMatchObject({ type: 'par', label: 'fan out' });
		expect(steps[3]).toMatchObject({ type: 'alt', label: 'ok' });
	});

	it('preserves source order across mixed content', () => {
		const steps = parseSequenceSteps(
			['Note over A: start', 'A->>B: req', 'B-->>A: res'].join('\n')
		);
		expect(steps.map((s) => s.kind)).toEqual(['note', 'message', 'message']);
	});
});

describe('visibleSteps', () => {
	it('keeps only notes and messages, dropping block markers', () => {
		const steps = parseSequenceSteps(['par x', 'A->>B: hi', 'Note over A: n', 'end'].join('\n'));
		expect(visibleSteps(steps).map((s) => s.kind)).toEqual(['message', 'note']);
	});
});
