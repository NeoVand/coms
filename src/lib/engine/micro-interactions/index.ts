import type { GraphNode } from '$lib/data/types';
import type { ParticleSystem } from '../particle-system';
import { tcpHandshake } from './tcp-handshake';
import { udpScatter } from './udp-scatter';
import { websocketTube } from './websocket-tube';
import { httpBlocking } from './http-blocking';
import { tlsShield } from './tls-shield';

export interface MicroInteractionContext {
	node: GraphNode;
	parentNode?: GraphNode;
	particles: ParticleSystem;
	time: number;
	dt: number;
	ctx: CanvasRenderingContext2D;
}

type MicroInteractionFn = (context: MicroInteractionContext) => void;

const interactionRegistry: Record<string, MicroInteractionFn> = {
	handshake: tcpHandshake,
	scatter: udpScatter,
	tube: websocketTube,
	blocking: httpBlocking,
	shield: tlsShield
};

export function runMicroInteraction(type: string, context: MicroInteractionContext): void {
	const fn = interactionRegistry[type];
	if (fn) fn(context);
}
