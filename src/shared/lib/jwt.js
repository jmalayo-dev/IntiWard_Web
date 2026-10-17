/** Lee los claims del JWT sin validarlo (la validación la hace el backend). */
export function leerClaims(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      [...atob(base64)].map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, '0')}`).join(''),
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function estaVencido(claims) {
  return !claims?.exp || claims.exp * 1000 <= Date.now();
}
