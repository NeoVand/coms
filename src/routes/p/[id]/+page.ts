import { error } from '@sveltejs/kit';
import { allProtocols, getProtocolById } from '$lib/data';

export const prerender = true;

/** Enumerate every protocol so the static adapter pre-renders one page per id. */
export function entries() {
	return allProtocols.map((p) => ({ id: p.id }));
}

export function load({ params }: { params: { id: string } }) {
	const proto = getProtocolById(params.id);
	if (!proto) throw error(404, `Unknown protocol: ${params.id}`);
	return { protocolId: params.id };
}
