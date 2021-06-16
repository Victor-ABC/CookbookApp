/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { LitElement, internalProperty, html } from 'lit-element';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PageMixin = <T extends new (...args: any[]) => LitElement>(base: T) => {
  class Page extends base {
    @internalProperty()
    private errorMessage = '';

    @internalProperty()
    private infoMessage = '';

    @internalProperty()
    private successMessage = '';

    private onDestroyCallbacks: (() => void)[] = [];

    disconnectedCallback() {
      super.disconnectedCallback();
      this.onDestroyCallbacks.forEach((callback: () => void) => callback());
    }

    protected callOnDestroy(callback: () => void) {
      this.onDestroyCallbacks.push(callback);
    }

    protected renderNotification() {
      return html`
        <app-notification
          error="${this.errorMessage}"
          success="${this.successMessage}"
          info="${this.infoMessage}"
        ></app-notification>
      `;
    }

    protected setNotification({ errorMessage = '', infoMessage = '', successMessage = '' }) {
      console.log("pmsn: " + errorMessage);
      this.successMessage = successMessage;
      this.errorMessage = errorMessage;
      this.infoMessage = infoMessage;
      if (errorMessage || infoMessage || successMessage) {
        setTimeout(() => this.setNotification({}), 3000);
      }
    }
  }

  return Page;
};
