import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';

import logger from './logger';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { syncModels } from './models';
import { initializeSchedulers, runInitialFetch, stopAllSchedulers } from './services/scheduler/schedulerService';
import { fetchGridStats } from './services/dataFetchers/ceaService';
import { errorHandler } from './api/middleware/errorHandler';
import { rateLimiter } from './api/middleware/rateLimiter';

import dashboardRoutes from './api/routes/dashboard';
import generationRoutes from './api/routes/generation';
import capacityRoutes from './api/routes/capacity';
import environmentRoutes from './api/routes/environment';
import exportRoutes from './api/routes/export';
import dataSourcesRoutes from './api/routes/dataSources';

const app = express();
const PORT = parseInt(process.env.PORT ?? '3001', 10);

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN ?? '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined', { stream: { write: (msg) => logger.http(msg.trim()) } }));
app.use(rateLimiter);

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'renewable-energy-dashboard-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/generation', generationRoutes);
app.use('/api/capacity', capacityRoutes);
app.use('/api/environment', environmentRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/data-sources', dataSourcesRoutes);

// ─── SSE – Real-time updates ─────────────────────────────────────────────────
app.get('/api/events', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const sendEvent = () => {
    try {
      const stats = fetchGridStats();
      const payload = JSON.stringify({
        type: 'grid_stats',
        data: stats,
        timestamp: new Date().toISOString(),
      });
      res.write(`data: ${payload}\n\n`);
    } catch (err) {
      logger.warn('SSE sendEvent error:', err);
    }
  };

  sendEvent();
  const interval = setInterval(sendEvent, 30_000);

  req.on('close', () => {
    clearInterval(interval);
    res.end();
  });
});

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    code: 404,
    timestamp: new Date().toISOString(),
  });
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Boot ────────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    await syncModels();
    await connectRedis();
    await runInitialFetch();
    initializeSchedulers();

    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
    });

    // ─── Graceful shutdown ──────────────────────────────────────────────────
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      stopAllSchedulers();
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10_000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('uncaughtException', (err) => {
      logger.error('Uncaught exception:', err);
      process.exit(1);
    });
    process.on('unhandledRejection', (reason) => {
      logger.error('Unhandled rejection:', reason);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

bootstrap();

export default app;
