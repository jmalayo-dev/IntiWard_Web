import { setupWorker } from 'msw/browser';
import { SERVICIOS_MOCK } from '@/shared/config/env';
import * as handlers from './handlers';

const activos = SERVICIOS_MOCK.flatMap((servicio) => handlers[servicio] ?? []);

export const worker = setupWorker(...activos);
export const hayMocks = activos.length > 0;
