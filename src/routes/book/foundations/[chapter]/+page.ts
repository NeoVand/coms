import { error } from '@sveltejs/kit';
import { foundationSections, getFoundationSection } from '$lib/data/concept-foundations';

export const prerender = true;

/** Pre-render every Part I chapter at build time. */
export function entries() {
	return foundationSections.map((s) => ({ chapter: s.id }));
}

export function load({ params }: { params: { chapter: string } }) {
	const section = getFoundationSection(params.chapter);
	if (!section) throw error(404, `Unknown chapter: ${params.chapter}`);
	return { chapterId: params.chapter };
}
