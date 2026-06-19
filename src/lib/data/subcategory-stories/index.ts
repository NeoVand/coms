import type { SubcategoryStory } from './types';
// Network Foundations
import { linkLayerStory } from './link-layer';
import { internetLayerStory } from './internet-layer';
import { routingStory } from './routing';
import { namingStory } from './naming';
// Transport
import { reliableStreamsStory } from './reliable-streams';
import { datagramTransportStory } from './datagram-transport';
// Web / API
import { httpVersionsStory } from './http-versions';
import { resourceQueryApisStory } from './resource-query-apis';
import { rpcStylesStory } from './rpc-styles';
import { realtimeWebStory } from './realtime-web';
import { agentProtocolsStory } from './agent-protocols';
// Async / IoT
import { enterpriseBrokersStory } from './enterprise-brokers';
import { iotMessagingStory } from './iot-messaging';
import { federatedMessagingStory } from './federated-messaging';
// Real-Time A/V
import { streamingDeliveryStory } from './streaming-delivery';
import { conferencingCallsStory } from './conferencing-calls';
// Utilities / Security
import { secureChannelsVpnStory } from './secure-channels-vpn';
import { authenticationStory } from './authentication';
import { mailFileTransferStory } from './mail-file-transfer';
import { networkServicesStory } from './network-services';
// Wireless
import { wlanWanStory } from './wlan-wan';
import { panProximityStory } from './pan-proximity';

const stories: SubcategoryStory[] = [
	linkLayerStory,
	internetLayerStory,
	routingStory,
	namingStory,
	reliableStreamsStory,
	datagramTransportStory,
	httpVersionsStory,
	resourceQueryApisStory,
	rpcStylesStory,
	realtimeWebStory,
	agentProtocolsStory,
	enterpriseBrokersStory,
	iotMessagingStory,
	federatedMessagingStory,
	streamingDeliveryStory,
	conferencingCallsStory,
	secureChannelsVpnStory,
	authenticationStory,
	mailFileTransferStory,
	networkServicesStory,
	wlanWanStory,
	panProximityStory
];

const storyMap = new Map<string, SubcategoryStory>(stories.map((s) => [s.subcategoryId, s]));

export function getSubcategoryStory(subcategoryId: string): SubcategoryStory | undefined {
	return storyMap.get(subcategoryId);
}

export type { SubcategoryStory, Pioneer, TimelineEntry, StorySection } from './types';
