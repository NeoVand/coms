/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		// Pure-logic unit tests (parsers, layout/sim math, utils, data validation).
		// Component/DOM behavior is covered by the Playwright e2e suite instead.
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'node'
	}
});
