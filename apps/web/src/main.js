import { jsx as _jsx } from "react/jsx-runtime";
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
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Root element not found');
}
ReactDOM.createRoot(rootElement).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(RouterProvider, { router: router }) }) }));
//# sourceMappingURL=main.js.map