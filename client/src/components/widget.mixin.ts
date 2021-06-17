/* Autor: Felix Schaphaus */

import { LitElement } from 'lit-element';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const WidgetMixin = <T extends new (...args: any[]) => LitElement>(base: T) => {
  class Widget extends base {
    protected emit(eventType: string, eventData = {}) {
      const event = new CustomEvent(eventType, {
        detail: eventData,
        bubbles: true,
        composed: true
      });
      this.dispatchEvent(event);
    }
  }

  return Widget;
};
