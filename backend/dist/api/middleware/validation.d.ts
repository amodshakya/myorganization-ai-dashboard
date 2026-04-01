import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
export declare const paginationSchema: Joi.ObjectSchema<any>;
export declare const filterSchema: Joi.ObjectSchema<any>;
export declare const dateRangeSchema: Joi.ObjectSchema<any>;
/**
 * Middleware factory that validates req.query against a Joi schema.
 */
export declare function validateQuery(schema: Joi.ObjectSchema): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=validation.d.ts.map