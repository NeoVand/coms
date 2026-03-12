import type { MicroInteractionContext } from './index';

/**
 * Default Pulse — For SCTP, CoAP, DHCP, NTP, SNMP, SSH
 * Simple gentle pulsing ring at the node center.
 * Emits 'ring' type particles periodically that expand and fade.
 */
export function defaultPulse({ node, particles, time }: MicroInteractionContext): void {
	const pulseInterval = 1800; // ms between pulses
	const phase = time % pulseInterval;

	// Primary pulse ring
	if (phase < 16.7) {
		particles.emit(node.x, node.y, 0, 0, node.color, {
			life: 50,
			size: 10,
			type: 'ring'
		});
	}

	// Secondary smaller ring slightly delayed for a layered effect
	if (phase > 200 && phase < 216.7) {
		particles.emit(node.x, node.y, 0, 0, node.color, {
			life: 35,
			size: 6,
			type: 'ring'
		});
	}

	// Occasional tiny dot particle drifting outward for subtle activity
	if (Math.random() < 0.015) {
		const angle = Math.random() * Math.PI * 2;
		const driftSpeed = 0.3 + Math.random() * 0.3;
		particles.emit(
			node.x + Math.cos(angle) * 3,
			node.y + Math.sin(angle) * 3,
			Math.cos(angle) * driftSpeed,
			Math.sin(angle) * driftSpeed,
			node.color,
			{
				life: 40 + Math.floor(Math.random() * 20),
				size: 1.2 + Math.random() * 0.6
			}
		);
	}
}
