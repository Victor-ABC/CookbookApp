/* Autor: Arne Hegemann */

import { css, customElement, html, LitElement, property, unsafeCSS } from 'lit-element';
import { WidgetMixin } from '../../widget.mixin';

const sharedCSS = require('../../shared.scss');
const recipeCSS = require('./ingredient.component.scss');

@customElement('app-ingredient')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RecipeDetailsComponent extends WidgetMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(recipeCSS)}
    `
  ];

  @property()
  own = true;

  @property()
  name = '';

  @property()
  quantity = 0;

  @property()
  unit = '';

  render() {
    return this.own
      ? html`
          <div class="row">
            <slot name="ingredient"></slot>
            <slot name="quantity"></slot>
            <slot name="unit"></slot>
            <span class="delete-ingredient" @click="${() => this.emit('appDeleteIngredientClick')}"></span>
          </div>
        `
      : html`
          <div class="row">
            <slot name="quantity2"></slot>
            <slot name="unit2"></slot>
            <slot name="ingredient2"></slot>
          </div>
        `;
  }
}
