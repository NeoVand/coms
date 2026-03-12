<script lang="ts">
	import { onMount } from 'svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { buildGraphNodes, buildGraphEdges, getProtocolById } from '$lib/data/index';

	import { createSimulation, warmUpSimulation, syncPositions } from '$lib/engine/simulation';
	import { render, findNodeAtPosition } from '$lib/engine/canvas-renderer';
	import { RenderLoop } from '$lib/engine/render-loop.svelte';
	import { ParticleSystem } from '$lib/engine/particle-system';
	import { runMicroInteraction } from '$lib/engine/micro-interactions/index';
	import { getAppState } from '$lib/state/context';

	const appState = getAppState();

	let canvas: HTMLCanvasElement;
	let width = $state(0);
	let height = $state(0);

	const nodes = buildGraphNodes();
	const edges = buildGraphEdges();
	const simulation = createSimulation(nodes, edges);
	const renderLoop = new RenderLoop();
	const particles = new ParticleSystem();

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

		renderLoop.start((time, dt) => {
			if (width === 0 || height === 0) return;

			// Tick simulation
			if (!prefersReducedMotion.current) {
				syncPositions(simulation, nodes);
			}

			// Update particles and micro-interactions
			if (!prefersReducedMotion.current) {
				particles.update();

				// Run micro-interactions for selected node
				if (appState.selectedNode) {
					const selectedProto = appState.selectedNode;
					const parentNode = selectedProto.categoryId
						? nodes.find((n) => n.id === selectedProto.categoryId)
						: nodes.find((n) => n.id === 'hub');

					const protocolData = getProtocolById(selectedProto.id);

					if (protocolData && parentNode) {
						runMicroInteraction(protocolData.microInteraction, {
							node: selectedProto,
							parentNode,
							particles,
							time,
							dt,
							ctx
						});
					}
				}
			}

			// Render
			render(ctx, {
				width,
				height,
				viewport: appState.viewport,
				nodes,
				edges,
				hoveredNode: appState.hoveredNode,
				selectedNode: appState.selectedNode,
				time,
				dpr
			});

			// Draw particles on top
			if (!prefersReducedMotion.current) {
				ctx.save();
				ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
				ctx.translate(width / 2 + appState.viewport.x, height / 2 + appState.viewport.y);
				ctx.scale(appState.viewport.scale, appState.viewport.scale);
				particles.draw(ctx);
				ctx.restore();
			}
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
	onwheel={handleWheel}
	ontouchstart={handleTouchStart}
	ontouchmove={handleTouchMove}
	ontouchend={handleTouchEnd}
></canvas>
