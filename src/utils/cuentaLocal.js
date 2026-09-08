import * as api from "./MainApi";

const USUARIOS_KEY = "pokepoker-usuarios";
const SESION_KEY = "pokepoker-sesion";
const MAZO_SUELTO_KEY = "pokepoker-mazo";

export const DEMO = {
  id: "usr-ash",
  email: "ash@pokepoker.test",
  password: "AshMazo26",
  name: "Ash",
};

export const STARTERS = [
  { id: 1, slug: "bulbasaur" },
  { id: 4, slug: "charmander" },
  { id: 7, slug: "squirtle" },
];

export const TIENDA = [
  {
    id: "roca",
    tipo: "medalla",
    nombre: "Medalla Roca",
    gym: "Gimnasio Plateada",
    precio: 1,
    color: "#b8a038",
  },
  {
    id: "cascada",
    tipo: "medalla",
    nombre: "Medalla Cascada",
    gym: "Gimnasio Celeste",
    precio: 2,
    color: "#4a90d9",
  },
  {
    id: "trueno",
    tipo: "medalla",
    nombre: "Medalla Trueno",
    gym: "Gimnasio Carmin",
    precio: 2,
    color: "#f4d03f",
  },
  {
    id: "arcoiris",
    tipo: "medalla",
    nombre: "Medalla Arcoiris",
    gym: "Gimnasio Azulona",
    precio: 3,
    color: "#e67e9e",
  },
  {
    id: "alma",
    tipo: "medalla",
    nombre: "Medalla Alma",
    gym: "Gimnasio Fucsia",
    precio: 3,
    color: "#8e44ad",
  },
  {
    id: "pantano",
    tipo: "medalla",
    nombre: "Medalla Pantano",
    gym: "Gimnasio Azafran",
    precio: 3,
    color: "#6c3483",
  },
  {
    id: "volcan",
    tipo: "medalla",
    nombre: "Medalla Volcan",
    gym: "Gimnasio Isla Canela",
    precio: 4,
    color: "#e74c3c",
  },
  {
    id: "tierra",
    tipo: "medalla",
    nombre: "Medalla Tierra",
    gym: "Gimnasio Verde",
    precio: 4,
    color: "#6d4c41",
  },
  {
    id: "doble",
    tipo: "reliquia",
    tipoCarta: "doble",
    nombre: "Doble puntos",
    gym: "Para la mesa, mas adelante",
    precio: 2,
    color: "#c44a3c",
  },
];

const perfilKey = (userId) => `pokepoker-perfil-${userId}`;

const leer = (key, fallback) => {
  try {
    const bruto = localStorage.getItem(key);
    return bruto ? JSON.parse(bruto) : fallback;
  } catch {
    return fallback;
  }
};

const escribir = (key, valor) => {
  localStorage.setItem(key, JSON.stringify(valor));
};

const usuarios = () => leer(USUARIOS_KEY, []);

const publicoDe = (user) => ({
  id: user.id,
  email: user.email,
  name: user.name,
});

const cartaBienvenida = (name) => ({
  id: `mail-bienvenida-${Date.now()}`,
  tipo: "bienvenida",
  de: "PokePoker",
  asunto: "Bienvenido a PokePoker",
  cuerpo: `Hola ${name}. Esta es tu cuenta. Elige Charmander, Squirtle o Bulbasaur y te regalamos una joya para el mazo. Con las joyas vas a apostar en la mesa y a comprar medallas.`,
  fecha: new Date().toISOString(),
  leido: false,
});

const perfilVacio = (userId, name) => ({
  userId,
  onboardingHecho: false,
  starterId: null,
  cartas: [],
  medallas: [],
  reliquias: [],
  correo: [cartaBienvenida(name)],
  twofa: { activo: false },
  partidasGanadas: 0,
  viajeCaido: false,
});

export const contarJoyas = (perfil) =>
  (perfil?.reliquias || []).filter((item) => item.tipoCarta === "joya").length;

export const contarGanadas = (perfil) =>
  Number(perfil?.partidasGanadas) || 0;

export const getPerfil = (userId) => {
  const user = usuarios().find((item) => item.id === userId);
  const base = perfilVacio(userId, user?.name || "Jugador");
  const guardado = leer(perfilKey(userId), null);

  if (!guardado) {
    escribir(perfilKey(userId), base);
    return base;
  }

  return {
    ...base,
    ...guardado,
    partidasGanadas: Number(guardado.partidasGanadas) || 0,
    viajeCaido: Boolean(guardado.viajeCaido),
  };
};

const tokenActual = () => localStorage.getItem("jwt") || "";

const esTokenServidor = (token) => Boolean(token) && !String(token).startsWith("local.");

const hidratarDesdeServidor = (token, data) => {
  const user = {
    id: String(data.id || data._id),
    email: data.email,
    name: data.name,
  };
  const base = perfilVacio(user.id, user.name);
  const perfil = {
    ...base,
    userId: user.id,
    onboardingHecho: Boolean(data.onboardingHecho),
    starterId: data.starterId || null,
    cartas: Array.isArray(data.cartas) ? data.cartas : [],
    medallas: Array.isArray(data.medallas) ? data.medallas : [],
    reliquias: Array.isArray(data.reliquias) ? data.reliquias : [],
    correo: Array.isArray(data.correo) && data.correo.length > 0 ? data.correo : base.correo,
    partidasGanadas: Number(data.partidasGanadas) || 0,
    viajeCaido: Boolean(data.viajeCaido),
    invocaciones: data.invocaciones || {},
  };

  escribir(perfilKey(user.id), perfil);
  escribir(`pokepoker-usos-${user.id}`, { invocaciones: perfil.invocaciones || {} });
  escribir(SESION_KEY, { token, userId: user.id });
  localStorage.setItem("jwt", token);
  return { token, user, perfil };
};

const empujarServidor = (userId, perfil) => {
  const token = tokenActual();

  if (!esTokenServidor(token)) {
    return;
  }

  const usos = leer(`pokepoker-usos-${userId}`, { invocaciones: {} });
  api
    .updatePerfil(token, {
      ...perfil,
      invocaciones: usos.invocaciones || {},
    })
    .then(() => api.sincronizarCartas(token, perfil.cartas || []))
    .catch(() => {});
};

export const guardarPerfil = (userId, perfil) => {
  escribir(perfilKey(userId), perfil);
  const pokemons = (perfil.cartas || []).filter((carta) => carta.tipoCarta === "pokemon");
  escribir(MAZO_SUELTO_KEY, pokemons);
  empujarServidor(userId, perfil);
  return perfil;
};

export const leerSesion = () => leer(SESION_KEY, null);

export const sembrarDemo = () => {};

export const signup = async ({ email, password, name }) => {
  const data = await api.signup({
    email: email.trim().toLowerCase(),
    password,
    name: name.trim(),
  });

  return hidratarDesdeServidor(data.token, data.user);
};

export const signin = async ({ email, password }) => {
  const data = await api.signin({
    email: email.trim().toLowerCase(),
    password,
  });
  const yo = await api.getMe(data.token);
  return hidratarDesdeServidor(data.token, yo);
};

export const getMe = async (token) => {
  if (!esTokenServidor(token)) {
    throw new Error("Sesion caducada");
  }

  const yo = await api.getMe(token);
  return hidratarDesdeServidor(token, yo);
};

export const cerrarSesion = () => {
  localStorage.removeItem(SESION_KEY);
  localStorage.removeItem("jwt");
};

export const cartasMazoActual = () => {
  const sesion = leerSesion();

  if (sesion) {
    return (getPerfil(sesion.userId).cartas || []).filter(
      (carta) => carta.tipoCarta === "pokemon",
    );
  }

  const suelto = leer(MAZO_SUELTO_KEY, []);
  return Array.isArray(suelto) ? suelto : [];
};

export const elegirInicial = (userId, carta) => {
  const perfil = getPerfil(userId);

  if (perfil.onboardingHecho) {
    return perfil;
  }

  const joya = {
    id: `joya-${userId}`,
    tipoCarta: "joya",
    name: "Joya",
    texto: "Para apostar o comprar",
  };

  return guardarPerfil(userId, {
    ...perfil,
    onboardingHecho: true,
    starterId: carta.id,
    cartas: [carta, ...perfil.cartas.filter((item) => item.id !== carta.id)],
    reliquias: [joya, ...perfil.reliquias],
  });
};

export const guardarCartas = (userId, cartas) => {
  const perfil = getPerfil(userId);
  return guardarPerfil(userId, { ...perfil, cartas });
};

export const marcarCorreoLeido = (userId, mailId) => {
  const perfil = getPerfil(userId);
  return guardarPerfil(userId, {
    ...perfil,
    correo: perfil.correo.map((mail) =>
      mail.id === mailId ? { ...mail, leido: true } : mail,
    ),
  });
};

const quitarJoyas = (reliquias, cantidad) => {
  const siguiente = [...reliquias];
  let faltan = cantidad;

  for (let i = siguiente.length - 1; i >= 0 && faltan > 0; i -= 1) {
    if (siguiente[i].tipoCarta === "joya") {
      siguiente.splice(i, 1);
      faltan -= 1;
    }
  }

  if (faltan > 0) {
    throw new Error("No te alcanzan las joyas");
  }

  return siguiente;
};

export const comprarItem = (userId, item, extra = {}) => {
  const perfil = getPerfil(userId);

  if (contarJoyas(perfil) < item.precio) {
    throw new Error("No te alcanzan las joyas");
  }

  if (item.tipo === "medalla" && perfil.medallas.some((medalla) => medalla.id === item.id)) {
    throw new Error("Ya tienes esa medalla");
  }

  if (item.tipo === "reliquia" && perfil.reliquias.some((reliquia) => reliquia.id === item.id)) {
    throw new Error("Ya tienes esa carta");
  }

  if (item.tipo === "pokemon" && extra.carta && perfil.cartas.some((carta) => carta.id === extra.carta.id)) {
    throw new Error("Ese pokemon ya esta en tu mazo");
  }

  let { cartas, medallas, reliquias } = perfil;
  reliquias = quitarJoyas(reliquias, item.precio);

  if (item.tipo === "medalla") {
    medallas = [
      ...medallas,
      { id: item.id, nombre: item.nombre, gym: item.gym, color: item.color },
    ];
  }

  if (item.tipo === "reliquia") {
    reliquias = [
      ...reliquias,
      { id: item.id, tipoCarta: item.tipoCarta, name: item.nombre },
    ];
  }

  if (item.tipo === "pokemon") {
    const carta = extra.carta;

    if (!carta) {
      throw new Error("No se pudo traer esa carta");
    }

    cartas = [carta, ...cartas];
  }

  return guardarPerfil(userId, {
    ...perfil,
    cartas,
    medallas,
    reliquias,
  });
};

export const listarObjetos = (perfil) => {
  if (!perfil) {
    return [];
  }

  const objetos = [];

  (perfil.reliquias || []).forEach((item) => {
    objetos.push({
      clave: `reliquia-${item.id}`,
      origen: "reliquia",
      id: item.id,
      name: item.name,
      tipoCarta: item.tipoCarta,
      texto: item.texto || item.tipoCarta,
      raw: item,
    });
  });

  (perfil.medallas || []).forEach((item) => {
    objetos.push({
      clave: `medalla-${item.id}`,
      origen: "medalla",
      id: item.id,
      name: item.nombre,
      tipoCarta: "medalla",
      texto: item.gym,
      color: item.color,
      raw: item,
    });
  });

  (perfil.cartas || []).forEach((item) => {
    objetos.push({
      clave: `pokemon-${item.id}`,
      origen: "pokemon",
      id: item.id,
      name: item.name,
      tipoCarta: "pokemon",
      texto: item.type,
      image: item.image,
      raw: item,
    });
  });

  return objetos;
};

export const retirarObjeto = (userId, objeto) => {
  const perfil = getPerfil(userId);

  if (objeto.origen === "reliquia") {
    return guardarPerfil(userId, {
      ...perfil,
      reliquias: perfil.reliquias.filter((item) => item.id !== objeto.id),
    });
  }

  if (objeto.origen === "medalla") {
    return guardarPerfil(userId, {
      ...perfil,
      medallas: perfil.medallas.filter((item) => item.id !== objeto.id),
    });
  }

  return guardarPerfil(userId, {
    ...perfil,
    cartas: perfil.cartas.filter((item) => item.id !== objeto.id),
  });
};

export const entregarObjetos = (userId, objetos) => {
  let perfil = getPerfil(userId);

  objetos.filter(Boolean).forEach((objeto) => {
    if (objeto.origen === "reliquia") {
      if (!perfil.reliquias.some((item) => item.id === objeto.raw.id)) {
        perfil = {
          ...perfil,
          reliquias: [...perfil.reliquias, objeto.raw],
        };
      }
      return;
    }

    if (objeto.origen === "medalla") {
      if (perfil.medallas.some((item) => item.id === objeto.raw.id)) {
        const joya = {
          id: `joya-premio-${Date.now()}`,
          tipoCarta: "joya",
          name: "Joya",
          texto: "Premio de apuesta",
        };
        perfil = { ...perfil, reliquias: [...perfil.reliquias, joya] };
        return;
      }

      perfil = {
        ...perfil,
        medallas: [...perfil.medallas, objeto.raw],
      };
      return;
    }

    if (!perfil.cartas.some((item) => item.id === objeto.raw.id)) {
      perfil = {
        ...perfil,
        cartas: [{ ...objeto.raw, usada: false, resultado: null }, ...perfil.cartas],
      };
    }
  });

  return guardarPerfil(userId, perfil);
};

export const apuestaRivalAzar = () => {
  const medallas = TIENDA.filter((item) => item.tipo === "medalla");
  const medalla = medallas[Math.floor(Math.random() * medallas.length)];
  const joya = {
    id: `joya-rival-${Date.now()}`,
    tipoCarta: "joya",
    name: "Joya",
    texto: "Apuesta del rival",
  };

  if (Math.random() < 0.5) {
    return {
      clave: `rival-${joya.id}`,
      origen: "reliquia",
      id: joya.id,
      name: joya.name,
      tipoCarta: "joya",
      texto: joya.texto,
      raw: joya,
    };
  }

  return {
    clave: `rival-${medalla.id}-${Date.now()}`,
    origen: "medalla",
    id: medalla.id,
    name: medalla.nombre,
    tipoCarta: "medalla",
    texto: medalla.gym,
    color: medalla.color,
    raw: {
      id: medalla.id,
      nombre: medalla.nombre,
      gym: medalla.gym,
      color: medalla.color,
    },
  };
};

const usosKey = (userId) => `pokepoker-usos-${userId}`;

const usosVacios = () => ({ invocaciones: {} });

export const leerUsos = (userId) => {
  if (!userId) {
    return usosVacios();
  }

  const guardado = leer(usosKey(userId), null);
  return guardado && typeof guardado === "object"
    ? { invocaciones: guardado.invocaciones || {} }
    : usosVacios();
};

export const puedeInvocar = (usos, pokemonId) => {
  const item = usos?.invocaciones?.[String(pokemonId)];
  return !item || !item.cooldown;
};

export const marcarInvocacion = (userId, pokemonId) => {
  const usos = leerUsos(userId);
  const clave = String(pokemonId);
  const prev = usos.invocaciones[clave] || { veces: 0, cooldown: 0 };

  usos.invocaciones[clave] = {
    veces: prev.veces + 1,
    cooldown: 3,
  };

  escribir(usosKey(userId), usos);
  empujarServidor(userId, getPerfil(userId));
  return usos;
};

export const registrarVictoria = (userId) => {
  const perfil = getPerfil(userId);
  return guardarPerfil(userId, {
    ...perfil,
    partidasGanadas: contarGanadas(perfil) + 1,
  });
};

export const reiniciarViaje = (userId) => {
  escribir(usosKey(userId), usosVacios());
  return guardarPerfil(userId, {
    ...perfilVacio(userId, "Jugador"),
    viajeCaido: true,
  });
};

export const acusarCaida = (userId) => {
  const perfil = getPerfil(userId);
  return guardarPerfil(userId, {
    ...perfil,
    viajeCaido: false,
  });
};

export const bajarCooldowns = (userId) => {
  const usos = leerUsos(userId);

  Object.keys(usos.invocaciones).forEach((clave) => {
    const item = usos.invocaciones[clave];
    usos.invocaciones[clave] = {
      ...item,
      cooldown: Math.max(0, (item.cooldown || 0) - 1),
    };
  });

  escribir(usosKey(userId), usos);
  empujarServidor(userId, getPerfil(userId));
  return usos;
};


