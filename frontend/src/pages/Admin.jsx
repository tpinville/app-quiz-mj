import { useState } from 'react';
import { useFetch, useMutation } from '../hooks/useFetch';

export default function Admin() {
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [songUrl, setSongUrl] = useState('');
  const [options, setOptions] = useState([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false }
  ]);

  const { data: questions, loading, error, setError, refetch } = useFetch('/admin/questions', { initialData: [] });
  const { mutate: createQuestion, loading: creating } = useMutation('post');
  const { mutate: updateQuestion, loading: updating } = useMutation('put');
  const { mutate: deleteQuestion } = useMutation('delete');

  const resetForm = () => {
    setQuestionText('');
    setImageUrl('');
    setSongUrl('');
    setOptions([
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false },
      { option_text: '', is_correct: false }
    ]);
    setEditingQuestion(null);
    setShowForm(false);
  };

  const handleEdit = (question) => {
    setEditingQuestion(question);
    setQuestionText(question.question_text);
    setImageUrl(question.image_url || '');
    setSongUrl(question.song_url || '');
    const formOptions = question.options.map((o) => ({
      option_text: o.option_text,
      is_correct: o.is_correct === 1
    }));
    while (formOptions.length < 4) {
      formOptions.push({ option_text: '', is_correct: false });
    }
    setOptions(formOptions);
    setShowForm(true);
  };

  const handleOptionChange = (index, field, value) => {
    const newOptions = [...options];
    newOptions[index][field] = value;
    setOptions(newOptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const validOptions = options.filter((o) => o.option_text.trim());
    if (validOptions.length < 2) {
      setError('Au moins 2 options sont requises');
      return;
    }

    if (!validOptions.some((o) => o.is_correct)) {
      setError('Au moins une option doit être marquée comme correcte');
      return;
    }

    try {
      const payload = {
        question_text: questionText,
        image_url: imageUrl || null,
        song_url: songUrl || null,
        options: validOptions
      };

      if (editingQuestion) {
        await updateQuestion(`/admin/questions/${editingQuestion.id}`, payload);
      } else {
        await createQuestion('/admin/questions', payload);
      }

      resetForm();
      refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) {
      return;
    }

    try {
      await deleteQuestion(`/admin/questions/${id}`);
      refetch();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  const saving = creating || updating;

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Questions</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Ajouter une Question
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="question-form-container">
          <h2>{editingQuestion ? 'Modifier la Question' : 'Nouvelle Question'}</h2>
          <form onSubmit={handleSubmit} className="question-form">
            <div className="form-group">
              <label htmlFor="questionText">Question</label>
              <textarea
                id="questionText"
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">URL de l'image (optionnel)</label>
              <input
                type="url"
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://exemple.com/image.jpg"
              />
              {imageUrl && (
                <div className="image-preview">
                  <img src={imageUrl} alt="Aperçu" onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="songUrl">URL de la chanson (optionnel)</label>
              <input
                type="url"
                id="songUrl"
                value={songUrl}
                onChange={(e) => setSongUrl(e.target.value)}
                placeholder="https://exemple.com/chanson.mp3"
              />
              {songUrl && (
                <div className="audio-preview">
                  <audio controls src={songUrl} onError={(e) => e.target.style.display = 'none'} />
                </div>
              )}
            </div>

            <div className="options-form">
              <label>Options (cochez la bonne réponse)</label>
              {options.map((option, index) => (
                <div key={index} className="option-input">
                  <input
                    type="text"
                    placeholder={`Option ${index + 1}`}
                    value={option.option_text}
                    onChange={(e) =>
                      handleOptionChange(index, 'option_text', e.target.value)
                    }
                  />
                  <label className="correct-checkbox">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={option.is_correct}
                      onChange={() => {
                        const newOptions = options.map((o, i) => ({
                          ...o,
                          is_correct: i === index
                        }));
                        setOptions(newOptions);
                      }}
                    />
                    Correcte
                  </label>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : (editingQuestion ? 'Modifier' : 'Créer')} {!saving && 'la Question'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="questions-list-admin">
        <h2>Toutes les Questions ({questions.length})</h2>
        {questions.length === 0 ? (
          <p className="no-data">Aucune question. Ajoutez-en pour commencer !</p>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="question-item">
              <div className="question-content">
                <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>{question.question_text}</p>
                {question.image_url && (
                  <div className="question-image-preview">
                    <img src={question.image_url} alt="Question" />
                  </div>
                )}
                {question.song_url && (
                  <div className="question-audio-preview">
                    <audio controls src={question.song_url} />
                  </div>
                )}
                <ul className="options-preview">
                  {question.options.map((option) => (
                    <li
                      key={option.id}
                      className={option.is_correct ? 'correct' : ''}
                    >
                      {option.option_text}
                      {option.is_correct === 1 && <span className="correct-badge">Correcte</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="question-actions">
                <button
                  onClick={() => handleEdit(question)}
                  className="btn btn-small"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="btn btn-small btn-danger"
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
