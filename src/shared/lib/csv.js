/**
 * Descarga un CSV (separado por comas, UTF-8 con BOM para que Excel respete las tildes).
 * columnas: [{ titulo, valor: (fila) => texto | número }]
 */
export function descargarCsv(nombreArchivo, columnas, filas) {
  const celda = (v) => {
    const texto = String(v ?? '');
    return /[",\n]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto;
  };
  const lineas = [columnas.map((c) => celda(c.titulo)).join(','), ...filas.map((f) => columnas.map((c) => celda(c.valor(f))).join(','))];
  const archivo = new Blob([`﻿${lineas.join('\n')}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(archivo);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombreArchivo;
  enlace.click();
  URL.revokeObjectURL(url);
}
