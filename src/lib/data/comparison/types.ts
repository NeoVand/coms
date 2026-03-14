/**
 * Protocol Comparison & Relationship Data Types
 *
 * Every connection (dotted line) between two protocols in the graph
 * gets a curated entry — either a "vs" comparison (for genuine alternatives)
 * or a "relationship" card (for dependency/composition pairs).
 *
 * ─────────────────────────────────────────────────────────────────
 * CONTENT GUIDELINES (for all agents writing pair entries):
 *
 * 1. PAIR TYPE CLASSIFICATION
 *    - "vs": protocols that solve the SAME problem differently.
 *      The user is choosing between them.
 *      Examples: TCP vs UDP, gRPC vs REST, HLS vs DASH
 *    - "relationship": one protocol DEPENDS ON or WORKS WITH the other.
 *      They operate at different layers or serve complementary roles.
 *      Examples: TCP + TLS, UDP + DNS, HTTP/2 + gRPC
 *
 * 2. SUMMARY (both types)
 *    - Exactly 1-2 sentences.
 *    - For "vs": state the core tradeoff in plain language.
 *      Pattern: "{A} optimizes for X; {B} optimizes for Y."
 *    - For "relationship": state what they accomplish together.
 *      Pattern: "{A} provides X, while {B} provides Y on top of it."
 *
 * 3. KEY DIFFERENCES (vs only)
 *    - Exactly 4-6 rows. No more, no fewer.
 *    - Each row has: aspect (the dimension), left (brief), right (brief).
 *    - Keep left/right values under 10 words each.
 *    - Use these STANDARD ASPECTS in order of relevance:
 *
 *      CONNECTIVITY:  "Connection model"  — e.g. connection-oriented vs connectionless
 *      RELIABILITY:   "Reliability"       — e.g. guaranteed vs best-effort
 *      ORDERING:      "Ordering"          — e.g. ordered vs unordered
 *      OVERHEAD:      "Overhead"          — e.g. low, medium, high
 *      DATA FORMAT:   "Data format"       — e.g. binary vs text, JSON vs Protobuf
 *      DIRECTION:     "Direction"         — e.g. bidirectional vs unidirectional
 *      MULTIPLEXING:  "Multiplexing"      — e.g. single stream vs multiple streams
 *      TRANSPORT:     "Transport"         — e.g. TCP-based vs UDP-based
 *      HEADER SIZE:   "Header size"       — e.g. 20 bytes vs 8 bytes
 *      ENCRYPTION:    "Encryption"        — e.g. built-in vs optional
 *      STATE:         "Statefulness"      — e.g. stateful vs stateless
 *      CACHING:       "Caching"           — e.g. built-in vs none
 *      BROWSER:       "Browser support"   — e.g. native vs requires library
 *      COMPLEXITY:    "Complexity"        — e.g. simple vs complex
 *      ECOSYSTEM:     "Ecosystem"         — e.g. mature vs emerging
 *      STANDARD:      "Standardization"   — e.g. IETF RFC vs proprietary
 *
 *      You may use custom aspects when none of the above fit,
 *      but prefer the standard ones for consistency.
 *
 * 4. USE-WHEN BULLETS (vs only)
 *    - Exactly 3-4 bullets per side. No more, no fewer.
 *    - Start each bullet with a verb or condition:
 *      "You need...", "Low latency is...", "Your clients are..."
 *    - Be specific and actionable — help the reader decide.
 *    - Avoid vague bullets like "For general use" or "When performance matters".
 *
 * 5. HOW-THEY-WORK (relationship only)
 *    - 2-3 sentences describing the interaction.
 *    - Explain the layering: which sits on top, which sits below.
 *    - Mention what would be missing without the relationship.
 *
 * 6. ROLE DESCRIPTIONS (relationship only)
 *    - Exactly 1 sentence each.
 *    - Pattern: "{Protocol} provides/handles {specific function}."
 *    - Be concrete: "TCP provides reliable, ordered byte-stream delivery"
 *      not "TCP handles the transport".
 *
 * 7. IDS ARRAY ORDERING
 *    - Always alphabetically sorted: ['amqp', 'tcp'] not ['tcp', 'amqp'].
 *    - The lookup function handles either order, but storage is canonical.
 *    - In "vs" pairs, left/right in keyDifferences and useWhen
 *      correspond to ids[0] and ids[1] respectively.
 *
 * ─────────────────────────────────────────────────────────────────
 */

export type PairType = 'vs' | 'relationship';

/** A curated comparison or relationship between two protocols. */
export interface ProtocolPair {
	/** Alphabetically sorted protocol IDs: ['http1', 'http2'] */
	ids: [string, string];

	/** Whether this is an alternatives comparison or a dependency relationship. */
	type: PairType;

	/** 1-2 sentence overview of the comparison or relationship. */
	summary: string;

	// ── "vs" fields (alternatives) ──────────────────────────────

	/** 3-4 bullets: when to choose ids[0]. */
	useLeftWhen?: string[];

	/** 3-4 bullets: when to choose ids[1]. */
	useRightWhen?: string[];

	/** 4-6 structured differences. */
	keyDifferences?: { aspect: string; left: string; right: string }[];

	// ── "relationship" fields (dependencies) ────────────────────

	/** 2-3 sentences: how the two protocols interact. */
	howTheyWork?: string;

	/** 1 sentence: what ids[0] contributes to the relationship. */
	leftRole?: string;

	/** 1 sentence: what ids[1] contributes to the relationship. */
	rightRole?: string;
}
