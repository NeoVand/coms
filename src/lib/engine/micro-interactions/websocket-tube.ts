import type { MicroInteractionContext } from './index';
import { hexToRgba } from '$lib/utils/colors';

export function websocketTube({
	node,
	parentNode,
	particles,
	time,
	ctx
}: MicroInteractionContext): void {
	if (!parentNode) return;

	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const perpX = -ny;
	const perpY = nx;

	// Draw glowing tube
	const tubeWidth = 4 + Math.sin(time * 0.005) * 1;
	const gradient = ctx.createLinearGradient(
		node.x + perpX * tubeWidth * 3,
		node.y + perpY * tubeWidth * 3,
		node.x - perpX * tubeWidth * 3,
		node.y - perpY * tubeWidth * 3
	);
	gradient.addColorStop(0, hexToRgba(node.color, 0));
	gradient.addColorStop(0.3, hexToRgba(node.color, 0.15));
	gradient.addColorStop(0.5, hexToRgba(node.color, 0.25));
	gradient.addColorStop(0.7, hexToRgba(node.color, 0.15));
	gradient.addColorStop(1, hexToRgba(node.color, 0));

	ctx.beginPath();
	ctx.moveTo(node.x + perpX * tubeWidth * 3, node.y + perpY * tubeWidth * 3);
	ctx.lineTo(parentNode.x + perpX * tubeWidth * 3, parentNode.y + perpY * tubeWidth * 3);
	ctx.lineTo(parentNode.x - perpX * tubeWidth * 3, parentNode.y - perpY * tubeWidth * 3);
	ctx.lineTo(node.x - perpX * tubeWidth * 3, node.y - perpY * tubeWidth * 3);
	ctx.closePath();
	ctx.fillStyle = gradient;
	ctx.fill();

	// Bidirectional particles
	const speed = 2;
	if (Math.random() < 0.08) {
		// Client → Server
		particles.emit(node.x, node.y, nx * speed, ny * speed, node.color, {
			life: Math.floor(dist / speed),
			size: 2
		});
	}
	if (Math.random() < 0.08) {
		// Server → Client
		particles.emit(parentNode.x, parentNode.y, -nx * speed, -ny * speed, node.color, {
			life: Math.floor(dist / speed),
			size: 2
		});
	}
}
