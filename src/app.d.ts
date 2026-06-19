// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	interface Window {
		/** Dev-only navigation/testing helper, attached in dev mode (see AppShell). */
		__dev?: Record<string, unknown>;
		/** Dev-only handle to the active guided-tour driver instance. */
		__tourDriver?: unknown;
	}
}

export {};
