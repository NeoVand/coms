import { error } from '@sveltejs/kit';
import { outages, getOutageById } from '$lib/data/outages';

export const prerender = true;

export function entries() {
	return outages.map((o) => ({ id: o.id }));
}

export function load({ params }: { params: { id: string } }) {
	const outage = getOutageById(params.id);
	if (!outage) throw error(404, `Unknown outage: ${params.id}`);
	return { outageId: params.id };
}
