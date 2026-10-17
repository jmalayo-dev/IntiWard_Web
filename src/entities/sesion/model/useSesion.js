import { useContext } from 'react';
import { SesionContext } from './contexto';

/** → { usuario, rol, esAdmin, estaAutenticado, iniciar, cerrar } */
export function useSesion() {
  const sesion = useContext(SesionContext);
  if (!sesion) throw new Error('useSesion debe usarse dentro de <SesionProvider>');
  return sesion;
}
