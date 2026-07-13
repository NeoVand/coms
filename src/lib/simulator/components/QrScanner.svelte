<script lang="ts">
	import { onDestroy } from 'svelte';
	import { loadQrDecoder, type QrDecoder } from '../live/qr';
	import { X } from 'lucide-svelte';

	interface Props {
		/** Called with the decoded text once a QR is read. */
		onResult: (text: string) => void;
		/** Called when the user closes the scanner without a result. */
		onCancel: () => void;
		color: string;
	}

	let { onResult, onCancel, color }: Props = $props();

	let video: HTMLVideoElement;
	let canvas: HTMLCanvasElement;
	let error = $state<string | null>(null);
	let stream: MediaStream | null = null;
	let raf = 0;
	let decoder: QrDecoder | null = null;
	let done = false;

	// Attachment: kick off the (async) camera start once the <video> is mounted.
	function attachCamera(node: HTMLVideoElement) {
		void start(node);
	}

	async function start(el: HTMLVideoElement) {
		video = el;
		try {
			decoder = await loadQrDecoder();
			stream = await navigator.mediaDevices.getUserMedia({
				video: { facingMode: 'environment' },
				audio: false
			});
			video.srcObject = stream;
			await video.play();
			raf = requestAnimationFrame(scan);
		} catch (err) {
			const name = (err as Error).name;
			error =
				name === 'NotAllowedError'
					? 'Camera access was blocked. Allow it, or paste the code instead.'
					: name === 'NotFoundError'
						? 'No camera found. Paste the code instead.'
						: 'Could not open the camera. Paste the code instead.';
		}
	}

	function scan() {
		if (done || !video || !decoder) return;
		if (video.readyState === video.HAVE_ENOUGH_DATA) {
			const w = video.videoWidth;
			const h = video.videoHeight;
			if (w && h) {
				canvas.width = w;
				canvas.height = h;
				const ctx = canvas.getContext('2d', { willReadFrequently: true });
				if (ctx) {
					ctx.drawImage(video, 0, 0, w, h);
					const img = ctx.getImageData(0, 0, w, h);
					const found = decoder(img.data, w, h);
					if (found?.data) {
						done = true;
						stop();
						onResult(found.data);
						return;
					}
				}
			}
		}
		raf = requestAnimationFrame(scan);
	}

	function stop() {
		cancelAnimationFrame(raf);
		stream?.getTracks().forEach((t) => t.stop());
		stream = null;
	}

	function cancel() {
		stop();
		onCancel();
	}

	onDestroy(stop);
</script>

<div class="flex flex-col gap-1.5">
	<div class="flex items-center justify-between">
		<span class="text-[10px] font-semibold tracking-wider text-t-muted uppercase">Scan the QR</span>
		<button
			class="flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium text-t-secondary transition-colors hover:bg-s-glass-hover hover:text-t-primary"
			onclick={cancel}
		>
			<X size={11} /> Cancel
		</button>
	</div>
	{#if error}
		<p class="rounded-md bg-red-500/10 px-2 py-1 text-[11px] text-red-400">{error}</p>
	{:else}
		<div
			class="relative aspect-square w-full max-w-[240px] overflow-hidden rounded-lg border border-s-border bg-black"
		>
			<video {@attach attachCamera} class="h-full w-full object-cover" playsinline muted></video>
			<!-- Framing reticle -->
			<div
				class="pointer-events-none absolute inset-[14%] rounded-lg border-2"
				style="border-color: {color}"
			></div>
		</div>
		<p class="text-[11px] text-t-muted">Point the camera at the other device's QR code.</p>
	{/if}
	<canvas bind:this={canvas} class="hidden"></canvas>
</div>
