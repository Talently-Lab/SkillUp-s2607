import "./App.css";
import SearchIcon from "./assets/icons/search.svg";

function App() {
  return (
    <>
      <main className="hero">
        <h1>Aprende a tu propio ritmo</h1>
        <p>
          Desarrollá las habilidades que el mercado busca, sin conocimientos
          previos y en tus tiempos libres.
        </p>
        <div className="search-container">
          <div className="search-input-container">
            <img src={SearchIcon} alt="Search icon" />
            <input
              className="search-input"
              type="text"
              placeholder="¿Qué quieres aprender hoy?"
            />
          </div>
          <button className="search-btn">Buscar</button>
        </div>
        <div className="explore-categories">
          <span>O explora por categorías:</span>
          <button className="catalog-btn">Ver catálogo</button>
        </div>

        <div>
          <span>
            ⚡️ Registro en 1 minuto. Podés ingresar con tu cuenta de Google.
          </span>
        </div>
      </main>
    </>
  );
}

export default App;
