import type { INestApplication } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";

/**
 * Application Factory Configuration
 *
 * Defines configuration options for creating a NestJS application.
 */
export interface AppFactoryConfig {
	/**
	 * The root application module
	 */
	// biome-ignore lint/suspicious/noExplicitAny: Module type must be any for NestFactory compatibility
	module: any;

	/**
	 * Port to listen on
	 *
	 * Port resolution order:
	 * 1. process.env.PORT (if useEnvPort is true, default behavior)
	 * 2. config.port (if provided)
	 * 3. 3001 (default fallback)
	 *
	 * @default 3001
	 */
	port?: number;

	/**
	 * Whether to check PORT environment variable
	 *
	 * When true (default), PORT env var takes precedence over config.port
	 * Set to false to ignore environment variable and use only config.port
	 *
	 * @default true
	 */
	useEnvPort?: boolean;

	/**
	 * CORS configuration
	 */
	cors?: {
		/**
		 * Allowed origins (comma-separated string or array)
		 */
		origins?: string | string[];

		/**
		 * Allow credentials
		 */
		credentials?: boolean;
	};

	/**
	 * Enable global prefix for all routes (e.g., '/api')
	 */
	globalPrefix?: string;

	/**
	 * Disable body parser (required for Better Auth)
	 */
	disableBodyParser?: boolean;

	/**
	 * Enable shutdown hooks
	 */
	enableShutdownHooks?: boolean;

	/**
	 * Custom logger configuration
	 */
	logger?: false | ("log" | "warn" | "error" | "verbose" | "debug" | "fatal")[];
}

/**
 * Application Factory
 *
 * Creates and configures a NestJS application with common settings:
 * - Body parser disabled (for Better Auth compatibility)
 * - CORS configuration
 * - Global prefix support
 * - Port configuration from environment
 * - Graceful shutdown hooks
 *
 * @param config - Application configuration options
 * @returns Configured NestJS application instance
 *
 * @example
 * ```typescript
 * import { createApp } from '@libs/api';
 * import { AppModule } from './app.module';
 *
 * async function bootstrap() {
 *   const app = await createApp({
 *     module: AppModule,
 *     port: 3001,
 *   });
 *
 *   await app.listen(3001);
 * }
 * ```
 */
export async function createApp(
	config: AppFactoryConfig,
): Promise<INestApplication> {
	const {
		module,
		port,
		cors,
		globalPrefix,
		disableBodyParser = true,
		enableShutdownHooks = true,
		logger,
	} = config;

	// Create NestJS application
	const app = await NestFactory.create<NestExpressApplication>(module, {
		// Disable body parser to allow Better Auth to handle raw request bodies
		bodyParser: !disableBodyParser,
		// Configure logger
		logger: logger !== undefined ? logger : getDefaultLogger(),
	});

	// Enable shutdown hooks for graceful shutdown
	if (enableShutdownHooks) {
		app.enableShutdownHooks();
	}

	// Configure CORS
	const corsOrigins = getCorsOrigins(cors?.origins);
	app.enableCors({
		origin: corsOrigins,
		credentials: cors?.credentials !== false, // Default to true
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
	});

	// Set global prefix if provided
	if (globalPrefix) {
		app.setGlobalPrefix(globalPrefix);
	}

	return app;
}

/**
 * Bootstrap and Start Application
 *
 * Convenience function that creates the app and starts listening on the configured port.
 *
 * Port resolution priority:
 * 1. process.env.PORT (if useEnvPort !== false)
 * 2. config.port
 * 3. 3001 (default)
 *
 * @param config - Application configuration options
 * @returns Promise that resolves when the app is listening
 *
 * @example
 * ```typescript
 * import { bootstrapApp } from '@libs/api';
 * import { AppModule } from './app.module';
 *
 * // Simplest usage - uses env PORT or defaults to 3001
 * bootstrapApp({ module: AppModule });
 *
 * // Override default port (still respects env PORT)
 * bootstrapApp({ module: AppModule, port: 4000 });
 *
 * // Use specific port, ignore env PORT
 * bootstrapApp({ module: AppModule, port: 4000, useEnvPort: false });
 * ```
 */
export async function bootstrapApp(
	config: AppFactoryConfig,
): Promise<INestApplication> {
	const app = await createApp(config);

	// Resolve port with priority: env > config > default
	const port = resolvePort(config.port, config.useEnvPort);

	// Start listening
	await app.listen(port);

	// Log startup information
	logStartupInfo(port, config.globalPrefix);

	return app;
}

/**
 * Resolve port from environment, config, or default
 *
 * @param configPort - Port from configuration (optional)
 * @param useEnvPort - Whether to check environment variable (default: true)
 * @returns Resolved port number
 */
function resolvePort(configPort?: number, useEnvPort = true): number {
	// Priority 1: Environment variable PORT (if enabled)
	if (useEnvPort && process.env.PORT) {
		const envPort = Number.parseInt(process.env.PORT, 10);
		if (!Number.isNaN(envPort)) {
			return envPort;
		}
	}

	// Priority 2: Config port
	if (configPort !== undefined) {
		return configPort;
	}

	// Priority 3: Default port
	return 3001;
}

/**
 * Get CORS origins from environment or config
 */
function getCorsOrigins(
	origins?: string | string[],
): string | string[] | boolean {
	if (origins) {
		return typeof origins === "string" ? origins.split(",") : origins;
	}

	// Default: use CORS_ORIGINS env var or allow localhost in development
	const envOrigins = process.env.CORS_ORIGINS;
	if (envOrigins) {
		return envOrigins.split(",").map((origin) => origin.trim());
	}

	// Development default
	if (process.env.NODE_ENV !== "production") {
		return [
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:4200",
		];
	}

	// Production: no default origins (must be explicitly set)
	return false;
}

/**
 * Get default logger configuration
 */
function getDefaultLogger():
	| false
	| ("log" | "warn" | "error" | "verbose" | "debug" | "fatal")[] {
	const nodeEnv = process.env.NODE_ENV;

	// Default logger levels by environment
	if (nodeEnv === "production") {
		return ["error", "warn", "log"];
	}

	if (nodeEnv === "test") {
		return ["error"];
	}

	// Development
	return ["error", "warn", "log", "debug", "verbose"];
}

/**
 * Log startup information
 */
function logStartupInfo(port: number, globalPrefix?: string): void {
	const baseUrl = `http://localhost:${port}`;
	const apiUrl = globalPrefix ? `${baseUrl}${globalPrefix}` : baseUrl;

	console.log("\n");
	console.log("═".repeat(60));
	console.log(`🚀 API Server Started`);
	console.log("═".repeat(60));
	console.log(`📍 URL: ${apiUrl}`);
	console.log(`🏥 Health: ${apiUrl}/health`);
	console.log(`🔐 Auth: ${apiUrl}/api/auth/*`);
	console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
	console.log("═".repeat(60));
	console.log("\n");
}
