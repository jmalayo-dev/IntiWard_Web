import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RUTAS } from '@/shared/config';
import { Aviso, Boton, Campo, Icono, Logo } from '@/shared/ui';
import { avisoDeError } from '../model/mensajes';
import { useLogin } from '../model/useLogin';
import { validarLogin } from '../model/validar';
import styles from './FormularioLogin.module.css';

const VACIO = { correo: '', password: '' };

/** Formulario de la vista 4.4 (diseño de Stitch). */
export function FormularioLogin() {
  const location = useLocation();
  const { mutate, isPending, error, reset } = useLogin();
  const [datos, setDatos] = useState(VACIO);
  const [errores, setErrores] = useState({});
  const [intentoEnviar, setIntentoEnviar] = useState(false);

  const aviso = avisoDeError(error);
  const cuentaCreada = location.state?.cuentaCreada && !error;

  const cambiar = (campo) => (e) => {
    const siguiente = { ...datos, [campo]: e.target.value };
    setDatos(siguiente);
    // Después del primer envío, los errores de formato se corrigen mientras se escribe
    if (intentoEnviar) setErrores(validarLogin(siguiente));
    // Otro correo ya no es la cuenta bloqueada
    if (campo === 'correo' && aviso?.bloqueada) reset();
  };

  const enviar = (e) => {
    e.preventDefault();
    setIntentoEnviar(true);
    const encontrados = validarLogin(datos);
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    mutate({ correo: datos.correo.trim(), password: datos.password });
  };

  return (
    <div className={styles.formulario}>
      <div className={styles.logoMovil}>
        <Logo />
      </div>

      <h1 className={styles.titulo}>Bienvenido!</h1>
      <p className={styles.subtitulo}>Ingresa a tu cuenta de IntiGuard</p>

      {cuentaCreada && (
        <Aviso tipo="exito" className={styles.aviso}>
          ¡Tu cuenta fue creada! Ya puedes iniciar sesión.
        </Aviso>
      )}
      {aviso && (
        <Aviso tipo={aviso.tipo} icono={aviso.icono} className={styles.aviso}>
          {aviso.texto}
        </Aviso>
      )}

      <form className={styles.campos} onSubmit={enviar} noValidate>
        <Campo
          etiqueta="Correo electrónico"
          type="email"
          name="correo"
          autoComplete="email"
          placeholder="tucorreo@ejemplo.com"
          value={datos.correo}
          onChange={cambiar('correo')}
          error={errores.correo}
          autoFocus
        />
        <Campo
          etiqueta="Contraseña"
          type="password"
          name="password"
          autoComplete="current-password"
          value={datos.password}
          onChange={cambiar('password')}
          error={errores.password}
        />
        <Boton type="submit" anchoCompleto cargando={isPending} disabled={aviso?.bloqueada}>
          Iniciar sesión
        </Boton>
      </form>

      <p className={styles.pie}>
        ¿No tienes cuenta?
        <Link to={RUTAS.registro} className={styles.enlace}>
          Crear cuenta
        </Link>
      </p>

      <p className={styles.pie}>
        <Link to={RUTAS.inicio} className={styles.volver}>
          <Icono nombre="flechaIzquierda" tamano={16} />
          Volver a la tienda
        </Link>
      </p>
    </div>
  );
}
