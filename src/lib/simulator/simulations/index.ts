import type { SimulationConfig } from '../types';
import { tcpHandshake } from './tcp-handshake';
import { dnsResolution } from './dns-resolution';
import { httpRequest } from './http-request';
import { udpDatagram } from './udp-datagram';
import { tlsHandshake } from './tls-handshake';
import { http2Multiplexing } from './http2-multiplexing';
import { http3Quic } from './http3-quic';
import { websocketConnection } from './websocket';
import { grpcCall } from './grpc-call';
import { sshConnection } from './ssh-connection';
import { restApi } from './rest-api';
import { webrtcPeer } from './webrtc-peer';
import { mqttPubSub } from './mqtt-pubsub';
import { smtpDelivery } from './smtp-delivery';
import { ftpTransfer } from './ftp-transfer';
import { dhcpDora } from './dhcp-dora';
import { graphqlOperation } from './graphql-operation';
import { sseStream } from './sse-stream';
import { ntpSync } from './ntp-sync';
import { amqpMessaging } from './amqp-messaging';
import { quicConnection } from './quic-connection';
import { kafkaEvents } from './kafka-events';
import { coapRequest } from './coap-request';
import { xmppMessaging } from './xmpp-messaging';
import { stompSubscription } from './stomp-subscription';
import { rtpMedia } from './rtp-media';
import { sipCall } from './sip-call';
import { hlsStreaming } from './hls-streaming';
import { rtmpPublish } from './rtmp-publish';
import { sdpNegotiation } from './sdp-negotiation';
import { dashStreaming } from './dash-streaming';
import { sctpAssociation } from './sctp-association';
import { mptcpMultipath } from './mptcp-multipath';
import { imapSession } from './imap-session';
import { bgpPeering } from './bgp-peering';
import { icmpPing } from './icmp-ping';

const simulations = new Map<string, SimulationConfig>([
	['tcp', tcpHandshake],
	['dns', dnsResolution],
	['http1', httpRequest],
	['udp', udpDatagram],
	['tls', tlsHandshake],
	['http2', http2Multiplexing],
	['http3', http3Quic],
	['websockets', websocketConnection],
	['grpc', grpcCall],
	['ssh', sshConnection],
	['rest', restApi],
	['webrtc', webrtcPeer],
	['mqtt', mqttPubSub],
	['smtp', smtpDelivery],
	['ftp', ftpTransfer],
	['dhcp', dhcpDora],
	['graphql', graphqlOperation],
	['sse', sseStream],
	['ntp', ntpSync],
	['amqp', amqpMessaging],
	['quic', quicConnection],
	['kafka', kafkaEvents],
	['coap', coapRequest],
	['xmpp', xmppMessaging],
	['stomp', stompSubscription],
	['rtp', rtpMedia],
	['sip', sipCall],
	['hls', hlsStreaming],
	['rtmp', rtmpPublish],
	['sdp', sdpNegotiation],
	['dash', dashStreaming],
	['sctp', sctpAssociation],
	['mptcp', mptcpMultipath],
	['imap', imapSession],
	['bgp', bgpPeering],
	['icmp', icmpPing]
]);

export function getSimulation(protocolId: string): SimulationConfig | undefined {
	return simulations.get(protocolId);
}

export function hasSimulation(protocolId: string): boolean {
	return simulations.has(protocolId);
}
