"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const morgan_1 = __importDefault(require("morgan"));
const logger_1 = __importDefault(require("./logger"));
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const models_1 = require("./models");
const schedulerService_1 = require("./services/scheduler/schedulerService");
const ceaService_1 = require("./services/dataFetchers/ceaService");
const errorHandler_1 = require("./api/middleware/errorHandler");
const rateLimiter_1 = require("./api/middleware/rateLimiter");
const dashboard_1 = __importDefault(require("./api/routes/dashboard"));
const generation_1 = __importDefault(require("./api/routes/generation"));
const capacity_1 = __importDefault(require("./api/routes/capacity"));
const environment_1 = __importDefault(require("./api/routes/environment"));
const export_1 = __importDefault(require("./api/routes/export"));
const dataSources_1 = __importDefault(require("./api/routes/dataSources"));
const app = (0, express_1.default)();
const PORT = parseInt(process.env.PORT ?? '3001', 10);
// ─── Middleware ──────────────────────────────────────────────────────────────
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use((0, compression_1.default)());
app.use(express_1.default.json({ limit: '10mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, morgan_1.default)('combined', { stream: { write: (msg) => logger_1.default.http(msg.trim()) } }));
app.use(rateLimiter_1.rateLimiter);
// ─── Health check ────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'renewable-energy-dashboard-backend',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});
// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api/dashboard', dashboard_1.default);
app.use('/api/generation', generation_1.default);
app.use('/api/capacity', capacity_1.default);
app.use('/api/environment', environment_1.default);
app.use('/api/export', export_1.default);
app.use('/api/data-sources', dataSources_1.default);
// ─── SSE – Real-time updates ─────────────────────────────────────────────────
app.get('/api/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    const sendEvent = () => {
        try {
            const stats = (0, ceaService_1.fetchGridStats)();
            const payload = JSON.stringify({
                type: 'grid_stats',
                data: stats,
                timestamp: new Date().toISOString(),
            });
            res.write(`data: ${payload}\n\n`);
        }
        catch (err) {
            logger_1.default.warn('SSE sendEvent error:', err);
        }
    };
    sendEvent();
    const interval = setInterval(sendEvent, 30000);
    req.on('close', () => {
        clearInterval(interval);
        res.end();
    });
});
// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        code: 404,
        timestamp: new Date().toISOString(),
    });
});
// ─── Error handler ───────────────────────────────────────────────────────────
app.use(errorHandler_1.errorHandler);
// ─── Boot ────────────────────────────────────────────────────────────────────
async function bootstrap() {
    try {
        await (0, database_1.connectDatabase)();
        await (0, models_1.syncModels)();
        await (0, redis_1.connectRedis)();
        await (0, schedulerService_1.runInitialFetch)();
        (0, schedulerService_1.initializeSchedulers)();
        const server = app.listen(PORT, () => {
            logger_1.default.info(`Server running on port ${PORT} (${process.env.NODE_ENV ?? 'development'})`);
        });
        // ─── Graceful shutdown ──────────────────────────────────────────────────
        const shutdown = async (signal) => {
            logger_1.default.info(`Received ${signal}. Shutting down gracefully...`);
            (0, schedulerService_1.stopAllSchedulers)();
            server.close(() => {
                logger_1.default.info('HTTP server closed.');
                process.exit(0);
            });
            setTimeout(() => process.exit(1), 10000);
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
        process.on('uncaughtException', (err) => {
            logger_1.default.error('Uncaught exception:', err);
            process.exit(1);
        });
        process.on('unhandledRejection', (reason) => {
            logger_1.default.error('Unhandled rejection:', reason);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
}
bootstrap();
exports.default = app;
//# sourceMappingURL=server.js.map