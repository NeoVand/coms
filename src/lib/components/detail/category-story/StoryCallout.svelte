<script lang="ts">
	let { title, text, color }: { title: string; text: string; color: string } = $props();
</script>

<div class="rounded-xl border border-white/5 bg-white/[0.02] p-3">
	<div class="text-xs font-semibold" style="color: {color}">{title}</div>
	<p class="mt-1.5 text-xs leading-relaxed text-slate-400">{text}</p>
</div>
