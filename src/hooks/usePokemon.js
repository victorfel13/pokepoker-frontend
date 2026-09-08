import { cargarPoolPartida, listarCacheKanto } from "../utils/pokeApi";
import { claves } from "../query/cliente";

export const hidratarPokemon = (queryClient) => {
  const lista = listarCacheKanto();

  if (lista.length === 0) {
    return;
  }

  lista.forEach((pokemon) => {
    queryClient.setQueryData(claves.pokemon(pokemon.id), pokemon);
  });
};

export const precargarPartida = async (queryClient, cantidad, excluir = []) => {
  const pool = await queryClient.fetchQuery({
    queryKey: claves.poolPartida,
    queryFn: () => cargarPoolPartida(cantidad, excluir),
    staleTime: 0,
    gcTime: 1000 * 60 * 30,
  });

  pool.forEach((pokemon) => {
    queryClient.setQueryData(claves.pokemon(pokemon.id), pokemon);
  });

  return pool;
};

export const tomarDelPool = (poolRef, excluir = []) => {
  const vetados = new Set(excluir.map(Number));
  const indice = poolRef.current.findIndex(
    (item) => item && !vetados.has(item.id),
  );

  if (indice < 0) {
    return null;
  }

  const [carta] = poolRef.current.splice(indice, 1);
  return carta;
};
