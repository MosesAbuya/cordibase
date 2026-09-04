import Fastify from 'fastify';
import pluginRoutes from './routes';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const fastify = Fastify({ logger: true });
fastify.register(pluginRoutes);

const start = async () => {
  try {
    const port = parseInt(process.env.PORT || '3003');
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log('Server listening on port ' + port);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
