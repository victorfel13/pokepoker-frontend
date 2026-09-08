import { nombreBonito } from "../../utils/juego";
import "./ObjetoMazo.css";

function ObjetoMazo({ objeto, onClick, tapado, activo }) {
  const clase = [
    "objeto",
    objeto.tipoCarta ? `objeto_${objeto.tipoCarta}` : "",
    activo ? "objeto_activo" : "",
    tapado ? "objeto_tapado" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const cuerpo = tapado ? (
    <strong>Tapado</strong>
  ) : (
    <>
      {objeto.image ? (
        <img className="objeto__imagen" src={objeto.image} alt="" />
      ) : (
        <span className="objeto__disco" style={{ background: objeto.color || "#f4e4a8" }} />
      )}
      <strong className="objeto__nombre">{nombreBonito(objeto.name)}</strong>
      {objeto.texto ? <span className="objeto__texto">{objeto.texto}</span> : null}
    </>
  );

  if (onClick) {
    return (
      <button className={clase} type="button" onClick={() => onClick(objeto)}>
        {cuerpo}
      </button>
    );
  }

  return <article className={clase}>{cuerpo}</article>;
}

export default ObjetoMazo;
