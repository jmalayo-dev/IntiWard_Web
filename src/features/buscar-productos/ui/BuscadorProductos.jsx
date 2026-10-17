import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategorias } from '@/entities/categoria';
import { useMarcas } from '@/entities/marca';
import { ProductoImagen, useProductos } from '@/entities/producto';
import { RUTAS } from '@/shared/config';
import { contiene, formatoMoneda, useDemorado } from '@/shared/lib';
import { GlowCard, Icono } from '@/shared/ui';
import { useBusquedasRecientes } from '../model/recientes';
import { resaltar } from '../model/resaltar';
import styles from './BuscadorProductos.module.css';

const MINIMO = 2;

function Resaltado({ texto, buscado }) {
  return resaltar(texto, buscado).map((t, i) => (t.coincide ? <strong key={i}>{t.texto}</strong> : <span key={i}>{t.texto}</span>));
}

/**
 * Buscador de la tienda con sugerencias, como Google: al enfocarlo vacío muestra las búsquedas recientes;
 * al escribir, productos, categorías y marcas que coinciden. Se maneja con ↑ ↓ Enter y Esc.
 * Las sugerencias de productos usan GET /productos?q= (el mismo filtro del catálogo); las recientes, el navegador.
 * Se monta con key = lo buscado, así muestra la búsqueda actual del catálogo.
 */
export function BuscadorProductos({ inicial = '', alBuscar, className = '' }) {
  const navigate = useNavigate();
  const idLista = useId();
  const contenedor = useRef(null);
  const [texto, setTexto] = useState(inicial);
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const { recientes, agregar, quitar, borrarTodo } = useBusquedasRecientes();

  const q = texto.trim();
  const qDemorado = useDemorado(q, 250);
  const buscando = qDemorado.length >= MINIMO;
  const { data: productos, isFetching } = useProductos({ q: qDemorado, size: 5 }, { habilitado: abierto && buscando });
  const { data: categorias = [] } = useCategorias();
  const { data: marcas = [] } = useMarcas();

  // Cerrar al hacer clic afuera
  useEffect(() => {
    if (!abierto) return undefined;
    const fuera = (e) => !contenedor.current?.contains(e.target) && setAbierto(false);
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto]);

  // Opciones visibles, en orden: cada una sabe qué hacer al elegirla
  const irA = (ruta, guardar) => {
    if (guardar) agregar(guardar);
    setAbierto(false);
    // Quita el foco del campo para que el desplegable no se vuelva a abrir solo
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
    navigate(ruta);
    alBuscar?.();
  };
  const buscar = (termino) => irA(termino ? `${RUTAS.catalogo}?q=${encodeURIComponent(termino)}` : RUTAS.catalogo, termino);

  const secciones = [];
  if (!q) {
    if (recientes.length) secciones.push({ id: 'recientes', titulo: 'Búsquedas recientes', opciones: recientes.map((b) => ({ tipo: 'reciente', texto: b, elegir: () => buscar(b) })) });
  } else {
    const recientesQueCoinciden = recientes.filter((b) => contiene(b, q) && b.toLowerCase() !== q.toLowerCase()).slice(0, 3);
    if (recientesQueCoinciden.length) {
      secciones.push({ id: 'recientes', titulo: 'Búsquedas recientes', opciones: recientesQueCoinciden.map((b) => ({ tipo: 'reciente', texto: b, elegir: () => buscar(b) })) });
    }
    if (buscando && productos?.items.length && qDemorado === q) {
      secciones.push({
        id: 'productos',
        titulo: 'Productos',
        opciones: productos.items.map((p) => ({ tipo: 'producto', producto: p, texto: p.nombre, elegir: () => irA(RUTAS.producto(p.id), q) })),
      });
    }
    const filtros = [
      ...categorias.filter((c) => contiene(c.nombre, q)).map((c) => ({ tipo: 'categoria', texto: c.nombre, detalle: 'Categoría', elegir: () => irA(RUTAS.catalogoDe(c.nombre)) })),
      ...marcas.filter((m) => contiene(m.nombre, q)).map((m) => ({ tipo: 'marca', texto: m.nombre, detalle: 'Marca', elegir: () => irA(`${RUTAS.catalogo}?marca=${encodeURIComponent(m.nombre)}`) })),
    ].slice(0, 4);
    if (filtros.length) secciones.push({ id: 'filtros', titulo: 'Categorías y marcas', opciones: filtros });
    secciones.push({ id: 'todo', opciones: [{ tipo: 'todo', texto: q, elegir: () => buscar(q) }] });
  }
  const opciones = secciones.flatMap((s) => s.opciones);
  const mostrar = abierto && secciones.length > 0;
  const idOpcion = (i) => `${idLista}-opcion-${i}`;

  const alTeclear = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!abierto) setAbierto(true);
      if (!opciones.length) return;
      // Se recorre la lista y, pasada la última (o antes de la primera), se vuelve al campo (-1)
      const n = opciones.length;
      setActivo((a) => {
        const actual = a >= 0 && a < n ? a : -1;
        if (e.key === 'ArrowDown') return actual === n - 1 ? -1 : actual + 1;
        return actual === -1 ? n - 1 : actual - 1;
      });
    } else if (e.key === 'Escape') {
      if (abierto) {
        e.preventDefault();
        setAbierto(false);
        setActivo(-1);
      }
    }
  };

  // Si la lista cambió y el índice quedó fuera, no hay opción activa
  const indiceActivo = activo >= 0 && activo < opciones.length ? activo : -1;

  const enviar = (e) => {
    e.preventDefault();
    if (mostrar && indiceActivo >= 0) opciones[indiceActivo].elegir();
    else buscar(q);
  };

  let indice = -1;
  return (
    <form role="search" className={`${styles.buscador} ${className}`} onSubmit={enviar} ref={contenedor}>
      <GlowCard customSize glowColor="orange" radio={12} className="h-11 w-full grid-rows-1 gap-0 rounded-xl p-0 shadow-[0_0.75rem_1.5rem_-1rem_black]">
        <Icono nombre="buscar" className={styles.lupa} />
        <input
          type="search"
          value={texto}
          onChange={(e) => {
            setTexto(e.target.value);
            setAbierto(true);
            setActivo(-1);
          }}
          onFocus={() => setAbierto(true)}
          onKeyDown={alTeclear}
          placeholder="Buscar cámaras, alarmas, cerraduras…"
          aria-label="Buscar productos"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={mostrar}
          aria-controls={idLista}
          aria-activedescendant={mostrar && indiceActivo >= 0 ? idOpcion(indiceActivo) : undefined}
          autoComplete="off"
        />
      </GlowCard>

      {mostrar && (
        // onMouseDown: elegir con el mouse no le quita el foco al campo antes del clic
        <div className={styles.desplegable} onMouseDown={(e) => e.preventDefault()}>
          <ul id={idLista} role="listbox" aria-label="Sugerencias" className={styles.lista}>
            {secciones.map((s) => (
              <li key={s.id} role="presentation" className={styles.seccion}>
                {s.titulo && (
                  <div className={styles.tituloSeccion} role="presentation">
                    <span>{s.titulo}</span>
                    {s.id === 'recientes' && !q && (
                      <button type="button" className={styles.borrarTodo} onClick={borrarTodo}>
                        Borrar todo
                      </button>
                    )}
                    {s.id === 'productos' && isFetching && <span className={styles.cargando}>Buscando…</span>}
                  </div>
                )}
                <ul role="presentation" className={styles.opciones}>
                  {s.opciones.map((o) => {
                    indice += 1;
                    const i = indice;
                    return (
                      <li
                        key={`${o.tipo}-${o.texto}`}
                        id={idOpcion(i)}
                        role="option"
                        aria-selected={i === indiceActivo}
                        className={`${styles.opcion} ${i === indiceActivo ? styles.activa : ''}`}
                        onMouseEnter={() => setActivo(i)}
                        onClick={o.elegir}
                      >
                        {o.tipo === 'reciente' && (
                          <>
                            <Icono nombre="historial" tamano={18} className={styles.icono} />
                            <span className={styles.texto}>
                              <Resaltado texto={o.texto} buscado={q} />
                            </span>
                            <button
                              type="button"
                              className={styles.quitar}
                              aria-label={`Quitar "${o.texto}" de las búsquedas recientes`}
                              onClick={(e) => {
                                e.stopPropagation();
                                quitar(o.texto);
                              }}
                            >
                              <Icono nombre="cerrar" tamano={14} />
                            </button>
                          </>
                        )}
                        {o.tipo === 'producto' && (
                          <>
                            <ProductoImagen producto={o.producto} tamano={40} />
                            <span className={`${styles.texto} ${styles.doble}`}>
                              <span className={styles.nombre}>
                                <Resaltado texto={o.producto.nombre} buscado={q} />
                              </span>
                              <span className={styles.detalle}>
                                {o.producto.marca} · {o.producto.categoria}
                              </span>
                            </span>
                            <span className={styles.precio}>{formatoMoneda(o.producto.precio)}</span>
                          </>
                        )}
                        {(o.tipo === 'categoria' || o.tipo === 'marca') && (
                          <>
                            <Icono nombre={o.tipo === 'marca' ? 'etiqueta' : 'cuadricula'} tamano={18} className={styles.icono} />
                            <span className={styles.texto}>
                              <Resaltado texto={o.texto} buscado={q} />
                            </span>
                            <span className={styles.detalle}>{o.detalle}</span>
                          </>
                        )}
                        {o.tipo === 'todo' && (
                          <>
                            <Icono nombre="buscar" tamano={18} className={styles.icono} />
                            <span className={styles.texto}>
                              Buscar «<strong>{o.texto}</strong>» en todo el catálogo
                            </span>
                          </>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
}
