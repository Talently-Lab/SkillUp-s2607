import "./SegmentedControl.css";

type SegmentedControlProps<T extends string> = {
  name: string;
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  name,
  label,
  value,
  options,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <div className="segmented-control" role="radiogroup" aria-label={label}>
      {options.map((option) => (
        <label key={option.value} className="segmented-control__option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={option.value === value}
            onChange={() => onChange(option.value)}
            className="visually-hidden"
          />
          {option.label}
        </label>
      ))}
    </div>
  );
}
