import type { MicroInteractionContext } from './index';

/**
 * Multiplex — For HTTP/2, HTTP/3, QUIC
 * Multiple colored streams traveling in parallel, 3-4 streams slightly offset,
 * each a different shade of the node color.
 */
export function multiplex({ node, parentNode, particles, time }: MicroInteractionContext): void {
	if (!parentNode) return;

	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const perpX = -ny;
	const perpY = nx;
	const speed = 2.5;

	// Parse base color and create shifted hues for each stream
	const streamColors = getStreamColors(node.color);
	const streamCount = 4;
	const streamSpacing = 5;

	for (let i = 0; i < streamCount; i++) {
		// Offset each stream perpendicular to the travel direction
		const offset = (i - (streamCount - 1) / 2) * streamSpacing;
		const originX = node.x + perpX * offset;
		const originY = node.y + perpY * offset;

		// Stagger emission timing per stream so they don't all fire at once
		const phase = (time * 0.003 + i * 0.25) % 1;
		if (phase < 0.05 && Math.random() < 0.3) {
			particles.emit(
				originX + (Math.random() - 0.5) * 2,
				originY + (Math.random() - 0.5) * 2,
				nx * speed,
				ny * speed,
				streamColors[i % streamColors.length],
				{
					life: Math.floor(dist / speed),
					size: 1.8 + Math.random() * 0.4
				}
			);
		}
	}
}

/** Derive 4 color variations from a hex color by shifting lightness/saturation */
function getStreamColors(hex: string): string[] {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);

	return [
		hex,
		rgbToHex(Math.min(255, r + 40), Math.max(0, g - 20), Math.min(255, b + 30)),
		rgbToHex(Math.max(0, r - 30), Math.min(255, g + 40), Math.max(0, b - 20)),
		rgbToHex(Math.min(255, r + 20), Math.min(255, g + 20), Math.max(0, b - 40))
	];
}

function rgbToHex(r: number, g: number, b: number): string {
	return '#' + [r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('');
}
