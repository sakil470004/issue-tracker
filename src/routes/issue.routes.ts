import express, { Router } from 'express';
import { 
  createIssue, 
  getIssues, 
  updateIssueStatus, 
  addComment 
} from '../controllers/issue.controller';
import { issueValidation, commentValidation } from '../middleware/validation';

const router: Router = express.Router();

router.post('/', issueValidation, createIssue as express.RequestHandler);
router.get('/', getIssues as express.RequestHandler);
router.patch('/:id/status', updateIssueStatus as express.RequestHandler);
router.post('/:id/comments', commentValidation, addComment as express.RequestHandler);

export default router;