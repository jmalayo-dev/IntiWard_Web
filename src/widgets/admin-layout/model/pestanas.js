import { useEffect, useState } from 'react';

const CLAVE = 'intiguard.admin.pestanas';

function leer() {
  try {
    const guardadas = JSON.parse(sessionStorage.getItem(CLAVE));
    return Array.isArray(guardadas) ? guardadas : [];
  } catch {
    return [];
  }
}

/**
 * Pestañas del panel: cada página que se abre queda como pestaña (sin repetir) hasta que se cierra.
 * Se recuerdan en sessionStorage, solo en esta pestaña del navegador; si no hay almacenamiento, viven en memoria.
 * `actual`: { ruta, titulo, icono } de la página que se está viendo.
 */
export function usePestanas(actual) {
  const [pestanas, setPestanas] = useState(leer);
  // Pestaña de la página actual que se acaba de cerrar: no se vuelve a agregar mientras se navega a la siguiente
  const [cerrada, setCerrada] = useState(null);

  const { ruta, titulo, icono } = actual;
  if (cerrada && cerrada !== ruta) setCerrada(null);

  // La página actual siempre queda guardada entre las pestañas (si ya estaba, se actualiza su título).
  // Se ajusta el estado durante el render, como recomienda React para estados que dependen de props.
  const existente = pestanas.find((p) => p.ruta === ruta);
  if (cerrada !== ruta && (!existente || existente.titulo !== titulo || existente.icono !== icono)) {
    const nueva = { ruta, titulo, icono };
    setPestanas(existente ? pestanas.map((p) => (p.ruta === ruta ? nueva : p)) : [...pestanas, nueva]);
  }
  const lista = pestanas;

  useEffect(() => {
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(pestanas));
    } catch {
      // Navegación privada sin almacenamiento: las pestañas duran lo que dure la página
    }
  }, [pestanas]);

  /** Cierra una pestaña y devuelve a cuál ir si era la actual (la de al lado), o null. */
  const cerrar = (rutaCerrada) => {
    const indice = lista.findIndex((p) => p.ruta === rutaCerrada);
    const restantes = lista.filter((p) => p.ruta !== rutaCerrada);
    setPestanas(restantes);
    if (rutaCerrada !== ruta) return null;
    setCerrada(rutaCerrada);
    return (restantes[indice] ?? restantes[indice - 1])?.ruta ?? null;
  };

  return { pestanas: lista, cerrar };
}
