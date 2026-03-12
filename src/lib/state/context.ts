import { createContext } from 'svelte';
import type { AppState } from './app-state.svelte';

export const [getAppState, setAppState] = createContext<AppState>();
