import { useState } from 'react';
import { Icono } from '@/shared/ui';
import styles from './ProductoImagen.module.css';

/** Imagen cuadrada del producto sobre gris muy claro; sin foto (o si no carga), un ícono. */
export function ProductoImagen({ producto, tamano, className = '' }) {
  const [fallo, setFallo] = useState(false);
  const url = producto?.imagenUrl;
  return (
    <div className={`${styles.marco} ${className}`} style={tamano ? { width: tamano, height: tamano } : undefined}>
      {url && !fallo ? (
        <img src={url} alt={producto.nombre} className={styles.imagen} loading="lazy" onError={() => setFallo(true)} />
      ) : (
        <Icono nombre="imagen" tamano={tamano ? Math.max(16, tamano * 0.35) : 40} grosor={1.5} className={styles.icono} />
      )}
    </div>
  );
}
