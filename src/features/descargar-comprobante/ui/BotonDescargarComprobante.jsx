import { Boton, Icono } from '@/shared/ui';
import { useDescargarComprobante } from '../model/useDescargarComprobante';

/** Descarga el PDF del comprobante. Si falla, el texto del botón lo dice. */
export function BotonDescargarComprobante({ comprobante, texto = 'Descargar comprobante (PDF)', variante = 'primario', anchoCompleto = false }) {
  const { mutate, isPending, isError } = useDescargarComprobante();
  return (
    <Boton
      variante={variante}
      anchoCompleto={anchoCompleto}
      cargando={isPending}
      disabled={!comprobante}
      onClick={() => mutate({ id: comprobante.id, numero: comprobante.numero })}
    >
      {!isPending && <Icono nombre="descargar" tamano={18} />}
      {isError ? 'No se pudo descargar, reintenta' : texto}
    </Boton>
  );
}
