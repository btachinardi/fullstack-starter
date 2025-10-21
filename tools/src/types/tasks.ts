/**
 * Task Management Types
 *
 * Types for parsing and managing *.tasks.md files with YAML frontmatter
 * and task blocks following the tasks management tool specification.
 */

/**
 * Valid task status values
 */
export type TaskStatus = 'todo' | 'in progress' | 'completed' | 'cancelled';

/**
 * Task type categories
 */
export type TaskType =
	| 'database-schema'
	| 'database-migration'
	| 'endpoint'
	| 'service'
	| 'store'
	| 'ui-component'
	| 'page'
	| 'integration'
	| 'test'
	| 'documentation'
	| string; // Allow custom types

/**
 * Individual task definition
 */
export interface Task {
	/** Unique task identifier (e.g., "1.1", "2.3") */
	id: string;

	/** Short, descriptive task title */
	title: string;

	/** Task type for orchestration and organization */
	type: TaskType;

	/** Project or codebase location (e.g., "apps/api", "apps/web") */
	project: string;

	/** Detailed task description */
	description: string;

	/** List of concrete deliverables to produce */
	deliverables?: string[];

	/** List of requirements that must be met */
	requirements?: string[];

	/** Current task status */
	status: TaskStatus;

	/** Task IDs this task depends on */
	depends_on?: string[];
}

/**
 * Task list containing multiple related tasks
 */
export interface TaskList {
	/** Task list name (from YAML block, e.g., "tasks:db") */
	name: string;

	/** Tasks in this list */
	tasks: Task[];
}

/**
 * Frontmatter metadata for task document
 */
export interface TaskDocumentFrontmatter {
	/** Feature or component name */
	title: string;

	/** Brief description of the task document */
	description: string;

	/** Path to source PRD document */
	source: string;
}

/**
 * Complete parsed task document
 */
export interface TaskDocument {
	/** Path to the document file */
	filePath: string;

	/** Frontmatter metadata */
	frontmatter: TaskDocumentFrontmatter;

	/** All task lists in the document */
	taskLists: TaskList[];

	/** Raw markdown content */
	rawContent: string;
}

/**
 * Options for listing tasks
 */
export interface ListTasksOptions {
	/** Filter by status */
	status?: TaskStatus;

	/** Filter by task list name */
	list?: string;

	/** Filter by task type */
	type?: TaskType;

	/** Show only first N tasks */
	head?: number;

	/** Show only last N tasks */
	tail?: number;

	/** Filter by task project */
	project?: string;
}

/**
 * Options for document discovery
 */
export interface DocumentScopeOptions {
	/** Simple name, partial path, or complete path to document */
	doc?: string;

	/** Search path for documents (defaults to project root) */
	searchPath?: string;
}

/**
 * Document discovery result
 */
export interface DiscoveredDocument {
	/** Absolute path to document */
	path: string;

	/** Document name (without .tasks.md extension) */
	name: string;

	/** Number of tasks in document (if parsed) */
	taskCount?: number;

	/** Task lists in document (if parsed) */
	taskLists?: string[];
}

/**
 * Result of task operation
 */
export interface TaskOperationResult {
	/** Whether the operation succeeded */
	success: boolean;

	/** Success or error message */
	message: string;

	/** Affected task ID(s) */
	taskIds?: string[];

	/** Updated document path */
	documentPath?: string;
}

/**
 * Options for adding a new task
 */
export interface AddTaskOptions {
	/** Task list name to add to */
	list: string;

	/** Task title */
	title: string;

	/** Task type */
	type: TaskType;

	/** Task project */
	project: string;

	/** Task description */
	description?: string;

	/** Task deliverables */
	deliverables?: string[];

	/** Task requirements */
	requirements?: string[];

	/** Task dependencies */
	depends_on?: string[];
}

/**
 * Task validation error
 */
export interface TaskValidationError {
	/** Error severity */
	severity: 'error' | 'warning';

	/** Error message */
	message: string;

	/** Task ID or list name where error occurred */
	location?: string;

	/** Field name that failed validation */
	field?: string;
}

/**
 * Task document validation result
 */
export interface TaskDocumentValidation {
	/** Whether document is valid */
	valid: boolean;

	/** Validation errors and warnings */
	errors: TaskValidationError[];

	/** Successfully parsed task count */
	taskCount: number;

	/** Task list count */
	taskListCount: number;
}
