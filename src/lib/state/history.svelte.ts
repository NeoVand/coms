/**
 * In-session navigation history.
 *
 * SvelteKit owns the underlying browser history; we just track *where in it
 * we are* so the panel chrome can light up back/forward chevrons only when
 * there's somewhere to go within the app. We don't want to call
 * `history.back()` blindly and bounce the user out to whatever site they
 * were on before they arrived.
 *
 * `enter` resets the counter; forward navigations (`link`/`goto`/`form`)
 * push and truncate any forward stack; `popstate` carries a signed delta
 * that tells us which direction the user moved.
 */

import { afterNavigate } from '$app/navigation';

class NavHistory {
	position: number = $state(0);
	length: number = $state(1);

	canBack: boolean = $derived(this.position > 0);
	canForward: boolean = $derived(this.position < this.length - 1);

	back = () => {
		if (this.canBack) history.back();
	};
	forward = () => {
		if (this.canForward) history.forward();
	};
}

export const navHistory = new NavHistory();

/** Register the `afterNavigate` listener. Call once from a layout/shell. */
export function setupHistoryTracking() {
	afterNavigate((nav) => {
		if (nav.type === 'enter') {
			navHistory.position = 0;
			navHistory.length = 1;
			return;
		}
		if (nav.type === 'popstate') {
			navHistory.position += nav.delta;
			return;
		}
		navHistory.position += 1;
		navHistory.length = navHistory.position + 1;
	});
}
