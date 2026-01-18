import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFetch, useMutation } from '../hooks/useFetch';
import QuestionCard from '../components/QuestionCard';

export default function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const navigate = useNavigate();

  const { data: questions, loading, error, setError } = useFetch('/quiz/questions', { initialData: [] });
  const { mutate: submitQuiz, loading: submitting } = useMutation('post');

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
      setError(`Veuillez répondre à toutes les questions. ${unanswered} question(s) restante(s).`);
      return;
    }

    setError('');

    try {
      const answersArray = Object.entries(answers).map(([question_id, option_id]) => ({
        question_id: parseInt(question_id),
        option_id
      }));

      const data = await submitQuiz('/quiz/submit', { answers: answersArray });
      navigate('/results', { state: { results: data } });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Chargement des questions...</div>;
  }

  if (error && questions.length === 0) {
    return (
      <div className="quiz-page">
        <div className="error-message">{error}</div>
        <p>Aucune question disponible. Veuillez demander à un administrateur d'en ajouter.</p>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <div className="quiz-page">
      <div className="quiz-header">
        <h1>Quiz</h1>
        <p className="progress">
          Question {currentIndex + 1} sur {questions.length}
        </p>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
        />
      </div>
      <p className="progress-text">
        {Object.keys(answers).length} sur {questions.length} répondue(s)
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
          Précédent
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
            {submitting ? 'Envoi en cours...' : 'Terminer le Quiz'}
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="btn btn-primary"
          >
            Suivant
          </button>
        )}
      </div>
    </div>
  );
}
