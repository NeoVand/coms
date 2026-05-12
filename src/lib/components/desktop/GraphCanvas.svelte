<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { buildGraphNodes, buildGraphEdges, buildMeshEdges, getProtocolById, allProtocols, categories } from '$lib/data/index';
	import type { GraphNode } from '$lib/data/types';

	import { createSimulation, warmUpSimulation, syncPositions } from '$lib/engine/simulation';
	import { render, findNodeAtPosition } from '$lib/engine/canvas-renderer';
	import { RenderLoop } from '$lib/engine/render-loop.svelte';
	import { getAppState } from '$lib/state/context';
	import { computeRadialPositions, computeTimelinePositions, computeMeshPositions, TIMELINE_PARAMS } from '$lib/engine/layouts';
	import type { LayoutMode } from '$lib/engine/layouts';
	import { getThemeColors } from '$lib/utils/colors';
	import { navigateToNode, navigateToHub } from '$lib/utils/navigation';

	const appState = getAppState();

	let canvas: HTMLCanvasElement;
	let width = $state(0);
	let height = $state(0);

	const nodes = buildGraphNodes();
	const edges = buildGraphEdges();
	const meshEdges = buildMeshEdges();
	const simulation = createSimulation(nodes, edges);
	const renderLoop = new RenderLoop();

	// Layout transition state — null means no animation in progress
	let layoutTargets: Map<string, { x: number; y: number }> | null = null;
	let layoutTransitionStart: number | null = null;
	let prevLayout: LayoutMode | null = null;
	// Chronological bloom on initial load (separate from layout transitions)
	let bloomActive = false;
	let bloomStart: number | null = null;
	let bloomNodeTargets: Map<string, { x: number; y: number }> | null = null;
	// Per-node birth fraction during the chronological bloom (0..1).
	// Empty after the bloom finishes — renderer treats missing as 1.
	const birthScales = new Map<string, number>();
	// Tracks which nodes have been "spawned" (placed at their starting
	// offset from the parent) during the bloom.
	const bloomSpawned = new Set<string>();
	// Per-node spring velocities for the bloom glide.
	const bloomVelocities = new Map<string, { vx: number; vy: number }>();

	/**
	 * Chronological bloom — every protocol unfurls in the order it was
	 * invented, sprouting from its category like a tendril extending with
	 * a bud opening at the tip.
	 *
	 * It's a tree, so we don't need a live force simulation during the
	 * reveal — that just shakes the existing graph each time a leaf joins.
	 * Targets come from a single pre-warmed force layout (so the final
	 * shape is the natural force-directed one). Each node then *glides*
	 * toward its target with a critically-damped spring: no overshoot, no
	 * neighbour perturbation. The radius grows in step with the spring so
	 * the bud is small near the parent and reaches full size as it lands
	 * at its destination.
	 */
	const BLOOM_TOTAL_MS = 4200;
	const BLOOM_HUB_SOLO_MS = 450;
	const BLOOM_CATEGORY_PRE_OFFSET_MS = 380;
	const BLOOM_BIRTH_FADE_MS = 1500;
	/** Per-id deterministic jitter so siblings within a year don't lock-step. */
	const BLOOM_JITTER_MAX_MS = 220;
	/**
	 * Critically-damped spring (ω₀≈3.4, ζ≈1.0). Slow glide, no overshoot.
	 * Settle time ~5/ω₀ ≈ 1.5s — matched to BLOOM_BIRTH_FADE_MS so the
	 * bud finishes growing right as the stem reaches full length.
	 */
	const BLOOM_SPRING_STIFFNESS = 11.5;
	const BLOOM_SPRING_DAMPING = 6.8;
	/**
	 * Spawn fraction along the parent→target path. 0 = exactly at parent
	 * (causes infinite repulsion when forces are live), 1 = already at
	 * target. A small offset means the bud starts visibly attached to its
	 * parent without overlap.
	 */
	const BLOOM_SPAWN_OFFSET = 0.12;

	function yearToBloomMs(year: number): number {
		const { MIN_YEAR, MAX_YEAR } = TIMELINE_PARAMS;
		const t = (year - MIN_YEAR) / (MAX_YEAR - MIN_YEAR);
		return BLOOM_HUB_SOLO_MS + Math.max(0, Math.min(1, t)) * (BLOOM_TOTAL_MS - BLOOM_HUB_SOLO_MS);
	}

	function bloomJitterForId(id: string): number {
		// FNV-1a-ish hash → stable [0, BLOOM_JITTER_MAX_MS) per id
		let h = 0x811c9dc5;
		for (let i = 0; i < id.length; i++) {
			h ^= id.charCodeAt(i);
			h = Math.imul(h, 0x01000193);
		}
		return ((h >>> 0) % 1000) / 1000 * BLOOM_JITTER_MAX_MS;
	}

	function computeChronologicalDelays(): Map<string, number> {
		const delays = new Map<string, number>();
		delays.set('hub', 0);
		for (const cat of categories) {
			const catProtos = allProtocols.filter((p) => p.categoryId === cat.id);
			if (catProtos.length === 0) continue;
			const minYear = Math.min(...catProtos.map((p) => p.year));
			const baseDelay = yearToBloomMs(minYear);
			delays.set(cat.id, Math.max(120, baseDelay - BLOOM_CATEGORY_PRE_OFFSET_MS));
		}
		for (const proto of allProtocols) {
			delays.set(proto.id, yearToBloomMs(proto.year) + bloomJitterForId(proto.id));
		}
		return delays;
	}

	const chronoDelays = computeChronologicalDelays();

	/**
	 * Spring physics — every node is a little damped harmonic oscillator.
	 * Feels alive because the motion emerges from physics instead of
	 * tracing a canned curve.
	 *
	 * Tuning:
	 *   ω₀ = √(STIFFNESS) ≈ 14.1 rad/s  (response ≈ 0.45s)
	 *   ζ  = DAMPING / (2·√STIFFNESS) ≈ 0.71
	 *
	 * A damping ratio around 0.7 gives one visible overshoot of ~4% then
	 * a soft settle — that's the "cute, alive" feel. Snappier than Apple's
	 * "smooth" default (ζ≈0.825) but tamer than wobbly springs (ζ≈0.5).
	 */
	const SPRING_STIFFNESS = 200;
	const SPRING_DAMPING = 20;

	/**
	 * Each node gets a small deterministic delay before its spring starts,
	 * derived from its id hash. Same id → same delay every time, but
	 * neighbouring nodes have different delays so motion ripples through
	 * the graph instead of moving in lock-step. This is the secret sauce.
	 */
	const SPRING_STAGGER_MAX_MS = 60;

	interface SpringState {
		vx: number;
		vy: number;
		delay: number;
	}
	const springStates = new Map<string, SpringState>();

	function staggerDelayForId(id: string): number {
		// FNV-1a-ish hash → stable [0, SPRING_STAGGER_MAX_MS) per id
		let h = 0x811c9dc5;
		for (let i = 0; i < id.length; i++) {
			h ^= id.charCodeAt(i);
			h = Math.imul(h, 0x01000193);
		}
		return ((h >>> 0) % 1000) / 1000 * SPRING_STAGGER_MAX_MS;
	}

	/**
	 * Capture the current node positions and reset spring velocities to
	 * begin a new transition from rest. Called whenever layoutTargets
	 * changes — the next animation tick will set layoutTransitionStart
	 * and start the springs.
	 */
	function captureLayoutSource() {
		// Preserve any in-flight velocity so toggling layouts mid-transition
		// continues smoothly instead of stopping dead. Stagger is reset
		// either way — the new motion is its own moment.
		for (const node of nodes) {
			const existing = springStates.get(node.id);
			springStates.set(node.id, {
				vx: existing?.vx ?? 0,
				vy: existing?.vy ?? 0,
				delay: staggerDelayForId(node.id)
			});
		}
		layoutTransitionStart = null;
	}

	let isPanning = $state(false);
	let lastMouseX = 0;
	let lastMouseY = 0;
	let panStartX = 0;
	let panStartY = 0;

	function screenToWorld(screenX: number, screenY: number): { x: number; y: number } {
		return {
			x: (screenX - width / 2 - appState.viewport.x) / appState.viewport.scale,
			y: (screenY - height / 2 - appState.viewport.y) / appState.viewport.scale
		};
	}

	/** Nodes visible to the user — hub/category are hidden in mesh mode. */
	function hitNodes(): GraphNode[] {
		return appState.layoutMode === 'mesh' ? nodes.filter((n) => n.type === 'protocol') : nodes;
	}

	/** Collect the non-dimmed nodes for a given selection (mirrors isNodeDimmed in canvas-renderer). */
	function getHighlightedNodes(selected: GraphNode): GraphNode[] {
		if (selected.type === 'hub') {
			return nodes; // fit the entire graph
		}
		if (selected.type === 'category') {
			return nodes.filter(
				(n) => n.id === selected.id || (n.type === 'protocol' && n.categoryId === selected.id)
			);
		}
		// protocol — include self, parent category, and connected protocols
		const proto = getProtocolById(selected.id);
		const connected = new Set(proto?.connections ?? []);
		return nodes.filter(
			(n) =>
				n.id === selected.id ||
				n.id === selected.categoryId ||
				connected.has(n.id)
		);
	}

	// React to ANY selection change (canvas click, book icon, category buttons, etc.)
	let prevSelected: GraphNode | null = null;

	/**
	 * Returns true when *something* is open in the side panel — a graph
	 * node, or any of the standalone reading surfaces (book chapter,
	 * book part TOC, pioneer bio, RFC, outage, frontier entry, registry
	 * index). When any of these are active the graph viewport should
	 * leave room for the panel (same as when the hub is selected); only
	 * the bare-graph zero state (URL `/`) zooms across the full viewport.
	 */
	function isPanelOccupied(): boolean {
		return Boolean(
			appState.selectedNode ||
				appState.activeBookChapter ||
				appState.activeBookPart ||
				appState.activeBookPartToc ||
				appState.activePioneer ||
				appState.activeRfc ||
				appState.activeOutage ||
				appState.activeFrontier ||
				appState.activeRegistryIndex
		);
	}

	$effect(() => {
		const selected = appState.selectedNode;
		if (selected) {
			untrack(() => {
				appState.focusOnSubgraph(getHighlightedNodes(selected), width, height);
			});
		} else if (prevSelected) {
			untrack(() => {
				if (isPanelOccupied()) {
					// Reading surface is open — keep the same panel-offset framing
					// the user just had on the hub so entering The Book / a chapter /
					// a pioneer bio doesn't snap the graph to a different zoom.
					appState.focusOnSubgraph(nodes, width, height);
				} else {
					// Bare-graph zero state — zoom across the full viewport.
					appState.focusOnSubgraph(nodes, width, height, 0);
				}
			});
		}
		prevSelected = selected;
	});

	// React to comparison target changes — focus on just the two compared nodes
	let prevCompareTargetId: string | null = null;

	$effect(() => {
		const compareId = appState.compareTargetId;
		const selected = appState.selectedNode;

		if (compareId && selected) {
			// Focus viewport on the two compared nodes
			untrack(() => {
				const targetNode = nodes.find((n) => n.id === compareId);
				if (targetNode) {
					appState.focusOnSubgraph([selected, targetNode], width, height);
				}
			});
		} else if (prevCompareTargetId && !compareId && selected) {
			// Comparison cleared — refocus on full connected subgraph
			untrack(() => {
				appState.focusOnSubgraph(getHighlightedNodes(selected), width, height);
			});
		}

		prevCompareTargetId = compareId;
	});

	// React to journey changes — focus on all journey protocol nodes
	let prevJourneyId: string | null = null;

	$effect(() => {
		const journey = appState.activeJourney;
		const journeyId = journey?.id ?? null;

		if (journey && journeyId !== prevJourneyId) {
			untrack(() => {
				const journeyNodes = journey.steps
					.map((s) => nodes.find((n) => n.id === s.protocolId))
					.filter((n): n is GraphNode => n !== undefined);
				if (journeyNodes.length > 0) {
					appState.focusOnSubgraph(journeyNodes, width, height);
				}
			});
		} else if (!journey && prevJourneyId) {
			const selected = appState.selectedNode;
			untrack(() => {
				if (selected) {
					appState.focusOnSubgraph(getHighlightedNodes(selected), width, height);
				} else if (isPanelOccupied()) {
					appState.focusOnSubgraph(nodes, width, height);
				} else {
					appState.focusOnSubgraph(nodes, width, height, 0);
				}
			});
		}

		prevJourneyId = journeyId;
	});

	// React to journey step changes — zoom to current step node
	let prevStepIndex = -1;

	$effect(() => {
		const journey = appState.activeJourney;
		const idx = appState.activeJourneyStepIndex;

		if (journey && idx !== prevStepIndex) {
			const step = journey.steps[idx];
			if (step) {
				untrack(() => {
					const stepNode = nodes.find((n) => n.id === step.protocolId);
					if (stepNode) {
						appState.focusOnSubgraph([stepNode], width, height);
					}
				});
			}
		}

		prevStepIndex = idx;
	});

	// React to layout mode changes — animate nodes to new positions
	$effect(() => {
		const mode = appState.layoutMode;
		if (mode === 'force') {
			if (prevLayout !== null && prevLayout !== 'force') {
				// Switching back to force — compute settled positions and lerp there
				if (!prefersReducedMotion.current) {
					// Capture current visible positions as the transition source
					// BEFORE warming up the simulation, since warmUp mutates sim node positions.
					captureLayoutSource();
					warmUpSimulation(simulation);
					const forceTargets = new Map<string, { x: number; y: number }>();
					const simNodes = simulation.nodes();
					for (let i = 0; i < simNodes.length; i++) {
						const sn = simNodes[i];
						forceTargets.set(sn.id, { x: sn.x ?? 0, y: sn.y ?? 0 });
					}
					layoutTargets = forceTargets;
					const targetNodes = nodes.map((n) => {
						const t = forceTargets.get(n.id);
						return t ? { ...n, x: t.x, y: t.y } : n;
					});
					appState.focusOnSubgraph(
						targetNodes,
						width,
						height,
						isPanelOccupied() ? undefined : 0
					);
				} else {
					layoutTargets = null;
					springStates.clear();
				}
			}
		} else {
			simulation.stop();
			untrack(() => {
				const positions =
					mode === 'radial'
						? computeRadialPositions(nodes)
						: mode === 'timeline'
							? computeTimelinePositions(nodes)
							: computeMeshPositions(nodes);
				if (!prefersReducedMotion.current) {
					captureLayoutSource();
				}
				layoutTargets = positions;
				// Zoom to fit the target layout (use target positions, not current)
				// In mesh mode, only consider protocol nodes for the bounding box —
				// hub and categories are parked at origin and don't render.
				const targetNodes = nodes.map((n) => {
					const t = positions.get(n.id);
					return t ? { ...n, x: t.x, y: t.y } : n;
				});
				const focusNodes =
					mode === 'mesh' ? targetNodes.filter((n) => n.type === 'protocol') : targetNodes;
				appState.focusOnSubgraph(
					focusNodes,
					width,
					height,
					isPanelOccupied() ? undefined : 0
				);
			});
		}
		prevLayout = mode;
	});

	function handleMouseMove(e: MouseEvent) {
		if (isPanning) {
			appState.pan(e.clientX - lastMouseX, e.clientY - lastMouseY);
			lastMouseX = e.clientX;
			lastMouseY = e.clientY;
			appState.hoverNode(null);
			return;
		}

		const world = screenToWorld(e.clientX, e.clientY);
		const node = findNodeAtPosition(hitNodes(), world.x, world.y, appState.viewport.scale);
		appState.hoverNode(node);
		canvas.style.cursor = node ? 'pointer' : 'grab';
	}

	function handleMouseLeave() {
		appState.hoverNode(null);
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		const world = screenToWorld(e.clientX, e.clientY);
		const node = findNodeAtPosition(hitNodes(), world.x, world.y, appState.viewport.scale);

		if (!node) {
			isPanning = true;
			lastMouseX = e.clientX;
			lastMouseY = e.clientY;
			panStartX = e.clientX;
			panStartY = e.clientY;
			canvas.style.cursor = 'grabbing';
		}
	}

	/**
	 * "Reset to default" — used by every empty-canvas tap. Dismisses the
	 * guided tour if it's running, then routes back to `/` so the side
	 * panel and any active reading surface (book chapter, RFC, pioneer,
	 * outage, etc.) all clear in one go.
	 */
	function resetToDefault() {
		appState.activeTour?.destroy();
		navigateToHub();
	}

	function handleMouseUp(e: MouseEvent) {
		if (isPanning) {
			isPanning = false;
			canvas.style.cursor = 'grab';
			const dist = Math.hypot(e.clientX - panStartX, e.clientY - panStartY);
			if (dist < 5) {
				resetToDefault();
			}
			return;
		}

		const world = screenToWorld(e.clientX, e.clientY);
		const node = findNodeAtPosition(hitNodes(), world.x, world.y, appState.viewport.scale);

		if (node) {
			navigateToNode(node);
		} else {
			resetToDefault();
		}
	}

	function handleWheel(e: WheelEvent) {
		e.preventDefault();
		const zoomFactor = e.deltaY > 0 ? 0.92 : 1.08;
		appState.zoom(
			appState.viewport.scale * zoomFactor,
			e.clientX - width / 2,
			e.clientY - height / 2
		);
	}

	// Touch support
	let touchStartDist = 0;
	let touchStartScale = 1;
	let touchStartX = 0;
	let touchStartY = 0;

	function handleTouchStart(e: TouchEvent) {
		e.preventDefault();
		if (e.touches.length === 1) {
			isPanning = true;
			lastMouseX = e.touches[0].clientX;
			lastMouseY = e.touches[0].clientY;
			touchStartX = e.touches[0].clientX;
			touchStartY = e.touches[0].clientY;
		} else if (e.touches.length === 2) {
			isPanning = false;
			touchStartDist = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			touchStartScale = appState.viewport.scale;
		}
	}

	function handleTouchMove(e: TouchEvent) {
		e.preventDefault();
		if (e.touches.length === 1 && isPanning) {
			appState.pan(e.touches[0].clientX - lastMouseX, e.touches[0].clientY - lastMouseY);
			lastMouseX = e.touches[0].clientX;
			lastMouseY = e.touches[0].clientY;
		} else if (e.touches.length === 2) {
			const dist = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			const midX = (e.touches[0].clientX + e.touches[1].clientX) / 2 - width / 2;
			const midY = (e.touches[0].clientY + e.touches[1].clientY) / 2 - height / 2;
			appState.zoom(touchStartScale * (dist / touchStartDist), midX, midY);
		}
	}

	function handleTouchEnd(e: TouchEvent) {
		if (e.touches.length === 0) {
			if (isPanning && e.changedTouches.length > 0) {
				const dist = Math.hypot(
					e.changedTouches[0].clientX - touchStartX,
					e.changedTouches[0].clientY - touchStartY
				);
				if (dist < 10) {
					// Tap — select node or reset to default
					const world = screenToWorld(
						e.changedTouches[0].clientX,
						e.changedTouches[0].clientY
					);
					const node = findNodeAtPosition(hitNodes(), world.x, world.y, appState.viewport.scale);
					if (node) {
						navigateToNode(node);
					} else {
						resetToDefault();
					}
				}
			}
			isPanning = false;
		}
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const dpr = window.devicePixelRatio || 1;

		// Expose the live nodes (post-simulation positions) so anything
		// outside the canvas (e.g. inline ProtocolLink hover pans) can
		// read current positions instead of stale static x:0/y:0 values.
		appState.registerLiveNodes(nodes);

		// Warm up to compute settled target positions. With the bloom we
		// then stash those targets, reset visible positions to (0,0), and
		// glide each node into place — but we keep the warmed simulation
		// frozen during the bloom so the existing graph doesn't shake.
		warmUpSimulation(simulation);
		syncPositions(simulation, nodes);

		if (!prefersReducedMotion.current) {
			// Capture every node's settled position as its bloom target.
			bloomNodeTargets = new Map<string, { x: number; y: number }>();
			for (const node of nodes) {
				bloomNodeTargets.set(node.id, { x: node.x, y: node.y });
				if (node.type !== 'hub') {
					// Park off-screen until birth — invisible thanks to
					// birthScales[id] = 0.
					node.x = 0;
					node.y = 0;
					node.vx = 0;
					node.vy = 0;
				}
				birthScales.set(node.id, 0);
				bloomVelocities.set(node.id, { vx: 0, vy: 0 });
			}
			bloomActive = true;
		}

		// Register touch/wheel handlers as non-passive so preventDefault() works
		// (Svelte adds inline handlers as passive by default for touch/wheel)
		canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
		canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
		canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
		canvas.addEventListener('wheel', handleWheel, { passive: false });

		let hasInitialFit = false;

		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			width = entry.contentRect.width;
			height = entry.contentRect.height;
			canvas.width = width * dpr;
			canvas.height = height * dpr;

			// Fit graph to screen on first layout. When the user lands
			// directly on a route that opens the side panel (e.g. /hub,
			// /book/..., /pioneer/..., /p/...), reserve room for it from
			// the very first frame — otherwise the bloom plays in the
			// full viewport and snaps to the panel-offset framing the
			// moment the page's $effect selects something.
			if (!hasInitialFit && width > 0 && height > 0) {
				hasInitialFit = true;
				const initialPanelW = isPanelOccupied() ? undefined : 0;
				if (bloomActive && bloomNodeTargets) {
					// Bloom mode: frame the camera around the eventual
					// settled positions so the viewport stays fixed during
					// the reveal.
					const settled = nodes.map((n) => {
						const t = bloomNodeTargets!.get(n.id);
						return t ? { ...n, x: t.x, y: t.y } : n;
					});
					appState.focusOnSubgraph(settled, width, height, initialPanelW, true);
				} else {
					appState.focusOnSubgraph(nodes, width, height, initialPanelW);
				}
			}
		});
		resizeObserver.observe(canvas.parentElement!);

		renderLoop.start((time, dt) => {
			if (width === 0 || height === 0) return;

			// Spring physics is sub-stepped for stability at high stiffness:
			// each visual frame runs N small physics steps so the integrator
			// doesn't blow up under a long dt (e.g. after a tab returns from
			// background).
			const stepDt = Math.min(dt, 32) / 1000; // seconds, clamped
			const SUBSTEPS = 4;
			const subDt = stepDt / SUBSTEPS;

			// Update node positions based on layout mode
			if (bloomActive && bloomNodeTargets) {
				// Chronological bloom — each node glides from a small offset
				// near its parent toward its pre-computed target. Pure spring
				// physics, no live force interaction: the existing graph
				// stays perfectly still while a new bud unfurls.
				if (bloomStart === null) bloomStart = time;
				const elapsed = time - bloomStart;

				let allSettled = true;

				for (const node of nodes) {
					const delay = chronoDelays.get(node.id) ?? 0;

					// Hub: already at (0,0) — only fades in visually.
					if (node.type === 'hub') {
						const t = Math.min(1, elapsed / BLOOM_BIRTH_FADE_MS);
						birthScales.set(node.id, t);
						if (t < 1) allSettled = false;
						continue;
					}

					if (elapsed < delay) {
						birthScales.set(node.id, 0);
						allSettled = false;
						continue;
					}

					const target = bloomNodeTargets.get(node.id);
					const vel = bloomVelocities.get(node.id);
					if (!target || !vel) continue;

					// First frame past the birth delay — place the bud a
					// short distance along the parent→target line so it's
					// visibly attached but doesn't overlap the parent.
					if (!bloomSpawned.has(node.id)) {
						bloomSpawned.add(node.id);
						const parentId = node.type === 'category' ? 'hub' : node.categoryId;
						const parent = parentId ? nodes.find((n) => n.id === parentId) : undefined;
						const px = parent?.x ?? 0;
						const py = parent?.y ?? 0;
						node.x = px + (target.x - px) * BLOOM_SPAWN_OFFSET;
						node.y = py + (target.y - py) * BLOOM_SPAWN_OFFSET;
						vel.vx = 0;
						vel.vy = 0;
					}

					const birthT = Math.min(1, (elapsed - delay) / BLOOM_BIRTH_FADE_MS);
					birthScales.set(node.id, birthT);

					// Critically-damped spring → smooth glide to target.
					for (let s = 0; s < SUBSTEPS; s++) {
						const ax =
							BLOOM_SPRING_STIFFNESS * (target.x - node.x) - BLOOM_SPRING_DAMPING * vel.vx;
						const ay =
							BLOOM_SPRING_STIFFNESS * (target.y - node.y) - BLOOM_SPRING_DAMPING * vel.vy;
						vel.vx += ax * subDt;
						vel.vy += ay * subDt;
						node.x += vel.vx * subDt;
						node.y += vel.vy * subDt;
					}

					const posErr = Math.abs(target.x - node.x) + Math.abs(target.y - node.y);
					const velMag = Math.abs(vel.vx) + Math.abs(vel.vy);
					if (posErr > 0.5 || velMag > 1.0 || birthT < 1) {
						allSettled = false;
					} else {
						node.x = target.x;
						node.y = target.y;
						vel.vx = 0;
						vel.vy = 0;
					}
				}

				if (allSettled && elapsed > BLOOM_TOTAL_MS) {
					bloomActive = false;
					bloomStart = null;
					bloomNodeTargets = null;
					birthScales.clear();
					bloomSpawned.clear();
					bloomVelocities.clear();
				}
			} else if (layoutTargets) {
				// Layout transition: each node springs toward its target with
				// a small per-id delay so the wave feels alive, not lock-step.
				if (layoutTransitionStart === null) layoutTransitionStart = time;
				const elapsed = time - layoutTransitionStart;

				let allSettled = true;
				for (const node of nodes) {
					const tgt = layoutTargets.get(node.id);
					const spring = springStates.get(node.id);
					if (!tgt || !spring) continue;

					if (elapsed < spring.delay) {
						allSettled = false;
						continue;
					}

					for (let s = 0; s < SUBSTEPS; s++) {
						const ax = SPRING_STIFFNESS * (tgt.x - node.x) - SPRING_DAMPING * spring.vx;
						const ay = SPRING_STIFFNESS * (tgt.y - node.y) - SPRING_DAMPING * spring.vy;
						spring.vx += ax * subDt;
						spring.vy += ay * subDt;
						node.x += spring.vx * subDt;
						node.y += spring.vy * subDt;
					}

					const posErr = Math.abs(tgt.x - node.x) + Math.abs(tgt.y - node.y);
					const velMag = Math.abs(spring.vx) + Math.abs(spring.vy);
					if (posErr > 0.4 || velMag > 1.5) {
						allSettled = false;
					} else {
						node.x = tgt.x;
						node.y = tgt.y;
						spring.vx = 0;
						spring.vy = 0;
					}
				}

				if (allSettled && elapsed > 200) {
					layoutTargets = null;
					layoutTransitionStart = null;
					springStates.clear();
				}
			} else if (appState.layoutMode === 'force') {
				if (!prefersReducedMotion.current) {
					syncPositions(simulation, nodes);
				}
			}

			// Animate viewport toward focus target
			appState.tickViewport();

			// Render
			render(ctx, {
				width,
				height,
				viewport: appState.viewport,
				nodes,
				edges: appState.layoutMode === 'mesh' ? meshEdges : edges,
				hoveredNode: appState.hoveredNode,
				selectedNode: appState.selectedNode,
				compareTargetId: appState.detailViewMode === 'compare' ? appState.compareTargetId : null,
				activeJourney: appState.activeJourney,
				activeJourneyStepIndex: appState.activeJourneyStepIndex,
				searchHighlightIds: appState.searchHighlightIds,
				time,
				dpr,
				layoutMode: appState.layoutMode,
				theme: getThemeColors(appState.theme),
				birthScales: bloomActive ? birthScales : null
			});
		});

		return () => {
			renderLoop.destroy();
			simulation.stop();
			resizeObserver.disconnect();
			canvas.removeEventListener('touchstart', handleTouchStart);
			canvas.removeEventListener('touchmove', handleTouchMove);
			canvas.removeEventListener('touchend', handleTouchEnd);
			canvas.removeEventListener('wheel', handleWheel);
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="absolute inset-0 h-full w-full touch-none"
	style="cursor: grab"
	onmousemove={handleMouseMove}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
></canvas>
