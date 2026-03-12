<script lang="ts">
	import type { CodeExample as CodeExampleType } from '$lib/data/types';

	let { example }: { example: CodeExampleType } = $props();
	let copied = $state(false);

	async function copyCode() {
		await navigator.clipboard.writeText(example.code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<section>
	<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">Code Example</h3>
	<div class="overflow-hidden rounded-xl border border-white/5 bg-[#0d1117]">
		<div class="flex items-center justify-between border-b border-white/5 px-3 py-2">
			<span class="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
				{example.language}
			</span>
			<button
				class="flex items-center gap-1 rounded px-2 py-0.5 text-[10px] text-slate-400 transition-colors hover:bg-white/5 hover:text-slate-200"
				onclick={copyCode}
			>
				{#if copied}
					<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M5 13l4 4L19 7"
						/>
					</svg>
					Copied
				{:else}
					<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"
						/>
					</svg>
					Copy
				{/if}
			</button>
		</div>
		<pre class="custom-scrollbar overflow-x-auto p-3 text-[11px] leading-5 text-slate-300"><code
				>{example.code}</code
			></pre>
	</div>
	{#if example.caption}
		<p class="mt-2 text-[10px] leading-relaxed text-slate-500">{example.caption}</p>
	{/if}
</section>
