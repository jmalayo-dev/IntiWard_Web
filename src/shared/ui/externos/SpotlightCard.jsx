import { useEffect, useRef } from 'react';
import { cn } from '@/shared/lib/cn';
import './SpotlightCard.css';

/*
 * GlowCard ("spotlight-card", 21st.dev): tarjeta de vidrio con un borde que brilla siguiendo al puntero.
 * Pasada de TSX a JSX. Diferencias con el original:
 * - Las reglas de ::before / ::after van en SpotlightCard.css (una vez) y no en un <style> por tarjeta.
 * - `className` se une con cn (tailwind-merge), así puede reemplazar las clases por defecto (p-4, gap-4, sombra…).
 * - `radio` (px) ajusta la curva del borde brillante para que coincida con la de la tarjeta.
 */
const glowColorMap = {
  blue: { base: 220, spread: 200 },
  purple: { base: 280, spread: 300 },
  green: { base: 120, spread: 200 },
  red: { base: 0, spread: 200 },
  orange: { base: 30, spread: 200 },
};

const sizeMap = {
  sm: 'w-48 h-64',
  md: 'w-64 h-80',
  lg: 'w-80 h-96',
};

export function GlowCard({ children, className = '', glowColor = 'blue', size = 'md', width, height, customSize = false, radio = 14, style }) {
  const cardRef = useRef(null);

  useEffect(() => {
    const syncPointer = (e) => {
      const { clientX: x, clientY: y } = e;
      if (!cardRef.current) return;
      cardRef.current.style.setProperty('--x', x.toFixed(2));
      cardRef.current.style.setProperty('--xp', (x / window.innerWidth).toFixed(2));
      cardRef.current.style.setProperty('--y', y.toFixed(2));
      cardRef.current.style.setProperty('--yp', (y / window.innerHeight).toFixed(2));
    };
    document.addEventListener('pointermove', syncPointer);
    return () => document.removeEventListener('pointermove', syncPointer);
  }, []);

  const { base, spread } = glowColorMap[glowColor];

  const estilos = {
    '--base': base,
    '--spread': spread,
    '--radius': String(radio),
    '--border': '3',
    '--backdrop': 'hsl(0 0% 60% / 0.12)',
    '--backup-border': 'var(--backdrop)',
    '--size': '200',
    '--outer': '1',
    '--border-size': 'calc(var(--border, 2) * 1px)',
    '--spotlight-size': 'calc(var(--size, 150) * 1px)',
    '--hue': 'calc(var(--base) + (var(--xp, 0) * var(--spread, 0)))',
    backgroundImage: `radial-gradient(
      var(--spotlight-size) var(--spotlight-size) at
      calc(var(--x, 0) * 1px)
      calc(var(--y, 0) * 1px),
      hsl(var(--hue, 210) calc(var(--saturation, 100) * 1%) calc(var(--lightness, 70) * 1%) / var(--bg-spot-opacity, 0.1)), transparent
    )`,
    backgroundColor: 'var(--backdrop, transparent)',
    backgroundSize: 'calc(100% + (2 * var(--border-size))) calc(100% + (2 * var(--border-size)))',
    backgroundPosition: '50% 50%',
    backgroundAttachment: 'fixed',
    border: 'var(--border-size) solid var(--backup-border)',
    position: 'relative',
    touchAction: 'none',
    ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
    ...style,
  };

  return (
    <div
      ref={cardRef}
      data-glow
      style={estilos}
      className={cn(
        !customSize && sizeMap[size],
        !customSize && 'aspect-[3/4]',
        'relative grid grid-rows-[1fr_auto] gap-4 rounded-2xl p-4 shadow-[0_1rem_2rem_-1rem_black] backdrop-blur-[5px]',
        className,
      )}
    >
      <div data-glow />
      {children}
    </div>
  );
}
