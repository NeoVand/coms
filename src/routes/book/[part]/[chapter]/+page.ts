import { error } from '@sveltejs/kit';
import { bookParts, getChapter } from '$lib/data/book/chapters';

export const prerender = true;

/** Pre-render every chapter at build time, across every part. */
export function entries() {
	const out: { part: string; chapter: string }[] = [];
	for (const part of bookParts) {
		for (const c of part.chapters) {
			out.push({ part: part.id, chapter: c.id });
		}
	}
	return out;
}

export function load({ params }: { params: { part: string; chapter: string } }) {
	const chapter = getChapter(params.part, params.chapter);
	if (!chapter) throw error(404, `Unknown chapter: ${params.part}/${params.chapter}`);
	return { partId: params.part, chapterId: params.chapter };
}
