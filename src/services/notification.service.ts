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

      wsService.emitToUser(data.userId, 'NOTIFICATION', notification);
      return notification;
    } catch (error) {
      console.error('Notification creation error:', error);
      throw error;
    }
  }

  async getUnreadNotifications(userId: string) {
    try {
      return await prisma.notification.findMany({
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
    } catch (error) {
      console.error('Get unread notifications error:', error);
      throw error;
    }
  }

  async markAsRead(notificationId: string, userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: {
          id: notificationId,
          userId
        },
        data: {
          isRead: true
        }
      });
    } catch (error) {
      console.error('Mark notification as read error:', error);
      throw error;
    }
  }

  async markAllAsRead(userId: string) {
    try {
      return await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false
        },
        data: {
          isRead: true
        }
      });
    } catch (error) {
      console.error('Mark all notifications as read error:', error);
      throw error;
    }
  }

  async getNotificationStats(userId: string) {
    try {
      const [unread, total] = await Promise.all([
        prisma.notification.count({
          where: {
            userId,
            isRead: false
          }
        }),
        prisma.notification.count({
          where: {
            userId
          }
        })
      ]);

      return {
        unread,
        total,
        readPercentage: total ? Math.round(((total - unread) / total) * 100) : 0
      };
    } catch (error) {
      console.error('Get notification stats error:', error);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();