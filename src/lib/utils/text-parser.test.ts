import { describe, it, expect } from 'vitest';
import { parseRichText, parseParagraphs, stripRichTextMarkup } from './text-parser';

describe('parseRichText — primitives', () => {
	it('returns a single text segment for plain prose', () => {
		expect(parseRichText('just words')).toEqual([{ type: 'text', value: 'just words' }]);
	});

	it('parses **bold**, `code`, and *italic*', () => {
		expect(parseRichText('**b**')).toEqual([{ type: 'bold', value: 'b' }]);
		expect(parseRichText('`x = 1`')).toEqual([{ type: 'code', value: 'x = 1' }]);
		expect(parseRichText('*em*')).toEqual([{ type: 'italic', value: 'em' }]);
	});

	it('does NOT treat spaced asterisks as italic (math-multiplication guard)', () => {
		const segs = parseRichText('a * b * c');
		expect(segs).toEqual([{ type: 'text', value: 'a * b * c' }]);
	});

	it('preserves leading/trailing text around a match in order', () => {
		expect(parseRichText('see **this** now')).toEqual([
			{ type: 'text', value: 'see ' },
			{ type: 'bold', value: 'this' },
			{ type: 'text', value: ' now' }
		]);
	});
});

describe('parseRichText — cross references', () => {
	it('parses a protocol link and fills the label from the registry', () => {
		expect(parseRichText('[[tcp|TCP]]')).toEqual([
			{ type: 'protocol-link', protocolId: 'tcp', label: 'TCP' }
		]);
		// Bare form resolves the label from the protocol registry (abbreviation).
		expect(parseRichText('[[tcp]]')).toEqual([
			{ type: 'protocol-link', protocolId: 'tcp', label: 'TCP' }
		]);
	});

	it('parses a typed rfc: reference', () => {
		const segs = parseRichText('[[rfc:9293|RFC 9293]]');
		expect(segs).toEqual([{ type: 'rfc-ref', number: '9293', label: 'RFC 9293' }]);
	});

	it('parses a concept tooltip token', () => {
		expect(parseRichText('{{handshake|the handshake}}')).toEqual([
			{ type: 'concept', conceptId: 'handshake', label: 'the handshake' }
		]);
	});

	it('falls back to visible plain text for an unknown [[prefix:…]]', () => {
		// Surfacing typos rather than dropping them silently.
		expect(parseRichText('[[bogus:xyz|Label]]')).toEqual([
			{ type: 'text', value: '[[bogus:xyz|Label]]' }
		]);
	});
});

describe('parseRichText — bold-wrapped variants', () => {
	it('parses **{{concept}}** as a bold-concept', () => {
		expect(parseRichText('**{{handshake|Handshake}}**')).toEqual([
			{ type: 'bold-concept', conceptId: 'handshake', label: 'Handshake' }
		]);
	});

	it('parses **[[tcp|TCP]]** as a bold-protocol-link', () => {
		expect(parseRichText('**[[tcp|TCP]]**')).toEqual([
			{ type: 'bold-protocol-link', protocolId: 'tcp', label: 'TCP' }
		]);
	});

	it('parses **bold with {{nested}}** as a recursive bold-group', () => {
		const segs = parseRichText('**see {{handshake|the handshake}} live**');
		expect(segs).toHaveLength(1);
		expect(segs[0].type).toBe('bold-group');
		if (segs[0].type === 'bold-group') {
			expect(segs[0].segments.map((s) => s.type)).toEqual(['text', 'concept', 'text']);
		}
	});
});

describe('parseParagraphs', () => {
	it('splits on blank lines into one segment list per paragraph', () => {
		const paras = parseParagraphs('one **two**\n\nthree');
		expect(paras).toHaveLength(2);
		expect(paras[0].map((s) => s.type)).toEqual(['text', 'bold']);
		expect(paras[1]).toEqual([{ type: 'text', value: 'three' }]);
	});
});

describe('stripRichTextMarkup', () => {
	it('reduces atoms to their visible label', () => {
		expect(stripRichTextMarkup('[[tcp|TCP]] over {{ip|IP}} is **fast**')).toBe(
			'TCP over IP is fast'
		);
	});

	it('does not eat the outer brackets of a nested Mermaid-style construct', () => {
		// NODE[[[id|Label]]] — the id char-class excludes `[` so the inner wrap
		// resolves to its label and the surrounding brackets survive.
		expect(stripRichTextMarkup('NODE[[[tcp|TCP]]]')).toBe('NODE[TCP]');
	});

	it('is idempotent on already-plain text', () => {
		expect(stripRichTextMarkup('nothing to strip')).toBe('nothing to strip');
	});

	it('resolves a bare [[id]] to its label instead of dropping it', () => {
		// Regression: previously a label-less ref stripped to '' and the word
		// vanished from tooltips / aria-labels.
		expect(stripRichTextMarkup('runs on [[tcp]] today')).toBe('runs on TCP today');
		expect(stripRichTextMarkup('see [[rfc:9293]]')).toBe('see RFC 9293');
	});

	it('resolves a bare {{concept}} to its term', () => {
		const out = stripRichTextMarkup('the {{handshake}} step');
		expect(out).not.toContain('{{');
		expect(out.toLowerCase()).toContain('handshake');
	});
});
