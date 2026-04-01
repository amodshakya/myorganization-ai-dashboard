import { Router } from 'express';
import { exportCSV, exportPDF } from '../controllers/exportController';

const router = Router();

router.get('/report', exportCSV);
router.get('/report/pdf', exportPDF);

export default router;
