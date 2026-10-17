/**
 * Carrito por idUsuario: una línea por producto. Ana empieza con el carrito de la vista 4.6:
 * 2 cámaras bala, 1 sensor y la alarma agotada (para ver el aviso "Quita este producto para continuar").
 */
export const carritos = {
  2: [
    { idProducto: 2, cantidad: 2 },
    { idProducto: 5, cantidad: 1 },
    { idProducto: 4, cantidad: 1 },
  ],
};

export const carritoDe = (idUsuario) => (carritos[idUsuario] ??= []);
