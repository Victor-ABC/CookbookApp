/* Autor: Arne Hegemann */

import { css, customElement, html, internalProperty, LitElement, property, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
}

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

  @property()
  userId!: string;
  
  @internalProperty()
  recipes: Recipe[] = [];

  async firstUpdated() {
    try {
      const url = this.userId ? `/recipes/${this.userId}` : '/recipes';
      const resp = await httpClient.get(url);
      const json = (await resp.json()).results;
      this.recipes = json.recipes;
    } catch ({ message }) {
      router.navigate('/recipes');
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Your Recipes</h1>
      <div class="recipes">
        ${this.recipes.map(
          recipe => html`
            <app-recipe-list-item @apprecipedetailsclick=${() => this.showRecipe(recipe)}>
              <span slot="title">${recipe.title}</span>
              <span slot="description">${recipe.description.substring(0, 150)}</span>
              <img class="img-fluid" slot="image" src="${recipe.image}"/>
            </app-recipe-list-item>
          `)}
      </div>
`;
  }

  showRecipe(recipe: Recipe){
    alert("test");
    router.navigate(`/recipes/details/${recipe.id}`);
  }
}