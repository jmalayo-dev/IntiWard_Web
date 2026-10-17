import { useEffect, useId, useRef, useState } from 'react';
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

/** Aclara (factor > 0) u oscurece (factor < 0) un color hex: sirve para las caras de las barras 3D. */
function tono(hex, factor) {
  const n = parseInt(hex.slice(1), 16);
  const canal = (c) => Math.round(factor >= 0 ? c + (255 - c) * factor : c * (1 + factor));
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(canal);
  return `rgb(${r} ${g} ${b})`;
}

/**
 * Barras verticales; al pasar el mouse muestra el monto. datos: [{ etiqueta, valor, destacado? }]
 * `tresD`: cada barra es un prisma (cara frontal, lateral más oscura y tapa más clara) sobre un piso.
 * `color`: color base de las barras en hex (por defecto, el azul primario).
 */
export function GraficoBarras({ datos, formato = String, alto = 260, etiqueta, tresD = false, color = '#5E81A1' }) {
  const [ref, ANCHO] = useAncho();
  const [activo, setActivo] = useState(null);
  const { tope, paso } = escala(Math.max(0, ...datos.map((d) => d.valor)));
  const izq = 76;
  const abajo = 32;
  const ancho = (ANCHO - izq) / datos.length;
  // En 3D se deja lugar arriba y a la derecha para la profundidad de los prismas
  const fondo = tresD ? Math.min(ancho * 0.22, 16) : 0;
  const arriba = 12 + fondo;
  const areaAlto = alto - abajo - arriba;
  const y = (v) => arriba + areaAlto - (v / tope) * areaAlto;
  const caras = { frente: color, lado: tono(color, -0.22), tapa: tono(color, 0.3) };

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
        {tresD && (
          // Piso en perspectiva bajo las barras
          <polygon
            points={`${izq},${y(0)} ${izq + fondo},${y(0) - fondo} ${ANCHO},${y(0) - fondo} ${ANCHO - fondo},${y(0)}`}
            fill={tono(color, 0.75)}
            opacity="0.6"
          />
        )}
        {datos.map((d, i) => {
          const w = ancho * (tresD ? 0.5 : 0.64);
          const x = izq + i * ancho + (ancho - w - fondo) / 2;
          const yv = y(d.valor);
          const y0 = y(0);
          const atenuada = activo !== null && activo !== i;
          return (
            <g key={d.etiqueta} onMouseEnter={() => setActivo(i)} onMouseLeave={() => setActivo(null)}>
              <rect x={izq + i * ancho} y={0} width={ancho} height={alto} fill="transparent" />
              <title>{`${d.etiqueta}: ${formato(d.valor)}`}</title>
              {tresD ? (
                <g opacity={atenuada ? 0.55 : 1} className={styles.prisma}>
                  <polygon points={`${x + w},${yv} ${x + w + fondo},${yv - fondo} ${x + w + fondo},${y0 - fondo} ${x + w},${y0}`} fill={caras.lado} />
                  <rect x={x} y={yv} width={w} height={Math.max(0, y0 - yv)} fill={caras.frente} />
                  <polygon points={`${x},${yv} ${x + fondo},${yv - fondo} ${x + w + fondo},${yv - fondo} ${x + w},${yv}`} fill={caras.tapa} />
                </g>
              ) : (
                <rect x={x} y={yv} width={w} height={Math.max(0, y0 - yv)} rx="4" fill={color} opacity={atenuada ? 0.6 : 1} className={styles.barra} />
              )}
              {d.destacado && <circle cx={x + w / 2 + fondo / 2} cy={yv - fondo / 2} r="4" className={styles.puntoAcento} />}
              <text x={x + w / 2} y={alto - 8} textAnchor="middle" className={`${styles.textoEje} ${d.destacado ? styles.fuerte : ''}`}>
                {d.etiqueta}
              </text>
              {activo === i && (
                <g>
                  <rect x={x + w / 2 - 56} y={yv - fondo - 34} width="112" height="26" rx="6" className={styles.globo} />
                  <text x={x + w / 2} y={yv - fondo - 16} textAnchor="middle" className={styles.textoGlobo}>
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

/**
 * Trazo suave que pasa por todos los puntos (curva cardinal convertida a Bézier cúbicas, sin desbordes).
 * `tension` entre 0 (rectas) y 1.
 */
function trazoSuave(puntos, tension = 0.5) {
  if (puntos.length < 2) return '';
  const [x0, y0] = puntos[0];
  let d = `M${x0},${y0}`;
  for (let i = 0; i < puntos.length - 1; i += 1) {
    const [xa, ya] = puntos[i - 1] ?? puntos[i];
    const [xb, yb] = puntos[i];
    const [xc, yc] = puntos[i + 1];
    const [xd, yd] = puntos[i + 2] ?? puntos[i + 1];
    // Los puntos de control no pasan de la altura de los extremos del tramo: la curva nunca se sale por
    // arriba ni por abajo (por ejemplo, nunca baja de S/ 0 entre dos días sin ventas)
    const piso = Math.max(yb, yc);
    const techo = Math.min(yb, yc);
    const acotar = (v) => Math.min(piso, Math.max(techo, v));
    const c1 = [xb + ((xc - xa) / 6) * tension * 2, acotar(yb + ((yc - ya) / 6) * tension * 2)];
    const c2 = [xc - ((xd - xb) / 6) * tension * 2, acotar(yc - ((yd - yb) / 6) * tension * 2)];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${xc.toFixed(1)},${yc.toFixed(1)}`;
  }
  return d;
}

/**
 * Líneas por día con curvas suaves. series: [{ nombre, valores, punteada? }] con el mismo largo que `etiquetas`.
 * La primera serie sólida lleva un relleno degradado debajo. La leyenda va abajo, con un cuadrito por serie.
 * `tema`: 'claro' (sobre tarjeta blanca) u 'oscuro' (línea blanca y punteada gris sobre fondo oscuro).
 */
export function GraficoLineas({ etiquetas, series, formato = String, alto = 280, etiqueta, tema = 'claro' }) {
  const [ref, ANCHO] = useAncho();
  const [activo, setActivo] = useState(null);
  const idDegradado = useId();
  const { tope, paso } = escala(Math.max(0, ...series.flatMap((s) => s.valores)));
  const izq = 64;
  const abajo = 30;
  const areaAlto = alto - abajo - 12;
  const n = Math.max(1, etiquetas.length - 1);
  const x = (i) => izq + 8 + (i / n) * (ANCHO - izq - 16);
  const y = (v) => 12 + areaAlto - (v / tope) * areaAlto;
  const cadaCuanto = Math.ceil(etiquetas.length / Math.max(4, Math.floor(ANCHO / 70)));
  const oscuro = tema === 'oscuro';
  const colorDe = (s) => (s.punteada ? (oscuro ? '#a3a3a3' : 'var(--color-deshabilitado)') : oscuro ? '#ffffff' : 'var(--color-primario)');
  const principal = series.find((s) => !s.punteada);

  return (
    <figure className={`${styles.figura} ${oscuro ? styles.oscuro : ''}`} ref={ref}>
      <svg viewBox={`0 0 ${ANCHO} ${alto}`} className={styles.svg} role="img" aria-label={etiqueta}>
        <defs>
          <linearGradient id={idDegradado} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={oscuro ? '#ffffff' : 'var(--color-primario)'} stopOpacity={oscuro ? 0.16 : 0.22} />
            <stop offset="100%" stopColor={oscuro ? '#ffffff' : 'var(--color-primario)'} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={izq} x2={ANCHO} y1={y(i * paso)} y2={y(i * paso)} className={styles.guiaLineas} />
            <text x={izq - 12} y={y(i * paso) + 4} className={styles.textoEje} textAnchor="end">
              {formato(i * paso)}
            </text>
          </g>
        ))}
        {etiquetas.map(
          (e, i) =>
            i % cadaCuanto === 0 && (
              <text key={e} x={x(i)} y={alto - 6} textAnchor="middle" className={styles.textoEje}>
                {e}
              </text>
            ),
        )}
        {principal && (
          <path
            d={`${trazoSuave(principal.valores.map((v, i) => [x(i), y(v)]))} L${x(principal.valores.length - 1)},${y(0)} L${x(0)},${y(0)} Z`}
            fill={`url(#${idDegradado})`}
          />
        )}
        {series.map((s) => (
          <path
            key={s.nombre}
            d={trazoSuave(s.valores.map((v, i) => [x(i), y(v)]))}
            fill="none"
            stroke={colorDe(s)}
            strokeWidth={s.punteada ? 1.75 : 2.25}
            strokeDasharray={s.punteada ? '5 5' : undefined}
            strokeLinecap="round"
          />
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
            <line x1={x(activo)} x2={x(activo)} y1={12} y2={y(0)} className={styles.guiaLineas} />
            {series.map((s) => (
              <circle key={s.nombre} cx={x(activo)} cy={y(s.valores[activo])} r="4" fill={colorDe(s)} className={styles.puntoActivo} />
            ))}
            <rect x={Math.min(Math.max(x(activo) - 70, izq), ANCHO - 140)} y={2} width="140" height="26" rx="6" className={styles.globo} />
            <text x={Math.min(Math.max(x(activo), izq + 70), ANCHO - 70)} y={20} textAnchor="middle" className={styles.textoGlobo}>
              {etiquetas[activo]}: {formato(series[0].valores[activo])}
            </text>
          </g>
        )}
      </svg>
      <figcaption className={styles.leyendaLineas}>
        {series.map((s) => (
          <span key={s.nombre}>
            <span className={styles.cuadrito} style={{ background: colorDe(s) }} />
            {s.nombre}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}

// Tonos apagados: primario, sus variantes, el oro Inti, el arena del gráfico 3D y gris
const COLORES_DONA = ['#5E81A1', '#8FA9C0', '#3E5A73', '#F59E0B', '#BAAAA0', '#64748B'];

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
