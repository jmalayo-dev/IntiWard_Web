/** Mismo formato que el ApiError del backend, más el caso "sin conexión" (status 0). */
export class ApiError extends Error {
  constructor({ status, error, mensaje, detalles = [], ruta = '' }) {
    super(mensaje);
    this.status = status;
    this.error = error;
    this.detalles = detalles;
    this.ruta = ruta;
  }

  static desdeAxios(error) {
    const cuerpo = error.response?.data;
    if (cuerpo?.mensaje) return new ApiError(cuerpo);
    if (error.response) {
      return new ApiError({ status: error.response.status, error: error.response.statusText, mensaje: 'Ocurrió un error inesperado' });
    }
    return new ApiError({ status: 0, error: 'Sin conexión', mensaje: 'No se pudo conectar con el servidor' });
  }
}
