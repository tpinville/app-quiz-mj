export default function QuestionCard({ question, questionNumber, selectedOption, onSelect }) {
  return (
    <div className="question-card">
      <h3 className="question-number">Question {questionNumber}</h3>
      <p className="question-text">{question.question_text}</p>
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
