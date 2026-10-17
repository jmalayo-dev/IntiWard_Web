import { useTitulo } from '@/shared/lib';
import { PantallaError } from '@/widgets/pantalla-error';

const TITULOS = { 404: 'Página no encontrada', 403: 'Sin permiso', sesion: 'Sesión expirada', conexion: 'Sin conexión' };

/** Vista 4.14. `tipo`: 404 | 403 | 'sesion' | 'conexion'. */
export function ErrorPage({ tipo = 404 }) {
  useTitulo(TITULOS[tipo]);
  return <PantallaError tipo={tipo} />;
}
