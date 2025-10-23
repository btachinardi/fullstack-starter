# ============================================================================
# Multi-stage Dockerfile for Next.js Web Application
# ============================================================================
# This Dockerfile uses multi-stage builds for optimal image size and caching.
#
# Stages:
#   1. base - Base image with pnpm
#   2. dependencies - Install all dependencies
#   3. build - Build Next.js application
#   4. development - Development image with hot-reload
#   5. production - Production-ready minimal image with standalone output

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
COPY apps/web/package.json ./apps/web/
COPY libs/ui/package.json ./libs/ui/
COPY configs/typescript/package.json ./configs/typescript/

# Install dependencies
RUN pnpm install --frozen-lockfile

# ============================================================================
# Stage 3: Build
# ============================================================================
FROM dependencies AS build

# Set build-time environment variables
ARG NODE_ENV=production
ARG NEXT_PUBLIC_API_URL
ENV NODE_ENV=${NODE_ENV}
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Copy source code
COPY apps/web ./apps/web
COPY libs/ui ./libs/ui
COPY configs ./configs

# Copy TypeScript and Next.js configurations
COPY tsconfig.json ./

# Build libs/ui first (workspace dependency)
RUN pnpm --filter @libs/ui build

# Build Next.js application
RUN pnpm --filter @apps/web build

# ============================================================================
# Stage 4: Development
# ============================================================================
FROM base AS development

# Install development tools
RUN apk add --no-cache curl wget

# Copy dependencies from dependencies stage
COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=dependencies /app/libs/ui/node_modules ./libs/ui/node_modules

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json ./apps/web/
COPY libs/ui/package.json ./libs/ui/
COPY configs ./configs

# Expose Next.js dev server port
EXPOSE 3000

# Default command (can be overridden in docker-compose.dev.yml)
CMD ["pnpm", "--filter", "@apps/web", "dev"]

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
    adduser -S nextjs -u 1001

# Set working directory
WORKDIR /app

# Set runtime environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copy package files
COPY --chown=nextjs:nodejs package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY --chown=nextjs:nodejs apps/web/package.json ./apps/web/

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built Next.js application
# Next.js creates a standalone output for production
COPY --chown=nextjs:nodejs --from=build /app/apps/web/.next/standalone ./
COPY --chown=nextjs:nodejs --from=build /app/apps/web/.next/static ./apps/web/.next/static
COPY --chown=nextjs:nodejs --from=build /app/apps/web/public ./apps/web/public

# Switch to non-root user
USER nextjs

# Expose Next.js production port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000 || exit 1

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Start Next.js in production mode
CMD ["node", "apps/web/server.js"]
