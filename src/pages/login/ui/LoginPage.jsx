import { FormularioLogin } from '@/features/login';
import { useTitulo } from '@/shared/lib';

/** Vista 4.4 · Iniciar sesión. El marco (pantalla dividida) lo pone widgets/auth-layout. */
export function LoginPage() {
  useTitulo('Iniciar sesión');
  return <FormularioLogin />;
}
