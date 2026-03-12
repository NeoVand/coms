import type { MicroInteractionContext } from './index';

/**
 * Query-Response — For DNS, GraphQL, gRPC
 * A "?" particle travels from node to parent, then after a delay
 * a structured response (multiple dots in formation) travels back.
 */

let qrPhase: 'query' | 'wait' | 'response' | 'cooldown' = 'query';
let qrTimer = 0;

export function queryResponse({
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
	const perpX = -ny;
	const perpY = nx;
	const speed = 2.2;
	const travelTime = dist / speed;

	qrTimer += dt;

	const queryDuration = 80;
	const waitDuration = travelTime * 16.67 + 150;
	const responseDuration = 120;
	const cooldownDuration = travelTime * 16.67 + 400;

	if (qrPhase === 'query') {
		// Send query "?" label particle from node toward parent
		if (qrTimer < 30) {
			if (Math.random() < 0.4) {
				particles.emit(node.x, node.y, nx * speed, ny * speed, node.color, {
					life: Math.floor(travelTime),
					size: 3.5,
					type: 'label',
					label: '?'
				});
			}
		}
		if (qrTimer >= queryDuration) {
			qrTimer = 0;
			qrPhase = 'wait';
		}
	} else if (qrPhase === 'wait') {
		// Brief pause while "server processes"
		if (qrTimer >= waitDuration) {
			qrTimer = 0;
			qrPhase = 'response';
		}
	} else if (qrPhase === 'response') {
		// Structured response: a formation of 5 dots traveling back
		if (qrTimer < 30) {
			const formationOffsets = [
				{ x: 0, y: 0 },
				{ x: 1, y: 0 },
				{ x: -1, y: 0 },
				{ x: 0.5, y: 1 },
				{ x: -0.5, y: 1 }
			];
			const spacing = 4;
			for (const offset of formationOffsets) {
				const ox = perpX * offset.x * spacing + nx * offset.y * spacing;
				const oy = perpY * offset.x * spacing + ny * offset.y * spacing;
				particles.emit(
					parentNode.x + ox,
					parentNode.y + oy,
					-nx * speed + (Math.random() - 0.5) * 0.15,
					-ny * speed + (Math.random() - 0.5) * 0.15,
					node.color,
					{
						life: Math.floor(travelTime),
						size: 2
					}
				);
			}
		}
		if (qrTimer >= responseDuration) {
			qrTimer = 0;
			qrPhase = 'cooldown';
		}
	} else if (qrPhase === 'cooldown') {
		if (qrTimer >= cooldownDuration) {
			qrTimer = 0;
			qrPhase = 'query';
		}
	}

	void time;
}
