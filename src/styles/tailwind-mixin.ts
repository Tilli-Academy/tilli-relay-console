import { adoptStyles, unsafeCSS, type LitElement } from 'lit';
import tailwindStyles from './tailwind.global.css?inline';

const sheet = unsafeCSS(tailwindStyles);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T = object> = new (...args: any[]) => T;

/**
 * TW() mixin — enables Tailwind CSS utility classes inside Lit Shadow DOM.
 *
 * Lit components use Shadow DOM which blocks external CSS. This mixin
 * compiles Tailwind at build time and injects the compiled CSS into
 * each component's shadow root via adoptStyles().
 *
 * All components share one CSSStyleSheet reference — no duplication in memory.
 *
 * Usage:
 *   const TwLit = TW(LitElement);
 *
 *   @customElement('my-component')
 *   export class MyComponent extends TwLit { ... }
 */
export const TW = <T extends Constructor<LitElement>>(superClass: T): T =>
  class extends superClass {
    connectedCallback() {
      super.connectedCallback();
      if (this.shadowRoot) {
        adoptStyles(this.shadowRoot, [...(this.shadowRoot.adoptedStyleSheets || []), sheet]);
      }
    }
  } as unknown as T;
