import { error } from '@sveltejs/kit';
import { journeys, getJourneyById } from '$lib/data/journeys';

export const prerender = true;

/** Enumerate every journey so the static adapter pre-renders one page per id. */
export function entries() {
	return journeys.map((j) => ({ id: j.id }));
}

export function load({ params }: { params: { id: string } }) {
	const j = getJourneyById(params.id);
	if (!j) throw error(404, `Unknown journey: ${params.id}`);
	return { journeyId: params.id };
}
