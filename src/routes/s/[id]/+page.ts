import { error } from '@sveltejs/kit';
import { subcategories, subcategoryMap } from '$lib/data/subcategories';

export const prerender = true;

/** Enumerate every subcategory so the static adapter pre-renders one page per id. */
export function entries() {
	return subcategories.map((s) => ({ id: s.id }));
}

export function load({ params }: { params: { id: string } }) {
	const sub = subcategoryMap.get(params.id);
	if (!sub) throw error(404, `Unknown subcategory: ${params.id}`);
	return { subcategoryId: params.id };
}
