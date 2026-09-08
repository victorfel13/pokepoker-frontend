import pokebola from "../../images/pokebola.svg";
import cartaDorada from "../../images/carta-dorada.svg";
import cartaPokedex from "../../images/carta-pokedex.svg";
import logoP from "../../images/logo-p.svg";
import pica from "../../images/pica.svg";
import { nombreBonito, tipoEs } from "../../utils/juego";
import "./CartaMesa.css";

function Esquina() {
  return (
    <div className="carta__esquina">
      <img className="carta__p" src={logoP} alt="" />
      <img className="carta__pica" src={pica} alt="" />
    </div>
  );
}

function CartaMesa({
  carta,
  tapada,
  jugada,
  usada,
  vistazo,
  cambiando,
  foco,
  dorso,
  reparte,
  voltea,
  onClick,
}) {
  const especial = carta.tipoCarta === "dorada" || carta.tipoCarta === "pokedex";
  const oculta = Boolean(dorso || (tapada && !especial));
  const clase = [
    "carta",
    oculta ? "carta_tapada" : "",
    !oculta && especial ? "carta_especial" : "",
    !oculta && !especial ? "carta_dato" : "",
    jugada ? "carta_jugada" : "",
    usada ? "carta_usada" : "",
    vistazo ? "carta_vistazo" : "",
    cambiando ? "carta_cambiando" : "",
    !oculta && foco ? "carta_foco" : "",
    reparte ? "carta_reparte" : "",
    voltea ? "carta_voltea" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (oculta) {
    return (
      <button className={clase} type="button" disabled>
        <Esquina />
        <img className="carta__pokebola" src={pokebola} alt="" />
      </button>
    );
  }

  if (carta.tipoCarta === "dorada") {
    return (
      <button className={clase} type="button" onClick={onClick} disabled={usada || !onClick}>
        <img className="carta__arte" src={cartaDorada} alt="Carta dorada" />
      </button>
    );
  }

  if (carta.tipoCarta === "pokedex") {
    return (
      <button className={clase} type="button" onClick={onClick} disabled={usada || !onClick}>
        <img className="carta__arte" src={cartaPokedex} alt="Pokedex" />
      </button>
    );
  }

  return (
    <button className={clase} type="button" onClick={onClick} disabled={usada || !onClick}>
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
      {usada && carta.resultado ? (
        <span className="carta__sello">{carta.resultado}</span>
      ) : null}
    </button>
  );
}

export default CartaMesa;
