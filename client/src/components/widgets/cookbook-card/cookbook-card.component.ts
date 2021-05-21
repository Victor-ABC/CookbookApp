/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { WidgetMixin } from '../../widget.mixin';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./cookbook-card.component.scss');

@customElement('app-cookbook-card')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookDetailsComponent extends WidgetMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @property({ attribute: 'data-own-cookbooks', type: Boolean })
  ownCookbooks!: string;

  render() {
    return html`
      <div class="item">
        <slot name="image"></slot>
        <span class="title" @click="${() => this.emit('appcookbookopenclick')}">
          <slot name="title"></slot>
        </span>
        ${this.ownCookbooks
          ? html`<span class="remove-recipe" @click="${() => this.emit('appcookbookdeleteclick')}"></span>`
          : nothing}
        <slot name="description" @click="${() => this.emit('appcookbookopenclick')}"></slot>
      </div>
    `;
  }
}
