import express from 'express';
import { login } from '../controllers/auth.controller';
import { loginValidation } from '../middleware/validation';

const router = express.Router();

router.post('/login', loginValidation, login);

export default router;