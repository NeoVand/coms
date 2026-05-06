/**
 * Frontier — what's actively shipping or being standardized in 2024–2026.
 *
 * Each entry tags the protocols it touches, so a protocol page can
 * surface "Where this is heading" without reaching into a category file.
 * Pulled from §9 of the category research files.
 *
 * Examples this is built to hold: post-quantum TLS (X25519MLKEM768),
 * BBRv3, L4S, ECH (RFC 9849), RPKI/ROV/ASPA, IPv6 hitting 50% of Google
 * traffic (March 2026), Wi-Fi 7 / 8, 800 GbE / 1.6 TbE, MoQ Transport,
 * Ultra Ethernet 1.0, Streamable HTTP for MCP, A2A.
 */

import type { SourceLink } from './types';

export type FrontierStatus = 'shipped' | 'rolling-out' | 'standardizing' | 'experimental';

export type FrontierTopic =
	| 'security'
	| 'transport'
	| 'wireless'
	| 'web'
	| 'datacenter'
	| 'observability'
	| 'ai-agents'
	| 'standards'
	| 'iot'
	| 'realtime-av';

export interface FrontierMetric {
	label: string;
	value: string;
	date?: string;
	source?: SourceLink;
}

export interface FrontierEntry {
	id: string;
	title: string;
	oneLiner: string;
	topic: FrontierTopic;
	status: FrontierStatus;
	/** When this hit its current milestone — "2026-03-28", "active 2025-2026", etc. */
	date: string;
	/** Protocol IDs this affects. */
	protocols: string[];
	/** A few paragraphs of context. */
	description: string;
	/** Adoption / deployment data points. */
	metrics?: FrontierMetric[];
	sources: SourceLink[];
}

export const frontierEntries: FrontierEntry[] = [];

export const frontierMap = new Map(frontierEntries.map((f) => [f.id, f]));

export function getFrontierById(id: string): FrontierEntry | undefined {
	return frontierMap.get(id);
}

export function getFrontierForProtocol(protocolId: string): FrontierEntry[] {
	return frontierEntries.filter((f) => f.protocols.includes(protocolId));
}

export function getFrontierByTopic(topic: FrontierTopic): FrontierEntry[] {
	return frontierEntries.filter((f) => f.topic === topic);
}
