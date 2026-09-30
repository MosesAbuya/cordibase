import Fastify from 'fastify';

import coreRoutes from '@cordibase/service-core/dist/routes';
import crmRoutes from '@cordibase/service-crm/dist/routes';
import accountingRoutes from '@cordibase/service-accounting/dist/routes';
import hrmRoutes from '@cordibase/service-hrm/dist/routes';
import projectsRoutes from '@cordibase/service-projects/dist/routes';

export const fastifyApp = Fastify({ logger: true, bodyLimit: 10485760 });

// @ts-ignore
fastifyApp.register(coreRoutes);
// @ts-ignore
fastifyApp.register(crmRoutes);
// @ts-ignore
fastifyApp.register(accountingRoutes);
// @ts-ignore
fastifyApp.register(hrmRoutes);
// @ts-ignore
fastifyApp.register(projectsRoutes);
