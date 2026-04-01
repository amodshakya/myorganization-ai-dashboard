import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';

export const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(200).default(50),
});

export const filterSchema = Joi.object({
  state: Joi.string().optional(),
  source: Joi.string()
    .valid('solar', 'wind', 'hydro', 'biomass', 'geothermal')
    .optional(),
  year: Joi.number().integer().min(2000).max(2100).optional(),
}).concat(paginationSchema);

export const dateRangeSchema = Joi.object({
  startDate: Joi.date().iso().optional(),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).optional(),
  period: Joi.string().valid('24h', '7d', '30d').default('24h'),
}).concat(paginationSchema);

/**
 * Middleware factory that validates req.query against a Joi schema.
 */
export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const message = error.details.map((d) => d.message).join('; ');
      return next(new AppError(`Validation error: ${message}`, 400));
    }

    req.query = value as Record<string, string>;
    next();
  };
}
