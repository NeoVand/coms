import { error } from '@sveltejs/kit';
import { bookParts, getBookPart } from '$lib/data/book/chapters';

export const prerender = true;

/** Pre-render every part's TOC at build time. */
export function entries() {
	return bookParts.map((p) => ({ part: p.id }));
}

export function load({ params }: { params: { part: string } }) {
	const part = getBookPart(params.part);
	if (!part) throw error(404, `Unknown part: ${params.part}`);
	return { partId: params.part };
}
