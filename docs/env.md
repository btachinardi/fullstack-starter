# Environment Variables

This document describes all environment variables used across the fullstack-starter project.

## Environment Files

Each application has its own environment configuration:

- \`apps/web/.env.example\` - Web application template
- \`apps/web/.env.local\` - Web application local overrides (git-ignored)
- \`apps/api/.env.example\` - API application template
- \`apps/api/.env.local\` - API application local overrides (git-ignored)

## Web Application (\`apps/web\`)

### API Configuration

- \`VITE_API_URL\` - Base URL for API requests
  - **Default**: \`http://localhost:4000\`
  - **Required**: Yes
  - **Example**: \`https://api.example.com\`

- \`VITE_AUTH_URL\` - Authentication service URL
  - **Default**: \`http://localhost:4000/auth\`
  - **Required**: Yes

### Feature Flags

- \`VITE_ENABLE_ANALYTICS\` - Enable analytics tracking
  - **Default**: \`false\`
  - **Values**: \`true\` | \`false\`

- \`VITE_ENABLE_DEVTOOLS\` - Enable development tools (React Query DevTools, etc.)
  - **Default**: \`true\`
  - **Values**: \`true\` | \`false\`

### Analytics (Optional)

- \`VITE_ANALYTICS_KEY\` - Analytics service API key
  - **Default**: (empty)
  - **Required**: No

### Telemetry

- \`VITE_TELEMETRY_ENABLED\` - Enable usage telemetry
  - **Default**: \`false\`
  - **Values**: \`true\` | \`false\`

## API Application (\`apps/api\`)

### Server Configuration

- \`PORT\` - HTTP server port
  - **Default**: \`4000\`
  - **Required**: Yes

- \`NODE_ENV\` - Runtime environment
  - **Default**: \`development\`
  - **Values**: \`development\` | \`production\` | \`test\`

- \`CORS_ORIGIN\` - Allowed CORS origins
  - **Default**: \`http://localhost:3000\`
  - **Required**: Yes
  - **Example**: \`https://app.example.com,https://admin.example.com\`

### Database

- \`DATABASE_URL\` - PostgreSQL connection string
  - **Default**: \`postgresql://postgres:postgres@localhost:5432/starter_dev\`
  - **Required**: Yes
  - **Format**: \`postgresql://user:password@host:port/database\`

### Redis

- \`REDIS_URL\` - Redis connection string
  - **Default**: \`redis://localhost:6379\`
  - **Required**: Yes (for background jobs)
  - **Format**: \`redis://[user:password@]host:port[/database]\`

### Authentication

- \`JWT_SECRET\` - Secret key for JWT signing
  - **Default**: \`your-secret-key-change-in-production\`
  - **Required**: Yes
  - **Security**: Use a strong, random string in production

- \`JWT_EXPIRES_IN\` - JWT token expiration
  - **Default**: \`7d\`
  - **Format**: Zeit/ms format (e.g., \`60s\`, \`10m\`, \`7d\`)

### API Keys (Optional)

- \`API_KEY\` - Internal API key for service-to-service auth
  - **Default**: (empty)
  - **Required**: No

### Telemetry

- \`TELEMETRY_ENABLED\` - Enable application telemetry
  - **Default**: \`false\`
  - **Values**: \`true\` | \`false\`

## Environment Validation

All applications validate their environment variables on startup using Zod schemas. If required variables are missing or invalid, the application will:

1. Print a detailed error message
2. Show a table of missing/invalid variables
3. Reference this documentation
4. Exit with a non-zero status code

Example validation error:

\`\`\`
Environment validation failed:
┌─────────────────┬──────────┬─────────────────────────┐
│ Variable        │ Status   │ Issue                   │
├─────────────────┼──────────┼─────────────────────────┤
│ DATABASE_URL    │ Missing  │ Required variable       │
│ JWT_SECRET      │ Invalid  │ Must be at least 32 chars│
└─────────────────┴──────────┴─────────────────────────┘

See: /docs/env.md for configuration details
\`\`\`

## Environment Migration

When environment schemas change, use the migration utility:

\`\`\`bash
pnpm setup --migrate-env
\`\`\`

This will:
- Backup existing \`.env.local\` files
- Apply any schema migrations
- Add new required variables with placeholder values
- Remove deprecated variables (with warnings)

## Security Best Practices

1. **Never commit** \`.env\` or \`.env.local\` files
2. **Rotate secrets** regularly (JWT_SECRET, API keys)
3. **Use strong passwords** for database and Redis
4. **Different secrets** for each environment (dev, staging, prod)
5. **Limit CORS origins** in production
6. **Review logs** regularly for exposed secrets (gitleaks runs automatically)

## Production Deployment

For production deployments:

1. Set \`NODE_ENV=production\`
2. Use environment-specific secrets management (AWS Secrets Manager, Vault, etc.)
3. Never use default/example values
4. Enable HTTPS
5. Restrict CORS to production domains only
6. Enable telemetry for monitoring

## Troubleshooting

### Application won't start

Check that all required variables are set:

\`\`\`bash
# Verify environment files exist
ls -la apps/web/.env.local
ls -la apps/api/.env.local

# Check validation errors in logs
pnpm dev:api 2>&1 | grep -A 10 "Environment"
\`\`\`

### Database connection fails

Verify \`DATABASE_URL\` format and credentials:

\`\`\`bash
# Test PostgreSQL connection
psql $DATABASE_URL -c "SELECT 1"
\`\`\`

### Redis connection fails

Verify \`REDIS_URL\` and Redis is running:

\`\`\`bash
# Test Redis connection
redis-cli -u $REDIS_URL ping
\`\`\`

## Related Documentation

- [Getting Started](./getting-started.md)
- [Development Workflow](./dev-workflow.md)
- [API Documentation](./api-shell.md)
