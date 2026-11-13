import { Link } from "react-router";

import { Logo } from "./Logo";
import "./SiteFooter.css";

const columns = [
  {
    title: "Explorar",
    links: [
      { to: "/catalog", label: "Catálogo de cursos" },
      { to: "/catalog", label: "Cursos gratuitos" },
      { to: "/#como-funciona", label: "Cómo funciona" },
    ],
  },
  {
    title: "Tu cuenta",
    links: [
      { to: "/login", label: "Iniciar sesión" },
      { to: "/register", label: "Crear cuenta" },
      { to: "/student", label: "Mis cursos" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner container">
        <div className="site-footer__about">
          <Logo light />
          <p className="site-footer__description">
            Todos tus cursos online en un solo campus. Aprendé a tu ritmo y
            seguí tu progreso.
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
      <div className="site-footer__bottom container">
        <span>
          © 2026 SkillUp Campus ·{" "}
          <Link to="/terms" className="site-footer__link">
            Términos y condiciones
          </Link>{" "}
          ·{" "}
          <Link to="/privacy" className="site-footer__link">
            Política de privacidad
          </Link>
        </span>
        <span>¿Sos docente? Entrás con el mismo acceso.</span>
      </div>
      {/* Third-party credits, kept apart from our own links (license requires them visible) */}
      <p className="site-footer__credits container">
        Imagen de portada:{" "}
        <a
          href="https://www.vecteezy.com/free-png/student"
          target="_blank"
          rel="noopener noreferrer"
        >
          Student PNGs by Vecteezy
        </a>
      </p>
    </footer>
  );
}
