/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS, property } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { httpClient } from '../../http-client';
import { router } from '../../router';

interface Recipe {
  id: string;
  title: string;
  description: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./cookbook.component.scss');

@customElement('app-cookbook')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @query('#toggle-edit')
  toggleEditElement!: HTMLInputElement;

  @query('#new-title')
  newTitleElement!: HTMLInputElement;

  @query('#new-description')
  newDescriptionElement!: HTMLInputElement;

  @query('form')
  form!: HTMLFormElement;

  @internalProperty()
  recipes: Recipe[] = [];

  @property()
  cookbookId!: string;

  @property()
  title!: string;

  @property()
  description!: string;

  ownCookbooks!: boolean;

  empty!: boolean;

  async firstUpdated() {
    try {
      const resp = await httpClient.get(`/cookbooks/details/${this.cookbookId}`);
      const json = (await resp.json()).results;
      this.ownCookbooks = json.owner.id === sessionStorage.getItem('user-id');
      this.recipes = json.recipes;
      this.empty = this.recipes.length === 0;
      this.title = json.title;
      this.description = json.description;
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  render() {
    return html`${this.renderNotification()}
    <div class="header">
      <input type="checkbox" id="toggle-edit" />
      ${this.ownCookbooks ? html`<label class="btn btn-success" for="toggle-edit">Bearbeiten</label>` : nothing}
      <h1>${this.title}</h1>
      <p>${this.description}</p>
      
      <form novalidate>
        <div class="form-group">
          <label class="control-label" for="new-title">Neuer Titel</label>
          <input
            class="form-control"
            type="text"
            autofocus
            required
            id="new-title"
            name="new-title"
            placeholder="Wähle einen neuen Titel für dein Kochbuch."
            .value=${this.title}
          />
        </div>
        <div class="form-group">
          <label class="control-label" for="new-description">Neue Beschreibung</label>
          <textarea
            class="form-control"
            id="new-description"
            name="new-description"
            rows="6"
            placeholder="Füge deinem Kochbuch eine kurze Beschreibung hinzu."
            .value=${this.description}
          /></textarea>
        </div>
        <button class="btn btn-success" type="button" @click="${this.updateCookbook}">Speichern</button>
        <button class="btn btn-secondary" type="button" @click="${this.cancel}">Abbrechen</button>
      </form>
    </div>
    <div class="cookbooks-container">
      ${this.recipes.map(
        recipe =>
          html`<app-cookbook-details
            data-id=${recipe.id}
            @appcookbookopenclick=${() => this.openRecipe(recipe)}
            @appcookbookdeleteclick=${() => this.deleteRecipe(recipe)}
          >
            <span slot="title">${recipe.title}</span>
            <span slot="description">${recipe.description}</span>
          </app-cookbook-details>`
      )}
    </div>
    ${this.empty ? html`<div class="alert alert-info">Das Kochbuch ist noch leer.</div>` : nothing}
    `;
  }

  async updateCookbook(event: Event) {
    event.preventDefault();

    if (this.form.checkValidity()) {
      const updatedCookbook = {
        id: this.cookbookId,
        description: this.newDescriptionElement.value,
        title: this.newTitleElement.value
      };

      try {
        await httpClient.patch('/cookbooks', updatedCookbook);
        this.title = updatedCookbook.title;
        this.description = updatedCookbook.description;
        this.toggleEditElement.checked = false;
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.setNotification({ errorMessage: 'Das Kochbuch benötigt einen Titel.' });
    }
  }

  cancel() {
    this.toggleEditElement.checked = false;
    this.newTitleElement.value = this.title;
    this.newDescriptionElement.value = this.description;
  }

  openRecipe(recipe: Recipe) {
    router.navigate(`/recipes/${recipe.id}`);
  }

  async deleteRecipe(recipeToRemove: Recipe) {
    try {
      await httpClient.delete(`/cookbooks/${this.cookbookId}/${recipeToRemove.id}`);
      this.recipes = this.recipes.filter(recipe => recipe.id !== recipeToRemove.id);
      this.empty = this.recipes.length === 0;
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }
}
