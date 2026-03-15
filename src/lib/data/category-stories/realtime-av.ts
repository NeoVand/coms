import type { CategoryStory } from './types';

export const realtimeAvStory: CategoryStory = {
	categoryId: 'realtime-av',
	tagline: 'Making distance disappear \u2014 the protocols behind every video call',
	sections: [
		{
			type: 'narrative',
			title: 'The Dream of Real-Time',
			text: `In 1973, on the ARPANET \u2014 the same network that would become the internet \u2014 researchers at the Lincoln Laboratory transmitted real-time voice using the Network Voice Protocol. The audio was choppy, the latency unpredictable, but it proved something: the packet-switched network could carry more than just data. The dream of real-time communication over the internet had begun.\n\nThe challenge was fundamental: voice and video tolerate delay very poorly but tolerate loss surprisingly well. A dropped video frame is invisible; a 200ms delay makes conversation awkward. This is the opposite of file transfer, where every byte matters but timing doesn't. The real-time protocols in this category all solve the same problem: deliver media fast, even if some of it doesn't make it. [[rtp]] and [[udp]] are the foundation of this approach.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/AT%26T_Picturephone_%2812721549765%29.jpg/600px-AT%26T_Picturephone_%2812721549765%29.jpg',
			alt: 'The AT&T Picturephone, an early commercial videophone system from the 1960s-70s',
			caption:
				"AT&T's Picturephone — decades before WebRTC, the dream of seeing the person you're talking to drove decades of protocol innovation, from analog circuits to packet-switched networks.",
			credit: 'Photo: Mike Mozart / CC BY 2.0, via Wikimedia Commons'
		},
		{
			type: 'pioneers',
			title: 'The Real-Time Pioneers',
			people: [
				{
					name: 'Henning Schulzrinne',
					years: 'c. 1962\u2013',
					title: 'Co-creator of RTP and SIP',
					org: 'Columbia University / AT&T Bell Labs',
					contribution:
						'The most central figure in internet real-time communication. Co-created both RTP and SIP, and later served as FCC Chief Technology Officer.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d2/SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg/330px-SIPNOC_2012_-_FCC_CTO_Henning_Schulzrinne_%287838924022%29.jpg'
				},
				{
					name: 'Van Jacobson',
					years: '1950\u2013',
					title: 'Co-creator of RTP',
					org: 'Lawrence Berkeley National Lab',
					contribution:
						'Co-created RTP and invented the TCP congestion control algorithms that prevented the internet from collapsing. A foundational networking researcher.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Van_Jacobson.jpg/330px-Van_Jacobson.jpg'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1973,
					title: 'Network Voice Protocol on ARPANET',
					description:
						'First real-time voice transmission over a packet network. Choppy and experimental, but a proof of concept for everything to come.'
				},
				{
					year: 1992,
					title: 'The MBone Era',
					description:
						'Multicast Backbone experiments enable internet audio/video conferences. Researchers build tools like vat and vic.'
				},
				{
					year: 1996,
					title: 'RTP Published \u2014 RFC 1889',
					description:
						'The Real-time Transport Protocol defines how to carry audio and video over IP networks. Timestamps, sequence numbers, payload identification.',
					protocolId: 'rtp'
				},
				{
					year: 1996,
					title: 'H.323 Approved by ITU-T',
					description:
						'The telecom world\u2019s answer to internet telephony. Complex, powerful, and deeply rooted in traditional telephony thinking.'
				},
				{
					year: 1998,
					title: 'SDP Published — RFC 2327',
					description:
						'The Session Description Protocol defines how endpoints describe their media capabilities — codecs, addresses, ports. The essential handshake before any call begins.',
					protocolId: 'sdp'
				},
				{
					year: 1999,
					title: 'SIP Published \u2014 RFC 2543',
					description:
						'The Session Initiation Protocol takes an HTTP-inspired approach to call signaling. Text-based, extensible, and easier to debug than H.323.',
					protocolId: 'sip'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The VoIP Standards War',
			text: `The late 1990s saw a battle between two fundamentally different visions for internet telephony. H.323, backed by the ITU-T (the telecom standards body), brought the full complexity of the telephone network to IP. It worked, but it was enormous \u2014 hundreds of pages of specifications, binary encoding, and tight coupling between components.\n\n[[sip]] took the opposite approach. Designed by Henning Schulzrinne, Mark Handley, and Eve Schooler, SIP was modeled on [[http1]] \u2014 text-based, simple headers, stateless by default. Want to make a call? Send an INVITE. Want to hang up? Send a BYE. The protocol was so simple that you could debug it by reading the packets.\n\nSIP won. Not because it was technically superior in every way, but because it was easier to understand, implement, and extend. The HTTP-inspired design meant web developers could grasp it quickly, and the loose coupling between signaling ([[sip]]), session description ([[sdp]]), and media transport ([[rtp]]) allowed each to evolve independently.`
		},
		{
			type: 'pioneers',
			title: 'The Signaling Architects',
			people: [
				{
					name: 'Mark Handley',
					years: '1965\u2013',
					title: 'Co-creator of SIP',
					org: 'University College London',
					contribution:
						'Brought internet architecture thinking to multimedia signaling. Co-created SIP and SDP, the protocol pair that handles call setup across the internet.'
				},
				{
					name: 'Eve Schooler',
					years: '',
					title: 'Co-creator of SIP',
					org: 'Caltech / ISI / Intel',
					contribution:
						'Pioneer of internet multimedia conferencing and co-creator of SIP. Her research on multicast conferences laid groundwork for modern video calling.'
				},
				{
					name: 'Jonathan Rosenberg',
					years: '',
					title: 'SIP Ecosystem Architect',
					org: 'dynamicsoft / Cisco / Five9',
					contribution:
						'Designed critical SIP infrastructure: STUN, TURN, and ICE for NAT traversal, plus SRTP for encrypting media streams.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 2002,
					title: 'RTMP Created at Macromedia',
					description:
						'The Real-Time Messaging Protocol powers Flash-based streaming. For a decade, RTMP is the dominant way to deliver live video on the web.',
					protocolId: 'rtmp'
				},
				{
					year: 2003,
					title: 'Skype Launches',
					description:
						'Peer-to-peer VoIP goes mainstream. Skype proves massive consumer demand for internet voice and video calling.'
				},
				{
					year: 2009,
					title: 'HLS Announced by Apple',
					description:
						'HTTP Live Streaming reinvents media delivery. Instead of specialized streaming servers, use ordinary HTTP and CDNs.',
					protocolId: 'hls'
				},
				{
					year: 2010,
					title: 'Google Acquires GIPS for $68.2M',
					description:
						'Global IP Solutions makes the audio/video codecs that will become WebRTC\u2019s core. Google open-sources them.',
					protocolId: 'webrtc'
				},
				{
					year: 2011,
					title: 'WebRTC Announced at Google I/O',
					description:
						'Real-time audio, video, and data \u2014 directly in the browser, with no plugins. A paradigm shift for web communication.',
					protocolId: 'webrtc'
				},
				{
					year: 2012,
					title: 'MPEG-DASH Published',
					description:
						"The open standard alternative to Apple's HLS. DASH uses the same adaptive bitrate principle but with codec flexibility and industry-wide backing.",
					protocolId: 'dash'
				},
				{
					year: 2017,
					title: 'Safari Adds WebRTC Support',
					description:
						'With Apple\u2019s browser on board, WebRTC reaches all major platforms. Browser-native real-time communication is universal.',
					protocolId: 'webrtc'
				},
				{
					year: 2020,
					title: 'COVID-19 and the Video Calling Explosion',
					description:
						'Global lockdowns drive unprecedented adoption of video conferencing. WebRTC traffic multiplies overnight.'
				},
				{
					year: 2021,
					title: 'WebRTC 1.0 \u2014 W3C Recommendation',
					description: 'After a decade of development, WebRTC reaches official standard status.',
					protocolId: 'webrtc'
				}
			]
		},
		{
			type: 'narrative',
			title: 'WebRTC \u2014 The Browser Revolution',
			text: `In 2010, Google made a $68.2 million bet on real-time communication. They acquired Global IP Solutions (GIPS), a Swedish company whose audio and video codecs powered Skype and dozens of other VoIP applications. Then they did something remarkable: they open-sourced everything and began building it into Chrome.\n\n[[webrtc]] didn't invent new protocols \u2014 it combined existing ones. [[rtp]] for media transport, SRTP for encryption, ICE/STUN/TURN for NAT traversal, [[sdp]] for session negotiation, and [[sctp]] for data channels. The genius was packaging all of this into a browser API that any web developer could use. No plugins, no installs, no special servers. Just JavaScript.\n\nJustin Uberti and Harald Alvestrand led the effort, navigating both the W3C (for the browser API) and the IETF (for the underlying protocols). The result was a platform that powers everything from Google Meet to telehealth appointments.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Polycom_VSX_7000_with_2_video_conferencing_screens.JPG/600px-Polycom_VSX_7000_with_2_video_conferencing_screens.JPG',
			alt: 'A Polycom VSX 7000 video conferencing system with dual screens, representing dedicated video conferencing hardware',
			caption:
				'Dedicated video conferencing hardware like the Polycom VSX 7000 — expensive, specialized equipment that WebRTC would eventually replace with a browser tab and a webcam.',
			credit: 'Photo: BrokenSphere / CC BY-SA 3.0, via Wikimedia Commons'
		},
		{
			type: 'diagram',
			definition: `graph TD
  A["JavaScript API\n(getUserMedia, RTCPeerConnection)"] --> B[SDP \u2014 session negotiation]
  A --> C[ICE / STUN / TURN \u2014 NAT traversal]
  C --> D[DTLS \u2014 key exchange]
  D --> E[SRTP \u2014 encrypted audio & video]
  D --> F[SCTP \u2014 data channels]
  E --> G[UDP]
  F --> G`,
			caption:
				"WebRTC didn't invent new protocols \u2014 it orchestrated existing ones into a browser API."
		},
		{
			type: 'pioneers',
			title: 'The WebRTC Architects',
			people: [
				{
					name: 'Justin Uberti',
					years: '',
					title: 'WebRTC Technical Lead',
					org: 'Google',
					contribution:
						'Led the technical development of WebRTC at Google. Drove the integration of real-time communication directly into web browsers.'
				},
				{
					name: 'Harald Alvestrand',
					years: '1960\u2013',
					title: 'WebRTC Standardization Lead',
					org: 'Google / IETF',
					contribution:
						'Led WebRTC standardization across both the W3C and IETF. Former IETF Chair, bringing deep standards expertise to the effort.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Harald_Tveit_Alvestrand.jpg/330px-Harald_Tveit_Alvestrand.jpg'
				},
				{
					name: 'Roger Pantos',
					years: '',
					title: 'Creator of HLS',
					org: 'Apple',
					contribution:
						'Designed HTTP Live Streaming, which reimagined media delivery by using standard HTTP and CDN infrastructure instead of specialized streaming servers.'
				}
			]
		},
		{
			type: 'callout',
			title: 'Adaptive Streaming',
			text: '[[hls|HLS]] transformed video delivery with a simple insight: chop a video into small HTTP-downloadable segments at multiple quality levels, and let the client switch qualities based on network conditions. No special servers needed \u2014 just a standard web server and CDN. Where [[rtmp]] once required Flash and specialized servers, today [[hls|HLS]] and [[dash|DASH]] deliver the majority of the world\u2019s streaming video, from Netflix to live sports.'
		}
	]
};
