/* Autor: Arne Hegemann */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { WidgetMixin } from '../../widget.mixin';

const sharedCSS = require('../../shared.scss');
const componentCSS = require('./recipe-list-item.component.scss');

@customElement('app-recipe-list-item')
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

  render() {
    return html`
      <div class="row" @click="${() => this.emit('apprecipedetailsclick')}">
        <div class="col-lg-2">
          <div class="image">
            <slot name="image"></slot>
          </div>
        </div>
        <div class="col-lg-10">
          <div class="header">
            <slot name="title"></slot>
            <label for="toggle-body"></label>
          </div>
          <div class="body">
            <slot name="description"></slot>
          </div>
        </div>
      </div>
    `;
  }
}
