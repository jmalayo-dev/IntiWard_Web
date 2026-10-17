import { useState } from 'react';
import { esClaveValida, esCorreo } from '@/shared/lib';
import { Aviso, Boton, Campo, Modal, Selector } from '@/shared/ui';
import { useGuardarUsuario } from '../model/useGuardarUsuario';
import styles from './ModalUsuario.module.css';

const ROLES = [
  { valor: 'CLIENTE', texto: 'Cliente' },
  { valor: 'ADMIN', texto: 'Administrador' },
];

/** Contraseña temporal de 10 caracteres sin letras que se confunden (l, 1, O, 0). */
function generarClave() {
  const letras = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const valores = crypto.getRandomValues(new Uint32Array(10));
  return Array.from(valores, (v) => letras[v % letras.length]).join('');
}

/** Modal "Nuevo usuario" (vista 5.10) o editar uno existente (`usuario`). Cerrado no se monta. */
export function ModalUsuario(props) {
  return props.abierto ? <Contenido {...props} /> : null;
}

function Contenido({ abierto, alCerrar, usuario, alGuardar }) {
  const { mutate, isPending, error, reset } = useGuardarUsuario();
  const [datos, setDatos] = useState({
    nombres: usuario?.nombres ?? '',
    apellidos: usuario?.apellidos ?? '',
    correo: usuario?.correo ?? '',
    rol: usuario?.rol ?? 'CLIENTE',
    password: '',
  });
  const [errores, setErrores] = useState({});

  const cambiar = (campo) => (e) => {
    setDatos({ ...datos, [campo]: e.target.value });
    setErrores({ ...errores, [campo]: undefined });
    if (error) reset();
  };

  const guardar = (e) => {
    e.preventDefault();
    const encontrados = {};
    if (!datos.nombres.trim()) encontrados.nombres = 'Ingresa los nombres';
    if (!datos.apellidos.trim()) encontrados.apellidos = 'Ingresa los apellidos';
    if (!esCorreo(datos.correo.trim())) encontrados.correo = 'Ingresa un correo válido';
    if (!usuario && !esClaveValida(datos.password)) encontrados.password = 'La contraseña debe tener al menos 8 caracteres';
    if (usuario && datos.password && !esClaveValida(datos.password)) encontrados.password = 'La contraseña debe tener al menos 8 caracteres';
    setErrores(encontrados);
    if (Object.keys(encontrados).length) return;
    mutate(
      {
        id: usuario?.id,
        nombres: datos.nombres.trim(),
        apellidos: datos.apellidos.trim(),
        correo: datos.correo.trim(),
        rol: datos.rol,
        ...(datos.password ? { password: datos.password } : {}),
      },
      {
        onSuccess: () => {
          alGuardar?.(usuario ? 'editado' : 'creado');
          alCerrar();
        },
      },
    );
  };

  const correoDuplicado = error?.status === 409;

  return (
    <Modal
      abierto={abierto}
      titulo={usuario ? 'Editar usuario' : 'Nuevo usuario'}
      alCerrar={alCerrar}
      acciones={
        <>
          <Boton variante="secundario" onClick={alCerrar}>
            Cancelar
          </Boton>
          <Boton type="submit" form="form-usuario" cargando={isPending}>
            {usuario ? 'Guardar cambios' : 'Crear usuario'}
          </Boton>
        </>
      }
    >
      <form id="form-usuario" onSubmit={guardar} noValidate className={styles.formulario}>
        {error && !correoDuplicado && <Aviso tipo="error">{error.message}</Aviso>}
        <div className={styles.fila}>
          <Campo etiqueta="Nombres" value={datos.nombres ?? ''} onChange={cambiar('nombres')} error={errores.nombres} autoFocus />
          <Campo etiqueta="Apellidos" value={datos.apellidos ?? ''} onChange={cambiar('apellidos')} error={errores.apellidos} />
        </div>
        <Campo
          etiqueta="Correo"
          type="email"
          value={datos.correo ?? ''}
          onChange={cambiar('correo')}
          error={errores.correo ?? (correoDuplicado ? 'Este correo ya está registrado' : undefined)}
        />
        <Selector etiqueta="Rol" opciones={ROLES} value={datos.rol ?? 'CLIENTE'} onChange={cambiar('rol')} />
        <div className={styles.clave}>
          <Campo
            className={styles.campoClave}
            etiqueta={usuario ? 'Contraseña nueva (opcional)' : 'Contraseña temporal'}
            value={datos.password ?? ''}
            onChange={cambiar('password')}
            error={errores.password}
            autoComplete="off"
            spellCheck={false}
          />
          <Boton variante="secundario" onClick={() => setDatos({ ...datos, password: generarClave() })}>
            Generar
          </Boton>
        </div>
      </form>
    </Modal>
  );
}
