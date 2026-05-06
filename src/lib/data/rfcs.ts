/**
 * RFCs — citations that appear repeatedly throughout the app.
 *
 * Centralized so an `<RfcRef number="9293" />` component can render the
 * canonical title + link without scattering URLs through prose. Keep
 * entries minimal — only RFCs we cite by name (not every RFC ever).
 */

export type RfcStatus =
	| 'internet-standard'
	| 'standards-track'
	| 'proposed-standard'
	| 'best-current-practice'
	| 'informational'
	| 'experimental'
	| 'historic'
	| 'draft';

export interface RfcSection {
	/** Section reference, e.g., "3.1", "§4.2". */
	ref: string;
	description: string;
}

export interface Rfc {
	/** RFC number as a string (e.g., "9293") or canonical id ("STD 7"). */
	number: string;
	title: string;
	year: number;
	authors?: string;
	status?: RfcStatus;
	obsoletes?: string[];
	obsoletedBy?: string[];
	url: string;
	/** Sections worth pointing at directly. */
	notableSections?: RfcSection[];
	/** Protocol IDs this RFC defines or extends. */
	protocols?: string[];
}

export const rfcs: Rfc[] = [];

export const rfcMap = new Map(rfcs.map((r) => [r.number, r]));

export function getRfcByNumber(num: string): Rfc | undefined {
	return rfcMap.get(num);
}

export function getRfcsForProtocol(protocolId: string): Rfc[] {
	return rfcs.filter((r) => r.protocols?.includes(protocolId));
}
