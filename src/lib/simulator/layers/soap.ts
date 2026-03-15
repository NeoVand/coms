import type { ProtocolLayer } from '../types';

export function createSOAPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'SOAP Envelope',
		abbreviation: 'SOAP',
		osiLayer: 7,
		color: '#00D4FF',
		headerFields: [
			{
				name: 'Envelope',
				bits: 0,
				value: overrides?.envelope ?? 'soap:Envelope xmlns:soap="..."',
				editable: false,
				description:
					'Root XML element wrapping the entire SOAP message'
			},
			{
				name: 'Header',
				bits: 0,
				value: overrides?.header ?? '',
				editable: false,
				description:
					'Optional SOAP Header — authentication, routing, transaction context'
			},
			{
				name: 'Body',
				bits: 0,
				value: overrides?.body ?? 'GetUser(id: 42)',
				editable: false,
				description:
					'Required SOAP Body — contains the operation and parameters',
				color: '#00D4FF'
			},
			{
				name: 'Namespace',
				bits: 0,
				value: overrides?.namespace ?? 'http://example.com/users',
				editable: false,
				description:
					'XML namespace identifying the service schema and operations'
			},
			{
				name: 'SOAPAction',
				bits: 0,
				value: overrides?.soapAction ?? 'http://example.com/GetUser',
				editable: false,
				description:
					'HTTP header identifying the intended SOAP operation'
			}
		]
	};
}
