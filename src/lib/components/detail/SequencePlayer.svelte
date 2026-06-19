<script lang="ts">
	import { onMount } from 'svelte';
	import { diagramDefinitions } from '$lib/data/diagram-definitions';
	import { buildThemedDefinition, styleCrossArrows } from '$lib/utils/mermaid-helpers';
	import { getAppState } from '$lib/state/context';
	import {
		parseSequenceSteps,
		type SequenceStep,
		type VisibleStep
	} from '$lib/utils/sequence-parser';
	import DiagramCaption from './DiagramCaption.svelte';

	export interface InlineSequence {
		definition: string;
		caption: string;
		steps?: Record<number, string>;
	}

	let {
		protocolId,
		inline,
		color,
		expanded = false
	}: {
		/** Lookup a diagram by protocol id from the global registry. Mutually
		 *  exclusive with `inline` — pass exactly one of the two. */
		protocolId?: string;
		/** Provide the diagram inline (used by subcategory guides where the
		 *  diagram doesn't belong to a single protocol). */
		inline?: InlineSequence;
		color: string;
		expanded?: boolean;
	} = $props();

	const appState = getAppState();
	let containerEl: HTMLDivElement;
	let mermaidApi: typeof import('mermaid').default | null = $state(null);
	let renderCounter = 0;

	type BoundStep = {
		source: VisibleStep;
		els: SVGElement[];
		primary: SVGElement;
		y: number;
	};

	let bound: BoundStep[] = $state([]);
	let cursor = $state(0);
	let playing = $state(false);
	let playToken = 0;
	let autoStarted = $state(false);
	let intersectionObserver: IntersectionObserver | null = null;

	const total = $derived(bound.length);
	const definition = $derived(inline ?? (protocolId ? diagramDefinitions[protocolId] : undefined));
	const overallCaption = $derived(definition?.caption ?? '');
	const diagramKey = $derived(protocolId ?? 'inline');

	onMount(async () => {
		const mod = await import('mermaid');
		mod.default.initialize({
			startOnLoad: false,
			theme: 'dark',
			securityLevel: 'loose',
			fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
			sequence: {
				actorMargin: 50,
				messageMargin: 28,
				mirrorActors: false,
				bottomMarginAdj: 10,
				useMaxWidth: true,
				actorFontSize: 13,
				messageFontSize: 12,
				noteFontSize: 12,
				boxMargin: 6,
				width: 90,
				height: 36,
				noteMargin: 8
			}
		});
		mermaidApi = mod.default;
	});

	$effect(() => {
		if (!mermaidApi || !definition || !containerEl) return;

		const theme = appState.theme;
		const fullDef = buildThemedDefinition(definition.definition, color, expanded, theme);
		const id = `seq-${diagramKey}-${expanded ? 'exp' : 'inl'}-${++renderCounter}`;

		// Cancel any in-flight loop and reset state for the new diagram.
		playToken++;
		playing = false;
		autoStarted = false;
		cursor = 0;

		mermaidApi
			.render(id, fullDef)
			.then(({ svg }) => {
				// Mermaid emits an SVG string; inject it into our empty bind:this
				// container, which Svelte does not otherwise render into.
				// eslint-disable-next-line svelte/no-dom-manipulating
				containerEl.innerHTML = svg;
				styleCrossArrows(containerEl);
				bindStepsToDom();
				applyBaseline();
				if (bound.length > 0) {
					highlight(0, false);
				}
			})
			.catch((err) => {
				console.error(`SequencePlayer render error [${diagramKey}]:`, err);
				// eslint-disable-next-line svelte/no-dom-manipulating
				containerEl.innerHTML =
					'<p class="text-xs text-t-muted py-4 text-center">Diagram unavailable</p>';
				bound = [];
			});
	});

	// Auto-start the loop the first time the diagram scrolls into view.
	$effect(() => {
		if (!containerEl || bound.length === 0) return;
		intersectionObserver?.disconnect();
		intersectionObserver = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting && entry.intersectionRatio >= 0.25 && !autoStarted && !playing) {
						autoStarted = true;
						setTimeout(() => {
							if (!playing) play();
						}, 700);
					}
				}
			},
			{ threshold: [0.25] }
		);
		intersectionObserver.observe(containerEl);
		return () => {
			intersectionObserver?.disconnect();
			intersectionObserver = null;
		};
	});

	function bindStepsToDom() {
		const svg = containerEl.querySelector('svg');
		if (!svg || !definition) {
			bound = [];
			return;
		}

		const sourceSteps = parseSequenceSteps(definition.definition);
		const visibleSrc = sourceSteps.filter(
			(s): s is VisibleStep => s.kind === 'note' || s.kind === 'message'
		);

		const noteRects = [...svg.querySelectorAll<SVGRectElement>('rect.note')].sort(
			(a, b) => yOf(a) - yOf(b)
		);
		const noteTexts = [...svg.querySelectorAll<SVGTextElement>('text.noteText')].sort(
			(a, b) => yOf(a) - yOf(b)
		);
		const msgLines = [
			...svg.querySelectorAll<SVGGraphicsElement>('.messageLine0, .messageLine1')
		].sort((a, b) => yOf(a) - yOf(b));
		const msgTexts = [...svg.querySelectorAll<SVGTextElement>('text.messageText')].sort(
			(a, b) => yOf(a) - yOf(b)
		);

		let noteI = 0;
		let msgI = 0;
		const next: BoundStep[] = [];

		for (const step of visibleSrc) {
			if (step.kind === 'note') {
				const rect = noteRects[noteI];
				const txt = noteTexts[noteI];
				noteI++;
				if (!rect) continue;
				next.push({
					source: step,
					els: [rect, ...(txt ? [txt] : [])],
					primary: rect,
					y: yOf(rect)
				});
			} else {
				const line = msgLines[msgI];
				const txt = msgTexts[msgI];
				msgI++;
				if (!line) continue;
				next.push({
					source: step,
					els: [line, ...(txt ? [txt] : [])],
					primary: line,
					y: yOf(line)
				});
			}
		}

		next.sort((a, b) => a.y - b.y);
		bound = next;
	}

	function yOf(el: SVGGraphicsElement): number {
		const yAttr = el.getAttribute('y') ?? el.getAttribute('y1') ?? el.getAttribute('y2');
		if (yAttr !== null) {
			const n = parseFloat(yAttr);
			if (!Number.isNaN(n)) return n;
		}
		try {
			return el.getBBox().y;
		} catch {
			return 0;
		}
	}

	const BASELINE_OPACITY = 0.28;
	const HIGHLIGHT_DUR = 380; // ms

	function applyBaseline() {
		// Dim every step to baseline; lifelines, actors and arrowheads stay full.
		for (const step of bound) {
			for (const el of step.els) {
				el.style.transition = 'none';
				el.style.opacity = String(BASELINE_OPACITY);
				el.style.filter = '';
			}
		}
	}

	function dim(step: BoundStep) {
		for (const el of step.els) {
			el.style.transition = `opacity ${HIGHLIGHT_DUR}ms ease-out, filter ${HIGHLIGHT_DUR}ms ease-out`;
			el.style.opacity = String(BASELINE_OPACITY);
			el.style.filter = 'none';
		}
	}

	function light(step: BoundStep) {
		for (const el of step.els) {
			el.style.transition = `opacity ${HIGHLIGHT_DUR}ms ease-out, filter ${HIGHLIGHT_DUR}ms ease-out`;
			el.style.opacity = '1';
			// Glow on the geometry (line/path/rect), not on text — text glows look fuzzy.
			if (el.tagName === 'line' || el.tagName === 'path' || el.tagName === 'rect') {
				el.style.filter = `drop-shadow(0 0 6px ${color}b8)`;
			}
		}
	}

	function highlight(target: number, animate = true) {
		const clamped = Math.max(0, Math.min(bound.length - 1, target));
		const prev = cursor;
		if (clamped === prev && animate) {
			// Re-light current (used on play() resuming after pause).
			light(bound[clamped]);
			return;
		}
		if (prev >= 0 && prev < bound.length) dim(bound[prev]);
		cursor = clamped;
		if (animate) {
			light(bound[clamped]);
		} else {
			// Initial paint — skip transition.
			const step = bound[clamped];
			for (const el of step.els) {
				el.style.transition = 'none';
				el.style.opacity = '1';
				if (el.tagName === 'line' || el.tagName === 'path' || el.tagName === 'rect') {
					el.style.filter = `drop-shadow(0 0 6px ${color}b8)`;
				}
			}
		}
	}

	function pauseDurationMs(step: BoundStep | undefined): number {
		if (!step) return 1500;
		const text = describe(step.source);
		// Reading time roughly proportional to caption length, with bounds.
		return Math.min(3200, Math.max(1300, 900 + text.length * 26));
	}

	async function play() {
		playing = true;
		const myToken = ++playToken;
		// Make sure the current step is lit (e.g., after pause).
		light(bound[cursor]);
		while (playing && playToken === myToken) {
			const step = bound[cursor];
			await new Promise((r) => setTimeout(r, pauseDurationMs(step)));
			if (!playing || playToken !== myToken) break;
			const next = (cursor + 1) % bound.length;
			highlight(next, true);
		}
	}

	function pause() {
		playing = false;
		playToken++;
	}

	function next() {
		pause();
		const target = (cursor + 1) % bound.length;
		highlight(target, true);
	}

	function prev() {
		pause();
		const target = (cursor - 1 + bound.length) % bound.length;
		highlight(target, true);
	}

	function restart() {
		pause();
		highlight(0, true);
	}

	function describe(s: SequenceStep | undefined): string {
		if (!s) return '';
		if (s.kind === 'note') return s.text;
		if (s.kind === 'message') return s.text;
		return '';
	}

	function captionForIndex(i: number): string {
		if (i < 0 || i >= bound.length) return overallCaption;
		const stepCaptions = definition?.steps;
		if (stepCaptions && stepCaptions[i]) return stepCaptions[i];
		const s = bound[i].source;
		if (s.kind === 'note') return `**Note:** ${s.text}`;
		return `**${s.from} → ${s.to}:** ${s.text}`;
	}

	// Stack all per-step captions in a grid cell so the cell sizes to the tallest.
	const allCaptions = $derived.by(() => {
		const list: string[] = [];
		for (let i = 0; i < bound.length; i++) {
			list.push(captionForIndex(i));
		}
		return list;
	});
</script>

<div
	class="sequence-player flex flex-col"
	class:expanded
	class:gap-4={expanded}
	class:gap-3={!expanded}
>
	<!-- Player controls + caption — sits above the diagram, not sticky. -->
	<div
		class="player-bar flex flex-col rounded-xl border border-s-border bg-s-glass"
		class:gap-3={expanded}
		class:gap-2={!expanded}
		class:p-4={expanded}
		class:p-3={!expanded}
	>
		<div class="flex items-center" class:gap-3={expanded} class:gap-2={!expanded}>
			<button
				class="player-btn"
				onclick={prev}
				disabled={total === 0}
				aria-label="Previous step"
				title="Previous"
			>
				<svg
					viewBox="0 0 24 24"
					class="player-icon"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>

			{#if playing}
				<button
					class="player-btn player-btn-primary"
					onclick={pause}
					aria-label="Pause"
					title="Pause"
					style="--c: {color};"
				>
					<svg viewBox="0 0 24 24" class="player-icon" fill="currentColor">
						<rect x="6" y="5" width="4" height="14" rx="1"></rect>
						<rect x="14" y="5" width="4" height="14" rx="1"></rect>
					</svg>
				</button>
			{:else}
				<button
					class="player-btn player-btn-primary"
					onclick={play}
					aria-label="Play"
					title="Play"
					disabled={total === 0}
					style="--c: {color};"
				>
					<svg viewBox="0 0 24 24" class="player-icon" fill="currentColor">
						<polygon points="6 4 20 12 6 20 6 4"></polygon>
					</svg>
				</button>
			{/if}

			<button
				class="player-btn"
				onclick={next}
				disabled={total === 0}
				aria-label="Next step"
				title="Next"
			>
				<svg
					viewBox="0 0 24 24"
					class="player-icon"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>

			<button
				class="player-btn"
				onclick={restart}
				aria-label="Restart"
				title="Restart from beginning"
				disabled={total === 0}
			>
				<svg
					viewBox="0 0 24 24"
					class="player-icon"
					fill="none"
					stroke="currentColor"
					stroke-width="2.2"
					stroke-linecap="round"
					stroke-linejoin="round"
				>
					<polyline points="1 4 1 10 7 10"></polyline>
					<path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
				</svg>
			</button>

			<div class="counter ml-1 text-t-muted tabular-nums">
				{cursor + 1} / {total || '—'}
			</div>

			<div class="ml-auto flex-1">
				<div class="progress-track">
					<div
						class="progress-fill"
						style="width: {total > 0 ? ((cursor + 1) / total) * 100 : 0}%; background: {color};"
					></div>
				</div>
			</div>
		</div>

		<div class="caption-stack" aria-live="polite">
			{#each allCaptions as cap, i (i)}
				<div class="cap-slot" class:visible={i === cursor} aria-hidden={i !== cursor}>
					<DiagramCaption caption={cap} {color} size={expanded ? 'lg' : 'sm'} align="left" />
				</div>
			{/each}
		</div>
	</div>

	<!-- Diagram canvas — fully visible, dimmed at baseline; active step is lit. -->
	<div
		bind:this={containerEl}
		class="mermaid-container w-full"
		role="img"
		aria-label="Sequence diagram for {diagramKey}"
	>
		<div class="flex h-40 items-center justify-center">
			<span class="text-xs text-t-muted">Loading diagram...</span>
		</div>
	</div>
</div>

<style>
	.player-bar {
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
	}

	.mermaid-container {
		overflow: hidden;
	}

	.mermaid-container :global(svg) {
		display: block;
		margin-left: auto;
		margin-right: auto;
		max-width: 100%;
		height: auto;
		background-color: transparent !important;
	}

	.mermaid-container :global(.messageText) {
		font-size: 12px !important;
		fill: var(--theme-text-secondary) !important;
	}

	.mermaid-container :global(.actor) {
		rx: 6;
	}

	.mermaid-container :global(.note) {
		rx: 3;
		fill-opacity: 0.6;
		stroke-opacity: 0.3;
		stroke-width: 1;
	}

	.mermaid-container :global(.noteText) {
		font-size: 12px !important;
	}

	.mermaid-container :global(.loopText tspan) {
		fill: var(--theme-text-secondary) !important;
		font-size: 11px !important;
	}

	.mermaid-container :global(.cross-arrow) {
		stroke: #ef4444 !important;
		opacity: 0.8;
	}

	.player-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		border-radius: 8px;
		color: var(--theme-text-secondary);
		background: transparent;
		border: 1px solid transparent;
		transition:
			background-color 0.15s ease,
			color 0.15s ease,
			border-color 0.15s ease,
			transform 0.1s ease;
		cursor: pointer;
	}

	.player-icon {
		width: 14px;
		height: 14px;
	}

	.counter {
		font-size: 11px;
	}

	/* Expanded mode — bigger touch targets and bigger icons for the modal view. */
	.sequence-player.expanded .player-btn {
		width: 38px;
		height: 38px;
		border-radius: 10px;
	}

	.sequence-player.expanded .player-icon {
		width: 18px;
		height: 18px;
	}

	.sequence-player.expanded .counter {
		font-size: 13px;
	}

	.sequence-player.expanded .progress-track {
		height: 4px;
	}

	.player-btn:hover:not(:disabled) {
		background: var(--theme-glass-bg-hover);
		color: var(--theme-text-primary);
	}

	.player-btn:active:not(:disabled) {
		transform: scale(0.94);
	}

	.player-btn:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.player-btn-primary {
		background: color-mix(in srgb, var(--c) 16%, transparent);
		border-color: color-mix(in srgb, var(--c) 30%, transparent);
		color: var(--c);
	}

	.player-btn-primary:hover:not(:disabled) {
		background: color-mix(in srgb, var(--c) 24%, transparent);
		color: var(--c);
	}

	.progress-track {
		width: 100%;
		height: 3px;
		border-radius: 2px;
		background: var(--theme-glass-bg-hover);
		overflow: hidden;
	}

	.progress-fill {
		height: 100%;
		border-radius: 2px;
		transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		opacity: 0.85;
	}

	/*
	 * Stack all captions in a single grid cell so the cell sizes to the tallest
	 * caption. Active one is opaque; others are visibility-hidden but still take
	 * up layout — that's what locks the height across step changes.
	 */
	.caption-stack {
		display: grid;
		grid-template-columns: 1fr;
	}

	.cap-slot {
		grid-row: 1;
		grid-column: 1;
		opacity: 0;
		visibility: hidden;
		transform: translateY(3px);
		transition:
			opacity 0.32s ease-out,
			transform 0.32s ease-out,
			visibility 0s linear 0.32s;
	}

	.cap-slot.visible {
		opacity: 1;
		visibility: visible;
		transform: translateY(0);
		transition:
			opacity 0.32s ease-out,
			transform 0.32s ease-out,
			visibility 0s linear 0s;
	}
</style>
