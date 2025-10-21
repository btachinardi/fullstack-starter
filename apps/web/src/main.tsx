import { QueryClientProvider, createQueryClient } from '@starter/query';
import { RouterProvider, createRouter } from '@starter/router';
import React from 'react';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routes/__root';
import './index.css';

// Create a query client using platform utility
const queryClient = createQueryClient();

// Create a router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
});

// Register the router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
