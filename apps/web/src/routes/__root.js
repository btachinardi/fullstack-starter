import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRootRoute, Link, Outlet } from '@starter/router';
export const Route = createRootRoute({
    component: RootComponent,
});
function RootComponent() {
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("nav", { className: "bg-white shadow-sm", children: _jsx("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: _jsx("div", { className: "flex justify-between h-16", children: _jsxs("div", { className: "flex", children: [_jsx("div", { className: "flex-shrink-0 flex items-center", children: _jsx("h1", { className: "text-xl font-bold", children: "Fullstack Starter" }) }), _jsxs("div", { className: "ml-6 flex space-x-8", children: [_jsx(Link, { to: "/", className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900", children: "Home" }), _jsx(Link, { to: "/resources", className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900", children: "Resources" }), _jsx(Link, { to: "/about", className: "inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-900", children: "About" })] })] }) }) }) }), _jsx("main", { children: _jsx(Outlet, {}) })] }));
}
// Import route modules
import { Route as IndexRoute } from './index';
import { Route as ResourcesRoute } from './resources';
import { Route as AboutRoute } from './about';
// Create route tree
export const routeTree = Route.addChildren([
    IndexRoute,
    ResourcesRoute,
    AboutRoute,
]);
//# sourceMappingURL=__root.js.map