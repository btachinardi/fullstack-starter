import { defineConfig } from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'cli/main': 'src/cli/main.ts',
    'hooks/subagent-stop': 'src/hooks/subagent-stop.ts',
  },
  format: ['esm'],
  dts: {
    entry: {
      index: 'src/index.ts',
    },
  },
  sourcemap: true,
  clean: true,
  shims: true,
  splitting: false,
  treeshake: true,
  minify: false,
  target: 'node20',
  outDir: 'dist',
  esbuildOptions(options) {
    // Add shebang to executables
    const entry = options.entryNames;
    if (entry === 'cli/main' || entry === 'hooks/subagent-stop') {
      options.banner = {
        js: '#!/usr/bin/env node',
      };
    }
  },
});
