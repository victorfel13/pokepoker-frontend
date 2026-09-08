const BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

const pedir = async (ruta, opciones = {}) => {
  const response = await fetch(`${BASE}${ruta}`, {
    headers: {
      "Content-Type": "application/json",
      ...(opciones.headers || {}),
    },
    ...opciones,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Error con fetch");
  }

  return data;
};

const conToken = (token) => ({
  Authorization: `Bearer ${token}`,
});

export const signup = ({ email, password, name }) =>
  pedir("/signup", {
    method: "POST",
    body: JSON.stringify({ email, password, name }),
  });

export const signin = ({ email, password }) =>
  pedir("/signin", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const getMe = (token) =>
  pedir("/users/me", {
    headers: conToken(token),
  });

export const updatePerfil = (token, perfil) =>
  pedir("/users/me", {
    method: "PATCH",
    headers: conToken(token),
    body: JSON.stringify({
      onboardingHecho: perfil.onboardingHecho,
      starterId: perfil.starterId,
      cartas: perfil.cartas || [],
      medallas: perfil.medallas || [],
      reliquias: perfil.reliquias || [],
      correo: perfil.correo || [],
      partidasGanadas: Number(perfil.partidasGanadas) || 0,
      viajeCaido: Boolean(perfil.viajeCaido),
      invocaciones: perfil.invocaciones || {},
    }),
  });

export const getCartas = (token) =>
  pedir("/cartas", {
    headers: conToken(token),
  });

export const saveCarta = (token, carta) =>
  pedir("/cartas", {
    method: "POST",
    headers: conToken(token),
    body: JSON.stringify(carta),
  });

export const deleteCarta = (token, cartaId) =>
  pedir(`/cartas/${cartaId}`, {
    method: "DELETE",
    headers: conToken(token),
  });

const esPokemonMazo = (carta) =>
  carta
  && carta.tipoCarta === "pokemon"
  && typeof carta.id === "number"
  && Boolean(carta.image)
  && /^https?:\/\//.test(carta.image);

export const sincronizarCartas = async (token, cartas = []) => {
  const locales = cartas.filter(esPokemonMazo);
  const remotos = await getCartas(token);

  await Promise.all(
    locales
      .filter((carta) => !remotos.some((item) => item.pokemonId === carta.id))
      .map((carta) =>
        saveCarta(token, {
          pokemonId: carta.id,
          name: carta.name,
          image: carta.image,
          type: carta.type,
        }),
      ),
  );

  await Promise.all(
    remotos
      .filter((item) => !locales.some((carta) => carta.id === item.pokemonId))
      .map((item) => deleteCarta(token, item._id)),
  );
};
