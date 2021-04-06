/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS, property } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { router } from '../../router';
import { httpClient } from '../../http-client';

interface Cookbook {
  id: string;
  title: string;
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

  @property()
  userId!: string;

  @internalProperty()
  cookbooks: Cookbook[] = [];

  @internalProperty()
  title!: string;

  ownCookbooks = false;

  async firstUpdated() {
    if (location.pathname === '/app/my-cookbooks' && !this.userId) {
      router.navigate('/users/sign-in');
    }

    // fetch cookbooks
    if (this.userId) {
      this.ownCookbooks = this.userId === localStorage.getItem('user-id');
      await this.fetchUserCookbooks();
    } else {
      await this.fetchAllCookbooks();
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>${this.title}</h1>
      ${this.ownCookbooks
        ? html`<form @submit="${this.addCookbook}">
            <input
              class="form-control form-control-lg"
              type="text"
              autofocus
              required
              id="title"
              name="title"
              placeholder="Neues Kochbuch hinzufügen"
            />
          </form>`
        : nothing}
      <div class="cookbooks">
        ${this.cookbooks.map(
          book => html`<app-cookbook
            data-own-cookbooks="${this.ownCookbooks}"
            data-id="${book.id}"
            @appcookbookdetailsclick=${() => this.showDetails(book)}
            @appcookbookdeleteclick=${() => this.deleteCookbook(book)}
            ><span slot="title">${book.title}</span></app-cookbook
          >`
        )}
      </div>
    `;
  }

  async addCookbook(event: Event) {
    event.preventDefault();
    const partialCookbook: Cookbook = { title: this.titleElement.value } as Cookbook;

    try {
      const response = await httpClient.post('/cookbooks', partialCookbook);
      const cookbook: Cookbook = await response.json();
      this.cookbooks = [...this.cookbooks, cookbook];
      this.titleElement.value = '';
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  async deleteCookbook(bookToRemove: Cookbook) {
    try {
      await httpClient.delete(`/cookbooks/${bookToRemove.id}`);
      this.cookbooks = this.cookbooks.filter(book => book.id !== bookToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  async fetchAllCookbooks() {
    const response = await httpClient.get('/cookbooks');
    const json = (await response.json()).results;
    this.cookbooks = json.cookbooks;
    this.title = 'Alle Kochbücher';
  }

  async fetchUserCookbooks() {
    try {
      const response = await httpClient.get(`/cookbooks/${this.userId}`);
      const json = (await response.json()).results;
      this.cookbooks = json.cookbooks;
      this.title = `${json.creator}'s Kochbücher`;
    } catch ({ message }) {
      router.navigate('/cookbooks');
    }
  }

  async showDetails(cookbook: Cookbook) {
    router.navigate(`/cookbooks/details/${cookbook.id}`);
  }
}
