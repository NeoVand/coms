import type { SimulationStatus, SimulationConfig } from './types';

export class SimulatorState {
	status: SimulationStatus = $state('idle');
	currentStep: number = $state(-1);
	speed: number = $state(1);
	config: SimulationConfig | null = $state(null);
	userValues: Record<string, string> = $state({});

	private _timer: ReturnType<typeof setTimeout> | null = null;

	get totalSteps(): number {
		return this.config?.steps.length ?? 0;
	}

	get isFirstStep(): boolean {
		return this.currentStep <= 0;
	}

	get isLastStep(): boolean {
		return this.currentStep >= this.totalSteps - 1;
	}

	get currentStepData() {
		if (!this.config || this.currentStep < 0) return null;
		return this.config.steps[this.currentStep] ?? null;
	}

	load(config: SimulationConfig) {
		this.stop();
		this.config = config;
		this.currentStep = -1;
		this.status = 'idle';
		this.userValues = {};
		if (config.userInputs) {
			for (const input of config.userInputs) {
				this.userValues[input.id] = input.defaultValue;
			}
		}
	}

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
		if (this.status !== 'running' || !this.config) return;
		const stepData = this.currentStep >= 0 ? this.config.steps[this.currentStep] : null;
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
