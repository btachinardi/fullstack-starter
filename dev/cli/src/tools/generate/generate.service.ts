/**
 * Generate Service
 *
 * Business logic for scaffolding new tools in the CLI.
 */

import { mkdir, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import {
	generateIndexTemplate,
	generateInstructions,
	generateServiceTemplate,
	generateTypesTemplate,
} from "./generate.templates.js";
import type {
	GeneratedFile,
	GenerateToolOptions,
	GenerateToolResult,
} from "./generate.types.js";

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Generate a new tool with vertical module structure
 *
 * Creates a new tool directory with:
 * - <toolName>.types.ts - Type definitions
 * - <toolName>.service.ts - Business logic
 * - index.ts - Barrel export
 *
 * @param options - Tool generation options
 * @returns Generated files and instructions
 */
export async function generateTool(
	options: GenerateToolOptions,
): Promise<GenerateToolResult> {
	const { toolName, description = `${toolName} functionality` } = options;

	// Validate tool name
	validateToolName(toolName);

	// Determine output directory
	const outputDir =
		options.outputDir ||
		resolve(process.cwd(), "dev", "cli", "src", "tools", toolName);

	// Generate file contents
	const files: GeneratedFile[] = [
		{
			path: join(outputDir, `${toolName}.types.ts`),
			content: generateTypesTemplate(toolName, description),
			description: "Type definitions",
		},
		{
			path: join(outputDir, `${toolName}.service.ts`),
			content: generateServiceTemplate(toolName, description),
			description: "Business logic",
		},
		{
			path: join(outputDir, "index.ts"),
			content: generateIndexTemplate(toolName),
			description: "Barrel export",
		},
	];

	// Create directory
	await mkdir(outputDir, { recursive: true });

	// Write files
	for (const file of files) {
		await writeFile(file.path, file.content, "utf-8");
	}

	// Generate instructions
	const instructions = generateInstructions(toolName);

	return {
		files,
		toolName,
		instructions,
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate tool name format
 *
 * Tool names must:
 * - Start with a lowercase letter
 * - Contain only lowercase letters and hyphens
 * - Not start or end with a hyphen
 * - Be at least 2 characters long
 */
function validateToolName(toolName: string): void {
	if (!toolName || toolName.length < 2) {
		throw new Error(
			"Tool name must be at least 2 characters long (e.g., 'myTool')",
		);
	}

	if (!/^[a-z][a-z-]*[a-z]$/.test(toolName) && !/^[a-z]$/.test(toolName)) {
		throw new Error(
			"Tool name must start with a lowercase letter and contain only lowercase letters and hyphens (e.g., 'myTool' or 'my-tool')",
		);
	}

	// Reserved names
	const reservedNames = [
		"session",
		"logs",
		"tasks",
		"prisma",
		"generate",
		"help",
		"version",
	];
	if (reservedNames.includes(toolName)) {
		throw new Error(
			`Tool name "${toolName}" is reserved. Please choose a different name.`,
		);
	}
}
