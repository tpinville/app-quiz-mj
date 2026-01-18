import { Router } from 'express';
import { query, queryOne, run, runInsert, getDb } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// List all questions with options
router.get('/questions', (req, res) => {
  try {
    const questions = query('SELECT * FROM questions ORDER BY created_at DESC');

    const questionsWithOptions = questions.map(q => {
      const options = query('SELECT * FROM options WHERE question_id = ?', [q.id]);
      return { ...q, options };
    });

    res.json(questionsWithOptions);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Create question with options
router.post('/questions', (req, res) => {
  try {
    const { question_text, image_url, song_url, options } = req.body;

    if (!question_text) {
      return res.status(400).json({ error: 'Question text is required' });
    }

    if (!options || !Array.isArray(options) || options.length < 2) {
      return res.status(400).json({ error: 'At least 2 options are required' });
    }

    const hasCorrect = options.some(o => o.is_correct);
    if (!hasCorrect) {
      return res.status(400).json({ error: 'At least one option must be marked as correct' });
    }

    // Insert question and get its ID
    const question_id = runInsert('INSERT INTO questions (question_text, image_url, song_url) VALUES (?, ?, ?)', [question_text, image_url || null, song_url || null]);

    // Insert options
    for (const option of options) {
      run(
        'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
        [question_id, option.option_text, option.is_correct ? 1 : 0]
      );
    }

    // Fetch the created question with options
    const question = queryOne('SELECT * FROM questions WHERE id = ?', [question_id]);
    const createdOptions = query('SELECT * FROM options WHERE question_id = ?', [question_id]);

    res.status(201).json({ ...question, options: createdOptions });
  } catch (err) {
    console.error('Create question error:', err);
    res.status(500).json({ error: 'Failed to create question' });
  }
});

// Update question
router.put('/questions/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { question_text, image_url, song_url, options } = req.body;

    const existing = queryOne('SELECT * FROM questions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    if (question_text !== undefined || image_url !== undefined || song_url !== undefined) {
      const newText = question_text !== undefined ? question_text : existing.question_text;
      const newImage = image_url !== undefined ? image_url : existing.image_url;
      const newSong = song_url !== undefined ? song_url : existing.song_url;
      run('UPDATE questions SET question_text = ?, image_url = ?, song_url = ? WHERE id = ?', [newText, newImage, newSong, id]);
    }

    if (options && Array.isArray(options)) {
      const hasCorrect = options.some(o => o.is_correct);
      if (!hasCorrect) {
        return res.status(400).json({ error: 'At least one option must be marked as correct' });
      }

      // Delete existing options and insert new ones
      run('DELETE FROM options WHERE question_id = ?', [id]);

      for (const option of options) {
        run(
          'INSERT INTO options (question_id, option_text, is_correct) VALUES (?, ?, ?)',
          [id, option.option_text, option.is_correct ? 1 : 0]
        );
      }
    }

    // Fetch the updated question with options
    const question = queryOne('SELECT * FROM questions WHERE id = ?', [id]);
    const updatedOptions = query('SELECT * FROM options WHERE question_id = ?', [id]);

    res.json({ ...question, options: updatedOptions });
  } catch (err) {
    console.error('Update question error:', err);
    res.status(500).json({ error: 'Failed to update question' });
  }
});

// Delete question
router.delete('/questions/:id', (req, res) => {
  try {
    const { id } = req.params;

    const existing = queryOne('SELECT * FROM questions WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Question not found' });
    }

    // Delete options first (foreign key)
    run('DELETE FROM options WHERE question_id = ?', [id]);
    run('DELETE FROM questions WHERE id = ?', [id]);

    res.status(204).send();
  } catch (err) {
    console.error('Delete question error:', err);
    res.status(500).json({ error: 'Failed to delete question' });
  }
});

export default router;
