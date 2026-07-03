/**
 * Auto-registers all RunDocs custom elements.
 * Call this once to define all web components.
 *
 * Usage:
 *   import { defineRunDocs } from 'rundocs';
 *   defineRunDocs();
 *
 * Then use in HTML:
 *   <rundocs-app spec-url="/openapi.json"></rundocs-app>
 */
export function defineRunDocs(): void {
  // Components will self-register via @customElement decorator when imported.
  // This function ensures all components are imported and registered.

  // App root
  import('./components/app/rundocs-app.js');

  // Layout
  import('./components/layout/rundocs-header.js');
  import('./components/layout/rundocs-sidebar.js');
  import('./components/layout/rundocs-main.js');
  import('./components/layout/rundocs-split-pane.js');

  // Navigation
  import('./components/navigation/rundocs-search.js');
  import('./components/navigation/rundocs-toc.js');
  import('./components/navigation/rundocs-tag-group.js');
  import('./components/navigation/rundocs-endpoint-item.js');

  // Endpoint
  import('./components/endpoint/rundocs-endpoint.js');
  import('./components/endpoint/rundocs-method-badge.js');
  import('./components/endpoint/rundocs-path-display.js');
  import('./components/endpoint/rundocs-description.js');

  // Schema
  import('./components/schema/rundocs-schema-view.js');
  import('./components/schema/rundocs-schema-property.js');

  // Request
  import('./components/request/rundocs-request-bar.js');
  import('./components/request/rundocs-params-editor.js');
  import('./components/request/rundocs-headers-editor.js');
  import('./components/request/rundocs-auth-editor.js');
  import('./components/request/rundocs-body-editor.js');
  import('./components/request/rundocs-send-button.js');
  import('./components/request/rundocs-request-tabs.js');

  // Response
  import('./components/response/rundocs-response.js');
  import('./components/response/rundocs-status-badge.js');
  import('./components/response/rundocs-response-meta.js');
  import('./components/response/rundocs-response-headers.js');
  import('./components/response/rundocs-response-body.js');

  // Code
  import('./components/code/rundocs-code-block.js');
  import('./components/code/rundocs-code-samples.js');

  // History
  import('./components/history/rundocs-history-item.js');
  import('./components/history/rundocs-history-list.js');

  // Environment
  import('./components/env/rundocs-env-selector.js');
  import('./components/env/rundocs-env-manager.js');

  // Shared
  import('./components/shared/rundocs-icon.js');
  import('./components/shared/rundocs-tabs.js');
  import('./components/shared/rundocs-modal.js');
  import('./components/shared/rundocs-tooltip.js');
  import('./components/shared/rundocs-copy-button.js');
  import('./components/shared/rundocs-badge.js');
  import('./components/shared/rundocs-loading.js');
  import('./components/shared/rundocs-empty-state.js');
  import('./components/shared/rundocs-key-value-editor.js');
}
