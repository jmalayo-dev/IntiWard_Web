import { useState } from 'react';
import { Link } from 'react-router-dom';
import { RUTAS } from '@/shared/config';
import { Aviso, Boton, Campo, Casilla, Logo } from '@/shared/ui';
import { leerErrorRegistro } from '../model/errores';
import { useRegistro } from '../model/useRegistro';
import { validarRegistro } from '../model/validar';
import { BarraSeguridad } from './BarraSeguridad';
import { RequisitosClave } from './RequisitosClave';
import styles from './FormularioRegistro.module.css';

const VACIO = {
  nombres: '',
  apellidos: '',
  correo: '',
  telefono: '',
  direccion: '',
  password: '',
  confirmacion: '',
  aceptaTerminos: false,
};

/** Formulario de la vista 4.5 (diseño de Stitch). Al crear la cuenta lleva al login con el aviso verde. */
export function FormularioRegistro() {
  const { mutate, isPending, error, reset } = useRegistro();
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const delServidor = leerErrorRegistro(error);
  const errorDe = (campo) => errores[campo] ?? delServidor.campos[campo];

  const cambiar = (campo) => (e) => {
    const valor = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    const siguiente = { ...datos, [campo]: valor };
    setDatos(siguiente);
    // Después del primer envío, los errores se corrigen mientras se escribe
    if (intentoEnviar) setErrores(validarRegistro(siguiente));
    // El error del servidor se va al corregir el campo que lo causó
    if (error && (delServidor.aviso || delServidor.campos[campo])) reset();
  };

  const enviar = (e) => {
    e.preventDefault();
    setIntentoEnviar(true);
    const encontrados = validarRegistro(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    mutate({
      nombres: datos.nombres.trim(),
      apellidos: datos.apellidos.trim(),
      correo: datos.correo.trim(),
      telefono: datos.telefono.trim(),
      direccion: datos.direccion.trim(),
      password: datos.password,
    });
  };

  const errorCorreo =
    errorDe('correo') === 'duplicado' ? (
      <>
        Este correo ya está registrado.{' '}
        <Link to={RUTAS.login} className={styles.enlaceError}>
          ¿Quieres iniciar sesión?
        </Link>
      </>
    ) : (
      errorDe('correo')
    );

  return (
    <div className={styles.formulario}>
      <div className={styles.logoMovil}>
        <Logo />
      </div>

      <h1 className={styles.titulo}>Crear cuenta</h1>
      <p className={styles.subtitulo}>Compra más rápido y sigue tus pedidos</p>

      {delServidor.aviso && (
        <Aviso tipo="error" className={styles.aviso}>
          {delServidor.aviso}
        </Aviso>
      )}

      <form className={styles.campos} onSubmit={enviar} noValidate>
        <div className={styles.fila}>
          <Campo
            etiqueta="Nombres"
            name="nombres"
            autoComplete="given-name"
            value={datos.nombres}
            onChange={cambiar('nombres')}
            error={errorDe('nombres')}
            autoFocus
          />
          <Campo
            etiqueta="Apellidos"
            name="apellidos"
            autoComplete="family-name"
            value={datos.apellidos}
            onChange={cambiar('apellidos')}
            error={errorDe('apellidos')}
          />
        </div>

        <Campo
          etiqueta="Correo electrónico"
          type="email"
          name="correo"
          autoComplete="email"
          value={datos.correo}
          onChange={cambiar('correo')}
          error={errorCorreo}
        />

        <div className={styles.fila}>
          <Campo
            etiqueta="Teléfono (opcional)"
            type="tel"
            name="telefono"
            autoComplete="tel"
            value={datos.telefono}
            onChange={cambiar('telefono')}
            error={errorDe('telefono')}
          />
          <Campo
            etiqueta="Dirección (opcional)"
            name="direccion"
            autoComplete="street-address"
            value={datos.direccion}
            onChange={cambiar('direccion')}
            error={errorDe('direccion')}
          />
        </div>

        <Campo
          etiqueta="Contraseña"
          type="password"
          name="password"
          autoComplete="new-password"
          value={datos.password}
          onChange={cambiar('password')}
          error={errorDe('password')}
        >
          <BarraSeguridad clave={datos.password} />
          <RequisitosClave clave={datos.password} />
        </Campo>

        <Campo
          etiqueta="Confirmar contraseña"
          type="password"
          name="confirmacion"
          autoComplete="new-password"
          value={datos.confirmacion}
          onChange={cambiar('confirmacion')}
          error={errorDe('confirmacion')}
        />

        <Casilla
          className={styles.terminos}
          etiqueta="Acepto los términos y la política de privacidad"
          name="aceptaTerminos"
          checked={datos.aceptaTerminos}
          onChange={cambiar('aceptaTerminos')}
          error={errorDe('aceptaTerminos')}
        />

        <div className={styles.enviar}>
          <Boton type="submit" anchoCompleto cargando={isPending}>
            Crear cuenta
          </Boton>
        </div>
      </form>

      <p className={styles.pie}>
        ¿Ya tienes cuenta?
        <Link to={RUTAS.login} className={styles.enlace}>
          Iniciar sesión
        </Link>
      </p>
    </div>
  );
}
