import type { LiveDriver } from './types';
import type { ProtocolLayer } from '../types';

const RR_TYPES: Record<number, string> = {
	1: 'A',
	2: 'NS',
	5: 'CNAME',
	6: 'SOA',
	15: 'MX',
	16: 'TXT',
	28: 'AAAA',
	33: 'SRV',
	257: 'CAA'
};

const DNS_COLOR = '#2DD4BF';
const HTTP_COLOR = '#4B5563';

interface DohAnswer {
	name: string;
	type: number;
	TTL: number;
	data: string;
}

/**
 * DNS-over-HTTPS live driver (RFC 8484). The browser cannot open a raw UDP/53
 * socket, but it CAN do a real DNS query over HTTPS via fetch — so this is a
 * genuinely live exchange whose answer records and TTLs are exactly what the
 * public resolver returns right now.
 */
export function dnsLiveDriver(): LiveDriver {
	return {
		runLabel: 'Resolve',
		note: 'Runs a real DNS-over-HTTPS query (RFC 8484) against Google 8.8.8.8 — the answer records and TTLs below are exactly what your network returns right now.',
		async run({ userValues, append, signal }) {
			const domain = (userValues.domain || 'example.com').trim().replace(/^https?:\/\//, '');
			const qtype = 'A';

			const httpRequest: ProtocolLayer = {
				name: 'HTTP Request',
				abbreviation: 'HTTP',
				osiLayer: 7,
				color: HTTP_COLOR,
				headerFields: [
					{
						name: 'Method',
						bits: 0,
						value: 'GET',
						editable: false,
						description: 'DoH GET request'
					},
					{
						name: 'Path',
						bits: 0,
						value: `/resolve?name=${domain}&type=${qtype}`,
						editable: false,
						description: 'The DNS query encoded as URL parameters'
					},
					{
						name: 'Host',
						bits: 0,
						value: 'dns.google',
						editable: false,
						description: "Google's public DoH resolver (8.8.8.8)"
					},
					{
						name: 'Accept',
						bits: 0,
						value: 'application/dns-json',
						editable: false,
						description: 'Ask for the JSON DoH response format'
					}
				]
			};

			append({
				id: 'doh-query',
				label: 'DoH Query',
				description: `Real DNS-over-HTTPS request for ${domain} (${qtype}). A browser can't send raw UDP to port 53, so the query rides HTTPS to the resolver instead.`,
				fromActor: 'client',
				toActor: 'resolver',
				duration: 600,
				highlight: ['Path'],
				layers: [httpRequest]
			});

			let json: { Status?: number; Answer?: DohAnswer[]; Comment?: string };
			try {
				const res = await fetch(
					`https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${qtype}`,
					{ signal, headers: { accept: 'application/dns-json' } }
				);
				if (!res.ok) throw new Error(`resolver returned HTTP ${res.status}`);
				json = await res.json();
			} catch (err) {
				if ((err as Error).name === 'AbortError') return;
				throw new Error(
					`DNS-over-HTTPS request failed (${(err as Error).message}). Check your connection and try again.`
				);
			}

			const answers = json.Answer ?? [];
			const statusName =
				json.Status === 0 ? 'NOERROR' : json.Status === 3 ? 'NXDOMAIN' : `RCODE ${json.Status}`;

			const answerFields = answers.length
				? answers.map((a, i) => ({
						name: `Answer ${i + 1}`,
						bits: 0,
						value: `${RR_TYPES[a.type] ?? `TYPE${a.type}`}  ${a.data}  (TTL ${a.TTL}s)`,
						editable: false,
						description: `${a.name} — real record returned by the resolver`,
						color: DNS_COLOR
					}))
				: [
						{
							name: 'Answer',
							bits: 0,
							value: '(no records)',
							editable: false,
							description: json.Comment ?? 'The resolver returned no answer records for this name.'
						}
					];

			const dnsResponse: ProtocolLayer = {
				name: 'DNS Response',
				abbreviation: 'DNS',
				osiLayer: 7,
				color: DNS_COLOR,
				headerFields: [
					{
						name: 'Status',
						bits: 0,
						value: statusName,
						editable: false,
						description: 'Real response code from the resolver',
						color: json.Status === 0 ? '#22c55e' : '#eab308'
					},
					{
						name: 'Answers',
						bits: 0,
						value: String(answers.length),
						editable: false,
						description: 'Number of answer records returned'
					},
					...answerFields
				]
			};

			append({
				id: 'doh-answer',
				label: 'DoH Response',
				description: `The resolver answered with ${answers.length} record${
					answers.length === 1 ? '' : 's'
				} (${statusName}). These are live values — reload in a while and the TTLs will differ.`,
				fromActor: 'resolver',
				toActor: 'client',
				duration: 600,
				highlight: ['Answers'],
				layers: [dnsResponse]
			});
		}
	};
}
