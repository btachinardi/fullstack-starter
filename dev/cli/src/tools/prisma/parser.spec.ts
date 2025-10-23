/**
 * Tests for Prisma Schema Parser
 */

import { describe, expect, it } from "vitest";
import {
	detectGenerationBoundary,
	detectPluginBoundaries,
	extractDbSchema,
	extractEnums,
	extractImports,
	extractModels,
	extractPlugins,
	parseDatasource,
	parseGenerators,
} from "./parser.js";

describe("Schema Parser", () => {
	describe("extractImports", () => {
		it("should extract single import", () => {
			const schema = `
// @prisma-import: @libs/api/prisma/schema.prisma

datasource db {
  provider = "postgresql"
}
      `;

			const imports = extractImports(schema);
			expect(imports).toEqual(["@libs/api/prisma/schema.prisma"]);
		});

		it("should extract multiple imports", () => {
			const schema = `
// @prisma-import: @libs/auth/prisma/schema.prisma
// @prisma-import: @libs/payments/prisma/schema.prisma

datasource db {
  provider = "postgresql"
}
      `;

			const imports = extractImports(schema);
			expect(imports).toEqual([
				"@libs/auth/prisma/schema.prisma",
				"@libs/payments/prisma/schema.prisma",
			]);
		});

		it("should return empty array when no imports", () => {
			const schema = `
datasource db {
  provider = "postgresql"
}
      `;

			const imports = extractImports(schema);
			expect(imports).toEqual([]);
		});

		it("should handle imports with extra whitespace", () => {
			const schema = `
//   @prisma-import:   @libs/api/prisma/schema.prisma

datasource db {}
      `;

			const imports = extractImports(schema);
			expect(imports).toEqual(["@libs/api/prisma/schema.prisma"]);
		});
	});

	describe("detectGenerationBoundary", () => {
		it("should detect generation boundary", () => {
			const schema = `
// ============================================================================
// GENERATED SECTION - DO NOT EDIT MANUALLY
// This section is automatically generated
// Generated from:
//   - @libs/api/prisma/schema.prisma
// Last updated: 2024-10-23T12:00:00Z
// ============================================================================

model User {
  id String @id
}

// ============================================================================
// END GENERATED SECTION
// ============================================================================
      `;

			const boundary = detectGenerationBoundary(schema);
			expect(boundary).not.toBeNull();
			expect(boundary?.metadata.sources).toEqual([
				"@libs/api/prisma/schema.prisma",
			]);
			expect(boundary?.metadata.lastUpdated).toBe("2024-10-23T12:00:00Z");
		});

		it("should return null when no boundary", () => {
			const schema = `
model User {
  id String @id
}
      `;

			const boundary = detectGenerationBoundary(schema);
			expect(boundary).toBeNull();
		});

		it("should extract content between boundaries", () => {
			const schema = `
// ============================================================================
// GENERATED SECTION - DO NOT EDIT MANUALLY
// ============================================================================

model User { id String @id }

// ============================================================================
// END GENERATED SECTION
// ============================================================================
      `;

			const boundary = detectGenerationBoundary(schema);
			expect(boundary?.content).toContain("model User");
		});
	});

	describe("parseDatasource", () => {
		it("should parse basic datasource", () => {
			const schema = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
      `;

			const datasource = parseDatasource(schema);
			expect(datasource).toEqual({
				provider: "postgresql",
				url: 'env("DATABASE_URL")',
				schemas: [],
			});
		});

		it("should parse datasource with schemas array", () => {
			const schema = `
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  schemas  = ["public", "auth"]
}
      `;

			const datasource = parseDatasource(schema);
			expect(datasource?.schemas).toEqual(["public", "auth"]);
		});

		it("should return null when no datasource", () => {
			const schema = `model User { id String @id }`;

			const datasource = parseDatasource(schema);
			expect(datasource).toBeNull();
		});
	});

	describe("parseGenerators", () => {
		it("should parse generator with output", () => {
			const schema = `
generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}
      `;

			const generators = parseGenerators(schema);
			expect(generators).toHaveLength(1);
			expect(generators[0]).toEqual({
				provider: "prisma-client-js",
				output: "../src/generated/prisma",
				previewFeatures: [],
			});
		});

		it("should parse generator with preview features", () => {
			const schema = `
generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["multiSchema", "fullTextSearch"]
}
      `;

			const generators = parseGenerators(schema);
			expect(generators[0].previewFeatures).toEqual([
				"multiSchema",
				"fullTextSearch",
			]);
		});

		it("should parse multiple generators", () => {
			const schema = `
generator client {
  provider = "prisma-client-js"
}

generator typegraphql {
  provider = "typegraphql-prisma"
}
      `;

			const generators = parseGenerators(schema);
			expect(generators).toHaveLength(2);
		});
	});

	describe("extractDbSchema", () => {
		it("should extract schema directive", () => {
			const schema = `
model User {
  id String @id

  @@schema("auth")
}
      `;

			const dbSchema = extractDbSchema(schema);
			expect(dbSchema).toBe("auth");
		});

		it("should return null when no schema directive", () => {
			const schema = `model User { id String @id }`;

			const dbSchema = extractDbSchema(schema);
			expect(dbSchema).toBeNull();
		});
	});

	describe("extractModels", () => {
		it("should extract single model", () => {
			const schema = `
model User {
  id    String @id
  email String @unique
}
      `;

			const models = extractModels(schema);
			expect(models).toHaveLength(1);
			expect(models[0]).toContain("model User");
		});

		it("should extract multiple models", () => {
			const schema = `
model User {
  id String @id
}

model Post {
  id String @id
}

model Comment {
  id String @id
}
      `;

			const models = extractModels(schema);
			expect(models).toHaveLength(3);
		});

		it("should handle models with relations", () => {
			const schema = `
model User {
  id    String @id
  posts Post[]
}

model Post {
  id       String @id
  authorId String
  author   User   @relation(fields: [authorId], references: [id])
}
      `;

			const models = extractModels(schema);
			expect(models).toHaveLength(2);
			expect(models[1]).toContain("@relation");
		});
	});

	describe("extractEnums", () => {
		it("should extract enum definitions", () => {
			const schema = `
enum Role {
  USER
  ADMIN
}

enum Status {
  ACTIVE
  INACTIVE
}
      `;

			const enums = extractEnums(schema);
			expect(enums).toHaveLength(2);
			expect(enums[0]).toContain("enum Role");
			expect(enums[1]).toContain("enum Status");
		});

		it("should return empty array when no enums", () => {
			const schema = `model User { id String @id }`;

			const enums = extractEnums(schema);
			expect(enums).toEqual([]);
		});
	});

	describe("extractPlugins", () => {
		it("should extract single plugin directive", () => {
			const schema = `
// @prisma-plugin: better-auth
// @prisma-plugin-config: { "source": "../auth/auth.config.ts" }

datasource db {
  provider = "postgresql"
}
      `;

			const plugins = extractPlugins(schema);
			expect(plugins).toHaveLength(1);
			expect(plugins[0].name).toBe("better-auth");
			expect(plugins[0].config).toEqual({ source: "../auth/auth.config.ts" });
		});

		it("should extract multiple plugin directives", () => {
			const schema = `
// @prisma-plugin: better-auth
// @prisma-plugin-config: { "source": "../auth/auth.config.ts" }

// @prisma-plugin: audit-fields
// @prisma-plugin-config: { "models": ["User", "Post"] }

datasource db {}
      `;

			const plugins = extractPlugins(schema);
			expect(plugins).toHaveLength(2);
			expect(plugins[0].name).toBe("better-auth");
			expect(plugins[1].name).toBe("audit-fields");
		});

		it("should handle plugin without config", () => {
			const schema = `
// @prisma-plugin: simple-plugin

datasource db {}
      `;

			const plugins = extractPlugins(schema);
			expect(plugins).toHaveLength(1);
			expect(plugins[0].name).toBe("simple-plugin");
			expect(plugins[0].config).toEqual({});
		});

		it("should return empty array when no plugins", () => {
			const schema = `datasource db { provider = "postgresql" }`;

			const plugins = extractPlugins(schema);
			expect(plugins).toEqual([]);
		});
	});

	describe("detectPluginBoundaries", () => {
		it("should detect plugin boundary", () => {
			const schema = `
// ============================================================================
// GENERATED BY PLUGIN: better-auth
// Source: ../auth/auth.config.ts
// Last updated: 2024-10-23T12:00:00Z
// ============================================================================

model User {
  id String @id
}

// ============================================================================
// END PLUGIN GENERATED: better-auth
// ============================================================================
      `;

			const boundaries = detectPluginBoundaries(schema);
			expect(boundaries).toHaveLength(1);
			expect(boundaries[0].pluginName).toBe("better-auth");
			expect(boundaries[0].metadata.source).toBe("../auth/auth.config.ts");
			expect(boundaries[0].metadata.lastUpdated).toBe("2024-10-23T12:00:00Z");
		});

		it("should return empty array when no plugin boundaries", () => {
			const schema = `model User { id String @id }`;

			const boundaries = detectPluginBoundaries(schema);
			expect(boundaries).toEqual([]);
		});
	});
});
