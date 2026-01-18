import { useFetch } from '../hooks/useFetch';

export default function History() {
  const { data: history, loading, error } = useFetch('/scores/history', { initialData: [] });

  if (loading) {
    return <div className="loading">Chargement de l'historique...</div>;
  }

  return (
    <div className="history-page">
      <h1>Votre Historique de Quiz</h1>

      {error && <div className="error-message">{error}</div>}

      {history.length === 0 ? (
        <p className="no-data">Vous n'avez pas encore participé à un quiz.</p>
      ) : (
        <div className="history-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Score</th>
                <th>Pourcentage</th>
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
                  <td>{new Date(attempt.completed_at).toLocaleDateString('fr-FR')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
