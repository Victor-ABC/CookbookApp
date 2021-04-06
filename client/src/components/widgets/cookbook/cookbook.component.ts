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

  @property({ attribute: 'data-id', type: String })
  bookId!: string;

  @property({ attribute: 'data-own-cookbooks', type: Boolean })
  ownCookbooks!: boolean;

  render() {
    return html`
      <span class="book-id" data-id="${this.bookId}"><slot name="title"></slot></span>
      <span class="show-details" @click="${() => this.emit('appcookbookdetailsclick')}"></span>
      ${this.ownCookbooks
        ? html`<span class="remove-cookbook" @click="${() => this.emit('appcookbookdeleteclick')}"></span>`
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
