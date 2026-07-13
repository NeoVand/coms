import type { SimulationStep } from '../types';

/**
 * Context handed to a live driver for one run. The driver performs a REAL
 * network exchange and reports it by appending steps; the existing packet
 * inspector / actor stage / timeline render them unchanged.
 */
export interface LiveContext {
	/** Current values of the simulation's user inputs (e.g. the domain to resolve). */
	userValues: Record<string, string>;
	/** Push a step captured from the real exchange (marked live automatically). */
	append: (step: Omit<SimulationStep, 'source'>) => void;
	/** Aborts when the user leaves live mode or the panel unmounts. */
	signal: AbortSignal;
}

/**
 * A protocol's live capability. Kept in a small registry (not the 57 data
 * configs) so only protocols the browser can genuinely exercise opt in.
 */
export interface LiveDriver {
	/** Verb for the run button in live mode, e.g. "Resolve". */
	runLabel: string;
	/** One-line, honest explanation of what the live run really does. */
	note: string;
	/** Perform the real exchange, appending steps as events occur. */
	run: (ctx: LiveContext) => Promise<void>;
}
