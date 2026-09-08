import { useEffect, useState } from "react";
import PokemonCard from "../PokemonCard/PokemonCard";
import Preloader from "../Preloader/Preloader";
import { getPokemon } from "../../utils/pokeApi";
import { armaCarta } from "../../utils/juego";
import { STARTERS } from "../../utils/cuentaLocal";
import "../PopupWithForm/PopupWithForm.css";
import "./PopupStarter.css";

const ERROR_TEXTO =
  "Lo sentimos, algo ha salido mal durante la solicitud. Es posible que haya un problema de conexion o que el servidor no funcione. Por favor, intentelo mas tarde.";

function PopupStarter({ abierto, onElegir }) {
  const [cartas, setCartas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!abierto) {
      return;
    }

    let vivo = true;
    setCargando(true);
    setError("");

    Promise.all(STARTERS.map((item) => getPokemon(item.id)))
      .then((data) => {
        if (vivo) {
          setCartas(data.map(armaCarta));
        }
      })
      .catch(() => {
        if (vivo) {
          setError(ERROR_TEXTO);
        }
      })
      .finally(() => {
        if (vivo) {
          setCargando(false);
        }
      });

    return () => {
      vivo = false;
    };
  }, [abierto]);

  if (!abierto) {
    return null;
  }

  return (
    <div className="popup" role="presentation">
      <div className="popup__caja popup__caja_starter">
        <h2 className="popup__titulo">Elige tu inicial</h2>
        <p className="popup__pista">
          Charmander, Squirtle o Bulbasaur. Te regalamos una joya para el mazo.
        </p>
        {cargando ? <Preloader texto="Trayendo a los tres..." /> : null}
        {error ? <p className="popup__error">{error}</p> : null}
        {!cargando && !error ? (
          <div className="starter__grid">
            {cartas.map((carta) => (
              <PokemonCard
                key={carta.id}
                carta={carta}
                onElegir={onElegir}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default PopupStarter;
