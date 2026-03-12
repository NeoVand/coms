import type { Category } from './types';

export const categories: Category[] = [
	{
		id: 'transport',
		name: 'Transport',
		color: '#39FF14',
		glowColor: 'rgba(57, 255, 20, 0.4)',
		description:
			'The foundation of network communication. These protocols handle how raw data moves reliably (or quickly) between two points on a network.',
		icon: '🔄'
	},
	{
		id: 'web-api',
		name: 'Web / API',
		color: '#00D4FF',
		glowColor: 'rgba(0, 212, 255, 0.4)',
		description:
			'The protocols that power the web. From loading pages to real-time chat, these define how applications talk to servers and each other.',
		icon: '🌐'
	},
	{
		id: 'async-iot',
		name: 'Async / IoT',
		color: '#A855F7',
		glowColor: 'rgba(168, 85, 247, 0.4)',
		description:
			'Message-oriented protocols designed for decoupled, asynchronous communication. Essential for IoT devices, microservices, and event-driven architectures.',
		icon: '📡'
	},
	{
		id: 'realtime-av',
		name: 'Real-Time A/V',
		color: '#FF6B35',
		glowColor: 'rgba(255, 107, 53, 0.4)',
		description:
			'Protocols optimized for streaming audio and video in real-time. They prioritize low latency over perfect delivery — a dropped frame beats a frozen screen.',
		icon: '🎥'
	},
	{
		id: 'utilities',
		name: 'Utilities / Security',
		color: '#14B8A6',
		glowColor: 'rgba(20, 184, 166, 0.4)',
		description:
			'The invisible infrastructure. DNS translates names to addresses, TLS encrypts everything, and NTP keeps the world synchronized.',
		icon: '🔒'
	}
];

export const categoryMap = new Map(categories.map((c) => [c.id, c]));
