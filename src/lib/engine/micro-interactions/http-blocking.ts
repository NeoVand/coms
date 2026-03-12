import type { MicroInteractionContext } from './index';

let httpPhase: 'request' | 'wait' | 'response' | 'pause' = 'request';
let httpTimer = 0;

export function httpBlocking({
	node,
	parentNode,
	particles,
	time,
	dt
}: MicroInteractionContext): void {
	if (!parentNode) return;

	const dx = parentNode.x - node.x;
	const dy = parentNode.y - node.y;
	const dist = Math.sqrt(dx * dx + dy * dy);
	if (dist === 0) return;

	const nx = dx / dist;
	const ny = dy / dist;
	const speed = 2;

	httpTimer += dt;

	const phaseDuration = (dist / speed) * 16.67 + 200; // time for particle to travel + wait

	if (httpTimer >= phaseDuration) {
		httpTimer = 0;
		if (httpPhase === 'request') httpPhase = 'wait';
		else if (httpPhase === 'wait') httpPhase = 'response';
		else if (httpPhase === 'response') httpPhase = 'pause';
		else httpPhase = 'request';
	}

	if (httpPhase === 'request' && httpTimer < 50) {
		// Send one request packet
		particles.emit(node.x, node.y, nx * speed, ny * speed, node.color, {
			life: Math.floor(dist / speed),
			size: 3
		});
	} else if (httpPhase === 'response' && httpTimer < 50) {
		// Send one response packet back
		particles.emit(parentNode.x, parentNode.y, -nx * speed, -ny * speed, node.color, {
			life: Math.floor(dist / speed),
			size: 3
		});
	}

	void time;
}
