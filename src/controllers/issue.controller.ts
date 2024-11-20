import { Request, Response } from 'express';
import { PrismaClient, Priority, Status } from '@prisma/client';
import { validationResult } from 'express-validator';
import { wsService } from '../index';

const prisma = new PrismaClient();

export const createIssue = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, description, priority, projectId, labels = [] } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    // Create or get labels first
    const labelPromises = labels.map(async (labelName: string) => {
      return prisma.label.upsert({
        where: { name: labelName },
        update: {},
        create: {
          name: labelName,
          color: generateRandomColor()
        }
      });
    });

    const createdLabels = await Promise.all(labelPromises);

    // Create issue with connected labels
    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        priority: priority as Priority,
        project: {
          connect: { id: projectId }
        },
        createdBy: {
          connect: { id: userId }
        },
        labels: {
          connect: createdLabels.map(label => ({ id: label.id }))
        },
        activities: {
          create: {
            action: 'CREATED',
            description: 'Issue created',
            user: {
              connect: { id: userId }
            }
          }
        }
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        labels: true,
        activities: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    wsService.emitToProject(projectId, 'ISSUE_CREATED', issue);
    res.status(201).json(issue);
  } catch (error) {
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Failed to create issue' });
  }
};

function generateRandomColor(): string {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#FFEEAD', '#D4A5A5', '#9B9B9B', '#A8E6CF'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}