import { useId, useState } from 'react';
import { Icono } from './Icono';
import styles from './Campo.module.css';

/**
 * Etiqueta arriba, campo de 44 px y mensaje de error debajo. Con type="password" agrega el ojo para mostrar u ocultar.
 * `prefijo` va dentro del campo, a la izquierda ("S/").
 * `children` se muestra entre el campo y el mensaje (por ejemplo, una barra de seguridad).
 */
export function Campo({ etiqueta, error, ayuda, prefijo, type = 'text', id, className = '', children, ...resto }) {
  const idGenerado = useId();
  const idCampo = id ?? idGenerado;
  const idMensaje = `${idCampo}-mensaje`;
  const [verClave, setVerClave] = useState(false);
  const esClave = type === 'password';

  const clases = [styles.entrada, esClave && styles.conBoton, prefijo && styles.conPrefijo, error && styles.conError].filter(Boolean).join(' ');

  return (
    <div className={`${styles.campo} ${className}`}>
      {etiqueta && (
        <label className={styles.etiqueta} htmlFor={idCampo}>
          {etiqueta}
        </label>
      )}
      <div className={styles.control}>
        {prefijo && (
          <span className={styles.prefijo} aria-hidden="true">
            {prefijo}
          </span>
        )}
        <input
          id={idCampo}
          type={esClave && verClave ? 'text' : type}
          className={clases}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || ayuda ? idMensaje : undefined}
          {...resto}
        />
        {esClave && (
          <button
            type="button"
            className={styles.verClave}
            onClick={() => setVerClave((v) => !v)}
            aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            aria-pressed={verClave}
          >
            <Icono nombre={verClave ? 'ojoCerrado' : 'ojo'} />
          </button>
        )}
      </div>
      {children}
      {error ? (
        <span id={idMensaje} className={styles.mensajeError}>
          {error}
        </span>
      ) : (
        ayuda && (
          <span id={idMensaje} className={styles.ayuda}>
            {ayuda}
          </span>
        )
      )}
    </div>
  );
}
