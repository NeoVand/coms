import prettier from 'eslint-config-prettier';
import path from 'node:path';
import { includeIgnoreFile } from '@eslint/compat';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';
import svelteConfig from './svelte.config.js';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off',

			// Allow intentionally-unused identifiers prefixed with `_` (placeholder
			// destructure targets, ignored callback args).
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
			],

			// This project deliberately centralizes base-path handling: navigation.ts
			// prefixes every goto() with `${base}`, and inline links build hrefs as
			// `{base}/...`. That is a correct, deployed pattern for the GitHub Pages
			// sub-path. resolve() would be an equivalent restyle of ~20 call sites with
			// no behavioral gain, so we opt out of this stylistic rule.
			'svelte/no-navigation-without-resolve': 'off',

			// Every Map/Set in this codebase is an ephemeral local built inside a
			// `$derived.by()` / helper function, or a non-reactive cache used by the
			// canvas render loop — never reactive component state. SvelteMap/SvelteSet
			// would add proxy overhead for no benefit, so this rule is all false
			// positives here.
			'svelte/prefer-svelte-reactivity': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser,
				svelteConfig
			}
		}
	}
);
