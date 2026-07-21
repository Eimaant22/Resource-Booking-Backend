import http from 'http';
import { connectDB } from './config/db';
import { connectRedis } from './config/redis';

import env from './config/env';

const start = async () => {
  await connectDB();
  await connectRedis();

  const { default: app } = await import('./app');
  const httpServer = http.createServer(app);
 

  httpServer.listen(env.PORT, () => {
    console.log(`Server running on port ${env.PORT}`);
  });
};

start();