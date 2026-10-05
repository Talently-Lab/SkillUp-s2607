import { Link } from "react-router";

import { CourseCard } from "../../shared/components/CourseCard";
import { featuredCourses } from "../../shared/mocks/courses";
import ArrowRightIcon from "../../assets/icons/arrow-right.svg";
import SearchIcon from "../../assets/icons/search.svg";
import "./Home.css";

const steps = [
  {
    title: "Explora el catálogo",
    text: "Filtra por categoría, nivel y duración para encontrar el curso que encaja con tu objetivo.",
  },
  {
    title: "Inscríbete en un minuto",
    text: "Crea tu cuenta con tu email o Google y accede al contenido al instante, sin formularios largos.",
  },
  {
    title: "Aprende y certifícate",
    text: "Avanza a tu ritmo desde cualquier dispositivo y obtén un certificado verificable al terminar.",
  },
];

export function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero__inner container">
          <h1 className="hero__title">Aprende a tu propio ritmo</h1>
          <p className="hero__subtitle">
            Desarrollá las habilidades que el mercado busca, sin conocimientos
            previos y en tus tiempos libres.
          </p>
          <div className="hero__search">
            <div className="hero__search-field">
              <img className="hero__search-icon" src={SearchIcon} alt="" />
              <input
                className="hero__search-input"
                type="text"
                placeholder="¿Qué quieres aprender hoy?"
                aria-label="Buscar cursos"
              />
            </div>
            <button type="button" className="hero__search-btn">
              Buscar
            </button>
          </div>
          <div className="hero__explore">
            <span>O explora por categorías:</span>
            <Link to="/catalog" className="hero__catalog-btn">
              Ver catálogo
            </Link>
          </div>
          <p className="hero__note">
            ⚡️ Registro en 1 minuto. Podés ingresar con tu cuenta de Google.
          </p>
        </div>
      </section>

      <section className="featured" aria-labelledby="featured-heading">
        <div className="featured__inner container">
          <div className="featured__header">
            <div>
              <h2 id="featured-heading" className="section-title">
                Cursos destacados
              </h2>
              <p className="featured__subtitle">
                Los más elegidos por estudiantes este mes.
              </p>
            </div>
            <Link to="/catalog" className="featured__link">
              Ver todo el catálogo
              <img className="featured__link-icon" src={ArrowRightIcon} alt="" />
            </Link>
          </div>
          <ul className="featured__grid">
            {featuredCourses.map((course) => (
              <li key={course.id}>
                <CourseCard course={course} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="steps" aria-labelledby="steps-heading">
        <div className="steps__inner container">
          <h2 id="steps-heading" className="section-title steps__title">
            De la búsqueda a tu primera clase, en tres pasos
          </h2>
          <ol className="steps__list">
            {steps.map((step, index) => (
              <li key={step.title} className="steps__item">
                <span className="steps__number">Paso {index + 1}</span>
                <h3 className="steps__item-title">{step.title}</h3>
                <p className="steps__item-text">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="cta">
        <div className="container">
          <div className="cta__box">
            <div>
              <h2 className="cta__title">Tu próximo curso empieza hoy</h2>
              <p className="cta__text">
                Crea tu cuenta gratis y accede a cursos sin costo desde el
                primer día.
              </p>
            </div>
            <Link to="/register" className="cta__btn">
              Crear cuenta gratis
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
