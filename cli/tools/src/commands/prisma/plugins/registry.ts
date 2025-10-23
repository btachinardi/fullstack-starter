/**
 * Plugin Registry
 *
 * Central registry for all Prisma build tool plugins.
 */

import type { PrismaPlugin } from "../types";
import { betterAuthPlugin } from "./better-auth";
import { mockPlugin } from "./mock-plugin";

/**
 * Plugin registry map
 */
export const pluginRegistry = new Map<string, PrismaPlugin>([
	["better-auth", betterAuthPlugin],
	["mock-plugin", mockPlugin],
]);

/**
 * Get plugin by name
 */
export function getPlugin(name: string): PrismaPlugin | undefined {
	return pluginRegistry.get(name);
}

/**
 * List all available plugins
 */
export function listPlugins(): PrismaPlugin[] {
	return Array.from(pluginRegistry.values());
}

/**
 * Register a new plugin
 */
export function registerPlugin(plugin: PrismaPlugin): void {
	pluginRegistry.set(plugin.name, plugin);
}
