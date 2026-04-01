"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
exports.errorHandler = errorHandler;
const logger_1 = __importDefault(require("../../logger"));
class AppError extends Error {
    constructor(message, statusCode, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, new.target.prototype);
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
function errorHandler(err, _req, res, _next) {
    const statusCode = err.statusCode ?? 500;
    const isOperational = err.isOperational ?? false;
    if (!isOperational || statusCode >= 500) {
        logger_1.default.error('Unhandled error:', {
            message: err.message,
            stack: err.stack,
            statusCode,
        });
    }
    else {
        logger_1.default.warn('Operational error:', { message: err.message, statusCode });
    }
    res.status(statusCode).json({
        success: false,
        error: isOperational ? err.message : 'Internal server error',
        code: statusCode,
        timestamp: new Date().toISOString(),
    });
}
//# sourceMappingURL=errorHandler.js.map