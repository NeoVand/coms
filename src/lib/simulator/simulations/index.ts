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
	['webrtc', webrtcPeer]
]);

export function getSimulation(protocolId: string): SimulationConfig | undefined {
	return simulations.get(protocolId);
}

export function hasSimulation(protocolId: string): boolean {
	return simulations.has(protocolId);
}
