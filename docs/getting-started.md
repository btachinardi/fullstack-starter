# Getting Started with Fullstack Starter

This guide will help you set up and run the fullstack-starter project locally.

## Prerequisites

- **Node.js**: v20.18.0 or higher (LTS)
- **pnpm**: v9.0.0 or higher (managed via Corepack)
- **Git**: Latest version
- **Docker**: Optional for local database and Redis

## Quick Start

### Option 1: Using Dev Container (Recommended)

The easiest way to get started is using the Dev Container:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
2. Install [VS Code](https://code.visualstudio.com/) with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
3. Clone the repository:
   \`\`\`bash
   git clone <repository-url>
   cd fullstack-starter
   \`\`\`
4. Open in VS Code and click "Reopen in Container" when prompted
5. Wait for the container to build and setup to complete
6. Run the project:
   \`\`\`bash
   pnpm dev
   \`\`\`

### Option 2: Native Setup (macOS/Linux/WSL2)

1. **Enable Corepack** (manages pnpm version):
   \`\`\`bash
   corepack enable
   \`\`\`

2. **Clone the repository**:
   \`\`\`bash
   git clone <repository-url>
   cd fullstack-starter
   \`\`\`

3. **Run the bootstrap script**:
   \`\`\`bash
   pnpm setup
   \`\`\`

   This will:
   - Verify Node.js and pnpm versions
   - Install all dependencies
   - Generate \`.env.local\` files from templates
   - Set up Git hooks (Husky)
   - Configure pre-commit checks

4. **Configure environment variables**:
   - Review and update \`apps/web/.env.local\`
   - Review and update \`apps/api/.env.local\`

5. **Start development servers**:
   \`\`\`bash
   # Start all apps in parallel
   pnpm dev

   # Or start individually
   pnpm dev:web   # Web app on http://localhost:3000
   pnpm dev:api   # API server on http://localhost:4000
   \`\`\`

## Available Scripts

### Workspace Scripts (run from root)

- \`pnpm dev\` - Start all apps in development mode
- \`pnpm build\` - Build all packages and apps
- \`pnpm lint\` - Lint all packages
- \`pnpm typecheck\` - Type-check all packages
- \`pnpm test\` - Run tests across all packages
- \`pnpm format\` - Format code with Prettier
- \`pnpm clean\` - Clean build artifacts and node_modules

### Web App Scripts

- \`pnpm dev:web\` - Start web development server
- \`pnpm build --filter @fullstack-starter/web\` - Build web app
- \`pnpm test --filter @fullstack-starter/web\` - Run web tests

### API Scripts

- \`pnpm dev:api\` - Start API development server
- \`pnpm api:migrate\` - Run database migrations
- \`pnpm api:seed\` - Seed database with sample data
- \`pnpm api:db:studio\` - Open Prisma Studio
- \`pnpm api:openapi\` - Generate OpenAPI specification

## Project Structure

\`\`\`
fullstack-starter/
├── apps/
│   ├── web/          # React + Vite frontend application
│   └── api/          # NestJS backend application
├── packages/
│   ├── config-*/     # Shared configuration packages
│   ├── ui/           # UI component library (future)
│   └── platform-*/   # Platform abstraction packages (future)
├── examples/         # Reference implementation examples
├── docs/             # Documentation
├── scripts/          # Build and setup scripts
└── tools/            # Development tools
\`\`\`

## Troubleshooting

### Node version mismatch

If you see errors about Node version:

\`\`\`bash
# Install Node v20.18.0 using nvm
nvm install 20.18.0
nvm use 20.18.0

# Or use the version in .nvmrc
nvm use
\`\`\`

### pnpm not found

\`\`\`bash
# Enable Corepack
corepack enable

# If that doesn't work, install pnpm globally
npm install -g pnpm@9.15.0
\`\`\`

### Permission errors on Git hooks

\`\`\`bash
# Make hooks executable
chmod +x .husky/pre-commit
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
\`\`\`

### Port already in use

- Web app (port 3000): Change \`VITE_PORT\` in \`apps/web/.env.local\`
- API server (port 4000): Change \`PORT\` in \`apps/api/.env.local\`

## Windows Setup (WSL2)

Windows users should use WSL2 for the best development experience:

1. Install [WSL2](https://learn.microsoft.com/en-us/windows/wsl/install)
2. Install Ubuntu from Microsoft Store
3. Follow the Native Setup instructions above within WSL2

## Next Steps

- Read the [Development Workflow](./dev-workflow.md) guide
- Review the [API Documentation](./api-shell.md)
- Check out the [Web Application Guide](./web-shell.md)
- Learn about [Environment Variables](./env.md)

## Getting Help

- Check the logs in \`.logs/\` directory for setup issues
- Review the JSON summary in \`.logs/setup-*.json\`
- Open an issue on GitHub
- Contact the Platform Engineering team
