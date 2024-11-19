import { PrismaClient, NotificationType } from '@prisma/client';
import { wsService } from '../index';

const prisma = new PrismaClient();

export class NotificationService {
  async createNotification(data: {
    type: NotificationType;
    title: string;
    message: string;
    userId: string;
    issueId?: string;
  }) {
    try {
      const notification = await prisma.notification.create({
        data: {
          type: data.type,
          title: data.title,
          message: data.message,
          user: { connect: { id: data.userId } },
          ...(data.issueId && { issue: { connect: { id: data.issueId } } })
        },
        include: {
          issue: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });

      // Send real-time notification
      wsService.emitToUser(data.userId, 'NOTIFICATION', notification);

      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    return prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId
      },
      data: {
        isRead: true
      }
    });
  }

  async getUnreadNotifications(userId: string) {
    return prisma.notification.findMany({
      where: {
        userId,
        isRead: false
      },
      include: {
        issue: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}

export const notificationService = new NotificationService();