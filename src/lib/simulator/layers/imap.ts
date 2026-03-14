import type { ProtocolLayer } from '../types';

export function createIMAPLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'IMAP Command',
		abbreviation: 'IMAP',
		osiLayer: 7,
		color: '#8B5CF6',
		headerFields: [
			{
				name: 'Tag',
				bits: 0,
				value: overrides?.tag ?? 'A001',
				editable: false,
				description:
					'Command tag — unique identifier linking responses to their commands. Enables pipelining.'
			},
			{
				name: 'Command',
				bits: 0,
				value: overrides?.command ?? 'SELECT',
				editable: false,
				description:
					'IMAP command — LOGIN, SELECT, FETCH, SEARCH, STORE, IDLE, LOGOUT'
			},
			{
				name: 'Arguments',
				bits: 0,
				value: overrides?.arguments ?? 'INBOX',
				editable: false,
				description:
					'Command arguments — mailbox name, message sequence, fetch items'
			},
			{
				name: 'Response Status',
				bits: 0,
				value: overrides?.responseStatus ?? '',
				editable: false,
				description:
					'Tagged response status — OK, NO, BAD, or untagged * responses'
			},
			{
				name: 'Response Data',
				bits: 0,
				value: overrides?.responseData ?? '',
				editable: false,
				description:
					'Response payload — message data, mailbox info, search results'
			}
		]
	};
}
