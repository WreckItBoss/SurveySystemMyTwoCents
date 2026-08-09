import "./FreeTextArea.css";

export default function FreeTextArea({
    id,
    label,
    value,
    onChange,
    placeholder = "",
    required = false,
    maxLength = 10000,
    rows = 6
}){
    function handleChange(event){
        onChange(event.target.value);
    }
    return(
        <div className="free-text-area">
            <label className="free-text-area__label" htmlFor={id}>
                {label}
                {required && (
                    <span className="free-text-area__required">*</span>
                )}
            </label>
            <textarea
                id={id}
                className="free-text-area__input"
                value={value}
                onChange={handleChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                rows={rows}
            />
            <div className="free-text-area__footer">
                <span>{required ? "必須回答" : "任意回答"}</span>
                <span>
                {value.length} / {maxLength}
                </span>
            </div>
        </div>
    )
}