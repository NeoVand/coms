import type { LiveDriver } from './types';
import { dnsLiveDriver } from './dns';

export type { LiveDriver, LiveContext } from './types';

/**
 * Registry of protocols the browser can genuinely exercise live. A protocol
 * only shows the Demo/Live toggle if it has an entry here. Each value is a
 * factory so every run gets a fresh driver instance (future drivers — WebRTC,
 * WebSocket — hold per-connection state).
 */
const LIVE_DRIVERS: Record<string, () => LiveDriver> = {
	dns: dnsLiveDriver
};

export function hasLiveDriver(protocolId: string): boolean {
	return protocolId in LIVE_DRIVERS;
}

export function liveDriverFor(protocolId: string): LiveDriver | null {
	const factory = LIVE_DRIVERS[protocolId];
	return factory ? factory() : null;
}
