import styles from './Logo.module.css';

/** Escudo con sol dorado + "IntiGuard". `claro` para fondos oscuros o azules ("Guard" en blanco). */
export function Logo({ claro = false, tamano = 36 }) {
  return (
    <span className={`${styles.logo} ${claro ? styles.claro : ''}`} style={{ fontSize: tamano * 0.8 }}>
      <svg width={tamano} height={tamano} viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <path
          d="M18 3L5 8V17C5 24.5 10.5 31.4 18 33C25.5 31.4 31 24.5 31 17V8L18 3Z"
          fill="#1E3A8A"
          stroke="#F59E0B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <circle cx="18" cy="18" r="5.5" fill="#F59E0B" />
        <path
          d="M18 8.5V11M18 25V27.5M8.5 18H11M25 18H27.5M11.3 11.3L13.1 13.1M22.9 22.9L24.7 24.7M11.3 24.7L13.1 22.9M22.9 13.1L24.7 11.3"
          stroke="#F59E0B"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      <span>
        <span className={styles.inti}>Inti</span>
        <span className={styles.guard}>Guard</span>
      </span>
    </span>
  );
}
