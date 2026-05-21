import type { CategoryStory } from './types';

export const utilitiesStory: CategoryStory = {
	categoryId: 'utilities',
	tagline: 'The invisible backbone — timing, securing, and delivering',
	sections: [
		{
			type: 'narrative',
			title: 'The Fundamentals Come First',
			text: `Before the web, before streaming, before even email as we know it — there were protocols for the most basic operations: transferring files and sending messages. In 1971, Abhay Bhushan at {{mit|MIT}} wrote [[rfc:114|RFC 114]], defining the File Transfer Protocol. [[ftp]] was one of the very first application-layer protocols on the {{arpanet|ARPANET}}, allowing researchers to share files between distant universities.\n\nA year later, email followed. [[pioneer:jon-postel|Jon Postel]], the quiet architect of the internet, helped define how electronic messages should be formatted and delivered. By 1982, [[smtp]] ([[rfc:821|RFC 821]]) established the system that, remarkably, still carries the world's email today. These weren't glamorous protocols — they were the workhorses that made a network of computers actually useful.`
		},
		{
			type: 'pioneers',
			title: "The Internet's First Builders",
			people: [
				{
					name: 'Abhay Bhushan',
					years: '1944–',
					title: 'Creator of FTP',
					org: 'MIT',
					contribution:
						"Created the File Transfer Protocol ([[rfc:114|RFC 114]]) in 1971 — one of the internet's very first application protocols. Later held leadership roles at {{xerox-parc|Xerox PARC}} and several tech companies."
				},
				{
					name: 'Jon Postel',
					years: '1943–1998',
					title: "The Internet's Conscience",
					org: 'USC Information Sciences Institute',
					contribution:
						'Authored the RFCs for [[smtp|SMTP]], contributed to [[ftp|FTP]] and [[dns|DNS]], served as {{rfc-doc|RFC}} Editor for 28 years, and administered {{iana|IANA}}. Perhaps the single most important figure in internet protocol development.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Jon_Postel_sitting_in_office_%28cropped%29.jpg/330px-Jon_Postel_sitting_in_office_%28cropped%29.jpg'
				},
				{
					name: 'Dave Crocker',
					years: '1946–',
					title: 'Email Format Architect',
					org: 'University of Delaware / Brandenburg InternetWorking',
					contribution:
						'Authored [[rfc:822|RFC 822]], which defined the email message format (From, To, Subject, Date) still used by every email sent today.'
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1971,
					title: 'FTP — RFC 114',
					description:
						"One of the internet's first application protocols. Researchers can now transfer files between {{arpanet|ARPANET}} {{hosts-bare|hosts}}.",
					protocolId: 'ftp'
				},
				{
					year: 1982,
					title: 'SMTP — RFC 821',
					description:
						'[[pioneer:jon-postel|Jon Postel]] defines the Simple Mail Transfer Protocol. Email gets its universal delivery system.',
					protocolId: 'smtp'
				},
				{
					year: 1982,
					title: 'Email Format — RFC 822',
					description:
						"Dave Crocker defines From, To, Subject, Date headers. Every email you've ever sent uses this format."
				},
				{
					year: 1985,
					title: 'NTP v0 — RFC 958',
					description:
						"David Mills creates the Network Time Protocol. Synchronizing clocks across a network turns out to be one of computing's hardest problems.",
					protocolId: 'ntp'
				},
				{
					year: 1988,
					title: 'IMAP Created — RFC 1064',
					description:
						"Mark Crispin at Stanford invents the Internet Message Access Protocol. Unlike POP, mail stays on the server — a radical idea that enables multi-device access.",
					protocolId: 'imap'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The Timing Problem',
			text: `David Mills tackled one of computing's most overlooked fundamentals: time. How do you keep clocks synchronized across thousands of computers separated by unpredictable network delays? [[ntp]], the Network Time Protocol, uses a hierarchical system of time sources (stratum 0 from atomic clocks, cascading down) and sophisticated algorithms to compensate for network {{jitter|jitter}}. Mills maintained [[ntp|NTP]] for over 30 years — one person, one protocol, keeping the world's computers in sync.\n\nWithout reliable time, [[tls|TLS]] {{certificate|certificates}} appear expired and get rejected; distributed databases mis-order events; forensic logs become useless. Time is the silent prerequisite for almost every other utility on the network.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PDP-11-70.JPG/500px-PDP-11-70.JPG',
			alt: 'A DEC PDP-11/70 minicomputer, representative of the machines that ran the early internet infrastructure',
			caption:
				"The DEC PDP-11 — machines like these ran early [[ntp|NTP]] clocks, mail relays, and authentication servers. The internet's invisible backbone started on hardware you could fill a room with.",
			credit: 'Photo: Kozan / Public Domain, via Wikimedia Commons'
		},
		{
			type: 'pioneers',
			title: 'The Infrastructure Architects',
			people: [
				{
					name: 'David Mills',
					years: '1938–2024',
					title: 'Inventor of NTP',
					org: 'University of Delaware',
					contribution:
						'Created and maintained the Network Time Protocol for over 30 years — one of the longest-running single-maintainer protocol efforts in internet history. Inducted into the Internet Hall of Fame in 2013.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fe/DL_Mills-2_%28cropped%29.jpg/330px-DL_Mills-2_%28cropped%29.jpg'
				},
				{
					name: 'Ralph Droms',
					years: '',
					title: 'Architect of DHCP',
					org: 'Bucknell University / Cisco',
					contribution:
						'Designed the Dynamic Host Configuration Protocol ([[rfc:2131|RFC 2131]]), automating the tedious process of manually configuring [[ip|IP]] addresses for every device on a network.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Ralph_E._Droms_-_2013.jpg/330px-Ralph_E._Droms_-_2013.jpg'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The Complete Email System',
			text: `While [[ntp|NTP]] solved timing, another protocol was quietly filling a critical gap in the internet's infrastructure.\n\nIn 1988, Mark Crispin at Stanford created [[imap]], solving a problem [[smtp]] never could: accessing your email from multiple devices. [[smtp|SMTP]] delivers mail, but it's a one-way push. [[imap|IMAP]] lets you browse, search, and organize messages that stay on the server. When you read an email on your phone and see it marked as read on your laptop — that's [[imap|IMAP]]'s {{stateful|stateful}}, server-side model at work. Crispin maintained [[imap|IMAP]] for over 25 years, evolving it from [[rfc:1064|RFC 1064]] to [[rfc:9051|RFC 9051]].`
		},
		{
			type: 'pioneers',
			title: 'The Email Pioneer',
			people: [
				{
					name: 'Mark Crispin',
					years: '1956–2012',
					title: 'Creator of IMAP',
					org: 'Stanford University / University of Washington',
					contribution:
						"Invented the Internet Message Access Protocol ([[rfc:1064|RFC 1064]], 1988) and maintained it for over 25 years through multiple revisions. [[imap|IMAP]]'s server-side mail model enabled the multi-device email access we take for granted today."
				}
			]
		},
		{
			type: 'timeline',
			entries: [
				{
					year: 1993,
					title: 'DHCP Published — RFC 1531',
					description:
						'Dynamic Host Configuration Protocol automates network configuration. Plug in a device and it gets an {{ip-address|IP address}} automatically.',
					protocolId: 'dhcp'
				},
				{
					year: 1994,
					title: 'SSL 1.0 at Netscape',
					description:
						'[[pioneer:taher-elgamal|Taher Elgamal]] leads the creation of Secure Sockets Layer. Version 1.0 is never released publicly due to security flaws.'
				},
				{
					year: 1995,
					title: 'SSH Created by Tatu Ylönen',
					description:
						'After a password-sniffing attack at his university, Ylönen writes [[ssh|SSH]] in a weekend. Secure remote access replaces the dangerously unencrypted telnet.',
					protocolId: 'ssh'
				},
				{
					year: 1995,
					title: 'SSL 2.0 Ships with Netscape Navigator',
					description:
						'The first public {{ssl|SSL}} version enables secure web transactions. E-commerce becomes possible.'
				},
				{
					year: 1999,
					title: 'TLS 1.0 Published — RFC 2246',
					description:
						'The {{ietf|IETF}} takes over from Netscape, renaming {{ssl|SSL}} to [[tls|TLS]]. The protocol that encrypts the web begins its standardization journey.',
					protocolId: 'tls'
				},
				{
					year: 2006,
					title: 'SSH Standardized — RFC 4251-4254',
					description:
						'After a decade of widespread use, [[ssh|SSH]] gets formal {{ietf|IETF}} standardization. OpenSSH has already become ubiquitous.',
					protocolId: 'ssh'
				},
				{
					year: 2012,
					title: 'OAuth 2.0 Published — RFC 6749',
					description:
						'The authorization framework that makes "Sign in with {{google|Google}}" possible. Apps get scoped tokens instead of passwords, and the modern {{api|API}} ecosystem gets its security layer.',
					protocolId: 'oauth2'
				},
				{
					year: 2018,
					title: 'TLS 1.3 Published — RFC 8446',
					description:
						'A major overhaul: faster {{handshake|handshakes}}, stronger security, removal of legacy cryptography. The modern {{encryption|encryption}} standard.',
					protocolId: 'tls'
				}
			]
		},
		{
			type: 'narrative',
			title: 'The Security Imperative',
			text: `The internet was built on trust. Early protocols sent everything in plaintext — passwords, emails, file transfers — because the network was small and its users were known. As the internet grew from hundreds to millions of {{hosts-bare|hosts}}, this trust model shattered.\n\nIn 1994, Netscape needed to enable secure credit card transactions on the web. [[pioneer:taher-elgamal|Taher Elgamal]] led the creation of {{ssl|SSL}} (Secure Sockets Layer), wrapping [[tcp]] connections in {{encryption|encryption}}. {{ssl|SSL}} 2.0 shipped with Netscape Navigator, and suddenly e-commerce was possible. The {{ietf|IETF}} later standardized it as [[tls]], which now encrypts the vast majority of web traffic.\n\nMeanwhile in Finland, Tatu Ylönen had a more personal motivation. In 1995, a password-sniffing attack compromised accounts at his university. He wrote [[ssh]] — Secure Shell — essentially in a weekend, replacing the completely unencrypted telnet and rlogin. [[ssh|SSH]] didn't just encrypt remote access; it provided a secure tunnel for anything: file transfers (replacing [[ftp]] with {{sftp|SFTP}}), {{port-forwarding|port forwarding}}, and eventually even Git transport.`
		},
		{
			type: 'image',
			src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Netscape_Navigator_2_Screenshot.png/500px-Netscape_Navigator_2_Screenshot.png',
			alt: 'A screenshot of Netscape Navigator 2, the browser that introduced SSL encryption to the web',
			caption:
				"Netscape Navigator — the browser that introduced {{ssl|SSL}} and the padlock icon, making encrypted web communication possible. This {{ui|UI}} convention persists in every browser today.",
			credit: 'Screenshot: Indolering / CC0, via Wikimedia Commons'
		},
		{
			type: 'pioneers',
			title: 'The Security Architects',
			people: [
				{
					name: 'Taher Elgamal',
					years: '1955–',
					title: 'Father of SSL',
					org: 'Netscape Communications',
					contribution:
						'Led the development of {{ssl|SSL}} at Netscape, enabling encrypted web communication and the birth of e-commerce. Also invented the ElGamal {{encryption|encryption}} scheme.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Taher_Elgamal_it-sa_2010.jpg/330px-Taher_Elgamal_it-sa_2010.jpg'
				},
				{
					name: 'Tatu Ylönen',
					years: '1968–',
					title: 'Creator of SSH',
					org: 'Helsinki University of Technology / SSH Communications Security',
					contribution:
						'Created the Secure Shell protocol after a university network security breach. [[ssh|SSH]] replaced telnet worldwide and is now used on virtually every server on the internet.'
				},
				{
					name: 'Eric Rescorla',
					years: '',
					title: 'Author of TLS 1.3',
					org: 'Mozilla / IETF',
					contribution:
						"Authored the [[tls|TLS]] 1.3 specification ([[rfc:8446|RFC 8446]]), dramatically improving both the security and performance of internet {{encryption|encryption}}. Also key contributor to [[webrtc|WebRTC]]'s security architecture."
				},
				{
					name: 'Paul Vixie',
					years: '1963–',
					title: 'DNS Implementation Pioneer',
					org: 'ISC / Farsight Security',
					contribution:
						'Wrote BIND, the most widely deployed [[dns|DNS]] server software. Founded the Internet Systems Consortium. Inducted into the Internet Hall of Fame in 2014.',
					imagePath:
						'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/Paul_Vixie_-_2014.jpg/330px-Paul_Vixie_-_2014.jpg'
				}
			]
		},
		{
			type: 'callout',
			title: "Jon Postel — The Internet's Most Important Person You've Never Heard Of",
			text: "[[pioneer:jon-postel|Jon Postel]] edited the {{rfc-doc|RFC}} series for 28 years, wrote or co-wrote over 200 RFCs, edited foundational RFCs for [[tcp|TCP]], [[smtp|SMTP]], and other core protocols, served as {{iana|IANA}} administrator. When he died in 1998 at age 55, [[pioneer:vint-cerf|Vint Cerf]] wrote [[rfc:2468|RFC 2468]] as a memorial. His robustness principle — 'Be conservative in what you send, be liberal in what you accept' — remains one of the internet's guiding philosophies."
		}
	]
};
