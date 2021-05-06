/* Autor: Arne Hegemann */

import { css, customElement, html, LitElement, property, unsafeCSS } from "lit-element";
import { PageMixin } from "../../page.mixin";

const sharedCSS = require('../../shared.scss');
const recipeCSS = require('./ingredient.component.scss');

@customElement('app-ingredient')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RecipeDetailsComponent extends PageMixin(LitElement) {
  static styles = [
    css`
          ${unsafeCSS(sharedCSS)}
        `,
    css`
          ${unsafeCSS(recipeCSS)}
        `
  ];

  @property()
  name: string = "";

  @property()
  quantity: number = 0;

  @property()
  unit: string = "";

  render() {
    return html`
        <div class="row">
          <input class="form-control col-sm-4" type="text" id="ingredient" name="ingredient" placeholder="Zutat" required .value="${this.name}"/>
          <input class="form-control col-sm-1" type="number" id="quantity" name="quantity" placeholder="0" required  .value="${this.quantity}" />
          <select class="form-control col-sm-1" id="unit" name="unit" .value="${this.unit}">
            <option value="emtpy"></option>
            <option value="gram">Gram</option>
            <option value="milliliter">Milliliter</option>
            <option value="piece">Stück</option>
          </select>
        </div>
        `
  }

}