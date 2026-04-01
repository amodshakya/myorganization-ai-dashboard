"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateRangeSchema = exports.filterSchema = exports.paginationSchema = void 0;
exports.validateQuery = validateQuery;
const joi_1 = __importDefault(require("joi"));
const errorHandler_1 = require("./errorHandler");
exports.paginationSchema = joi_1.default.object({
    page: joi_1.default.number().integer().min(1).default(1),
    limit: joi_1.default.number().integer().min(1).max(200).default(50),
});
exports.filterSchema = joi_1.default.object({
    state: joi_1.default.string().optional(),
    source: joi_1.default.string()
        .valid('solar', 'wind', 'hydro', 'biomass', 'geothermal')
        .optional(),
    year: joi_1.default.number().integer().min(2000).max(2100).optional(),
}).concat(exports.paginationSchema);
exports.dateRangeSchema = joi_1.default.object({
    startDate: joi_1.default.date().iso().optional(),
    endDate: joi_1.default.date().iso().min(joi_1.default.ref('startDate')).optional(),
    period: joi_1.default.string().valid('24h', '7d', '30d').default('24h'),
}).concat(exports.paginationSchema);
/**
 * Middleware factory that validates req.query against a Joi schema.
 */
function validateQuery(schema) {
    return (req, _res, next) => {
        const { error, value } = schema.validate(req.query, {
            abortEarly: false,
            allowUnknown: false,
            stripUnknown: true,
        });
        if (error) {
            const message = error.details.map((d) => d.message).join('; ');
            return next(new errorHandler_1.AppError(`Validation error: ${message}`, 400));
        }
        req.query = value;
        next();
    };
}
//# sourceMappingURL=validation.js.map