import { Link } from 'react-router-dom';
import { CategoriaIcono, ORDEN_CATEGORIAS } from '@/entities/categoria';
import { useProductos } from '@/entities/producto';
import { useSesion } from '@/entities/sesion';
import { RUTAS } from '@/shared/config';
import { useTitulo } from '@/shared/lib';
import { Icono, MensajeError } from '@/shared/ui';
import { GrillaProductos } from '@/widgets/grilla-productos';
import styles from './InicioPage.module.css';

// Destacados de PROTOTIPO_WEB.md §4.1: kit, cerradura, cámara bala y alarma (en ese orden)
const DESTACADOS = [3, 7, 2, 4];

const BENEFICIOS = [
  { icono: 'documento', texto: 'Boleta o factura electrónica' },
  { icono: 'caja', texto: 'Stock en tiempo real' },
  { icono: 'escudoCheck', texto: 'Compra segura' },
  { icono: 'exito', texto: 'Garantía de fábrica' },
];

/** Vista 4.1 · Inicio. */
export function InicioPage() {
  useTitulo(null);
  const { estaAutenticado } = useSesion();
  const { data, isLoading, error, refetch } = useProductos({ size: 24 });
  const lista = data?.items ?? [];
  const elegidos = DESTACADOS.map((id) => lista.find((p) => p.id === id)).filter(Boolean);
  const destacados = (elegidos.length ? elegidos : lista).slice(0, 4);

  return (
    <div className={styles.inicio}>
      <section className={styles.hero}>
        <div className={styles.heroTexto}>
          <h1 className={styles.heroTitulo}>Seguridad para tu hogar y tu negocio</h1>
          <p className={styles.heroSubtitulo}>Cámaras, alarmas y cerraduras inteligentes con boleta o factura electrónica y stock real.</p>
          <div className={styles.heroBotones}>
            <Link to={RUTAS.catalogo} className={styles.botonPrimario}>
              Ver catálogo
            </Link>
            {!estaAutenticado && (
              <Link to={RUTAS.registro} className={styles.botonSecundario}>
                Crear cuenta
              </Link>
            )}
          </div>
        </div>
        <div className={styles.heroImagen}>
          <div className={styles.sol} aria-hidden="true" />
          <img src="/ilustraciones/hero.svg" alt="Cerradura digital y cámara de seguridad" />
        </div>
      </section>

      <section className={styles.seccion} aria-labelledby="titulo-categorias">
        <h2 id="titulo-categorias" className={styles.tituloSeccion}>
          Compra por categoría
        </h2>
        <ul className={styles.categorias}>
          {ORDEN_CATEGORIAS.map((c) => (
            <li key={c}>
              <Link to={RUTAS.catalogoDe(c)} className={styles.categoria}>
                <span className={styles.circulo}>
                  <CategoriaIcono categoria={c} tamano={26} />
                </span>
                <span className={styles.nombreCategoria}>{c}</span>
                <span className={styles.verProductos}>Ver productos →</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.seccion} aria-labelledby="titulo-destacados">
        <div className={styles.cabeceraSeccion}>
          <h2 id="titulo-destacados" className={styles.tituloSeccion}>
            Destacados
          </h2>
          <Link to={RUTAS.catalogo} className={styles.verTodo}>
            Ver todo →
          </Link>
        </div>
        {error ? <MensajeError error={error} alReintentar={refetch} /> : <GrillaProductos productos={destacados} cargando={isLoading} esqueletos={4} />}
      </section>

      <section className={styles.beneficios} aria-label="Beneficios">
        <ul className={styles.listaBeneficios}>
          {BENEFICIOS.map((b) => (
            <li key={b.texto}>
              <Icono nombre={b.icono} className={styles.iconoBeneficio} />
              {b.texto}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.cta}>
        <div className={styles.ctaContenido}>
          <p className={styles.ctaTexto}>¿Equipas una empresa? Pide tu factura con RUC al comprar.</p>
          <Link to={RUTAS.catalogo} className={styles.botonDorado}>
            Explorar catálogo
          </Link>
        </div>
      </section>
    </div>
  );
}
