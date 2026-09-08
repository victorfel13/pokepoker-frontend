import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60 * 24,
      retry: 0,
    },
  },
});

export const claves = {
  sesion: ["sesion"],
  perfil: (userId) => ["perfil", userId],
  usos: (userId) => ["usos", userId],
  pokemon: (id) => ["pokemon", id],
  poolPartida: ["pokemon", "pool-partida"],
};
