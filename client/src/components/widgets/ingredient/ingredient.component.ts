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
  own: boolean = true;

  @property()
  name: string = "";

  @property()
  quantity = 0;

  @property()
  unit = '';

  render() {
    return this.own ? html`
        <div class="row">
          <input 
            class="form-control form-control-sm col-sm-3" 
            type="text" 
            id="ingredient" 
            name="ingredient" 
            placeholder="Zutat" 
            required .value="${this.name}"
          />
          <input 
            class="form-control form-control-sm col-sm-1" 
            type="number" 
            id="quantity" 
            name="quantity" 
            placeholder="0" 
            required  
            .value="${this.quantity}" 
          />
          <select class="form-control form-control-sm col-sm-1" id="unit" name="unit" .value="${this.unit}">
            <option value="emtpy"></option>
            <option value="gram">Gram</option>
            <option value="milliliter">Milliliter</option>
            <option value="piece">Stück</option>
          </select>
          <span class="col-sm-1 delete-ingredient" @click="${() => this.emit('appDeleteIngredientClick')}"></span>
        </div>
        ` : html`
        <div class="row">
          <div class="col-md-6">
            <div class="row" >
              <span class="col-sm-1 border border-right-0 rounded ingredient">${this.quantity}</span>
              <span class="col-sm-2 border border-right-0 rounded ingredient">${this.getUnitText()}</span>
              <span class="col-sm-6 border rounded ingredient">${this.name}</span>
            </div>
          </div>
        </div>
        `;
  }

  getUnitText(){
    switch (this.unit) {
      case "gram":{
        return "Gram";
      }
      case "milliliter":{
        return "Milliliter";
      }
      case "piece":{
        return "Stück";
      }
      default: {
        return "";
      }
    }
  }
}
