import pokebola from "../../images/pokebola.svg";
import { nombreBonito, tipoEs } from "../../utils/juego";
import "./PokemonCard.css";

function PokemonCard({ carta, onSave, puedeGuardar, onElegir }) {
  if (!carta) {
    return <h2>Cargando...</h2>;
  }

  const cuerpo = (
    <>
      <div className="carta__fila">
        <span className="carta__icono-caja">
          <img className="carta__icono" src={pokebola} alt="" />
        </span>
        <p className="carta__tipo">{tipoEs(carta.type)}</p>
        <p className="carta__poder">{carta.poder}</p>
      </div>
      <div className="carta__cuadro">
        <img className="carta__imagen" src={carta.image} alt={carta.name} />
      </div>
      <p className="carta__nombre">{nombreBonito(carta.name)}</p>
      {puedeGuardar ? (
        <button className="carta__boton" type="button" onClick={() => onSave(carta)}>
          Guardar
        </button>
      ) : null}
    </>
  );

  if (onElegir) {
    return (
      <button className="carta carta_dato carta_elegible" type="button" onClick={() => onElegir(carta)}>
        {cuerpo}
      </button>
    );
  }

  return <article className="carta carta_dato">{cuerpo}</article>;
}

export default PokemonCard;
