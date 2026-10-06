import type { InputHTMLAttributes, ReactNode } from "react";

import "./FormField.css";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  error?: string;
  hint?: ReactNode;
  labelAction?: ReactNode;
  trailing?: ReactNode;
};

export function FormField({
  id,
  label,
  error,
  hint,
  labelAction,
  trailing,
  required,
  ...inputProps
}: FormFieldProps) {
  const describedBy =
    [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") ||
    undefined;
  const inputClassName = [
    "form-field__input",
    trailing && "form-field__input--with-trailing",
    error && "form-field__input--error",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="form-field">
      <div className="form-field__header">
        <label htmlFor={id} className="form-field__label">
          {label}
          {required && (
            <span className="form-field__required" aria-hidden="true">
              {" "}
              *
            </span>
          )}
        </label>
        {labelAction}
      </div>
      <div className="form-field__control">
        <input
          id={id}
          className={inputClassName}
          required={required}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy}
          {...inputProps}
        />
        {trailing && <div className="form-field__trailing">{trailing}</div>}
      </div>
      {hint && (
        <div id={`${id}-hint`} className="form-field__hint">
          {hint}
        </div>
      )}
      {error && (
        <p id={`${id}-error`} className="form-field__error">
          {error}
        </p>
      )}
    </div>
  );
}
