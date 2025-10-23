/**
 * Build Command Implementation
 *
 * Main build logic for composing Prisma schemas.
 */

import { exec } from "node:child_process";
import { readFile, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import { buildDependencyGraph } from "./graph";
import { mergeSchemas } from "./merger";
import { parseSchema } from "./parser";
import {
	executePlugins,
	insertPluginContent,
	removePluginBoundaries,
} from "./plugins/executor";
import type { BuildOptions } from "./prisma.types";

const execAsync = promisify(exec);

/**
 * Build composed schema
 */
export async function buildSchema(options: BuildOptions): Promise<void> {
	const { schemaPath, test, dryRun, verbose } = options;

	// 1. Parse entry point schema
	if (verbose) console.log(`Parsing schema: ${schemaPath}`);
	let entrySchema = await parseSchema(schemaPath);

	// 2. Execute plugins (if any)
	if (entrySchema.plugins.length > 0) {
		if (verbose)
			console.log(`Executing ${entrySchema.plugins.length} plugin(s)...`);

		const pluginResults = await executePlugins(entrySchema);

		for (const result of pluginResults) {
			if (verbose) {
				console.log(`  ✓ Plugin: ${result.pluginName}`);
				console.log(
					`    Generated: ${result.metadata.modelCount} model(s), ${result.metadata.enumCount} enum(s)`,
				);
			}
		}

		// Remove old plugin boundaries
		let updatedContent = removePluginBoundaries(entrySchema.content);

		// Insert new plugin content
		updatedContent = insertPluginContent(updatedContent, pluginResults);

		// Write plugin content (even in dry-run, temporarily)
		const originalContent = entrySchema.content;
		await writeFile(schemaPath, updatedContent, "utf-8");

		// Re-parse schema with plugin content
		entrySchema = await parseSchema(schemaPath);

		// In dry-run mode, restore original after parsing
		if (dryRun) {
			// We'll restore after the full build
		} else if (test) {
			// Restore in test mode
			await writeFile(schemaPath, originalContent, "utf-8");
		}
	}

	// 3. Build dependency graph
	if (verbose) console.log("Building dependency graph...");
	const graphResult = await buildDependencyGraph(schemaPath);

	if (verbose) {
		console.log(`  Graph nodes: ${graphResult.graph.nodes.size}`);
		console.log(`  Ordered schemas: ${graphResult.orderedSchemas.length}`);
		for (const schema of graphResult.orderedSchemas) {
			console.log(`    - ${schema}`);
		}
	}

	// 4. Parse all schemas in order
	if (verbose) console.log("Parsing all schemas...");
	const parsedSchemas = await Promise.all(
		graphResult.orderedSchemas.map((path) => parseSchema(path)),
	);

	// 5. Merge schemas
	let finalContent: string;
	let needsWrite = true;

	// If there are imports to merge
	if (parsedSchemas.length > 1) {
		if (verbose) console.log("Merging schemas...");
		const merged = await mergeSchemas(parsedSchemas);

		if (verbose) {
			console.log(`  Merged ${merged.sources.length} imported schema(s)`);
			console.log(`  Database schemas: ${merged.dbSchemas.join(", ")}`);
		}

		finalContent = merged.content;
	} else {
		// No imports - schema is already finalized (with plugins if any)
		if (verbose) console.log("No imports to merge, schema already finalized");
		finalContent = entrySchema.content;

		// If plugins were executed, the file is already written correctly
		if (entrySchema.plugins.length > 0) {
			needsWrite = false; // File already has plugin boundaries
		}
	}

	// 6. Write output (unless dry-run or test)
	if (dryRun) {
		console.log("\n=== DRY RUN - Generated Schema ===\n");
		console.log(finalContent);

		// Restore original schema file if plugins were executed
		if (entrySchema.plugins.length > 0) {
			const original = await readFile(schemaPath, "utf-8");
			// Remove plugin boundaries to get original
			const originalWithoutPlugin = removePluginBoundaries(original);
			await writeFile(schemaPath, originalWithoutPlugin, "utf-8");
		}

		return;
	}

	if (!test && needsWrite) {
		if (verbose) console.log(`Writing to: ${schemaPath}`);
		await writeFile(schemaPath, finalContent, "utf-8");

		// 7. Run prisma generate
		if (verbose) console.log("Running prisma generate...");
		try {
			const schemaDir = schemaPath.includes("/")
				? schemaPath.substring(0, schemaPath.lastIndexOf("/"))
				: schemaPath.substring(0, schemaPath.lastIndexOf("\\"));

			const appRoot = schemaDir.includes("/prisma")
				? schemaDir.substring(0, schemaDir.lastIndexOf("/prisma"))
				: schemaDir.substring(0, schemaDir.lastIndexOf("\\prisma"));

			const { stdout, stderr } = await execAsync("pnpm exec prisma generate", {
				cwd: appRoot,
			});
			if (verbose && stdout) console.log(stdout);
			if (stderr && verbose) console.error(stderr);
		} catch (error) {
			if (verbose) {
				console.error("Warning: prisma generate failed", error);
			}
		}
	}

	// Success summary
	const totalModels = parsedSchemas.reduce(
		(sum, s) => sum + s.models.length,
		0,
	);
	const importCount = parsedSchemas.length > 1 ? parsedSchemas.length - 1 : 0;

	// Collect all namespaces
	const allNamespaces = new Set<string>();
	for (const schema of parsedSchemas) {
		if (schema.dbSchema) {
			allNamespaces.add(schema.dbSchema);
		}
		if (schema.datasource) {
			for (const s of schema.datasource.schemas) {
				allNamespaces.add(s);
			}
		}
	}

	console.log("\n✓ Schema built successfully!");
	console.log(`  Models: ${totalModels}`);
	if (importCount > 0) {
		console.log(`  Imported: ${importCount}`);
	}
	console.log(`  Namespaces: ${Array.from(allNamespaces).join(", ")}`);
}
