import { Icono } from '@/shared/ui';

const ICONOS = {
  Cámaras: 'camara',
  Alarmas: 'campana',
  'Sensores de movimiento': 'sensor',
  'Detectores de humo': 'humo',
  'Cerraduras digitales': 'candado',
  'Control de acceso': 'acceso',
};

/** Ícono de cada categoría (barra de categorías, inicio, panel). Una categoría nueva usa la etiqueta genérica. */
export function CategoriaIcono({ categoria, tamano = 20, ...resto }) {
  return <Icono nombre={ICONOS[categoria] ?? 'etiqueta'} tamano={tamano} {...resto} />;
}
