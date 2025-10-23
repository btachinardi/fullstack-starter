import { bootstrapApp } from "@libs/platform/api";
import { AppModule } from "./app.module";

/**
 * Bootstrap the API application
 *
 * The app factory automatically handles:
 * - Port resolution (PORT env var → config.port → 3001)
 * - Body parser disabled (required for Better Auth)
 * - CORS configuration (from CORS_ORIGINS env var)
 * - Graceful shutdown hooks
 * - Environment-aware logging
 */
void bootstrapApp({
	module: AppModule,
});
