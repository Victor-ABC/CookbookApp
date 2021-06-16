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

  @property()
  own!: boolean;

  @internalProperty()
  recipes: Recipe[] = [];

  async firstUpdated() {
    try {
      const url = this.own ? `/recipes/own` : this.userId ? `/recipes/${this.userId}` : '/recipes';
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
      <h1>${this.own ? 'Deine ' : ''}Rezepte</h1>
      <div>
        ${this.recipes.map(
          recipe => html`
            <app-recipe-list-item class="recipe" @apprecipedetailsclick=${() => this.showRecipe(recipe)}>
              <span slot="title">${recipe.title}</span>
              <span slot="description"
                >${recipe.description.length >= 250
                  ? recipe.description.substring(0, 250) + '...'
                  : recipe.description}</span
              >
              <img class="img-fluid" slot="image" src="${recipe.image}" />
            </app-recipe-list-item>
          `
        )}
      </div>

      ${this.own
        ? html`
            <div>
              <button
                class="btn btn-success"
                type="button"
                id="newRecipe"
                name="newRecipe"
                @click="${() => {
                  router.navigate('/recipes/details/new');
                }}"
              >
                Neues Rezept
              </button>
            </div>
          `
        : html``}
    `;
  }

  showRecipe(recipe: Recipe) {
    router.navigate(`/recipes/details/${recipe.id}` + (this.own ? "?own" : ""));
  }
}
