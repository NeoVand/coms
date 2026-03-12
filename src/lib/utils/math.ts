export function lerp(a: number, b: number, t: number): number {
	return a + (b - a) * t;
}

export function clamp(value: number, min: number, max: number): number {
	return Math.min(Math.max(value, min), max);
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

export function pointInCircle(px: number, py: number, cx: number, cy: number, r: number): boolean {
	return distance(px, py, cx, cy) <= r;
}

export function easeOutCubic(t: number): number {
	return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number): number {
	return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function normalizeAngle(angle: number): number {
	return ((angle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
}
