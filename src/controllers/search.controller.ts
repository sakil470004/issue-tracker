import { Request, Response } from 'express';
import { searchService } from '../services/search.service';
import { validationResult } from 'express-validator';
import { Status, Priority } from '@prisma/client';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

const convertToEnumArray = <T>(value: string | undefined, enumType: { [key: string]: T }): T[] | undefined => {
  if (!value) return undefined;
  return value.split(',').map(item => enumType[item as keyof typeof enumType]);
};

export const searchIssues = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const userId = req.user?.userId;
    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const searchParams = {
      search: req.query.search as string | undefined,
      status: convertToEnumArray(req.query.status as string | undefined, Status),
      priority: convertToEnumArray(req.query.priority as string | undefined, Priority),
      assigneeId: req.query.assigneeId as string | undefined,
      creatorId: req.query.creatorId as string | undefined,
      teamId: req.query.teamId as string | undefined,
      projectId: req.query.projectId as string | undefined,
      labels: req.query.labels ? (req.query.labels as string).split(',') : undefined,
      startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
      endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sortBy: req.query.sortBy as 'createdAt' | 'updatedAt' | 'priority' | 'status' | undefined,
      sortOrder: req.query.sortOrder as 'asc' | 'desc' | undefined
    };

    const results = await searchService.searchIssues(searchParams, userId);
    res.json(results);
  } catch (error) {
    console.error('Search controller error:', error);
    res.status(500).json({ error: 'Failed to search issues' });
  }
};

export const saveFilter = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { name, filter } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const savedFilter = await searchService.saveFilter(userId, name, filter);
    res.status(201).json(savedFilter);
  } catch (error) {
    console.error('Save filter error:', error);
    res.status(500).json({ error: 'Failed to save filter' });
  }
};

export const getSavedFilters = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'Not authenticated' });
      return;
    }

    const filters = await searchService.getSavedFilters(userId);
    res.json(filters);
  } catch (error) {
    console.error('Get saved filters error:', error);
    res.status(500).json({ error: 'Failed to get saved filters' });
  }
};