// ============================================================================
// Core API - Foundational building blocks for NestJS applications
// ============================================================================

// Re-export Prisma types
export { PrismaClient } from "./generated/prisma";
// DTOs and Entities (legacy - should be moved to feature modules)
export { CreateLinkDto } from "./links/dto/create-link.dto";
export { UpdateLinkDto } from "./links/dto/update-link.dto";
export { Link } from "./links/entities/link.entity";
// Prisma client singleton
export { prisma } from "./prisma.client";
// Decorators (shared across all modules)
export { IS_PUBLIC_KEY, Public } from "./public.decorator";
