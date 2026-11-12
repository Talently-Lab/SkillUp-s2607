import { Link } from "react-router";

import "./Logo.css";

type LogoProps = {
  /** White wordmark with teal "Up", for indigo surfaces */
  light?: boolean;
  /** Hide "Campus" where space is tight (mobile topbars) */
  compact?: boolean;
};

export function Logo({ light = false, compact = false }: LogoProps) {
  return (
    <Link
      to="/"
      className={light ? "logo logo--light" : "logo"}
      aria-label="SkillUp Campus, ir al inicio"
    >
      <span className="fox logo__fox" aria-hidden="true" />
      <span>
        Skill<b>Up</b>
        {!compact && " Campus"}
      </span>
    </Link>
  );
}
