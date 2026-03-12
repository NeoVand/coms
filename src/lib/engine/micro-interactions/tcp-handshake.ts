import type { MicroInteractionContext } from './index';

export function tcpHandshake({ node, parentNode, particles, time }: MicroInteractionContext): void {
	if (!parentNode) return;

	const cycle = (time % 4000) / 4000; // 4-second cycle
	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const speed = 2.5;

	if (cycle < 0.15) {
		// SYN — client to server
		if (Math.random() < 0.15) {
			particles.emit(node.x, node.y, nx * speed, ny * speed, node.color, {
				life: Math.floor(dist / speed),
				size: 3,
				type: 'label',
				label: 'SYN'
			});
		}
	} else if (cycle >= 0.25 && cycle < 0.4) {
		// SYN-ACK — server to client
		if (Math.random() < 0.15) {
			particles.emit(parentNode.x, parentNode.y, -nx * speed, -ny * speed, node.color, {
				life: Math.floor(dist / speed),
				size: 2,
				type: 'label',
				label: 'SYN-ACK'
			});
		}
	} else if (cycle >= 0.5 && cycle < 0.6) {
		// ACK
		if (Math.random() < 0.15) {
			particles.emit(node.x, node.y, nx * speed, ny * speed, node.color, {
				life: Math.floor(dist / speed),
				size: 2,
				type: 'label',
				label: 'ACK'
			});
		}
	} else if (cycle >= 0.65) {
		// Data stream — steady ordered packets
		if (Math.random() < 0.08) {
			particles.emit(node.x, node.y, nx * speed * 1.2, ny * speed * 1.2, node.color, {
				life: Math.floor(dist / (speed * 1.2)),
				size: 2
			});
		}
	}
}
