import type { SimulationStatus, SimulationConfig, SimulationStep } from './types';

export type SimulatorMode = 'scripted' | 'live';

export class SimulatorState {
	status: SimulationStatus = $state('idle');
	currentStep: number = $state(-1);
	speed: number = $state(0.5);
	config: SimulationConfig | null = $state(null);
	userValues: Record<string, string> = $state({});

	/**
	 * 'scripted' plays the authored demo steps; 'live' replaces them with steps
	 * appended from a real network exchange. The whole render pipeline (timeline,
	 * inspector, actor stage) reads `steps`, so it works identically in both.
	 */
	mode: SimulatorMode = $state('scripted');
	liveSteps: SimulationStep[] = $state([]);
	/** Human-readable failure from a live run (network error, no records, …). */
	liveError: string | null = $state(null);

	private _timer: ReturnType<typeof setTimeout> | null = null;

	/** The active step source — authored steps when scripted, captured when live. */
	get steps(): SimulationStep[] {
		return this.mode === 'live' ? this.liveSteps : (this.config?.steps ?? []);
	}

	get totalSteps(): number {
		return this.steps.length;
	}

	get isFirstStep(): boolean {
		return this.currentStep <= 0;
	}

	get isLastStep(): boolean {
		return this.currentStep >= this.totalSteps - 1;
	}

	get currentStepData() {
		if (this.currentStep < 0) return null;
		return this.steps[this.currentStep] ?? null;
	}

	load(config: SimulationConfig) {
		this.stop();
		this.config = config;
		this.currentStep = -1;
		this.status = 'idle';
		this.mode = 'scripted';
		this.liveSteps = [];
		this.liveError = null;
		this.userValues = {};
		if (config.userInputs) {
			for (const input of config.userInputs) {
				this.userValues[input.id] = input.defaultValue;
			}
		}
	}

	/** Switch between the scripted demo and live capture; clears any capture. */
	setMode = (mode: SimulatorMode) => {
		if (mode === this.mode) return;
		this.stop();
		this.mode = mode;
		this.liveSteps = [];
		this.liveError = null;
		this.currentStep = -1;
		this.status = 'idle';
	};

	/** Append a step captured from a real exchange and follow it (live mode). */
	appendStep = (step: SimulationStep) => {
		this.liveSteps = [...this.liveSteps, { ...step, source: 'live' }];
		this.currentStep = this.liveSteps.length - 1;
	};

	/** Drop all captured steps (a fresh live session is starting). */
	clearLive = () => {
		this.liveSteps = [];
		this.currentStep = -1;
		this.status = 'idle';
	};

	play = () => {
		if (!this.config) return;
		if (this.status === 'complete') {
			this.currentStep = -1;
		}
		this.status = 'running';
		this._scheduleNext();
	};

	pause = () => {
		this.status = 'paused';
		this._clearTimer();
	};

	step = () => {
		if (!this.config) return;
		if (this.status === 'complete') {
			this.currentStep = -1;
			this.status = 'idle';
		}
		this._clearTimer();
		this._advance();
		if (this.status === 'running') {
			this.status = 'paused';
		}
	};

	reset = () => {
		this._clearTimer();
		this.currentStep = -1;
		this.status = 'idle';
	};

	setSpeed = (speed: number) => {
		this.speed = speed;
		if (this.status === 'running') {
			this._clearTimer();
			this._scheduleNext();
		}
	};

	setUserValue = (id: string, value: string) => {
		this.userValues[id] = value;
	};

	goToStep = (index: number) => {
		if (!this.config) return;
		if (index < 0 || index >= this.totalSteps) return;
		this._clearTimer();
		this.currentStep = index;
		this.status = 'paused';
	};

	stop() {
		this._clearTimer();
		this.status = 'idle';
		this.currentStep = -1;
	}

	private _advance = () => {
		if (!this.config) return;
		if (this.currentStep < this.totalSteps - 1) {
			this.currentStep++;
		} else {
			this.status = 'complete';
			this._clearTimer();
		}
	};

	private _scheduleNext = () => {
		// Live mode is event-driven — real events call appendStep(); no auto-timer.
		if (this.status !== 'running' || !this.config || this.mode === 'live') return;
		const stepData = this.currentStep >= 0 ? this.steps[this.currentStep] : null;
		const delay = (stepData?.duration ?? 800) / this.speed;

		this._timer = setTimeout(() => {
			this._advance();
			if (this.status === 'running') {
				this._scheduleNext();
			}
		}, delay);
	};

	private _clearTimer = () => {
		if (this._timer !== null) {
			clearTimeout(this._timer);
			this._timer = null;
		}
	};
}
