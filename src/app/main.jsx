import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/fuentes.css';
import './styles/tailwind.css';
import './styles/tokens.css';
import './styles/global.css';

// La web ya no usa service workers. Si quedó registrado el de los mocks (MSW) de antes, se da de baja
// para que no responda con datos simulados viejos.
navigator.serviceWorker?.getRegistrations().then((registros) => registros.forEach((r) => r.unregister()));

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
