import { describe, it, expect } from 'vitest';
import {
	lerp,
	clamp,
	distance,
	pointInCircle,
	easeOutCubic,
	easeInOutCubic,
	normalizeAngle
} from './math';

describe('lerp', () => {
	it('returns endpoints at t=0 and t=1', () => {
		expect(lerp(10, 20, 0)).toBe(10);
		expect(lerp(10, 20, 1)).toBe(20);
	});
	it('interpolates the midpoint and extrapolates past the range', () => {
		expect(lerp(0, 100, 0.5)).toBe(50);
		expect(lerp(0, 10, 1.5)).toBe(15);
	});
});

describe('clamp', () => {
	it('bounds values to [min, max]', () => {
		expect(clamp(5, 0, 10)).toBe(5);
		expect(clamp(-3, 0, 10)).toBe(0);
		expect(clamp(42, 0, 10)).toBe(10);
	});
});

describe('distance / pointInCircle', () => {
	it('computes euclidean distance (3-4-5)', () => {
		expect(distance(0, 0, 3, 4)).toBe(5);
	});
	it('treats the radius as inclusive', () => {
		expect(pointInCircle(3, 4, 0, 0, 5)).toBe(true);
		expect(pointInCircle(3, 4, 0, 0, 4.99)).toBe(false);
	});
});

describe('easing', () => {
	it('easeOutCubic maps [0,1] to [0,1] monotonically', () => {
		expect(easeOutCubic(0)).toBe(0);
		expect(easeOutCubic(1)).toBe(1);
		expect(easeOutCubic(0.5)).toBeCloseTo(0.875, 5);
	});
	it('easeInOutCubic is symmetric around 0.5', () => {
		expect(easeInOutCubic(0)).toBe(0);
		expect(easeInOutCubic(1)).toBe(1);
		expect(easeInOutCubic(0.5)).toBeCloseTo(0.5, 5);
		// symmetry: f(t) + f(1-t) === 1
		expect(easeInOutCubic(0.2) + easeInOutCubic(0.8)).toBeCloseTo(1, 5);
	});
});

describe('normalizeAngle', () => {
	const TAU = 2 * Math.PI;
	it('wraps into [0, 2π)', () => {
		expect(normalizeAngle(0)).toBeCloseTo(0, 5);
		expect(normalizeAngle(TAU)).toBeCloseTo(0, 5);
		expect(normalizeAngle(-Math.PI)).toBeCloseTo(Math.PI, 5);
		expect(normalizeAngle(3 * TAU + 1)).toBeCloseTo(1, 5);
	});
});
