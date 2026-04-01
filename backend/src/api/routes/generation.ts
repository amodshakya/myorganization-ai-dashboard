import { Router } from 'express';
import { getCurrentGeneration, getGenerationHistory } from '../controllers/generationController';
import { validateQuery, dateRangeSchema } from '../middleware/validation';

const router = Router();

router.get('/current', getCurrentGeneration);
router.get('/history', validateQuery(dateRangeSchema), getGenerationHistory);

export default router;
