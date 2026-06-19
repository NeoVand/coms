/**
 * fix-useless-escapes.ts — surgical removal of ESLint `no-useless-escape`
 * violations.
 *
 * Why not a regex? A naive `s/\\'/'/g` would also strip backslashes that are
 * REQUIRED — e.g. a backtick inside a template literal. ESLint has already done
 * the context analysis: it flags only the backslashes that JavaScript ignores.
 * This script consumes ESLint's JSON report and deletes exactly those
 * backslash characters, by (line, column), processing each file's edits
 * right-to-left so earlier column numbers stay valid.
 *
 * Safety: removing an *unnecessary* escape never changes a string's runtime
 * value (`'\''` and `"'"` denote the same character), so the compiled bundle
 * is byte-identical afterwards — that is the verification gate.
 *
 * Usage:
 *   npx eslint . --format json -o /tmp/eslint.json
 *   npx tsx scripts/fix-useless-escapes.ts /tmp/eslint.json
 */
import { readFileSync, writeFileSync } from 'node:fs';

interface EslintMessage {
	ruleId: string | null;
	line: number;
	column: number;
}
interface EslintFileResult {
	filePath: string;
	messages: EslintMessage[];
}

const reportPath = process.argv[2];
if (!reportPath) {
	console.error('Usage: tsx scripts/fix-useless-escapes.ts <eslint-report.json>');
	process.exit(1);
}

const report: EslintFileResult[] = JSON.parse(readFileSync(reportPath, 'utf8'));

let filesChanged = 0;
let removed = 0;
let skipped = 0;

for (const file of report) {
	const targets = file.messages.filter((m) => m.ruleId === 'no-useless-escape');
	if (targets.length === 0) continue;

	const src = readFileSync(file.filePath, 'utf8');
	const lines = src.split('\n');

	// Group by line, then apply each line's edits right-to-left.
	const byLine = new Map<number, number[]>();
	for (const m of targets) {
		const arr = byLine.get(m.line) ?? [];
		arr.push(m.column);
		byLine.set(m.line, arr);
	}

	for (const [lineNo, columns] of byLine) {
		const idx = lineNo - 1;
		let line = lines[idx];
		// Descending column order so deletions don't shift later positions.
		for (const col of columns.sort((a, b) => b - a)) {
			const at = col - 1; // 1-based → 0-based
			if (line[at] === '\\') {
				line = line.slice(0, at) + line.slice(at + 1);
				removed++;
			} else {
				// Position didn't point at a backslash — refuse to guess.
				console.warn(
					`  ! ${file.filePath}:${lineNo}:${col} expected '\\' but found ${JSON.stringify(line[at])}; skipped`
				);
				skipped++;
			}
		}
		lines[idx] = line;
	}

	writeFileSync(file.filePath, lines.join('\n'));
	filesChanged++;
}

console.log(
	`Removed ${removed} unnecessary escapes across ${filesChanged} files (${skipped} skipped).`
);
if (skipped > 0) process.exit(2);
