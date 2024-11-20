import { body, query, ValidationChain } from 'express-validator';
import { Priority, Status } from '@prisma/client';

// Existing validations
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

export const projectValidation = [
  body('name')
    .isString()
    .isLength({ min: 3 })
    .withMessage('Project name must be at least 3 characters long'),
  body('description')
    .optional()
    .isString()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('teamId')
    .isString()
    .notEmpty()
    .withMessage('Team ID is required')
];

export const issueValidation = [
  body('title')
    .isString()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .isString()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('priority')
    .optional()
    .isIn(Object.values(Priority))
    .withMessage('Invalid priority value'),
  body('projectId')
    .isString()
    .notEmpty()
    .withMessage('Project ID is required'),
  body('assigneeId')
    .optional()
    .isString()
    .withMessage('Invalid assignee ID'),
  body('labels')
    .optional()
    .isArray()
    .withMessage('Labels must be an array')
];

export const commentValidation = [
  body('content')
    .isString()
    .isLength({ min: 1 })
    .withMessage('Comment cannot be empty')
];

export const searchValidation: ValidationChain[] = [
  query('search').optional().isString(),
  query('status').optional().isString(),
  query('priority').optional().isString(),
  query('assigneeId').optional().isUUID(),
  query('creatorId').optional().isUUID(),
  query('teamId').optional().isUUID(),
  query('projectId').optional().isUUID(),
  query('labels').optional().isString(),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'priority', 'status']),
  query('sortOrder').optional().isIn(['asc', 'desc'])
];

export const saveFilterValidation = [
  body('name').isString().notEmpty().withMessage('Filter name is required'),
  body('filter').isObject().withMessage('Filter must be an object')
];