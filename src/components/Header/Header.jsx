import { Link, useLocation } from "react-router-dom";
import pokebola from "../../images/pokebola.svg";
import "./Header.css";

function Header({ onLogin, user, onLogout, ganadas = 0 }) {
  const { pathname } = useLocation();
  const enInicio = pathname === "/";

  return (
    <header className="header">
      <Link to="/" className="header__marca">
        <img src={pokebola} alt="PokePoker" className="header__logo" />
        <h1 className="header__titulo">PokePoker</h1>
      </Link>
      {user ? (
        <div className="header__acciones">
          <p className="header__estatus">
            {ganadas} {ganadas === 1 ? "ganada" : "ganadas"}
          </p>
          <Link to="/mazo" className="header__link">
            Mazo
          </Link>
          <button className="header__boton" type="button" onClick={onLogout}>
            {user.name} / salir
          </button>
        </div>
      ) : enInicio ? (
        <span className="header__hueco" aria-hidden="true" />
      ) : (
        <button className="header__boton" type="button" onClick={onLogin}>
          Iniciar sesion
        </button>
      )}
    </header>
  );
}

export default Header;
