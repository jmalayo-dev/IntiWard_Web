import { useCallback, useState } from 'react';
import { normalizar } from '@/shared/lib';

const CLAVE = 'intiguard.busquedas';
const MAXIMO = 8;

function leer() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE));
    return Array.isArray(guardadas) ? guardadas.filter((b) => typeof b === 'string').slice(0, MAXIMO) : [];
  } catch {
    return [];
  }
}

function escribir(lista) {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // Sin almacenamiento (navegación privada): las búsquedas duran lo que dure la página
  }
}

/**
 * Últimas búsquedas, guardadas solo en este navegador (como Google sin sesión): no van al backend,
 * no se ven en otro dispositivo y se pierden si se borran los datos del sitio. La más nueva va primero.
 */
export function useBusquedasRecientes() {
  const [recientes, setRecientes] = useState(leer);

  const actualizar = useCallback((cambio) => {
    setRecientes((actual) => {
      const nueva = cambio(actual);
      escribir(nueva);
      return nueva;
    });
  }, []);

  const agregar = useCallback(
    (texto) => {
      const limpio = texto.trim();
      if (!limpio) return;
      actualizar((lista) => [limpio, ...lista.filter((b) => normalizar(b) !== normalizar(limpio))].slice(0, MAXIMO));
    },
    [actualizar],
  );

  const quitar = useCallback((texto) => actualizar((lista) => lista.filter((b) => b !== texto)), [actualizar]);
  const borrarTodo = useCallback(() => actualizar(() => []), [actualizar]);

  return { recientes, agregar, quitar, borrarTodo };
}
