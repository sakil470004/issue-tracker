import express, { Router } from 'express';
import { searchIssues, saveFilter, getSavedFilters } from '../controllers/search.controller';
import { searchValidation, saveFilterValidation } from '../middleware/validation';

const router: Router = express.Router();

router.get('/issues', searchValidation, searchIssues as express.RequestHandler);
router.post('/filters', saveFilterValidation, saveFilter as express.RequestHandler);
router.get('/filters', getSavedFilters as express.RequestHandler);

export default router;