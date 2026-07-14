import type { LiveDriver } from './types';
import { dnsLiveDriver } from './dns';

export type { LiveDriver, LiveContext } from './types';
export { WebRTCSession } from './webrtc.svelte';
export type { WebRTCPhase, ChatMessage } from './webrtc.svelte';

/**
 * How a protocol can be exercised for real in the browser:
 *  - `request`: a one-shot exchange driven by a Run button (DNS-over-HTTPS).
 *  - `session`: an interactive, stateful connection with its own panel (WebRTC
 *    data-channel chat between two devices).
 * A protocol shows the Demo/Live toggle only if it has an entry here.
 */
export type LiveKind = 'request' | 'session';

type LiveEntry = { kind: 'request'; make: () => LiveDriver } | { kind: 'session'; note: string };

const LIVE: Record<string, LiveEntry> = {
	dns: { kind: 'request', make: dnsLiveDriver },
	webrtc: {
		kind: 'session',
		note: 'Open this page on a second device on the same Wi‑Fi, create an invite here, and exchange the two codes. You get a real peer‑to‑peer data channel — every message below is an actual packet, no server involved.'
	}
};

export function hasLiveDriver(protocolId: string): boolean {
	return protocolId in LIVE;
}

export function liveKind(protocolId: string): LiveKind | null {
	return LIVE[protocolId]?.kind ?? null;
}

/** The honest one-line note shown under the title in live mode. */
export function liveNoteFor(protocolId: string): string | null {
	const entry = LIVE[protocolId];
	if (!entry) return null;
	return entry.kind === 'request' ? entry.make().note : entry.note;
}

/** The request driver for a one-shot protocol (null for session protocols). */
export function liveDriverFor(protocolId: string): LiveDriver | null {
	const entry = LIVE[protocolId];
	return entry?.kind === 'request' ? entry.make() : null;
}
