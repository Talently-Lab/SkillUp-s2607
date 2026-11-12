import type { ReactNode } from "react";
import { Link } from "react-router";

import { Logo } from "../shared/components/Logo";
import { Aurora } from "../shared/components/aurora/Aurora";
import "./AuthLayout.css";

type AuthLayoutProps = {
  children: ReactNode;
  /** Handwritten line on the aurora side; the second line is highlighted in teal */
  title: [string, string];
  quote: string;
  author: string;
  role: string;
  initials: string;
  /** Top-right link of the form panel */
  topLink?: { to: string; label: string };
};

/** Split screen: form on the left, aurora with a testimonial on the right */
export function AuthLayout({
  children,
  title,
  quote,
  author,
  role,
  initials,
  topLink = { to: "/catalog", label: "Explorar cursos" },
}: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <div className="auth-layout__top">
          <Logo />
          <Link to={topLink.to} className="auth-layout__explore">
            {topLink.label}
          </Link>
        </div>
        <main className="auth-layout__main">
          <div className="auth-layout__content">{children}</div>
        </main>
        <p className="auth-layout__copyright">© 2026 SkillUp Campus</p>
      </div>

      <aside className="auth-layout__aside aurora-host" aria-label="Lo que dicen nuestros estudiantes">
        <Aurora shade="center" />
        <div>
          <span className="fox auth-layout__fox" aria-hidden="true" />
          <p className="display auth-layout__title">
            {title[0]}
            <br />
            <em>{title[1]}</em>
          </p>
        </div>
        <div>
          <figure className="auth-layout__testimonial">
            <blockquote className="auth-layout__quote">“{quote}”</blockquote>
            <figcaption className="auth-layout__author">
              <span className="auth-layout__avatar" aria-hidden="true">
                {initials}
              </span>
              <span>
                <strong>{author}</strong> · {role}
              </span>
            </figcaption>
          </figure>
          <div className="auth-layout__stats">
            <span>
              <b className="num">18.000</b>estudiantes
            </span>
            <span>
              <b className="num">4,8</b>valoración promedio
            </span>
            <span>
              <b className="num">87 %</b>termina su curso
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
