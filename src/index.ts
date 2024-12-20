import express from 'express';
import http from 'http';
import { WebSocketService } from './websocket/socket';
import userRoutes from './routes/user.routes';
import teamRoutes from './routes/team.routes';
import projectRoutes from './routes/project.routes';
import issueRoutes from './routes/issue.routes';
import authRoutes from './routes/auth.routes';  // Add this import
import { authMiddleware } from './middleware/auth.middleware';
import notificationRoutes from './routes/notification.routes';

const app = express();
const server = http.createServer(app);
const wsService = new WebSocketService(server);
import searchRoutes from './routes/search.routes';

app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/teams', authMiddleware, teamRoutes);
app.use('/api/projects', authMiddleware, projectRoutes);
app.use('/api/issues', authMiddleware, issueRoutes);
app.use('/api/notifications', authMiddleware, notificationRoutes);
app.use('/api/search', authMiddleware, searchRoutes);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export { wsService };