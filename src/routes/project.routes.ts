import express, { Router } from 'express';
import { createProject, getProjects, getProjectById } from '../controllers/project.controller';
import { projectValidation } from '../middleware/validation';

const router: Router = express.Router();

router.post('/', projectValidation, createProject as express.RequestHandler);
router.get('/', getProjects as express.RequestHandler);
router.get('/:id', getProjectById as express.RequestHandler);

export default router;