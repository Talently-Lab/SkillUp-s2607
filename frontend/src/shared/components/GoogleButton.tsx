import GoogleIcon from "../../assets/icons/google.svg";
import "./GoogleButton.css";

export function GoogleButton() {
  return (
    <button type="button" className="google-button">
      <img className="google-button__icon" src={GoogleIcon} alt="" />
      Continuar con Google
    </button>
  );
}
