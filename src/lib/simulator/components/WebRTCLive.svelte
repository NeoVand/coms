<script lang="ts">
	import type { WebRTCSession } from '../live/webrtc.svelte';
	import { encodeQrSvg } from '../live/qr';
	import QrScanner from './QrScanner.svelte';
	import {
		Radio,
		Copy,
		Check,
		LoaderCircle,
		ArrowLeft,
		Send,
		QrCode,
		ScanLine,
		Video,
		VideoOff,
		Mic,
		MicOff,
		PhoneOff
	} from 'lucide-svelte';

	// Attachment factory: bind a MediaStream to a <video> (srcObject has no HTML
	// attribute). Re-runs whenever the passed stream changes.
	function bindStream(stream: MediaStream | null) {
		return (node: HTMLVideoElement) => {
			node.srcObject = stream;
		};
	}

	interface Props {
		session: WebRTCSession;
		color: string;
	}

	let { session, color }: Props = $props();

	let replyCode = $state(''); // initiator pastes the joiner's reply here
	let inviteCode = $state(''); // joiner pastes the initiator's invite here
	let draft = $state(''); // outgoing chat message
	let copied = $state(false);
	let showQr = $state(false); // reveal the QR of the local code
	let qrSvg = $state('');
	let scanFor = $state<null | 'invite' | 'reply'>(null); // camera scanner target

	const phase = $derived(session.phase);

	// Render the local code to a QR whenever it (or the toggle) changes.
	$effect(() => {
		const code = session.localCode;
		if (showQr && code) {
			let stale = false;
			encodeQrSvg(code).then((svg) => {
				if (!stale) qrSvg = svg;
			});
			return () => {
				stale = true;
			};
		}
		qrSvg = '';
	});

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

	function onScanned(code: string) {
		if (scanFor === 'invite') {
			inviteCode = code;
			session.acceptInvite(code);
		} else if (scanFor === 'reply') {
			replyCode = code;
			session.applyReply(code);
		}
		scanFor = null;
	}
</script>

{#snippet codeBlock(codeLabel: string, hint: string)}
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between">
			<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase"
				>{codeLabel}</span
			>
			<div class="flex items-center gap-1">
				<button
					class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-s-glass-hover"
					class:opacity-60={!showQr}
					style="color: {color}"
					aria-pressed={showQr}
					onclick={() => (showQr = !showQr)}
				>
					<QrCode size={11} /> QR
				</button>
				<button
					class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-s-glass-hover"
					style="color: {color}"
					onclick={copyLocal}
				>
					{#if copied}<Check size={11} /> Copied{:else}<Copy size={11} /> Copy{/if}
				</button>
			</div>
		</div>
		{#if showQr}
			<div class="flex justify-center rounded-lg bg-white p-2">
				<div class="w-full max-w-[220px]">
					<!-- eslint-disable-next-line svelte/no-at-html-tags -->
					{@html qrSvg}
				</div>
			</div>
		{/if}
		<textarea
			class="h-16 w-full resize-none rounded-md border border-s-border bg-s-glass px-2 py-1.5 font-mono text-[10px] leading-snug text-t-secondary outline-none"
			readonly
			onclick={(e) => (e.currentTarget as HTMLTextAreaElement).select()}
			value={session.localCode}
		></textarea>
		<p class="text-[11px] leading-relaxed text-t-muted">{hint}</p>
	</div>
{/snippet}

{#snippet pasteField(
	label: string,
	target: 'invite' | 'reply',
	bindGet: () => string,
	bindSet: (v: string) => void,
	action: () => void,
	actionLabel: string
)}
	<div class="flex flex-col gap-1.5">
		<div class="flex items-center justify-between">
			<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase">{label}</span>
			<button
				class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:bg-s-glass-hover"
				style="color: {color}"
				onclick={() => (scanFor = target)}
			>
				<ScanLine size={11} /> Scan QR
			</button>
		</div>
		{#if scanFor === target}
			<QrScanner onResult={onScanned} onCancel={() => (scanFor = null)} {color} />
		{:else}
			<textarea
				class="h-14 w-full resize-none rounded-md border border-s-border bg-s-glass px-2 py-1.5 font-mono text-[10px] leading-snug text-t-primary outline-none focus:border-s-glass-hover"
				placeholder="Paste the {target === 'invite' ? 'invite' : 'reply'} code, or Scan QR…"
				value={bindGet()}
				oninput={(e) => bindSet((e.currentTarget as HTMLTextAreaElement).value)}
			></textarea>
			<button
				class="flex h-7 w-fit items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all hover:brightness-110 disabled:opacity-40"
				style="background-color: {color}1a; color: {color}"
				disabled={!bindGet().trim()}
				onclick={action}
			>
				{actionLabel}
			</button>
		{/if}
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
			'Show the QR to the other device, or send this code (AirDrop, Messages, a shared note). When they reply, scan or paste it below.'
		)}
		{@render pasteField(
			'Their reply',
			'reply',
			() => replyCode,
			(v) => (replyCode = v),
			() => session.applyReply(replyCode),
			'Connect'
		)}
	{:else if phase === 'join-paste'}
		{@render pasteField(
			'Paste or scan the invite',
			'invite',
			() => inviteCode,
			(v) => (inviteCode = v),
			() => session.acceptInvite(inviteCode),
			'Generate reply'
		)}
	{:else if phase === 'answer-ready'}
		{@render codeBlock(
			'Your reply',
			'Show the QR to the device that invited you, or send this code back. The moment they have it, you connect — no button needed here.'
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

		<!-- Call -->
		{#if session.inCall}
			<div class="relative overflow-hidden rounded-lg border border-s-border bg-black">
				{#if session.remoteStream}
					<video
						{@attach bindStream(session.remoteStream)}
						autoplay
						playsinline
						class="aspect-video w-full bg-black object-cover"
					></video>
				{:else}
					<div class="flex aspect-video w-full items-center justify-center">
						<span class="text-[11px] text-t-muted">Waiting for their camera…</span>
					</div>
				{/if}
				{#if session.localStream && session.sendingVideo}
					<video
						{@attach bindStream(session.localStream)}
						autoplay
						playsinline
						muted
						class="absolute right-2 bottom-2 h-16 w-24 -scale-x-100 rounded-md border border-white/20 bg-black object-cover shadow-lg"
					></video>
				{/if}
			</div>
			<!-- Call controls -->
			<div class="flex items-center gap-1.5">
				{#if session.localStream}
					<button
						class="flex h-8 w-8 items-center justify-center rounded-md border border-s-border transition-colors hover:bg-s-glass-hover"
						style={session.micOn ? `color: ${color}` : 'color: var(--theme-text-muted)'}
						onclick={() => session.toggleMic()}
						aria-label={session.micOn ? 'Mute microphone' : 'Unmute microphone'}
					>
						{#if session.micOn}<Mic size={15} />{:else}<MicOff size={15} />{/if}
					</button>
					{#if session.sendingVideo}
						<button
							class="flex h-8 w-8 items-center justify-center rounded-md border border-s-border transition-colors hover:bg-s-glass-hover"
							style={session.camOn ? `color: ${color}` : 'color: var(--theme-text-muted)'}
							onclick={() => session.toggleCam()}
							aria-label={session.camOn ? 'Turn camera off' : 'Turn camera on'}
						>
							{#if session.camOn}<Video size={15} />{:else}<VideoOff size={15} />{/if}
						</button>
					{/if}
					<button
						class="flex h-8 items-center gap-1.5 rounded-md bg-red-500/15 px-2.5 text-xs font-semibold text-red-400 transition-colors hover:bg-red-500/25"
						onclick={() => session.hangUp()}
					>
						<PhoneOff size={14} /> Hang up
					</button>
				{:else}
					<span class="text-[11px] text-t-muted">Incoming media —</span>
					<button
						class="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition-all hover:brightness-110"
						style="background-color: {color}1a; color: {color}"
						onclick={() => session.startCall(true)}
					>
						<Video size={14} /> Turn on my camera
					</button>
				{/if}
			</div>
		{:else}
			<!-- Start a call -->
			<div class="flex items-center gap-2">
				<button
					class="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all hover:brightness-110"
					style="background-color: {color}1a; color: {color}"
					onclick={() => session.startCall(true)}
				>
					<Video size={14} /> Video call
				</button>
				<button
					class="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-medium text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
					onclick={() => session.startCall(false)}
				>
					<Mic size={14} /> Audio only
				</button>
			</div>
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
