/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./cookbook.component.scss');

@customElement('app-cookbook')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookComponent extends LitElement {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @property({ attribute: 'data-id', type: String }) bookId = '';

  render() {
    return html`
      <span data-id="${this.bookId}"><slot name="title"></slot></span>
      <button class="btn btn-sm btn-info" @click="${() => this.emit('appcookbookdetailsclick')}">Details</button>
      ${location.pathname !== '/app/cookbooks/all'
        ? html`<button class="btn btn-sm btn-danger" @click="${() => this.emit('appcookbookdeleteclick')}">
            Entfernen
          </button>`
        : nothing}
    `;
  }

  emit(eventType: string, eventData = {}) {
    const event = new CustomEvent(eventType, {
      detail: eventData,
      bubbles: true,
      composed: true
    });
    this.dispatchEvent(event);
  }
}
