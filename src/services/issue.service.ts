import { PrismaClient } from '@prisma/client';
import { wsService } from '../index';
import { socketEvents } from '../websocket/handlers';

const prisma = new PrismaClient();

export class IssueService {
  async createIssue(data: any, userId: string) {
    const issue = await prisma.issue.create({
      data: {
        ...data,
        creatorId: userId,
        activities: {
          create: {
            action: 'CREATED',
            description: 'Issue created',
            userId
          }
        }
      },
      include: {
        createdBy: true,
        assignedTo: true,
        activities: true
      }
    });

    // Emit real-time update
    wsService.emitToProject(data.projectId, socketEvents.ISSUE_CREATED, issue);
    
    return issue;
  }

  async updateIssue(id: string, data: any, userId: string) {
    const issue = await prisma.issue.update({
      where: { id },
      data: {
        ...data,
        activities: {
          create: {
            action: 'UPDATED',
            description: 'Issue updated',
            userId
          }
        }
      },
      include: {
        activities: true
      }
    });

    wsService.emitToProject(issue.projectId, socketEvents.ISSUE_UPDATED, issue);
    
    return issue;
  }
}