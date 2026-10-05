import { Link } from "react-router";

import "./Logo.css";

export function Logo() {
  return (
    <Link to="/" className="logo" aria-label="SkillUp Campus, ir al inicio">
      <strong className="logo__brand">SkillUp</strong> Campus
    </Link>
  );
}
