import { createRoute } from '@starter/router';
import { Route as RootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/',
  component: HomeComponent,
});

function HomeComponent() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome to Fullstack Starter</h1>
      <p className="text-gray-600 mb-4">
        A production-ready fullstack monorepo with React, NestJS, and TanStack.
      </p>
      <div className="space-y-2">
        <a href="/resources" className="block text-blue-600 hover:underline">
          → View Resources
        </a>
        <a href="/about" className="block text-blue-600 hover:underline">
          → About
        </a>
      </div>
    </div>
  );
}
