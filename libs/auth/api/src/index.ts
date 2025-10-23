/**
 * @libs/auth/api
 *
 * Authentication module for NestJS using Better Auth
 *
 * Exports:
 * - AuthModule: NestJS module for authentication
 * - auth: Better Auth instance
 * - prisma: Prisma client for auth database
 */

// Re-export Better Auth types and decorators from the NestJS integration
export type { Session, UserSession } from "@thallesp/nestjs-better-auth";
export { AllowAnonymous, OptionalAuth } from "@thallesp/nestjs-better-auth";
export { auth, setEmailVerificationCallback } from "./auth.config";
export { AuthModule } from "./auth.module";
export { prisma } from "./prisma.client";
