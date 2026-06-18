import type { Environment } from '../core/types.js';
import { getItem, setItem } from '../utils/local-storage.js';

const ENVS_KEY = 'environments';
const ACTIVE_KEY = 'active-env';

/**
 * Manages environment variables (like Postman environments).
 * Each environment has a name and key-value pairs.
 * One environment can be active at a time.
 * Persisted to localStorage.
 */
export class EnvStore {
  private _environments: Environment[];
  private _activeId: string | null;
  private _listeners = new Set<() => void>();

  constructor() {
    this._environments = getItem<Environment[]>(ENVS_KEY, []);
    this._activeId = getItem<string | null>(ACTIVE_KEY, null);
  }

  get environments(): Environment[] {
    return this._environments;
  }

  get activeId(): string | null {
    return this._activeId;
  }

  get activeEnvironment(): Environment | null {
    if (!this._activeId) return null;
    return this._environments.find((e) => e.id === this._activeId) || null;
  }

  /** Returns the active environment's variables, or empty object if none active */
  get activeVariables(): Record<string, string> {
    return this.activeEnvironment?.variables || {};
  }

  subscribe(listener: () => void): () => void {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  private _notify(): void {
    for (const listener of this._listeners) {
      listener();
    }
  }

  private _persist(): void {
    setItem(ENVS_KEY, this._environments.map(redactEnvValues));
    setItem(ACTIVE_KEY, this._activeId);
  }

  addEnvironment(name: string, variables: Record<string, string> = {}): Environment {
    const env: Environment = {
      id: `env-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name,
      variables,
    };
    this._environments = [...this._environments, env];
    this._persist();
    this._notify();
    return env;
  }

  updateEnvironment(id: string, updates: Partial<Pick<Environment, 'name' | 'variables'>>): void {
    this._environments = this._environments.map((env) => {
      if (env.id !== id) return env;
      return {
        ...env,
        ...(updates.name !== undefined ? { name: updates.name } : {}),
        ...(updates.variables !== undefined ? { variables: updates.variables } : {}),
      };
    });
    this._persist();
    this._notify();
  }

  removeEnvironment(id: string): void {
    this._environments = this._environments.filter((e) => e.id !== id);
    if (this._activeId === id) {
      this._activeId = null;
    }
    this._persist();
    this._notify();
  }

  setActive(id: string | null): void {
    this._activeId = id;
    this._persist();
    this._notify();
  }

  setVariable(envId: string, key: string, value: string): void {
    this._environments = this._environments.map((env) => {
      if (env.id !== envId) return env;
      return {
        ...env,
        variables: { ...env.variables, [key]: value },
      };
    });
    this._persist();
    this._notify();
  }

  removeVariable(envId: string, key: string): void {
    this._environments = this._environments.map((env) => {
      if (env.id !== envId) return env;
      const variables = { ...env.variables };
      delete variables[key];
      return { ...env, variables };
    });
    this._persist();
    this._notify();
  }
}

/** Strip all variable values before writing to localStorage. Names are kept, values set to empty. */
function redactEnvValues(env: Environment): Environment {
  const redactedVars: Record<string, string> = {};
  for (const key of Object.keys(env.variables)) {
    redactedVars[key] = '';
  }
  return { ...env, variables: redactedVars };
}
