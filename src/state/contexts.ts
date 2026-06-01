import { createContext } from '@lit/context';
import type { SwaggerXSpec, HistoryEntry, Environment, UIState } from '../core/types.js';

/** Parsed and normalized OpenAPI specification */
export const specContext = createContext<SwaggerXSpec | null>(Symbol('swaggerx-spec'));

/** Request history entries */
export const historyContext = createContext<HistoryEntry[]>(Symbol('swaggerx-history'));

/** Environment variables configuration */
export const envContext = createContext<{
  environments: Environment[];
  activeId: string | null;
}>(Symbol('swaggerx-env'));

/** Global UI state */
export const uiContext = createContext<UIState>(Symbol('swaggerx-ui'));
