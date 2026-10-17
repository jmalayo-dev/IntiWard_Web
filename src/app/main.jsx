import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { registrarAlFallarGateway } from '@/shared/api';
import { App } from './App';
import './styles/fuentes.css';
import './styles/tailwind.css';
import './styles/tokens.css';
import './styles/global.css';

async function encenderMocks() {
  const { worker, hayMocks } = await import('@/shared/mocks/browser');
  if (!hayMocks) return;
  const opciones = { onUnhandledRequest: 'bypass', quiet: true };
  await worker.start({ ...opciones, quiet: false });

  // Chrome apaga el service worker cuando la pestaña queda en segundo plano; al volver, MSW ya no
  // reconoce la página y las peticiones se escapan al proxy (502). Se reactiva al volver a la pestaña
  // y, por si acaso, ante un 502 sin cuerpo (http.js reintenta la petición una vez).
  const reactivar = async () => {
    worker.stop();
    await worker.start(opciones);
  };
  document.addEventListener('visibilitychange', () => document.visibilityState === 'visible' && reactivar());
  registrarAlFallarGateway(reactivar);
}

// En build (import.meta.env.DEV = false) Vite descarta el import: los mocks nunca llegan a producción
const mocks = import.meta.env.DEV ? encenderMocks() : Promise.resolve();

mocks.then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
