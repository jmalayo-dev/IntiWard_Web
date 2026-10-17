import { FormularioRegistro } from '@/features/registro';
import { useTitulo } from '@/shared/lib';

/** Vista 4.5 · Crear cuenta. El marco (pantalla dividida) lo pone widgets/auth-layout. */
export function RegistroPage() {
  useTitulo('Crear cuenta');
  return <FormularioRegistro />;
}
