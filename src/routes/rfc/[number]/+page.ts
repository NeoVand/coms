import { error } from '@sveltejs/kit';
import { rfcs, getRfcByNumber } from '$lib/data/rfcs';

export const prerender = true;

export function entries() {
	return rfcs.map((r) => ({ number: r.number }));
}

export function load({ params }: { params: { number: string } }) {
	const rfc = getRfcByNumber(params.number);
	if (!rfc) throw error(404, `Unknown RFC: ${params.number}`);
	return { rfcNumber: params.number };
}
