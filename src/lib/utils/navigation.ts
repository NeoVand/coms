/**
 * URL navigation helpers.
 *
 * Selection state lives in `AppState`, but the URL is the source of
 * truth for refresh/share/back-forward. These helpers wrap `goto()` so
 * call sites stay declarative and we can change URL shape in one place.
 *
 * The matching `/p/[id]`, `/c/[id]`, `/journey/[id]` routes mount a
 * tiny page component that calls `selectNode()` (or `startJourney()`)
 * from their own `$effect` — so navigating here is enough to drive the
 * panel. No double-write needed at the call site.
 */

import { goto } from '$app/navigation';
import { base } from '$app/paths';
import type { GraphNode } from '$lib/data/types';

interface NavOptions {
	/** Pass-through to SvelteKit `goto`: scrollTo top after navigation. */
	keepScroll?: boolean;
	/** Pass-through to SvelteKit `goto`: replace the current history entry. */
	replaceState?: boolean;
}

function go(path: string, opts: NavOptions = {}): Promise<void> {
	return goto(`${base}${path}`, {
		noScroll: opts.keepScroll ?? false,
		replaceState: opts.replaceState ?? false,
		keepFocus: true
	});
}

/**
 * Bare graph, no panel. The default zero-state of the app.
 * Use this for "close the panel" / "go home" affordances (Esc, X close,
 * mobile backdrop tap).
 */
export function navigateToHub(opts: NavOptions = {}) {
	return go('/', opts);
}

/**
 * Hub welcome panel — the Home / Concepts / Journeys tabs. Distinct
 * URL from `/` so the two states are independently shareable and so
 * clicking the central PROTOCOLS node has somewhere to land.
 */
export function navigateToHubPanel(opts: NavOptions = {}) {
	return go('/hub', opts);
}

export function navigateToProtocol(id: string, opts: NavOptions = {}) {
	return go(`/p/${id}`, opts);
}

export function navigateToCategory(id: string, opts: NavOptions = {}) {
	return go(`/c/${id}`, opts);
}

export function navigateToJourney(id: string, opts: NavOptions = {}) {
	return go(`/journey/${id}`, opts);
}

/**
 * A standalone book chapter, identified by (partId, chapterId). The
 * route mounts ChapterView in the side panel. Separate from the
 * Glossary tab, which is the searchable atomic-term reference.
 *
 * Single-arg form is kept for backwards compatibility — it assumes
 * a Part I (foundations) chapter.
 */
export function navigateToBookChapter(
	partOrChapterId: string,
	chapterIdOrOpts?: string | NavOptions,
	maybeOpts?: NavOptions
) {
	let partId: string;
	let chapterId: string;
	let opts: NavOptions;
	if (typeof chapterIdOrOpts === 'string') {
		partId = partOrChapterId;
		chapterId = chapterIdOrOpts;
		opts = maybeOpts ?? {};
	} else {
		partId = 'foundations';
		chapterId = partOrChapterId;
		opts = chapterIdOrOpts ?? {};
	}
	return go(`/book/${partId}/${chapterId}`, opts);
}

/**
 * The detailed table of contents for one part (`/book/[part]`).
 * The full-book TOC has been retired — Home shows the condensed
 * 12-part overview, and each part has its own detailed TOC at this
 * URL. Click `navigateToBookChapter` to jump deeper.
 */
export function navigateToBookPart(partId: string, opts: NavOptions = {}) {
	return go(`/book/${partId}`, opts);
}

/** A pioneer bio page — the architects of the field. */
export function navigateToPioneer(id: string, opts: NavOptions = {}) {
	return go(`/pioneer/${id}`, opts);
}

/** An RFC reference page (rfcs.ts entries). */
export function navigateToRfc(number: string, opts: NavOptions = {}) {
	return go(`/rfc/${number}`, opts);
}

/** A famous-outage replay (outages.ts entries). */
export function navigateToOutage(id: string, opts: NavOptions = {}) {
	return go(`/outage/${id}`, opts);
}

/** A 2024-2026 frontier development (frontier.ts entries). */
export function navigateToFrontier(id: string, opts: NavOptions = {}) {
	return go(`/frontier/${id}`, opts);
}

// ── Registry indexes ────────────────────────────────────────────
export function navigateToPioneersIndex(opts: NavOptions = {}) {
	return go('/pioneers', opts);
}
export function navigateToRfcsIndex(opts: NavOptions = {}) {
	return go('/rfcs', opts);
}
export function navigateToOutagesIndex(opts: NavOptions = {}) {
	return go('/outages', opts);
}
export function navigateToFrontierIndex(opts: NavOptions = {}) {
	return go('/frontier', opts);
}
export function navigateToGlossaryIndex(opts: NavOptions = {}) {
	return go('/glossary', opts);
}

/** Pick the right URL for any GraphNode (hub / category / protocol). */
export function navigateToNode(node: GraphNode, opts: NavOptions = {}) {
	if (node.type === 'hub') return navigateToHubPanel(opts);
	if (node.type === 'category') return navigateToCategory(node.id, opts);
	return navigateToProtocol(node.id, opts);
}
