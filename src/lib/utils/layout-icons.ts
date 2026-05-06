/**
 * SVG markup for the four graph-layout icons. Lives outside `LayoutPicker`
 * so the guided tour popover (which renders raw HTML via driver.js) can
 * embed the same glyphs the picker dropdown uses — keeping the visual
 * vocabulary consistent.
 *
 * Both consumers render these via `{@html …}` / `innerHTML`. All paths use
 * `currentColor`, so the surrounding text/icon color carries through.
 */

import type { LayoutMode } from '$lib/engine/layouts';

export const LAYOUT_ICON_SVG: Record<LayoutMode, string> = {
	force: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="100%" height="100%">
		<circle cx="10" cy="4" r="2" fill="currentColor" stroke="none"/>
		<circle cx="4" cy="15" r="2" fill="currentColor" stroke="none"/>
		<circle cx="16" cy="15" r="2" fill="currentColor" stroke="none"/>
		<line x1="10" y1="6" x2="5.5" y2="13.3"/>
		<line x1="10" y1="6" x2="14.5" y2="13.3"/>
		<line x1="6" y1="15" x2="14" y2="15"/>
	</svg>`,
	mesh: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.2" width="100%" height="100%">
		<line x1="10" y1="3" x2="3.5" y2="8"/>
		<line x1="10" y1="3" x2="16.5" y2="8"/>
		<line x1="10" y1="3" x2="6" y2="16"/>
		<line x1="10" y1="3" x2="14" y2="16"/>
		<line x1="3.5" y1="8" x2="6" y2="16"/>
		<line x1="3.5" y1="8" x2="14" y2="16"/>
		<line x1="16.5" y1="8" x2="14" y2="16"/>
		<line x1="16.5" y1="8" x2="6" y2="16"/>
		<line x1="6" y1="16" x2="14" y2="16"/>
		<circle cx="10" cy="3" r="1.7" fill="currentColor" stroke="none"/>
		<circle cx="3.5" cy="8" r="1.7" fill="currentColor" stroke="none"/>
		<circle cx="16.5" cy="8" r="1.7" fill="currentColor" stroke="none"/>
		<circle cx="6" cy="16" r="1.7" fill="currentColor" stroke="none"/>
		<circle cx="14" cy="16" r="1.7" fill="currentColor" stroke="none"/>
	</svg>`,
	radial: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="100%" height="100%">
		<circle cx="10" cy="10" r="1.5" fill="currentColor" stroke="none"/>
		<circle cx="10" cy="10" r="5"/>
		<circle cx="10" cy="10" r="8.5"/>
	</svg>`,
	timeline: `<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" width="100%" height="100%">
		<line x1="1" y1="5.5" x2="19" y2="5.5"/>
		<line x1="1" y1="10" x2="19" y2="10"/>
		<line x1="1" y1="14.5" x2="19" y2="14.5"/>
		<circle cx="5" cy="5.5" r="2" fill="currentColor" stroke="none"/>
		<circle cx="12" cy="10" r="2" fill="currentColor" stroke="none"/>
		<circle cx="8" cy="14.5" r="2" fill="currentColor" stroke="none"/>
		<circle cx="16" cy="5.5" r="2" fill="currentColor" stroke="none"/>
	</svg>`
};

/**
 * Inline-block wrapper sized for embedding next to text. Used by the tour
 * popover description where icons sit beside each layout's name.
 */
export function layoutIconInlineHtml(id: LayoutMode, sizePx = 14): string {
	return `<span style="display:inline-block;width:${sizePx}px;height:${sizePx}px;vertical-align:-3px;margin-right:6px;opacity:0.85">${LAYOUT_ICON_SVG[id]}</span>`;
}
