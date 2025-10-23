/**
 * Generate Tool Templates
 *
 * Template strings for scaffolding new tools.
 */

/**
 * Generate types file template
 */
export function generateTypesTemplate(
	toolName: string,
	description: string,
): string {
	const pascalCaseName = toPascalCase(toolName);

	return `/**
 * ${pascalCaseName} Tool Types
 *
 * Type definitions for ${description}.
 */

// ============================================================================
// Input/Output Types
// ============================================================================

export interface ${pascalCaseName}Options {
	// Add your option properties here
	// Example: filePath?: string;
}

export interface ${pascalCaseName}Result {
	// Add your result properties here
	// Example: success: boolean;
	// Example: message: string;
}

// ============================================================================
// Domain Types
// ============================================================================

// Add your domain-specific types here
`;
}

/**
 * Generate service file template
 */
export function generateServiceTemplate(
	toolName: string,
	description: string,
): string {
	const pascalCaseName = toPascalCase(toolName);
	const camelCaseName = toCamelCase(toolName);

	return `/**
 * ${pascalCaseName} Service
 *
 * Business logic for ${description}.
 */

import type { ${pascalCaseName}Options, ${pascalCaseName}Result } from "./${toolName}.types.js";

// ============================================================================
// Public API Functions
// ============================================================================

/**
 * Main ${toolName} function
 *
 * @param options - Configuration options
 * @returns Result object
 */
export async function ${camelCaseName}Main(
	options: ${pascalCaseName}Options,
): Promise<${pascalCaseName}Result> {
	// TODO: Implement your tool logic here

	return {
		// TODO: Return your result
	};
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Helper function example
 */
function helperFunction(): void {
	// TODO: Implement helper logic
}
`;
}

/**
 * Generate index file template
 */
export function generateIndexTemplate(toolName: string): string {
	const pascalCaseName = toPascalCase(toolName);

	return `/**
 * ${pascalCaseName} Tool Module
 *
 * Barrel export for ${toolName} tool functionality.
 */

export * from "./${toolName}.types.js";
export * from "./${toolName}.service.js";
`;
}

/**
 * Generate main.ts command registration snippet
 */
export function generateCommandSnippet(
	toolName: string,
	description: string,
): string {
	const pascalCaseName = toPascalCase(toolName);
	const camelCaseName = toCamelCase(toolName);
	const constName = toConstName(toolName);

	return `
// ============================================================================
// ${pascalCaseName} Tool
// ============================================================================

import * as ${camelCaseName}Tools from "../tools/${toolName}/index.js";

const ${constName} = program
	.command("${toolName}")
	.description("${description}");

// ----------------------------------------------------------------------------
// ${toolName} <subcommand>
// ----------------------------------------------------------------------------

${constName}
	.command("run")
	.description("Run the ${toolName} tool")
	.option("-o, --option <value>", "Example option")
	.action(async (options: { option?: string }) => {
		const spinner = ora("Running ${toolName}...").start();

		try {
			const result = await ${camelCaseName}Tools.${camelCaseName}Main({
				// Pass options here
			});

			spinner.succeed("${pascalCaseName} completed successfully");

			// Display results
			console.log(chalk.bold("\\n✓ Results\\n"));
			// TODO: Format and display your results

		} catch (error) {
			spinner.fail("Failed to run ${toolName}");
			console.error(chalk.red(getErrorMessage(error)));
			process.exit(1);
		}
	});
`;
}

/**
 * Generate next steps instructions
 */
export function generateInstructions(toolName: string): string {
	const pascalCaseName = toPascalCase(toolName);
	const camelCaseName = toCamelCase(toolName);

	return `
# ${pascalCaseName} Tool - Next Steps

Your new tool has been scaffolded successfully! Here's how to complete the setup:

## 1. Files Generated

The following files have been created in \`dev/cli/src/tools/${toolName}/\`:

- **${toolName}.types.ts** - Type definitions for your tool
- **${toolName}.service.ts** - Business logic implementation
- **index.ts** - Barrel export for clean imports

## 2. Wire Up in main.ts

Add the following code to \`dev/cli/src/cli/main.ts\` to register your tool:

\`\`\`typescript
${generateCommandSnippet(toolName, `${pascalCaseName} functionality`)}
\`\`\`

**Location:** Add this after the existing tool commands (e.g., after Tasks Tool section)

## 3. Implement Your Logic

1. **Update types** in \`${toolName}.types.ts\`:
   - Define your input options interface
   - Define your result interface
   - Add any domain-specific types

2. **Implement service** in \`${toolName}.service.ts\`:
   - Add your main business logic in \`${toolName}Main()\`
   - Create helper functions as needed
   - Use shared services from \`../../shared/services/\` if needed

3. **Add commands** in main.ts:
   - Register subcommands for your tool
   - Add option parsing
   - Format output with chalk and ora

## 4. Usage Pattern

Each file follows our vertical module pattern:

### Types File (\`${toolName}.types.ts\`)
- Input/Output types (Options and Result interfaces)
- Domain-specific types
- No imports needed (pure type definitions)

### Service File (\`${toolName}.service.ts\`)
- Public API functions (exported)
- Helper functions (private)
- Imports types from \`./${toolName}.types.js\`
- Can import shared services from \`../../shared/\`

### Index File (\`index.ts\`)
- Re-exports types and service
- Provides clean import path: \`import { ... } from '../tools/${toolName}'\`

## 5. Example Implementation

Here's a minimal working example:

**${toolName}.types.ts:**
\`\`\`typescript
export interface ${pascalCaseName}Options {
	filePath: string;
}

export interface ${pascalCaseName}Result {
	success: boolean;
	message: string;
}
\`\`\`

**${toolName}.service.ts:**
\`\`\`typescript
import type { ${pascalCaseName}Options, ${pascalCaseName}Result } from "./${toolName}.types.js";

export async function ${camelCaseName}Main(
	options: ${pascalCaseName}Options,
): Promise<${pascalCaseName}Result> {
	// Your logic here
	return {
		success: true,
		message: \`Processed \${options.filePath}\`,
	};
}
\`\`\`

## 6. Test Your Tool

Run your tool using:
\`\`\`bash
pnpm tools ${toolName} run --option value
\`\`\`

## 7. Best Practices

- Keep types in the types file (no logic)
- Keep business logic in the service file
- Use helper functions for internal logic
- Export only what's needed in the public API
- Follow the NestJS-like naming convention: \`<tool>.types.ts\`, \`<tool>.service.ts\`
- Import shared utilities from \`../../shared/\` when needed

Happy coding! 🚀
`;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Convert kebab-case or camelCase to PascalCase
 * Examples: my-tool -> MyTool, myTool -> MyTool
 */
function toPascalCase(str: string): string {
	return str
		.split(/[-_]/)
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join("");
}

/**
 * Convert kebab-case to camelCase
 * Examples: my-tool -> myTool, myTool -> myTool
 */
function toCamelCase(str: string): string {
	const pascal = toPascalCase(str);
	return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

/**
 * Convert to valid const name (camelCase, handling hyphens)
 * Examples: my-tool -> myTool, myTool -> myTool
 */
function toConstName(str: string): string {
	return toCamelCase(str);
}
