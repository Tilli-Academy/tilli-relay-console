import { createContext } from '@lit/context';
import type { RunDocsSpec, HistoryEntry, Environment, UIState } from '../core/types.js';

/** Parsed and normalized OpenAPI specification */
export const specContext = createContext<RunDocsSpec | null>(Symbol('rundocs-spec'));

/** Request history entries */
export const historyContext = createContext<HistoryEntry[]>(Symbol('rundocs-history'));

/** Environment variables configuration */
export const envContext = createContext<{
  environments: Environment[];
  activeId: string | null;
}>(Symbol('rundocs-env'));

/** Global UI state */
export const uiContext = createContext<UIState>(Symbol('rundocs-ui'));
