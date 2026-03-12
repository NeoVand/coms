import { hexToRgba } from '$lib/utils/colors';

export interface Particle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	life: number;
	maxLife: number;
	color: string;
	size: number;
	alpha: number;
	type: 'dot' | 'ring' | 'label';
	label?: string;
}

const MAX_PARTICLES = 500;

export class ParticleSystem {
	particles: Particle[] = [];

	emit(
		x: number,
		y: number,
		vx: number,
		vy: number,
		color: string,
		options?: {
			count?: number;
			spread?: number;
			life?: number;
			size?: number;
			type?: 'dot' | 'ring' | 'label';
			label?: string;
		}
	): void {
		const count = options?.count ?? 1;
		const spread = options?.spread ?? 0;
		const life = options?.life ?? 60;
		const size = options?.size ?? 2;
		const type = options?.type ?? 'dot';

		for (let i = 0; i < count; i++) {
			if (this.particles.length >= MAX_PARTICLES) {
				// Recycle the oldest particle
				this.particles.shift();
			}
			this.particles.push({
				x,
				y,
				vx: vx + (Math.random() - 0.5) * spread,
				vy: vy + (Math.random() - 0.5) * spread,
				life,
				maxLife: life,
				color,
				size,
				alpha: 1,
				type,
				label: options?.label
			});
		}
	}

	update(): void {
		for (let i = this.particles.length - 1; i >= 0; i--) {
			const p = this.particles[i];
			p.x += p.vx;
			p.y += p.vy;
			p.life--;
			p.alpha = Math.max(0, p.life / p.maxLife);

			if (p.life <= 0) {
				this.particles.splice(i, 1);
			}
		}
	}

	draw(ctx: CanvasRenderingContext2D): void {
		for (const p of this.particles) {
			if (p.alpha <= 0) continue;

			if (p.type === 'label' && p.label) {
				ctx.font = `600 ${8 + p.size}px Inter, system-ui, sans-serif`;
				ctx.textAlign = 'center';
				ctx.textBaseline = 'middle';
				ctx.fillStyle = hexToRgba(p.color, p.alpha * 0.9);
				ctx.shadowColor = p.color;
				ctx.shadowBlur = 8;
				ctx.fillText(p.label, p.x, p.y);
				ctx.shadowColor = 'transparent';
				ctx.shadowBlur = 0;
				continue;
			}

			ctx.beginPath();

			if (p.type === 'ring') {
				ctx.arc(p.x, p.y, p.size * (1 + (1 - p.alpha) * 2), 0, Math.PI * 2);
				ctx.strokeStyle = hexToRgba(p.color, p.alpha * 0.6);
				ctx.lineWidth = 1;
				ctx.stroke();
			} else {
				// Glowing dot
				const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
				glow.addColorStop(0, hexToRgba(p.color, p.alpha * 0.8));
				glow.addColorStop(0.4, hexToRgba(p.color, p.alpha * 0.3));
				glow.addColorStop(1, hexToRgba(p.color, 0));
				ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
				ctx.fillStyle = glow;
				ctx.fill();

				// Bright core
				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
				ctx.fill();
			}
		}
	}

	clear(): void {
		this.particles.length = 0;
	}
}
