import type { Protocol } from '../types';
import { ethernet } from './ethernet';
import { wifi } from './wifi';
import { arp } from './arp';
import { ip } from './ip';
import { ipv6 } from './ipv6';
import { tcp } from './tcp';
import { udp } from './udp';
import { quic } from './quic';
import { sctp } from './sctp';
import { mptcp } from './mptcp';
import { http1 } from './http1';
import { http2 } from './http2';
import { http3 } from './http3';
import { websockets } from './websockets';
import { grpc } from './grpc';
import { graphql } from './graphql';
import { sse } from './sse';
import { rest } from './rest';
import { mcp } from './mcp';
import { a2a } from './a2a';
import { jsonRpc } from './json-rpc';
import { soap } from './soap';
import { mqtt } from './mqtt';
import { amqp } from './amqp';
import { coap } from './coap';
import { stomp } from './stomp';
import { xmpp } from './xmpp';
import { kafka } from './kafka';
import { webrtc } from './webrtc';
import { rtp } from './rtp';
import { sip } from './sip';
import { hls } from './hls';
import { rtmp } from './rtmp';
import { sdp } from './sdp';
import { dash } from './dash';
import { tls } from './tls';
import { ssh } from './ssh';
import { dns } from './dns';
import { dhcp } from './dhcp';
import { ntp } from './ntp';
import { smtp } from './smtp';
import { ftp } from './ftp';
import { imap } from './imap';
import { bgp } from './bgp';
import { icmp } from './icmp';
import { oauth2 } from './oauth2';

export const networkFoundationsProtocols: Protocol[] = [ethernet, wifi, arp, ip, ipv6];
export const transportProtocols: Protocol[] = [tcp, udp, quic, sctp, mptcp];
export const webApiProtocols: Protocol[] = [
	http1,
	http2,
	http3,
	websockets,
	grpc,
	graphql,
	sse,
	rest,
	mcp,
	a2a,
	jsonRpc,
	soap
];
export const asyncIotProtocols: Protocol[] = [mqtt, amqp, coap, stomp, xmpp, kafka];
export const realtimeAvProtocols: Protocol[] = [webrtc, rtp, sip, hls, rtmp, sdp, dash];
export const utilitiesProtocols: Protocol[] = [
	tls,
	ssh,
	dns,
	dhcp,
	ntp,
	smtp,
	ftp,
	imap,
	bgp,
	icmp,
	oauth2
];

export const allProtocols: Protocol[] = [
	...networkFoundationsProtocols,
	...transportProtocols,
	...webApiProtocols,
	...asyncIotProtocols,
	...realtimeAvProtocols,
	...utilitiesProtocols
];
