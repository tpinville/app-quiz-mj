import { useState, useEffect } from 'react';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch('/api/scores/leaderboard');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load leaderboard');
      }
      setLeaderboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading leaderboard...</div>;
  }

  return (
    <div className="leaderboard-page">
      <h1>Leaderboard</h1>

      {error && <div className="error-message">{error}</div>}

      {leaderboard.length === 0 ? (
        <p className="no-data">No scores yet. Be the first to take a quiz!</p>
      ) : (
        <div className="leaderboard-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} className={index < 3 ? `rank-${index + 1}` : ''}>
                  <td>
                    <span className="rank">{index + 1}</span>
                  </td>
                  <td>{entry.username}</td>
                  <td>
                    {entry.score} / {entry.total_questions}
                  </td>
                  <td>
                    <span className="percentage good">{entry.percentage}%</span>
                  </td>
                  <td>{new Date(entry.completed_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
