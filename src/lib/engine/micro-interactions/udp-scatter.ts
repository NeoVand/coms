import type { MicroInteractionContext } from './index';

export function udpScatter({ node, parentNode, particles, time }: MicroInteractionContext): void {
	if (!parentNode) return;

	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const speed = 3.5;

	// Fast scattered packets
	if (Math.random() < 0.12) {
		const fizzle = Math.random() < 0.05; // 5% packet loss
		const spread = 0.8;

		particles.emit(
			node.x + (Math.random() - 0.5) * 10,
			node.y + (Math.random() - 0.5) * 10,
			nx * speed + (Math.random() - 0.5) * spread,
			ny * speed + (Math.random() - 0.5) * spread,
			node.color,
			{
				life: fizzle
					? Math.floor((dist / speed) * 0.3 + ((Math.random() * dist) / speed) * 0.3) // Dies early
					: Math.floor(dist / speed),
				size: 1.5 + Math.random()
			}
		);
	}

	// Occasional burst
	if (Math.random() < 0.01) {
		for (let i = 0; i < 5; i++) {
			particles.emit(
				node.x,
				node.y,
				nx * speed * (0.8 + Math.random() * 0.4) + (Math.random() - 0.5) * 1.5,
				ny * speed * (0.8 + Math.random() * 0.4) + (Math.random() - 0.5) * 1.5,
				node.color,
				{
					life: Math.floor((dist / speed) * (0.5 + Math.random() * 0.5)),
					size: 1 + Math.random() * 2
				}
			);
		}
	}

	void time;
}
