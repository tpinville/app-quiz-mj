import { useLocation, Navigate, Link } from 'react-router-dom';

export default function Results() {
  const location = useLocation();
  const results = location.state?.results;

  if (!results) {
    return <Navigate to="/quiz" replace />;
  }

  const { score, total_questions, percentage, results: questionResults } = results;

  return (
    <div className="results-page">
      <div className="results-summary">
        <h1>Quiz Complete!</h1>
        <div className="score-display">
          <div className="score-circle">
            <span className="score-value">{percentage}%</span>
          </div>
          <p className="score-text">
            You got {score} out of {total_questions} questions correct
          </p>
        </div>
      </div>

      <div className="results-details">
        <h2>Question Review</h2>
        {questionResults.map((result, index) => (
          <div
            key={index}
            className={`result-card ${result.is_correct ? 'correct' : 'incorrect'}`}
          >
            <div className="result-header">
              <span className="question-number">Question {index + 1}</span>
              <span className={`result-badge ${result.is_correct ? 'correct' : 'incorrect'}`}>
                {result.is_correct ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <p className="question-text">{result.question_text}</p>
            <div className="answers">
              <p>
                <strong>Your answer:</strong> {result.selected_option}
              </p>
              {!result.is_correct && (
                <p className="correct-answer">
                  <strong>Correct answer:</strong> {result.correct_option}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="results-actions">
        <Link to="/quiz" className="btn btn-primary">
          Take Another Quiz
        </Link>
        <Link to="/history" className="btn btn-secondary">
          View History
        </Link>
      </div>
    </div>
  );
}
