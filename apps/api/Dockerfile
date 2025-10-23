# ============================================================================
# Multi-stage Dockerfile for NestJS API
# ============================================================================
# This Dockerfile uses multi-stage builds for optimal image size and security.
#
# Stages:
#   1. base - Base image with pnpm
#   2. dependencies - Install all dependencies
#   3. build - Build the application
#   4. development - Development image with hot-reload
#   5. production - Production-ready minimal image

# ============================================================================
# Stage 1: Base Image
# ============================================================================
FROM node:20-alpine AS base

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

# Set working directory
WORKDIR /app

# ============================================================================
# Stage 2: Dependencies
# ============================================================================
FROM base AS dependencies

# Copy package manager files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY .npmrc ./

# Copy workspace package.json files
COPY apps/api/package.json ./apps/api/
COPY libs/api/package.json ./libs/api/
COPY libs/utils/package.json ./libs/utils/
COPY configs/typescript/package.json ./configs/typescript/
COPY configs/jest/package.json ./configs/jest/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================================================
# Stage 3: Build
# ============================================================================
FROM dependencies AS build

# Copy source code
COPY apps/api ./apps/api
COPY libs/api ./libs/api
COPY libs/utils ./libs/utils
COPY configs ./configs

# Copy TypeScript configurations
COPY tsconfig.json ./

# Generate Prisma Client
WORKDIR /app/libs/api
RUN pnpm exec prisma generate

# Build the application
WORKDIR /app
RUN pnpm --filter @apps/api build
RUN pnpm --filter @libs/api build

# ============================================================================
# Stage 4: Development
# ============================================================================
FROM base AS development

# Install development tools
RUN apk add --no-cache curl wget

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=dependencies /app/libs/api/node_modules ./libs/api/node_modules

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY libs/api/package.json ./libs/api/
COPY configs ./configs

# Copy Prisma schema and generate client
COPY libs/api/prisma ./libs/api/prisma
COPY libs/api/prisma.config.ts ./libs/api/
WORKDIR /app/libs/api
RUN pnpm exec prisma generate

# Set working directory back to app root
WORKDIR /app

# Expose API port and debug port
EXPOSE 3001 9229

# Default command (can be overridden in docker-compose.dev.yml)
CMD ["pnpm", "--filter", "@apps/api", "dev"]

# ============================================================================
# Stage 5: Production
# ============================================================================
FROM node:20-alpine AS production

# Install pnpm globally
RUN corepack enable && corepack prepare pnpm@10.19.0 --activate

# Install production tools only
RUN apk add --no-cache curl wget dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY --chown=nestjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=nestjs:nodejs apps/api/package.json ./apps/api/
COPY --chown=nestjs:nodejs libs/api/package.json ./libs/api/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application
COPY --chown=nestjs:nodejs --from=build /app/apps/api/dist ./apps/api/dist
COPY --chown=nestjs:nodejs --from=build /app/libs/api/dist ./libs/api/dist
COPY --chown=nestjs:nodejs --from=build /app/libs/api/src/generated ./libs/api/src/generated

# Copy Prisma files for runtime
COPY --chown=nestjs:nodejs libs/api/prisma ./libs/api/prisma
COPY --chown=nestjs:nodejs libs/api/prisma.config.ts ./libs/api/

# Switch to non-root user
USER nestjs

# Expose API port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3001/health || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start the application
CMD ["node", "apps/api/dist/main.js"]
