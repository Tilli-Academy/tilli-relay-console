/**
 * Auto-registers all SwaggerX custom elements.
 * Call this once to define all web components.
 *
 * Usage:
 *   import { defineSwaggerX } from 'swaggerx';
 *   defineSwaggerX();
 *
 * Then use in HTML:
 *   <swaggerx-app spec-url="/openapi.json"></swaggerx-app>
 */
export function defineSwaggerX(): void {
  // Components will self-register via @customElement decorator when imported.
  // This function ensures all components are imported and registered.

  // App root
  import('./components/app/swaggerx-app.js');

  // Layout
  import('./components/layout/swaggerx-header.js');
  import('./components/layout/swaggerx-sidebar.js');
  import('./components/layout/swaggerx-main.js');
  import('./components/layout/swaggerx-split-pane.js');

  // Navigation
  import('./components/navigation/swaggerx-search.js');
  import('./components/navigation/swaggerx-toc.js');
  import('./components/navigation/swaggerx-tag-group.js');
  import('./components/navigation/swaggerx-endpoint-item.js');

  // Endpoint
  import('./components/endpoint/swaggerx-endpoint.js');
  import('./components/endpoint/swaggerx-method-badge.js');
  import('./components/endpoint/swaggerx-path-display.js');
  import('./components/endpoint/swaggerx-description.js');

  // Schema
  import('./components/schema/swaggerx-schema-view.js');
  import('./components/schema/swaggerx-schema-property.js');

  // Request
  import('./components/request/swaggerx-request-bar.js');
  import('./components/request/swaggerx-params-editor.js');
  import('./components/request/swaggerx-headers-editor.js');
  import('./components/request/swaggerx-auth-editor.js');
  import('./components/request/swaggerx-body-editor.js');
  import('./components/request/swaggerx-send-button.js');
  import('./components/request/swaggerx-request-tabs.js');

  // Response
  import('./components/response/swaggerx-response.js');
  import('./components/response/swaggerx-status-badge.js');
  import('./components/response/swaggerx-response-meta.js');
  import('./components/response/swaggerx-response-headers.js');
  import('./components/response/swaggerx-response-body.js');

  // Code
  import('./components/code/swaggerx-code-block.js');
  import('./components/code/swaggerx-code-samples.js');

  // History
  import('./components/history/swaggerx-history-item.js');
  import('./components/history/swaggerx-history-list.js');

  // Environment
  import('./components/env/swaggerx-env-selector.js');
  import('./components/env/swaggerx-env-manager.js');

  // Shared
  import('./components/shared/swaggerx-icon.js');
  import('./components/shared/swaggerx-tabs.js');
  import('./components/shared/swaggerx-modal.js');
  import('./components/shared/swaggerx-tooltip.js');
  import('./components/shared/swaggerx-copy-button.js');
  import('./components/shared/swaggerx-badge.js');
  import('./components/shared/swaggerx-loading.js');
  import('./components/shared/swaggerx-empty-state.js');
  import('./components/shared/swaggerx-key-value-editor.js');
}
