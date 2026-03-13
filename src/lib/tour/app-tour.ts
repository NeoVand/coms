import type { AppState } from '$lib/state/app-state.svelte';
import type { GraphNode } from '$lib/data/types';

function scrollTourElement(selector: string) {
	const el = document.querySelector(selector);
	if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

export async function startTour(appState: AppState, allNodes: GraphNode[]): Promise<void> {
	const { driver } = await import('driver.js');

	// Snapshot current state for restoration after tour
	const savedSelectedNode = appState.selectedNode;
	const savedShowDetailPanel = appState.showDetailPanel;

	let tourDriver: ReturnType<typeof driver>;

	tourDriver = driver({
		showProgress: true,
		animate: true,
		overlayColor: '#0f172a',
		overlayOpacity: 0.75,
		stagePadding: 8,
		stageRadius: 12,
		popoverClass: 'protocol-tour-popover',
		allowClose: true,
		smoothScroll: true,
		progressText: '{{current}} / {{total}}',
		nextBtnText: 'Next',
		prevBtnText: 'Back',
		doneBtnText: 'Done',
		steps: [
			// Step 1: Welcome (floating)
			{
				popover: {
					title: 'Welcome to The Protocol Universe',
					description:
						'An interactive explorer for the protocols that power the internet. ' +
						'This quick tour will show you what you can discover here.' +
						'<br><br><span class="tour-hint">Takes about 30 seconds</span>' +
					'<br><br><a href="https://github.com/NeoVand/coms" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:5px;color:#475569;font-size:11px;text-decoration:none;" onmouseover="this.style.color=\'#94a3b8\'" onmouseout="this.style.color=\'#475569\'"><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>Built by Neo Mohsenvand</a>'
				},
				onHighlighted: () => {
					appState.clearSelection();
				}
			},
			// Step 2: Graph canvas — block interaction so clicks don't dismiss tour
			{
				element: 'canvas',
				popover: {
					title: 'The Protocol Universe',
					description:
						'<strong>Click any node</strong> to explore a protocol in depth. ' +
						'<strong>Hover</strong> for a quick summary.' +
						'<br><br>Drag to pan, scroll to zoom. Related protocols stay highlighted when one is selected.',
					side: 'right' as const,
					align: 'center' as const
				},
				disableActiveInteraction: true,
				onHighlighted: () => {
					// Pre-select TCP so the detail panel is ready for the next step
					const tcpNode = allNodes.find((n) => n.id === 'tcp');
					if (tcpNode) appState.selectNode(tcpNode);
				}
			},
			// Step 3: Detail panel (now open with TCP)
			{
				element: '[data-tour="detail-panel"]',
				popover: {
					title: 'Protocol Deep-Dives',
					description:
						'Each protocol gets a full breakdown — overview, how-it-works steps, ' +
						'interactive diagrams, code examples, and performance stats.' +
						'<br><br><span class="tour-hint">Drag the left edge to resize this panel</span>',
					side: 'left' as const,
					align: 'start' as const
				},
				onHighlighted: () => {
					// Scroll panel to top to show header + overview
					const panel = document.querySelector('[data-tour="detail-panel"] .custom-scrollbar');
					if (panel) panel.scrollTop = 0;
				}
			},
			// Step 4: Interactive diagram
			{
				element: '[data-tour="protocol-diagram"]',
				popover: {
					title: 'Interactive Diagrams',
					description:
						'Sequence diagrams show exactly how each protocol works — ' +
						'solid arrows for requests, dashed for responses. ' +
						'Every protocol has its own animated diagram.',
					side: 'left' as const,
					align: 'center' as const
				},
				onHighlighted: () => {
					scrollTourElement('[data-tour="protocol-diagram"]');
					setTimeout(() => tourDriver.refresh(), 350);
				}
			},
			// Step 5: Code examples
			{
				element: '[data-tour="code-example"]',
				popover: {
					title: 'Code Examples',
					description:
						'Real, copyable code snippets in multiple languages. ' +
						'Switch between tabs to see different implementations, ' +
						'and hit the copy button to grab the code instantly.',
					side: 'left' as const,
					align: 'center' as const
				},
				onHighlighted: () => {
					scrollTourElement('[data-tour="code-example"]');
					setTimeout(() => tourDriver.refresh(), 350);
				}
			},
			// Step 6: Farewell (floating)
			{
				popover: {
					title: "You're Ready to Explore!",
					description:
						'Click any node on the graph to dive in. Try ' +
						'<strong style="color: #39ff14">TCP</strong>, ' +
						'<strong style="color: #00d4ff">HTTP</strong>, or ' +
						'<strong style="color: #c084fc">MQTT</strong> to start.' +
						'<br><br>Hit the <strong>?</strong> button anytime to replay this tour.'
				}
			}
		],
		onDestroyed: () => {
			// Restore pre-tour state
			if (savedSelectedNode && savedShowDetailPanel) {
				appState.selectNode(savedSelectedNode);
			} else {
				appState.clearSelection();
			}
		}
	});

	tourDriver.drive();
}
