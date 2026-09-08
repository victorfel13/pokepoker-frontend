import { useContext, useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Mesa, { tiempoReparto } from "../Mesa/Mesa";
import Apuesta from "../Apuesta/Apuesta";
import PopupBuscar from "../PopupBuscar/PopupBuscar";
import Preloader from "../Preloader/Preloader";
import Toast from "../Toast/Toast";
import CurrentUserContext from "../../contexts/CurrentUserContext";
import { getCartaAzar } from "../../utils/pokeApi";
import { armaCarta, nombreBonito, quienGana, talVezEspecial } from "../../utils/juego";
import {
  apuestaRivalAzar,
  comprarItem,
  contarGanadas,
  contarJoyas,
  entregarObjetos,
  getPerfil,
  leerSesion,
  listarObjetos,
  puedeInvocar,
  registrarVictoria,
  reiniciarViaje,
  retirarObjeto,
} from "../../utils/cuentaLocal";
import {
  invalidarCuenta,
  useBajarCooldowns,
  useInvocar,
  usePerfil,
  useUsos,
} from "../../hooks/useCuenta";
import { precargarPartida, tomarDelPool } from "../../hooks/usePokemon";
import "../Main/Main.css";
import "../Mesa/Mesa.css";

const ERROR_TEXTO =
  "Lo sentimos, algo ha salido mal durante la solicitud. Es posible que haya un problema de conexion o que el servidor no funcione. Por favor, intentelo mas tarde.";

function esperar(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function textoTurno(usadas) {
  if (usadas === 0) {
    return "1er turno";
  }

  if (usadas === 1) {
    return "2o turno";
  }

  if (usadas === 2) {
    return "3er turno";
  }

  return "Mano terminada";
}

function lineaHistorial(tuNombre, rivalNombre, ganador) {
  if (ganador === "empate") {
    return {
      tu: tuNombre,
      rival: rivalNombre,
      resultado: "Empate.",
    };
  }

  const ganadorNombre = ganador === "tu" ? tuNombre : rivalNombre;

  return {
    tu: tuNombre,
    rival: rivalNombre,
    resultado: `${ganadorNombre} ganador.`,
  };
}

function Juego() {
  const user = useContext(CurrentUserContext);
  const nombreUsuario = user?.name || "Jugador";
  const queryClient = useQueryClient();
  const { data: perfilQuery } = usePerfil(user?.id);
  const { data: usos } = useUsos(user?.id);
  const invocarMut = useInvocar(user?.id);
  const bajarMut = useBajarCooldowns(user?.id);
  const pozoPagado = useRef(false);
  const toastTimer = useRef(null);
  const poolRef = useRef([]);
  const poolListo = useRef(false);
  const buscandoRef = useRef(false);
  const [tusCartas, setTusCartas] = useState([]);
  const [rivalCartas, setRivalCartas] = useState([]);
  const [tuJugada, setTuJugada] = useState(null);
  const [rivalJugada, setRivalJugada] = useState(null);
  const [puntos, setPuntos] = useState({ tu: 0, rival: 0 });
  const [turno, setTurno] = useState("Listo para repartir");
  const [tituloRonda, setTituloRonda] = useState("");
  const [vsTexto, setVsTexto] = useState("");
  const [ganadorRonda, setGanadorRonda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [bloqueado, setBloqueado] = useState(false);
  const [enMesa, setEnMesa] = useState(false);
  const [fin, setFin] = useState("");
  const [buscarAbierto, setBuscarAbierto] = useState(false);
  const [slotDorada, setSlotDorada] = useState(null);
  const [peekRival, setPeekRival] = useState(false);
  const [pokedexActiva, setPokedexActiva] = useState(null);
  const [sacando, setSacando] = useState(false);
  const [cambiando, setCambiando] = useState(false);
  const [yaRobo, setYaRobo] = useState(false);
  const [historial, setHistorial] = useState([]);
  const [muerteSubita, setMuerteSubita] = useState(false);
  const [miApuesta, setMiApuesta] = useState(null);
  const [rivalApuesta, setRivalApuesta] = useState(null);
  const [invocando, setInvocando] = useState(null);
  const [toast, setToast] = useState(null);
  const [barajeando, setBarajeando] = useState(false);
  const [manoKey, setManoKey] = useState(0);
  const [buscando, setBuscando] = useState(false);

  const mostrarToast = (titulo, sub) => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }

    setToast({ titulo, sub });
  };

  const ocultarToast = (ms = 400) => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, ms);
  };

  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const idsEnJuego = () =>
    [...tusCartas, ...rivalCartas]
      .map((carta) => carta.id)
      .filter((id) => typeof id === "number");

  const buscarContrincante = async (sub = "Un rival se sienta a la mesa.") => {
    if (buscandoRef.current && poolRef.current.length >= 6) {
      return poolRef.current;
    }

    buscandoRef.current = true;
    setBuscando(true);
    mostrarToast("Buscando contrincante", sub);
    const inicio = Date.now();

    try {
      const pool = await precargarPartida(queryClient);
      const falta = 1400 - (Date.now() - inicio);

      if (falta > 0) {
        await esperar(falta);
      }

      poolRef.current = pool;
      poolListo.current = true;
      return pool;
    } finally {
      setBuscando(false);
      setToast(null);
      buscandoRef.current = false;
    }
  };

  const cartaDePool = async () => {
    const extra = tomarDelPool(poolRef, idsEnJuego());

    if (extra) {
      return extra;
    }

    return getCartaAzar(idsEnJuego());
  };

  const refrescarPerfil = () => {
    if (user?.id) {
      invalidarCuenta(queryClient, user.id);
    }
  };

  const repartir = async (poolEntrada) => {
    setCargando(false);
    setEnMesa(true);
    setTusCartas([]);
    setRivalCartas([]);
    setError("");
    setTuJugada(null);
    setRivalJugada(null);
    setPuntos({ tu: 0, rival: 0 });
    setTituloRonda("");
    setVsTexto("");
    setGanadorRonda("");
    setFin("");
    setBloqueado(false);
    setBuscarAbierto(false);
    setSlotDorada(null);
    setPeekRival(false);
    setPokedexActiva(null);
    setCambiando(false);
    setYaRobo(false);
    setHistorial([]);
    setMuerteSubita(false);
    setInvocando(null);
    setBarajeando(true);
    setTurno("Barajeando...");
    mostrarToast("Preparados maestros pokemon", "Barajeando la baraja.");

    try {
      const pool =
        poolEntrada && poolEntrada.length >= 6
          ? poolEntrada
          : await buscarContrincante();
      const mano = pool.slice(0, 6);
      poolRef.current = pool.slice(6);
      poolListo.current = false;
      await esperar(800);
      const cartas = mano.map(armaCarta);
      setToast(null);
      setTusCartas(cartas.slice(0, 3).map((carta, index) => talVezEspecial(carta, index)));
      setRivalCartas(cartas.slice(3, 6));
      setManoKey((prev) => prev + 1);
      setTurno("1er turno");
      await esperar(tiempoReparto(6));
      setBarajeando(false);
    } catch {
      setError(ERROR_TEXTO);
      setEnMesa(false);
      setBarajeando(false);
      setToast(null);
    }
  };

  useEffect(() => {
    if (user?.id) {
      setCargando(false);
      return undefined;
    }

    if (localStorage.getItem("jwt") || leerSesion()) {
      setCargando(true);
      return undefined;
    }

    let vivo = true;

    (async () => {
      setCargando(false);
      const pool = await buscarContrincante();
      if (vivo) {
        await repartir(pool);
      }
    })();

    return () => {
      vivo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const resolverPozo = (resultado) => {
    if (!user || !miApuesta || pozoPagado.current) {
      return;
    }

    pozoPagado.current = true;

    if (resultado === "ganaste") {
      entregarObjetos(user.id, [miApuesta, rivalApuesta]);
    }

    refrescarPerfil();
  };

  const elegirApuesta = async (objeto) => {
    if (!user || buscandoRef.current) {
      return;
    }

    pozoPagado.current = false;
    retirarObjeto(user.id, objeto);
    refrescarPerfil();
    setMiApuesta(objeto);
    setRivalApuesta(apuestaRivalAzar());
    const pool =
      poolListo.current && poolRef.current.length >= 6
        ? poolRef.current
        : await buscarContrincante();
    await repartir(pool);
  };

  const nuevaPartida = async () => {
    if (buscandoRef.current || barajeando) {
      return;
    }

    const termino = Boolean(fin);

    if (!fin && miApuesta && user) {
      entregarObjetos(user.id, [miApuesta]);
    }

    if (user && termino && listarObjetos(getPerfil(user.id)).length > 0) {
      await buscarContrincante("Siguiente partida.");
    }

    setMiApuesta(null);
    setRivalApuesta(null);
    pozoPagado.current = false;
    setEnMesa(false);
    setFin("");
    setError("");
    setInvocando(null);
    setToast(null);
    setBarajeando(false);

    if (user) {
      refrescarPerfil();
      setCargando(false);
      return;
    }

    const pool = await buscarContrincante();
    await repartir(pool);
  };

  const cerrarMano = (resultado) => {
    setFin(resultado);
    setTituloRonda(resultado === "ganaste" ? "Ganaste" : "Perdiste");
    resolverPozo(resultado);

    if (!user) {
      return;
    }

    if (resultado === "ganaste") {
      registrarVictoria(user.id);
      refrescarPerfil();
    }
  };

  const empezarMuerteSubita = async () => {
    setSacando(true);
    setError("");
    setMuerteSubita(true);
    setTurno("Muerte subita");
    setTituloRonda("");
    setVsTexto("");
    setGanadorRonda("");
    setTusCartas([]);
    setRivalCartas([]);
    setBarajeando(true);
    mostrarToast("Muerte subita", "Barajeando una carta contra una.");
    setHistorial((prev) => [
      ...prev,
      { aviso: "Muerte subita. Una carta contra una." },
    ]);

    try {
      const primera = await cartaDePool();
      let segunda = await cartaDePool();

      if (segunda && primera && segunda.id === primera.id) {
        segunda = await cartaDePool();
      }

      await esperar(400);
      const cartas = [primera, segunda].filter(Boolean).map(armaCarta);
      setToast(null);
      setTusCartas([cartas[0]]);
      setRivalCartas([cartas[1] || cartas[0]]);
      setManoKey((prev) => prev + 1);
      await esperar(tiempoReparto(2));
    } catch {
      setError(ERROR_TEXTO);
    } finally {
      setBarajeando(false);
      setSacando(false);
    }
  };

  const sacarDeBaraja = async (cartaId) => {
    setSacando(true);
    setBarajeando(true);
    setError("");
    mostrarToast("Barajeando", "Sacando carta de la baraja.");

    try {
      const data = await cartaDePool();
      const nueva = { ...armaCarta(data), vuelo: Date.now() };
      setToast(null);
      setTusCartas((prev) => prev.map((item) => (item.id === cartaId ? nueva : item)));
      setPeekRival(false);
      setPokedexActiva(null);
      setCambiando(false);
      setYaRobo(true);
      await esperar(tiempoReparto(1));
    } catch {
      setError(ERROR_TEXTO);
    } finally {
      setBarajeando(false);
      setSacando(false);
    }
  };

  const clickBaraja = () => {
    if (sacando || barajeando || buscando || tituloRonda || fin || bloqueado || muerteSubita) {
      return;
    }

    if (peekRival && pokedexActiva) {
      sacarDeBaraja(pokedexActiva);
      return;
    }

    if (cambiando) {
      setCambiando(false);
      return;
    }

    if (yaRobo) {
      return;
    }

    setCambiando(true);
  };

  const jugar = (carta) => {
    if (sacando || carta.usada) {
      return;
    }

    if (invocando) {
      const copia = {
        ...invocando.raw,
        usada: false,
        resultado: null,
      };
      setTusCartas((prev) => prev.map((item) => (item === carta ? copia : item)));
      invocarMut.mutate(invocando.id);
      setHistorial((prev) => [
        ...prev,
        { aviso: `Invocas a ${nombreBonito(invocando.name)}. Vuelve en 3 turnos.` },
      ]);
      setInvocando(null);
      return;
    }

    if (cambiando) {
      sacarDeBaraja(carta.id);
      return;
    }

    if (bloqueado || tituloRonda || peekRival || fin) {
      return;
    }

    if (carta.tipoCarta === "dorada") {
      setSlotDorada(carta.id);
      setBuscarAbierto(true);
      return;
    }

    if (carta.tipoCarta === "pokedex") {
      setPokedexActiva(carta.id);
      setPeekRival(true);
      return;
    }

    const libresRival = rivalCartas.filter((item) => !item.usada);

    if (libresRival.length === 0) {
      return;
    }

    setBloqueado(true);
    setTuJugada(carta);

    const eleccionRival = libresRival[Math.floor(Math.random() * libresRival.length)];
    const ganador = quienGana(carta, eleccionRival);
    const puntosAhora = {
      tu: puntos.tu + (ganador === "tu" ? 1 : 0),
      rival: puntos.rival + (ganador === "rival" ? 1 : 0),
    };
    const tuNombre = nombreBonito(carta.name);
    const rivalNombre = nombreBonito(eleccionRival.name);

    window.setTimeout(() => {
      setRivalJugada(eleccionRival);
      setGanadorRonda(ganador);
      setPuntos(puntosAhora);
      setVsTexto(`${tuNombre} vs ${rivalNombre}`);
      setHistorial((prev) => [...prev, lineaHistorial(tuNombre, rivalNombre, ganador)]);

      if (ganador === "tu") {
        setTituloRonda("Gana");
      } else if (ganador === "rival") {
        setTituloRonda("Pierde");
      } else {
        setTituloRonda("Empate");
      }
    }, 700);
  };

  const elegirDorada = (carta) => {
    setTusCartas((prev) => prev.map((item) => (item.id === slotDorada ? carta : item)));
    setBuscarAbierto(false);
    setSlotDorada(null);
  };

  const pasarAlMazo = (carta) => {
    if (!user || carta.tipoCarta !== "pokemon") {
      return;
    }

    setError("");

    try {
      comprarItem(
        user.id,
        { tipo: "pokemon", precio: 1, nombre: carta.name },
        {
          carta: {
            ...carta,
            usada: false,
            resultado: null,
          },
        },
      );
      refrescarPerfil();
    } catch (err) {
      setError(err.message);
    }
  };

  const clickMazo = (objeto) => {
    if (!user || objeto.origen !== "pokemon" || fin || bloqueado || tituloRonda) {
      return;
    }

    if (!puedeInvocar(usos, objeto.id)) {
      const falta = usos?.invocaciones?.[String(objeto.id)]?.cooldown || 0;
      setError(`Ese pokemon se uso hace poco. Faltan ${falta} turno(s).`);
      return;
    }

    setError("");
    setCambiando(false);
    setInvocando(invocando && invocando.clave === objeto.clave ? null : objeto);
  };

  const ponerCarta = () => {
    if (fin) {
      nuevaPartida();
      return;
    }

    if (!tuJugada || !rivalJugada) {
      return;
    }

    const tuResultado = ganadorRonda === "tu" ? "gano" : ganadorRonda === "rival" ? "perdio" : "empate";
    const rivalResultado = ganadorRonda === "rival" ? "gano" : ganadorRonda === "tu" ? "perdio" : "empate";
    const resultado = ganadorRonda;

    const nuevasTuyas = tusCartas.map((item) =>
      item.id === tuJugada.id ? { ...item, usada: true, resultado: tuResultado } : item,
    );
    const nuevasRival = rivalCartas.map((item) =>
      item.id === rivalJugada.id ? { ...item, usada: true, resultado: rivalResultado } : item,
    );
    const usadas = nuevasTuyas.filter((item) => item.usada).length;

    setTusCartas(nuevasTuyas);
    setRivalCartas(nuevasRival);
    setTuJugada(null);
    setRivalJugada(null);
    setTituloRonda("");
    setVsTexto("");
    setGanadorRonda("");
    setBloqueado(false);

    if (user) {
      bajarMut.mutate();
    }

    if (muerteSubita) {
      if (resultado === "empate") {
        empezarMuerteSubita();
        return;
      }

      cerrarMano(resultado === "tu" ? "ganaste" : "perdiste");
      return;
    }

    setTurno(textoTurno(usadas));

    if (usadas === 3) {
      if (puntos.tu > puntos.rival) {
        cerrarMano("ganaste");
      } else if (puntos.rival > puntos.tu) {
        cerrarMano("perdiste");
      } else {
        empezarMuerteSubita();
      }
    }
  };

  const perfilVista = perfilQuery || (user ? getPerfil(user.id) : null);
  const objetosMazo = listarObjetos(perfilVista);
  const idsMazo = (perfilVista?.cartas || []).map((carta) => carta.id);
  const enApuesta = Boolean(user && !cargando && !enMesa && !miApuesta && !buscando);
  const hayPokedex = tusCartas.some((carta) => carta.tipoCarta === "pokedex" && !carta.usada);
  const ganadas = contarGanadas(perfilVista);

  useEffect(() => {
    if (!user || !enApuesta) {
      return;
    }

    const perfil = getPerfil(user.id);

    if (!perfil.onboardingHecho || perfil.viajeCaido) {
      return;
    }

    if (listarObjetos(perfil).length > 0) {
      return;
    }

    reiniciarViaje(user.id);
    refrescarPerfil();
  }, [user, enApuesta]);

  return (
    <main className="main">
      {cargando && !enMesa && !buscando ? <Preloader texto="Repartiendo cartas..." /> : null}
      {error ? <p className="mensaje">{error}</p> : null}
      <Toast
        titulo={buscando ? "Buscando contrincante" : toast?.titulo}
        sub={buscando ? toast?.sub || "Un rival se sienta a la mesa." : toast?.sub}
        carga={buscando}
      />
      {enApuesta ? (
        <Apuesta objetos={objetosMazo} ganadas={ganadas} onElegir={elegirApuesta} />
      ) : null}
      {!cargando && !enMesa && !user && !enApuesta ? (
        <button className="mesa__boton" type="button" onClick={repartir}>
          Intentar de nuevo
        </button>
      ) : null}
      {!cargando && enMesa ? (
        <Mesa
          tusCartas={tusCartas}
          rivalCartas={rivalCartas}
          tuJugada={tuJugada}
          rivalJugada={rivalJugada}
          turno={turno}
          puntos={puntos}
          tituloRonda={tituloRonda}
          vsTexto={vsTexto}
          fin={fin}
          ganadorRonda={ganadorRonda}
          peekRival={peekRival}
          sacando={sacando}
          cambiando={cambiando}
          puedeRobar={!yaRobo && !muerteSubita}
          bloqueado={bloqueado}
          historial={historial}
          muerteSubita={muerteSubita}
          nombreUsuario={nombreUsuario}
          mazo={objetosMazo}
          idsMazo={idsMazo}
          usos={usos}
          invocando={invocando}
          joyas={contarJoyas(perfilVista)}
          ganadas={user ? ganadas : null}
          miApuesta={miApuesta}
          rivalApuesta={rivalApuesta}
          barajeando={barajeando}
          buscando={buscando}
          hayPokedex={hayPokedex}
          manoKey={manoKey}
          onJugar={jugar}
          onPonerCarta={ponerCarta}
          onBaraja={clickBaraja}
          onNueva={nuevaPartida}
          onMazo={user ? clickMazo : undefined}
          onComprar={user ? pasarAlMazo : undefined}
        />
      ) : null}
      <PopupBuscar
        abierto={buscarAbierto}
        excluirIds={[...tusCartas, ...rivalCartas].map((carta) => carta.id)}
        onElegir={elegirDorada}
        onClose={() => {
          setBuscarAbierto(false);
          setSlotDorada(null);
        }}
      />
    </main>
  );
}

export default Juego;
