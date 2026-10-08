import "./ProgressBar.css";

type ProgressBarProps = {
  value: number;
  label: string;
  size?: "sm" | "md";
};

export function ProgressBar({ value, label, size = "md" }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const fillClassName =
    clamped >= 100
      ? "progress-bar__fill progress-bar__fill--complete"
      : "progress-bar__fill";

  return (
    <div
      className={`progress-bar progress-bar--${size}`}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div className={fillClassName} style={{ width: `${clamped}%` }} />
    </div>
  );
}
