<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { buildGraphNodes, buildGraphEdges, buildMeshEdges, getProtocolById } from '$lib/data/index';
	import type { GraphNode } from '$lib/data/types';

	import { createSimulation, warmUpSimulation, syncPositions } from '$lib/engine/simulation';
	import { render, findNodeAtPosition } from '$lib/engine/canvas-renderer';
	import { RenderLoop } from '$lib/engine/render-loop.svelte';
	import { getAppState } from '$lib/state/context';
	import { computeRadialPositions, computeTimelinePositions, computeMeshPositions } from '$lib/engine/layouts';
	import type { LayoutMode } from '$lib/engine/layouts';
	import { getThemeColors } from '$lib/utils/colors';

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
	// Bloom animation on initial load (separate from layout transitions)
	let bloomTargets: Map<string, { x: number; y: number }> | null = null;

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

	$effect(() => {
		const selected = appState.selectedNode;
		if (selected) {
			untrack(() => {
				appState.focusOnSubgraph(getHighlightedNodes(selected), width, height);
			});
		} else if (prevSelected) {
			// Was focused, now deselected — zoom out to fit all nodes (no panel offset)
			untrack(() => {
				appState.focusOnSubgraph(nodes, width, height, 0);
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
					appState.focusOnSubgraph(targetNodes, width, height, 0);
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
				appState.focusOnSubgraph(focusNodes, width, height, 0);
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

	function handleMouseUp(e: MouseEvent) {
		if (isPanning) {
			isPanning = false;
			canvas.style.cursor = 'grab';
			const dist = Math.hypot(e.clientX - panStartX, e.clientY - panStartY);
			if (dist < 5) {
				appState.clearSelection();
			}
			return;
		}

		const world = screenToWorld(e.clientX, e.clientY);
		const node = findNodeAtPosition(hitNodes(), world.x, world.y, appState.viewport.scale);

		if (node) {
			appState.selectNode(node);
		} else {
			appState.clearSelection();
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
					// Tap — select node or clear selection
					const world = screenToWorld(
						e.changedTouches[0].clientX,
						e.changedTouches[0].clientY
					);
					const node = findNodeAtPosition(hitNodes(), world.x, world.y, appState.viewport.scale);
					if (node) {
						appState.selectNode(node);
					} else {
						appState.clearSelection();
					}
				}
			}
			isPanning = false;
		}
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const dpr = window.devicePixelRatio || 1;

		// Warm up to compute settled positions
		warmUpSimulation(simulation);
		syncPositions(simulation, nodes);

		if (!prefersReducedMotion.current) {
			// Bloom animation: store settled positions as targets, reset to center, then spring out.
			bloomTargets = new Map<string, { x: number; y: number }>();
			for (const node of nodes) {
				bloomTargets.set(node.id, { x: node.x, y: node.y });
				if (node.type !== 'hub') {
					node.x = 0;
					node.y = 0;
				}
			}
			// Initialise spring states so the tick loop can drive them.
			captureLayoutSource();
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

			// Fit graph to screen on first layout
			if (!hasInitialFit && width > 0 && height > 0) {
				hasInitialFit = true;
				if (bloomTargets) {
					// Bloom mode: set viewport instantly using settled positions for bounding box
					const targetNodes = nodes.map((n) => {
						const t = bloomTargets!.get(n.id);
						return t ? { ...n, x: t.x, y: t.y } : n;
					});
					appState.focusOnSubgraph(targetNodes, width, height, 0, true);
				} else {
					appState.focusOnSubgraph(nodes, width, height, 0);
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
			if (bloomTargets) {
				// Initial bloom uses the same springs so the reveal feels
				// continuous with later transitions.
				if (layoutTransitionStart === null) {
					layoutTransitionStart = time;
				}
				const elapsed = time - layoutTransitionStart;

				let allSettled = true;
				for (const node of nodes) {
					const tgt = bloomTargets.get(node.id);
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
					bloomTargets = null;
					layoutTransitionStart = null;
					springStates.clear();
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
				theme: getThemeColors(appState.theme)
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
