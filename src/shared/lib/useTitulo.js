import { useEffect } from 'react';

/** Título de la pestaña: "Mis pedidos - IntiGuard". Al salir de la página vuelve a "IntiGuard". */
export function useTitulo(texto) {
  useEffect(() => {
    document.title = texto ? `${texto} - IntiGuard` : 'IntiGuard';
    return () => {
      document.title = 'IntiGuard';
    };
  }, [texto]);
}
