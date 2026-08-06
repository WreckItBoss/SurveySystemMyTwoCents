import "./QuestionScale.css";

export default function QuestionScale({
  label,
  options,
  value,
  onChange,
  required = false,
}) {
  return (
    <fieldset className="question-scale">
      <legend className="question-scale__question">
        {label}

        {required && (
          <span className="question-scale__required" aria-label="必須">
            *
          </span>
        )}
      </legend>

      <div className="question-scale__options">
        {options.map((option) => (
          <label
            key={option}
            className={`question-scale__option ${
              value === option
                ? "question-scale__option--selected"
                : ""
            }`}
          >
            <input
              type="radio"
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              required={required}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}