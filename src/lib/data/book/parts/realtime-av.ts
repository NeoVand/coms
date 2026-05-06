/**
 * Part VII — Real-time A/V.
 *
 * Protocols that prioritise low latency over perfect delivery —
 * voice, video, and live media.
 */

import type { BookPart } from '../types';

export const realtimeAv: BookPart = {
	id: 'realtime-av',
	title: 'Real-time A/V',
	label: 'VII',
	description: 'Protocols that prioritise low latency over perfect delivery — voice, video, and live media.',
	chapters: [
		{
			id: 'rtp-and-rtcp',
			title: 'RTP and RTCP',
			synopsis: 'Carrying media on top of UDP.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'A Datagram Per Frame, A Timestamp Per Packet',
							text: `[[rtp|RTP]] (Real-time Transport Protocol, RFC 3550, 1996) is the protocol that runs underneath every voice call, video conference, and broadcast media stream on the internet. It rides on top of [[udp|UDP]] because **late audio is worse than missing audio** — retransmitting a packet that arrives 200 ms late just delivers something the receiver cannot use. RTP adds three things to a UDP datagram: a **sequence number** so the receiver can detect loss and reorder packets, a **timestamp** so playback can be correctly paced, and a **payload type** field that names the codec.

The companion **RTCP** (RTP Control Protocol) flows alongside, carrying receiver reports (loss rates, jitter), sender reports (mapping wall-clock time to RTP timestamps for cross-stream sync), and source descriptions (CNAME, the canonical participant identifier). RTCP is what lets a video conferencing client detect that 8% of audio packets are being dropped and adapt the codec down.

RTP is intentionally vague about how the actual session is set up — that is left to a signalling protocol like [[sip|SIP]] or [[webrtc|WebRTC]]'s SDP exchange. This separation, which felt clumsy in the 1990s, turned out to be the right call: dozens of session protocols emerged, but they all run RTP underneath. WebRTC, Zoom, FaceTime, Teams, and most VoIP systems use it.`
						}
					]
				},
				{ kind: 'protocol', id: 'rtp' },
				{ kind: 'simulation', protocolId: 'rtp' }
			]
		},
		{
			id: 'webrtc',
			title: 'WebRTC',
			synopsis: 'Peer-to-peer in the browser, ICE/STUN/TURN, DTLS, SRTP.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Real-time Media in a Web Tab',
							text: `[[webrtc|WebRTC]] is a peer-to-peer media stack the W3C standardised between 2011 and 2021. The premise was audacious: enable a web page, in a sandboxed browser tab, to capture audio and video from a user's microphone and camera and stream them directly to another browser — without a plugin, without a server in the media path, with sub-200 ms latency.

The hard part is **NAT traversal**. Two browsers behind home routers cannot just open a connection to each other; their public-facing addresses are different from their private ones. WebRTC uses **ICE** (Interactive Connectivity Establishment, RFC 8445) — a coordinated dance where each peer gathers candidate addresses from STUN servers (RFC 8489), sends them to the other peer via a signalling channel (the developer's choice — often WebSocket), and probes connectivity over each candidate pair. When direct UDP fails, **TURN** (RFC 8656) relays through a third party.

The media itself is [[rtp|RTP]] wrapped in **SRTP** (Secure RTP, RFC 3711), with keys established through **DTLS** (Datagram TLS) over the same connection. WebRTC also offers **DataChannel** for arbitrary application data, also over DTLS, also over the same connection — useful for in-game state sync alongside voice chat.

Google Meet, Discord, Slack huddles, and most newer collaboration tools are built on WebRTC. The protocol is also the basis for [[frontier:moq-transport|MoQ Transport]], the next-generation live streaming standard.`
						}
					]
				},
				{ kind: 'protocol', id: 'webrtc' },
				{ kind: 'simulation', protocolId: 'webrtc' }
			]
		},
		{
			id: 'sip-and-sdp',
			title: 'SIP and SDP',
			synopsis: 'Negotiating who speaks what codec on which IP.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Phone Call as an HTTP Conversation',
							text: `When you place a VoIP call, two protocols work in tandem before any audio flows. **SIP** (Session Initiation Protocol, RFC 3261, 2002) is the signalling layer — text-based, request/response shaped like [[http1|HTTP]], with verbs like INVITE, ACK, BYE, REGISTER. SIP locates the callee (through registration servers and proxies that resolve sip:alice@example.com), negotiates capability, and sets up or tears down the session.

**[[sdp|SDP]]** (Session Description Protocol, RFC 8866) carries the actual session parameters inside SIP messages: which codecs each side supports, what ports they will use for [[rtp|RTP]], what crypto keys they propose. The SDP "offer/answer" exchange — one side offers their capability, the other answers with the subset they accept — became the standard pattern for media negotiation everywhere, including [[webrtc|WebRTC]].

SIP and SDP are the engine room behind enterprise voice (Cisco, Avaya, Microsoft Teams Phone), behind LTE/5G voice (VoLTE), behind every modern PBX. They look antiquated next to the WebRTC-friendly future, but they are the protocols that actually carry the world's phone calls today.`
						}
					]
				},
				{ kind: 'protocol', id: 'sip' },
				{ kind: 'protocol', id: 'sdp' }
			]
		},
		{
			id: 'hls-and-dash',
			title: 'HLS and DASH',
			synopsis: 'Adaptive bitrate streaming over plain HTTP.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'Streaming Without Streaming Servers',
							text: `Until 2008, live video streaming required specialised streaming servers and protocols ([[rtmp|RTMP]], MMS, RTSP) — separate infrastructure from the web servers that delivered everything else. Apple changed that with **[[hls|HLS]]** (HTTP Live Streaming, originally RFC 8216, now RFC 8216bis), shipped with the iPhone 3.0 in 2009.

The trick was breaking the stream into **2-10 second segments**, each a regular .ts (or .mp4) file accessible via plain [[http1|HTTP]]. A small **playlist** file (.m3u8) lists the segments in order. The client downloads the playlist, fetches segments, and plays them. To support multiple bitrates, the server publishes multiple parallel playlists (240p, 480p, 1080p, 4K) and a master playlist pointing at all of them; the client switches bitrates between segments based on observed bandwidth.

The genius is that HTTP servers and CDNs already exist at planetary scale, and they cache files perfectly. HLS turns a live broadcast into a few thousand small files that ride your existing web infrastructure for free.

**MPEG-DASH** (ISO/IEC 23009-1, 2012) is the IETF/MPEG-standardised version of the same idea — the differences are codec restrictions and manifest format. Netflix, YouTube, Twitch, Apple, Google, and Disney+ all use HLS or DASH. The latency cost is significant — 10-30 seconds end-to-end is typical because of the segment buffering — which is what [[frontier:moq-transport|MoQ Transport]] aims to fix for live use cases.`
						}
					]
				},
				{ kind: 'protocol', id: 'hls' },
				{ kind: 'protocol', id: 'dash' },
				{
					kind: 'comparison',
					pairIds: ['hls', 'dash']
				}
			]
		},
		{
			id: 'moq-transport',
			title: 'MoQ Transport',
			synopsis: 'Sub-second live streaming over QUIC.',
			slots: [
				{
					kind: 'prose',
					sections: [
						{
							type: 'narrative',
							title: 'The Future of Live Media',
							text: `[[hls|HLS]] and [[dash|DASH]] traded latency for compatibility with the web. For sports, gaming streams, auctions, and interactive broadcasting, that 10-30 second end-to-end delay is intolerable — viewers see the goal scored on Twitter before they see it on their TV. Decade-old solutions (RTMP for ingest, low-latency HLS, custom WebRTC-based stacks) each solved part of the problem.

**MoQ Transport** (Media over QUIC, IETF working group active 2023–2026) is the convergence. It builds on [[quic|QUIC]] streams as the primitive, with native support for **late join** (a viewer connecting mid-stream can immediately get the latest media without waiting for the next keyframe), **prioritisation** (audio over video over chat), and **fan-out** through a tree of caches that look more like CDNs than RTMP relays.

The target latency is **sub-second end-to-end** for scale that matches HLS — millions of concurrent viewers — while keeping the operational model of "files on a CDN." If it ships well, it replaces both HLS for live and the custom protocols broadcasters built on top of [[webrtc|WebRTC]].

[[frontier:moq-transport|MoQ Transport]] is one of the most-watched IETF efforts in the live-media space. As of 2026 it is still in active design but several large platforms (Twitch, Cisco Webex, Cloudflare Stream) are running interoperability events.`
						}
					]
				},
				{ kind: 'frontier', id: 'moq-transport' },
				{ kind: 'protocol', id: 'quic' }
			]
		}
	]
};
