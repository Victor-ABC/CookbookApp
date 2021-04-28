/* Autor: Arne Hegemann */

import { css, customElement, html, LitElement, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const recipeCSS = require('./recipes.component.scss');

@customElement('app-recipes')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RecipesComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(recipeCSS)}
    `
  ];

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Your Recipes</h1>
`;
  }


}