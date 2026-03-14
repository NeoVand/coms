export const COLORS = {
	bg: '#090E1A',
	bgPanel: 'rgba(15, 23, 42, 0.8)',
	glassBorder: 'rgba(255, 255, 255, 0.1)',
	glassBg: 'rgba(255, 255, 255, 0.05)',
	textPrimary: '#F8FAFC',
	textSecondary: '#94A3B8',
	textMuted: '#475569',
	hub: '#FFFFFF',
	hubGlow: 'rgba(255, 255, 255, 0.3)',
	transport: '#39FF14',
	transportGlow: 'rgba(57, 255, 20, 0.4)',
	'web-api': '#00D4FF',
	'web-apiGlow': 'rgba(0, 212, 255, 0.4)',
	'async-iot': '#C084FC',
	'async-iotGlow': 'rgba(192, 132, 252, 0.4)',
	'realtime-av': '#FF9F67',
	'realtime-avGlow': 'rgba(255, 159, 103, 0.4)',
	utilities: '#2DD4BF',
	utilitiesGlow: 'rgba(45, 212, 191, 0.4)'
} as const;

export const CATEGORY_COLORS: Record<string, { color: string; glow: string }> = {
	transport: { color: COLORS.transport, glow: COLORS.transportGlow },
	'web-api': { color: COLORS['web-api'], glow: COLORS['web-apiGlow'] },
	'async-iot': { color: COLORS['async-iot'], glow: COLORS['async-iotGlow'] },
	'realtime-av': { color: COLORS['realtime-av'], glow: COLORS['realtime-avGlow'] },
	utilities: { color: COLORS.utilities, glow: COLORS.utilitiesGlow }
};

export function hexToRgba(hex: string, alpha: number): string {
	const r = parseInt(hex.slice(1, 3), 16);
	const g = parseInt(hex.slice(3, 5), 16);
	const b = parseInt(hex.slice(5, 7), 16);
	return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
