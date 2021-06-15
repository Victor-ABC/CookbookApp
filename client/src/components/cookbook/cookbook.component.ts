/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS, property } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { Author } from '../../models/author';
import { Recipe } from '../../models/recipe';

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

  @query('.no-recipes')
  noRecipesElement!: HTMLElement;

  @internalProperty()
  recipes: Recipe[] = [];

  @property()
  cookbookId!: string;

  @property()
  title!: string;

  @property()
  description!: string;

  @property()
  author: Author = {} as Author;

  ownCookbooks = location.search === '?own';

  async firstUpdated() {
    // update url to remove ?own
    history.replaceState(null, '', `${location.origin}${location.pathname}`);

    try {
      const resp = await httpClient.get(`/cookbooks/details/${this.cookbookId}`);
      const json = (await resp.json()).results;
      this.recipes = json.recipes;
      this.title = json.title;
      this.author = json.author;
      this.description = json.description;
      this.triggerNoRecipesNotification();
    } catch ({ message }) {
      this.setNotification({ errorMessage: 'Das Kochbuch existiert nicht.' });
      setTimeout(() => router.navigate('/cookbooks'), 3000);
    }
  }

  render() {
    return html`${this.renderNotification()}
    <div class="header">
      <input type="checkbox" id="toggle-edit" />
      ${this.ownCookbooks ? html`<label class="btn btn-success" for="toggle-edit">Bearbeiten</label>` : nothing}
      <h1>${this.title}</h1>
      <p>
        <span class="description">${this.description}</span>
        <span class="author" @click="${this.openCookbook}">${this.author.name}<span>
      </p>
      
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
            maxlength="32"
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
            maxlength="1024"
            .value=${this.description}
          /></textarea>
        </div>
        <button class="btn btn-success" type="button" @click="${this.updateCookbook}">Speichern</button>
        <button class="btn btn-secondary" type="button" @click="${this.cancel}">Abbrechen</button>
      </form>
    </div>
    <div class="cookbooks">
      ${this.recipes.map(
        recipe =>
          html`<app-cookbook-card
            ?data-own-cookbooks=${this.ownCookbooks}
            @appcookbookopenclick=${() => this.openRecipe(recipe)}
            @appcookbookdeleteclick=${() => this.deleteRecipe(recipe)}
          >
            <img slot="image" src=${recipe.image} />
            <span slot="title">${recipe.title}</span>
            <span slot="description">${recipe.description}</span>
          </app-cookbook-card>`
      )}
    </div>
    <div class="no-recipes alert alert-success">Das Kochbuch ist noch leer.</div>
    `;
  }

  async updateCookbook(event: Event) {
    event.preventDefault();

    if (this.form.checkValidity()) {
      const updatedCookbook = {
        id: this.cookbookId,
        description: this.newDescriptionElement.value.trim(),
        title: this.newTitleElement.value.trim()
      };

      try {
        // update cookbook in database
        await httpClient.patch('/cookbooks', updatedCookbook);
        this.title = updatedCookbook.title;
        this.description = updatedCookbook.description;
        this.toggleEditElement.checked = false;

        // update html
        this.newTitleElement.value = updatedCookbook.title;
        this.newDescriptionElement.value = updatedCookbook.description;
      } catch ({ message }) {
        this.setNotification({ errorMessage: 'Das Kochbuch konnte nicht aktualisiert werden.' });
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
    router.navigate(`/recipes/details/${recipe.id}`);
  }

  async deleteRecipe(recipeToRemove: Recipe) {
    try {
      await httpClient.delete(`/cookbooks/${this.cookbookId}/${recipeToRemove.id}`);
      this.recipes = this.recipes.filter(recipe => recipe.id !== recipeToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: 'Das Rezept konnte aus dem Kochbuch nicht entfernt werden.' });
    }
    this.triggerNoRecipesNotification();
  }

  openCookbook() {
    router.navigate(`/cookbooks/${this.author.id}`);
  }

  triggerNoRecipesNotification() {
    this.noRecipesElement.style.display = this.recipes.length === 0 ? 'block' : 'none';
  }
}
