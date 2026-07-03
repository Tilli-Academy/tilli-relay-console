import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the parser and normalizer
vi.mock('../../../src/core/parser.js', () => ({
  parseSpec: vi.fn(),
}));

vi.mock('../../../src/core/normalizer.js', () => ({
  normalize: vi.fn(),
}));

import { SpecStore } from '../../../src/state/spec-store.js';
import { parseSpec } from '../../../src/core/parser.js';
import { normalize } from '../../../src/core/normalizer.js';
import type { RunDocsSpec } from '../../../src/core/types.js';

const mockParseSpec = vi.mocked(parseSpec);
const mockNormalize = vi.mocked(normalize);

const MOCK_SPEC: RunDocsSpec = {
  info: { title: 'Petstore', version: '1.0.0' },
  servers: [{ url: 'https://api.example.com' }],
  tags: [],
  endpoints: [],
  securitySchemes: {},
  schemas: {},
};

describe('SpecStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with null spec and no loading/error', () => {
    const store = new SpecStore();

    expect(store.spec).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('loads and normalizes spec successfully', async () => {
    mockParseSpec.mockResolvedValue({ openapi: '3.0.0' });
    mockNormalize.mockReturnValue(MOCK_SPEC);

    const store = new SpecStore();
    await store.loadSpec('https://api.example.com/openapi.json');

    expect(mockParseSpec).toHaveBeenCalledWith('https://api.example.com/openapi.json');
    expect(mockNormalize).toHaveBeenCalledWith({ openapi: '3.0.0' });
    expect(store.spec).toEqual(MOCK_SPEC);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('sets loading state during spec load', async () => {
    const states: { loading: boolean; error: string | null }[] = [];

    // Make parseSpec hang until we resolve it
    let resolveParser!: (value: Record<string, unknown>) => void;
    mockParseSpec.mockImplementation(
      () => new Promise((resolve) => { resolveParser = resolve; }),
    );
    mockNormalize.mockReturnValue(MOCK_SPEC);

    const store = new SpecStore();
    store.subscribe(() => {
      states.push({ loading: store.loading, error: store.error });
    });

    const loadPromise = store.loadSpec('spec.json');

    // After starting, should be loading
    expect(states[0]).toEqual({ loading: true, error: null });

    // Resolve the parser
    resolveParser({ openapi: '3.0.0' });
    await loadPromise;

    // After finishing, should not be loading
    expect(states[1]).toEqual({ loading: false, error: null });
  });

  it('handles parse errors', async () => {
    mockParseSpec.mockRejectedValue(new Error('Invalid spec: missing openapi field'));

    const store = new SpecStore();
    await store.loadSpec('invalid-spec.json');

    expect(store.spec).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBe('Invalid spec: missing openapi field');
  });

  it('handles non-Error exceptions', async () => {
    mockParseSpec.mockRejectedValue('string error');

    const store = new SpecStore();
    await store.loadSpec('bad-spec.json');

    expect(store.error).toBe('Failed to load spec');
  });

  it('clears previous error on new load', async () => {
    mockParseSpec.mockRejectedValueOnce(new Error('First error'));

    const store = new SpecStore();
    await store.loadSpec('bad-spec.json');
    expect(store.error).toBe('First error');

    mockParseSpec.mockResolvedValueOnce({ openapi: '3.0.0' });
    mockNormalize.mockReturnValue(MOCK_SPEC);

    await store.loadSpec('good-spec.json');
    expect(store.error).toBeNull();
    expect(store.spec).toEqual(MOCK_SPEC);
  });

  it('resets to initial state', async () => {
    mockParseSpec.mockResolvedValue({ openapi: '3.0.0' });
    mockNormalize.mockReturnValue(MOCK_SPEC);

    const store = new SpecStore();
    await store.loadSpec('spec.json');
    expect(store.spec).not.toBeNull();

    store.reset();

    expect(store.spec).toBeNull();
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });

  it('notifies listeners on loadSpec', async () => {
    mockParseSpec.mockResolvedValue({ openapi: '3.0.0' });
    mockNormalize.mockReturnValue(MOCK_SPEC);

    const store = new SpecStore();
    const listener = vi.fn();
    store.subscribe(listener);

    await store.loadSpec('spec.json');

    // Called twice: once for loading=true, once for loading=false
    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('notifies listeners on reset', () => {
    const store = new SpecStore();
    const listener = vi.fn();
    store.subscribe(listener);

    store.reset();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribes listener', async () => {
    mockParseSpec.mockResolvedValue({ openapi: '3.0.0' });
    mockNormalize.mockReturnValue(MOCK_SPEC);

    const store = new SpecStore();
    const listener = vi.fn();
    const unsub = store.subscribe(listener);
    unsub();

    await store.loadSpec('spec.json');

    expect(listener).not.toHaveBeenCalled();
  });
});
