<script lang="ts">
	import { onMount, untrack } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { buildGraphNodes, buildGraphEdges, getProtocolById } from '$lib/data/index';
	import type { GraphNode } from '$lib/data/types';

	import { createSimulation, warmUpSimulation, syncPositions } from '$lib/engine/simulation';
	import { render, findNodeAtPosition } from '$lib/engine/canvas-renderer';
	import { RenderLoop } from '$lib/engine/render-loop.svelte';
	import { getAppState } from '$lib/state/context';
	import { computeRadialPositions, computeTimelinePositions } from '$lib/engine/layouts';
	import type { LayoutMode } from '$lib/engine/layouts';

	const appState = getAppState();

	let canvas: HTMLCanvasElement;
	let width = $state(0);
	let height = $state(0);

	const nodes = buildGraphNodes();
	const edges = buildGraphEdges();
	const simulation = createSimulation(nodes, edges);
	const renderLoop = new RenderLoop();

	// Layout transition state — null means no animation in progress
	let layoutTargets: Map<string, { x: number; y: number }> | null = null;
	let prevLayout: LayoutMode | null = null;

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

	// React to layout mode changes — animate nodes to new positions
	$effect(() => {
		const mode = appState.layoutMode;
		if (mode === 'force') {
			if (prevLayout !== null && prevLayout !== 'force') {
				// Switching back to force — restart simulation
				layoutTargets = null;
				if (!prefersReducedMotion.current) {
					simulation.alpha(0.5).restart();
				}
			}
		} else {
			simulation.stop();
			untrack(() => {
				const positions =
					mode === 'radial' ? computeRadialPositions(nodes) : computeTimelinePositions(nodes);
				layoutTargets = positions;
				// Zoom to fit the target layout (use target positions, not current)
				const targetNodes = nodes.map((n) => {
					const t = positions.get(n.id);
					return t ? { ...n, x: t.x, y: t.y } : n;
				});
				appState.focusOnSubgraph(targetNodes, width, height, 0);
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
		const node = findNodeAtPosition(nodes, world.x, world.y, appState.viewport.scale);
		appState.hoverNode(node);
		canvas.style.cursor = node ? 'pointer' : 'grab';
	}

	function handleMouseLeave() {
		appState.hoverNode(null);
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0) return;
		const world = screenToWorld(e.clientX, e.clientY);
		const node = findNodeAtPosition(nodes, world.x, world.y, appState.viewport.scale);

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
		const node = findNodeAtPosition(nodes, world.x, world.y, appState.viewport.scale);

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

	function handleTouchStart(e: TouchEvent) {
		if (e.touches.length === 1) {
			isPanning = true;
			lastMouseX = e.touches[0].clientX;
			lastMouseY = e.touches[0].clientY;
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
			isPanning = false;
		}
	}

	onMount(() => {
		const ctx = canvas.getContext('2d')!;
		const dpr = window.devicePixelRatio || 1;

		// Warm up simulation
		warmUpSimulation(simulation);
		syncPositions(simulation, nodes);

		// If reduced motion, keep simulation stopped
		if (!prefersReducedMotion.current) {
			simulation.alpha(0.3).restart();
		}

		const resizeObserver = new ResizeObserver((entries) => {
			const entry = entries[0];
			width = entry.contentRect.width;
			height = entry.contentRect.height;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
		});
		resizeObserver.observe(canvas.parentElement!);

		renderLoop.start((time, _dt) => {
			if (width === 0 || height === 0) return;

			// Update node positions based on layout mode
			if (appState.layoutMode === 'force') {
				if (!prefersReducedMotion.current) {
					syncPositions(simulation, nodes);
				}
			} else if (layoutTargets) {
				// Lerp nodes toward their layout targets
				const LERP = 0.08;
				let allSettled = true;
				for (const node of nodes) {
					const t = layoutTargets.get(node.id);
					if (!t) continue;
					const dx = t.x - node.x;
					const dy = t.y - node.y;
					if (Math.abs(dx) + Math.abs(dy) > 0.3) {
						allSettled = false;
						node.x += dx * LERP;
						node.y += dy * LERP;
					} else {
						node.x = t.x;
						node.y = t.y;
					}
				}
				if (allSettled) layoutTargets = null;
			}

			// Animate viewport toward focus target
			appState.tickViewport();

			// Render
			render(ctx, {
				width,
				height,
				viewport: appState.viewport,
				nodes,
				edges,
				hoveredNode: appState.hoveredNode,
				selectedNode: appState.selectedNode,
				compareTargetId: appState.detailViewMode === 'compare' ? appState.compareTargetId : null,
				time,
				dpr,
				layoutMode: appState.layoutMode
			});
		});

		return () => {
			renderLoop.destroy();
			simulation.stop();
			resizeObserver.disconnect();
		};
	});
</script>

<canvas
	bind:this={canvas}
	class="absolute inset-0 h-full w-full"
	style="cursor: grab"
	onmousemove={handleMouseMove}
	onmousedown={handleMouseDown}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	onwheel={handleWheel}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
></canvas>
