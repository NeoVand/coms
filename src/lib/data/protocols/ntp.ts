import type { Protocol } from '../types';

export const ntp: Protocol = {
	id: 'ntp',
	name: 'Network Time Protocol',
	abbreviation: 'NTP',
	categoryId: 'utilities',
	port: 123,
	year: 1985,
	rfc: 'RFC 5905',
	oneLiner: 'Keeps every device on Earth synchronized to the same clock.',
	overview: `[[ntp|NTP]] is one of the oldest protocols still in active use, and one of the most underappreciated. It synchronizes clocks across the internet to within milliseconds — a critical requirement for everything from log correlation to financial trading to [[tls|TLS]] {{certificate|certificate}} validation.

[[ntp|NTP]] uses a hierarchical system of time sources. Stratum 0 are atomic clocks and GPS receivers. Stratum 1 servers connect directly to these. Stratum 2 servers sync from Stratum 1, and so on. Your computer typically syncs from Stratum 2 or 3 servers (like pool.ntp.org).

The clever part is how [[ntp|NTP]] accounts for network {{latency|delay}}. It measures the {{rtt|round-trip time}} of its packets and mathematically compensates for the delay, achieving accuracy far beyond what simple "what time is it?" queries could provide.

[[ntp|NTP]] has been exploited for DDoS amplification attacks: the legacy \`monlist\` command could return a large list of recent clients in response to a small spoofed request, amplifying traffic by a factor of 500x or more. Modern [[ntp|NTP]] implementations disable \`monlist\` by default, and rate-limiting helps mitigate remaining abuse.`,
	howItWorks: [
		{
			title: 'Client sends request',
			description:
				'Client sends a [[udp|UDP]] packet with its current timestamp (T1). The packet is tiny — 48 bytes.'
		},
		{
			title: 'Server timestamps receipt',
			description:
				'Server records when the packet arrives (T2) and when it sends the reply (T3). Both timestamps are included in the response.'
		},
		{
			title: 'Client timestamps response',
			description:
				'Client records when the response arrives (T4). Now it has four timestamps: T1 (sent), T2 (server received), T3 (server sent), T4 (received).'
		},
		{
			title: 'Calculate offset and delay',
			description:
				'{{offset|Offset}} = ((T2-T1) + (T3-T4)) / 2. Delay = (T4-T1) - (T3-T2). The clock is adjusted gradually to avoid time jumps.'
		}
	],
	useCases: [
		'Operating system time synchronization',
		'Distributed system coordination (consensus protocols)',
		'Log timestamp correlation across servers',
		'Financial trading (regulatory time requirements)',
		'Certificate validity and expiration checking'
	],
	codeExample: {
		language: 'python',
		code: `import ntplib
from datetime import datetime

# Query an NTP server
client = ntplib.NTPClient()
response = client.request('pool.ntp.org', version=3)

# The response contains timing data for offset calculation
print(f"NTP time: {datetime.fromtimestamp(response.tx_time)}")
print(f"Offset:   {response.offset:.6f} seconds")
print(f"Delay:    {response.delay:.6f} seconds")
print(f"Stratum:  {response.stratum}")

# Offset tells you how far your clock is off
# Positive = your clock is behind, Negative = ahead`,
		caption:
			'ntplib queries an [[ntp|NTP]] server and calculates the clock {{offset|offset}} using the four-timestamp algorithm',
		alternatives: [
			{
				language: 'javascript',
				code: `const NtpClient = require('ntp-client');

// Query an NTP server
NtpClient.getNetworkTime(
  'pool.ntp.org', 123, (err, date) => {
    const now = new Date();
    const offset = date.getTime() - now.getTime();

    console.log('NTP time:', date.toISOString());
    console.log('Local time:', now.toISOString());
    console.log('Offset:', offset, 'ms');
    console.log('Your clock is',
      offset > 0 ? 'behind' : 'ahead');
  }
);`
			},
			{
				language: 'cli',
				code: `# Query an NTP server manually
ntpdate -q pool.ntp.org

# Check NTP synchronization status (systemd)
timedatectl timesync-status

# Use chrony for modern NTP management
chronyc tracking     # Show current sync status
chronyc sources -v   # Show NTP servers and quality

# One-shot time sync (requires root)
sudo ntpdate pool.ntp.org`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'Client Request',
						code: `NTP Packet (UDP port 123):
  Flags: 0x23
    LI: 0 (no warning)
    Version: 4
    Mode: 3 (Client)
  Stratum: 0 (unspecified)
  Poll Interval: 6 (64 seconds)
  Precision: -20 (≈1μs)

  Root Delay: 0.000000
  Root Dispersion: 0.000000
  Reference ID: (none)

  Reference Timestamp:  0
  Origin Timestamp:     0
  Receive Timestamp:    0
  Transmit Timestamp:   2024-03-13 14:30:00.123456 UTC`
					},
					{
						title: 'Server Response',
						code: `NTP Packet (UDP port 123):
  Flags: 0x24
    LI: 0 (no warning)
    Version: 4
    Mode: 4 (Server)
  Stratum: 1 (primary reference)
  Poll Interval: 6
  Precision: -24 (≈60ns)

  Root Delay: 0.000000
  Root Dispersion: 0.000122
  Reference ID: "GPS\\0"

  Reference Timestamp:  2024-03-13 14:29:55.000000
  Origin Timestamp:     2024-03-13 14:30:00.123456
  Receive Timestamp:    2024-03-13 14:30:00.123478
  Transmit Timestamp:   2024-03-13 14:30:00.123502

  Round-trip delay: 0.000044s
  Clock offset: +0.000022s`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Single UDP round trip. Synchronization accuracy: 1-50ms over internet, <1ms on LAN.',
		throughput: 'Polling interval: 64-1024 seconds. Negligible bandwidth.',
		overhead: '48-byte packets. One of the lightest protocols in existence.'
	},
	connections: ['udp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/Network_Time_Protocol',
		rfc: 'https://datatracker.ietf.org/doc/html/rfc5905',
		official: 'https://www.ntp.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Nist-f1.jpg/500px-Nist-f1.jpg',
		alt: 'NIST-F1 cesium fountain atomic clock at the National Institute of Standards and Technology',
		caption:
			'The NIST-F1 cesium fountain atomic clock — accurate to one second in 100 million years. Atomic clocks like this are the ultimate time source (Stratum 0) that [[ntp|NTP]] distributes to every device on the internet.',
		credit: 'Photo: NIST / Public Domain, via Wikimedia Commons'
	}
};
