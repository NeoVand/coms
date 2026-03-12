import type { MicroInteractionContext } from './index';

/**
 * Streaming — For RTP, HLS, RTSP
 * Continuous evenly-spaced segments flowing one direction,
 * like frames in a video stream. Steady, ordered, constant spacing.
 */
export function streaming({ node, parentNode, particles, time }: MicroInteractionContext): void {
	if (!parentNode) return;

	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const speed = 2;
	const segmentInterval = 220; // ms between segments
	const travelLife = Math.floor(dist / speed);

	// Use time to create evenly spaced emissions
	const phase = time % segmentInterval;

	// Emit one segment-particle at the start of each interval
	if (phase < 16.7) {
		// Alternating between slightly larger "keyframe" and smaller "delta frame"
		const segmentIndex = Math.floor(time / segmentInterval);
		const isKeyframe = segmentIndex % 8 === 0;

		particles.emit(
			node.x + (Math.random() - 0.5) * 1,
			node.y + (Math.random() - 0.5) * 1,
			nx * speed,
			ny * speed,
			node.color,
			{
				life: travelLife,
				size: isKeyframe ? 3.5 : 2
			}
		);

		// Keyframes get a subtle ring marker
		if (isKeyframe) {
			particles.emit(node.x, node.y, nx * speed, ny * speed, node.color, {
				life: travelLife,
				size: 4,
				type: 'ring'
			});
		}
	}
}
