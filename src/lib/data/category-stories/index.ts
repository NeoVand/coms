import type { CategoryStory } from './types';
import { transportStory } from './transport';
import { webApiStory } from './web-api';
import { asyncIotStory } from './async-iot';
import { realtimeAvStory } from './realtime-av';
import { utilitiesStory } from './utilities';

const storyMap = new Map<string, CategoryStory>(
	[transportStory, webApiStory, asyncIotStory, realtimeAvStory, utilitiesStory].map((s) => [
		s.categoryId,
		s
	])
);

export function getCategoryStory(categoryId: string): CategoryStory | undefined {
	return storyMap.get(categoryId);
}

export type { CategoryStory, Pioneer, TimelineEntry, StorySection } from './types';
