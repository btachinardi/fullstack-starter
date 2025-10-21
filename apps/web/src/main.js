import { jsx as _jsx } from "react/jsx-runtime";
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
ReactDOM.createRoot(document.getElementById('root')).render(_jsx(React.StrictMode, { children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(RouterProvider, { router: router }) }) }));
//# sourceMappingURL=main.js.map