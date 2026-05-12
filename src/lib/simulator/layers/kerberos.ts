import type { ProtocolLayer } from '../types';

export function createKerberosLayer(
	overrides?: Partial<Record<string, string | number>>
): ProtocolLayer {
	return {
		name: 'Kerberos',
		abbreviation: 'krb5',
		osiLayer: 7,
		color: '#2DD4BF',
		headerFields: [
			{
				name: 'Application Tag',
				bits: 8,
				value: overrides?.appTag ?? '[APPLICATION 10] AS-REQ',
				editable: false,
				description:
					'ASN.1 application tag — 10=AS-REQ, 11=AS-REP, 12=TGS-REQ, 13=TGS-REP, 14=AP-REQ, 15=AP-REP, 30=KRB-ERROR'
			},
			{
				name: 'Protocol Version (pvno)',
				bits: 8,
				value: 5,
				editable: false,
				description: 'Kerberos protocol version — 5 is current; V4 was deprecated in MIT krb5 1.18 (2020)'
			},
			{
				name: 'Message Type',
				bits: 8,
				value: overrides?.msgType ?? 10,
				editable: false,
				description: 'Matches the application tag — 10=AS-REQ, 11=AS-REP, 12=TGS-REQ, 13=TGS-REP, 14=AP-REQ, 15=AP-REP'
			},
			{
				name: 'Principal Name (cname / sname)',
				bits: 0,
				value: overrides?.cname ?? 'alice@EXAMPLE.COM',
				editable: false,
				description: 'Realm-qualified principal name. For AS-REQ: cname; for TGS-REQ: cname + sname'
			},
			{
				name: 'Body / Ticket',
				bits: 0,
				value: overrides?.body ?? 'KDC-REQ-BODY with kdc-options, nonce, etype list',
				editable: false,
				description:
					'Message-type-specific body. AS-REQ/TGS-REQ carry KDC-REQ-BODY; AP-REQ carries a ticket + authenticator; AS-REP/TGS-REP carry the encrypted ticket + encrypted session key'
			}
		]
	};
}
