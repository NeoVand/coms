import type { Protocol } from '../types';

export const mqtt: Protocol = {
	id: 'mqtt',
	name: 'MQTT',
	abbreviation: 'MQTT',
	categoryId: 'async-iot',
	port: 1883,
	year: 1999,
	rfc: undefined,
	oneLiner: 'Lightweight {{pub-sub|publish/subscribe}} messaging — the lingua franca of IoT.',
	overview: `[[mqtt|MQTT]] was invented at IBM in 1999 for monitoring oil pipelines over unreliable satellite links. Originally called "MQ Telemetry Transport," the name was dropped as a formal acronym when [[mqtt|MQTT]] became an OASIS standard in 2014 — it's now just "[[mqtt|MQTT]]." Its design goals — minimal {{bandwidth|bandwidth}}, tiny code footprint, and unreliable network tolerance — make it perfect for IoT devices with limited resources.

The pattern is {{pub-sub|publish/subscribe}}: devices {{mqtt-publish|publish}} messages to named "{{topic|topics}}," and other devices subscribe to topics they care about. A central {{broker|broker}} handles routing. A temperature sensor publishes to "home/kitchen/temperature," and any interested dashboard or automation system subscribes to that {{topic|topic}}.

[[mqtt|MQTT]]'s fixed header is just 2 bytes. It supports three {{qos|quality-of-service}} levels ({{fire-and-forget|fire-and-forget}}, at-least-once, exactly-once), retained messages (new subscribers get the last value immediately), and "{{last-will|last will}}" messages (the broker publishes a message if a device disconnects unexpectedly).`,
	howItWorks: [
		{
			title: 'Connect to broker',
			description:
				'Client connects to the [[mqtt|MQTT]] broker (like Mosquitto or HiveMQ) over [[tcp|TCP]]. It can specify a client ID, credentials, {{keep-alive|keep-alive}} interval, and a "{{last-will|last will}}" message.'
		},
		{
			title: 'Subscribe to topics',
			description:
				'Client subscribes to {{topic|topic}} patterns like "home/+/temperature" (+ matches one level) or "home/#" (# matches any number of levels).'
		},
		{
			title: 'Publish messages',
			description:
				"Any client can {{mqtt-publish|publish}} a message to a {{topic|topic}}. The broker receives it and forwards it to all matching subscribers. The publisher doesn't need to know who subscribes."
		},
		{
			title: 'QoS delivery',
			description:
				'QoS 0: {{fire-and-forget|fire-and-forget}}. QoS 1: acknowledged (at-least-once). QoS 2: four-step {{handshake|handshake}} (exactly-once). Choose based on data criticality.'
		}
	],
	useCases: [
		'Smart home automation (Home Assistant, SmartThings)',
		'Industrial IoT sensor networks',
		'Fleet tracking and telematics',
		'Remote patient monitoring',
		'Push notifications for mobile apps'
	],
	codeExample: {
		language: 'python',
		code: `import paho.mqtt.client as mqtt

def on_message(client, userdata, msg):
    print(f"{msg.topic}: {msg.payload.decode()}")

client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
client.connect("broker.hivemq.com", 1883)
client.subscribe("home/+/temperature")
client.on_message = on_message

# Publish from another device:
# client.publish("home/kitchen/temperature", "22.5")

client.loop_forever()`,
		caption: 'Subscribe to temperature readings from any room — the broker handles routing',
		alternatives: [
			{
				language: 'javascript',
				code: `import mqtt from 'mqtt';

const client = mqtt.connect('mqtt://broker.hivemq.com:1883');

client.on('connect', () => {
  // Subscribe to all room temperatures
  client.subscribe('home/+/temperature');

  // Publish a reading
  client.publish('home/kitchen/temperature', '22.5');
});

client.on('message', (topic, message) => {
  console.log(\`\${topic}: \${message.toString()}\`);
});`
			},
			{
				language: 'cli',
				code: `# Subscribe to a topic (mosquitto CLI)
mosquitto_sub -h broker.hivemq.com \\
  -t "home/+/temperature" -v

# Publish a message
mosquitto_pub -h broker.hivemq.com \\
  -t "home/kitchen/temperature" \\
  -m "22.5"

# Subscribe with QoS 1 (at-least-once)
mosquitto_sub -h broker.hivemq.com \\
  -t "home/#" -q 1 -v`
			},
			{
				language: 'wire',
				code: '',
				sections: [
					{
						title: 'CONNECT Packet',
						code: `Fixed Header:
  Packet Type: CONNECT (1)
  Remaining Length: 39

Variable Header:
  Protocol Name: MQTT
  Protocol Level: 5 (v5.0)
  Connect Flags: 0xC2
    Username: 1, Password: 1
    Clean Start: 1
  Keep Alive: 60s

Payload:
  Client ID: "sensor-A7B2"
  Username: "device01"
  Password: "••••••••"`
					},
					{
						title: 'PUBLISH Packet',
						code: `Fixed Header:
  Packet Type: PUBLISH (3)
  DUP: 0, QoS: 1, RETAIN: 0
  Remaining Length: 47

Variable Header:
  Topic: "home/living-room/temp"
  Packet ID: 1042

Payload:
  {"value": 22.5, "unit": "°C", "ts": 1710350400}`
					},
					{
						title: 'SUBSCRIBE Packet',
						code: `Fixed Header:
  Packet Type: SUBSCRIBE (8)
  Remaining Length: 31

Variable Header:
  Packet ID: 1043

Payload:
  Topic Filter: "home/+/temp"
    QoS: 1
  Topic Filter: "home/+/humidity"
    QoS: 0`
					}
				]
			}
		]
	},
	performance: {
		latency: 'Sub-second for QoS 0; 1-2 RTTs for QoS 1; 2 RTTs for QoS 2',
		throughput: 'Brokers handle millions of messages/sec; protocol overhead is minimal',
		overhead: '2-byte fixed header minimum — one of the lightest protocols in existence'
	},
	connections: ['tcp', 'websockets', 'tls', 'amqp'],
	links: {
		wikipedia: 'https://en.wikipedia.org/wiki/[[mqtt|MQTT]]',
		official: 'https://mqtt.org/'
	},
	image: {
		src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/MQTT_protocol_example_without_QoS.svg/500px-MQTT_protocol_example_without_QoS.svg.png',
		alt: 'Diagram showing MQTT publish/subscribe pattern: a temperature sensor publishes to a broker, which routes messages to subscribed clients',
		caption:
			'The [[mqtt|MQTT]] {{pub-sub|publish/subscribe}} pattern — a sensor publishes a temperature reading to a {{topic|topic}} on the broker, and any subscribed client receives it automatically. The publisher and subscribers never need to know about each other.',
		credit: 'Image: Wikimedia Commons / CC BY-SA 4.0'
	}
};
