import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRoute } from '@starter/platform-router';
import { Route as RootRoute } from './__root';
export const Route = createRoute({
    getParentRoute: () => RootRoute,
    path: '/',
    component: HomeComponent,
});
function HomeComponent() {
    return (_jsxs("div", { className: "p-8", children: [_jsx("h1", { className: "text-3xl font-bold mb-4", children: "Welcome to Fullstack Starter" }), _jsx("p", { className: "text-gray-600 mb-4", children: "A production-ready fullstack monorepo with React, NestJS, and TanStack." }), _jsxs("div", { className: "space-y-2", children: [_jsx("a", { href: "/resources", className: "block text-blue-600 hover:underline", children: "\u2192 View Resources" }), _jsx("a", { href: "/about", className: "block text-blue-600 hover:underline", children: "\u2192 About" })] })] }));
}
//# sourceMappingURL=index.js.map