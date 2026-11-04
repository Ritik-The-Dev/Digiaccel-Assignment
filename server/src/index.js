import 'dotenv/config';
import { createApp } from './app.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';
import { seedIfEmpty } from './seed.js';

/** Only honour PORT when it is a usable number; otherwise fall back to 5000. */
const parsedPort = Number(process.env.PORT);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;

async function start() {
  
  await connectDatabase();

  // Demo data only fills an empty database, so it never overwrites real tasks.
  if (process.env.SEED_DEMO !== 'false') {
    await seedIfEmpty();
  }

  
  const app = createApp();
  const server = app.listen(PORT, () => {
    console.log(`[api] Taskly API listening on http://localhost:${PORT}/api`);
  });

  const shutdown = async (signal) => {
    console.log(`\n[api] ${signal} received, shutting down…`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error) => {
  console.error('[api] Failed to start:', error);
  process.exit(1);
});
