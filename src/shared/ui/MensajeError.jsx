import { Aviso } from './Aviso';
import { Boton } from './Boton';

/** Muestra el mensaje de un ApiError; con status 0 (sin conexión) ofrece reintentar. */
export function MensajeError({ error, alReintentar }) {
  if (!error) return null;
  return (
    <div style={{ display: 'grid', gap: 12, justifyItems: 'start' }}>
      <Aviso tipo="error">{error.message || 'Ocurrió un error inesperado'}</Aviso>
      {alReintentar && (error.status === 0 || error.status >= 500) && (
        <Boton variante="secundario" onClick={alReintentar}>
          Reintentar
        </Boton>
      )}
    </div>
  );
}
