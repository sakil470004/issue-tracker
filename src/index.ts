import express from 'express';
import userRoutes from './routes/user.routes';
import authRoutes from './routes/auth.routes';
import { authMiddleware } from './middleware/auth.middleware';

const app = express();
app.use(express.json());

// Public routes
app.use('/api/auth', authRoutes);

// Protected routes - use middleware
app.use('/api/users', authMiddleware, userRoutes);

const PORT = 3000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});