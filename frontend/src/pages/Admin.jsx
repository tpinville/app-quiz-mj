import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const { token } = useAuth();

  // Form state
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState([
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false },
    { option_text: '', is_correct: false }
  ]);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await fetch('/api/admin/questions', {
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

  const resetForm = () => {
    setQuestionText('');
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
      setError('At least 2 options are required');
      return;
    }

    if (!validOptions.some((o) => o.is_correct)) {
      setError('At least one option must be marked as correct');
      return;
    }

    try {
      const url = editingQuestion
        ? `/api/admin/questions/${editingQuestion.id}`
        : '/api/admin/questions';
      const method = editingQuestion ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          question_text: questionText,
          options: validOptions
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save question');
      }

      resetForm();
      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/questions/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to delete question');
      }

      fetchQuestions();
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Question Management</h1>
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn btn-primary">
            Add Question
          </button>
        )}
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="question-form-container">
          <h2>{editingQuestion ? 'Edit Question' : 'Add New Question'}</h2>
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

            <div className="options-form">
              <label>Options (mark the correct one)</label>
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
                    Correct
                  </label>
                </div>
              ))}
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingQuestion ? 'Update' : 'Create'} Question
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="questions-list-admin">
        <h2>All Questions ({questions.length})</h2>
        {questions.length === 0 ? (
          <p className="no-data">No questions yet. Add some to get started!</p>
        ) : (
          questions.map((question) => (
            <div key={question.id} className="question-item">
              <div className="question-content">
                <p className="question-text">{question.question_text}</p>
                <ul className="options-preview">
                  {question.options.map((option) => (
                    <li
                      key={option.id}
                      className={option.is_correct ? 'correct' : ''}
                    >
                      {option.option_text}
                      {option.is_correct === 1 && <span className="correct-badge">Correct</span>}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="question-actions">
                <button
                  onClick={() => handleEdit(question)}
                  className="btn btn-small"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(question.id)}
                  className="btn btn-small btn-danger"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
