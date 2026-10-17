import { useCallback, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSesion } from '@/entities/sesion';
import { AvatarIniciales, EstadoCuentaInsignia, estadoCuenta, RolInsignia, useUsuarios } from '@/entities/usuario';
import { InterruptorUsuario } from '@/features/desactivar-usuario';
import { ModalUsuario } from '@/features/guardar-usuario';
import { contiene, formatoFecha, formatoRelativo, paginarLista, useTitulo } from '@/shared/lib';
import { Boton, Buscador, EncabezadoPagina, EstadoVacio, Icono, MensajeError, Paginacion, Pestanas, Tabla, Toast } from '@/shared/ui';
import styles from './AdminUsuariosPage.module.css';

const ROLES = [
  { valor: '', texto: 'Todos' },
  { valor: 'CLIENTE', texto: 'Clientes' },
  { valor: 'ADMIN', texto: 'Administradores' },
];

/** Vista 5.10 · Usuarios. Desactivar en vez de borrar; reactivar levanta el bloqueo por intentos. */
export function AdminUsuariosPage() {
  useTitulo('Usuarios');
  const location = useLocation();
  const { usuario: yo } = useSesion();
  const { data: usuarios = [], isLoading, error, refetch } = useUsuarios();
  const [texto, setTexto] = useState(location.state?.buscar ?? '');
  const [rol, setRol] = useState('');
  const [estado, setEstado] = useState('');
  const [pagina, setPagina] = useState(0);
  const [modal, setModal] = useState(null);
  const [aviso, setAviso] = useState(null);
  const cerrarAviso = useCallback(() => setAviso(null), []);

  const filtrados = usuarios.filter(
    (u) => (!texto || contiene(u.nombreCompleto, texto) || contiene(u.correo, texto)) && (!rol || u.rol === rol) && (!estado || estadoCuenta(u) === estado),
  );
  const vista = paginarLista(filtrados, pagina, 10);
  const cambiar = (fn) => (valor) => {
    fn(valor);
    setPagina(0);
  };

  const columnas = [
    {
      clave: 'usuario',
      titulo: 'Usuario',
      render: (u) => (
        <span className={styles.usuario}>
          <AvatarIniciales iniciales={u.iniciales} fotoUrl={u.fotoUrl} tamano={40} tono={u.rol === 'ADMIN' ? 'primario' : 'gris'} />
          <span className={styles.textos}>
            <strong>{u.nombreCompleto}</strong>
            <span>{u.correo}</span>
          </span>
        </span>
      ),
    },
    { clave: 'rol', titulo: 'Rol', render: (u) => <RolInsignia rol={u.rol} /> },
    { clave: 'estado', titulo: 'Estado', render: (u) => <EstadoCuentaInsignia usuario={u} /> },
    { clave: 'registrado', titulo: 'Registrado', render: (u) => formatoFecha(u.creadoEn) },
    { clave: 'acceso', titulo: 'Último acceso', render: (u) => <span className={styles.acceso}>{formatoRelativo(u.ultimoAcceso)}</span> },
    {
      clave: 'acciones',
      titulo: 'Acciones',
      alinear: 'right',
      render: (u) => (
        <span className={styles.acciones}>
          <button type="button" className={styles.lapiz} onClick={() => setModal(u)} aria-label={`Editar a ${u.nombreCompleto}`}>
            <Icono nombre="lapiz" />
          </button>
          <InterruptorUsuario usuario={u} esPropia={u.id === yo?.id} />
        </span>
      ),
    },
  ];

  if (error) return <MensajeError error={error} alReintentar={refetch} />;

  return (
    <div>
      <Toast mensaje={aviso} alCerrar={cerrarAviso} />
      <EncabezadoPagina
        titulo="Usuarios"
        subtitulo={`${usuarios.length} usuarios`}
        acciones={
          <Boton onClick={() => setModal('nuevo')}>
            <Icono nombre="mas" tamano={18} /> Nuevo usuario
          </Boton>
        }
      />
      <div className={styles.herramientas}>
        <Buscador className={styles.buscador} placeholder="Nombre o correo…" etiqueta="Buscar por nombre o correo" value={texto} onChange={(e) => cambiar(setTexto)(e.target.value)} />
        <Pestanas variante="segmentos" etiqueta="Rol" opciones={ROLES} valor={rol} alCambiar={cambiar(setRol)} />
        <select className={styles.selector} value={estado} onChange={(e) => cambiar(setEstado)(e.target.value)} aria-label="Estado">
          <option value="">Estado: Todos</option>
          <option value="ACTIVO">Activos</option>
          <option value="BLOQUEADO">Bloqueados</option>
          <option value="INACTIVO">Inactivos</option>
        </select>
      </div>
      <Tabla
        columnas={columnas}
        filas={vista.items}
        claseFila={(u) => (u.activo ? undefined : 'atenuada')}
        vacio={!isLoading && <EstadoVacio icono="usuarios" titulo="No hay usuarios con esos filtros" />}
        pie={<Paginacion {...vista} numeros alCambiar={setPagina} />}
      />
      <ModalUsuario
        abierto={Boolean(modal)}
        usuario={modal === 'nuevo' ? undefined : modal}
        alCerrar={() => setModal(null)}
        alGuardar={(accion) => setAviso(accion === 'creado' ? 'El usuario se creó correctamente.' : 'Los cambios se guardaron correctamente.')}
      />
    </div>
  );
}
