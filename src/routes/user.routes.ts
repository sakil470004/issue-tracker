import express from 'express';
import { createUser, getUsers, getUserById } from '../controllers/user.controller';
import { userValidationRules } from '../middleware/validation';

const router = express.Router();

router.post('/', userValidationRules, createUser);
router.get('/', getUsers);
router.get('/:id', getUserById);

export default router;