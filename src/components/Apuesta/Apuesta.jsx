import ObjetoMazo from "../ObjetoMazo/ObjetoMazo";
import "./Apuesta.css";

function Apuesta({ objetos, onElegir, ganadas = 0 }) {
  return (
    <section className="apuesta">
      <p className="apuesta__linea">Antes de la partida</p>
      <h2 className="apuesta__titulo">Elige que apostar</h2>
      <p className="apuesta__texto">
        Cada uno pone un objeto del mazo. El rival apuesta tapado. El ganador
        se lleva los premios.
      </p>
      <p className="apuesta__estatus">
        Llevas {ganadas} {ganadas === 1 ? "partida ganada" : "partidas ganadas"}.
      </p>
      {objetos.length === 0 ? (
        <p className="apuesta__texto">
          No te queda nada para apostar. Tu viaje se reinicia.
        </p>
      ) : (
        <div className="apuesta__grid">
          {objetos.map((objeto) => (
            <ObjetoMazo
              key={objeto.clave}
              objeto={objeto}
              onClick={onElegir}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default Apuesta;
