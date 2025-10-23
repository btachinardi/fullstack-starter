/**
 * Mock Plugin for Testing
 *
 * Simple plugin that generates test models without external dependencies.
 */

import type { PrismaPlugin } from "../prisma.types";

/**
 * Mock plugin for testing plugin system
 */
export const mockPlugin: PrismaPlugin = {
	name: "mock-plugin",
	description: "Mock plugin for testing (generates sample models)",

	async generate(_config, context): Promise<string> {
		const namespace = context.namespace || "public";

		return `model MockUser {
  id    String @id @default(cuid())
  email String @unique
  name  String?

  @@map("mock_users")
  @@schema("${namespace}")
}

model MockPost {
  id      String @id @default(cuid())
  title   String
  content String

  @@map("mock_posts")
  @@schema("${namespace}")
}`;
	},

	validate(_config): boolean {
		return true; // Mock plugin accepts any config
	},
};
