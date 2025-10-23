/**
 * Generate Tool Types
 *
 * Type definitions for tool scaffolding functionality.
 */

export interface GenerateToolOptions {
	/** Tool name (e.g., 'myTool') */
	toolName: string;

	/** Tool description */
	description?: string;

	/** Output directory (defaults to src/tools/<toolName>) */
	outputDir?: string;
}

export interface GeneratedFile {
	/** File path relative to project root */
	path: string;

	/** File content */
	content: string;

	/** File description */
	description: string;
}

export interface GenerateToolResult {
	/** Generated files */
	files: GeneratedFile[];

	/** Tool name */
	toolName: string;

	/** Next steps instructions */
	instructions: string;
}
