<script lang="ts">
	import type { SimulationInput } from '../types';
	import type { SimulatorState } from '../state.svelte';

	interface Props {
		inputs: SimulationInput[];
		state: SimulatorState;
		color: string;
	}

	let { inputs, state, color }: Props = $props();
</script>

{#if inputs.length > 0}
	<div class="flex flex-col gap-2">
		<h4 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">
			Configuration
		</h4>
		<div class="grid gap-2" style="grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
			{#each inputs as input (input.id)}
				<label class="flex flex-col gap-1">
					<span class="text-[10px] font-medium text-slate-400">{input.label}</span>
					{#if input.type === 'select' && input.options}
						<select
							class="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-200 outline-none transition-colors focus:border-opacity-50"
							style="focus:border-color: {color}"
							value={state.userValues[input.id] ?? input.defaultValue}
							onchange={(e) => state.setUserValue(input.id, (e.target as HTMLSelectElement).value)}
						>
							{#each input.options as option (option)}
								<option value={option} class="bg-slate-800">{option}</option>
							{/each}
						</select>
					{:else}
						<input
							type={input.type}
							class="rounded-md border border-white/10 bg-white/5 px-2 py-1.5 text-xs text-slate-200 outline-none transition-colors focus:border-opacity-50"
							style="focus:border-color: {color}"
							placeholder={input.placeholder}
							value={state.userValues[input.id] ?? input.defaultValue}
							oninput={(e) => state.setUserValue(input.id, (e.target as HTMLInputElement).value)}
						/>
					{/if}
				</label>
			{/each}
		</div>
	</div>
{/if}
