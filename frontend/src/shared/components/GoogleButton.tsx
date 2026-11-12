import type { ButtonHTMLAttributes } from "react";

import GoogleIcon from "../../assets/icons/google.svg";
import "./GoogleButton.css";

type GoogleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  /** Not available yet: shown disabled with a "Próximamente" tag (design doc §8.1) */
  soon?: boolean;
};

export function GoogleButton({
  loading = false,
  soon = false,
  ...buttonProps
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      className="google-button"
      aria-disabled={soon || undefined}
      aria-describedby={soon ? "google-soon" : undefined}
      {...buttonProps}
      onClick={soon ? undefined : buttonProps.onClick}
    >
      <img className="google-button__icon" src={GoogleIcon} alt="" />
      {loading ? "Conectando con Google…" : "Continuar con Google"}
      {soon && (
        <span id="google-soon" className="google-button__soon">
          Próximamente
        </span>
      )}
    </button>
  );
}
