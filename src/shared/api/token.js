const CLAVE = 'intiguard.token';

export function leerToken() {
  try {
    return localStorage.getItem(CLAVE);
  } catch {
    return null;
  }
}

export function guardarToken(token) {
  try {
    localStorage.setItem(CLAVE, token);
  } catch {
    // Navegación privada sin almacenamiento: la sesión dura lo que dure la pestaña
  }
}

export function borrarToken() {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // Nada que borrar
  }
}
