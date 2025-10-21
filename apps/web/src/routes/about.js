import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createRoute } from '@starter/platform-router';
import { Route as RootRoute } from './__root';
import { Card, CardHeader, CardTitle, CardContent } from '@starter/ui/card';
export const Route = createRoute({
    getParentRoute: () => RootRoute,
    path: '/about',
    component: AboutComponent,
});
function AboutComponent() {
    return (_jsx("div", { className: "p-8", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "About Fullstack Starter" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsx("p", { children: "This is a production-ready fullstack starter built with modern tools and best practices." }), _jsxs("div", { children: [_jsx("h3", { className: "font-semibold mb-2", children: "Technology Stack:" }), _jsxs("ul", { className: "list-disc list-inside space-y-1 text-gray-600", children: [_jsx("li", { children: "Frontend: React 18 + Vite + TanStack Router/Query" }), _jsx("li", { children: "Backend: NestJS + Fastify + Prisma" }), _jsx("li", { children: "Database: PostgreSQL" }), _jsx("li", { children: "Styling: Tailwind CSS" }), _jsx("li", { children: "Monorepo: pnpm + Turborepo" })] })] })] }) })] }) }));
}
//# sourceMappingURL=about.js.map