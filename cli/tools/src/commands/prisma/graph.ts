/**
 * Dependency Graph Builder
 *
 * Builds and validates dependency graphs from schema imports.
 */

import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseSchema } from "./parser";
import type { DependencyGraph, DependencyGraphResult } from "./types";
import { CircularDependencyError, ImportNotFoundError } from "./types";

/**
 * Build dependency graph from entry point schema
 */
export async function buildDependencyGraph(
	entryPoint: string,
): Promise<DependencyGraphResult> {
	const graph: DependencyGraph = {
		nodes: new Set(),
		edges: new Map(),
		sortedPaths: [],
		entryPoint,
		metadata: {
			nodeCount: 0,
			maxDepth: 0,
		},
	};

	const warnings: string[] = [];
	const visiting = new Set<string>();
	const visited = new Set<string>();

	async function visit(schemaPath: string, depth = 0): Promise<void> {
		const absolutePath = resolve(schemaPath);

		// Check for circular dependency
		if (visiting.has(absolutePath)) {
			const cycle = Array.from(visiting);
			cycle.push(absolutePath);
			throw new CircularDependencyError(cycle);
		}

		// Skip if already visited
		if (visited.has(absolutePath)) {
			return;
		}

		visiting.add(absolutePath);
		graph.nodes.add(absolutePath);
		graph.edges.set(absolutePath, new Set());

		// Update max depth
		if (depth > graph.metadata.maxDepth) {
			graph.metadata.maxDepth = depth;
		}

		// Parse schema and follow imports
		const parsed = await parseSchema(absolutePath);

		if (parsed.imports.length > 0 && process.env.VERBOSE) {
			console.log(
				`  Found ${parsed.imports.length} import(s) in ${absolutePath}`,
			);
		}

		for (const importPath of parsed.imports) {
			const resolvedImport = resolveWorkspacePath(importPath, absolutePath);

			if (process.env.VERBOSE) {
				console.log(`  Resolving: ${importPath} -> ${resolvedImport}`);
			}

			if (!existsSync(resolvedImport)) {
				throw new ImportNotFoundError(importPath, absolutePath);
			}

			graph.edges.get(absolutePath)?.add(resolvedImport);
			await visit(resolvedImport, depth + 1);
		}

		visiting.delete(absolutePath);
		visited.add(absolutePath);
	}

	await visit(entryPoint);

	// Topological sort
	graph.sortedPaths = topologicalSort(graph);
	graph.metadata.nodeCount = graph.nodes.size;

	return {
		orderedSchemas: graph.sortedPaths,
		graph,
		warnings,
	};
}

/**
 * Resolve workspace path to absolute file system path
 */
export function resolveWorkspacePath(
	importPath: string,
	currentFile: string,
): string {
	// Handle workspace paths (@libs/*, @apps/*)
	if (importPath.startsWith("@libs/") || importPath.startsWith("@apps/")) {
		// Find workspace root (go up until we find pnpm-workspace.yaml or package.json with workspaces)
		const workspaceRoot = findWorkspaceRoot(currentFile);

		// Convert @libs/api/prisma/schema.prisma -> libs/api/prisma/schema.prisma
		// Remove @ and replace first / after package name
		const relativePath = importPath.substring(1); // Remove @

		// @libs/api/prisma/schema.prisma -> libs/api/prisma/schema.prisma
		const resolved = resolve(workspaceRoot, relativePath);

		return resolved;
	}

	// Handle relative paths (e.g., ../test-auth/prisma/schema.prisma)
	const dir = dirname(currentFile);
	const resolved = resolve(dir, importPath);

	return resolved;
}

/**
 * Find workspace root directory
 */
function findWorkspaceRoot(startPath: string): string {
	let current = dirname(startPath);

	// Go up to find workspace root
	while (true) {
		const parent = dirname(current);

		// Check for workspace markers
		if (existsSync(resolve(current, "pnpm-workspace.yaml"))) {
			return current;
		}

		// Check for package.json with workspaces
		const pkgPath = resolve(current, "package.json");
		if (existsSync(pkgPath)) {
			try {
				const pkg = require(pkgPath);
				if (pkg.workspaces || pkg.name === "fullstack-starter") {
					return current;
				}
			} catch {
				// Ignore JSON parse errors
			}
		}

		// Stop if we've reached the root
		if (parent === current) {
			break;
		}

		current = parent;
	}

	// Fallback - use cwd
	return process.cwd();
}

/**
 * Topological sort using DFS
 */
function topologicalSort(graph: DependencyGraph): string[] {
	const sorted: string[] = [];
	const visited = new Set<string>();
	const visiting = new Set<string>();

	function visit(node: string): void {
		if (visited.has(node)) {
			return;
		}

		if (visiting.has(node)) {
			// Circular dependency (shouldn't happen as we check earlier)
			return;
		}

		visiting.add(node);

		// Visit dependencies first
		const deps = graph.edges.get(node);
		if (deps) {
			for (const dep of deps) {
				visit(dep);
			}
		}

		visiting.delete(node);
		visited.add(node);

		// Add node after dependencies
		sorted.push(node);
	}

	// Visit all nodes starting from entry point
	// This ensures all reachable nodes are included
	for (const node of graph.nodes) {
		visit(node);
	}

	return sorted;
}
