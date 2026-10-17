import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { SesionProvider, useSesion } from '@/entities/sesion';
import { registrarAlNoAutorizado } from '@/shared/api';
import { RUTAS } from '@/shared/config';
import { QueryProvider } from './providers';
import { router } from './router/router';

function SesionVencida() {
  const { cerrar } = useSesion();
  const queryClient = useQueryClient();
  useEffect(() => {
    registrarAlNoAutorizado(() => {
      cerrar();
      queryClient.clear();
      router.navigate(RUTAS.login);
    });
  }, [cerrar, queryClient]);
  return null;
}

export function App() {
  return (
    <QueryProvider>
      <SesionProvider>
        <SesionVencida />
        <RouterProvider router={router} />
      </SesionProvider>
    </QueryProvider>
  );
}
