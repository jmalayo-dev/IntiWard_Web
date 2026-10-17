/** Acepta la página de Spring en formato VIA_DTO ({content, page}) o el clásico (PageImpl). */
export function aPagina(datos) {
  if (Array.isArray(datos)) {
    return { items: datos, pagina: 0, tamano: datos.length, total: datos.length, totalPaginas: 1 };
  }
  const meta = datos.page ?? datos;
  return {
    items: datos.content ?? [],
    pagina: meta.number ?? 0,
    tamano: meta.size ?? 0,
    total: meta.totalElements ?? 0,
    totalPaginas: meta.totalPages ?? 1,
  };
}
