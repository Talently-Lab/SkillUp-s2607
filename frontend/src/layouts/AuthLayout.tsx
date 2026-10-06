import type { ReactNode } from "react";
import { Link } from "react-router";

import { Logo } from "../shared/components/Logo";
import AuthSideImage from "../assets/images/auth-side.jpg";
import "./AuthLayout.css";

type AuthLayoutProps = {
  children: ReactNode;
  quote: string;
  author: string;
  role: string;
};

export function AuthLayout({ children, quote, author, role }: AuthLayoutProps) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__panel">
        <div className="auth-layout__top">
          <Logo />
          <Link to="/catalog" className="auth-layout__explore">
            Explorar cursos
          </Link>
        </div>
        <main className="auth-layout__main">
          <div className="auth-layout__content">{children}</div>
        </main>
        <p className="auth-layout__copyright">© 2026 SkillUp Campus</p>
      </div>

      <aside className="auth-layout__aside">
        <img className="auth-layout__image" src={AuthSideImage} alt="" />
        <figure className="auth-layout__testimonial">
          <blockquote className="auth-layout__quote">“{quote}”</blockquote>
          <figcaption className="auth-layout__author">
            <strong>{author}</strong> · {role}
          </figcaption>
        </figure>
      </aside>
    </div>
  );
}
