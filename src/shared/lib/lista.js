/** Paginación en el front para las listas que el backend devuelve completas. Misma forma que aPagina(). */
export function paginarLista(lista, pagina, tamano = 10) {
  const totalPaginas = Math.max(1, Math.ceil(lista.length / tamano));
  const actual = Math.min(pagina, totalPaginas - 1);
  return {
    items: lista.slice(actual * tamano, (actual + 1) * tamano),
    pagina: actual,
    tamano,
    total: lista.length,
    totalPaginas,
  };
}

/** Compara sin tildes ni mayúsculas: "camara" encuentra "Cámara". */
export const normalizar = (texto) =>
  String(texto ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');

export const contiene = (texto, buscado) => normalizar(texto).includes(normalizar(buscado));
