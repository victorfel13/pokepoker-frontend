import { useEffect, useState } from "react";
import SearchForm from "../SearchForm/SearchForm";
import Preloader from "../Preloader/Preloader";
import PokemonList from "../PokemonList/PokemonList";
import { getOpcionesDorada, getPokemon, listarCacheKanto } from "../../utils/pokeApi";
import { armaCarta } from "../../utils/juego";
import { cartasMazoActual } from "../../utils/cuentaLocal";
import "../PopupWithForm/PopupWithForm.css";
import "./PopupBuscar.css";

const ERROR_TEXTO =
  "Lo sentimos, algo ha salido mal durante la solicitud. Es posible que haya un problema de conexion o que el servidor no funcione. Por favor, intentelo mas tarde.";

const idsDeMesa = (excluirIds) =>
  (excluirIds || []).filter((id) => typeof id === "number");

const juntasSinRepetir = (...listas) => {
  const vistas = new Set();
  const resultado = [];

  listas.flat().forEach((carta) => {
    if (!carta || vistas.has(carta.id)) {
      return;
    }

    vistas.add(carta.id);
    resultado.push(carta);
  });

  return resultado;
};

const leerMazo = () => cartasMazoActual();

const POR_PAGINA = 12;

function PopupBuscar({ abierto, excluirIds, onElegir, onClose }) {
  const [opciones, setOpciones] = useState([]);
  const [pagina, setPagina] = useState(0);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [vacio, setVacio] = useState(false);

  useEffect(() => {
    if (!abierto) {
      setOpciones([]);
      setPagina(0);
      setError("");
      setVacio(false);
      setCargando(false);
      return;
    }

    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setError("");
      setVacio(false);
      setPagina(0);

      try {
        const delMazo = leerMazo();
        const idsMesa = idsDeMesa(excluirIds);
        const delCache = listarCacheKanto()
          .filter((item) => !idsMesa.includes(item.id))
          .sort(() => Math.random() - 0.5)
          .map(armaCarta);
        const data =
          delCache.length >= 36
            ? delCache.slice(0, 36)
            : (await getOpcionesDorada(36, idsMesa)).map(armaCarta);

        if (!cancelado) {
          setOpciones(juntasSinRepetir(delMazo, data, delCache));
        }
      } catch {
        if (!cancelado) {
          const delMazo = leerMazo();
          setOpciones(delMazo);
          setError(ERROR_TEXTO);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    cargar();

    return () => {
      cancelado = true;
    };
  }, [abierto]);

  const buscar = async (nombre) => {
    setCargando(true);
    setError("");
    setVacio(false);

    try {
      const data = await getPokemon(nombre);
      const carta = armaCarta(data);
      setOpciones((prev) => juntasSinRepetir([carta], prev));
      setPagina(0);
    } catch {
      setVacio(true);
    } finally {
      setCargando(false);
    }
  };

  const paginaMax = Math.max(0, Math.ceil(opciones.length / POR_PAGINA) - 1);
  const mostradas = opciones.slice(pagina * POR_PAGINA, pagina * POR_PAGINA + POR_PAGINA);

  if (!abierto) {
    return null;
  }

  return (
    <div className="popup" onClick={(event) => event.target === event.currentTarget && onClose()} role="presentation">
      <div className="popup__caja popup__caja_buscar">
        <button className="popup__cerrar" type="button" onClick={onClose}>
          ×
        </button>
        <h2 className="popup__titulo">Elige un pokemon</h2>
        <p className="popup__ayuda">
          Ves doce. Siguiente trae otras. Anterior vuelve. Eliges uno para esta mano.
        </p>
        <SearchForm onSearch={buscar} compact />
        {cargando ? <Preloader texto="Trayendo pokemon..." /> : null}
        {vacio ? <p className="popup__error">No se ha encontrado nada</p> : null}
        {error ? <p className="popup__error">{error}</p> : null}
        {opciones.length > 0 ? (
          <>
            <PokemonList
              cartas={mostradas}
              visibles={POR_PAGINA}
              onElegir={onElegir}
              compact
            />
            {paginaMax > 0 ? (
              <div className="popup__paginas">
                <button
                  className="popup__pagina"
                  type="button"
                  disabled={pagina === 0}
                  onClick={() => setPagina((n) => n - 1)}
                >
                  Anterior
                </button>
                <button
                  className="popup__pagina"
                  type="button"
                  disabled={pagina >= paginaMax}
                  onClick={() => setPagina((n) => n + 1)}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </div>
  );
}

export default PopupBuscar;
