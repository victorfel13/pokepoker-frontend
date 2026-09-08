import PokemonCard from "../PokemonCard/PokemonCard";
import "./PokemonList.css";

function PokemonList({ cartas, visibles, onMore, onSave, puedeGuardar, onElegir, compact }) {
  const mostradas = cartas.slice(0, visibles);
  const hayMas = visibles < cartas.length;
  const clase = compact ? "lista-cartas lista-cartas_popup" : "lista-cartas";

  return (
    <section className={clase}>
      <div className="lista-cartas__grid">
        {mostradas.map((carta) => (
          <PokemonCard
            key={carta.id}
            carta={carta}
            onSave={onSave}
            puedeGuardar={puedeGuardar}
            onElegir={onElegir}
          />
        ))}
      </div>
      {hayMas && onMore ? (
        <button className="lista-cartas__mas" type="button" onClick={onMore}>
          Mostrar mas
        </button>
      ) : null}
    </section>
  );
}

export default PokemonList;
