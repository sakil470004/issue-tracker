import express from 'express';
import { body } from 'express-validator';
import { login } from '../controllers/auth.controller';

const router = express.Router();

const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').exists().withMessage('Password is required')
];

router.post('/login', loginValidation, login);

export default router;