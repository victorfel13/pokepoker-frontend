import { useEffect, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { invalidarCuenta, useSesion } from "../../hooks/useCuenta";
import {
  DEMO,
  acusarCaida,
  cerrarSesion,
  elegirInicial,
  signin,
  signup,
} from "../../utils/cuentaLocal";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import Main from "../Main/Main";
import Mazo from "../Mazo/Mazo";
import Juego from "../Juego/Juego";
import PopupWithForm from "../PopupWithForm/PopupWithForm";
import PopupStarter from "../PopupStarter/PopupStarter";
import PopupReinicio from "../PopupReinicio/PopupReinicio";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: sesion } = useSesion();
  const user = sesion?.user || null;
  const [popup, setPopup] = useState(false);
  const [starterAbierto, setStarterAbierto] = useState(false);
  const [caidaAbierta, setCaidaAbierta] = useState(false);
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState(DEMO.email);
  const [password, setPassword] = useState(DEMO.password);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const abrirLogin = () => {
    setError("");
    setModo("login");
    setEmail(DEMO.email);
    setPassword(DEMO.password);
    setPopup(true);
  };

  const aplicarSesion = (data) => {
    invalidarCuenta(queryClient, data.user.id);
    setPopup(false);
    setStarterAbierto(!data.perfil.onboardingHecho && !data.perfil.viajeCaido);
    setCaidaAbierta(Boolean(data.perfil.viajeCaido));
  };

  useEffect(() => {
    if (!user || !sesion?.perfil) {
      return;
    }

    if (sesion.perfil.viajeCaido) {
      setCaidaAbierta(true);
      setStarterAbierto(false);
      return;
    }

    if (!sesion.perfil.onboardingHecho) {
      setStarterAbierto(true);
    }
  }, [user, sesion]);

  useEffect(() => {
    const cerrarEsc = (event) => {
      if (event.key === "Escape" && !starterAbierto && !caidaAbierta) {
        setPopup(false);
      }
    };

    document.addEventListener("keydown", cerrarEsc);
    return () => document.removeEventListener("keydown", cerrarEsc);
  }, [starterAbierto, caidaAbierta]);

  const emailOk = email.includes("@");
  const passOk = password.length > 0;
  const nameOk = modo === "login" || name.length >= 2;
  const formOk = emailOk && passOk && nameOk;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (modo === "register") {
        aplicarSesion(await signup({ email, password, name }));
        return;
      }

      aplicarSesion(await signin({ email, password }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = () => {
    cerrarSesion();
    invalidarCuenta(queryClient, user?.id);
    setStarterAbierto(false);
    setCaidaAbierta(false);
  };

  const handleCaida = () => {
    if (!user) {
      return;
    }

    acusarCaida(user.id);
    invalidarCuenta(queryClient, user.id);
    setCaidaAbierta(false);
    setStarterAbierto(true);
    navigate("/mazo");
  };

  const handleInicial = (carta) => {
    if (!user) {
      return;
    }

    elegirInicial(user.id, carta);
    invalidarCuenta(queryClient, user.id);
    setStarterAbierto(false);
    navigate("/mazo");
  };

  return (
    <CurrentUserContext.Provider value={user}>
      <div className="page">
        <Header
          user={user}
          ganadas={sesion?.perfil?.partidasGanadas || 0}
          onLogin={abrirLogin}
          onLogout={handleLogout}
        />
        <div className="page__contenido">
          <Routes>
            <Route path="/" element={<Main onLogin={abrirLogin} />} />
            <Route path="/mazo" element={<Mazo user={user} onLogin={abrirLogin} />} />
            <Route path="/juego" element={<Juego />} />
          </Routes>
        </div>
        <Footer />
        <PopupWithForm
          abierto={popup}
          titulo={modo === "login" ? "Iniciar sesion" : "Registrarse"}
          onClose={() => setPopup(false)}
          onSubmit={handleSubmit}
          boton={modo === "login" ? "Entrar" : "Crear cuenta"}
          disabled={!formOk}
          error={error}
          pista={
            modo === "login"
              ? `Para probar: ${DEMO.email} / ${DEMO.password}`
              : "Te dejamos un bienvenido en tu correo (por ahora lo ves en el mazo)."
          }
          cambioTexto={
            modo === "login" ? "Registrarse" : "Iniciar sesion"
          }
          onCambio={() => {
            setError("");
            setModo(modo === "login" ? "register" : "login");
            if (modo === "login") {
              setEmail("");
              setPassword("");
            } else {
              setEmail(DEMO.email);
              setPassword(DEMO.password);
            }
          }}
        >
          <label className="popup__campo">
            Email
            <input
              className="popup__input"
              type="email"
              name="email"
              autoComplete="off"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </label>
          <label className="popup__campo">
            Contrasena
            <input
              className="popup__input"
              type="password"
              name="password"
              autoComplete="off"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>
          {modo === "register" ? (
            <label className="popup__campo">
              Nombre
              <input
                className="popup__input"
                type="text"
                value={name}
                minLength="2"
                maxLength="30"
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
          ) : null}
        </PopupWithForm>
        <PopupStarter abierto={starterAbierto} onElegir={handleInicial} />
        <PopupReinicio abierto={caidaAbierta} onEmpezar={handleCaida} />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
