import { Router } from 'express';
import { getCarbonAvoided } from '../controllers/environmentController';

const router = Router();

router.get('/carbon-avoided', getCarbonAvoided);

export default router;
