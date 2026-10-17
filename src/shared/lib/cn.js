import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Une clases de Tailwind sin duplicados en conflicto (el helper `cn` de shadcn/ui). */
export function cn(...entradas) {
  return twMerge(clsx(entradas));
}
