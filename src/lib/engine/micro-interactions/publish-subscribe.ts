import type { MicroInteractionContext } from './index';

/**
 * Publish-Subscribe — For MQTT, AMQP, STOMP
 * Fan-out pattern: one message originates from the node, then splits
 * into 3 copies traveling to slightly different angles.
 * Uses 'ring' particle type for the expanding broadcast effect.
 */
export function publishSubscribe({
	node,
	parentNode,
	particles,
	time
}: MicroInteractionContext): void {
	if (!parentNode) return;

	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const speed = 2;

	// Periodic broadcast pulse — ring expanding from node
	const broadcastCycle = (time % 3000) / 3000;
	if (broadcastCycle < 0.02 && Math.random() < 0.5) {
		particles.emit(node.x, node.y, 0, 0, node.color, {
			life: 40,
			size: 8,
			type: 'ring'
		});
	}

	// Fan-out: 3 message copies at different angles
	const fanAngles = [-0.3, 0, 0.3]; // radians offset from main direction

	if (Math.random() < 0.025) {
		for (const angleOffset of fanAngles) {
			// Rotate the direction vector by angleOffset
			const cos = Math.cos(angleOffset);
			const sin = Math.sin(angleOffset);
			const rnx = nx * cos - ny * sin;
			const rny = nx * sin + ny * cos;

			// Emit the message copy
			particles.emit(node.x, node.y, rnx * speed, rny * speed, node.color, {
				life: Math.floor(dist / speed) + Math.floor(Math.random() * 10),
				size: 2.2
			});
		}

		// Small expanding ring at origin to mark the publish moment
		particles.emit(node.x, node.y, 0, 0, node.color, {
			life: 25,
			size: 5,
			type: 'ring'
		});
	}

	// Occasional subscriber acknowledgment ring at parent
	if (Math.random() < 0.008) {
		particles.emit(parentNode.x, parentNode.y, 0, 0, node.color, {
			life: 30,
			size: 6,
			type: 'ring'
		});
	}
}
