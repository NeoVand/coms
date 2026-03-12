import type { MicroInteractionContext } from './index';

/**
 * Peer-to-Peer — For WebRTC, SIP
 * Bidirectional symmetric flow: particles traveling in both directions
 * simultaneously between node and parent, equal rate and size.
 */
export function peerToPeer({ node, parentNode, particles, time }: MicroInteractionContext): void {
	if (!parentNode) return;

	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const speed = 2.2;
	const travelLife = Math.floor(dist / speed);
	const emitRate = 0.06;

	// Symmetric outgoing flow: node -> parent
	if (Math.random() < emitRate) {
		const jitter = 1.5;
		particles.emit(
			node.x + (Math.random() - 0.5) * 4,
			node.y + (Math.random() - 0.5) * 4,
			nx * speed + (Math.random() - 0.5) * jitter * 0.1,
			ny * speed + (Math.random() - 0.5) * jitter * 0.1,
			node.color,
			{
				life: travelLife,
				size: 2
			}
		);
	}

	// Symmetric incoming flow: parent -> node
	if (Math.random() < emitRate) {
		const jitter = 1.5;
		particles.emit(
			parentNode.x + (Math.random() - 0.5) * 4,
			parentNode.y + (Math.random() - 0.5) * 4,
			-nx * speed + (Math.random() - 0.5) * jitter * 0.1,
			-ny * speed + (Math.random() - 0.5) * jitter * 0.1,
			node.color,
			{
				life: travelLife,
				size: 2
			}
		);
	}

	// Periodic connection heartbeat: small rings at both ends simultaneously
	const heartbeat = (time % 2500) / 2500;
	if (heartbeat < 0.015 && Math.random() < 0.5) {
		particles.emit(node.x, node.y, 0, 0, node.color, {
			life: 30,
			size: 5,
			type: 'ring'
		});
		particles.emit(parentNode.x, parentNode.y, 0, 0, node.color, {
			life: 30,
			size: 5,
			type: 'ring'
		});
	}
}
