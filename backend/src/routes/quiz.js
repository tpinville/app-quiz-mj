import { Router } from 'express';
import { query, queryOne, run, lastInsertRowId } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

const QUESTIONS_PER_QUIZ = 10;

// Get random set of questions for quiz
router.get('/questions', authenticateToken, (req, res) => {
  try {
    // Get random questions
    const questions = query(
      `SELECT id, question_text, image_url, song_url FROM questions ORDER BY RANDOM() LIMIT ?`,
      [QUESTIONS_PER_QUIZ]
    );

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available' });
    }

    // Get options for each question (without revealing correct answer)
    const questionsWithOptions = questions.map(q => {
      const options = query(
        'SELECT id, option_text FROM options WHERE question_id = ? ORDER BY RANDOM()',
        [q.id]
      );
      return {
        id: q.id,
        question_text: q.question_text,
        image_url: q.image_url,
        song_url: q.song_url,
        options
      };
    });

    res.json(questionsWithOptions);
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Failed to get questions' });
  }
});

// Submit quiz answers and calculate score
router.post('/submit', authenticateToken, (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ error: 'Answers array is required' });
    }

    let score = 0;
    const results = [];

    for (const answer of answers) {
      const { question_id, option_id } = answer;

      // Get the correct option for this question
      const correctOption = queryOne(
        'SELECT id, option_text FROM options WHERE question_id = ? AND is_correct = 1',
        [question_id]
      );

      // Get the selected option
      const selectedOption = queryOne(
        'SELECT id, option_text FROM options WHERE id = ?',
        [option_id]
      );

      // Get the question text
      const question = queryOne(
        'SELECT question_text FROM questions WHERE id = ?',
        [question_id]
      );

      const isCorrect = correctOption && option_id === correctOption.id;
      if (isCorrect) {
        score++;
      }

      results.push({
        question_id,
        question_text: question?.question_text,
        selected_option: selectedOption?.option_text,
        correct_option: correctOption?.option_text,
        is_correct: isCorrect
      });
    }

    const total_questions = answers.length;

    // Save attempt
    run(
      'INSERT INTO attempts (user_id, score, total_questions) VALUES (?, ?, ?)',
      [req.user.id, score, total_questions]
    );
    const attempt_id = lastInsertRowId();

    res.json({
      attempt_id,
      score,
      total_questions,
      percentage: Math.round((score / total_questions) * 100),
      results
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Failed to submit quiz' });
  }
});

export default router;
