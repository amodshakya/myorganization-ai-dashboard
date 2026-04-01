import { Router } from 'express';
import { getDataSourceStatus } from '../controllers/dataSourcesController';

const router = Router();

router.get('/status', getDataSourceStatus);

export default router;
