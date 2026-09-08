import { cloneElement, useEffect, useLayoutEffect, useRef, useState } from "react";
import CartaMesa from "../CartaMesa/CartaMesa";
import Baraja from "../Baraja/Baraja";
import Jugador from "../Jugador/Jugador";
import ObjetoMazo from "../ObjetoMazo/ObjetoMazo";
import "./Mesa.css";

export const DEAL_GAP = 140;
export const DEAL_MS = 520;

export const tiempoReparto = (cartas) =>
  Math.max(0, cartas - 1) * DEAL_GAP + DEAL_MS + 180;

const delayRival = (index) => index * DEAL_GAP * 2;
const delayTu = (index) => DEAL_GAP + index * DEAL_GAP * 2;

function SlotReparto({ barajaRef, delay, children }) {
  const caja = useRef(null);
  const [reparte, setReparte] = useState(false);

  useLayoutEffect(() => {
    const carta = caja.current?.querySelector(".carta");
    const origen = barajaRef.current;

    if (!carta || !origen) {
      setReparte(true);
      return;
    }

    const o = origen.getBoundingClientRect();
    const d = carta.getBoundingClientRect();
    carta.style.setProperty("--deal-x", `${o.left - d.left}px`);
    carta.style.setProperty("--deal-y", `${o.top - d.top}px`);
    carta.style.setProperty("--deal-delay", `${delay}ms`);
    setReparte(true);
  }, [barajaRef, delay]);

  return (
    <div className={reparte ? "mesa__vuelo" : "mesa__vuelo mesa__vuelo_espera"} ref={caja}>
      {cloneElement(children, {
        reparte: reparte && children.props.dorso !== false,
      })}
    </div>
  );
}

function Mesa({
  tusCartas,
  rivalCartas,
  tuJugada,
  rivalJugada,
  turno,
  puntos,
  tituloRonda,
  vsTexto,
  fin,
  ganadorRonda,
  peekRival,
  sacando,
  cambiando,
  puedeRobar,
  bloqueado,
  historial = [],
  muerteSubita,
  nombreUsuario = "Jugador",
  mazo = [],
  idsMazo = [],
  usos = null,
  invocando = null,
  joyas = 0,
  ganadas = null,
  miApuesta = null,
  rivalApuesta = null,
  barajeando = false,
  buscando = false,
  hayPokedex = false,
  manoKey = 0,
  onJugar,
  onPonerCarta,
  onBaraja,
  onNueva,
  onMazo,
  onComprar,
}) {
  const barajaRef = useRef(null);
  const [dorsoTu, setDorsoTu] = useState([]);
  const ocupado = Boolean(tituloRonda || peekRival || fin || bloqueado || barajeando || buscando);
  const puedeJugar = !ocupado && !sacando && !cambiando && !invocando;
  const hayPlaca = Boolean(!barajeando && (peekRival || cambiando || invocando));
  const hayResultado = Boolean(!barajeando && !buscando && (tituloRonda || fin));

  let placaClase = "mesa__placa";

  if (fin === "ganaste" || ganadorRonda === "tu") {
    placaClase += " mesa__placa_ok";
  } else if (fin === "perdiste" || ganadorRonda === "rival") {
    placaClase += " mesa__placa_no";
  }

  let pista = "Elige una carta";

  if (barajeando) {
    pista = "Barajeando la baraja.";
  } else if (peekRival) {
    pista = "Ves las del rival. Toma de la baraja.";
  } else if (cambiando) {
    pista = "Elige que carta cambiar.";
  } else if (invocando) {
    pista = `Invocas a ${invocando.name}. Elige a quien sustituir.`;
  } else if (fin) {
    pista = miApuesta
      ? fin === "ganaste"
        ? "Te llevas los premios."
        : "Perdiste los premios."
      : pista;
  } else if (tituloRonda) {
    pista = vsTexto;
  } else if (muerteSubita) {
    pista = sacando ? "Sacando cartas..." : "Muerte subita. Una carta contra una.";
  }

  const firmasVuelo = tusCartas.map((carta) => carta.vuelo || "").join(",");

  useEffect(() => {
    if (!tusCartas.length) {
      setDorsoTu([]);
      return undefined;
    }

    setDorsoTu(tusCartas.map(() => true));
    const timers = tusCartas.map((_, index) =>
      window.setTimeout(() => {
        setDorsoTu((prev) => prev.map((item, i) => (i === index ? false : item)));
      }, delayTu(index) + DEAL_MS),
    );

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [manoKey, tusCartas.length]);

  useEffect(() => {
    const indice = tusCartas.findIndex((carta) => carta.vuelo);
    if (indice < 0) {
      return undefined;
    }

    setDorsoTu((prev) => prev.map((item, i) => (i === indice ? true : item)));
    const timer = window.setTimeout(() => {
      setDorsoTu((prev) => prev.map((item, i) => (i === indice ? false : item)));
    }, DEAL_MS);

    return () => window.clearTimeout(timer);
  }, [firmasVuelo]);

  return (
    <section className="mesa">
      <aside className="mesa__lado">
        <p className="mesa__etiqueta">Baraja</p>
        <Baraja
          ref={barajaRef}
          onClick={onBaraja}
          activa={peekRival || cambiando || hayPokedex}
          barajeando={barajeando}
          foco={hayPokedex}
          disabled={Boolean(
            barajeando
              || sacando
              || tituloRonda
              || fin
              || muerteSubita
              || (!puedeRobar && !peekRival && !cambiando),
          )}
        />
        <button
          className="mesa__boton mesa__boton_fijo"
          type="button"
          onClick={onNueva}
          disabled={buscando || barajeando}
        >
          Nueva mano
        </button>

        <div className="mesa__fichas">
          <div className="mesa__ficha">
            <span>Tu</span>
            <strong>{puntos.tu}</strong>
          </div>
          <div className="mesa__ficha">
            <span>Rival</span>
            <strong>{puntos.rival}</strong>
          </div>
        </div>

        {miApuesta ? (
          <div className="mesa__pozo">
            <p className="mesa__etiqueta">Premios</p>
            <ObjetoMazo objeto={miApuesta} />
            {rivalApuesta ? (
              <ObjetoMazo objeto={rivalApuesta} tapado={!fin} />
            ) : null}
          </div>
        ) : null}

        {!fin && !tituloRonda ? (
          <p className="mesa__turno">{barajeando ? "Barajeando..." : turno}</p>
        ) : null}

        {hayPlaca ? (
          <div className={placaClase}>
            {pista ? <p className="mesa__placa-sub">{pista}</p> : null}
          </div>
        ) : !hayResultado ? (
          <p className="mesa__pista">{pista}</p>
        ) : null}
      </aside>

      <div className="mesa__batalla">
        <div className="mesa__linea">
          <Jugador lado="rival" nombre="Rival" />
          <div className="mesa__fila mesa__fila_rival">
            {rivalCartas.map((carta, index) => (
              <SlotReparto
                key={`rival-${manoKey}-${carta.id}-${index}`}
                barajaRef={barajaRef}
                delay={delayRival(index)}
              >
                <CartaMesa
                  carta={carta}
                  tapada={!peekRival && !carta.usada && rivalJugada?.id !== carta.id}
                  jugada={rivalJugada?.id === carta.id}
                  usada={carta.usada}
                  vistazo={peekRival && !carta.usada}
                />
              </SlotReparto>
            ))}
          </div>
          <span className="mesa__linea-hueco" aria-hidden="true" />
        </div>
        <div className="mesa__versus" aria-hidden="true" />
        <div className="mesa__linea">
          <span className="mesa__linea-hueco" aria-hidden="true" />
          <div className="mesa__fila mesa__fila_tu">
            {tusCartas.map((carta, index) => (
              <div
                className="mesa__carta-caja"
                key={`tu-${manoKey}-${index}-${carta.vuelo || "fija"}`}
              >
                <SlotReparto
                  barajaRef={barajaRef}
                  delay={carta.vuelo ? 0 : delayTu(index)}
                >
                  <CartaMesa
                    carta={carta}
                    tapada={false}
                    dorso={dorsoTu[index] !== false}
                    voltea={dorsoTu[index] === false}
                    jugada={tuJugada?.id === carta.id}
                    usada={carta.usada}
                    cambiando={(cambiando || Boolean(invocando)) && !carta.usada}
                    foco={carta.tipoCarta === "pokedex" && !carta.usada && dorsoTu[index] === false}
                    onClick={
                      dorsoTu[index] !== false
                        || carta.usada
                        || sacando
                        || peekRival
                        || (ocupado && !cambiando && !invocando)
                        ? undefined
                        : puedeJugar || cambiando || invocando
                          ? () => onJugar(carta)
                          : undefined
                    }
                  />
                </SlotReparto>
                {carta.tipoCarta === "pokemon" && !fin && onComprar && dorsoTu[index] === false ? (
                  <button
                    className="mesa__comprar"
                    type="button"
                    disabled={idsMazo.includes(carta.id) || joyas < 1}
                    onClick={() => onComprar(carta)}
                  >
                    {idsMazo.includes(carta.id)
                      ? "En el mazo"
                      : joyas < 1
                        ? "Sin joyas"
                        : "Al mazo · 1 joya"}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <Jugador lado="tu" nombre={nombreUsuario} />
        </div>
      </div>

      <aside className="mesa__derecha">
        <div className="mesa__log">
          <p className="mesa__log-nombre">{nombreUsuario}</p>
          <p className="mesa__log-tu">
            Tu
            {ganadas === null
              ? ""
              : ` · ${ganadas} ${ganadas === 1 ? "ganada" : "ganadas"}`}
          </p>
          {historial.length === 0 ? (
            <p className="mesa__log-vacio">Los combates aparecen aqui.</p>
          ) : (
            historial.map((linea, index) => (
              <div className="mesa__log-item" key={`log-${index}`}>
                {linea.aviso ? (
                  <p className="mesa__log-aviso">{linea.aviso}</p>
                ) : (
                  <>
                    <p>
                      Tu: {linea.tu} vs {linea.rival}.
                    </p>
                    <p>{linea.resultado}</p>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mesa__mazo">
          <p className="mesa__etiqueta">Tu mazo</p>
          <p className="mesa__mazo-saldo">
            {joyas} {joyas === 1 ? "joya" : "joyas"}
          </p>
          {mazo.length === 0 ? (
            <p className="mesa__log-vacio">Vacio. Pasa un pokemon de la mesa al mazo.</p>
          ) : (
            <div className="mesa__mazo-grid">
              {mazo.map((objeto) => {
                const uso = usos?.invocaciones?.[String(objeto.id)];
                const enCooldown = objeto.origen === "pokemon" && uso && uso.cooldown > 0;

                return (
                  <ObjetoMazo
                    key={objeto.clave}
                    objeto={{
                      ...objeto,
                      texto: enCooldown
                        ? `En ${uso.cooldown} turno(s)`
                        : objeto.origen === "pokemon"
                          ? `${uso?.veces || 0} usos`
                          : objeto.texto,
                    }}
                    activo={invocando && invocando.clave === objeto.clave}
                    onClick={
                      onMazo && objeto.origen === "pokemon" && !enCooldown
                        ? onMazo
                        : undefined
                    }
                  />
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {hayResultado ? (
        <div
          className={`mesa__resultado${fin ? " mesa__resultado_fin" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mesa-resultado-titulo"
        >
          <div
            className={`mesa__resultado-caja${
              fin === "ganaste" || ganadorRonda === "tu"
                ? " mesa__resultado-caja_ok"
                : fin === "perdiste" || ganadorRonda === "rival"
                  ? " mesa__resultado-caja_no"
                  : " mesa__resultado-caja_empate"
            }`}
          >
            <p className="mesa__resultado-titulo" id="mesa-resultado-titulo">
              {fin ? (fin === "ganaste" ? "Ganaste" : "Perdiste") : tituloRonda}
            </p>
            {fin ? (
              <p className="mesa__resultado-sub">
                {miApuesta
                  ? fin === "ganaste"
                    ? "Te llevas los premios."
                    : "Perdiste los premios."
                  : fin === "ganaste"
                    ? "Ganaste la partida."
                    : "Perdiste la partida."}
              </p>
            ) : vsTexto ? (
              <p className="mesa__resultado-sub">{vsTexto}</p>
            ) : null}
            <button
              className="mesa__resultado-boton"
              type="button"
              onClick={onPonerCarta}
              disabled={buscando || barajeando}
            >
              {fin ? "Buscar siguiente contrincante" : "Siguiente"}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export default Mesa;
