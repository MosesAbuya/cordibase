import Fastify from 'fastify';
import dotenv from 'dotenv';
import path from 'path';

import coreRoutes from '@cordibase/service-core/dist/routes';
import crmRoutes from '@cordibase/service-crm/dist/routes';
import accountingRoutes from '@cordibase/service-accounting/dist/routes';
import hrmRoutes from '@cordibase/service-hrm/dist/routes';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const fastify = Fastify({ logger: true });

// @ts-ignore
fastify.register(coreRoutes);
// @ts-ignore
fastify.register(crmRoutes);
// @ts-ignore
fastify.register(accountingRoutes);
// @ts-ignore
fastify.register(hrmRoutes);

const start = async () => {
  const port = parseInt(process.env.PORT || '3001');
  process.env.CORE_SERVICE_INTERNAL_URL = 'http://127.0.0.1:' + port;
  try {
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log('Monolith server listening on port ' + port);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
