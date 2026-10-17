import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { destinoTrasLogin, useSesion } from '@/entities/sesion';
import { RUTAS } from '@/shared/config';

/** Sin sesión → al login, recordando a dónde quería ir. */
export function RequiereSesion() {
  const { estaAutenticado } = useSesion();
  const location = useLocation();
  if (!estaAutenticado) return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname }} />;
  return <Outlet />;
}

/** Con sesión pero otro rol → 403. */
export function RequiereRol({ rol }) {
  const sesion = useSesion();
  const location = useLocation();
  if (!sesion.estaAutenticado) return <Navigate to={RUTAS.login} replace state={{ desde: location.pathname }} />;
  if (sesion.rol !== rol) return <Navigate to={RUTAS.sinPermiso} replace />;
  return <Outlet />;
}

/** Con sesión no tiene sentido ver el login ni el registro. */
export function SoloInvitado() {
  const { estaAutenticado, rol } = useSesion();
  const location = useLocation();
  if (estaAutenticado) return <Navigate to={destinoTrasLogin(rol, location.state?.desde)} replace />;
  return <Outlet />;
}
