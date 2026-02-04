import { Router } from '@vaadin/router';

import './pages/page-dashboard.js';
import './pages/page-accounts.js';
import './pages/page-account-details.js';
import './pages/page-settings.js';
import './pages/page-messaging.js';
import './pages/page-ar-center.js';

export function initRouter(outlet: HTMLElement): Router {
    const router = new Router(outlet);

    router.setRoutes([
        { path: '/admin', component: 'admin-page-dashboard' },
        { path: '/admin/accounts', component: 'admin-page-accounts' },
        { path: '/admin/accounts/:id', component: 'admin-page-account-details' },
        { path: '/admin/settings', component: 'admin-page-settings' },
        { path: '/admin/messaging', component: 'admin-page-messaging' },
        { path: '/admin/ar-center', component: 'admin-page-ar-center' },
        { path: '(.*)', redirect: '/admin' },
    ]);

    return router;
}
