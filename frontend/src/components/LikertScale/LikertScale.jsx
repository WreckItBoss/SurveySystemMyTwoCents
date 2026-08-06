import "./LikertScale.css";

export default function LikertScale({
    id,
    question,
    value,
    onChange,
    required = true,
    min = 1,
    max = 5,
    minLabel = "全くそう思わない",
    maxLabel = "非常にそう思う",
}){
    const options = Array.from({length: max-min+1},(_, i) => min+i);
    const handleChange = (event) =>{
        onChange(event.target.value);
    }
  return (
    <fieldset className="likert-scale">
      <legend className="likert-scale__question">
        {question}
        {required && (
          <span className="likert-scale__required" aria-label="必須">
            *
          </span>
        )}
      </legend>

      <div className="likert-scale__labels">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>

      <div className="likert-scale__options">
        {options.map((option) => (
          <label
            key={option}
            className={`likert-scale__option ${
              value === option ? "likert-scale__option--selected" : ""
            }`}
          >
            <input
              type="radio"
              name={id}
              value={option}
              checked={value === option}
              onChange={handleChange}
              required={required}
            />

            <span>{option}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}