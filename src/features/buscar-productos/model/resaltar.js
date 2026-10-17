import { normalizar } from '@/shared/lib';

/**
 * Parte un texto en trozos para resaltar lo que coincide con lo buscado, sin importar tildes ni mayúsculas:
 * resaltar('Cámara IP', 'cam') → [{ texto: 'Cám', coincide: true }, { texto: 'ara IP', coincide: false }]
 */
export function resaltar(texto, buscado) {
  const q = normalizar(buscado.trim());
  if (!q) return [{ texto, coincide: false }];
  // Se normaliza letra por letra para que las posiciones coincidan con el texto original
  const letras = [...texto];
  const plano = letras.map((l) => normalizar(l) || l).join('');
  const inicio = plano.indexOf(q);
  if (inicio < 0) return [{ texto, coincide: false }];
  const fin = inicio + q.length;
  return [
    { texto: letras.slice(0, inicio).join(''), coincide: false },
    { texto: letras.slice(inicio, fin).join(''), coincide: true },
    { texto: letras.slice(fin).join(''), coincide: false },
  ].filter((t) => t.texto);
}
