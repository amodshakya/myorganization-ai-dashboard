import { Router } from 'express';
import { getCapacityByState, getCapacityByType } from '../controllers/capacityController';
import { validateQuery, filterSchema } from '../middleware/validation';

const router = Router();

router.get('/by-state', validateQuery(filterSchema), getCapacityByState);
router.get('/by-type', getCapacityByType);

export default router;
