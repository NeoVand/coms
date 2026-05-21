import type { Protocol } from '../types';

export const sip: Protocol = {
	id: 'sip',
	name: 'Session Initiation Protocol',
	abbreviation: 'SIP',
	categoryId: 'realtime-av',
	port: 5060,
	year: 1999,
	rfc: 'RFC 3261',
	oneLiner: 'The "dialing" protocol for {{voip|VoIP}} — establishes, modifies, and tears down calls.',
	overview: `[[sip|SIP]] is the {{signaling|signaling}} {{protocol|protocol}} that makes {{voip|VoIP}} calls happen. It doesn't carry the actual audio or video (that's [[rtp|RTP]]'s job). Instead, [[sip|SIP]] handles the "control plane": inviting someone to a call, ringing, answering, putting on hold, transferring, and hanging up.

[[sip|SIP]]'s design was inspired by [[http1|HTTP]] — it uses text-based {{request-response|request/response}} messages with methods like {{sip-invite|INVITE}}, {{ack|ACK}}, BYE, and REGISTER. URIs identify users (sip:alice@example.com). This [[http1|HTTP]]-like design made it easier to implement and debug compared to the ITU's H.323 alternative.

[[sip|SIP]] is the backbone of virtually every modern phone system: enterprise PBX systems, {{voip|VoIP}} carriers (like Twilio), and telecom infrastructure. When you make a phone call today, [[sip|SIP]] is almost certainly involved somewhere in the chain.`,
	howItWorks: [
		{
			title: 'REGISTER',
			description:
				'Phone/softphone registers with a [[sip|SIP]] server, telling it "I\'m alice@example.com and I\'m reachable at this [[ip|IP]]." This is like logging in.'
		},
		{
			title: 'INVITE',
			description:
				'Caller sends {{sip-invite|INVITE}} to the [[sip|SIP]] server with an [[sdp|SDP]] body describing desired media (audio/video codecs, ports). Server routes it to the callee.'
		},
		{
			title: '200 OK + ACK',
			description:
				'Callee accepts with 200 OK (including their [[sdp|SDP]]). Caller confirms with {{ack|ACK}}. [[rtp|RTP]] media streams are now established between the peers.'
		},
		{
			title: 'BYE',
			description:
				'Either party sends BYE to end the call. The other responds 200 OK. [[rtp|RTP]] streams stop. Simple and clean.'
		}
	],
	useCases: [
		'Enterprise phone systems (PBX)',
		'VoIP service providers (Twilio, Vonage)',
		'Video conferencing initiation',
		'Instant messaging ([[sip|SIP]] SIMPLE)',
		'Emergency call routing (E911)'
	],
	codeExample: {
		language: 'python',
		code: `import pjsua2 as pj

# Initialize PJSIP endpoint
ep = pj.Endpoint()
ep.libCreate()

cfg = pj.EpConfig()
ep.libInit(cfg)

# Add a SIP transport
tcfg = pj.TransportConfig()
tcfg.port = 5060
ep.transportCreate(pj.PJSIP_TRANSPORT_UDP, tcfg)
ep.libStart()

# Register with a SIP server
acfg = pj.AccountConfig()
acfg.idUri = "sip:alice@example.com"
acfg.regConfig.registrarUri = "sip:example.com"
acfg.sipConfig.authCreds.append(
    pj.AuthCredInfo("digest", "*", "alice", 0, "secret"))

account = pj.Account()
account.create(acfg)  # Sends SIP REGISTER`,
		caption: 'PJSIP registers with a [[sip|SIP]] server — the {{sip-invite|INVITE}}/200 OK/{{ack|ACK}} flow handles call setup',
		alternatives: [
			{
				language: 'javascript',
				code: `import { UserAgent, Inviter } from 'sip.js';

const ua = new UserAgent({
  uri: 'sip:alice@example.com',
  transportOptions: {
    server: 'wss://sip.example.com:8443/ws'
  },
  authorizationUsername: 'alice',
  authorizationPassword: 'secret'
});

await ua.start();  // Sends SIP REGISTER

// Make a call (sends SIP INVITE)
const target = UserAgent.makeURI('sip:bob@example.com');
const inviter = new Inviter(ua, target);

inviter.invite();
inviter.stateChange.addListener((state) => {
  console.log('Call state:', state);
});`
			},
			{
				language: 'cli',
				code: `# Make a SIP call with pjsua CLI
pjsua --registrar sip:example.com \\
  --id sip:alice@example.com \\
  --realm "*" --username alice --password secret

# Test SIP connectivity
sipsak -vv -s sip:bob@example.com

# Capture SIP traffic
sudo tcpdump -i any -A port 5060

# Send a SIP OPTIONS ping
sipsak -T -s sip:example.com`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'INVITE Request',
						code: `INVITE sip:bob@example.com SIP/2.0
Via: SIP/2.0/UDP 10.0.0.1:5060;branch=z9hG4bK776
Max-Forwards: 70
From: "Alice" <sip:alice@example.com>;tag=1928301774
To: "Bob" <sip:bob@example.com>
Call-ID: a84b4c76e66710@10.0.0.1
CSeq: 314159 INVITE
Contact: <sip:alice@10.0.0.1:5060>
Content-Type: application/sdp
Content-Length: 147

v=0
o=alice 53655765 2353687637 IN IP4 10.0.0.1
s=Session
c=IN IP4 10.0.0.1
t=0 0
m=audio 49170 RTP/AVP 0 8 97
a=rtpmap:0 PCMU/8000
a=rtpmap:97 opus/48000/2`
					},
					{
						title: '200 OK Response',
						code: `SIP/2.0 200 OK
Via: SIP/2.0/UDP 10.0.0.1:5060;branch=z9hG4bK776
From: "Alice" <sip:alice@example.com>;tag=1928301774
To: "Bob" <sip:bob@example.com>;tag=3948572
Call-ID: a84b4c76e66710@10.0.0.1
CSeq: 314159 INVITE
Contact: <sip:bob@10.0.0.2:5060>
Content-Type: application/sdp
Content-Length: 134

v=0
o=bob 2890844527 2890844527 IN IP4 10.0.0.2
s=Session
c=IN IP4 10.0.0.2
t=0 0
m=audio 3456 RTP/AVP 0 97
a=rtpmap:0 PCMU/8000
a=rtpmap:97 opus/48000/2`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Call setup: 1-3 seconds (INVITE → 200 OK → ACK + RTP establishment)',
		throughput: 'SIP messages are small text; the media (RTP) carries the bandwidth load',
		overhead: 'Text-based headers like HTTP; typically 500-1000 bytes per SIP message'
	},
	connections: ['udp', 'tcp', 'tls', 'rtp', 'webrtc', 'sdp', 'nat-traversal'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Session_Initiation_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc3261'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/SIP_session_setup_example.svg/500px-SIP_session_setup_example.svg.png',
		alt: 'Sequence diagram of a SIP session setup showing INVITE, 100 Trying, 180 Ringing, 200 OK, and ACK messages between caller, proxy, and callee',
		caption:
			'A [[sip|SIP]] session setup — the {{sip-invite|INVITE}} starts a call, proxies route it, the callee rings (180) then answers (200 OK), and the caller acknowledges. After this {{signaling|signaling}} dance, [[rtp|RTP]] media flows directly between the endpoints.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
