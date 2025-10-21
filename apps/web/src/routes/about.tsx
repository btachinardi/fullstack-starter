import { createRoute } from '@starter/router';
import { Card, CardContent, CardHeader, CardTitle } from '@starter/ui/card';
import { Route as RootRoute } from './__root';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/about',
  component: AboutComponent,
});

function AboutComponent() {
  return (
    <div className="p-8">
      <Card>
        <CardHeader>
          <CardTitle>About Fullstack Starter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>
              This is a production-ready fullstack starter built with modern tools and best
              practices.
            </p>
            <div>
              <h3 className="font-semibold mb-2">Technology Stack:</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-600">
                <li>Frontend: React 18 + Vite + TanStack Router/Query</li>
                <li>Backend: NestJS + Fastify + Prisma</li>
                <li>Database: PostgreSQL</li>
                <li>Styling: Tailwind CSS</li>
                <li>Monorepo: pnpm + Turborepo</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
