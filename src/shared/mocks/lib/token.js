const base64Url = (obj) =>
  btoa(unescape(encodeURIComponent(JSON.stringify(obj))))
    .replace(/=+$/, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

/** JWT falso: la firma no vale, pero los claims son los mismos que emite ms-auth. */
export function crearTokenFalso(usuario, minutos = 60) {
  const ahora = Math.floor(Date.now() / 1000);
  const claims = { sub: usuario.correo, rol: usuario.rol, idUsuario: usuario.id, iat: ahora, exp: ahora + minutos * 60 };
  return `${base64Url({ alg: 'HS256', typ: 'JWT' })}.${base64Url(claims)}.firma-de-mock`;
}
