import express, { Router } from 'express';
import { createTeam, getTeams, getTeamById, addTeamMember } from '../controllers/team.controller';
import { teamValidation, teamMemberValidation } from '../middleware/validation';

const router: Router = express.Router();

// Add type assertions to fix route handler type issues
router.post('/', teamValidation, createTeam as express.RequestHandler);
router.get('/', getTeams as express.RequestHandler);
router.get('/:id', getTeamById as express.RequestHandler);
router.post('/:teamId/members', teamMemberValidation, addTeamMember as express.RequestHandler);

export default router;