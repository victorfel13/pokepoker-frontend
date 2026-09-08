import { NavLink } from "react-router-dom";
import "./Navigation.css";

function Navigation() {
  return (
    <nav className="nav">
      <NavLink
        to="/"
        className={({ isActive }) =>
          isActive ? "nav__link nav__link_activa" : "nav__link"
        }
      >
        Inicio
      </NavLink>
    </nav>
  );
}

export default Navigation;
