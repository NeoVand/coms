import { error } from '@sveltejs/kit';
import { frontierEntries, getFrontierById } from '$lib/data/frontier';

export const prerender = true;

export function entries() {
	return frontierEntries.map((f) => ({ id: f.id }));
}

export function load({ params }: { params: { id: string } }) {
	const entry = getFrontierById(params.id);
	if (!entry) throw error(404, `Unknown frontier entry: ${params.id}`);
	return { frontierId: params.id };
}
