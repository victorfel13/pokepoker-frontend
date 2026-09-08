import { forwardRef } from "react";
import pokebola from "../../images/pokebola.svg";
import logoP from "../../images/logo-p.svg";
import pica from "../../images/pica.svg";
import "./Baraja.css";

function CartaMini() {
  return (
    <div className="baraja__carta">
      <div className="baraja__esquina">
        <img className="baraja__p" src={logoP} alt="" />
        <img className="baraja__pica" src={pica} alt="" />
      </div>
      <img className="baraja__pokebola" src={pokebola} alt="" />
    </div>
  );
}

const Baraja = forwardRef(function Baraja({ onClick, activa, disabled, barajeando, foco }, ref) {
  const clase = [
    "baraja",
    activa ? "baraja_activa" : "",
    barajeando ? "baraja_barajeando" : "",
    !barajeando && foco ? "baraja_foco" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      ref={ref}
      className={clase}
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label="Baraja"
    >
      <CartaMini />
      <CartaMini />
      <CartaMini />
      <CartaMini />
    </button>
  );
});

export default Baraja;
