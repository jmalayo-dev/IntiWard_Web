import { useEffect, useState } from 'react';

/** El valor, pero recién cuando deja de cambiar por `ms` (para buscar mientras se escribe sin una llamada por tecla). */
export function useDemorado(valor, ms = 300) {
  const [demorado, setDemorado] = useState(valor);
  useEffect(() => {
    const id = setTimeout(() => setDemorado(valor), ms);
    return () => clearTimeout(id);
  }, [valor, ms]);
  return demorado;
}
