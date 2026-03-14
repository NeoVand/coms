/**
 * Highlighted name definitions for protocol abbreviations.
 * Characters wrapped in [brackets] are the letters that form the abbreviation,
 * rendered bold and bright in the UI.
 */

const highlightedNames: Record<string, string> = {
	// Transport
	tcp: '[T]ransmission [C]ontrol [P]rotocol',
	udp: '[U]ser [D]atagram [P]rotocol',
	quic: '[QUIC]',
	sctp: '[S]tream [C]ontrol [T]ransmission [P]rotocol',
	mptcp: '[M]ulti[p]ath [TCP]',

	// Web / API
	http1: '[H]yper[T]ext [T]ransfer [P]rotocol',
	http2: '[H]yper[T]ext [T]ransfer [P]rotocol 2',
	http3: '[H]yper[T]ext [T]ransfer [P]rotocol 3',
	websockets: '[W]eb[S]ocket Protocol',
	grpc: '[g][R]emote [P]rocedure [C]alls',
	graphql: '[Graph][Q]uery [L]anguage',
	sse: '[S]erver-[S]ent [E]vents',
	rest: '[RE]presentational [S]tate [T]ransfer',

	// Async / IoT
	mqtt: '[M]essage [Q]ueuing [T]elemetry [T]ransport',
	amqp: '[A]dvanced [M]essage [Q]ueuing [P]rotocol',
	coap: '[Co]nstrained [A]pplication [P]rotocol',
	stomp: '[S]imple [T]ext [O]riented [M]essaging [P]rotocol',
	xmpp: 'e[X]tensible [M]essaging and [P]resence [P]rotocol',
	kafka: 'Apache [Kafka] Wire Protocol',

	// Realtime A/V
	webrtc: '[Web] [R]eal-[T]ime [C]ommunication',
	rtp: '[R]eal-time [T]ransport [P]rotocol',
	sip: '[S]ession [I]nitiation [P]rotocol',
	hls: '[H]TTP [L]ive [S]treaming',
	rtmp: '[R]eal-[T]ime [M]essaging [P]rotocol',
	sdp: '[S]ession [D]escription [P]rotocol',
	dash: '[D]ynamic [A]daptive [S]treaming over [H]TTP',

	// Utilities / Security
	tls: '[T]ransport [L]ayer [S]ecurity',
	ssh: '[S]ecure [Sh]ell',
	dns: '[D]omain [N]ame [S]ystem',
	dhcp: '[D]ynamic [H]ost [C]onfiguration [P]rotocol',
	ntp: '[N]etwork [T]ime [P]rotocol',
	smtp: '[S]imple [M]ail [T]ransfer [P]rotocol',
	ftp: '[F]ile [T]ransfer [P]rotocol'
};

export interface NameSegment {
	text: string;
	highlight: boolean;
}

/** Parse a highlighted name format string into renderable segments. */
function parseFormat(format: string): NameSegment[] {
	const segments: NameSegment[] = [];
	const regex = /\[([^\]]+)\]|([^[\]]+)/g;
	let match;
	while ((match = regex.exec(format)) !== null) {
		if (match[1] !== undefined) {
			segments.push({ text: match[1], highlight: true });
		} else if (match[2] !== undefined) {
			segments.push({ text: match[2], highlight: false });
		}
	}
	return segments;
}

/** Get highlighted name segments for a protocol. Falls back to plain name. */
export function getHighlightedName(protocolId: string, plainName: string): NameSegment[] {
	const format = highlightedNames[protocolId];
	if (format) {
		return parseFormat(format);
	}
	return [{ text: plainName, highlight: false }];
}
