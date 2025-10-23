/**
 * Tests for Schema Merger
 */

import { describe, expect, it } from "vitest";
import { mergeSchemas } from "./merger.js";
import type { ParsedSchema } from "./prisma.types.js";

describe("Schema Merger", () => {
	describe("mergeSchemas", () => {
		it("should merge library and app schemas", async () => {
			const libSchema: ParsedSchema = {
				filePath: "libs/api/prisma/schema.prisma",
				imports: [],
				plugins: [],
				generationBoundary: null,
				pluginBoundaries: [],
				datasource: {
					provider: "postgresql",
					url: 'env("DATABASE_URL")',
					schemas: ["auth"],
				},
				generators: [
					{
						provider: "prisma-client-js",
						output: "../src/generated/prisma",
						previewFeatures: ["multiSchema"],
					},
				],
				dbSchema: "auth",
				content: "",
				models: [
					`model User {
  id    String @id
  email String @unique

  @@schema("auth")
}`,
				],
				enums: [],
			};

			const appSchema: ParsedSchema = {
				filePath: "apps/api/prisma/schema.prisma",
				imports: ["@libs/api/prisma/schema.prisma"],
				plugins: [],
				generationBoundary: null,
				pluginBoundaries: [],
				datasource: {
					provider: "postgresql",
					url: 'env("DATABASE_URL")',
					schemas: ["public", "auth"],
				},
				generators: [
					{
						provider: "prisma-client-js",
						output: "../src/generated/prisma",
						previewFeatures: ["multiSchema"],
					},
				],
				dbSchema: "public",
				content: `
model Post {
  id String @id
  @@schema("public")
}
        `,
				models: [
					`model Post {
  id String @id

  @@schema("public")
}`,
				],
				enums: [],
			};

			const merged = await mergeSchemas([libSchema, appSchema]);

			// Should include import comment
			expect(merged.content).toContain("// @prisma-import:");

			// Should include datasource with both schemas
			expect(merged.content).toContain('schemas  = ["auth", "public"]');

			// Should include generation boundary
			expect(merged.content).toContain("GENERATED SECTION");

			// Should include User model from library
			expect(merged.content).toContain("model User");
			expect(merged.content).toContain('@@schema("auth")');

			// Should include Post model from app
			expect(merged.content).toContain("model Post");
			expect(merged.content).toContain('@@schema("public")');

			// Should have correct metadata
			expect(merged.sources).toHaveLength(1);
			expect(merged.dbSchemas).toContain("auth");
			expect(merged.dbSchemas).toContain("public");
		});

		it("should handle app schema with no imports", async () => {
			const appSchema: ParsedSchema = {
				filePath: "apps/api/prisma/schema.prisma",
				imports: [],
				plugins: [],
				generationBoundary: null,
				pluginBoundaries: [],
				datasource: {
					provider: "postgresql",
					url: 'env("DATABASE_URL")',
					schemas: ["public"],
				},
				generators: [
					{
						provider: "prisma-client-js",
						output: "../src/generated/prisma",
						previewFeatures: [],
					},
				],
				dbSchema: "public",
				content: "",
				models: [
					`model Post {
  id String @id

  @@schema("public")
}`,
				],
				enums: [],
			};

			const merged = await mergeSchemas([appSchema]);

			// Should not include generation boundary
			expect(merged.content).not.toContain("GENERATED SECTION");

			// Should include datasource
			expect(merged.content).toContain("datasource db");

			// Should include Post model
			expect(merged.content).toContain("model Post");

			// Metadata
			expect(merged.sources).toHaveLength(0);
		});

		it("should throw error when no schemas provided", async () => {
			await expect(mergeSchemas([])).rejects.toThrow("No schemas to merge");
		});
	});
});
