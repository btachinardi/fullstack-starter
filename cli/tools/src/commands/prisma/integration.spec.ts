/**
 * Integration Tests for Prisma Build Tool
 *
 * These tests verify the complete build workflow with real files.
 */

import { constants } from "node:fs";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildDependencyGraph } from "./graph";
import { mergeSchemas } from "./merger";
import { parseSchema } from "./parser";

describe("Prisma Build Tool Integration", () => {
	// Get workspace root (go up from cli/tools to project root)
	const workspaceRoot = resolve(process.cwd(), "../..");
	const libsApiSchema = resolve(workspaceRoot, "libs/api/prisma/schema.prisma");
	const appsApiSchema = resolve(workspaceRoot, "apps/api/prisma/schema.prisma");

	describe("Real Schema Files", () => {
		it("should parse libs/api schema", async () => {
			// Check file exists
			await expect(
				access(libsApiSchema, constants.R_OK),
			).resolves.toBeUndefined();

			const parsed = await parseSchema(libsApiSchema);

			expect(parsed.filePath).toBe(libsApiSchema);
			expect(parsed.datasource).not.toBeNull();
			expect(parsed.generators).toHaveLength(1);
			expect(parsed.models.length).toBeGreaterThan(0);

			// Should have auth models
			const content = await readFile(libsApiSchema, "utf-8");
			expect(content).toContain("model User");
			expect(content).toContain('@@schema("auth")');
		});

		it("should parse apps/api schema with import", async () => {
			// Check file exists
			await expect(
				access(appsApiSchema, constants.R_OK),
			).resolves.toBeUndefined();

			const parsed = await parseSchema(appsApiSchema);

			expect(parsed.imports).toContain("@libs/api/prisma/schema.prisma");
			expect(parsed.datasource).not.toBeNull();
			expect(parsed.datasource?.schemas).toContain("public");
			expect(parsed.datasource?.schemas).toContain("auth");
		});
	});

	describe("Dependency Graph Building", () => {
		it("should build graph for apps/api importing libs/api", async () => {
			const graphResult = await buildDependencyGraph(appsApiSchema);

			// Should have 2 nodes (libs/api + apps/api)
			expect(graphResult.graph.nodes.size).toBe(2);

			// Should have both schemas in order
			expect(graphResult.orderedSchemas).toHaveLength(2);

			// libs/api should come before apps/api (dependency first)
			expect(graphResult.orderedSchemas[0]).toContain("libs");
			expect(graphResult.orderedSchemas[1]).toContain("apps");
		});

		it("should detect imports in apps/api", async () => {
			const parsed = await parseSchema(appsApiSchema);

			expect(parsed.imports).toHaveLength(1);
			expect(parsed.imports[0]).toBe("@libs/api/prisma/schema.prisma");
		});
	});

	describe("Complete Build Workflow", () => {
		it("should compose schemas correctly", async () => {
			// 1. Build dependency graph
			const graphResult = await buildDependencyGraph(appsApiSchema);

			// 2. Parse all schemas in order
			const parsedSchemas = await Promise.all(
				graphResult.orderedSchemas.map((path) => parseSchema(path)),
			);

			// 3. Merge schemas
			const merged = await mergeSchemas(parsedSchemas);

			// Verify output
			expect(merged.content).toContain("datasource db");
			expect(merged.content).toContain("generator client");

			// Should have generation boundary
			expect(merged.content).toContain("GENERATED SECTION");
			expect(merged.content).toContain("END GENERATED SECTION");

			// Should have auth models from libs/api
			expect(merged.content).toContain("model User");
			expect(merged.content).toContain("model Session");
			expect(merged.content).toContain("model Account");
			expect(merged.content).toContain("model Verification");

			// Should have app models
			expect(merged.content).toContain("model Link");

			// Should have correct schemas in datasource
			expect(merged.content).toContain('"auth"');
			expect(merged.content).toContain('"public"');

			// Verify metadata
			expect(merged.sources).toHaveLength(1);
			expect(merged.dbSchemas).toContain("auth");
			expect(merged.dbSchemas).toContain("public");
		});
	});
});
