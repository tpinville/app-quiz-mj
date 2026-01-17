import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { token } = useAuth();

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/scores/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load history');
      }
      setHistory(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading history...</div>;
  }

  return (
    <div className="history-page">
      <h1>Your Quiz History</h1>

      {error && <div className="error-message">{error}</div>}

      {history.length === 0 ? (
        <p className="no-data">You haven't taken any quizzes yet.</p>
      ) : (
        <div className="history-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((attempt, index) => (
                <tr key={attempt.id}>
                  <td>{index + 1}</td>
                  <td>
                    {attempt.score} / {attempt.total_questions}
                  </td>
                  <td>
                    <span className={`percentage ${attempt.percentage >= 70 ? 'good' : attempt.percentage >= 50 ? 'ok' : 'poor'}`}>
                      {attempt.percentage}%
                    </span>
                  </td>
                  <td>{new Date(attempt.completed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
