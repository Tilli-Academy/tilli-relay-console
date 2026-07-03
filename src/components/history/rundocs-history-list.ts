import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { baseStyles } from '../../styles/theme.js';
import '../shared/rundocs-icon.js';
import '../shared/rundocs-empty-state.js';
import './rundocs-history-item.js';
import type { HistoryEntry } from '../../core/types.js';

/**
 * <rundocs-history-list> — Displays a list of request history entries grouped by date.
 *
 * Groups: Today, Yesterday, Last 7 Days, Older.
 *
 * Fires:
 *   - `history-select` with { id }
 *   - `history-remove` with { id }
 *   - `history-clear`
 */
@customElement('rundocs-history-list')
export class RunDocsHistoryList extends LitElement {
  static override styles = [
    baseStyles,
    css`
      :host {
        display: block;
      }

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-bottom: 1px solid var(--sx-border);
      }

      .title {
        font-size: 0.75rem;
        font-weight: 600;
        color: var(--sx-text-secondary);
      }

      .clear-btn {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        border: none;
        background: none;
        color: var(--sx-text-muted);
        cursor: pointer;
        font-size: 0.6875rem;
        font-family: inherit;
        border-radius: 4px;
      }

      .clear-btn:hover {
        color: var(--sx-error);
        background: var(--sx-surface-tertiary);
      }

      .list {
        padding: 4px 0;
      }

      .date-group-label {
        padding: 6px 12px;
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--sx-text-secondary);
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border-top: 1px solid var(--sx-border-subtle);
        background: var(--sx-surface-group-header);
      }

      .date-group-label:first-child {
        border-top: none;
      }
    `,
  ];

  @property({ type: Array })
  entries: HistoryEntry[] = [];

  @property({ type: String })
  selectedId: string | null = null;

  private _getDateLabel(timestamp: number): string {
    const now = new Date();
    const date = new Date(timestamp);

    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const yesterdayStart = todayStart - 86400000;
    const weekStart = todayStart - 6 * 86400000;

    if (timestamp >= todayStart) return 'Today';
    if (timestamp >= yesterdayStart) return 'Yesterday';
    if (timestamp >= weekStart) return 'Last 7 Days';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }

  private _groupEntries(): Array<{ label: string; entries: HistoryEntry[] }> {
    const groups = new Map<string, HistoryEntry[]>();

    for (const entry of this.entries) {
      const label = this._getDateLabel(entry.timestamp);
      if (!groups.has(label)) {
        groups.set(label, []);
      }
      groups.get(label)!.push(entry);
    }

    return Array.from(groups.entries()).map(([label, entries]) => ({ label, entries }));
  }

  private _onClear() {
    this.dispatchEvent(new CustomEvent('history-clear', { bubbles: true, composed: true }));
  }

  override render() {
    if (this.entries.length === 0) {
      return html`
        <rundocs-empty-state
          icon="clock"
          title="No history yet"
          description="Send a request to see it here."
        ></rundocs-empty-state>
      `;
    }

    const groups = this._groupEntries();

    return html`
      <div class="header">
        <span class="title">${this.entries.length} requests</span>
        <button class="clear-btn" @click=${this._onClear}>
          <rundocs-icon name="trash" size=${12}></rundocs-icon>
          Clear
        </button>
      </div>
      <div class="list">
        ${groups.map(
          (group) => html`
            <div class="date-group-label">${group.label}</div>
            ${group.entries.map(
              (entry) => html`
                <rundocs-history-item
                  historyId=${entry.id}
                  method=${entry.method}
                  url=${entry.url}
                  status=${entry.response.status}
                  timestamp=${entry.timestamp}
                  ?selected=${this.selectedId === entry.id}
                ></rundocs-history-item>
              `,
            )}
          `,
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'rundocs-history-list': RunDocsHistoryList;
  }
}
