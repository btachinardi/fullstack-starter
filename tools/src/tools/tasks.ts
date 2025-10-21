/**
 * Tasks Management Tool
 *
 * Core functions for managing *.tasks.md files with YAML task blocks.
 * Supports document discovery, parsing, filtering, and task operations.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { glob } from 'glob';
import yaml from 'js-yaml';
import type {
	AddTaskOptions,
	DiscoveredDocument,
	DocumentScopeOptions,
	ListTasksOptions,
	Task,
	TaskDocument,
	TaskDocumentFrontmatter,
	TaskDocumentValidation,
	TaskList,
	TaskOperationResult,
	TaskStatus,
	TaskValidationError,
} from '../types/tasks.js';

// ============================================================================
// Document Discovery
// ============================================================================

/**
 * Discover task documents based on scope options
 *
 * Supports three scoping modes:
 * 1. Simple name: "dashboard" searches for `** /dashboard.tasks.md`
 * 2. Complete path: "ai/docs/tasks/dashboard.tasks.md" uses exact path
 * 3. Partial path: "auth/v1" searches for `** /auth/v1.tasks.md`
 */
export async function discoverDocuments(
	options: DocumentScopeOptions = {},
): Promise<DiscoveredDocument[]> {
	const searchPath = options.searchPath || process.cwd();
	const pattern = options.doc ? buildGlobPattern(options.doc) : '**/*.tasks.md';

	const files = await glob(pattern, {
		cwd: searchPath,
		absolute: true,
		ignore: ['**/node_modules/**', '**/.git/**', '**/dist/**', '**/build/**'],
	});

	return files.map((path) => ({
		path: resolve(path),
		name: basename(path, '.tasks.md'),
	}));
}

/**
 * Build glob pattern from document scope
 */
function buildGlobPattern(doc: string): string {
	// Strip all possible extensions first
	const cleanName = doc.replace(/\.(tasks\.md|tasks|md)$/, '');

	// Check if it looks like a complete path (has file extension or deep path)
	if (doc.endsWith('.tasks.md')) {
		return doc;
	}

	// Check if it's a partial path (contains /)
	if (cleanName.includes('/')) {
		return `**/${cleanName}.tasks.md`;
	}

	// Simple name - search anywhere
	return `**/${cleanName}.tasks.md`;
}

/**
 * Select a document interactively from discovered documents
 */
export async function selectDocument(
	documents: DiscoveredDocument[],
): Promise<DiscoveredDocument | null> {
	if (documents.length === 0) {
		return null;
	}

	if (documents.length === 1) {
		return documents[0];
	}

	// For now, return first document - interactive selection can be added later
	return documents[0];
}

// ============================================================================
// Document Parsing
// ============================================================================

/**
 * Parse a task document from file
 */
export async function parseTaskDocument(filePath: string): Promise<TaskDocument> {
	const rawContent = await readFile(filePath, 'utf-8');
	const { frontmatter, body } = extractFrontmatter(rawContent);
	const taskLists = parseTaskLists(body);

	return {
		filePath: resolve(filePath),
		frontmatter,
		taskLists,
		rawContent,
	};
}

/**
 * Extract YAML frontmatter from markdown
 */
function extractFrontmatter(content: string): {
	frontmatter: TaskDocumentFrontmatter;
	body: string;
} {
	const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
	const match = content.match(frontmatterRegex);

	if (!match) {
		throw new Error('Invalid task document: missing frontmatter');
	}

	const frontmatterYaml = match[1];
	const body = match[2];

	const frontmatter = yaml.load(frontmatterYaml) as TaskDocumentFrontmatter;

	// Return frontmatter even if fields are missing - validation will catch this
	return {
		frontmatter: {
			title: frontmatter.title || '',
			description: frontmatter.description || '',
			source: frontmatter.source || '',
		},
		body
	};
}

/**
 * Parse YAML task blocks from markdown body
 */
function parseTaskLists(body: string): TaskList[] {
	const taskListRegex = /```yaml tasks:(\w+)\s*\n([\s\S]*?)```/g;
	const taskLists: TaskList[] = [];

	let match: RegExpExecArray | null = taskListRegex.exec(body);
	while (match !== null) {
		const listName = match[1];
		const yamlContent = match[2];

		try {
			const parsed = yaml.load(yamlContent) as { tasks: Task[] };
			if (parsed && Array.isArray(parsed.tasks)) {
				taskLists.push({
					name: listName,
					tasks: parsed.tasks.map(normalizeTask),
				});
			}
		} catch (error) {
			throw new Error(
				`Failed to parse YAML in tasks:${listName}: ${(error as Error).message}`,
			);
		}

		match = taskListRegex.exec(body);
	}

	return taskLists;
}

/**
 * Normalize task object to ensure all required fields
 */
function normalizeTask(task: unknown): Task {
	const t = task as Record<string, unknown>;

	// Don't throw on missing fields - let validation catch this
	// Provide defaults to allow parsing to continue
	return {
		id: t.id ? String(t.id) : '',
		title: t.title ? String(t.title) : '',
		type: (t.type as string) || 'unknown',
		project: (t.project as string) || '',
		description: (t.description as string) || '',
		deliverables: Array.isArray(t.deliverables) ? t.deliverables : [],
		requirements: Array.isArray(t.requirements) ? t.requirements : [],
		status: normalizeStatus(t.status as string),
		depends_on: Array.isArray(t.depends_on) ? (t.depends_on as unknown[]).map(String) : [],
	};
}

/**
 * Normalize status value
 */
function normalizeStatus(status: string): TaskStatus {
	if (!status) return 'todo';
	const normalized = status.toLowerCase().trim();
	// Return original status if invalid - validation will catch this
	if (['todo', 'in progress', 'completed', 'cancelled'].includes(normalized)) {
		return normalized as TaskStatus;
	}
	// Return as-is so validation can detect invalid status
	return status as TaskStatus;
}

// ============================================================================
// Task Queries
// ============================================================================

/**
 * List all tasks in a document with optional filtering
 */
export async function listTasks(
	documentPath: string,
	options: ListTasksOptions = {},
): Promise<{ document: TaskDocument; tasks: Array<Task & { listName: string }> }> {
	const document = await parseTaskDocument(documentPath);

	let tasks: Array<Task & { listName: string }> = [];
	for (const taskList of document.taskLists) {
		for (const task of taskList.tasks) {
			tasks.push({ ...task, listName: taskList.name });
		}
	}

	// Apply filters
	if (options.status) {
		tasks = tasks.filter((t) => t.status === options.status);
	}

	if (options.list) {
		tasks = tasks.filter((t) => t.listName === options.list);
	}

	if (options.type) {
		tasks = tasks.filter((t) => t.type === options.type);
	}

	if (options.project) {
		tasks = tasks.filter((t) => t.project === options.project);
	}

	// Apply head/tail
	if (options.head) {
		tasks = tasks.slice(0, options.head);
	} else if (options.tail) {
		tasks = tasks.slice(-options.tail);
	}

	return { document, tasks };
}

/**
 * Get a specific task by ID
 */
export async function getTask(
	documentPath: string,
	taskId: string,
): Promise<{ task: Task; listName: string } | null> {
	const document = await parseTaskDocument(documentPath);

	for (const taskList of document.taskLists) {
		const task = taskList.tasks.find((t) => t.id === taskId);
		if (task) {
			return { task, listName: taskList.name };
		}
	}

	return null;
}

/**
 * List all task lists in a document
 */
export async function listTaskLists(documentPath: string): Promise<{
	document: TaskDocument;
	taskLists: Array<{ name: string; taskCount: number; statuses: Record<TaskStatus, number> }>;
}> {
	const document = await parseTaskDocument(documentPath);

	const taskLists = document.taskLists.map((list) => {
		const statuses: Record<TaskStatus, number> = {
			todo: 0,
			'in progress': 0,
			completed: 0,
			cancelled: 0,
		};

		for (const task of list.tasks) {
			statuses[task.status]++;
		}

		return {
			name: list.name,
			taskCount: list.tasks.length,
			statuses,
		};
	});

	return { document, taskLists };
}

// ============================================================================
// Task Operations
// ============================================================================

/**
 * Update task status
 */
export async function updateTaskStatus(
	documentPath: string,
	taskId: string,
	newStatus: TaskStatus,
): Promise<TaskOperationResult> {
	const document = await parseTaskDocument(documentPath);
	let taskFound = false;
	let updatedContent = document.rawContent;

	for (const taskList of document.taskLists) {
		const taskIndex = taskList.tasks.findIndex((t) => t.id === taskId);
		if (taskIndex !== -1) {
			taskFound = true;
			const task = taskList.tasks[taskIndex];
			const oldStatus = task.status;

			// Update in-memory task
			task.status = newStatus;

			// Update in raw content
			updatedContent = updateTaskInYaml(updatedContent, taskList.name, taskId, {
				status: newStatus,
			});

			await writeFile(documentPath, updatedContent, 'utf-8');

			return {
				success: true,
				message: `Task ${taskId} status updated: ${oldStatus} → ${newStatus}`,
				taskIds: [taskId],
				documentPath,
			};
		}
	}

	return {
		success: false,
		message: `Task ${taskId} not found in document`,
	};
}

/**
 * Delete a task from the document
 */
export async function deleteTask(
	documentPath: string,
	taskId: string,
): Promise<TaskOperationResult> {
	const document = await parseTaskDocument(documentPath);
	let taskFound = false;
	let updatedContent = document.rawContent;

	for (const taskList of document.taskLists) {
		const taskIndex = taskList.tasks.findIndex((t) => t.id === taskId);
		if (taskIndex !== -1) {
			taskFound = true;
			const task = taskList.tasks[taskIndex];

			// Remove from in-memory list
			taskList.tasks.splice(taskIndex, 1);

			// Remove from raw content
			updatedContent = deleteTaskFromYaml(updatedContent, taskList.name, taskId);

			await writeFile(documentPath, updatedContent, 'utf-8');

			return {
				success: true,
				message: `Task ${taskId} "${task.title}" deleted`,
				taskIds: [taskId],
				documentPath,
			};
		}
	}

	return {
		success: false,
		message: `Task ${taskId} not found in document`,
	};
}

/**
 * Add a new task to a task list
 */
export async function addTask(
	documentPath: string,
	options: AddTaskOptions,
): Promise<TaskOperationResult> {
	const document = await parseTaskDocument(documentPath);

	// Find the task list
	const taskList = document.taskLists.find((list) => list.name === options.list);
	if (!taskList) {
		return {
			success: false,
			message: `Task list "tasks:${options.list}" not found in document`,
		};
	}

	// Generate new task ID
	const newId = generateTaskId(taskList.tasks);

	// Create new task
	const newTask: Task = {
		id: newId,
		title: options.title,
		type: options.type,
		project: options.project,
		description: options.description || '',
		deliverables: options.deliverables || [],
		requirements: options.requirements || [],
		status: 'todo',
		depends_on: options.depends_on || [],
	};

	// Add to in-memory list
	taskList.tasks.push(newTask);

	// Add to raw content
	const updatedContent = addTaskToYaml(document.rawContent, options.list, newTask);

	await writeFile(documentPath, updatedContent, 'utf-8');

	return {
		success: true,
		message: `Task ${newId} "${newTask.title}" added to tasks:${options.list}`,
		taskIds: [newId],
		documentPath,
	};
}

// ============================================================================
// YAML Manipulation Helpers
// ============================================================================

/**
 * Update a specific task field in YAML block
 */
function updateTaskInYaml(
	content: string,
	listName: string,
	taskId: string,
	updates: Partial<Task>,
): string {
	const taskListRegex = new RegExp(
		`(\`\`\`yaml tasks:${listName}\\s*\\n)([\\s\\S]*?)(\`\`\`)`,
		'g',
	);

	return content.replace(taskListRegex, (match, prefix, yamlContent, suffix) => {
		const parsed = yaml.load(yamlContent) as { tasks: Task[] };

		if (parsed && Array.isArray(parsed.tasks)) {
			const taskIndex = parsed.tasks.findIndex((t) => String(t.id) === taskId);
			if (taskIndex !== -1) {
				parsed.tasks[taskIndex] = { ...parsed.tasks[taskIndex], ...updates };

				const updatedYaml = yaml.dump(parsed, {
					indent: 2,
					lineWidth: -1,
					noRefs: true,
				});

				return `${prefix}${updatedYaml}${suffix}`;
			}
		}

		return match;
	});
}

/**
 * Delete a task from YAML block
 */
function deleteTaskFromYaml(content: string, listName: string, taskId: string): string {
	const taskListRegex = new RegExp(
		`(\`\`\`yaml tasks:${listName}\\s*\\n)([\\s\\S]*?)(\`\`\`)`,
		'g',
	);

	return content.replace(taskListRegex, (match, prefix, yamlContent, suffix) => {
		const parsed = yaml.load(yamlContent) as { tasks: Task[] };

		if (parsed && Array.isArray(parsed.tasks)) {
			parsed.tasks = parsed.tasks.filter((t) => String(t.id) !== taskId);

			const updatedYaml = yaml.dump(parsed, {
				indent: 2,
				lineWidth: -1,
				noRefs: true,
			});

			return `${prefix}${updatedYaml}${suffix}`;
		}

		return match;
	});
}

/**
 * Add a new task to YAML block
 */
function addTaskToYaml(content: string, listName: string, newTask: Task): string {
	const taskListRegex = new RegExp(
		`(\`\`\`yaml tasks:${listName}\\s*\\n)([\\s\\S]*?)(\`\`\`)`,
		'g',
	);

	return content.replace(taskListRegex, (match, prefix, yamlContent, suffix) => {
		const parsed = yaml.load(yamlContent) as { tasks: Task[] };

		if (parsed && Array.isArray(parsed.tasks)) {
			parsed.tasks.push(newTask);

			const updatedYaml = yaml.dump(parsed, {
				indent: 2,
				lineWidth: -1,
				noRefs: true,
			});

			return `${prefix}${updatedYaml}${suffix}`;
		}

		return match;
	});
}

/**
 * Generate a new task ID for a task list
 */
function generateTaskId(tasks: Task[]): string {
	if (tasks.length === 0) {
		return '1.1';
	}

	// Parse existing IDs and find next available
	const ids = tasks.map((t) => t.id);
	const numericIds = ids
		.map((id) => {
			const match = id.match(/^(\d+)\.(\d+)$/);
			if (match) {
				return { major: Number.parseInt(match[1]), minor: Number.parseInt(match[2]) };
			}
			return null;
		})
		.filter((id): id is { major: number; minor: number } => id !== null);

	if (numericIds.length === 0) {
		return '1.1';
	}

	// Find highest ID
	const maxId = numericIds.reduce((max, id) => {
		if (id.major > max.major) return id;
		if (id.major === max.major && id.minor > max.minor) return id;
		return max;
	});

	// Increment minor version
	return `${maxId.major}.${maxId.minor + 1}`;
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate a task document structure
 */
export async function validateDocument(
	documentPath: string,
): Promise<TaskDocumentValidation> {
	const errors: TaskValidationError[] = [];

	try {
		const document = await parseTaskDocument(documentPath);
		let taskCount = 0;

		// Validate frontmatter
		if (!document.frontmatter.title) {
			errors.push({
				severity: 'error',
				message: 'Missing required frontmatter field: title',
				location: 'frontmatter',
				field: 'title',
			});
		}

		if (!document.frontmatter.source) {
			errors.push({
				severity: 'error',
				message: 'Missing required frontmatter field: source',
				location: 'frontmatter',
				field: 'source',
			});
		}

		// Validate task lists
		for (const taskList of document.taskLists) {
			if (!taskList.name) {
				errors.push({
					severity: 'error',
					message: 'Task list missing name',
					location: `tasks:${taskList.name}`,
				});
			}

			// Validate tasks
			for (const task of taskList.tasks) {
				taskCount++;

				if (!task.id) {
					errors.push({
						severity: 'error',
						message: 'Task missing required field: id',
						location: `tasks:${taskList.name}`,
						field: 'id',
					});
				}

				if (!task.title) {
					errors.push({
						severity: 'error',
						message: `Task ${task.id} missing required field: title`,
						location: `tasks:${taskList.name}`,
						field: 'title',
					});
				}

				if (!['todo', 'in progress', 'completed', 'cancelled'].includes(task.status)) {
					errors.push({
						severity: 'error',
						message: `Task ${task.id} has invalid status: ${task.status}`,
						location: `tasks:${taskList.name}`,
						field: 'status',
					});
				}
			}
		}

		return {
			valid: errors.filter((e) => e.severity === 'error').length === 0,
			errors,
			taskCount,
			taskListCount: document.taskLists.length,
		};
	} catch (error) {
		errors.push({
			severity: 'error',
			message: `Failed to parse document: ${(error as Error).message}`,
		});

		return {
			valid: false,
			errors,
			taskCount: 0,
			taskListCount: 0,
		};
	}
}
