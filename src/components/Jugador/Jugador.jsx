import "./Jugador.css";

function Jugador({ nombre, lado }) {
  const inicial = (nombre || "?").charAt(0).toUpperCase();

  return (
    <div className={`jugador jugador_${lado}`}>
      <span className="jugador__icono" aria-hidden="true">
        {inicial}
      </span>
      <p className="jugador__nombre">{nombre}</p>
    </div>
  );
}

export default Jugador;
