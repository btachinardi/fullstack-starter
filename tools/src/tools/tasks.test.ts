/**
 * Tasks Management Tool Tests
 *
 * Comprehensive test suite for task document management functions
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as tasks from './tasks.js';

// Sample task document content
const SAMPLE_TASK_DOC = `---
title: Test Feature
description: Sample task document for testing
source: ai/docs/prds/test-prd.md
---

# Test Feature Tasks

Test task document for unit tests.

## Database Tasks

\`\`\`yaml tasks:db
tasks:
  - id: 1.1
    title: Create database schema
    type: database-schema
    project: apps/api
    description: Design database schema
    deliverables:
      - CREATE TABLE test_table
    requirements:
      - Follow naming conventions
    status: todo

  - id: 1.2
    title: Create migration
    type: database-migration
    project: apps/api
    description: Write migration scripts
    deliverables:
      - Migration file
    requirements:
      - Idempotent migrations
    status: todo
    depends_on: [1.1]
\`\`\`

## API Tasks

\`\`\`yaml tasks:api
tasks:
  - id: 2.1
    title: Build API endpoints
    type: endpoint
    project: apps/api
    description: Implement REST endpoints
    deliverables:
      - GET /test endpoint
      - POST /test endpoint
    requirements:
      - Validate input data
    status: in progress
    depends_on: [1.2]

  - id: 2.2
    title: Write tests
    type: test
    project: apps/api
    description: Create test cases
    deliverables:
      - Unit tests
    requirements:
      - 80% coverage
    status: completed
    depends_on: [2.1]
\`\`\`
`;

// Invalid task document (missing frontmatter)
const INVALID_TASK_DOC = `
# Invalid Document

This document has no frontmatter.
`;

// Invalid task document (malformed YAML)
const MALFORMED_YAML_DOC = `---
title: Malformed
description: Document with malformed YAML
source: test.md
---

\`\`\`yaml tasks:db
tasks:
  - id: 1.1
    title: Test
    invalid_yaml: {{{ broken
\`\`\`
`;

describe('Tasks Management Tool', () => {
  let tempDir: string;
  let testDocPath: string;

  beforeEach(async () => {
    // Create temporary directory for tests
    tempDir = await mkdtemp(join(tmpdir(), 'tasks-test-'));
    testDocPath = join(tempDir, 'test-feature.tasks.md');
  });

  afterEach(async () => {
    // Clean up temporary directory
    await rm(tempDir, { recursive: true, force: true });
  });

  describe('discoverDocuments', () => {
    it('should discover task documents in directory', async () => {
      // Create multiple task documents
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
      await writeFile(join(tempDir, 'feature-2.tasks.md'), SAMPLE_TASK_DOC);

      const docs = await tasks.discoverDocuments({ searchPath: tempDir });

      expect(docs).toHaveLength(2);
      expect(docs[0].name).toMatch(/test-feature|feature-2/);
      expect(docs[0].path).toContain('.tasks.md');
    });

    it('should return empty array when no documents found', async () => {
      const docs = await tasks.discoverDocuments({ searchPath: tempDir });

      expect(docs).toHaveLength(0);
    });

    it('should filter by simple document name', async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
      await writeFile(join(tempDir, 'other-feature.tasks.md'), SAMPLE_TASK_DOC);

      const docs = await tasks.discoverDocuments({
        searchPath: tempDir,
        doc: 'test-feature',
      });

      expect(docs).toHaveLength(1);
      expect(docs[0].name).toBe('test-feature');
    });
  });

  describe('parseTaskDocument', () => {
    it('should parse valid task document', async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);

      const doc = await tasks.parseTaskDocument(testDocPath);

      expect(doc.frontmatter.title).toBe('Test Feature');
      expect(doc.frontmatter.description).toBe('Sample task document for testing');
      expect(doc.frontmatter.source).toBe('ai/docs/prds/test-prd.md');
      expect(doc.taskLists).toHaveLength(2);
      expect(doc.taskLists[0].name).toBe('db');
      expect(doc.taskLists[1].name).toBe('api');
    });

    it('should throw error for missing frontmatter', async () => {
      await writeFile(testDocPath, INVALID_TASK_DOC);

      await expect(tasks.parseTaskDocument(testDocPath)).rejects.toThrow(
        'Invalid task document: missing frontmatter'
      );
    });

    it('should throw error for malformed YAML', async () => {
      await writeFile(testDocPath, MALFORMED_YAML_DOC);

      await expect(tasks.parseTaskDocument(testDocPath)).rejects.toThrow(/Failed to parse YAML/);
    });

    it('should parse all task fields correctly', async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);

      const doc = await tasks.parseTaskDocument(testDocPath);
      const firstTask = doc.taskLists[0].tasks[0];

      expect(firstTask.id).toBe('1.1');
      expect(firstTask.title).toBe('Create database schema');
      expect(firstTask.type).toBe('database-schema');
      expect(firstTask.project).toBe('apps/api');
      expect(firstTask.description).toBe('Design database schema');
      expect(firstTask.deliverables).toEqual(['CREATE TABLE test_table']);
      expect(firstTask.requirements).toEqual(['Follow naming conventions']);
      expect(firstTask.status).toBe('todo');
      expect(firstTask.depends_on).toEqual([]);
    });

    it('should parse task dependencies', async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);

      const doc = await tasks.parseTaskDocument(testDocPath);
      const secondTask = doc.taskLists[0].tasks[1];

      expect(secondTask.depends_on).toEqual(['1.1']);
    });
  });

  describe('listTasks', () => {
    beforeEach(async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
    });

    it('should list all tasks without filters', async () => {
      const result = await tasks.listTasks(testDocPath);

      expect(result.tasks).toHaveLength(4);
      expect(result.tasks[0].id).toBe('1.1');
      expect(result.tasks[0].listName).toBe('db');
    });

    it('should filter tasks by status', async () => {
      const result = await tasks.listTasks(testDocPath, { status: 'todo' });

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks.every((t) => t.status === 'todo')).toBe(true);
    });

    it('should filter tasks by list name', async () => {
      const result = await tasks.listTasks(testDocPath, { list: 'api' });

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks.every((t) => t.listName === 'api')).toBe(true);
    });

    it('should filter tasks by type', async () => {
      const result = await tasks.listTasks(testDocPath, { type: 'endpoint' });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].type).toBe('endpoint');
    });

    it('should apply head limit', async () => {
      const result = await tasks.listTasks(testDocPath, { head: 2 });

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('1.1');
      expect(result.tasks[1].id).toBe('1.2');
    });

    it('should apply tail limit', async () => {
      const result = await tasks.listTasks(testDocPath, { tail: 2 });

      expect(result.tasks).toHaveLength(2);
      expect(result.tasks[0].id).toBe('2.1');
      expect(result.tasks[1].id).toBe('2.2');
    });

    it('should combine multiple filters', async () => {
      const result = await tasks.listTasks(testDocPath, {
        list: 'api',
        status: 'completed',
      });

      expect(result.tasks).toHaveLength(1);
      expect(result.tasks[0].id).toBe('2.2');
    });
  });

  describe('getTask', () => {
    beforeEach(async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
    });

    it('should retrieve task by ID', async () => {
      const result = await tasks.getTask(testDocPath, '1.1');

      expect(result).not.toBeNull();
      expect(result?.task.id).toBe('1.1');
      expect(result?.task.title).toBe('Create database schema');
      expect(result?.listName).toBe('db');
    });

    it('should return null for non-existent task', async () => {
      const result = await tasks.getTask(testDocPath, '99.99');

      expect(result).toBeNull();
    });

    it('should find task across different lists', async () => {
      const result = await tasks.getTask(testDocPath, '2.1');

      expect(result).not.toBeNull();
      expect(result?.listName).toBe('api');
    });
  });

  describe('updateTaskStatus', () => {
    beforeEach(async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
    });

    it('should update task status successfully', async () => {
      const result = await tasks.updateTaskStatus(testDocPath, '1.1', 'in progress');

      expect(result.success).toBe(true);
      expect(result.message).toContain('todo → in progress');
      expect(result.taskIds).toEqual(['1.1']);

      // Verify the change was persisted
      const doc = await tasks.parseTaskDocument(testDocPath);
      const task = doc.taskLists[0].tasks[0];
      expect(task.status).toBe('in progress');
    });

    it('should handle all valid status transitions', async () => {
      // todo → in progress
      let result = await tasks.updateTaskStatus(testDocPath, '1.1', 'in progress');
      expect(result.success).toBe(true);

      // in progress → completed
      result = await tasks.updateTaskStatus(testDocPath, '1.1', 'completed');
      expect(result.success).toBe(true);

      // completed → cancelled
      result = await tasks.updateTaskStatus(testDocPath, '1.1', 'cancelled');
      expect(result.success).toBe(true);

      // cancelled → todo
      result = await tasks.updateTaskStatus(testDocPath, '1.1', 'todo');
      expect(result.success).toBe(true);
    });

    it('should return error for non-existent task', async () => {
      const result = await tasks.updateTaskStatus(testDocPath, '99.99', 'completed');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('deleteTask', () => {
    beforeEach(async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
    });

    it('should delete task successfully', async () => {
      const result = await tasks.deleteTask(testDocPath, '1.1');

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted');
      expect(result.taskIds).toEqual(['1.1']);

      // Verify task was removed
      const doc = await tasks.parseTaskDocument(testDocPath);
      const task = doc.taskLists[0].tasks.find((t) => t.id === '1.1');
      expect(task).toBeUndefined();
    });

    it('should return error for non-existent task', async () => {
      const result = await tasks.deleteTask(testDocPath, '99.99');

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('addTask', () => {
    beforeEach(async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
    });

    it('should add task to existing list', async () => {
      const result = await tasks.addTask(testDocPath, {
        list: 'db',
        title: 'New database task',
        type: 'database-schema',
        project: 'apps/api',
        description: 'A new task for testing',
        deliverables: ['New deliverable'],
        requirements: ['New requirement'],
      });

      expect(result.success).toBe(true);
      expect(result.message).toContain('added');
      expect(result.taskIds).toHaveLength(1);

      // Verify task was added
      const doc = await tasks.parseTaskDocument(testDocPath);
      const dbTasks = doc.taskLists.find((list) => list.name === 'db');
      expect(dbTasks?.tasks).toHaveLength(3); // Was 2, now 3
      expect(dbTasks?.tasks[2].title).toBe('New database task');
    });

    it('should generate unique task ID', async () => {
      const result = await tasks.addTask(testDocPath, {
        list: 'db',
        title: 'Another task',
        type: 'database-migration',
        project: 'apps/api',
      });

      expect(result.success).toBe(true);

      const doc = await tasks.parseTaskDocument(testDocPath);
      const dbTasks = doc.taskLists.find((list) => list.name === 'db');
      const newTask = dbTasks?.tasks[dbTasks.tasks.length - 1];
      expect(newTask?.id).toBe('1.3'); // Next after 1.2
    });

    it('should return error for non-existent task list', async () => {
      const result = await tasks.addTask(testDocPath, {
        list: 'nonexistent',
        title: 'Test',
        type: 'test',
        project: 'apps/api',
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });

  describe('listTaskLists', () => {
    beforeEach(async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);
    });

    it('should list all task lists with statistics', async () => {
      const result = await tasks.listTaskLists(testDocPath);

      expect(result.taskLists).toHaveLength(2);

      const dbList = result.taskLists.find((list) => list.name === 'db');
      expect(dbList).toBeDefined();
      expect(dbList?.taskCount).toBe(2);
      expect(dbList?.statuses.todo).toBe(2);

      const apiList = result.taskLists.find((list) => list.name === 'api');
      expect(apiList).toBeDefined();
      expect(apiList?.taskCount).toBe(2);
      expect(apiList?.statuses['in progress']).toBe(1);
      expect(apiList?.statuses.completed).toBe(1);
    });
  });

  describe('validateDocument', () => {
    it('should validate correct document structure', async () => {
      await writeFile(testDocPath, SAMPLE_TASK_DOC);

      const result = await tasks.validateDocument(testDocPath);

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.taskCount).toBe(4);
      expect(result.taskListCount).toBe(2);
    });

    it('should detect missing frontmatter fields', async () => {
      const invalidDoc = `---
title: Test
---

\`\`\`yaml tasks:db
tasks:
  - id: 1.1
    title: Test
    status: todo
\`\`\`
`;
      await writeFile(testDocPath, invalidDoc);

      const result = await tasks.validateDocument(testDocPath);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'source')).toBe(true);
    });

    it('should detect invalid status values', async () => {
      const invalidDoc = `---
title: Test
description: Test
source: test.md
---

\`\`\`yaml tasks:db
tasks:
  - id: 1.1
    title: Test
    type: test
    project: test
    description: Test
    status: invalid-status
\`\`\`
`;
      await writeFile(testDocPath, invalidDoc);

      const result = await tasks.validateDocument(testDocPath);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.message.includes('invalid status'))).toBe(true);
    });

    it('should detect missing required task fields', async () => {
      const invalidDoc = `---
title: Test
description: Test
source: test.md
---

\`\`\`yaml tasks:db
tasks:
  - id: 1.1
    status: todo
\`\`\`
`;
      await writeFile(testDocPath, invalidDoc);

      const result = await tasks.validateDocument(testDocPath);

      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field === 'title')).toBe(true);
    });
  });
});
