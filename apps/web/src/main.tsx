import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider, createRouter } from '@starter/router';
import { createQueryClient, QueryClientProvider } from '@starter/query';

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
