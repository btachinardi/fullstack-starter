/**
 * Better Auth Plugin
 *
 * Generates Prisma schema from Better Auth configuration.
 */

import { exec } from "node:child_process";
import { dirname, resolve } from "node:path";
import { promisify } from "node:util";
import type { PluginContext, PrismaPlugin } from "../types";

const execAsync = promisify(exec);

/**
 * Better Auth plugin implementation
 */
export const betterAuthPlugin: PrismaPlugin = {
	name: "better-auth",
	description: "Generate auth models from Better Auth configuration",

	async generate(
		config: Record<string, unknown>,
		context: PluginContext,
	): Promise<string> {
		// Validate config
		if (!config.source || typeof config.source !== "string") {
			throw new Error(
				'better-auth plugin requires "source" config pointing to auth config file',
			);
		}

		const provider =
			(config.provider as string) || context.provider || "postgresql";

		// Resolve source path relative to schema
		const schemaDir = dirname(context.schemaPath);
		const configPath = resolve(schemaDir, config.source as string);

		try {
			// Execute Better Auth CLI
			const command = `npx @better-auth/cli generate --config="${configPath}" --adapter=prisma --provider=${provider} --output=stdout`;

			const { stdout, stderr } = await execAsync(command, {
				cwd: schemaDir,
			});

			if (stderr) {
				console.warn(`Better Auth CLI stderr: ${stderr}`);
			}

			// Parse generated schema
			let generated = extractSchemaContent(stdout);

			// Apply namespace if specified
			if (context.namespace) {
				generated = applyNamespaceToModels(generated, context.namespace);
			}

			return generated;
		} catch (error) {
			throw new Error(
				`Failed to execute Better Auth CLI: ${error instanceof Error ? error.message : String(error)}`,
			);
		}
	},

	validate(config: Record<string, unknown>): boolean {
		return !!config.source && typeof config.source === "string";
	},
};

/**
 * Extract schema content from Better Auth CLI output
 */
function extractSchemaContent(output: string): string {
	// Better Auth CLI may output the schema with markers or directly
	// For now, assume it outputs raw schema content
	// Remove any datasource/generator blocks as they'll be from our schema
	let schema = output;

	// Remove datasource block
	schema = schema.replace(/datasource\s+db\s*\{[^}]+\}/gs, "");

	// Remove generator blocks
	schema = schema.replace(/generator\s+\w+\s*\{[^}]+\}/gs, "");

	return schema.trim();
}

/**
 * Apply namespace to all models in generated content
 */
function applyNamespaceToModels(content: string, namespace: string): string {
	// Add @@schema directive to models that don't have it
	const lines = content.split("\n");
	const result: string[] = [];
	let inModel = false;
	let modelBuffer: string[] = [];

	for (const line of lines) {
		if (line.match(/^model\s+\w+/)) {
			inModel = true;
			modelBuffer = [line];
		} else if (inModel) {
			modelBuffer.push(line);

			if (line.trim() === "}") {
				// End of model - check if it has @@schema
				const modelContent = modelBuffer.join("\n");
				if (!modelContent.includes("@@schema(")) {
					// Add @@schema before closing brace
					const lastLine = modelBuffer.pop();
					modelBuffer.push(`  @@schema("${namespace}")`);
					if (lastLine) modelBuffer.push(lastLine);
				}

				result.push(...modelBuffer);
				inModel = false;
				modelBuffer = [];
			}
		} else {
			result.push(line);
		}
	}

	return result.join("\n");
}
