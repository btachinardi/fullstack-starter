// ============================================================================
// Platform API - Application bootstrapping and module wiring
// ============================================================================

export type { AppFactoryConfig } from "./app-factory";
// Bootstrap and app factory
export { bootstrapApp, createApp } from "./app-factory";

// Base application module (wires all feature modules together)
export { BaseAppModule } from "./base-app.module";

// Prisma client singleton (re-exported from @libs/core/api)
export { prisma } from "./prisma.client";
