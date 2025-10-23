/**
 * Prisma Schema Parser
 *
 * Parses Prisma schema files and extracts imports, boundaries, and configuration.
 */

import { readFile } from "node:fs/promises";
import type {
	DatasourceConfig,
	GenerationBoundary,
	GeneratorConfig,
	ParsedSchema,
	PluginBoundary,
	PluginDirective,
} from "./prisma.types";

/**
 * Parse a Prisma schema file
 */
export async function parseSchema(filePath: string): Promise<ParsedSchema> {
	const content = await readFile(filePath, "utf-8");

	return {
		filePath,
		imports: extractImports(content),
		plugins: extractPlugins(content),
		generationBoundary: detectGenerationBoundary(content),
		pluginBoundaries: detectPluginBoundaries(content),
		datasource: parseDatasource(content),
		generators: parseGenerators(content),
		dbSchema: extractDbSchema(content),
		content,
		models: extractModels(content),
		enums: extractEnums(content),
	};
}

/**
 * Extract @prisma-import comments
 */
export function extractImports(content: string): string[] {
	const imports: string[] = [];
	const importRegex = /^\/\/\s*@prisma-import:\s*(.+)$/gm;

	let match: RegExpExecArray | null = importRegex.exec(content);
	while (match !== null) {
		if (match[1]) {
			const importPath = match[1].trim();
			if (importPath) {
				imports.push(importPath);
			}
		}
		match = importRegex.exec(content);
	}

	return imports;
}

/**
 * Detect generation boundary markers
 */
export function detectGenerationBoundary(
	content: string,
): GenerationBoundary | null {
	const startMarker =
		/\/\/\s*={70,}\s*\n\/\/\s*GENERATED SECTION - DO NOT EDIT MANUALLY/i;
	const endMarker = /\/\/\s*END GENERATED SECTION\s*\n\/\/\s*={70,}/i;

	const startMatch = startMarker.exec(content);
	const endMatch = endMarker.exec(content);

	if (!startMatch || !endMatch) {
		return null;
	}

	const startLine = content.substring(0, startMatch.index).split("\n").length;
	const endLine = content.substring(0, endMatch.index).split("\n").length;

	const boundaryContent = content.substring(
		startMatch.index + startMatch[0].length,
		endMatch.index,
	);

	// Extract metadata from comments (supports both "Sources:" and "Generated from:")
	const section = content.substring(startMatch.index, endMatch.index);
	const sources: string[] = [];

	// Try single-line format: // Sources: schema1.prisma, schema2.prisma
	const singleLineMatch = /\/\/\s*Sources:\s*(.+)/i.exec(section);
	if (singleLineMatch?.[1]) {
		const sourcesList = singleLineMatch[1].trim();
		if (sourcesList.includes(",")) {
			sources.push(...sourcesList.split(",").map((s) => s.trim()));
		} else {
			sources.push(sourcesList);
		}
	} else {
		// Try multi-line format: // Sources:\n//   - schema1.prisma
		const multiLineSourcesMatch =
			/\/\/\s*Sources:\s*\n((?:\/\/\s+-\s*.+\n)+)/i.exec(section);
		if (multiLineSourcesMatch?.[1]) {
			const sourcesList = multiLineSourcesMatch[1];
			const sourceMatches = sourcesList.matchAll(/\/\/\s+-\s*(.+)/g);
			for (const match of sourceMatches) {
				const sourcePath = match[1]?.trim();
				if (sourcePath) {
					sources.push(sourcePath);
				}
			}
		} else {
			// Try old format: // Generated from:\n//   - schema1.prisma
			const generatedFromMatch =
				/\/\/\s*Generated from:\s*\n((?:\/\/\s*-\s*.+\n)+)/i.exec(section);
			if (generatedFromMatch?.[1]) {
				const sourcesList = generatedFromMatch[1];
				const sourceLines = sourcesList
					.split("\n")
					.filter((line) => /\/\/\s*-\s*/.test(line));
				for (const line of sourceLines) {
					const source = line.replace(/\/\/\s*-\s*/, "").trim();
					if (source) sources.push(source);
				}
			}
		}
	}

	const timestampMatch = /\/\/\s*Last updated:\s*(.+)/i.exec(section);
	const lastUpdated = timestampMatch?.[1] ? timestampMatch[1].trim() : null;

	return {
		startLine,
		endLine,
		content: boundaryContent,
		metadata: {
			sources,
			lastUpdated,
		},
	};
}

/**
 * Parse datasource configuration
 */
export function parseDatasource(content: string): DatasourceConfig | null {
	const datasourceRegex = /datasource\s+db\s*\{([^}]+)\}/s;
	const match = datasourceRegex.exec(content);

	if (!match) {
		return null;
	}

	const block = match[1];
	if (!block) {
		return null;
	}

	// Extract provider
	const providerMatch = /provider\s*=\s*"([^"]+)"/.exec(block);
	const provider = providerMatch?.[1]?.trim()
		? providerMatch[1].trim()
		: "postgresql";

	// Extract url
	const urlMatch = /url\s*=\s*(.+)/m.exec(block);
	const url = urlMatch?.[1] ? urlMatch[1].trim() : 'env("DATABASE_URL")';

	// Extract schemas array
	const schemasMatch = /schemas\s*=\s*\[([^\]]+)\]/s.exec(block);
	const schemas: string[] = [];
	if (schemasMatch?.[1]) {
		const schemaList = schemasMatch[1];
		const schemaMatches = schemaList.match(/"([^"]+)"/g);
		if (schemaMatches) {
			for (const s of schemaMatches) {
				schemas.push(s.replace(/"/g, ""));
			}
		}
	}

	return { provider, url, schemas };
}

/**
 * Parse generator configurations
 */
export function parseGenerators(content: string): GeneratorConfig[] {
	const generators: GeneratorConfig[] = [];
	const generatorRegex = /generator\s+\w+\s*\{([^}]+)\}/gs;

	let match: RegExpExecArray | null = generatorRegex.exec(content);
	while (match !== null) {
		const block = match[1];

		if (block) {
			// Extract provider
			const providerMatch = /provider\s*=\s*"([^"]+)"/.exec(block);
			const provider = providerMatch ? providerMatch[1] : "prisma-client-js";
			if (provider) {
				// Extract output
				const outputMatch = /output\s*=\s*"([^"]+)"/.exec(block);
				const output = outputMatch ? outputMatch[1] : null;

				// Extract preview features
				const featuresMatch = /previewFeatures\s*=\s*\[([^\]]+)\]/s.exec(block);
				const previewFeatures: string[] = [];
				if (featuresMatch?.[1]) {
					const featureList = featuresMatch[1];
					const featureMatches = featureList.match(/"([^"]+)"/g);
					if (featureMatches) {
						for (const f of featureMatches) {
							previewFeatures.push(f.replace(/"/g, "").trim());
						}
					}
				}

				generators.push({
					provider,
					output: output ?? null,
					previewFeatures,
				});
			}
		}
		match = generatorRegex.exec(content);
	}

	return generators;
}

/**
 * Extract database schema namespace from models
 */
export function extractDbSchema(content: string): string | null {
	const schemaMatch = /@@schema\("([^"]+)"\)/.exec(content);
	return schemaMatch?.[1]?.trim() ?? null;
}

/**
 * Extract model definitions (excluding generated section)
 */
export function extractModels(content: string): string[] {
	// Remove generation boundary content to avoid double-counting imported models
	const contentWithoutGenerated = removeGenerationBoundaryContent(content);

	const models: string[] = [];
	const modelRegex = /^model\s+\w+\s*\{[^}]+\}/gms;

	let match: RegExpExecArray | null = modelRegex.exec(contentWithoutGenerated);
	while (match !== null) {
		models.push(match[0]);
		match = modelRegex.exec(contentWithoutGenerated);
	}

	return models;
}

/**
 * Remove generation boundary content from schema
 */
function removeGenerationBoundaryContent(content: string): string {
	const startMarker =
		/\/\/\s*={70,}\s*\n\/\/\s*GENERATED SECTION - DO NOT EDIT MANUALLY/i;
	const endMarker = /\/\/\s*END GENERATED SECTION\s*\n\/\/\s*={70,}/i;

	const startMatch = startMarker.exec(content);
	const endMatch = endMarker.exec(content);

	if (!startMatch || !endMatch) {
		return content;
	}

	// Remove everything from start to end of generation boundary
	return (
		content.substring(0, startMatch.index) +
		content.substring(endMatch.index + endMatch[0].length)
	);
}

/**
 * Extract enum definitions (excluding generated section)
 */
export function extractEnums(content: string): string[] {
	// Remove generation boundary content to avoid double-counting imported enums
	const contentWithoutGenerated = removeGenerationBoundaryContent(content);

	const enums: string[] = [];
	const enumRegex = /^enum\s+\w+\s*\{[^}]+\}/gms;

	let match: RegExpExecArray | null = enumRegex.exec(contentWithoutGenerated);
	while (match !== null) {
		enums.push(match[0]);
		match = enumRegex.exec(contentWithoutGenerated);
	}

	return enums;
}

/**
 * Extract @prisma-plugin directives
 */
export function extractPlugins(content: string): PluginDirective[] {
	const plugins: PluginDirective[] = [];
	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const pluginMatch = /^\/\/\s*@prisma-plugin:\s*(.+)$/.exec(lines[i] ?? "");
		if (pluginMatch) {
			const name = pluginMatch[1]?.trim() ?? null;
			if (!name) {
				console.warn(`Invalid plugin directive: ${lines[i]}`);
				continue;
			}

			// Look for config on next line
			let config: Record<string, unknown> = {};
			if (i + 1 < lines.length) {
				const configMatch = /^\/\/\s*@prisma-plugin-config:\s*(.+)$/.exec(
					lines[i + 1] ?? "",
				);
				if (configMatch) {
					try {
						config = JSON.parse(configMatch[1]?.trim() ?? "");
					} catch (error) {
						console.warn(`Failed to parse plugin config for ${name}: ${error}`);
					}
				}
			}

			plugins.push({ name, config, line: i });
		}
	}

	return plugins;
}

/**
 * Detect plugin boundary markers
 */
export function detectPluginBoundaries(content: string): PluginBoundary[] {
	const boundaries: PluginBoundary[] = [];
	const lines = content.split("\n");

	for (let i = 0; i < lines.length; i++) {
		const startMatch =
			/^\/\/\s*={70,}\s*\n\/\/\s*GENERATED BY PLUGIN:\s*(.+)/i.exec(
				lines.slice(i, i + 2).join("\n"),
			);

		if (startMatch) {
			const pluginName = startMatch[1]?.trim() ?? null;
			if (!pluginName) {
				console.warn(`Invalid plugin boundary: ${lines[i]}`);
				continue;
			}

			// Find end marker
			for (let j = i + 2; j < lines.length; j++) {
				const endMatch =
					/^\/\/\s*END PLUGIN GENERATED:\s*(.+)\s*\n\/\/\s*={70,}/i.exec(
						lines.slice(j, j + 2).join("\n"),
					);

				if (endMatch?.[1]?.trim() === pluginName) {
					const boundaryContent = lines.slice(i + 2, j).join("\n");

					// Extract metadata
					const sourceMatch = /\/\/\s*Source:\s*(.+)/i.exec(boundaryContent);
					const timestampMatch = /\/\/\s*Last updated:\s*(.+)/i.exec(
						boundaryContent,
					);

					boundaries.push({
						pluginName,
						startLine: i,
						endLine: j + 1,
						content: boundaryContent,
						metadata: {
							source: sourceMatch?.[1]?.trim() ?? null,
							lastUpdated: timestampMatch?.[1]?.trim() ?? null,
						},
					});

					break;
				}
			}
		}
	}

	return boundaries;
}
