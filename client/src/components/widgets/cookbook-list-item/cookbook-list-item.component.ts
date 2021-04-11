/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { WidgetMixin } from '../../widget.mixin';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./cookbook-list-item.component.scss');

@customElement('app-cookbook-list-item')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookListItemComponent extends WidgetMixin(LitElement) {
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
      <input type="checkbox" id="toggle-body" />
      <div class="header">
        <span class="title" @click="${() => this.emit('appcookbookdetailsclick')}">
          <slot name="title"></slot>
        </span>
        <label for="toggle-body"></label>
        ${this.ownCookbooks === 'true'
          ? html`<span class="remove-cookbook" @click="${() => this.emit('appcookbookdeleteclick')}"></span>`
          : nothing}
      </div>
      <div class="body">
        <slot name="description"></slot>
      </div>
    `;
  }
}
