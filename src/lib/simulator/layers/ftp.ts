import type { ProtocolLayer } from '../types';

export function createFTPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'FTP Command',
		abbreviation: 'FTP',
		osiLayer: 7,
		color: '#8B5CF6',
		headerFields: [
			{
				name: 'Command',
				bits: 0,
				value: overrides?.command ?? 'USER',
				editable: false,
				description: 'FTP command — USER, PASS, PASV, RETR, STOR, LIST, QUIT'
			},
			{
				name: 'Argument',
				bits: 0,
				value: overrides?.argument ?? '',
				editable: false,
				description: 'Command argument — username, filename, or transfer mode'
			},
			{
				name: 'Reply Code',
				bits: 0,
				value: overrides?.replyCode ?? '',
				editable: false,
				description:
					'Three-digit reply — 1xx preliminary, 2xx completion, 3xx intermediate, 4xx/5xx error'
			},
			{
				name: 'Reply Text',
				bits: 0,
				value: overrides?.replyText ?? '',
				editable: false,
				description: 'Human-readable status message from the FTP server'
			},
			{
				name: 'Channel',
				bits: 0,
				value: overrides?.channel ?? 'Control (21)',
				editable: false,
				description:
					'Which connection carries this data — Control (port 21) or Data (port 20)'
			}
		]
	};
}
