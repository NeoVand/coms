/**
 * Shared mermaid rendering utilities used by MermaidDiagram and DiagramModal.
 */

export function buildThemedDefinition(
	rawDef: string,
	color: string,
	expanded = false
): string {
	const fontSize = expanded ? '15px' : '13px';
	const actorFontSize = expanded ? 15 : 13;
	const messageFontSize = expanded ? 14 : 12;
	const noteFontSize = expanded ? 13 : 12;
	const actorMargin = expanded ? 80 : 50;
	const messageMargin = expanded ? 35 : 25;

	const c = color;
	return `%%{init: {
  'theme': 'dark',
  'themeVariables': {
    'background': 'transparent',
    'primaryColor': '${c}1a',
    'primaryBorderColor': '${c}',
    'primaryTextColor': '#e2e8f0',
    'secondaryColor': '#334155',
    'tertiaryColor': '#1e293b',
    'lineColor': '${c}',
    'textColor': '#e2e8f0',
    'actorBkg': '${c}1a',
    'actorBorder': '${c}80',
    'actorTextColor': '#e2e8f0',
    'actorLineColor': '#334155',
    'signalColor': '${c}',
    'signalTextColor': '#94a3b8',
    'noteBkgColor': '${c}15',
    'noteTextColor': '#e2e8f0',
    'noteBorderColor': '${c}30',
    'activationBkgColor': '${c}1a',
    'activationBorderColor': '${c}',
    'labelBoxBkgColor': '#1e293b',
    'labelBoxBorderColor': '#334155',
    'labelTextColor': '#94a3b8',
    'loopTextColor': '#94a3b8',
    'nodeBkg': '#334155',
    'nodeTextColor': '#e2e8f0',
    'mainBkg': '${c}1a',
    'clusterBkg': '${c}08',
    'clusterBorder': '${c}40',
    'edgeLabelBackground': '#1e293b',
    'fontSize': '${fontSize}'
  },
  'sequence': {
    'actorMargin': ${actorMargin},
    'messageMargin': ${messageMargin},
    'actorFontSize': ${actorFontSize},
    'messageFontSize': ${messageFontSize},
    'noteFontSize': ${noteFontSize}
  }
}}%%
${rawDef}`;
}

export function styleCrossArrows(container: HTMLElement): void {
	const svg = container.querySelector('svg');
	if (!svg) return;

	const RED = '#ef4444';

	const markers = svg.querySelectorAll('marker');
	const crossMarkerIds = new Set<string>();
	markers.forEach((m) => {
		if (m.id.includes('crosshead')) {
			crossMarkerIds.add(m.id);
			m.querySelectorAll('path').forEach((p) => {
				p.style.stroke = RED;
				p.style.fill = 'none';
			});
		}
	});

	if (crossMarkerIds.size === 0) return;

	const crossLines: Element[] = [];
	svg.querySelectorAll('line, path').forEach((el) => {
		const markerEnd = el.getAttribute('marker-end') ?? '';
		for (const id of crossMarkerIds) {
			if (markerEnd.includes(id)) {
				(el as HTMLElement).style.stroke = RED;
				el.classList.add('cross-arrow');
				crossLines.push(el);
			}
		}
	});

	const allTexts = svg.querySelectorAll('.messageText');
	for (const line of crossLines) {
		const lineY = parseFloat(line.getAttribute('y1') ?? line.getAttribute('y2') ?? '0');
		let closestText: Element | null = null;
		let closestDist = Infinity;
		allTexts.forEach((t) => {
			const textY = parseFloat(t.getAttribute('y') ?? '0');
			if (textY > lineY) return;
			const dist = lineY - textY;
			if (dist < closestDist) {
				closestDist = dist;
				closestText = t;
			}
		});
		if (closestText && closestDist < 40) {
			(closestText as HTMLElement).style.fill = RED;
		}
	}
}
