import { createRoute } from '@starter/router';
import { ResourcesPage } from '../pages/ResourcesPage';
import { Route as RootRoute } from './__root';
export const Route = createRoute({
    getParentRoute: () => RootRoute,
    path: '/resources',
    component: ResourcesPage,
});
//# sourceMappingURL=resources.js.map