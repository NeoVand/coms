import type { MicroInteractionContext } from './index';
import { hexToRgba } from '$lib/utils/colors';

export function tlsShield({
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
	const speed = 2;

	// Encrypted data packets with shield wrapper
	if (Math.random() < 0.05) {
		particles.emit(node.x, node.y, nx * speed, ny * speed, node.color, {
			life: Math.floor(dist / speed),
			size: 3,
			type: 'ring'
		});
		// Inner data dot
		particles.emit(node.x, node.y, nx * speed, ny * speed, '#FFFFFF', {
			life: Math.floor(dist / speed),
			size: 1.5
		});
	}

	// Shield glow along the edge
	const midX = (node.x + parentNode.x) / 2;
	const midY = (node.y + parentNode.y) / 2;
	const shieldPulse = 0.3 + 0.1 * Math.sin(time * 0.004);

	// Draw a subtle lock/shield indicator at midpoint
	const lockSize = 6;
	ctx.save();
	ctx.translate(midX, midY);

	// Shield shape
	ctx.beginPath();
	ctx.moveTo(0, -lockSize);
	ctx.lineTo(lockSize * 0.8, -lockSize * 0.3);
	ctx.lineTo(lockSize * 0.6, lockSize * 0.8);
	ctx.lineTo(0, lockSize);
	ctx.lineTo(-lockSize * 0.6, lockSize * 0.8);
	ctx.lineTo(-lockSize * 0.8, -lockSize * 0.3);
	ctx.closePath();

	ctx.fillStyle = hexToRgba(node.color, shieldPulse);
	ctx.fill();
	ctx.strokeStyle = hexToRgba(node.color, shieldPulse + 0.2);
	ctx.lineWidth = 1;
	ctx.stroke();

	ctx.restore();
}
