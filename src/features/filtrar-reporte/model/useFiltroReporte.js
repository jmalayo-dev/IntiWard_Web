import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { hoyIso } from '@/shared/lib';

/** El rango del reporte vive en la URL: desde y hasta (AAAA-MM-DD). Sin rango: del 1 del mes a hoy. */
export function useFiltroReporte() {
  const [params, setParams] = useSearchParams();
  const hoy = hoyIso();
  const desde = params.get('desde') ?? `${hoy.slice(0, 8)}01`;
  const hasta = params.get('hasta') ?? hoy;
  const rango = useMemo(() => ({ desde, hasta }), [desde, hasta]);
  const cambiarRango = ({ desde: d, hasta: h }) => setParams(d && h ? { desde: d, hasta: h } : {}, { replace: true });
  return { rango, cambiarRango };
}
