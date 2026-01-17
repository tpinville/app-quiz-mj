import { Router } from 'express';
import { query } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Get top scores leaderboard (public)
router.get('/leaderboard', (req, res) => {
  try {
    const leaderboard = query(`
      SELECT
        u.username,
        a.score,
        a.total_questions,
        ROUND((a.score * 100.0 / a.total_questions), 1) as percentage,
        a.completed_at
      FROM attempts a
      JOIN users u ON a.user_id = u.id
      ORDER BY percentage DESC, a.completed_at ASC
      LIMIT 20
    `);

    res.json(leaderboard);
  } catch (err) {
    console.error('Leaderboard error:', err);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

// Get user's attempt history (protected)
router.get('/history', authenticateToken, (req, res) => {
  try {
    const history = query(`
      SELECT
        id,
        score,
        total_questions,
        ROUND((score * 100.0 / total_questions), 1) as percentage,
        completed_at
      FROM attempts
      WHERE user_id = ?
      ORDER BY completed_at DESC
    `, [req.user.id]);

    res.json(history);
  } catch (err) {
    console.error('History error:', err);
    res.status(500).json({ error: 'Failed to get history' });
  }
});

export default router;
