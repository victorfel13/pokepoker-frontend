const LINK_BASE = "https://pokeapi.co/api/v2/pokemon/";
const KANTO = 151;
const CACHE_KEY = "pokepoker-kanto";
export const POOL_PARTIDA = 40;

const leerCache = () => {
  try {
    const bruto = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}");
    return bruto && typeof bruto === "object" ? bruto : {};
  } catch {
    return {};
  }
};

const guardarCache = (mapa) => {
  localStorage.setItem(CACHE_KEY, JSON.stringify(mapa));
};

export const recortarPokemon = (data) => ({
  id: data.id,
  name: data.name,
  sprites: {
    front_default: data.sprites?.front_default || null,
    other: {
      "official-artwork": {
        front_default:
          data.sprites?.other?.["official-artwork"]?.front_default || null,
      },
    },
  },
  types: (data.types || []).map((item) => ({
    type: { name: item.type.name },
  })),
  stats: (data.stats || []).map((item) => ({
    base_stat: item.base_stat,
    stat: { name: item.stat.name },
  })),
});

const pedirRed = async (idONombre) => {
  const response = await fetch(`${LINK_BASE}${idONombre}`);

  if (!response.ok) {
    throw new Error("Error con fetch");
  }

  return recortarPokemon(await response.json());
};

export const pokemonDeCache = (idONombre) => {
  const mapa = leerCache();
  const clave = String(idONombre).toLowerCase();

  if (mapa[clave]) {
    return mapa[clave];
  }

  return Object.values(mapa).find(
    (item) => item.name === clave || String(item.id) === clave,
  ) || null;
};

const guardarUno = (pokemon) => {
  const mapa = leerCache();
  mapa[String(pokemon.id)] = pokemon;
  guardarCache(mapa);
  return mapa;
};

export const getPokemon = async (idONombre) => {
  const guardado = pokemonDeCache(idONombre);

  if (guardado) {
    return guardado;
  }

  const data = await pedirRed(idONombre);
  guardarUno(data);
  return data;
};

const idsAzar = (cantidad, excluir = []) => {
  const vetados = new Set(excluir.map(Number));
  const ids = [];

  while (ids.length < cantidad) {
    const n = Math.floor(Math.random() * KANTO) + 1;
    if (!ids.includes(n) && !vetados.has(n)) {
      ids.push(n);
    }
  }

  return ids;
};

export const cargarPoolPartida = async (cantidad = POOL_PARTIDA, excluir = []) => {
  const ids = idsAzar(cantidad, excluir);
  const mapa = leerCache();
  const faltan = ids.filter((id) => !mapa[String(id)]);

  if (faltan.length > 0) {
    const lote = await Promise.all(faltan.map((id) => pedirRed(id)));
    lote.forEach((pokemon) => {
      mapa[String(pokemon.id)] = pokemon;
    });
    guardarCache(mapa);
  }

  return ids.map((id) => mapa[String(id)]);
};

export const getMano = async () => {
  const pool = await cargarPoolPartida(6);
  return pool.slice(0, 6);
};

export const getCartaAzar = async (excluir = []) => {
  const [carta] = await cargarPoolPartida(1, excluir);
  return carta;
};

export const getDuelo = async (excluir = []) => {
  const par = await cargarPoolPartida(2, excluir);
  return par.slice(0, 2);
};

export const getOpcionesDorada = async (cantidad = 9, excluir = []) =>
  cargarPoolPartida(cantidad, excluir);

export const listarCacheKanto = () => {
  const vistos = new Set();
  return Object.values(leerCache()).filter((item) => {
    if (!item || vistos.has(item.id)) {
      return false;
    }

    vistos.add(item.id);
    return true;
  });
};
