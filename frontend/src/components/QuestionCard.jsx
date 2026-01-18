export default function QuestionCard({ question, questionNumber, selectedOption, onSelect }) {
  return (
    <div className="question-card">
      <h3 className="question-number">Question {questionNumber}</h3>
      <p className="question-text" style={{ whiteSpace: 'pre-wrap' }}>{question.question_text}</p>
      {question.image_url && (
        <div className="question-image">
          <img src={question.image_url} alt="Question illustration" />
        </div>
      )}
      {question.song_url && (
        <div className="question-audio">
          <audio controls src={question.song_url} />
        </div>
      )}
      <div className="options-list">
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`option-label ${selectedOption === option.id ? 'selected' : ''}`}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => onSelect(question.id, option.id)}
            />
            <span className="option-text">{option.option_text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
