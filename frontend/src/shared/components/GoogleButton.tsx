import type { ButtonHTMLAttributes } from "react";

import GoogleIcon from "../../assets/icons/google.svg";
import "./GoogleButton.css";

type GoogleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export function GoogleButton({
  loading = false,
  ...buttonProps
}: GoogleButtonProps) {
  return (
    <button type="button" className="google-button" {...buttonProps}>
      <img className="google-button__icon" src={GoogleIcon} alt="" />
      {loading ? "Conectando con Google…" : "Continuar con Google"}
    </button>
  );
}
