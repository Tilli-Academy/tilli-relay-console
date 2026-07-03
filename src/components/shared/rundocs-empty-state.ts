import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import './rundocs-icon.js';

/**
 * <rundocs-empty-state> — Placeholder for empty lists / no-data views.
 *
 * Usage:
 *   <rundocs-empty-state
 *     icon="clock"
 *     title="No history yet"
 *     description="Send a request to see it here."
 *   ></rundocs-empty-state>
 */
@customElement('rundocs-empty-state')
export class RunDocsEmptyState extends LitElement {
  static override styles = css`
    :host {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
      text-align: center;
      gap: 12px;
    }

    .icon {
      color: var(--sx-text-muted);
    }

    .title {
      font-size: 0.9375rem;
      font-weight: 600;
      color: var(--sx-text-primary);
      margin: 0;
    }

    .description {
      font-size: 0.8125rem;
      color: var(--sx-text-secondary);
      margin: 0;
      max-width: 280px;
      line-height: 1.5;
    }
  `;

  @property({ type: String })
  icon = '';

  @property({ type: String })
  title = '';

  @property({ type: String })
  description = '';

  override render() {
    return html`
      ${this.icon
        ? html`<div class="icon"><rundocs-icon name=${this.icon} size=${40}></rundocs-icon></div>`
        : ''}
      ${this.title ? html`<p class="title">${this.title}</p>` : ''}
      ${this.description ? html`<p class="description">${this.description}</p>` : ''}
      <slot></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-empty-state': RunDocsEmptyState;
  }
}
