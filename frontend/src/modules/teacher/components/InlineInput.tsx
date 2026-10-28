import { useState, type InputHTMLAttributes } from "react";
import { toast } from "sonner";

type InlineInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "value" | "defaultValue" | "onChange" | "onBlur" | "onKeyDown"
> & {
  value: string;
  /** Returns why the value can't be saved; the input then goes back to `value` */
  validate?: (value: string) => string | null;
  /** Called on blur or Enter, only when the trimmed value changed */
  onSave: (value: string) => void;
};

/**
 * An input that saves when it loses focus instead of on every key.
 */
export function InlineInput({
  value,
  validate,
  onSave,
  ...inputProps
}: InlineInputProps) {
  const [draft, setDraft] = useState(value);
  const [saved, setSaved] = useState(value);

  // The value can change from outside, for example when the syllabus reloads
  if (value !== saved) {
    setSaved(value);
    setDraft(value);
  }

  const commit = (next: string) => {
    const trimmed = next.trim();
    if (trimmed === value) {
      setDraft(value);
      return;
    }

    const error = validate?.(trimmed);
    if (error) {
      toast.error(error);
      setDraft(value);
      return;
    }

    setDraft(trimmed);
    onSave(trimmed);
  };

  return (
    <input
      {...inputProps}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={(event) => commit(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          // Restored before the blur, so there's nothing left to save
          event.currentTarget.value = value;
          setDraft(value);
          event.currentTarget.blur();
        }
      }}
    />
  );
}
