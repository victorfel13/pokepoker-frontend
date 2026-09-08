const ganaA = {
  fire: ["grass", "bug", "ice", "steel"],
  water: ["fire", "ground", "rock"],
  grass: ["water", "ground", "rock"],
  electric: ["water", "flying"],
  ice: ["grass", "ground", "flying", "dragon"],
  fighting: ["normal", "ice", "rock", "steel", "dark"],
  poison: ["grass", "fairy"],
  ground: ["fire", "electric", "poison", "rock", "steel"],
  flying: ["grass", "fighting", "bug"],
  psychic: ["fighting", "poison"],
  bug: ["grass", "psychic", "dark"],
  rock: ["fire", "ice", "flying", "bug"],
  ghost: ["psychic", "ghost"],
  dragon: ["dragon"],
  dark: ["psychic", "ghost"],
  steel: ["ice", "rock", "fairy"],
  fairy: ["fighting", "dragon", "dark"],
  normal: [],
};

const getStat = (pokemon, nombre) => {
  if (!pokemon || !pokemon.stats) {
    return 0;
  }

  const stat = pokemon.stats.find((item) => item.stat.name === nombre);
  return stat ? stat.base_stat : 0;
};

export const getTipo = (pokemon) => {
  if (pokemon && pokemon.type) {
    return pokemon.type;
  }

  if (!pokemon || !pokemon.types || !pokemon.types[0]) {
    return "normal";
  }

  return pokemon.types[0].type.name;
};

export const getPoder = (pokemon) => {
  if (typeof pokemon.poder === "number") {
    return pokemon.poder;
  }

  return getStat(pokemon, "attack");
};

export const quienGana = (tuCarta, rivalCarta) => {
  const tuTipo = getTipo(tuCarta);
  const rivalTipo = getTipo(rivalCarta);

  if (ganaA[tuTipo] && ganaA[tuTipo].includes(rivalTipo)) {
    return "tu";
  }

  if (ganaA[rivalTipo] && ganaA[rivalTipo].includes(tuTipo)) {
    return "rival";
  }

  const tuPoder = getPoder(tuCarta);
  const rivalPoder = getPoder(rivalCarta);

  if (tuPoder > rivalPoder) {
    return "tu";
  }

  if (rivalPoder > tuPoder) {
    return "rival";
  }

  return "empate";
};

export const armaCarta = (data) => ({
  id: data.id,
  tipoCarta: "pokemon",
  name: data.name,
  image:
    data.sprites.other?.["official-artwork"]?.front_default
    || data.sprites.front_default,
  type: getTipo(data),
  poder: getStat(data, "attack"),
  vida: getStat(data, "hp"),
  defensa: getStat(data, "defense"),
  usada: false,
  resultado: null,
});

const tiposEs = {
  fire: "Fuego",
  water: "Agua",
  grass: "Planta",
  electric: "Electrico",
  ice: "Hielo",
  fighting: "Lucha",
  poison: "Veneno",
  ground: "Tierra",
  flying: "Volador",
  psychic: "Psiquico",
  bug: "Bicho",
  rock: "Roca",
  ghost: "Fantasma",
  dragon: "Dragon",
  dark: "Siniestro",
  steel: "Acero",
  fairy: "Hada",
  normal: "Normal",
};

export const tipoEs = (tipo) => tiposEs[tipo] || tipo;

export const nombreBonito = (name) => {
  if (!name) {
    return "";
  }

  return name.charAt(0).toUpperCase() + name.slice(1);
};

export const cartaDorada = (slot) => ({
  id: `dorada-${slot}-${Date.now()}`,
  tipoCarta: "dorada",
  name: "dorada",
  type: "especial",
  poder: 0,
  vida: 0,
  usada: false,
  resultado: null,
});

export const cartaPokedex = (slot) => ({
  id: `pokedex-${slot}-${Date.now()}`,
  tipoCarta: "pokedex",
  name: "pokedex",
  type: "especial",
  poder: 0,
  vida: 0,
  usada: false,
  resultado: null,
});

export const talVezEspecial = (carta, slot) => {
  const n = Math.random();

  if (n < 0.14) {
    return cartaDorada(slot);
  }

  if (n < 0.26) {
    return cartaPokedex(slot);
  }

  return carta;
};
