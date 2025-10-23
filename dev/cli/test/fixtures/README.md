# Test Fixtures for Prisma Build Tool

This directory contains Prisma schema fixtures used for testing the Prisma build tool functionality.

## Fixture Schemas

### test-auth
- **Purpose**: Basic authentication schema with User and Session models
- **Schema**: `auth`
- **Models**: User, Session
- **Dependencies**: None

### test-payments
- **Purpose**: Payment processing schema with Payment and Transaction models
- **Schema**: `payments`
- **Models**: Payment, Transaction
- **Enums**: PaymentStatus
- **Dependencies**: None

### test-blog
- **Purpose**: Blog schema with Post and Comment models
- **Schema**: `blog`
- **Models**: Post, Comment
- **Dependencies**: test-auth (for User relations)

### test-app
- **Purpose**: Main application schema that imports multiple libraries
- **Schema**: `public`
- **Models**: Product, Order
- **Enums**: OrderStatus
- **Dependencies**: test-auth, test-payments, test-blog
- **Configuration**: Includes datasource and generator

### test-circular-a / test-circular-b
- **Purpose**: Test circular dependency detection
- **Schema**: `circular_a` / `circular_b`
- **Models**: CircularA / CircularB
- **Dependencies**: Each imports the other (circular)

### test-with-plugin
- **Purpose**: Test plugin directive processing
- **Schema**: `plugin_test`
- **Models**: PluginTest
- **Plugin**: mock-plugin directive

## Test Scenarios Covered

1. **Single Library**: test-auth (no dependencies)
2. **Library Chain**: test-blog → test-auth
3. **Multiple Imports**: test-app → (test-auth, test-payments, test-blog)
4. **Diamond Pattern**: test-app → test-blog → test-auth (auth imported twice)
5. **Circular Dependencies**: test-circular-a ↔ test-circular-b
6. **Enum Handling**: PaymentStatus, OrderStatus
7. **Multi-Schema**: All schemas use `@@schema()` directive
8. **Generation Boundaries**: Import comments preserved
9. **Plugin System**: test-with-plugin uses plugin directive

## Usage in Tests

These fixtures are used by:
- `playground.spec.ts` - Comprehensive scenario testing
- `integration.spec.ts` - Real-world schema composition testing
- `graph.spec.ts` - Dependency graph building tests
- `merger.spec.ts` - Schema merging logic tests
- `parser.spec.ts` - Schema parsing tests
