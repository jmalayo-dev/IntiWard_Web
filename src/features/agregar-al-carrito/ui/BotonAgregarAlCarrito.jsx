import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSesion } from '@/entities/sesion';
import { RUTAS } from '@/shared/config';
import { Boton, Icono } from '@/shared/ui';
import { useAgregarAlCarrito } from '../model/useAgregarAlCarrito';

/**
 * "Agregar al carrito". Visitante → al login (y vuelve aquí). El administrador no tiene carrito: no se muestra.
 * Agotado → deshabilitado con `textoAgotado`.
 */
export function BotonAgregarAlCarrito({ idProducto, disponible, cantidad = 1, textoAgotado = 'Agotado', conIcono = false, alAgregar }) {
  const { estaAutenticado, esAdmin } = useSesion();
  const navigate = useNavigate();
  const location = useLocation();
  const { mutate, isPending, isError, reset } = useAgregarAlCarrito();
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    if (!agregado && !isError) return undefined;
    const id = setTimeout(() => {
      setAgregado(false);
      reset();
    }, 2500);
    return () => clearTimeout(id);
  }, [agregado, isError, reset]);

  if (esAdmin) return null;
  const agotado = !disponible || disponible <= 0;

  const agregar = () => {
    if (!estaAutenticado) {
      navigate(RUTAS.login, { state: { desde: location.pathname + location.search } });
      return;
    }
    mutate(
      { idProducto, cantidad },
      {
        onSuccess: () => {
          setAgregado(true);
          alAgregar?.();
        },
      },
    );
  };

  return (
    <Boton anchoCompleto onClick={agregar} disabled={agotado} cargando={isPending} aria-live="polite">
      {agotado ? (
        textoAgotado
      ) : agregado ? (
        <>
          <Icono nombre="check" tamano={18} /> Agregado al carrito
        </>
      ) : isError ? (
        'No se pudo agregar, reintenta'
      ) : (
        <>
          {conIcono && <Icono nombre="carrito" tamano={18} />}
          Agregar al carrito
        </>
      )}
    </Boton>
  );
}
