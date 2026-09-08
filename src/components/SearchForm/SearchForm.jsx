import { useState } from "react";
import "./SearchForm.css";

function SearchForm({ onSearch, compact }) {
  const [texto, setTexto] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!texto.trim()) {
      setError("Por favor, introduzca una palabra clave");
      return;
    }

    setError("");
    onSearch(texto.trim().toLowerCase());
  };

  return (
    <form className={compact ? "buscador buscador_compacto" : "buscador"} onSubmit={handleSubmit} noValidate>
      <div className="buscador__fila">
        <input
          className="buscador__input"
          type="text"
          placeholder="Buscar pokemon"
          value={texto}
          onChange={(event) => setTexto(event.target.value)}
        />
        <button className="buscador__boton" type="submit">
          Buscar
        </button>
      </div>
      {error ? <p className="buscador__error">{error}</p> : null}
    </form>
  );
}

export default SearchForm;
