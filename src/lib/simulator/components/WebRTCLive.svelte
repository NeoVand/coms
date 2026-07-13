<script lang="ts">
	import type { WebRTCSession } from '../live/webrtc.svelte';
	import { Radio, Copy, Check, LoaderCircle, ArrowLeft, Send } from 'lucide-svelte';

	interface Props {
		session: WebRTCSession;
		color: string;
	}

	let { session, color }: Props = $props();

	let replyCode = $state(''); // initiator pastes the joiner's reply here
	let inviteCode = $state(''); // joiner pastes the initiator's invite here
	let draft = $state(''); // outgoing chat message
	let copied = $state(false);

	const phase = $derived(session.phase);

	async function copyLocal() {
		try {
			await navigator.clipboard.writeText(session.localCode);
			copied = true;
			setTimeout(() => (copied = false), 1500);
		} catch {
			copied = false;
		}
	}

	function sendDraft() {
		const text = draft.trim();
		if (!text) return;
		session.send(text);
		draft = '';
	}

	function onDraftKey(e: KeyboardEvent) {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault();
			sendDraft();
		}
	}
</script>

{#snippet codeBlock(codeLabel: string, hint: string)}
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between">
			<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase"
				>{codeLabel}</span
			>
			<button
				class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-s-glass-hover"
				style="color: {color}"
				onclick={copyLocal}
			>
				{#if copied}<Check size={11} /> Copied{:else}<Copy size={11} /> Copy{/if}
			</button>
		</div>
		<textarea
			class="h-16 w-full resize-none rounded-md border border-s-border bg-s-glass px-2 py-1.5 font-mono text-[10px] leading-snug text-t-secondary outline-none"
			readonly
			onclick={(e) => (e.currentTarget as HTMLTextAreaElement).select()}
			value={session.localCode}
		></textarea>
		<p class="text-[11px] leading-relaxed text-t-muted">{hint}</p>
	</div>
{/snippet}

<div class="flex flex-col gap-3 rounded-lg border border-s-border bg-s-glass/40 p-3">
	{#if phase === 'idle'}
		<!-- Role choice -->
		<p class="text-xs leading-relaxed text-t-secondary">
			Start a chat here, then open this same page on another device and join with the code — or the
			other way around.
		</p>
		<div class="flex items-center gap-2">
			<button
				class="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all hover:brightness-110"
				style="background-color: {color}1a; color: {color}"
				onclick={() => session.createInvite()}
			>
				<Radio size={14} /> Create invite
			</button>
			<button
				class="flex h-8 items-center rounded-lg px-3 text-xs font-medium text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
				onclick={() => session.beginJoin()}
			>
				Join with a code
			</button>
		</div>
	{:else if phase === 'inviting' || phase === 'joining'}
		<div class="flex items-center gap-2 py-1 text-xs text-t-secondary">
			<LoaderCircle size={14} class="animate-spin" style="color: {color}" />
			{phase === 'inviting' ? 'Creating a secure invite…' : 'Preparing your reply…'}
		</div>
	{:else if phase === 'invite-ready'}
		{@render codeBlock(
			'Your invite',
			'Send this to the other device (paste it into AirDrop, Messages, a shared note — anything). When they send a reply code back, paste it below.'
		)}
		<div class="flex flex-col gap-1.5">
			<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase"
				>Their reply</span
			>
			<textarea
				class="h-14 w-full resize-none rounded-md border border-s-border bg-s-glass px-2 py-1.5 font-mono text-[10px] leading-snug text-t-primary outline-none focus:border-s-glass-hover"
				placeholder="Paste the reply code from the other device…"
				bind:value={replyCode}
			></textarea>
			<button
				class="flex h-7 w-fit items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40"
				style="background-color: {color}1a; color: {color}"
				disabled={!replyCode.trim()}
				onclick={() => session.applyReply(replyCode)}
			>
				Connect
			</button>
		</div>
	{:else if phase === 'join-paste'}
		<div class="flex flex-col gap-1.5">
			<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase"
				>Paste the invite</span
			>
			<textarea
				class="h-16 w-full resize-none rounded-md border border-s-border bg-s-glass px-2 py-1.5 font-mono text-[10px] leading-snug text-t-primary outline-none focus:border-s-glass-hover"
				placeholder="Paste the invite code from the other device…"
				bind:value={inviteCode}
			></textarea>
			<button
				class="flex h-7 w-fit items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40"
				style="background-color: {color}1a; color: {color}"
				disabled={!inviteCode.trim()}
				onclick={() => session.acceptInvite(inviteCode)}
			>
				Generate reply
			</button>
		</div>
	{:else if phase === 'answer-ready'}
		{@render codeBlock(
			'Your reply',
			'Send this back to the device that invited you. The moment they paste it, you connect — no button needed here.'
		)}
		<div class="flex items-center gap-2 text-[11px] text-t-muted">
			<LoaderCircle size={12} class="animate-spin" style="color: {color}" />
			Waiting for the other device to connect…
		</div>
	{:else if phase === 'connecting'}
		<div class="flex items-center gap-2 py-1 text-xs text-t-secondary">
			<LoaderCircle size={14} class="animate-spin" style="color: {color}" />
			Connecting… running ICE checks and the DTLS handshake.
		</div>
	{:else if phase === 'connected'}
		<!-- Status line -->
		<div class="flex items-center gap-2">
			<span class="relative flex h-2 w-2">
				<span
					class="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
					style="background-color: {color}"
				></span>
				<span class="relative inline-flex h-2 w-2 rounded-full" style="background-color: {color}"
				></span>
			</span>
			<span class="text-xs font-medium text-t-primary">
				{session.pair?.lan ? 'Connected directly on your network' : 'Connected peer-to-peer'}
			</span>
			<button
				class="ml-auto text-[10px] text-t-muted transition-colors hover:text-t-primary"
				onclick={() => session.close()}
			>
				End
			</button>
		</div>
		{#if session.pair}
			<p class="-mt-1 font-mono text-[10px] text-t-muted">
				{session.pair.remoteAddr}:{session.pair.remotePort} · {session.pair.remoteType}
			</p>
		{/if}

		<!-- Transcript -->
		{#if session.messages.length > 0}
			<div class="flex max-h-40 flex-col gap-1 overflow-y-auto pr-1">
				{#each session.messages as m (m.id)}
					<div class="flex {m.dir === 'out' ? 'justify-end' : 'justify-start'}">
						<span
							class="max-w-[80%] rounded-lg px-2 py-1 text-xs break-words"
							style={m.dir === 'out'
								? `background-color: ${color}1f; color: var(--theme-text-primary);`
								: 'background-color: var(--theme-glass-bg); color: var(--theme-text-secondary);'}
						>
							{m.text}
						</span>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Composer -->
		<div class="flex items-center gap-1.5">
			<input
				class="h-8 flex-1 rounded-md border border-s-border bg-s-glass px-2.5 text-xs text-t-primary outline-none focus:border-s-glass-hover"
				placeholder="Type a message…"
				bind:value={draft}
				onkeydown={onDraftKey}
			/>
			<button
				class="flex h-8 w-8 shrink-0 items-center justify-center rounded-md transition-all hover:brightness-110 disabled:opacity-40"
				style="background-color: {color}1a; color: {color}"
				disabled={!draft.trim()}
				onclick={sendDraft}
				aria-label="Send message"
			>
				<Send size={14} />
			</button>
		</div>
	{:else if phase === 'failed' || phase === 'closed'}
		<p class="text-xs text-t-secondary">
			{phase === 'failed' ? 'The connection could not be established.' : 'Chat ended.'}
		</p>
		<button
			class="flex h-7 w-fit items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
			onclick={() => session.reset()}
		>
			<ArrowLeft size={13} /> Start over
		</button>
	{/if}

	<!-- Error line (shown under any paste step) -->
	{#if session.error && phase !== 'failed'}
		<p class="rounded-md bg-red-500/10 px-2 py-1 text-[11px] text-red-400">{session.error}</p>
	{/if}
</div>
