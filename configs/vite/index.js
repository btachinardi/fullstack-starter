import { defineConfig } from 'vite';

/**
 * Shared Vite configuration for React applications
 */
export function createViteConfig(options = {}) {
  const { plugins = [], alias = {}, server = {}, build = {} } = options;

  return defineConfig({
    plugins,
    resolve: {
      alias,
    },
    server: {
      port: 3000,
      host: true,
      ...server,
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['@tanstack/react-router'],
            query: ['@tanstack/react-query'],
          },
        },
      },
      ...build,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', '@tanstack/react-router', '@tanstack/react-query'],
    },
  });
}

export default createViteConfig;
