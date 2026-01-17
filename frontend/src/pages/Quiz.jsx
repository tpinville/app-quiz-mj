import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuestionCard from '../components/QuestionCard';

export default function Quiz() {
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/quiz/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load questions');
      }
      setQuestions(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (questionId, optionId) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      const unanswered = questions.length - Object.keys(answers).length;
      setError(`Please answer all questions. ${unanswered} question(s) remaining.`);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const answersArray = Object.entries(answers).map(([question_id, option_id]) => ({
        question_id: parseInt(question_id),
        option_id
      }));

      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers: answersArray })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit quiz');
      }

      navigate('/results', { state: { results: data } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading questions...</div>;
  }

  if (error && questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="error-message">{error}</div>
        <p>No questions available. Please ask an admin to add some questions.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const currentAnswered = answers[currentQuestion?.id] !== undefined;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>Quiz</h1>
        <p className="progress">
          Question {currentIndex + 1} of {questions.length}
        </p>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
        />
      </div>
      <p className="progress-text">
        {Object.keys(answers).length} of {questions.length} answered
      </p>

      {error && <div className="error-message">{error}</div>}

      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          questionNumber={currentIndex + 1}
          selectedOption={answers[currentQuestion.id]}
          onSelect={handleSelect}
        />
      )}

      <div className="quiz-navigation">
        <button
          onClick={handlePrevious}
          className="btn btn-secondary"
          disabled={isFirstQuestion}
        >
          Previous
        </button>

        <div className="question-dots">
          {questions.map((q, index) => (
            <button
              key={q.id}
              className={`dot ${index === currentIndex ? 'active' : ''} ${answers[q.id] !== undefined ? 'answered' : ''}`}
              onClick={() => setCurrentIndex(index)}
              title={`Question ${index + 1}`}
            />
          ))}
        </div>

        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
            disabled={submitting || !allAnswered}
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary"
          >
            Next
          </button>
        )}
      </div>
    </div>
  );
}
