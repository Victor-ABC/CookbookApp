/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./cookbook-preview.component.scss');

@customElement('app-cookbook-preview')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookPreviewComponent extends LitElement {
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

  @property({ attribute: 'data-own-cookbooks', type: String })
  ownCookbooks!: string;

  render() {
    return html`
      <span class="book-id" data-id="${this.bookId}"><slot name="title"></slot></span>
      <span class="show-details" @click="${() => this.emit('appcookbookdetailsclick')}"></span>
      ${this.ownCookbooks === 'true'
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
