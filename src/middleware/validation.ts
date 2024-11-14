import { body } from 'express-validator';

export const loginValidation = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('password').exists().withMessage('Password is required')
];

export const userValidationRules = [
  body('email').isEmail().withMessage('Must be a valid email'),
  body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

export const teamValidation = [
  body('name')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Team name must be at least 3 characters long'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters')
];

export const teamMemberValidation = [
  body('userId')
    .isString()
    .notEmpty()
    .withMessage('User ID is required'),
  body('role')
    .optional()
    .isIn(['LEADER', 'MEMBER'])
    .withMessage('Invalid role')
];