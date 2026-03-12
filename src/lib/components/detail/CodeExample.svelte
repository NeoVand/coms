<script lang="ts">
	import type { CodeExample as CodeExampleType } from '$lib/data/types';
	import hljs from 'highlight.js/lib/core';
	import python from 'highlight.js/lib/languages/python';
	import javascript from 'highlight.js/lib/languages/javascript';
	import typescript from 'highlight.js/lib/languages/typescript';
	import bash from 'highlight.js/lib/languages/bash';
	import http from 'highlight.js/lib/languages/http';
	import protobuf from 'highlight.js/lib/languages/protobuf';
	import xml from 'highlight.js/lib/languages/xml';
	import json from 'highlight.js/lib/languages/json';

	hljs.registerLanguage('python', python);
	hljs.registerLanguage('javascript', javascript);
	hljs.registerLanguage('typescript', typescript);
	hljs.registerLanguage('bash', bash);
	hljs.registerLanguage('http', http);
	hljs.registerLanguage('protobuf', protobuf);
	hljs.registerLanguage('xml', xml);
	hljs.registerLanguage('json', json);

	let { example }: { example: CodeExampleType } = $props();
	let copied = $state(false);
	let activeTab = $state(0);

	const tabs = $derived.by(() => {
		const list = [{ language: example.language, code: example.code }];
		if (example.alternatives) {
			for (const alt of example.alternatives) {
				list.push(alt);
			}
		}
		return list;
	});

	const activeCode = $derived(tabs[activeTab]);

	const highlightedCode = $derived.by(() => {
		const { language, code } = activeCode;
		const lang = language.toLowerCase();
		const hljsLang =
			lang === 'js'
				? 'javascript'
				: lang === 'ts'
					? 'typescript'
					: lang === 'py'
						? 'python'
						: lang === 'sh' || lang === 'shell'
							? 'bash'
							: lang === 'proto'
								? 'protobuf'
								: lang;
		try {
			if (hljs.getLanguage(hljsLang)) {
				return hljs.highlight(code, { language: hljsLang }).value;
			}
			return hljs.highlightAuto(code).value;
		} catch {
			return code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		}
	});

	async function copyCode() {
		await navigator.clipboard.writeText(activeCode.code);
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}

	function displayLang(lang: string): string {
		const map: Record<string, string> = {
			javascript: 'JavaScript',
			typescript: 'TypeScript',
			python: 'Python',
			bash: 'Bash',
			http: 'HTTP',
			protobuf: 'Protobuf',
			graphql: 'GraphQL',
			json: 'JSON',
			sip: 'SIP'
		};
		return map[lang.toLowerCase()] ?? lang;
	}
</script>

<section>
	<h3 class="mb-2 text-xs font-semibold tracking-wider text-slate-500 uppercase">Code Example</h3>
	<div class="overflow-hidden rounded-xl border border-white/5 bg-[#0d1117]">
		<div class="flex items-center justify-between border-b border-white/5 px-3 py-2">
			{#if tabs.length > 1}
				<div class="flex gap-1">
					{#each tabs as tab, i (tab.language)}
						<button
							class="rounded-md px-2.5 py-1 text-[10px] font-medium tracking-wider uppercase transition-colors {activeTab ===
							i
								? 'bg-white/10 text-slate-200'
								: 'text-slate-500 hover:bg-white/5 hover:text-slate-300'}"
							onclick={() => (activeTab = i)}
						>
							{displayLang(tab.language)}
						</button>
					{/each}
				</div>
			{:else}
				<span class="text-[10px] font-medium tracking-wider text-slate-500 uppercase">
					{displayLang(example.language)}
				</span>
			{/if}
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
				class="hljs">{@html highlightedCode}</code
			></pre>
	</div>
	{#if example.caption}
		<p class="mt-2 text-[10px] leading-relaxed text-slate-500">{example.caption}</p>
	{/if}
</section>

<style>
	:global(.hljs) {
		color: #c9d1d9;
		background: transparent;
	}
	:global(.hljs-keyword),
	:global(.hljs-selector-tag) {
		color: #ff7b72;
	}
	:global(.hljs-string),
	:global(.hljs-attr) {
		color: #a5d6ff;
	}
	:global(.hljs-number),
	:global(.hljs-literal) {
		color: #79c0ff;
	}
	:global(.hljs-built_in) {
		color: #ffa657;
	}
	:global(.hljs-function) {
		color: #d2a8ff;
	}
	:global(.hljs-title),
	:global(.hljs-title.function_) {
		color: #d2a8ff;
	}
	:global(.hljs-params) {
		color: #c9d1d9;
	}
	:global(.hljs-comment) {
		color: #8b949e;
		font-style: italic;
	}
	:global(.hljs-punctuation),
	:global(.hljs-operator) {
		color: #c9d1d9;
	}
	:global(.hljs-property) {
		color: #79c0ff;
	}
	:global(.hljs-type),
	:global(.hljs-class .hljs-title) {
		color: #ffa657;
	}
	:global(.hljs-variable) {
		color: #ffa657;
	}
	:global(.hljs-meta) {
		color: #79c0ff;
	}
	:global(.hljs-attribute) {
		color: #79c0ff;
	}
	:global(.hljs-section) {
		color: #1f6feb;
		font-weight: bold;
	}
</style>
