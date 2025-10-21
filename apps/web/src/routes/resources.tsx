import { createRoute } from '@starter/platform-router';
import { Route as RootRoute } from './__root';
import { ResourcesPage } from '../pages/ResourcesPage';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  path: '/resources',
  component: ResourcesPage,
});
