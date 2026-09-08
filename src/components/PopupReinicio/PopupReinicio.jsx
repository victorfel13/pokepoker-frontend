import "../PopupWithForm/PopupWithForm.css";
import "./PopupReinicio.css";

function PopupReinicio({ abierto, onEmpezar }) {
  if (!abierto) {
    return null;
  }

  return (
    <div className="popup" role="alertdialog" aria-modal="true" aria-labelledby="caida-titulo">
      <div className="popup__caja popup__caja_caida">
        <h2 className="popup__titulo" id="caida-titulo">
          Se acabo el viaje
        </h2>
        <p className="popup__pista">
          Perdiste todo lo que tenias para apostar. Tendras que volver a iniciar
          tu viaje pokemon.
        </p>
        <button className="popup__boton" type="button" onClick={onEmpezar}>
          Empezar de cero
        </button>
      </div>
    </div>
  );
}

export default PopupReinicio;
