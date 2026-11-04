import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import taskRoutes from './routes/task.routes.js';
import { errorHandler, notFound } from './middleware/error.js';
import { connectDatabase } from './config/db.js';
import { seedIfEmpty } from './seed.js';

// ── Lazy DB init (used by Vercel serverless entry) ───────────────────────────
let _dbReady = false;
async function ensureDb() {
  if (!_dbReady) {
    await connectDatabase();
    if (process.env.SEED_DEMO !== 'false') await seedIfEmpty();
    _dbReady = true;
  }
}

export function createApp({ lazyDb = false } = {}) {
  const app = express();

  const allowedOrigins = (process.env.CORS_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin: allowedOrigins.length > 0 ? allowedOrigins : true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    })
  );

  app.use(express.json({ limit: '64kb' }));

  if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
  }

  // When running on Vercel, connect to DB on the first request of each cold start.
  if (lazyDb) {
    app.use((_req, _res, next) => {
      ensureDb().then(() => next()).catch(next);
    });
  }

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', uptime: Math.round(process.uptime()) });
  });

  app.use('/api/tasks', taskRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}

// ── Vercel entry point ───────────────────────────────────────────────────────
export default createApp({ lazyDb: true });
