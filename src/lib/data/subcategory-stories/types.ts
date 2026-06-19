/**
 * Subcategory stories use the same section types as category stories — the
 * structure is identical (narrative, timeline, pioneers, callout, diagram,
 * image). Only the parent id differs.
 */
export type { Pioneer, TimelineEntry, StorySection } from '../category-stories/types';

import type { StoryContent } from '../category-stories/types';

export interface SubcategoryStory extends StoryContent {
	subcategoryId: string;
}
