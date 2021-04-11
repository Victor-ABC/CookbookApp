/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { WidgetMixin } from '../../widget.mixin';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./cookbook-details.component.scss');

@customElement('app-cookbook-details')
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

  @property({ attribute: 'data-own-cookbooks', type: String })
  ownCookbooks!: string;

  render() {
    return html`
      <div class="item">
        <img src="https://picsum.photos/400/300" />
        <span class="title" @click="${() => this.emit('appcookbookopenclick')}">
          <slot name="title"></slot>
        </span>
        ${this.ownCookbooks === 'true'
          ? html`<span class="remove-recipe" @click="${() => this.emit('appcookbookdeleteclick')}"></span>`
          : nothing}
        <span class="description" @click="${() => this.emit('appcookbookopenclick')}">
          <slot name="description"></slot>
        </span>
      </div>
    `;
  }
}
