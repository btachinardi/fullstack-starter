/**
 * Type Definitions for Prisma Build Tool
 *
 * Domain models for schema parsing, dependency resolution,
 * schema merging, and migration management.
 */

// ============================================================================
// Parser Types
// ============================================================================

/**
 * Parsed Prisma schema file
 */
export interface ParsedSchema {
	/** Original file path */
	filePath: string;

	/** Import declarations from @prisma-import comments */
	imports: string[];

	/** Plugin directives from @prisma-plugin comments */
	plugins: PluginDirective[];

	/** Generation boundary (if present) */
	generationBoundary: GenerationBoundary | null;

	/** Plugin boundaries (if present) */
	pluginBoundaries: PluginBoundary[];

	/** Datasource configuration */
	datasource: DatasourceConfig | null;

	/** Generator configurations */
	generators: GeneratorConfig[];

	/** Database schema namespace (e.g., "auth", "public") */
	dbSchema: string | null;

	/** Raw schema content */
	content: string;

	/** Model definitions */
	models: string[];

	/** Enum definitions */
	enums: string[];
}

/**
 * Generation boundary markers in schema
 */
export interface GenerationBoundary {
	/** Start line number */
	startLine: number;

	/** End line number */
	endLine: number;

	/** Content between boundaries */
	content: string;

	/** Metadata from boundary comments */
	metadata: {
		sources: string[];
		lastUpdated: string | null;
	};
}

/**
 * Prisma datasource configuration
 */
export interface DatasourceConfig {
	/** Provider (e.g., "postgresql") */
	provider: string;

	/** Database URL environment variable */
	url: string;

	/** Schema list for multi-schema support */
	schemas: string[];
}

/**
 * Prisma generator configuration
 */
export interface GeneratorConfig {
	/** Provider (e.g., "prisma-client-js") */
	provider: string;

	/** Output path */
	output: string | null;

	/** Preview features */
	previewFeatures: string[];
}

// ============================================================================
// Plugin Types
// ============================================================================

/**
 * Plugin directive from @prisma-plugin comment
 */
export interface PluginDirective {
	/** Plugin name */
	name: string;

	/** Plugin configuration (parsed from JSON) */
	config: Record<string, unknown>;

	/** Line number of directive */
	line: number;
}

/**
 * Plugin boundary markers in schema
 */
export interface PluginBoundary {
	/** Plugin name */
	pluginName: string;

	/** Start line number */
	startLine: number;

	/** End line number */
	endLine: number;

	/** Content between boundaries */
	content: string;

	/** Metadata from boundary comments */
	metadata: {
		source: string | null;
		lastUpdated: string | null;
	};
}

/**
 * Context passed to plugin generate function
 */
export interface PluginContext {
	/** Schema file path */
	schemaPath: string;

	/** Database schema namespace (e.g., "auth") */
	namespace: string | null;

	/** Database provider */
	provider: string;
}

/**
 * Plugin interface
 */
export interface PrismaPlugin {
	/** Plugin name */
	name: string;

	/** Plugin description */
	description: string;

	/** Generate schema content */
	generate: (
		config: Record<string, unknown>,
		context: PluginContext,
	) => Promise<string>;

	/** Validate configuration (optional) */
	validate?: (config: Record<string, unknown>) => boolean;
}

/**
 * Plugin execution result
 */
export interface PluginExecutionResult {
	/** Plugin name */
	pluginName: string;

	/** Generated schema content */
	content: string;

	/** Execution timestamp */
	timestamp: string;

	/** Metadata */
	metadata: {
		source?: string;
		modelCount?: number;
		enumCount?: number;
	};
}

// ============================================================================
// Dependency Graph Types
// ============================================================================

/**
 * Dependency graph for schema imports
 */
export interface DependencyGraph {
	/** Nodes in the graph (schema paths) */
	nodes: Set<string>;

	/** Edges (dependencies) */
	edges: Map<string, Set<string>>;

	/** Topologically sorted paths */
	sortedPaths: string[];

	/** Entry point schema */
	entryPoint: string;

	/** Graph metadata */
	metadata: {
		nodeCount: number;
		maxDepth: number;
	};
}

/**
 * Result from building dependency graph
 */
export interface DependencyGraphResult {
	/** Ordered list of schema paths (dependencies first) */
	orderedSchemas: string[];

	/** Dependency graph structure */
	graph: DependencyGraph;

	/** Any warnings encountered */
	warnings: string[];
}

// ============================================================================
// Schema Merger Types
// ============================================================================

/**
 * Merged schema output
 */
export interface MergedSchema {
	/** Complete merged schema content */
	content: string;

	/** Source schemas that were merged */
	sources: string[];

	/** Generation timestamp */
	timestamp: string;

	/** Database schemas used */
	dbSchemas: string[];

	/** Merged datasource config */
	datasource: DatasourceConfig;

	/** Merged generator config */
	generator: GeneratorConfig;
}

// ============================================================================
// Migration Types
// ============================================================================

/**
 * Migration metadata
 */
export interface Migration {
	/** Migration folder name */
	name: string;

	/** Timestamp from folder name (YYYYMMDDHHMMSS) */
	timestamp: string;

	/** Description from folder name */
	description: string;

	/** Path to migration.sql */
	sqlPath: string;

	/** Source schema path */
	sourceSchema: string;

	/** Database schema namespace */
	namespace: string;

	/** Migration SQL content */
	sql: string;
}

/**
 * Result from merging migrations
 */
export interface MergedMigrations {
	/** Sorted list of migrations */
	migrations: Migration[];

	/** Migration count by source */
	sourceCount: Map<string, number>;

	/** Total migration count */
	totalCount: number;
}

// ============================================================================
// CLI Types
// ============================================================================

/**
 * Build command options
 */
export interface BuildOptions {
	/** Schema file path */
	schemaPath: string;

	/** Test mode (validate only, no write) */
	test?: boolean;

	/** Watch mode */
	watch?: boolean;

	/** Verbose logging */
	verbose?: boolean;

	/** Dry run (show what would be generated) */
	dryRun?: boolean;
}

/**
 * Validate command options
 */
export interface ValidateOptions {
	/** Schema file path */
	schemaPath: string;

	/** Run Prisma validate */
	runPrismaValidate?: boolean;
}

/**
 * Graph command options
 */
export interface GraphOptions {
	/** Schema file path */
	schemaPath: string;

	/** Output as JSON */
	json?: boolean;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * Base error for Prisma build tool
 */
export class PrismaBuildError extends Error {
	constructor(
		message: string,
		public code: string,
		public context?: Record<string, unknown>,
	) {
		super(message);
		this.name = "PrismaBuildError";
	}
}

/**
 * Circular dependency error
 */
export class CircularDependencyError extends PrismaBuildError {
	constructor(public cycle: string[]) {
		super(
			`Circular dependency detected: ${cycle.join(" → ")}`,
			"CIRCULAR_DEPENDENCY",
			{ cycle },
		);
		this.name = "CircularDependencyError";
	}
}

/**
 * Import not found error
 */
export class ImportNotFoundError extends PrismaBuildError {
	constructor(
		public importPath: string,
		public sourceFile: string,
	) {
		super(
			`Cannot resolve import: ${importPath} in ${sourceFile}`,
			"IMPORT_NOT_FOUND",
			{ importPath, sourceFile },
		);
		this.name = "ImportNotFoundError";
	}
}

/**
 * Namespace collision error
 */
export class NamespaceCollisionError extends PrismaBuildError {
	constructor(
		public modelName: string,
		public sources: string[],
	) {
		super(
			`Model "${modelName}" exists in multiple schemas without @@schema directive: ${sources.join(", ")}`,
			"NAMESPACE_COLLISION",
			{ modelName, sources },
		);
		this.name = "NamespaceCollisionError";
	}
}
