import { useContext } from "react";
import { Link } from "react-router-dom";
import About from "../About/About";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import pokebola from "../../images/pokebola.svg";
import pica from "../../images/pica.svg";
import logoP from "../../images/logo-p.svg";
import cartaDorada from "../../images/carta-dorada.svg";
import cartaPokedex from "../../images/carta-pokedex.svg";
import "./Main.css";

function Main({ onLogin }) {
  const user = useContext(CurrentUserContext);

  return (
    <main className="main">
      <section className="home">
        <p className="home__linea">Un maestro pokemon tambien necesita suerte</p>
        <h2 className="home__titulo">Tres cartas. Un golpe.</h2>
        <p className="home__bajada">
          La PokeAPI te reparte tres. El rival va tapado. Revelas una, gana el
          tipo o el ataque mas fuerte.
        </p>
        <div className="home__acciones">
          <Link className="home__boton home__boton_lleno" to="/juego">
            Partida rapida
          </Link>
          {user ? (
            <Link className="home__boton" to="/mazo">
              Armar mazo
            </Link>
          ) : (
            <button className="home__boton" type="button" onClick={onLogin}>
              Iniciar sesion
            </button>
          )}
        </div>
        <div className="home__mano" aria-hidden="true">
          <article className="home__carta home__carta_tapada">
            <span className="home__esquina">
              <img className="home__p" src={logoP} alt="" />
              <img className="home__pica" src={pica} alt="" />
            </span>
            <img className="home__bola" src={pokebola} alt="" />
          </article>
          <img className="home__carta home__carta_arte home__carta_dorada" src={cartaDorada} alt="" />
          <img className="home__carta home__carta_arte home__carta_pokedex" src={cartaPokedex} alt="" />
        </div>
      </section>
      <About />
      <section className="home__pasos">
        <article className="home__paso">
          <p className="home__paso-n">01</p>
          <h3 className="home__paso-titulo">Reparte</h3>
          <p className="home__paso-texto">Tres para ti. Tres tapadas para el rival.</p>
        </article>
        <article className="home__paso">
          <p className="home__paso-n">02</p>
          <h3 className="home__paso-titulo">Elige</h3>
          <p className="home__paso-texto">Pones una. Gana el tipo o el golpe.</p>
        </article>
        <article className="home__paso">
          <p className="home__paso-n">03</p>
          <h3 className="home__paso-titulo">Cambia</h3>
          <p className="home__paso-texto">Si sale dorada, ves tres y eliges uno.</p>
        </article>
        <article className="home__paso">
          <p className="home__paso-n">04</p>
          <h3 className="home__paso-titulo">Juega</h3>
          <p className="home__paso-texto">Contra la maquina ahora. Contra otros despues.</p>
        </article>
      </section>
    </main>
  );
}

export default Main;
