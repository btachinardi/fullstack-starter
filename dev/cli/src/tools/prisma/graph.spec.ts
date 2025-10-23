/**
 * Tests for Dependency Graph Builder
 */

import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { resolveWorkspacePath } from "./graph.js";

describe("Dependency Graph", () => {
	describe("resolveWorkspacePath", () => {
		it("should resolve @libs workspace path", () => {
			const currentFile = resolve(
				process.cwd(),
				"apps/api/prisma/schema.prisma",
			);
			const importPath = "@libs/api/prisma/schema.prisma";

			const resolved = resolveWorkspacePath(importPath, currentFile);

			expect(resolved).toContain("libs");
			expect(resolved).toContain("api");
			expect(resolved).toContain("schema.prisma");
		});

		it("should resolve @apps workspace path", () => {
			const currentFile = resolve(
				process.cwd(),
				"libs/api/prisma/schema.prisma",
			);
			const importPath = "@apps/api/prisma/schema.prisma";

			const resolved = resolveWorkspacePath(importPath, currentFile);

			expect(resolved).toContain("apps");
			expect(resolved).toContain("api");
			expect(resolved).toContain("schema.prisma");
		});

		it("should resolve relative path", () => {
			const currentFile = resolve(
				process.cwd(),
				"apps/api/prisma/schema.prisma",
			);
			const importPath = "../../libs/api/prisma/schema.prisma";

			const resolved = resolveWorkspacePath(importPath, currentFile);

			expect(resolved).toContain("libs");
			expect(resolved).toContain("api");
		});

		it("should return absolute paths", () => {
			const currentFile = resolve(
				process.cwd(),
				"apps/api/prisma/schema.prisma",
			);
			const importPath = "@libs/api/prisma/schema.prisma";

			const resolved = resolveWorkspacePath(importPath, currentFile);

			// Should be an absolute path
			expect(resolve(resolved)).toBe(resolved);
		});
	});

	// Note: buildDependencyGraph requires file system access
	// These would be integration tests, not unit tests
	// They should be in a separate integration test file
});
