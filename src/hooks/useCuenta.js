import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  bajarCooldowns,
  cerrarSesion,
  getMe,
  getPerfil,
  leerUsos,
  marcarInvocacion,
} from "../utils/cuentaLocal";
import { claves } from "../query/cliente";

export const useSesion = () =>
  useQuery({
    queryKey: claves.sesion,
    queryFn: async () => {
      const token = localStorage.getItem("jwt");

      if (!token) {
        return { token: "", user: null, perfil: null };
      }

      try {
        return await getMe(token);
      } catch {
        cerrarSesion();
        return { token: "", user: null, perfil: null };
      }
    },
  });

export const usePerfil = (userId) =>
  useQuery({
    queryKey: claves.perfil(userId),
    queryFn: () => getPerfil(userId),
    enabled: Boolean(userId),
  });

export const useUsos = (userId) =>
  useQuery({
    queryKey: claves.usos(userId),
    queryFn: () => leerUsos(userId),
    enabled: Boolean(userId),
  });

export const useInvocar = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (pokemonId) => marcarInvocacion(userId, pokemonId),
    onSuccess: (usos) => {
      queryClient.setQueryData(claves.usos(userId), usos);
    },
  });
};

export const useBajarCooldowns = (userId) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bajarCooldowns(userId),
    onSuccess: (usos) => {
      queryClient.setQueryData(claves.usos(userId), usos);
    },
  });
};

export const invalidarCuenta = (queryClient, userId) => {
  queryClient.invalidateQueries({ queryKey: claves.sesion });

  if (userId) {
    queryClient.invalidateQueries({ queryKey: claves.perfil(userId) });
    queryClient.invalidateQueries({ queryKey: claves.usos(userId) });
  }
};
