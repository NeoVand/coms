import { error } from '@sveltejs/kit';
import { pioneers, getPioneerById } from '$lib/data/pioneers';

export const prerender = true;

/** Pre-render every pioneer at build time. */
export function entries() {
	return pioneers.map((p) => ({ id: p.id }));
}

export function load({ params }: { params: { id: string } }) {
	const pioneer = getPioneerById(params.id);
	if (!pioneer) throw error(404, `Unknown pioneer: ${params.id}`);
	return { pioneerId: params.id };
}
