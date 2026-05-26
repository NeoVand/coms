import type { SubcategoryStory } from './types';
import { httpVersionsStory } from './http-versions';
import { reliableStreamsStory } from './reliable-streams';
import { datagramTransportStory } from './datagram-transport';
import { routingStory } from './routing';
import { namingStory } from './naming';

const stories: SubcategoryStory[] = [
	httpVersionsStory,
	reliableStreamsStory,
	datagramTransportStory,
	routingStory,
	namingStory
];

const storyMap = new Map<string, SubcategoryStory>(
	stories.map((s) => [s.subcategoryId, s])
);

export function getSubcategoryStory(subcategoryId: string): SubcategoryStory | undefined {
	return storyMap.get(subcategoryId);
}

export type { SubcategoryStory, Pioneer, TimelineEntry, StorySection } from './types';
