/**
 * Playground Integration Tests
 *
 * Comprehensive tests using test fixtures to validate:
 * - Dependency resolution
 * - Multi-level imports
 * - Circular dependency detection
 * - Schema composition
 * - Namespace handling
 */

import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { buildDependencyGraph } from "./graph";
import { mergeSchemas } from "./merger";
import { parseSchema } from "./parser";
import { CircularDependencyError } from "./types";

const fixturesDir = resolve(__dirname, "../../../test/fixtures");

describe("Prisma Build Tool Playground", () => {
	describe("Scenario 1: Single Library (No Dependencies)", () => {
		it("should parse test-auth schema", async () => {
			const authSchema = resolve(fixturesDir, "test-auth/prisma/schema.prisma");

			const parsed = await parseSchema(authSchema);

			expect(parsed.imports).toHaveLength(0);
			expect(parsed.models).toHaveLength(2);
			expect(parsed.dbSchema).toBe("auth");

			// Verify models
			expect(parsed.models.some((m) => m.includes("model User"))).toBe(true);
			expect(parsed.models.some((m) => m.includes("model Session"))).toBe(true);
		});

		it("should build graph for test-auth (single node)", async () => {
			const authSchema = resolve(fixturesDir, "test-auth/prisma/schema.prisma");

			const graph = await buildDependencyGraph(authSchema);

			expect(graph.graph.nodes.size).toBe(1);
			expect(graph.orderedSchemas).toHaveLength(1);
		});

		it("should merge test-auth schema (no imports)", async () => {
			const authSchema = resolve(fixturesDir, "test-auth/prisma/schema.prisma");

			const graph = await buildDependencyGraph(authSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// No imports, so no generation boundary
			expect(merged.content).not.toContain("GENERATED SECTION");
			expect(merged.sources).toHaveLength(0);

			// Should have auth models
			expect(merged.content).toContain("model User");
			expect(merged.content).toContain("model Session");
		});
	});

	describe("Scenario 2: Library Importing Library (Dependency Chain)", () => {
		it("should parse test-blog schema with import", async () => {
			const blogSchema = resolve(fixturesDir, "test-blog/prisma/schema.prisma");

			const parsed = await parseSchema(blogSchema);

			expect(parsed.imports).toHaveLength(1);
			expect(parsed.imports[0]).toContain("test-auth");
			expect(parsed.models).toHaveLength(2);
			expect(parsed.dbSchema).toBe("blog");
		});

		it("should build graph for test-blog importing test-auth", async () => {
			const blogSchema = resolve(fixturesDir, "test-blog/prisma/schema.prisma");

			const graph = await buildDependencyGraph(blogSchema);

			// Should have 2 nodes: test-auth + test-blog
			expect(graph.graph.nodes.size).toBe(2);
			expect(graph.orderedSchemas).toHaveLength(2);

			// test-auth should come before test-blog
			expect(graph.orderedSchemas[0]).toContain("test-auth");
			expect(graph.orderedSchemas[1]).toContain("test-blog");
		});

		it("should compose test-blog with test-auth models", async () => {
			const blogSchema = resolve(fixturesDir, "test-blog/prisma/schema.prisma");

			const graph = await buildDependencyGraph(blogSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Should have generation boundary (has imports)
			expect(merged.content).toContain("GENERATED SECTION");
			expect(merged.sources).toHaveLength(1);

			// Should have auth models (imported)
			expect(merged.content).toContain("model User");
			expect(merged.content).toContain("model Session");

			// Should have blog models (native)
			expect(merged.content).toContain("model Post");
			expect(merged.content).toContain("model Comment");

			// Should have both namespaces
			expect(merged.dbSchemas).toContain("auth");
			expect(merged.dbSchemas).toContain("blog");
		});
	});

	describe("Scenario 3: App Importing Multiple Libraries", () => {
		it("should parse test-app schema with multiple imports", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const parsed = await parseSchema(appSchema);

			expect(parsed.imports).toHaveLength(3);
			expect(parsed.imports).toContain("../../test-auth/prisma/schema.prisma");
			expect(parsed.imports).toContain(
				"../../test-payments/prisma/schema.prisma",
			);
			expect(parsed.imports).toContain("../../test-blog/prisma/schema.prisma");
		});

		it("should build graph with all dependencies", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);

			// Should have 4 nodes: auth, payments, blog, app
			// Note: blog imports auth, so auth appears once
			expect(graph.graph.nodes.size).toBe(4);

			// Ordered schemas should be in dependency order
			// auth (no deps) -> payments (no deps) -> blog (deps on auth) -> app
			expect(graph.orderedSchemas).toHaveLength(4);

			// Auth should be first or second (no dependencies)
			const authIndex = graph.orderedSchemas.findIndex((p) =>
				p.includes("test-auth"),
			);
			const blogIndex = graph.orderedSchemas.findIndex((p) =>
				p.includes("test-blog"),
			);
			const appIndex = graph.orderedSchemas.findIndex((p) =>
				p.includes("test-app"),
			);

			// Auth must come before blog (blog depends on auth)
			expect(authIndex).toBeLessThan(blogIndex);

			// App must be last (depends on everything)
			expect(appIndex).toBe(graph.orderedSchemas.length - 1);
		});

		it("should compose complete app schema with all libraries", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Should have generation boundary
			expect(merged.content).toContain("GENERATED SECTION");
			expect(merged.sources).toHaveLength(3);

			// Verify all imported models
			// From test-auth
			expect(merged.content).toContain("model User");
			expect(merged.content).toContain("model Session");

			// From test-payments
			expect(merged.content).toContain("model Payment");
			expect(merged.content).toContain("model Transaction");
			expect(merged.content).toContain("enum PaymentStatus");

			// From test-blog
			expect(merged.content).toContain("model Post");
			expect(merged.content).toContain("model Comment");

			// From test-app (native)
			expect(merged.content).toContain("model Product");
			expect(merged.content).toContain("model Order");
			expect(merged.content).toContain("enum OrderStatus");

			// Should have all 4 namespaces
			expect(merged.dbSchemas).toContain("auth");
			expect(merged.dbSchemas).toContain("payments");
			expect(merged.dbSchemas).toContain("blog");
			expect(merged.dbSchemas).toContain("public");

			// Verify datasource has all schemas
			expect(merged.content).toContain('"auth"');
			expect(merged.content).toContain('"payments"');
			expect(merged.content).toContain('"blog"');
			expect(merged.content).toContain('"public"');
		});

		it("should preserve all import comments in app schema", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Should preserve all 3 import comments
			expect(merged.content).toContain(
				"// @prisma-import: ../../test-auth/prisma/schema.prisma",
			);
			expect(merged.content).toContain(
				"// @prisma-import: ../../test-payments/prisma/schema.prisma",
			);
			expect(merged.content).toContain(
				"// @prisma-import: ../../test-blog/prisma/schema.prisma",
			);
		});
	});

	describe("Scenario 4: Circular Dependency Detection", () => {
		it("should detect circular dependency between A and B", async () => {
			const circularA = resolve(
				fixturesDir,
				"test-circular-a/prisma/schema.prisma",
			);

			await expect(buildDependencyGraph(circularA)).rejects.toThrow(
				CircularDependencyError,
			);
		});

		it("should show complete cycle path in error", async () => {
			const circularA = resolve(
				fixturesDir,
				"test-circular-a/prisma/schema.prisma",
			);

			try {
				await buildDependencyGraph(circularA);
				expect.fail("Should have thrown CircularDependencyError");
			} catch (error) {
				if (error instanceof CircularDependencyError) {
					// Should have cycle array (may have 2 or 3 elements depending on detection point)
					expect(error.cycle.length).toBeGreaterThanOrEqual(2);
					expect(error.cycle.some((p) => p.includes("test-circular-a"))).toBe(
						true,
					);
					expect(error.cycle.some((p) => p.includes("test-circular-b"))).toBe(
						true,
					);
				} else {
					throw error;
				}
			}
		});

		it("should fail when starting from B as well", async () => {
			const circularB = resolve(
				fixturesDir,
				"test-circular-b/prisma/schema.prisma",
			);

			await expect(buildDependencyGraph(circularB)).rejects.toThrow(
				CircularDependencyError,
			);
		});
	});

	describe("Scenario 5: Model Count Validation", () => {
		it("should correctly count models in single library", async () => {
			const authSchema = resolve(fixturesDir, "test-auth/prisma/schema.prisma");

			const parsed = await parseSchema(authSchema);
			expect(parsed.models).toHaveLength(2);
		});

		it("should correctly count models with imports", async () => {
			const blogSchema = resolve(fixturesDir, "test-blog/prisma/schema.prisma");

			const graph = await buildDependencyGraph(blogSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);

			const totalModels = schemas.reduce((sum, s) => sum + s.models.length, 0);
			expect(totalModels).toBe(4); // 2 from auth + 2 from blog
		});

		it("should correctly count models in complete app", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);

			const totalModels = schemas.reduce((sum, s) => sum + s.models.length, 0);

			// auth: 2, payments: 2, blog: 2, app: 2 = 8 total
			expect(totalModels).toBe(8);
		});
	});

	describe("Scenario 6: Namespace Validation", () => {
		it("should extract correct namespace from test-auth", async () => {
			const authSchema = resolve(fixturesDir, "test-auth/prisma/schema.prisma");

			const parsed = await parseSchema(authSchema);
			expect(parsed.dbSchema).toBe("auth");
		});

		it("should extract correct namespace from test-payments", async () => {
			const paymentsSchema = resolve(
				fixturesDir,
				"test-payments/prisma/schema.prisma",
			);

			const parsed = await parseSchema(paymentsSchema);
			expect(parsed.dbSchema).toBe("payments");
		});

		it("should collect all namespaces in merged schema", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Should have all 4 namespaces
			expect(merged.dbSchemas).toContain("auth");
			expect(merged.dbSchemas).toContain("payments");
			expect(merged.dbSchemas).toContain("blog");
			expect(merged.dbSchemas).toContain("public");
			expect(merged.dbSchemas).toHaveLength(4);
		});

		it("should include all namespaces in datasource.schemas", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Datasource should list all schemas
			expect(merged.content).toContain(
				'schemas  = ["auth", "blog", "payments", "public"]',
			);
		});
	});

	describe("Scenario 7: Generation Boundaries", () => {
		it("should create generation boundary for imports", async () => {
			const blogSchema = resolve(fixturesDir, "test-blog/prisma/schema.prisma");

			const graph = await buildDependencyGraph(blogSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Should have boundary markers
			expect(merged.content).toContain(
				"GENERATED SECTION - DO NOT EDIT MANUALLY",
			);
			expect(merged.content).toContain("END GENERATED SECTION");

			// Should list source in boundary metadata
			expect(merged.content).toContain("Generated from:");
			expect(merged.content).toContain("test-auth/prisma/schema.prisma");

			// Should have timestamp
			expect(merged.content).toContain("Last updated:");
		});

		it("should place imported models inside boundary", async () => {
			const blogSchema = resolve(fixturesDir, "test-blog/prisma/schema.prisma");

			const graph = await buildDependencyGraph(blogSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Find boundary positions
			const startPos = merged.content.indexOf("GENERATED SECTION");
			const endPos = merged.content.indexOf("END GENERATED SECTION");

			expect(startPos).toBeGreaterThan(-1);
			expect(endPos).toBeGreaterThan(startPos);

			// User and Session should be within boundary
			const userPos = merged.content.indexOf("model User");
			const sessionPos = merged.content.indexOf("model Session");

			expect(userPos).toBeGreaterThan(startPos);
			expect(userPos).toBeLessThan(endPos);
			expect(sessionPos).toBeGreaterThan(startPos);
			expect(sessionPos).toBeLessThan(endPos);

			// Post and Comment should be after boundary
			const postPos = merged.content.indexOf("model Post");
			const commentPos = merged.content.indexOf("model Comment");

			expect(postPos).toBeGreaterThan(endPos);
			expect(commentPos).toBeGreaterThan(endPos);
		});
	});

	describe("Scenario 8: Enum Handling", () => {
		it("should extract enums from test-payments", async () => {
			const paymentsSchema = resolve(
				fixturesDir,
				"test-payments/prisma/schema.prisma",
			);

			const parsed = await parseSchema(paymentsSchema);

			expect(parsed.enums).toHaveLength(1);
			expect(parsed.enums[0]).toContain("enum PaymentStatus");
		});

		it("should include enums in merged schema", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			// Should have PaymentStatus from test-payments
			expect(merged.content).toContain("enum PaymentStatus");

			// Should have OrderStatus from test-app
			expect(merged.content).toContain("enum OrderStatus");
		});
	});

	describe("Scenario 9: Complex Dependency Graph", () => {
		it("should handle diamond dependency pattern", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);

			// App imports: auth, payments, blog
			// Blog imports: auth
			// This creates a diamond: app -> (auth, blog) -> auth

			// Auth should only appear once in the graph
			const authCount = graph.orderedSchemas.filter((p) =>
				p.includes("test-auth"),
			).length;
			expect(authCount).toBe(1);

			// Total nodes should be 4 (no duplicates)
			expect(graph.graph.nodes.size).toBe(4);
		});

		it("should order schemas correctly in complex graph", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);

			// Get positions
			const authIdx = graph.orderedSchemas.findIndex((p) =>
				p.includes("test-auth"),
			);
			const paymentsIdx = graph.orderedSchemas.findIndex((p) =>
				p.includes("test-payments"),
			);
			const blogIdx = graph.orderedSchemas.findIndex((p) =>
				p.includes("test-blog"),
			);
			const appIdx = graph.orderedSchemas.findIndex((p) =>
				p.includes("test-app"),
			);

			// Auth must come before blog (blog depends on auth)
			expect(authIdx).toBeLessThan(blogIdx);

			// App must be last (depends on all)
			expect(appIdx).toBe(graph.orderedSchemas.length - 1);

			// Payments can be anywhere before app (no dependencies)
			expect(paymentsIdx).toBeLessThan(appIdx);
		});
	});

	describe("Scenario 10: Import Comment Preservation", () => {
		it("should preserve single import comment", async () => {
			const blogSchema = resolve(fixturesDir, "test-blog/prisma/schema.prisma");

			const graph = await buildDependencyGraph(blogSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			expect(merged.content).toContain(
				"// @prisma-import: ../../test-auth/prisma/schema.prisma",
			);
		});

		it("should preserve multiple import comments in order", async () => {
			const appSchema = resolve(fixturesDir, "test-app/prisma/schema.prisma");

			const graph = await buildDependencyGraph(appSchema);
			const schemas = await Promise.all(
				graph.orderedSchemas.map((p) => parseSchema(p)),
			);
			const merged = await mergeSchemas(schemas);

			const content = merged.content;

			// All three imports should be present
			expect(content).toContain("@prisma-import: ../../test-auth");
			expect(content).toContain("@prisma-import: ../../test-payments");
			expect(content).toContain("@prisma-import: ../../test-blog");

			// They should appear at the top, before datasource
			const importsPos = content.indexOf("@prisma-import:");
			const datasourcePos = content.indexOf("datasource db");
			expect(importsPos).toBeLessThan(datasourcePos);
		});
	});
});
