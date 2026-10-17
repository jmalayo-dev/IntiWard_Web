import { useQuery } from '@tanstack/react-query';
import { obtenerCarrito } from './carritoApi';

export const carritoKeys = { todos: ['carrito'] };

/** Solo el CLIENTE tiene carrito: quien lo usa pasa `habilitado` según la sesión. */
export const useCarrito = ({ habilitado = true } = {}) =>
  useQuery({ queryKey: carritoKeys.todos, queryFn: obtenerCarrito, enabled: habilitado });
