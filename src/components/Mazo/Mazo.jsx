import { useState } from "react";
import { Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import PokemonList from "../PokemonList/PokemonList";
import ObjetoMazo from "../ObjetoMazo/ObjetoMazo";
import { invalidarCuenta, usePerfil } from "../../hooks/useCuenta";
import {
  TIENDA,
  comprarItem,
  contarGanadas,
  contarJoyas,
  getPerfil,
  listarObjetos,
} from "../../utils/cuentaLocal";
import "../Main/Main.css";
import "./Mazo.css";

function Mazo({ user, onLogin }) {
  const queryClient = useQueryClient();
  const { data: perfilQuery } = usePerfil(user?.id);
  const [visibles, setVisibles] = useState(3);
  const [tiendaError, setTiendaError] = useState("");

  if (!user) {
    return (
      <main className="main">
        <section className="mazo">
          <p className="mazo__linea">Bienvenido a tu mazo</p>
          <h2 className="mazo__titulo">Tu coleccion</h2>
          <p className="mazo__texto">
            Inicia sesion para guardar joyas, medallas y lo que ganes en la mesa.
          </p>
          <button className="mazo__boton" type="button" onClick={onLogin}>
            Iniciar sesion
          </button>
        </section>
      </main>
    );
  }

  const vista = perfilQuery || getPerfil(user.id);
  const cartas = vista.cartas || [];
  const joyas = contarJoyas(vista);
  const medallas = vista.medallas || [];
  const reliquias = vista.reliquias || [];
  const objetos = listarObjetos(vista).filter((item) => item.origen !== "pokemon");
  const tienda = TIENDA.filter((item) => item.tipo !== "pokemon");

  const handleComprar = (item) => {
    setTiendaError("");

    try {
      comprarItem(user.id, item);
      invalidarCuenta(queryClient, user.id);
    } catch (err) {
      setTiendaError(err.message);
    }
  };

  return (
    <main className="main">
      <section className="mazo">
        <p className="mazo__linea">Bienvenido a tu mazo</p>
        <h2 className="mazo__titulo">Lo tuyo</h2>
        <p className="mazo__texto">
          Los pokemon se compran en la mesa, cuando te sale uno que te gusta.
          Aqui ves joyas, medallas y lo que ya ganaste. Antes de jugar, apuestas
          un objeto.
        </p>

        <div className="mazo__resumen">
          <article className="mazo__dato">
            <strong>{contarGanadas(vista)}</strong>
            <span>Ganadas</span>
          </article>
          <article className="mazo__dato">
            <strong>{joyas}</strong>
            <span>Joyas</span>
          </article>
          <article className="mazo__dato">
            <strong>{cartas.length}</strong>
            <span>Pokemon</span>
          </article>
          <article className="mazo__dato">
            <strong>{medallas.length}</strong>
            <span>Medallas</span>
          </article>
        </div>
      </section>

      <section className="mazo mazo__bloque">
        <h3 className="mazo__subtitulo">Joyas y medallas</h3>
        {objetos.length === 0 ? (
          <p className="mazo__vacio">Aun no tienes joyas ni medallas.</p>
        ) : (
          <div className="mazo__grid">
            {objetos.map((objeto) => (
              <ObjetoMazo key={objeto.clave} objeto={objeto} />
            ))}
          </div>
        )}
      </section>

      {cartas.length > 0 ? (
        <section className="mazo mazo__bloque">
          <h3 className="mazo__subtitulo">Pokemon</h3>
          <PokemonList
            cartas={cartas}
            visibles={visibles}
            onMore={() => setVisibles((n) => n + 3)}
          />
        </section>
      ) : null}

      <section className="mazo mazo__bloque">
        <h3 className="mazo__subtitulo">Gimnasios</h3>
        <p className="mazo__texto">
          Medallas de Kanto. Se pagan con joyas.{" "}
          <Link to="/juego">Apuesta y juega</Link>
        </p>
        {tiendaError ? <p className="mensaje">{tiendaError}</p> : null}
        <div className="mazo__grid mazo__grid_tienda">
          {tienda.map((item) => {
            const agotado =
              (item.tipo === "medalla" && medallas.some((medalla) => medalla.id === item.id))
              || (item.tipo === "reliquia" && reliquias.some((reliquia) => reliquia.id === item.id));
            const caro = joyas < item.precio;

            return (
              <article className="mazo__oferta" key={item.id}>
                <span className="mazo__disco" style={{ background: item.color }} />
                <strong>{item.nombre}</strong>
                <p>{item.gym}</p>
                <button
                  className="mazo__boton mazo__boton_chico"
                  type="button"
                  disabled={agotado || caro}
                  onClick={() => handleComprar(item)}
                >
                  {agotado ? "Tuya" : `${item.precio} joya${item.precio === 1 ? "" : "s"}`}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}

export default Mazo;
