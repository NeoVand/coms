export type SimulationTier = 'client' | 'server';
export type SimulationStatus = 'idle' | 'running' | 'paused' | 'complete' | 'error';

/** A single field in a protocol header at a given layer */
export interface HeaderField {
	name: string;
	bits: number;
	value: string | number;
	editable: boolean;
	description: string;
	color?: string;
}

/** A layer in the protocol stack (e.g. Ethernet, IP, TCP) */
export interface ProtocolLayer {
	name: string;
	abbreviation: string;
	osiLayer: number;
	headerFields: HeaderField[];
	color: string;
}

export type ActorIcon = 'client' | 'server' | 'router' | 'dns' | 'browser' | 'device';
export type ActorPosition = 'left' | 'center' | 'right';

export interface SimulationActor {
	id: string;
	label: string;
	icon: ActorIcon;
	position: ActorPosition;
}

export interface SimulationInput {
	id: string;
	label: string;
	type: 'text' | 'number' | 'select';
	defaultValue: string;
	options?: string[];
	placeholder?: string;
}

/** A single step in a simulation timeline */
export interface SimulationStep {
	id: string;
	label: string;
	description: string;
	fromActor: string;
	toActor: string;
	data?: string;
	layers?: ProtocolLayer[];
	highlight?: string[];
	duration: number;
}

/** Full configuration for a protocol simulation */
export interface SimulationConfig {
	protocolId: string;
	title: string;
	description: string;
	tier: SimulationTier;
	actors: SimulationActor[];
	steps: SimulationStep[];
	userInputs?: SimulationInput[];
	layers?: ProtocolLayer[];
}
