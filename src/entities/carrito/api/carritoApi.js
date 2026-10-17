import { ENDPOINTS, http } from '@/shared/api';
import { aCarrito } from '../model/adaptadores';

export const obtenerCarrito = async () => aCarrito(await http.get(ENDPOINTS.carrito.ver));

// Escrituras: las usan las features agregar-al-carrito, cambiar-cantidad-carrito y quitar-del-carrito
export const agregarItem = (idProducto, cantidad = 1) => http.post(ENDPOINTS.carrito.items, { idProducto, cantidad });
export const cambiarCantidad = (idProducto, cantidad) => http.put(ENDPOINTS.carrito.item(idProducto), { cantidad });
export const quitarItem = (idProducto) => http.delete(ENDPOINTS.carrito.item(idProducto));
