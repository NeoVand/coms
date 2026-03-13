import type { ProtocolLayer } from '../types';

export function createSMTPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'SMTP Command',
		abbreviation: 'SMTP',
		osiLayer: 7,
		color: '#F59E0B',
		headerFields: [
			{
				name: 'Command',
				bits: 0,
				value: overrides?.command ?? 'EHLO',
				editable: false,
				description: 'SMTP command — EHLO, MAIL FROM, RCPT TO, DATA, QUIT'
			},
			{
				name: 'Parameter',
				bits: 0,
				value: overrides?.parameter ?? 'client.example.com',
				editable: false,
				description:
					'Command parameter — hostname for EHLO, address for MAIL FROM/RCPT TO'
			},
			{
				name: 'Response Code',
				bits: 0,
				value: overrides?.responseCode ?? '',
				editable: false,
				description:
					'Three-digit reply code — 2xx success, 3xx intermediate, 4xx transient error, 5xx permanent'
			},
			{
				name: 'Response Text',
				bits: 0,
				value: overrides?.responseText ?? '',
				editable: false,
				description: 'Human-readable response message from the server'
			},
			{
				name: 'Body',
				bits: 0,
				value: overrides?.body ?? '',
				editable: false,
				description: 'Message headers and body content sent after DATA command'
			}
		]
	};
}
