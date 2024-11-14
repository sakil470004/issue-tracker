import express from 'express';

const router = express.Router();

// Placeholder routes - we'll implement these next
router.get('/', (req, res) => {
  res.json({ message: 'Issues route working' });
});

export default router;