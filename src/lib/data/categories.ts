import type { Category } from './types';

export const categories: Category[] = [
	{
		id: 'transport',
		name: 'Transport',
		color: '#39FF14',
		glowColor: 'rgba(57, 255, 20, 0.4)',
		description:
			'The foundation of network communication. These protocols handle how raw data moves reliably (or quickly) between two points on a network.',
		icon: 'transport'
	},
	{
		id: 'web-api',
		name: 'Web / API',
		color: '#00D4FF',
		glowColor: 'rgba(0, 212, 255, 0.4)',
		description:
			'The protocols that power the web. From loading pages to real-time chat, these define how applications talk to servers and each other.',
		icon: 'web-api'
	},
	{
		id: 'async-iot',
		name: 'Async / IoT',
		color: '#C084FC',
		glowColor: 'rgba(192, 132, 252, 0.4)',
		description:
			'Message-oriented protocols designed for decoupled, asynchronous communication. Essential for IoT devices, microservices, and event-driven architectures.',
		icon: 'async-iot'
	},
	{
		id: 'realtime-av',
		name: 'Real-Time A/V',
		color: '#FF9F67',
		glowColor: 'rgba(255, 159, 103, 0.4)',
		description:
			'Protocols optimized for streaming audio and video in real-time. They prioritize low latency over perfect delivery — a dropped frame beats a frozen screen.',
		icon: 'realtime-av'
	},
	{
		id: 'utilities',
		name: 'Utilities / Security',
		color: '#2DD4BF',
		glowColor: 'rgba(45, 212, 191, 0.4)',
		description:
			'The invisible infrastructure. DNS translates names to addresses, TLS encrypts everything, and NTP keeps the world synchronized.',
		icon: 'utilities'
	}
];

export const categoryMap = new Map(categories.map((c) => [c.id, c]));
