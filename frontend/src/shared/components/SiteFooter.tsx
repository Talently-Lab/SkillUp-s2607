import { Link } from "react-router";

import { Logo } from "./Logo";
import "./SiteFooter.css";

const columns = [
  {
    title: "Explorar",
    links: [
      { to: "/catalog", label: "Catálogo de cursos" },
      { to: "/catalog", label: "Cursos gratuitos" },
    ],
  },
  {
    title: "Tu cuenta",
    links: [
      { to: "/login", label: "Iniciar sesión" },
      { to: "/register", label: "Crear cuenta" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <div className="site-footer__about">
          <Logo />
          <p className="site-footer__description">
            Todos tus cursos online en un solo campus. Aprende a tu ritmo y
            obtén certificados verificables.
          </p>
        </div>
        {columns.map((column) => (
          <div key={column.title} className="site-footer__column">
            <h2 className="site-footer__title">{column.title}</h2>
            <ul className="site-footer__list">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="site-footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="site-footer__bottom">
        <p className="site-footer__copyright container">
          © 2026 SkillUp Campus. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
}
