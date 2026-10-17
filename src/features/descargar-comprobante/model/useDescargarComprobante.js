import { useMutation } from '@tanstack/react-query';
import { descargarPdf } from '@/entities/comprobante';

/** Descarga el PDF del comprobante con el nombre "B001-00000001.pdf". */
export function useDescargarComprobante() {
  return useMutation({
    mutationFn: async ({ id, numero }) => {
      const archivo = await descargarPdf(id);
      const url = URL.createObjectURL(archivo);
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = `${numero ?? `comprobante-${id}`}.pdf`;
      enlace.click();
      URL.revokeObjectURL(url);
    },
  });
}
