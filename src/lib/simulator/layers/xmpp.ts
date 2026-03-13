import type { ProtocolLayer } from '../types';

export function createXMPPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'XMPP Stanza',
		abbreviation: 'XMPP',
		osiLayer: 7,
		color: '#4A90D9',
		headerFields: [
			{
				name: 'Stanza Type',
				bits: 0,
				value: overrides?.stanzaType ?? '<stream:stream>',
				editable: false,
				description:
					'XML element type — <stream:stream>, <message>, <presence>, <iq>, <auth>'
			},
			{
				name: 'From',
				bits: 0,
				value: overrides?.from ?? '',
				editable: false,
				description:
					'Sender JID (Jabber ID) — user@domain/resource format identifies sender uniquely'
			},
			{
				name: 'To',
				bits: 0,
				value: overrides?.to ?? '',
				editable: false,
				description:
					'Recipient JID — the destination user, room, or service'
			},
			{
				name: 'ID',
				bits: 0,
				value: overrides?.id ?? '',
				editable: false,
				description:
					'Stanza identifier — used to correlate requests with responses for <iq> stanzas'
			},
			{
				name: 'Namespace',
				bits: 0,
				value: overrides?.namespace ?? 'jabber:client',
				editable: false,
				description:
					'XML namespace — defines the stanza vocabulary (jabber:client, urn:ietf:params:xml:ns:xmpp-sasl, etc.)'
			},
			{
				name: 'Body',
				bits: 0,
				value: overrides?.body ?? '',
				editable: false,
				description:
					'Stanza content — message text, presence status, IQ query payload, or auth credentials'
			}
		]
	};
}
