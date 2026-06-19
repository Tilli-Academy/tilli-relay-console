import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { provide } from '@lit/context';
import Fuse from 'fuse.js';
import { lightTheme, darkTheme, baseStyles } from '../../styles/theme.js';
import { specContext, uiContext, historyContext, envContext } from '../../state/contexts.js';
import { UIStore } from '../../state/ui-store.js';
import { HistoryStore } from '../../state/history-store.js';
import { EnvStore } from '../../state/env-store.js';
import { RequestStore } from '../../state/request-store.js';
import { interpolate } from '../../utils/env-interpolator.js';
import { sendRequest } from '../../utils/http-client.js';
import type { RunDocsSpec, UIState, HistoryEntry, Environment, Endpoint, TagGroup, HttpMethod, AuthConfig, RequestState } from '../../core/types.js';
import type { KeyValuePair } from '../shared/rundocs-key-value-editor.js';
import '../layout/rundocs-header.js';
import '../layout/rundocs-split-pane.js';
import '../layout/rundocs-sidebar.js';
import '../layout/rundocs-main.js';
import '../shared/rundocs-loading.js';
import '../shared/rundocs-empty-state.js';
import '../navigation/rundocs-search.js';
import '../navigation/rundocs-toc.js';
import '../navigation/rundocs-tag-group.js';
import '../navigation/rundocs-endpoint-item.js';
import '../endpoint/rundocs-endpoint.js';
import '../history/rundocs-history-list.js';
import '../env/rundocs-env-selector.js';
import '../env/rundocs-env-manager.js';

/**
 * <rundocs-app> — Root component for RunDocs.
 *
 * Accepts a `spec-url` attribute pointing to an OpenAPI spec (JSON or YAML).
 * Parses the spec and renders the full documentation UI.
 *
 * Usage:
 *   <rundocs-app spec-url="/openapi.json"></rundocs-app>
 *   <rundocs-app spec-url="/openapi.yaml" theme="dark"></rundocs-app>
 */
@customElement('rundocs-app')
export class RunDocsApp extends LitElement {
  static override styles = [
    lightTheme,
    darkTheme,
    baseStyles,
    css`
      :host {
        display: block;
        width: 100%;
        height: 100vh;
      }

      .app-container {
        display: flex;
        flex-direction: column;
        height: 100%;
        overflow: hidden;
      }

      .app-body {
        display: flex;
        flex: 1;
        overflow: hidden;
      }

      .center-container {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100%;
        width: 100%;
      }

      .error-message {
        color: var(--sx-error);
        font-size: 0.9375rem;
        text-align: center;
        padding: 24px;
        max-width: 480px;
        line-height: 1.6;
      }
    `,
  ];

  @property({ type: String, attribute: 'spec-url' })
  specUrl = '';

  @property({ type: Object })
  spec: Record<string, unknown> | null = null;

  @property({ type: String, attribute: 'theme' })
  appTheme: 'light' | 'dark' = 'light';

  // Context providers
  @provide({ context: specContext })
  @state()
  private _spec: RunDocsSpec | null = null;

  @provide({ context: uiContext })
  @state()
  private _uiState: UIState;

  @provide({ context: historyContext })
  @state()
  private _historyEntries: HistoryEntry[] = [];

  @provide({ context: envContext })
  @state()
  private _envState: { environments: Environment[]; activeId: string | null };

  @state()
  private _loading = false;

  @state()
  private _error: string | null = null;

  @state()
  private _searchQuery = '';

  @state()
  private _filteredTags: TagGroup[] = [];

  // Stores
  private _uiStore = new UIStore();
  private _historyStore = new HistoryStore();
  private _envStore = new EnvStore();

  // Search index
  private _fuse: Fuse<Endpoint> | null = null;

  // Abort controller for cancelling in-flight spec loads
  private _loadAbort: AbortController | null = null;

  // Per-endpoint request stores
  private _requestStores = new Map<string, RequestStore>();

  // Per-endpoint raw header pairs (preserves empty rows)
  private _headerPairsMap = new Map<string, KeyValuePair[]>();

  // Current request state (for the selected endpoint)
  @state()
  private _requestState: RequestState | null = null;

  // Unsubscribe functions
  private _unsubs: (() => void)[] = [];

  constructor() {
    super();
    this._uiState = this._uiStore.state;
    this._historyEntries = this._historyStore.entries;
    this._envState = {
      environments: this._envStore.environments,
      activeId: this._envStore.activeId,
    };
  }

  override connectedCallback() {
    super.connectedCallback();

    // Sync store changes to context providers
    this._unsubs.push(
      this._uiStore.subscribe(() => {
        this._uiState = this._uiStore.state;
        this.appTheme = this._uiState.theme === 'dark' ? 'dark' : 'light';
      }),
    );
    this._unsubs.push(
      this._historyStore.subscribe(() => {
        this._historyEntries = [...this._historyStore.entries];
      }),
    );
    this._unsubs.push(
      this._envStore.subscribe(() => {
        this._envState = {
          environments: this._envStore.environments,
          activeId: this._envStore.activeId,
        };
      }),
    );

    // Apply initial theme
    this.setAttribute('theme', this.appTheme);
    // Spec loading is handled by updated() — avoids double-load on initial render
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this._loadAbort?.abort();
    for (const unsub of this._unsubs) unsub();
    this._unsubs = [];
    this._clearRequestStores();
  }

  override updated(changedProperties: Map<string, unknown>) {
    if (changedProperties.has('specUrl') && this.specUrl) {
      this._loadSpec();
    }
    if (changedProperties.has('spec') && this.spec) {
      this._loadInlineSpec();
    }
    if (changedProperties.has('appTheme')) {
      this.setAttribute('theme', this.appTheme);
    }
  }

  /** Dispose all per-endpoint request stores so they can be GC'd. */
  private _clearRequestStores() {
    for (const store of this._requestStores.values()) {
      store.dispose();
    }
    this._requestStores.clear();
    this._headerPairsMap.clear();
  }

  private async _loadSpec() {
    this._loadAbort?.abort();
    const controller = new AbortController();
    this._loadAbort = controller;

    this._clearRequestStores();
    this._loading = true;
    this._error = null;
    try {
      const { parseSpec } = await import('../../core/parser.js');
      const { normalize } = await import('../../core/normalizer.js');
      const openApiDoc = await parseSpec(this.specUrl);
      if (controller.signal.aborted) return;
      this._spec = normalize(openApiDoc);
      this._buildSearchIndex();
      this._filteredTags = this._spec.tags;
    } catch (err) {
      if (controller.signal.aborted) return;
      this._error = err instanceof Error ? err.message : 'Failed to load OpenAPI spec';
    } finally {
      if (!controller.signal.aborted) {
        this._loading = false;
      }
    }
  }

  private async _loadInlineSpec() {
    this._loadAbort?.abort();
    const controller = new AbortController();
    this._loadAbort = controller;

    this._clearRequestStores();
    this._loading = true;
    this._error = null;
    try {
      const { normalize } = await import('../../core/normalizer.js');
      const { parseSpec } = await import('../../core/parser.js');
      const openApiDoc = await parseSpec(this.spec!);
      if (controller.signal.aborted) return;
      this._spec = normalize(openApiDoc);
      this._buildSearchIndex();
      this._filteredTags = this._spec.tags;
    } catch (err) {
      if (controller.signal.aborted) return;
      this._error = err instanceof Error ? err.message : 'Failed to parse inline spec';
    } finally {
      if (!controller.signal.aborted) {
        this._loading = false;
      }
    }
  }

  private _buildSearchIndex() {
    if (!this._spec) return;
    this._fuse = new Fuse(this._spec.endpoints, {
      keys: [
        { name: 'path', weight: 0.4 },
        { name: 'summary', weight: 0.3 },
        { name: 'method', weight: 0.15 },
        { name: 'operationId', weight: 0.15 },
      ],
      threshold: 0.4,
      includeScore: true,
    });
  }

  private _onSearch(e: CustomEvent<{ query: string }>) {
    this._searchQuery = e.detail.query;
    if (!this._spec) return;

    if (!this._searchQuery.trim()) {
      this._filteredTags = this._spec.tags;
      return;
    }

    if (!this._fuse) return;

    const results = this._fuse.search(this._searchQuery);
    const matchedIds = new Set(results.map((r) => r.item.id));

    // Filter tags to only include matching endpoints
    this._filteredTags = this._spec.tags
      .map((tag) => ({
        ...tag,
        endpoints: tag.endpoints.filter((ep) => matchedIds.has(ep.id)),
      }))
      .filter((tag) => tag.endpoints.length > 0);
  }

  private _onThemeToggle() {
    this._uiStore.setTheme(this.appTheme === 'light' ? 'dark' : 'light');
  }

  private _onSidebarToggle() {
    this._uiStore.toggleSidebar();
  }

  private _onPanelChange(e: CustomEvent<{ panel: 'endpoints' | 'history' }>) {
    this._uiStore.setSidebarPanel(e.detail.panel);
  }

  private _onRatioChange(e: CustomEvent<{ ratio: number }>) {
    this._uiStore.setSplitRatio(e.detail.ratio);
  }

  private _onEndpointSelect(e: CustomEvent<{ endpointId: string }>) {
    this._uiStore.selectEndpoint(e.detail.endpointId);
    this._syncRequestState();
  }

  private get _selectedEndpoint(): Endpoint | null {
    if (!this._spec || !this._uiState.selectedEndpointId) return null;
    return this._spec.endpoints.find((ep) => ep.id === this._uiState.selectedEndpointId) ?? null;
  }

  private _getOrCreateRequestStore(endpoint: Endpoint): RequestStore {
    let store = this._requestStores.get(endpoint.id);
    if (!store) {
      const baseUrl = this._spec?.servers[0]?.url ?? '';
      const fullUrl = `${baseUrl}${endpoint.path}`;
      store = new RequestStore(endpoint.method, fullUrl);
      // Pre-fill body with {} for endpoints that accept a request body
      if (endpoint.requestBody) {
        store.setBody('{}');
      }
      this._requestStores.set(endpoint.id, store);

      // Subscribe to state changes
      const unsub = store.subscribe(() => {
        if (this._uiState.selectedEndpointId === endpoint.id) {
          this._requestState = { ...store!.state };
        }
      });
      this._unsubs.push(unsub);
    }
    return store;
  }

  private _syncRequestState() {
    const ep = this._selectedEndpoint;
    if (ep) {
      const store = this._getOrCreateRequestStore(ep);
      this._requestState = { ...store.state };
    } else {
      this._requestState = null;
    }
  }

  private _getHeaderPairs(): KeyValuePair[] {
    const ep = this._selectedEndpoint;
    if (!ep) return [];
    return this._headerPairsMap.get(ep.id) ?? [];
  }

  private _onMethodChange(e: CustomEvent<{ method: HttpMethod }>) {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    this._getOrCreateRequestStore(ep).setMethod(e.detail.method);
  }

  private _onUrlChange(e: CustomEvent<{ url: string }>) {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    this._getOrCreateRequestStore(ep).setUrl(e.detail.url);
  }

  private _onParamChange(e: CustomEvent<{ name: string; value: string; paramIn: string }>) {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    const store = this._getOrCreateRequestStore(ep);
    if (e.detail.paramIn === 'path') {
      store.setPathParam(e.detail.name, e.detail.value);
    } else {
      store.setQueryParam(e.detail.name, e.detail.value);
    }
  }

  private _onHeadersChange(e: CustomEvent<{ headers: Record<string, string>; pairs: KeyValuePair[] }>) {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    const store = this._getOrCreateRequestStore(ep);

    // Save raw pairs (preserves empty rows)
    this._headerPairsMap.set(ep.id, e.detail.pairs);

    // Update store with non-empty headers for actual requests
    const state = store.state;
    for (const key of Object.keys(state.headers)) {
      store.removeHeader(key);
    }
    for (const [key, value] of Object.entries(e.detail.headers)) {
      store.setHeader(key, value);
    }
  }

  private _onAuthChange(e: CustomEvent<{ auth: AuthConfig }>) {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    this._getOrCreateRequestStore(ep).setAuth(e.detail.auth);
  }

  private _onBodyChange(e: CustomEvent<{ body: string }>) {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    this._getOrCreateRequestStore(ep).setBody(e.detail.body);
  }

  private _onContentTypeChange(e: CustomEvent<{ contentType: string }>) {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    this._getOrCreateRequestStore(ep).setContentType(e.detail.contentType);
  }

  private async _onSendRequest() {
    const ep = this._selectedEndpoint;
    if (!ep) return;
    const store = this._getOrCreateRequestStore(ep);
    const state = store.state;

    if (state.loading) return;
    store.setLoading(true);

    // Get env variables for interpolation
    const envVars = this._getActiveEnvVars();

    // Use the URL bar text as source of truth (supports {{env_var}} placeholders)
    let url = state.url;

    // Replace path parameters ({paramName} → value)
    for (const [name, value] of Object.entries(state.pathParams)) {
      if (value) {
        url = url.replace(new RegExp(`\\{${name}\\}`, 'g'), encodeURIComponent(value));
      }
    }

    // Append query parameters
    const queryEntries = Object.entries(state.queryParams).filter(([, v]) => v !== '');
    if (queryEntries.length > 0) {
      const params = new URLSearchParams();
      for (const [key, value] of queryEntries) {
        params.set(key, value);
      }
      url += (url.includes('?') ? '&' : '?') + params.toString();
    }

    // Interpolate environment variables ({{var}} → value)
    const finalUrl = interpolate(url, envVars);

    // Interpolate headers
    const interpolatedHeaders: Record<string, string> = {};
    for (const [k, v] of Object.entries(state.headers)) {
      interpolatedHeaders[interpolate(k, envVars)] = interpolate(v, envVars);
    }

    // Interpolate auth fields
    const interpolatedAuth: AuthConfig = {
      ...state.auth,
      token: state.auth.token ? interpolate(state.auth.token, envVars) : state.auth.token,
      username: state.auth.username ? interpolate(state.auth.username, envVars) : state.auth.username,
      password: state.auth.password ? interpolate(state.auth.password, envVars) : state.auth.password,
      apiKeyName: state.auth.apiKeyName ? interpolate(state.auth.apiKeyName, envVars) : state.auth.apiKeyName,
      apiKeyValue: state.auth.apiKeyValue ? interpolate(state.auth.apiKeyValue, envVars) : state.auth.apiKeyValue,
    };

    const response = await sendRequest({
      method: state.method,
      url: finalUrl,
      headers: interpolatedHeaders,
      body: interpolate(state.body, envVars),
      contentType: state.contentType,
      auth: interpolatedAuth,
    });

    store.setResponse(response);

    // Save to history
    this._historyStore.add({
      endpointId: ep.id,
      method: state.method,
      url: finalUrl,
      headers: interpolatedHeaders,
      body: state.body,
      auth: state.auth,
      pathParams: state.pathParams,
      queryParams: state.queryParams,
      response,
    });
  }

  // History events
  private _onHistorySelect(e: CustomEvent<{ id: string }>) {
    const entry = this._historyEntries.find((h) => h.id === e.detail.id);
    if (!entry) return;
    // Select the endpoint and highlight the history item
    this._uiStore.selectEndpoint(entry.endpointId);
    this._uiStore.selectHistoryEntry(entry.id);
    this._syncRequestState();

    // Restore saved request and response from history
    const ep = this._selectedEndpoint;
    if (ep) {
      const store = this._getOrCreateRequestStore(ep);
      if (entry.request.body) store.setBody(entry.request.body);
      store.setAuth(entry.request.auth ?? { type: 'none' });
      // Restore path and query params
      if (entry.request.pathParams) {
        for (const [name, value] of Object.entries(entry.request.pathParams)) {
          store.setPathParam(name, value);
        }
      }
      if (entry.request.queryParams) {
        for (const [name, value] of Object.entries(entry.request.queryParams)) {
          store.setQueryParam(name, value);
        }
      }
      if (entry.response) store.setResponse(entry.response);
      this._requestState = { ...store.state };
    }
  }

  private _onHistoryRemove(e: CustomEvent<{ id: string }>) {
    this._historyStore.remove(e.detail.id);
  }

  private _onHistoryClear() {
    this._historyStore.clear();
  }

  // Environment events
  @state()
  private _envManagerOpen = false;

  private _onEnvSelect(e: CustomEvent<{ id: string | null }>) {
    this._envStore.setActive(e.detail.id);
  }

  private _onEnvManage() {
    this._envManagerOpen = true;
  }

  private _onEnvManagerClose() {
    this._envManagerOpen = false;
  }

  private _onEnvAdd(e: CustomEvent<{ name: string }>) {
    this._envStore.addEnvironment(e.detail.name);
  }

  private _onEnvRemove(e: CustomEvent<{ id: string }>) {
    this._envStore.removeEnvironment(e.detail.id);
  }

  private _onEnvUpdate(e: CustomEvent<{ id: string; variables?: Record<string, string> }>) {
    if (e.detail.variables !== undefined) {
      this._envStore.updateEnvironment(e.detail.id, { variables: e.detail.variables });
    }
  }

  private _getActiveEnvVars(): Record<string, string> {
    if (!this._envState.activeId) return {};
    const env = this._envState.environments.find((e) => e.id === this._envState.activeId);
    return env?.variables ?? {};
  }

  override render() {
    if (this._loading) {
      return html`
        <div class="center-container" aria-busy="true">
          <rundocs-loading size="large" message="Loading API specification..."></rundocs-loading>
        </div>
      `;
    }

    if (this._error) {
      return html`
        <div class="center-container">
          <div class="error-message" role="alert">${this._error}</div>
        </div>
      `;
    }

    if (!this._spec) {
      return html`
        <div class="center-container">
          <rundocs-empty-state
            icon="globe"
            title="No API Specification"
            description="Provide a spec-url attribute pointing to your OpenAPI JSON or YAML file."
          ></rundocs-empty-state>
        </div>
      `;
    }

    return html`
      <div class="app-container">
        <rundocs-header
          api-title=${this._spec.info.title}
          api-version=${this._spec.info.version}
          theme=${this.appTheme}
          @theme-toggle=${this._onThemeToggle}
          @sidebar-toggle=${this._onSidebarToggle}
        >
          <rundocs-env-selector
            slot="actions"
            .environments=${this._envState.environments}
            active-id=${this._envState.activeId ?? ''}
            @env-select=${this._onEnvSelect}
            @env-manage=${this._onEnvManage}
          ></rundocs-env-selector>
        </rundocs-header>
        <div class="app-body">
          <rundocs-split-pane
            ratio=${this._uiState.splitRatio}
            ?collapsed=${this._uiState.sidebarCollapsed}
            @ratio-change=${this._onRatioChange}
          >
            <rundocs-sidebar
              slot="left"
              activePanel=${this._uiState.activeSidebarPanel}
              @panel-change=${this._onPanelChange}
            >
              <div slot="endpoints">
                <rundocs-search
                  @search-input=${this._onSearch}
                ></rundocs-search>
                <rundocs-toc
                  .info=${this._spec.info}
                  .servers=${this._spec.servers}
                ></rundocs-toc>
                ${this._filteredTags.length > 0
                  ? this._filteredTags.map(
                      (tag) => html`
                        <rundocs-tag-group
                          name=${tag.name}
                          count=${tag.endpoints.length}
                          description=${tag.description ?? ''}
                        >
                          ${tag.endpoints.map(
                            (ep) => html`
                              <rundocs-endpoint-item
                                endpoint-id=${ep.id}
                                method=${ep.method}
                                path=${ep.path}
                                summary=${ep.summary}
                                ?deprecated=${ep.deprecated}
                                ?secured=${ep.security.length > 0}
                                ?selected=${this._uiState.selectedEndpointId === ep.id}
                                @endpoint-select=${this._onEndpointSelect}
                              ></rundocs-endpoint-item>
                            `,
                          )}
                        </rundocs-tag-group>
                      `,
                    )
                  : html`
                      <rundocs-empty-state
                        icon="search"
                        title="No results"
                        description="No endpoints match your search."
                      ></rundocs-empty-state>
                    `}
              </div>
              <div slot="history"
                @history-select=${this._onHistorySelect}
                @history-remove=${this._onHistoryRemove}
                @history-clear=${this._onHistoryClear}
              >
                <rundocs-history-list
                  .entries=${this._historyEntries}
                  .selectedId=${this._uiState.selectedHistoryId}
                ></rundocs-history-list>
              </div>
            </rundocs-sidebar>
            <rundocs-main slot="right"
              @method-change=${this._onMethodChange}
              @url-change=${this._onUrlChange}
              @param-change=${this._onParamChange}
              @headers-change=${this._onHeadersChange}
              @auth-change=${this._onAuthChange}
              @body-change=${this._onBodyChange}
              @content-type-change=${this._onContentTypeChange}
              @send-request=${this._onSendRequest}
            >
              ${this._selectedEndpoint && this._requestState
                ? html`<rundocs-endpoint
                    .endpoint=${this._selectedEndpoint}
                    .requestMethod=${this._requestState.method}
                    .requestUrl=${this._requestState.url}
                    .pathValues=${this._requestState.pathParams}
                    .queryValues=${this._requestState.queryParams}
                    .headerPairs=${this._getHeaderPairs()}
                    .auth=${this._requestState.auth}
                    .requestBody=${this._requestState.body}
                    .contentType=${this._requestState.contentType}
                    ?requestLoading=${this._requestState.loading}
                    .response=${this._requestState.response}
                    base-url=${this._spec?.servers[0]?.url ?? ''}
                    .envVars=${this._getActiveEnvVars()}
                  ></rundocs-endpoint>`
                : this._selectedEndpoint
                  ? html`<rundocs-endpoint
                      .endpoint=${this._selectedEndpoint}
                      base-url=${this._spec?.servers[0]?.url ?? ''}
                      .envVars=${this._getActiveEnvVars()}
                    ></rundocs-endpoint>`
                  : html`
                      <rundocs-empty-state
                        icon="send"
                        title="Select an Endpoint"
                        description="Choose an endpoint from the sidebar to view its documentation and send requests."
                      ></rundocs-empty-state>
                    `}
            </rundocs-main>
          </rundocs-split-pane>
        </div>
        <rundocs-env-manager
          ?open=${this._envManagerOpen}
          .environments=${this._envState.environments}
          @env-add=${this._onEnvAdd}
          @env-remove=${this._onEnvRemove}
          @env-update=${this._onEnvUpdate}
          @env-close=${this._onEnvManagerClose}
        ></rundocs-env-manager>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-app': RunDocsApp;
  }
}
