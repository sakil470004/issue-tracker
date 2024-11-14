import { body } from 'express-validator';

export const userValidationRules = [
  body('email')
    .isEmail()
    .withMessage('Must be a valid email'),
  body('name')
    .isLength({ min: 3 })
    .withMessage('Name must be at least 3 characters long'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
];