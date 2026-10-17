import { useEffect, useRef, useState } from 'react';
import styles from './Graficos.module.css';

/** Ancho real del contenedor: el SVG se dibuja a ese ancho para que el texto no se agrande ni se achique. */
function useAncho() {
  const ref = useRef(null);
  const [ancho, setAncho] = useState(720);
  useEffect(() => {
    const observador = new ResizeObserver(([entrada]) => setAncho(Math.max(320, Math.round(entrada.contentRect.width))));
    observador.observe(ref.current);
    return () => observador.disconnect();
  }, []);
  return [ref, ancho];
}

/** Divide el máximo en 4 tramos "redondos" para las líneas guía. */
function escala(maximo) {
  if (maximo <= 0) return { tope: 4, paso: 1 };
  const bruto = maximo / 4;
  const potencia = 10 ** Math.floor(Math.log10(bruto));
  const paso = [1, 2, 2.5, 5, 10].map((m) => m * potencia).find((p) => p >= bruto);
  return { tope: paso * 4, paso };
}

/** Barras verticales azules; al pasar el mouse muestra el monto. datos: [{ etiqueta, valor, destacado? }] */
export function GraficoBarras({ datos, formato = String, alto = 260, etiqueta }) {
  const [ref, ANCHO] = useAncho();
  const [activo, setActivo] = useState(null);
  const { tope, paso } = escala(Math.max(0, ...datos.map((d) => d.valor)));
  const izq = 76;
  const abajo = 32;
  const areaAlto = alto - abajo - 12;
  const ancho = (ANCHO - izq) / datos.length;
  const y = (v) => 12 + areaAlto - (v / tope) * areaAlto;

  return (
    <figure className={styles.figura} ref={ref}>
      <svg viewBox={`0 0 ${ANCHO} ${alto}`} className={styles.svg} role="img" aria-label={etiqueta}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={izq} x2={ANCHO} y1={y(i * paso)} y2={y(i * paso)} className={i ? styles.guia : styles.eje} />
            <text x={izq - 12} y={y(i * paso) + 4} className={styles.textoEje} textAnchor="end">
              {formato(i * paso)}
            </text>
          </g>
        ))}
        {datos.map((d, i) => {
          const x = izq + i * ancho + ancho * 0.18;
          const w = ancho * 0.64;
          return (
            <g key={d.etiqueta} onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}>
              <rect x={izq + i * ancho} y={0} width={ancho} height={alto} fill="transparent" />
              <rect x={x} y={y(d.valor)} width={w} height={Math.max(0, y(0) - y(d.valor))} rx="4" className={styles.barra} opacity={activo === null || activo === i ? 1 : 0.6}>
                <title>{`${d.etiqueta}: ${formato(d.valor)}`}</title>
              </rect>
              {d.destacado && <circle cx={x + w - 6} cy={y(d.valor) + 2} r="4" className={styles.puntoAcento} />}
              <text x={x + w / 2} y={alto - 8} textAnchor="middle" className={`${styles.textoEje} ${d.destacado ? styles.fuerte : ''}`}>
                {d.etiqueta}
              </text>
              {activo === i && (
                <g>
                  <rect x={x + w / 2 - 56} y={y(d.valor) - 34} width="112" height="26" rx="6" className={styles.globo} />
                  <text x={x + w / 2} y={y(d.valor) - 16} textAnchor="middle" className={styles.textoGlobo}>
                    {formato(d.valor)}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

/** Líneas por día. series: [{ nombre, valores, punteada? }] con el mismo largo que `etiquetas`. */
export function GraficoLineas({ etiquetas, series, formato = String, alto = 260, etiqueta }) {
  const [ref, ANCHO] = useAncho();
  const [activo, setActivo] = useState(null);
  const { tope, paso } = escala(Math.max(0, ...series.flatMap((s) => s.valores)));
  const izq = 76;
  const abajo = 32;
  const areaAlto = alto - abajo - 12;
  const n = Math.max(1, etiquetas.length - 1);
  const x = (i) => izq + 16 + (i / n) * (ANCHO - izq - 32);
  const y = (v) => 12 + areaAlto - (v / tope) * areaAlto;
  const cadaCuanto = Math.ceil(etiquetas.length / Math.max(4, Math.floor(ANCHO / 70)));

  return (
    <figure className={styles.figura} ref={ref}>
      <svg viewBox={`0 0 ${ANCHO} ${alto}`} className={styles.svg} role="img" aria-label={etiqueta}>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={izq} x2={ANCHO} y1={y(i * paso)} y2={y(i * paso)} className={i ? styles.guia : styles.eje} />
            <text x={izq - 12} y={y(i * paso) + 4} className={styles.textoEje} textAnchor="end">
              {formato(i * paso)}
            </text>
          </g>
        ))}
        {etiquetas.map(
          (e, i) =>
            i % cadaCuanto === 0 && (
              <text key={e} x={x(i)} y={alto - 8} textAnchor="middle" className={styles.textoEje}>
                {e}
              </text>
            ),
        )}
        {series.map((s) => (
          <g key={s.nombre}>
            <polyline points={s.valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')} className={s.punteada ? styles.lineaGris : styles.linea} />
            {!s.punteada && s.valores.map((v, i) => <circle key={i} cx={x(i)} cy={y(v)} r={activo === i ? 5 : 3.5} className={styles.puntoLinea} />)}
          </g>
        ))}
        {etiquetas.map((e, i) => (
          <rect
            key={e}
            x={x(i) - (ANCHO - izq) / n / 2}
            y={0}
            width={(ANCHO - izq) / n}
            height={alto}
            fill="transparent"
            onMouseEnter={() => setActivo(i)}
            onMouseLeave={() => setActivo(null)}
          >
            <title>{`${e}: ${series.map((s) => `${s.nombre} ${formato(s.valores[i])}`).join(' · ')}`}</title>
          </rect>
        ))}
        {activo !== null && (
          <g pointerEvents="none">
            <line x1={x(activo)} x2={x(activo)} y1={12} y2={y(0)} className={styles.guia} />
            <rect x={Math.min(x(activo) - 60, ANCHO - 124)} y={4} width="120" height="26" rx="6" className={styles.globo} />
            <text x={Math.min(x(activo), ANCHO - 64)} y={22} textAnchor="middle" className={styles.textoGlobo}>
              {formato(series[0].valores[activo])}
            </text>
          </g>
        )}
      </svg>
    </figure>
  );
}

const COLORES_DONA = ['#1E3A8A', '#2563EB', '#0284C7', '#F59E0B', '#4F46E5', '#64748B'];

/** Dona con leyenda. datos: [{ etiqueta, valor }] */
export function GraficoDona({ datos, etiqueta }) {
  const total = datos.reduce((s, d) => s + d.valor, 0);
  const radio = 60;
  const circunferencia = 2 * Math.PI * radio;
  let acumulado = 0;
  return (
    <div className={styles.dona}>
      <svg viewBox="0 0 160 160" className={styles.svgDona} role="img" aria-label={etiqueta}>
        <circle cx="80" cy="80" r={radio} fill="none" stroke="#F1F5F9" strokeWidth="22" />
        {total > 0 &&
          datos.map((d, i) => {
            const largo = (d.valor / total) * circunferencia;
            const arco = (
              <circle
                key={d.etiqueta}
                cx="80"
                cy="80"
                r={radio}
                fill="none"
                stroke={COLORES_DONA[i % COLORES_DONA.length]}
                strokeWidth="22"
                strokeDasharray={`${largo} ${circunferencia - largo}`}
                strokeDashoffset={-acumulado}
                transform="rotate(-90 80 80)"
              >
                <title>{`${d.etiqueta}: ${Math.round((d.valor / total) * 100)} %`}</title>
              </circle>
            );
            acumulado += largo;
            return arco;
          })}
      </svg>
      <ul className={styles.leyenda}>
        {datos.map((d, i) => (
          <li key={d.etiqueta}>
            <span className={styles.muestra} style={{ background: COLORES_DONA[i % COLORES_DONA.length] }} />
            {d.etiqueta} {total ? Math.round((d.valor / total) * 100) : 0} %
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Barra horizontal de progreso con su etiqueta y valor encima. */
export function BarraProgreso({ etiqueta, valor, maximo, texto, tono = 'primario' }) {
  const porcentaje = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;
  return (
    <div className={styles.progreso}>
      <div className={styles.progresoCabecera}>
        <span>{etiqueta}</span>
        <span className={styles.fuerte}>{texto ?? valor}</span>
      </div>
      <div className={styles.pista} role="progressbar" aria-valuenow={valor} aria-valuemin={0} aria-valuemax={maximo} aria-label={etiqueta}>
        <div className={`${styles.relleno} ${styles[tono]}`} style={{ width: `${porcentaje}%` }} />
      </div>
    </div>
  );
}
