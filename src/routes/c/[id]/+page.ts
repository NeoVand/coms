import { error } from '@sveltejs/kit';
import { categories, getCategoryById } from '$lib/data';

export const prerender = true;

/** Enumerate every category so the static adapter pre-renders one page per id. */
export function entries() {
	return categories.map((c) => ({ id: c.id }));
}

export function load({ params }: { params: { id: string } }) {
	const cat = getCategoryById(params.id);
	if (!cat) throw error(404, `Unknown category: ${params.id}`);
	return { categoryId: params.id };
}
