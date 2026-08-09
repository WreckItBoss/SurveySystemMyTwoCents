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
          <span className="question-scale__required">*</span>
        )}
      </legend>

      <div className="question-scale__options">
        {options.map((option) => {
          const optionValue =
            typeof option === "object" ? option.value : option;

          const optionLabel =
            typeof option === "object" ? option.label : option;

          return (
            <label key={optionValue} className="question-scale__option">
              <input
                type="radio"
                value={optionValue}
                checked={value === optionValue}
                onChange={() => onChange(optionValue)}
                required={required}
              />

              <span className="question-scale__option-label">
                {optionLabel}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}