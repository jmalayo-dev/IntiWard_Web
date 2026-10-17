import { useCallback, useMemo, useState } from 'react';
import { borrarToken, guardarToken, leerToken } from '@/shared/api';
import { estaVencido, leerClaims } from '@/shared/lib';
import { SesionContext } from './contexto';

function claimsVigentes() {
  const claims = leerClaims(leerToken());
  return claims && !estaVencido(claims) ? claims : null;
}

export function SesionProvider({ children }) {
  const [claims, setClaims] = useState(claimsVigentes);

  const iniciar = useCallback((token) => {
    guardarToken(token);
    setClaims(leerClaims(token));
  }, []);

  const cerrar = useCallback(() => {
    borrarToken();
    setClaims(null);
  }, []);

  const valor = useMemo(
    () => ({
      usuario: claims && { id: claims.idUsuario, correo: claims.sub },
      rol: claims?.rol ?? null,
      estaAutenticado: Boolean(claims),
      esAdmin: claims?.rol === 'ADMIN',
      iniciar,
      cerrar,
    }),
    [claims, iniciar, cerrar],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}
