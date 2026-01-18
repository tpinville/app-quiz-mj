import { useFetch } from '../hooks/useFetch';

export default function Leaderboard() {
  const { data: leaderboard, loading, error } = useFetch('/scores/leaderboard', {
    auth: false,
    initialData: []
  });

  if (loading) {
    return <div className="loading">Chargement du classement...</div>;
  }

  return (
    <div className="leaderboard-page">
      <h1>Classement</h1>

      {error && <div className="error-message">{error}</div>}

      {leaderboard.length === 0 ? (
        <p className="no-data">Aucun score pour le moment. Soyez le premier à jouer !</p>
      ) : (
        <div className="leaderboard-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Joueur</th>
                <th>Score</th>
                <th>Pourcentage</th>
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
                  <td>{new Date(entry.completed_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
