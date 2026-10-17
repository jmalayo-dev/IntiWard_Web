import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatoMoneda } from '@/shared/lib';
import { RUTAS } from '@/shared/config';
import { Aviso, Boton, Campo, Icono } from '@/shared/ui';
import { useConfirmarCompra } from '../model/useConfirmarCompra';
import { leerErrorCompra, validarComprobante } from '../model/validar';
import styles from './FormularioCompra.module.css';

const OPCIONES = [
  { tipo: 'BOLETA', titulo: 'Boleta', texto: 'Para personas. DNI opcional.' },
  { tipo: 'FACTURA', titulo: 'Factura', texto: 'Para empresas. Necesitas RUC y razón social.' },
];

const soloDigitos = (v, max) => v.replace(/\D/g, '').slice(0, max);

/**
 * Vista 4.7: elegir boleta o factura y confirmar. `perfil`: datos de contacto (solo lectura).
 * `resumen(boton)`: la página dibuja el resumen del pedido y pone dentro el botón de confirmar.
 * `bloqueado`: no se puede comprar (carrito vacío o con productos agotados).
 */
export function FormularioCompra({ perfil, total, bloqueado = false, resumen }) {
  const { mutate, isPending, error, reset } = useConfirmarCompra();
  const [tipo, setTipo] = useState('BOLETA');
  const [datos, setDatos] = useState({ dni: '', ruc: '', razonSocial: '' });
  const [errores, setErrores] = useState({});
  const [intento, setIntento] = useState(false);

  const delServidor = leerErrorCompra(error, tipo);
  const errorDe = (campo) => errores[campo] ?? delServidor.campos[campo];

  const cambiar = (campo, valor) => {
    const siguiente = { ...datos, [campo]: valor };
    setDatos(siguiente);
    if (intento) setErrores(validarComprobante({ tipo, ...siguiente }));
    if (error) reset();
  };

  const elegir = (nuevo) => {
    setTipo(nuevo);
    setErrores(intento ? validarComprobante({ tipo: nuevo, ...datos }) : {});
    if (error) reset();
  };

  const confirmar = (e) => {
    e?.preventDefault();
    setIntento(true);
    const encontrados = validarComprobante({ tipo, ...datos });
    setErrores(encontrados);
    if (Object.keys(encontrados).length || bloqueado) return;
    mutate(
      tipo === 'BOLETA'
        ? { tipoComprobante: 'BOLETA', docCliente: datos.dni.trim() || null, nombreRazonSocial: perfil?.nombreCompleto }
        : { tipoComprobante: 'FACTURA', docCliente: datos.ruc.trim(), nombreRazonSocial: datos.razonSocial.trim() },
    );
  };

  const boton = (
    <div className={styles.confirmar}>
      {delServidor.aviso && <Aviso tipo="error">{delServidor.aviso}</Aviso>}
      <Boton type="submit" form="formulario-compra" anchoCompleto cargando={isPending} disabled={bloqueado || !perfil}>
        {isPending ? 'Procesando tu compra…' : `Confirmar compra · ${formatoMoneda(total)}`}
      </Boton>
      <p className={styles.nota}>
        <Icono nombre="escudo" tamano={16} />
        Tu stock queda reservado mientras confirmamos tu compra.
      </p>
    </div>
  );

  return (
    <div className={styles.columnas}>
      <form id="formulario-compra" className={styles.tarjeta} onSubmit={confirmar} noValidate>
        <fieldset disabled={isPending} className={styles.fieldset}>
          <legend className={styles.titulo}>¿Qué comprobante necesitas?</legend>
          <div className={styles.opciones} role="radiogroup" aria-label="Tipo de comprobante">
            {OPCIONES.map((o) => (
              <label key={o.tipo} className={`${styles.opcion} ${tipo === o.tipo ? styles.elegida : ''}`}>
                <input type="radio" name="tipo" value={o.tipo} checked={tipo === o.tipo} onChange={() => elegir(o.tipo)} className={styles.radio} />
                <span className={styles.opcionTitulo}>{o.titulo}</span>
                <span className={styles.opcionTexto}>{o.texto}</span>
              </label>
            ))}
          </div>

          {tipo === 'BOLETA' ? (
            <Campo
              className={styles.campoCorto}
              etiqueta="DNI (opcional)"
              placeholder="8 dígitos"
              inputMode="numeric"
              value={datos.dni}
              onChange={(e) => cambiar('dni', soloDigitos(e.target.value, 8))}
              error={errorDe('dni')}
            />
          ) : (
            <div className={styles.factura}>
              <Campo
                etiqueta="RUC"
                placeholder="11 dígitos"
                inputMode="numeric"
                value={datos.ruc}
                onChange={(e) => cambiar('ruc', soloDigitos(e.target.value, 11))}
                error={errorDe('ruc')}
                ayuda="Empieza con 10, 15, 17 o 20"
              />
              <Campo etiqueta="Razón social" value={datos.razonSocial} onChange={(e) => cambiar('razonSocial', e.target.value)} error={errorDe('razonSocial')} />
            </div>
          )}
        </fieldset>

        <div className={styles.contacto}>
          <div className={styles.contactoCabecera}>
            <h3 className={styles.subtitulo}>Datos de contacto</h3>
            <Link to={RUTAS.perfil} className={styles.enlace}>
              Editar perfil
            </Link>
          </div>
          <div className={styles.datos}>
            <strong>{perfil?.nombreCompleto}</strong>
            <span>{perfil?.correo}</span>
            <span>{perfil?.telefono || 'Sin teléfono'}</span>
          </div>
        </div>
      </form>

      {resumen(boton)}
    </div>
  );
}
