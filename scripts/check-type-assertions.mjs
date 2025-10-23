#!/usr/bin/env node

import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, "..");

// Configuration
// This is a MANUAL CODE REVIEW TOOL, not an automated blocker.
// Run periodically to identify potentially unsafe type assertions.
//
// Only these specific type assertions are allowed
const ALLOWED_ASSERTIONS = [
	"as const", // Literal type narrowing - always safe
	"as unknown", // Intermediate step for safe narrowing (double casting)
];

// Patterns that are allowed (regex patterns)
const ALLOWED_PATTERNS = [
	/^as jest\./i, // Jest mocks: as jest.Mocked<T>, as jest.Mock, etc.
	/^as [A-Z]$/, // Single-letter generic types: as T, as U, as K, as V, etc.
	/^as [A-Z][A-Z]?$/, // Two-letter generic types: as TKey, as TValue, etc.
];

const IGNORE_PATTERNS = [
	"node_modules",
	"dist",
	"build",
	".turbo",
	"coverage",
	".next",
	".cache",
	"src/main.js", // Generated files
	"src/main.js.map",
	".d.ts.map",
	".js",
	".js.map",
];

// Colors for terminal output
const colors = {
	reset: "\x1b[0m",
	red: "\x1b[31m",
	green: "\x1b[32m",
	yellow: "\x1b[33m",
	cyan: "\x1b[36m",
	gray: "\x1b[90m",
};

/**
 * Check if a path should be ignored
 */
function shouldIgnore(filePath) {
	return IGNORE_PATTERNS.some((pattern) => filePath.includes(pattern));
}

/**
 * Find all TypeScript files recursively
 */
function findTypeScriptFiles(dir, files = []) {
	const entries = readdirSync(dir);

	for (const entry of entries) {
		const fullPath = join(dir, entry);

		if (shouldIgnore(fullPath)) {
			continue;
		}

		const stat = statSync(fullPath);

		if (stat.isDirectory()) {
			findTypeScriptFiles(fullPath, files);
		} else if (entry.endsWith(".ts") || entry.endsWith(".tsx")) {
			files.push(fullPath);
		}
	}

	return files;
}

/**
 * Check if a line contains a type assertion
 * Returns the assertion if found, null otherwise
 */
function checkLineForAssertion(line) {
	// Skip import statements (import aliases are not type assertions)
	if (line.trim().startsWith("import ") || line.includes("import {")) {
		return null;
	}

	// Remove string literals to avoid false positives
	const withoutStrings = line
		.replace(/'([^'\\]|\\.)*'/g, "''") // Single quotes
		.replace(/"([^"\\]|\\.)*"/g, '""') // Double quotes
		.replace(/`([^`\\]|\\.)*`/g, "``"); // Template literals

	// Check if line is commented out
	const trimmed = withoutStrings.trim();
	if (
		trimmed.startsWith("//") ||
		trimmed.startsWith("/*") ||
		trimmed.startsWith("*")
	) {
		return null;
	}

	// Check for inline comments that disable the check
	if (line.includes("// biome-ignore") || line.includes("// eslint-disable")) {
		return null;
	}

	// Pattern: ` as ` with whitespace on both sides, followed by one or more words
	const asPattern = /\s+as\s+([\w.<>[\]]+)/g;
	const match = asPattern.exec(withoutStrings);

	while (match !== null) {
		const typeAfterAs = match[1];
		const fullAssertion = `as ${typeAfterAs}`;

		// Check if it's an allowed assertion (exact match)
		const isAllowedExact = ALLOWED_ASSERTIONS.some((allowed) => {
			const allowedType = allowed.replace("as ", "");
			return (
				typeAfterAs === allowedType || typeAfterAs.startsWith(`${allowedType} `)
			);
		});

		// Check if it matches an allowed pattern (regex)
		const isAllowedPattern = ALLOWED_PATTERNS.some((pattern) =>
			pattern.test(fullAssertion),
		);

		if (!isAllowedExact && !isAllowedPattern) {
			return fullAssertion;
		}
	}

	return null;
}

/**
 * Check a single file for type assertions
 */
function checkFile(filePath) {
	const content = readFileSync(filePath, "utf-8");
	const lines = content.split("\n");
	const violations = [];

	let inBlockComment = false;

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];

		// Track block comments
		if (line.includes("/*")) {
			inBlockComment = true;
		}
		if (line.includes("*/")) {
			inBlockComment = false;
			continue;
		}

		// Skip lines inside block comments
		if (inBlockComment) {
			continue;
		}

		const assertion = checkLineForAssertion(line);
		if (assertion) {
			violations.push({
				line: i + 1,
				content: line.trim(),
				assertion,
			});
		}
	}

	return violations;
}

/**
 * Main execution
 */
function main() {
	console.log(
		`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`,
	);
	console.log(
		`${colors.cyan}║  Type Assertion Checker - Manual Code Review Tool         ║${colors.reset}`,
	);
	console.log(
		`${colors.cyan}║  Run periodically to identify potentially unsafe patterns  ║${colors.reset}`,
	);
	console.log(
		`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}\n`,
	);

	const files = findTypeScriptFiles(rootDir);
	let totalViolations = 0;
	const filesWithViolations = [];

	for (const file of files) {
		const violations = checkFile(file);

		if (violations.length > 0) {
			totalViolations += violations.length;
			filesWithViolations.push({ file, violations });
		}
	}

	if (totalViolations === 0) {
		console.log(
			`${colors.green}✓ No potentially unsafe type assertions found${colors.reset}`,
		);
		console.log(
			`${colors.gray}  Checked ${files.length} TypeScript files${colors.reset}\n`,
		);
		console.log(
			`${colors.gray}Note: This is informational only. Many type assertions are valid.${colors.reset}\n`,
		);
		process.exit(0);
	}

	// Report violations
	console.log(
		`${colors.yellow}⚠ Found ${totalViolations} potentially unsafe type assertion(s) in ${filesWithViolations.length} file(s)${colors.reset}\n`,
	);
	console.log(
		`${colors.gray}Review these assertions to determine if they should be replaced with type guards.${colors.reset}\n`,
	);

	for (const { file, violations } of filesWithViolations) {
		const relativePath = relative(rootDir, file);
		console.log(`${colors.yellow}${relativePath}${colors.reset}`);

		for (const { line, content, assertion } of violations) {
			console.log(`  ${colors.gray}${line}:${colors.reset} ${content}`);
			console.log(`    ${colors.yellow}Found: ${assertion}${colors.reset}`);
		}
		console.log("");
	}

	console.log(`${colors.cyan}Allowed assertions (always safe):${colors.reset}`);
	for (const allowed of ALLOWED_ASSERTIONS) {
		console.log(`  ${colors.gray}- ${allowed}${colors.reset}`);
	}

	console.log(
		`\n${colors.cyan}Allowed patterns (context-dependent):${colors.reset}`,
	);
	for (const pattern of ALLOWED_PATTERNS) {
		console.log(`  ${colors.gray}- ${pattern.source}${colors.reset}`);
	}

	console.log(`\n${colors.cyan}Common valid use cases:${colors.reset}`);
	console.log(
		`  ${colors.gray}- Generic types (as T, as TValue)${colors.reset}`,
	);
	console.log(
		`  ${colors.gray}- JSON.parse results with validation${colors.reset}`,
	);
	console.log(`  ${colors.gray}- Global object types${colors.reset}`);
	console.log(
		`  ${colors.gray}- Error handling in catch blocks${colors.reset}`,
	);
	console.log(
		`  ${colors.gray}- Third-party library integrations${colors.reset}`,
	);

	console.log(`\n${colors.yellow}Recommendations:${colors.reset}`);
	console.log(
		`  ${colors.gray}1. Prefer type guards when possible${colors.reset}`,
	);
	console.log(
		`  ${colors.gray}2. Use 'as unknown as T' for double casting (safer)${colors.reset}`,
	);
	console.log(
		`  ${colors.gray}3. Add runtime validation for external data${colors.reset}`,
	);
	console.log(
		`  ${colors.gray}4. Document why type assertions are necessary${colors.reset}`,
	);

	console.log(
		`\n${colors.gray}See CLAUDE.md for type safety best practices${colors.reset}\n`,
	);

	// Exit with 0 since this is informational, not a blocker
	process.exit(0);
}

main();
