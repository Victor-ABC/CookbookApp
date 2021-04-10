/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { WidgetMixin } from '../../widget.mixin';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./cookbook-preview.component.scss');

@customElement('app-cookbook-preview')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookPreviewComponent extends WidgetMixin(LitElement) {
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
      <span class="book-id" @click="${() => this.emit('appcookbookdetailsclick')}"><slot name="title"></slot></span>
      ${this.ownCookbooks === 'true'
        ? html`<span class="remove-cookbook" @click="${() => this.emit('appcookbookdeleteclick')}"></span>`
        : nothing}
    `;
  }
}
