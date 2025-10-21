# Changesets

This directory contains changeset files that describe changes to packages in this monorepo.

## Creating a changeset

When you make a change that should be included in a release:

\`\`\`bash
pnpm changeset
\`\`\`

Follow the prompts to describe your changes.

## Versioning packages

To version packages based on changesets:

\`\`\`bash
pnpm version-packages
\`\`\`

## Publishing

To build and publish packages:

\`\`\`bash
pnpm release
\`\`\`

For more information, see the [Changesets documentation](https://github.com/changesets/changesets).
