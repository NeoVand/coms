/**
 * unwrap-codespans.ts — Strip {{...}} and [[...]] wraps that ended up
 * inside markdown inline-code spans (\`...\` in template literals).
 * The wrap scripts shouldn't have touched these regions, so this is the
 * one-shot rollback.
 *
 * Pattern handled: `\`...\`...{{x|y}}...\`...\``  — the content between
 * a pair of `\`` backtick escapes.
 *
 * Run: npx tsx scripts/unwrap-codespans.ts
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..');
const DATA_DIR = join(REPO, 'src/lib/data');

function walk(dir: string, out: string[] = []): string[] {
	for (const n of readdirSync(dir)) {
		const p = join(dir, n);
		const st = statSync(p);
		if (st.isDirectory()) walk(p, out);
		else if (n.endsWith('.ts')) out.push(p);
	}
	return out;
}

function unwrapInside(s: string): { changed: number; out: string } {
	let changed = 0;
	const out = s.replace(/\\`([^`]+?)\\`/g, (full, inner: string) => {
		// Strip [[id|label]] → label, {{id|label}} → label inside the code span.
		const cleaned = inner
			.replace(/\[\[[^\]|]+\|([^\]]+)\]\]/g, '$1')
			.replace(/\{\{[^}|]+\|([^}]+)\}\}/g, '$1');
		if (cleaned !== inner) changed++;
		return '\\`' + cleaned + '\\`';
	});
	return { changed, out };
}

let totalChanged = 0;
let filesTouched = 0;
for (const f of walk(DATA_DIR)) {
	const orig = readFileSync(f, 'utf8');
	const { changed, out } = unwrapInside(orig);
	if (changed && out !== orig) {
		writeFileSync(f, out);
		totalChanged += changed;
		filesTouched++;
		console.log(`  ${changed.toString().padStart(3)}  ${relative(REPO, f)}`);
	}
}

console.log(`\nStripped wraps from ${totalChanged} code spans across ${filesTouched} files.`);
