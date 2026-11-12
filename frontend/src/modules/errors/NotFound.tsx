import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";

import { Aurora } from "@/shared/components/aurora/Aurora";
import { Icon } from "@/shared/components/Icon";
import "./NotFound.css";

/** 404 with the hero's language: catalog, home and a course search */
export function NotFound() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(
      trimmed ? `/catalog?q=${encodeURIComponent(trimmed)}` : "/catalog",
    );
  };

  return (
    <section className="lost aurora-host" aria-labelledby="lost-title">
      <Aurora shade="left" />
      <div className="lost__inner container">
        <div>
          <p className="lost__code" aria-hidden="true">
            404
          </p>
          <h1 id="lost-title" className="display lost__title">
            Esta página no existe
          </h1>
          <p className="lost__text">
            Puede que el link esté mal escrito o que el curso ya no esté
            disponible. Lo que buscabas seguro está en el catálogo.
          </p>
          <div className="lost__actions">
            <Link to="/catalog" className="btn btn-teal">
              Ir al catálogo
            </Link>
            <Link to="/" className="btn btn-outline-light">
              Volver al inicio
            </Link>
          </div>
          <form className="lost__find" role="search" onSubmit={submit}>
            <label htmlFor="lost-q">O buscá un curso</label>
            <div>
              <input
                id="lost-q"
                className="input"
                type="search"
                placeholder="Excel, Python, diseño…"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
              <button
                className="btn btn-teal"
                type="submit"
                aria-label="Buscar"
              >
                <Icon name="search" />
              </button>
            </div>
          </form>
        </div>
        <div className="lost__art" aria-hidden="true">
          <span className="fox lost__fox" />
          <span className="lost__note">uy, me perdí</span>
        </div>
      </div>
    </section>
  );
}
