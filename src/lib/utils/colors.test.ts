import { describe, it, expect } from 'vitest';
import { hexToRgba, shiftHsl, themedDomColor } from './colors';

describe('hexToRgba', () => {
	it('converts a 6-digit hex + alpha to an rgba() string', () => {
		expect(hexToRgba('#ff8800', 0.5)).toBe('rgba(255, 136, 0, 0.5)');
		expect(hexToRgba('#000000', 1)).toBe('rgba(0, 0, 0, 1)');
	});
});

describe('shiftHsl', () => {
	it('returns the input unchanged for non-hex values', () => {
		expect(shiftHsl('rgb(1,2,3)', 0.1)).toBe('rgb(1,2,3)');
		expect(shiftHsl('not-a-color', 0.1)).toBe('not-a-color');
	});

	it('round-trips a color (dl=0) to within rounding error', () => {
		// Pure HSL→RGB→HSL with no shift should reproduce the input ±1 per channel.
		const out = shiftHsl('#3366cc', 0);
		expect(out).toMatch(/^#[0-9a-f]{6}$/);
		const chan = (s: string, i: number) => parseInt(s.slice(1 + i * 2, 3 + i * 2), 16);
		for (let i = 0; i < 3; i++) {
			expect(Math.abs(chan(out, i) - chan('#3366cc', i))).toBeLessThanOrEqual(2);
		}
	});

	it('lightens with positive dl and darkens with negative dl', () => {
		const luminance = (hex: string) =>
			parseInt(hex.slice(1, 3), 16) + parseInt(hex.slice(3, 5), 16) + parseInt(hex.slice(5, 7), 16);
		const base = '#3366cc';
		expect(luminance(shiftHsl(base, 0.2))).toBeGreaterThan(luminance(base));
		expect(luminance(shiftHsl(base, -0.2))).toBeLessThan(luminance(base));
	});

	it('expands 3-digit shorthand hex', () => {
		expect(shiftHsl('#abc', 0)).toMatch(/^#[0-9a-f]{6}$/);
	});
});

describe('themedDomColor', () => {
	it('passes colors through unchanged in dark theme', () => {
		expect(themedDomColor('#abcdef', 'dark')).toBe('#abcdef');
	});

	it('darkens an unmapped bright color for light backgrounds', () => {
		const out = themedDomColor('#ffff00', 'light'); // very bright yellow
		expect(out).not.toBe('#ffff00');
		expect(out).toMatch(/^#[0-9a-f]{6}$/);
	});

	it('leaves non-hex values alone in light theme', () => {
		expect(themedDomColor('currentColor', 'light')).toBe('currentColor');
	});
});
