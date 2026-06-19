import { expect, test, type Page } from '@playwright/test';

/**
 * End-to-end smoke + critical-path coverage. These run against the production
 * build (`npm run build && npm run preview`), so the dev-only `window.__dev`
 * helper is unavailable — every test drives the app through real URLs and
 * clicks, the same way a user (or a crawler) would.
 */

/** Collect console errors so a test can assert the page stayed clean. */
function trackConsoleErrors(page: Page): string[] {
	const errors: string[] = [];
	page.on('console', (msg) => {
		if (msg.type() === 'error') errors.push(msg.text());
	});
	page.on('pageerror', (err) => errors.push(String(err)));
	return errors;
}

test.describe('home / graph', () => {
	test('loads the graph canvas with the right title and no console errors', async ({ page }) => {
		const errors = trackConsoleErrors(page);
		await page.goto('/');
		await expect(page).toHaveTitle(/Protocol Lab/);
		const canvas = page.locator('canvas').first();
		await expect(canvas).toBeVisible();
		const box = await canvas.boundingBox();
		expect(box?.width ?? 0).toBeGreaterThan(100);
		expect(box?.height ?? 0).toBeGreaterThan(100);
		expect(errors, errors.join('\n')).toEqual([]);
	});
});

test.describe('protocol detail', () => {
	test('navigating to /p/tcp opens the TCP panel with overview prose', async ({ page }) => {
		await page.goto('/p/tcp');
		await expect(page).toHaveTitle(/TCP/);
		await expect(page.getByRole('heading', { name: 'TCP', exact: true })).toBeVisible();
		// Overview mentions TCP somewhere in the prose body.
		await expect(
			page.getByText(/Transmission Control Protocol|backbone of the internet/i).first()
		).toBeVisible();
	});

	test('the Simulate tab reveals the step-driven simulator', async ({ page }) => {
		await page.goto('/p/tcp');
		await page
			.getByRole('button', { name: /Simulate/i })
			.first()
			.click();
		await expect(page.locator('[data-tour="simulator-view"]')).toBeVisible();
		// A playback control should be present (Play / Step).
		await expect(page.getByRole('button', { name: /Play|Step/i }).first()).toBeVisible();
	});

	test('code examples highlight after the lazy highlight.js loads', async ({ page }) => {
		// http1 ships a code example; highlight.js is dynamically imported on mount.
		await page.goto('/p/http1');
		const code = page.locator('[data-tour="code-example"] code.hljs').first();
		await expect(code).toBeVisible();
		// Once hljs resolves it wraps tokens in <span class="hljs-…">.
		await expect(code.locator('span[class^="hljs-"]').first()).toBeVisible();
	});

	test('404s on an unknown protocol id', async ({ page }) => {
		const res = await page.goto('/p/definitely-not-a-protocol');
		// adapter-static serves the SvelteKit error page; status may be 200 for the
		// fallback shell, so assert on the rendered error text instead.
		await expect(page.getByText(/not found|404|Unknown protocol/i).first()).toBeVisible();
		expect(res).toBeTruthy();
	});
});

test.describe('category & subcategory', () => {
	test('/c/transport renders the Transport category', async ({ page }) => {
		await page.goto('/c/transport');
		await expect(page.getByText(/Transport/i).first()).toBeVisible();
	});

	test('/s/link-layer renders the subcategory guide', async ({ page }) => {
		await page.goto('/s/link-layer');
		await expect(page.locator('h2').first()).toBeVisible();
	});
});

test.describe('search', () => {
	test('typing a query surfaces matching results', async ({ page }) => {
		await page.goto('/');
		// Open search (button labelled for screen readers) then type.
		const searchTrigger = page.getByRole('button', { name: /search/i }).first();
		if (await searchTrigger.isVisible().catch(() => false)) {
			await searchTrigger.click();
		}
		const input = page.getByRole('textbox').first();
		await input.fill('TCP');
		await expect(page.getByRole('option').first()).toBeVisible();
	});
});

test.describe('registry & book pages', () => {
	const pages: [string, RegExp][] = [
		['/rfcs', /RFC/i],
		['/pioneers', /Pioneers/i],
		['/outages', /Outage/i],
		['/glossary', /Glossary/i],
		['/frontier', /Frontier/i],
		['/book/foundations', /.+/],
		['/journey/url-bar', /.+/]
	];

	for (const [path, titleRe] of pages) {
		test(`${path} prerenders and shows content`, async ({ page }) => {
			const errors = trackConsoleErrors(page);
			await page.goto(path);
			await expect(page).toHaveTitle(titleRe);
			// Registry "pages" render in the side panel; some lead with h3 sub-heads
			// (glossary) rather than an h1/h2, so accept any structural heading.
			await expect(page.locator('h1, h2, h3').first()).toBeVisible();
			expect(errors, errors.join('\n')).toEqual([]);
		});
	}
});

test.describe('accessibility', () => {
	test('reduced-motion users still get the detail panel content', async ({ page }) => {
		await page.emulateMedia({ reducedMotion: 'reduce' });
		await page.goto('/p/tcp');
		// The slide-in animation is collapsed to ~instant; content must still render.
		await expect(page.getByRole('heading', { name: 'TCP', exact: true })).toBeVisible();
	});
});

test.describe('mobile', () => {
	test.use({ viewport: { width: 375, height: 812 } });

	test('protocol detail renders as a bottom sheet on a phone viewport', async ({ page }) => {
		await page.goto('/p/tcp');
		await expect(page.getByRole('heading', { name: 'TCP', exact: true })).toBeVisible();
		// No horizontal overflow on a narrow viewport.
		const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
		expect(scrollWidth).toBeLessThanOrEqual(375 + 1);
	});
});
