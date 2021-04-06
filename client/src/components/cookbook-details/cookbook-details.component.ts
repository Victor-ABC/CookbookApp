/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS, property } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { httpClient } from '../../http-client';

interface Recipe {
  id: string;
  title: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./cookbook-details.component.scss');

@customElement('app-cookbook-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbookDetailsComponent extends PageMixin(LitElement) {
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

  @internalProperty()
  recipes: Recipe[] = [];

  @property()
  cookbookId!: string;

  @property()
  title!: string;

  @property()
  description!: string;

  ownCookbooks!: boolean;

  async firstUpdated() {
    try {
      const response = await httpClient.get(`/cookbooks/details/${this.cookbookId}`);
      const json = (await response.json()).results;
      console.log(JSON.stringify(json));
      this.ownCookbooks = json.owner.id === localStorage.getItem('user-id');
      this.title = json.title;
      this.description = json.description;
      this.recipes = json.recipes;
      this.requestUpdate();
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  render() {
    return html`${this.renderNotification()}
    <div class="header">
      ${this.ownCookbooks ? html`<label id="toggle-edit-icon" for="toggle-edit"></label>` : nothing}
      <input type="checkbox" id="toggle-edit" />
      <h1>${this.title}</h1>
      <p>${this.description}</p>
      <form>
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
            rows="5"
            placeholder="Füge deinem Kochbuch eine kurze Beschreibung hinzu."
            .value=${this.description}
          /></textarea>
        </div>
        <button class="btn btn-primary" type="button" @click="${this.submit}">Speichern</button>
        <button class="btn btn-secondary" type="button" @click="${this.cancel}">Abbrechen</button>
      </form>
    </div>
    <div class="cookbooks-container">
      ${this.recipes.map(recipe => html`<div class="cookbooks-item">${recipe.id} und ${recipe.title}</div>`)}
    </div>
    `;
  }

  async submit(event: Event) {
    event.preventDefault();

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
      console.log(message);
      this.setNotification({ errorMessage: message });
    }
  }

  cancel() {
    this.toggleEditElement.checked = false;
    this.newTitleElement.value = this.title;
    this.newDescriptionElement.value = this.description;
  }
}
