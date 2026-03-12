export class RenderLoop {
	private animationId: number | null = null;
	private running = false;
	private callback: ((time: number, dt: number) => void) | null = null;
	private lastTime = 0;

	start(callback: (time: number, dt: number) => void): void {
		if (this.running) return;
		this.running = true;
		this.callback = callback;
		this.lastTime = performance.now();
		this.tick(this.lastTime);
	}

	stop(): void {
		this.running = false;
		if (this.animationId !== null) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
	}

	private tick = (time: number): void => {
		if (!this.running) return;
		const dt = Math.min(time - this.lastTime, 50); // Cap dt at 50ms to prevent spiral
		this.lastTime = time;
		this.callback?.(time, dt);
		this.animationId = requestAnimationFrame(this.tick);
	};

	destroy(): void {
		this.stop();
		this.callback = null;
	}
}
