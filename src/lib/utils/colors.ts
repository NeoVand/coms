export interface ThemeColors {
	bg: string;
	bgPanel: string;
	glassBorder: string;
	glassBg: string;
	textPrimary: string;
	textSecondary: string;
	textMuted: string;
	hub: string;
	hubGlow: string;
	hubGradientEnd: string;
	transport: string;
	transportGlow: string;
	'web-api': string;
	'web-apiGlow': string;
	'async-iot': string;
	'async-iotGlow': string;
	'realtime-av': string;
	'realtime-avGlow': string;
	utilities: string;
	utilitiesGlow: string;
	edgeColor: string;
	edgeAlpha: number;
	nodeBaseBg: string;
	showStars: boolean;
	labelShadowColor: string;
	labelShadowBlur: number;
	hubIconGreen: string;
	hubIconPurple: string;
	hubIconBlue: string;
	hubIconCenter: string;
	hubIconShadow: string;
	categoryIconColor: string;
	timelineLineBase: [number, number, number]; // RGB tuple for timeline
	innerHighlightAlpha: number;
}

const DARK: ThemeColors = {
	bg: '#090E1A',
	bgPanel: 'rgba(15, 23, 42, 0.8)',
	glassBorder: 'rgba(255, 255, 255, 0.1)',
	glassBg: 'rgba(255, 255, 255, 0.05)',
	textPrimary: '#F8FAFC',
	textSecondary: '#94A3B8',
	textMuted: '#475569',
	hub: '#FFFFFF',
	hubGlow: 'rgba(255, 255, 255, 0.3)',
	hubGradientEnd: 'rgba(200, 210, 230, 1)',
	transport: '#39FF14',
	transportGlow: 'rgba(57, 255, 20, 0.4)',
	'web-api': '#00D4FF',
	'web-apiGlow': 'rgba(0, 212, 255, 0.4)',
	'async-iot': '#C084FC',
	'async-iotGlow': 'rgba(192, 132, 252, 0.4)',
	'realtime-av': '#FF9F67',
	'realtime-avGlow': 'rgba(255, 159, 103, 0.4)',
	utilities: '#2DD4BF',
	utilitiesGlow: 'rgba(45, 212, 191, 0.4)',
	edgeColor: '#FFFFFF',
	edgeAlpha: 0.2,
	nodeBaseBg: 'rgba(15, 23, 42, 1)',
	showStars: true,
	labelShadowColor: 'rgba(0, 0, 0, 0.8)',
	labelShadowBlur: 4,
	hubIconGreen: '#6ee7b7',
	hubIconPurple: '#c4b5fd',
	hubIconBlue: '#7dd3fc',
	hubIconCenter: '#e2e8f0',
	hubIconShadow: 'rgba(0, 0, 0, 0.35)',
	categoryIconColor: '#ffffff',
	timelineLineBase: [148, 163, 184],
	innerHighlightAlpha: 0.25
};

const LIGHT: ThemeColors = {
	bg: '#E8EEF6',
	bgPanel: 'rgba(255, 255, 255, 0.88)',
	glassBorder: 'rgba(0, 0, 0, 0.08)',
	glassBg: 'rgba(0, 0, 0, 0.03)',
	textPrimary: '#1E293B',
	textSecondary: '#475569',
	textMuted: '#94A3B8',
	hub: '#3B4963',
	hubGlow: 'rgba(59, 73, 99, 0.2)',
	hubGradientEnd: 'rgba(100, 116, 139, 1)',
	// Node body colors: same hues as dark mode, slightly deepened for light canvas
	transport: '#30E010',
	transportGlow: 'rgba(48, 224, 16, 0.3)',
	'web-api': '#00BBEE',
	'web-apiGlow': 'rgba(0, 187, 238, 0.3)',
	'async-iot': '#A66EF7',
	'async-iotGlow': 'rgba(166, 110, 247, 0.3)',
	'realtime-av': '#F08840',
	'realtime-avGlow': 'rgba(240, 136, 64, 0.3)',
	utilities: '#24BFA8',
	utilitiesGlow: 'rgba(36, 191, 168, 0.3)',
	edgeColor: '#64748B',
	edgeAlpha: 0.55,
	// Dark base behind nodes to preserve 3D gradient (only fills the node circle)
	nodeBaseBg: 'rgba(20, 30, 50, 1)',
	showStars: false,
	labelShadowColor: 'rgba(232, 238, 246, 0.85)',
	labelShadowBlur: 4,
	hubIconGreen: '#16A34A',
	hubIconPurple: '#7C3AED',
	hubIconBlue: '#0284C7',
	hubIconCenter: '#e2e8f0',
	hubIconShadow: 'rgba(0, 0, 0, 0.25)',
	categoryIconColor: '#ffffff',
	timelineLineBase: [71, 85, 105],
	innerHighlightAlpha: 0.22
};

export function getThemeColors(theme: 'dark' | 'light'): ThemeColors {
	return theme === 'dark' ? DARK : LIGHT;
}

/** Map dark-mode neon → slightly-deepened versions for canvas graph nodes */
const LIGHT_GRAPH_MAP: Record<string, string> = {
	'#39FF14': LIGHT.transport,
	'#39ff14': LIGHT.transport,
	'#00D4FF': LIGHT['web-api'],
	'#00d4ff': LIGHT['web-api'],
	'#C084FC': LIGHT['async-iot'],
	'#c084fc': LIGHT['async-iot'],
	'#FF9F67': LIGHT['realtime-av'],
	'#ff9f67': LIGHT['realtime-av'],
	'#2DD4BF': LIGHT.utilities,
	'#2dd4bf': LIGHT.utilities,
	'#F472B6': '#E04898',
	'#f472b6': '#E04898',
	'#FFFFFF': LIGHT.hub,
	'#ffffff': LIGHT.hub
};

/** Map dark-mode neon → muted, readable versions for DOM text/badges on light backgrounds */
const LIGHT_DOM_MAP: Record<string, string> = {
	// Category colors
	'#39FF14': '#15803D',
	'#39ff14': '#15803D',
	'#00D4FF': '#0E7490',
	'#00d4ff': '#0E7490',
	'#C084FC': '#7C3AED',
	'#c084fc': '#7C3AED',
	'#FF9F67': '#C2410C',
	'#ff9f67': '#C2410C',
	'#2DD4BF': '#0F766E',
	'#2dd4bf': '#0F766E',
	'#F472B6': '#BE185D',
	'#f472b6': '#BE185D',
	'#FFFFFF': '#1E293B',
	'#ffffff': '#1E293B',
	// Simulation layer colors
	'#FACC15': '#A16207', // TLS yellow → dark gold
	'#facc15': '#A16207',
	'#22D3EE': '#0E7490', // QUIC cyan → dark cyan
	'#22d3ee': '#0E7490',
	'#FB923C': '#C2410C', // SSH orange → dark orange
	'#fb923c': '#C2410C',
	'#F59E0B': '#B45309', // SMTP/WebRTC amber → dark amber
	'#f59e0b': '#B45309',
	'#22c55e': '#15803D', // status green → dark green
	'#22C55E': '#15803D',
	'#34D399': '#047857', // STUN emerald → dark emerald
	'#34d399': '#047857',
	'#10B981': '#047857', // MQTT emerald → dark emerald
	'#10b981': '#047857',
	'#A78BFA': '#6D28D9', // WebSocket violet → dark violet
	'#a78bfa': '#6D28D9',
	'#818CF8': '#4338CA', // WebRTC indigo → dark indigo
	'#818cf8': '#4338CA',
	'#D946EF': '#A21CAF', // STOMP fuchsia → dark fuchsia
	'#d946ef': '#A21CAF',
	'#A855F7': '#7C3AED', // SDP purple → dark purple
	'#a855f7': '#7C3AED',
	'#E535AB': '#BE185D', // GraphQL pink → dark rose
	'#e535ab': '#BE185D',
	'#78C257': '#3F6212', // CoAP lime-green → dark green
	'#78c257': '#3F6212',
	'#0EA5E9': '#0369A1', // ICMP/MPTCP sky → dark sky
	'#0ea5e9': '#0369A1',
	'#06B6D4': '#0E7490', // DHCP cyan → dark cyan
	'#06b6d4': '#0E7490',
	'#EC4899': '#BE185D', // RTP pink → dark rose
	'#ec4899': '#BE185D',
	'#EF4444': '#B91C1C', // error red → dark red
	'#ef4444': '#B91C1C',
	'#14B8A6': '#0F766E', // SIP teal → dark teal
	'#14b8a6': '#0F766E'
};

/** Remap a color for the canvas graph (slightly deepened, still vibrant) */
export function themedColor(color: string, theme: 'dark' | 'light'): string {
	if (theme === 'dark') return color;
	return LIGHT_GRAPH_MAP[color] ?? color;
}

/** Auto-darken a hex color for readability on light backgrounds */
function autoDarkenForLightBg(hex: string): string {
	const r = parseInt(hex.slice(1, 3), 16) / 255;
	const g = parseInt(hex.slice(3, 5), 16) / 255;
	const b = parseInt(hex.slice(5, 7), 16) / 255;
	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	let l = (max + min) / 2;
	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
		else if (max === g) h = ((b - r) / d + 2) / 6;
		else h = ((r - g) / d + 4) / 6;
	}
	// If light enough to be hard to read on a light bg, darken it
	if (l > 0.45) {
		l = 0.35;
		s = Math.min(s, 0.85);
	}
	const hue2rgb = (p: number, q: number, t: number) => {
		if (t < 0) t += 1;
		if (t > 1) t -= 1;
		if (t < 1 / 6) return p + (q - p) * 6 * t;
		if (t < 1 / 2) return q;
		if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
		return p;
	};
	const q2 = l < 0.5 ? l * (1 + s) : l + s - l * s;
	const p2 = 2 * l - q2;
	const nr = Math.round(hue2rgb(p2, q2, h + 1 / 3) * 255);
	const ng = Math.round(hue2rgb(p2, q2, h) * 255);
	const nb = Math.round(hue2rgb(p2, q2, h - 1 / 3) * 255);
	return `#${nr.toString(16).padStart(2, '0')}${ng.toString(16).padStart(2, '0')}${nb.toString(16).padStart(2, '0')}`;
}

/** Remap a color for DOM text/badges (muted, high-contrast against light backgrounds) */
export function themedDomColor(color: string, theme: 'dark' | 'light'): string {
	if (theme === 'dark') return color;
	const mapped = LIGHT_DOM_MAP[color];
	if (mapped) return mapped;
	// Auto-darken any unmapped hex color that's too bright
	if (color.startsWith('#') && (color.length === 7 || color.length === 4)) {
		return autoDarkenForLightBg(color);
	}
	return color;
}

// Legacy — kept for backward compat in non-themed contexts
export const COLORS = DARK;

export const CATEGORY_COLORS: Record<string, { color: string; glow: string }> = {
	transport: { color: DARK.transport, glow: DARK.transportGlow },
	'web-api': { color: DARK['web-api'], glow: DARK['web-apiGlow'] },
	'async-iot': { color: DARK['async-iot'], glow: DARK['async-iotGlow'] },
	'realtime-av': { color: DARK['realtime-av'], glow: DARK['realtime-avGlow'] },
	utilities: { color: DARK.utilities, glow: DARK.utilitiesGlow }
};

export function hexToRgba(hex: string, alpha: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
