/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./cookbook-details.component.scss');

@customElement('app-cookbook-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookDetailsComponent extends LitElement {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @property({ attribute: 'data-own-cookbooks', type: String })
  ownCookbooks!: string;

  render() {
    return html`
      <div class="item">
        <img src="https://picsum.photos/400/300" />
        <span class="recipe-id" @click="${() => this.emit('appcookbookopenclick')}">
          <slot name="title"></slot>
        </span>
        <span class="description" @click="${() => this.emit('appcookbookopenclick')}">
          <slot name="description"></slot>
        </span>
        ${this.ownCookbooks === 'true'
          ? html`<span class="remove-recipe" @click="${() => this.emit('appcookbookdeleteclick')}"></span>`
          : nothing}
      </div>
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
