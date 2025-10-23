// ============================================================================
// Base Application Module - Import this for all common API functionality
// ============================================================================

export { auth } from "./auth/auth.config";
// ============================================================================
// Authentication Components (included in BaseAppModule)
// ============================================================================
export { AuthModule } from "./auth/auth.module";
export type { AppFactoryConfig } from "./core/app-factory";
// ============================================================================
// Application Factory - Centralized app initialization
// ============================================================================
export { bootstrapApp, createApp } from "./core/app-factory";
export { BaseAppModule } from "./core/base-app.module";
// ============================================================================
// Database Components
// ============================================================================
export { prisma } from "./database/prisma.client";
export { HealthController } from "./health/health.controller";
// ============================================================================
// Health Check Components (included in BaseAppModule)
// ============================================================================
export { HealthModule } from "./health/health.module";
export { PrismaHealthIndicator } from "./health/indicators/prisma.health";

// ============================================================================
// DTOs and Entities
// ============================================================================
export { CreateLinkDto } from "./links/dto/create-link.dto";
export { UpdateLinkDto } from "./links/dto/update-link.dto";
export { Link } from "./links/entities/link.entity";
