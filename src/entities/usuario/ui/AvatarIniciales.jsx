/** Avatar circular con las iniciales ("AT"). `tono`: primario (azul) | suave (azul claro) | gris. Con `fotoUrl`, la foto. */
const TONOS = {
  primario: { background: 'var(--color-primario)', color: '#ffffff' },
  suave: { background: 'var(--color-primario-suave)', color: 'var(--color-primario)' },
  gris: { background: '#e2e8f0', color: 'var(--color-texto-secundario)' },
};

export function AvatarIniciales({ iniciales, fotoUrl, tamano = 36, tono = 'primario' }) {
  const estilo = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: tamano,
    height: tamano,
    borderRadius: '50%',
    fontSize: tamano * 0.36,
    fontWeight: 700,
    overflow: 'hidden',
    ...TONOS[tono],
  };
  return (
    <span aria-hidden="true" style={estilo}>
      {fotoUrl ? <img src={fotoUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : iniciales}
    </span>
  );
}
