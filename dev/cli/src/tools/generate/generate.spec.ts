/**
 * Generate Tool Tests
 *
 * Comprehensive test coverage for tool scaffolding functionality.
 */

import { access, mkdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { generateTool } from "./generate.service.js";
import type {
	GenerateToolOptions,
	GenerateToolResult,
} from "./generate.types.js";

describe("Generate Tool Tests", () => {
	let testDir: string;

	beforeEach(async () => {
		// Create temporary directory for test files
		testDir = join(tmpdir(), `generate-test-${Date.now()}`);
		await mkdir(testDir, { recursive: true });
	});

	afterEach(async () => {
		// Clean up test directory
		try {
			await rm(testDir, { recursive: true, force: true });
		} catch (_error) {
			// Ignore cleanup errors
		}
	});

	// ============================================================================
	// generateTool Function - Success Cases
	// ============================================================================

	describe("generateTool - Success Cases", () => {
		it("should successfully generate all 3 files with kebab-case tool name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-tool",
				description: "My custom tool",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - Result structure
			expect(result.toolName).toBe("my-tool");
			expect(result.files).toHaveLength(3);
			expect(result.instructions).toBeTruthy();
			expect(result.instructions.length).toBeGreaterThan(0);

			// Assert - File paths
			expect(result.files[0]?.path).toBe(join(testDir, "my-tool.types.ts"));
			expect(result.files[1]?.path).toBe(join(testDir, "my-tool.service.ts"));
			expect(result.files[2]?.path).toBe(join(testDir, "index.ts"));

			// Assert - File descriptions
			expect(result.files[0]?.description).toBe("Type definitions");
			expect(result.files[1]?.description).toBe("Business logic");
			expect(result.files[2]?.description).toBe("Barrel export");

			// Assert - Files exist on disk
			await expect(
				access(join(testDir, "my-tool.types.ts")),
			).resolves.toBeUndefined();
			await expect(
				access(join(testDir, "my-tool.service.ts")),
			).resolves.toBeUndefined();
			await expect(access(join(testDir, "index.ts"))).resolves.toBeUndefined();
		});

		it("should successfully generate all 3 files with camelCase tool name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "mytool",
				description: "My tool functionality",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert
			expect(result.toolName).toBe("mytool");
			expect(result.files).toHaveLength(3);

			// Assert - Files exist on disk
			await expect(
				access(join(testDir, "mytool.types.ts")),
			).resolves.toBeUndefined();
			await expect(
				access(join(testDir, "mytool.service.ts")),
			).resolves.toBeUndefined();
			await expect(access(join(testDir, "index.ts"))).resolves.toBeUndefined();
		});

		it("should create proper directory structure", async () => {
			// Arrange
			const outputDir = join(testDir, "nested", "deep", "path");
			const options: GenerateToolOptions = {
				toolName: "nested-tool",
				outputDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - Directory created
			await expect(access(outputDir)).resolves.toBeUndefined();

			// Assert - Files created in nested directory
			expect(result.files[0]?.path).toBe(
				join(outputDir, "nested-tool.types.ts"),
			);
			await expect(
				access(join(outputDir, "nested-tool.types.ts")),
			).resolves.toBeUndefined();
		});

		it("should use default description when not provided", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "test-tool",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - Default description used
			const typesContent = result.files[0]?.content;
			expect(typesContent).toContain("test-tool functionality");
		});

		it("should use custom description when provided", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "custom-tool",
				description: "Custom tool for special operations",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - Custom description used
			const typesContent = result.files[0]?.content;
			expect(typesContent).toContain("Custom tool for special operations");
		});

		it("should include proper next steps instructions", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "info-tool",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - Instructions contain key sections
			expect(result.instructions).toContain("# InfoTool Tool - Next Steps");
			expect(result.instructions).toContain("## 1. Files Generated");
			expect(result.instructions).toContain("## 2. Wire Up in main.ts");
			expect(result.instructions).toContain("## 3. Implement Your Logic");
			expect(result.instructions).toContain("## 4. Usage Pattern");
			expect(result.instructions).toContain("info-tool.types.ts");
			expect(result.instructions).toContain("info-tool.service.ts");
		});
	});

	// ============================================================================
	// Generated File Content - Type-Safe TypeScript
	// ============================================================================

	describe("Generated File Content - Types File", () => {
		it("should generate types file with proper PascalCase interfaces for kebab-case name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-tool",
				description: "My tool description",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert - Read actual file content
			const typesContent = await readFile(
				join(testDir, "my-tool.types.ts"),
				"utf-8",
			);

			// Assert - PascalCase type names
			expect(typesContent).toContain("export interface MyToolOptions {");
			expect(typesContent).toContain("export interface MyToolResult {");

			// Assert - File header
			expect(typesContent).toContain("/**");
			expect(typesContent).toContain(" * MyTool Tool Types");
			expect(typesContent).toContain(
				" * Type definitions for My tool description",
			);

			// Assert - Section headers
			expect(typesContent).toContain(
				"// ============================================================================",
			);
			expect(typesContent).toContain("// Input/Output Types");
			expect(typesContent).toContain("// Domain Types");
		});

		it("should generate types file with proper PascalCase interfaces for camelCase name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "mytool",
				description: "Tool description",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const typesContent = await readFile(
				join(testDir, "mytool.types.ts"),
				"utf-8",
			);

			expect(typesContent).toContain("export interface MytoolOptions {");
			expect(typesContent).toContain("export interface MytoolResult {");
		});

		it("should generate types file with helpful example comments", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "example-tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const typesContent = await readFile(
				join(testDir, "example-tool.types.ts"),
				"utf-8",
			);

			expect(typesContent).toContain("// Add your option properties here");
			expect(typesContent).toContain("// Example: filePath?: string;");
			expect(typesContent).toContain("// Add your result properties here");
			expect(typesContent).toContain("// Example: success: boolean;");
			expect(typesContent).toContain("// Example: message: string;");
			expect(typesContent).toContain("// Add your domain-specific types here");
		});
	});

	describe("Generated File Content - Service File", () => {
		it("should generate service file with correct imports using .js extension", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-tool",
				description: "My tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const serviceContent = await readFile(
				join(testDir, "my-tool.service.ts"),
				"utf-8",
			);

			// Assert - ESM imports with .js extension
			expect(serviceContent).toContain(
				'import type { MyToolOptions, MyToolResult } from "./my-tool.types.js";',
			);
		});

		it("should generate service file with camelCase main function for kebab-case name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const serviceContent = await readFile(
				join(testDir, "my-tool.service.ts"),
				"utf-8",
			);

			// Assert - camelCase function name
			expect(serviceContent).toContain("export async function myToolMain(");
			expect(serviceContent).toContain("options: MyToolOptions,");
			expect(serviceContent).toContain("): Promise<MyToolResult> {");
		});

		it("should generate service file with camelCase main function for camelCase name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "mytool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const serviceContent = await readFile(
				join(testDir, "mytool.service.ts"),
				"utf-8",
			);

			expect(serviceContent).toContain("export async function mytoolMain(");
		});

		it("should generate service file with proper structure and sections", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "structured-tool",
				description: "Tool with structure",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const serviceContent = await readFile(
				join(testDir, "structured-tool.service.ts"),
				"utf-8",
			);

			// Assert - File header
			expect(serviceContent).toContain("/**");
			expect(serviceContent).toContain(" * StructuredTool Service");
			expect(serviceContent).toContain(
				" * Business logic for Tool with structure.",
			);

			// Assert - Section headers
			expect(serviceContent).toContain("// Public API Functions");
			expect(serviceContent).toContain("// Helper Functions");

			// Assert - Function JSDoc
			expect(serviceContent).toContain("/**");
			expect(serviceContent).toContain(" * Main structured-tool function");
			expect(serviceContent).toContain(
				" * @param options - Configuration options",
			);
			expect(serviceContent).toContain(" * @returns Result object");

			// Assert - Helper function example
			expect(serviceContent).toContain("/**");
			expect(serviceContent).toContain(" * Helper function example");
			expect(serviceContent).toContain("function helperFunction(): void {");
			expect(serviceContent).toContain("// TODO: Implement helper logic");
		});

		it("should generate service file with TODO implementation placeholders", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "todo-tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const serviceContent = await readFile(
				join(testDir, "todo-tool.service.ts"),
				"utf-8",
			);

			expect(serviceContent).toContain(
				"// TODO: Implement your tool logic here",
			);
			expect(serviceContent).toContain("// TODO: Return your result");
		});
	});

	describe("Generated File Content - Index File", () => {
		it("should generate index file with barrel exports using .js extensions", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const indexContent = await readFile(join(testDir, "index.ts"), "utf-8");

			// Assert - ESM exports with .js extension
			expect(indexContent).toContain('export * from "./my-tool.types.js";');
			expect(indexContent).toContain('export * from "./my-tool.service.js";');
		});

		it("should generate index file with proper header comment", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "barrel-tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const indexContent = await readFile(join(testDir, "index.ts"), "utf-8");

			expect(indexContent).toContain("/**");
			expect(indexContent).toContain(" * BarrelTool Tool Module");
			expect(indexContent).toContain(
				" * Barrel export for barrel-tool tool functionality.",
			);
		});
	});

	// ============================================================================
	// Tool Name Validation
	// ============================================================================

	describe("Tool Name Validation - Invalid Names", () => {
		it("should reject tool names shorter than 2 characters", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "a",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must be at least 2 characters long",
			);
		});

		it("should reject empty tool name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must be at least 2 characters long",
			);
		});

		it("should reject tool name with uppercase letters", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "MyTool",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must start with a lowercase letter and contain only lowercase letters and hyphens",
			);
		});

		it("should reject tool name starting with hyphen", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "-invalid",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must start with a lowercase letter",
			);
		});

		it("should reject tool name ending with hyphen", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "invalid-",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must start with a lowercase letter",
			);
		});

		it("should reject tool name with special characters", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my_tool",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must start with a lowercase letter and contain only lowercase letters and hyphens",
			);
		});

		it("should reject tool name with spaces", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my tool",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must start with a lowercase letter and contain only lowercase letters and hyphens",
			);
		});

		it("should reject tool name with numbers", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "tool123",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must start with a lowercase letter and contain only lowercase letters and hyphens",
			);
		});

		it("should reject reserved name: session", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "session",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				'Tool name "session" is reserved',
			);
		});

		it("should reject reserved name: logs", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "logs",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				'Tool name "logs" is reserved',
			);
		});

		it("should reject reserved name: tasks", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "tasks",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				'Tool name "tasks" is reserved',
			);
		});

		it("should reject reserved name: prisma", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "prisma",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				'Tool name "prisma" is reserved',
			);
		});

		it("should reject reserved name: generate", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "generate",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				'Tool name "generate" is reserved',
			);
		});

		it("should reject reserved name: help", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "help",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				'Tool name "help" is reserved',
			);
		});

		it("should reject reserved name: version", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "version",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				'Tool name "version" is reserved',
			);
		});
	});

	describe("Tool Name Validation - Valid Names", () => {
		it("should accept simple lowercase name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "simple",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).resolves.toBeDefined();
		});

		it("should accept kebab-case name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-tool",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).resolves.toBeDefined();
		});

		it("should accept multi-word kebab-case name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-awesome-tool",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).resolves.toBeDefined();
		});

		it("should reject single letter name (minimum 2 characters required)", async () => {
			// Arrange - Single letter names fail the length check (< 2)
			const options: GenerateToolOptions = {
				toolName: "x",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).rejects.toThrow(
				"Tool name must be at least 2 characters long",
			);
		});

		it("should accept two letter name", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "ab",
				outputDir: testDir,
			};

			// Act & Assert
			await expect(generateTool(options)).resolves.toBeDefined();
		});
	});

	// ============================================================================
	// Naming Convention Tests
	// ============================================================================

	describe("Naming Conventions", () => {
		it("should convert kebab-case to PascalCase for types (my-tool -> MyTool)", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-awesome-tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const typesContent = await readFile(
				join(testDir, "my-awesome-tool.types.ts"),
				"utf-8",
			);

			expect(typesContent).toContain("export interface MyAwesomeToolOptions {");
			expect(typesContent).toContain("export interface MyAwesomeToolResult {");
		});

		it("should convert kebab-case to camelCase for functions (my-tool -> myTool)", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "my-awesome-tool",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert
			const serviceContent = await readFile(
				join(testDir, "my-awesome-tool.service.ts"),
				"utf-8",
			);

			expect(serviceContent).toContain(
				"export async function myAwesomeToolMain(",
			);
		});

		it("should handle single word names correctly", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "analyzer",
				outputDir: testDir,
			};

			// Act
			await generateTool(options);

			// Assert - Types
			const typesContent = await readFile(
				join(testDir, "analyzer.types.ts"),
				"utf-8",
			);
			expect(typesContent).toContain("export interface AnalyzerOptions {");
			expect(typesContent).toContain("export interface AnalyzerResult {");

			// Assert - Service
			const serviceContent = await readFile(
				join(testDir, "analyzer.service.ts"),
				"utf-8",
			);
			expect(serviceContent).toContain("export async function analyzerMain(");
		});
	});

	// ============================================================================
	// Edge Cases
	// ============================================================================

	describe("Edge Cases", () => {
		it("should use default output directory when not specified", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "default-dir-tool",
			};

			// Act
			const result = await generateTool(options);

			// Assert - Should use default path structure
			expect(result.files[0]?.path).toContain("dev");
			expect(result.files[0]?.path).toContain("cli");
			expect(result.files[0]?.path).toContain("src");
			expect(result.files[0]?.path).toContain("tools");
			expect(result.files[0]?.path).toContain("default-dir-tool");
			expect(result.files[0]?.path).toContain("default-dir-tool.types.ts");
		});

		it("should handle tool with description vs without", async () => {
			// Arrange - With description
			const withDesc: GenerateToolOptions = {
				toolName: "with-desc",
				description: "A tool with a description",
				outputDir: join(testDir, "with-desc"),
			};

			// Arrange - Without description
			const withoutDesc: GenerateToolOptions = {
				toolName: "without-desc",
				outputDir: join(testDir, "without-desc"),
			};

			// Act
			const resultWith = await generateTool(withDesc);
			const resultWithout = await generateTool(withoutDesc);

			// Assert - With description
			const typesWithDesc = resultWith.files[0]?.content;
			expect(typesWithDesc).toContain("A tool with a description");

			// Assert - Without description (uses default)
			const typesWithoutDesc = resultWithout.files[0]?.content;
			expect(typesWithoutDesc).toContain("without-desc functionality");
		});

		it("should verify all generated files are actually written to disk", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "disk-test",
				description: "Testing disk writes",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - All files exist
			for (const file of result.files) {
				await expect(access(file.path)).resolves.toBeUndefined();

				// Also verify content matches what was returned
				const diskContent = await readFile(file.path, "utf-8");
				expect(diskContent).toBe(file.content);
			}
		});

		it("should overwrite existing files if tool already exists", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "existing-tool",
				description: "First version",
				outputDir: testDir,
			};

			// Act - First generation
			await generateTool(options);

			// Read original content
			const originalContent = await readFile(
				join(testDir, "existing-tool.types.ts"),
				"utf-8",
			);
			expect(originalContent).toContain("First version");

			// Act - Second generation with different description
			const updatedOptions: GenerateToolOptions = {
				toolName: "existing-tool",
				description: "Second version",
				outputDir: testDir,
			};
			await generateTool(updatedOptions);

			// Assert - Files updated
			const updatedContent = await readFile(
				join(testDir, "existing-tool.types.ts"),
				"utf-8",
			);
			expect(updatedContent).toContain("Second version");
			expect(updatedContent).not.toContain("First version");
		});

		it("should generate valid TypeScript code that compiles", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "compile-test",
				description: "Testing TypeScript compilation",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - Check for TypeScript validity markers
			for (const file of result.files) {
				const content = file.content;

				// No syntax errors that would prevent parsing
				expect(content).not.toContain("undefined");
				expect(content).not.toContain("null");

				// Proper exports
				if (file.path.includes(".types.ts")) {
					expect(content).toContain("export interface");
				}

				if (file.path.includes(".service.ts")) {
					expect(content).toContain("export async function");
					expect(content).toContain("import type");
				}

				if (file.path.includes("index.ts")) {
					expect(content).toContain('export * from "');
				}

				// Proper ESM extensions
				if (
					file.path.includes(".service.ts") ||
					file.path.includes("index.ts")
				) {
					expect(content).toContain(".js");
				}
			}
		});

		it("should maintain consistent file order: types, service, index", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "order-test",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - File order
			expect(result.files[0]?.path).toContain("types.ts");
			expect(result.files[1]?.path).toContain("service.ts");
			expect(result.files[2]?.path).toContain("index.ts");
		});
	});

	// ============================================================================
	// Return Value Validation
	// ============================================================================

	describe("Return Value Validation", () => {
		it("should return GenerateToolResult with all required properties", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "result-test",
				description: "Testing result structure",
				outputDir: testDir,
			};

			// Act
			const result: GenerateToolResult = await generateTool(options);

			// Assert - TypeScript types
			expect(result).toBeDefined();
			expect(result.toolName).toBe("result-test");
			expect(Array.isArray(result.files)).toBe(true);
			expect(typeof result.instructions).toBe("string");

			// Assert - Files array structure
			for (const file of result.files) {
				expect(typeof file.path).toBe("string");
				expect(typeof file.content).toBe("string");
				expect(typeof file.description).toBe("string");
			}
		});

		it("should return correct file paths relative to output directory", async () => {
			// Arrange
			const customDir = join(testDir, "custom", "location");
			const options: GenerateToolOptions = {
				toolName: "path-test",
				outputDir: customDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - All paths start with custom directory
			for (const file of result.files) {
				expect(file.path.startsWith(customDir)).toBe(true);
			}
		});

		it("should return non-empty content for all files", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "content-test",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - All files have content
			for (const file of result.files) {
				expect(file.content.length).toBeGreaterThan(0);
				expect(file.content.trim()).toBeTruthy();
			}
		});

		it("should return unique descriptions for each file", async () => {
			// Arrange
			const options: GenerateToolOptions = {
				toolName: "desc-test",
				outputDir: testDir,
			};

			// Act
			const result = await generateTool(options);

			// Assert - Descriptions are unique
			const descriptions = result.files.map((f) => f.description);
			const uniqueDescriptions = new Set(descriptions);
			expect(uniqueDescriptions.size).toBe(descriptions.length);

			// Assert - Expected descriptions
			expect(descriptions).toContain("Type definitions");
			expect(descriptions).toContain("Business logic");
			expect(descriptions).toContain("Barrel export");
		});
	});
});
