import express, { Router } from 'express';
import { notificationService } from '../services/notification.service';

const router: Router = express.Router();

router.get('/', async (req: any, res) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const notifications = await notificationService.getUnreadNotifications(userId);
  res.json(notifications);
});

router.post('/:id/read', async (req: any, res) => {
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  await notificationService.markAsRead(id, userId);
  res.json({ success: true });
});

export default router;