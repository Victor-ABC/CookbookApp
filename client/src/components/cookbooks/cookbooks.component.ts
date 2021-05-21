/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS, property } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { router } from '../../router';
import { httpClient } from '../../http-client';

interface Cookbook {
  id: string;
  title: string;
  description: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./cookbooks.component.scss');

@customElement('app-cookbooks')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CookbooksComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @query('#title')
  titleElement!: HTMLInputElement;

  @query('form')
  formElement!: HTMLFormElement;

  @query('.no-cookbooks')
  noCookbooksElement!: HTMLElement;

  @property()
  own!: boolean;

  @property()
  userId!: string;

  @internalProperty()
  cookbooks: Cookbook[] = [];

  @internalProperty()
  headline!: string;

  async firstUpdated() {
    try {
      const resp = await httpClient.get(this.getUrl());
      const json = (await resp.json()).results;
      this.cookbooks = json.cookbooks;
      console.log(json.author);
      this.headline = json.author ? `${json.author}'s Kochbücher` : 'Alle Kochbücher';
      this.triggerNoCookbooksNotification();
    } catch ({ message }) {
      router.navigate('/cookbooks');
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>${this.headline}</h1>
      ${this.own ? this.displayAddNewCookbook() : nothing}
      <div class="cookbooks">
        ${this.cookbooks.map(
          book => html`<app-cookbook-list-item
            ?data-own-cookbooks=${this.own}
            @appcookbookdetailsclick=${() => this.showDetails(book)}
            @appcookbookdeleteclick=${() => this.deleteCookbook(book)}
          >
            <span slot="title">${book.title}</span>
            <span slot="description"
              >${book.description || 'Diesem Kochbuch wurde noch keine Beschreibung hinzugefügt.'}</span
            >
          </app-cookbook-list-item>`
        )}
      </div>
      <div class="no-cookbooks alert alert-success">Es wurde noch kein Kochbuch erstellt.</div>
    `;
  }

  async addCookbook(event: Event) {
    event.preventDefault();

    if (this.formElement.checkValidity()) {
      const partialCookbook: Cookbook = { title: this.titleElement.value } as Cookbook;

      try {
        const response = await httpClient.post('/cookbooks', partialCookbook);
        const cookbook: Cookbook = await response.json();
        this.cookbooks = [...this.cookbooks, cookbook];
        this.titleElement.value = '';
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.setNotification({ errorMessage: 'Titel des Kochbuchs darf nicht leer sein.' });
    }
    this.triggerNoCookbooksNotification();
  }

  async deleteCookbook(bookToRemove: Cookbook) {
    try {
      await httpClient.delete(`/cookbooks/${bookToRemove.id}`);
      this.cookbooks = this.cookbooks.filter(book => book.id !== bookToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
    this.triggerNoCookbooksNotification();
  }

  async showDetails(cookbook: Cookbook) {
    if (this.own) {
      router.navigate(`/cookbooks/details/${cookbook.id}?own`);
    } else {
      router.navigate(`/cookbooks/details/${cookbook.id}`);
    }
  }

  displayAddNewCookbook() {
    return html`<form novalidate @submit="${this.addCookbook}">
      <input
        class="form-control form-control-lg"
        type="text"
        autofocus
        required
        id="title"
        name="title"
        placeholder="Neues Kochbuch hinzufügen"
      />
    </form>`;
  }

  triggerNoCookbooksNotification() {
    this.noCookbooksElement.style.display = this.cookbooks.length === 0 ? 'block' : 'none';
  }

  getUrl() {
    if (this.own) {
      return '/cookbooks/own';
    } else if (this.userId) {
      return `/cookbooks/${this.userId}`;
    }
    return '/cookbooks';
  }
}
