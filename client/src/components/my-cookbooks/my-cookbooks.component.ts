/* Autor: Felix Schaphaus */

import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { router } from '../../router';
import { httpClient } from '../../http-client';

interface Cookbook {
  id: string;
  title: string;
  description: string;
}

const sharedCSS = require('../shared.scss');
const componentCSS = require('./my-cookbooks.component.scss');

@customElement('app-my-cookbooks')
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
  form!: HTMLFormElement;

  @internalProperty()
  cookbooks: Cookbook[] = [];

  async firstUpdated() {
    try {
      const resp = await httpClient.get('/cookbooks/own');
      const json = (await resp.json()).results;
      this.cookbooks = json.cookbooks;
    } catch ({ message }) {
      router.navigate('/users/sign-in');
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Meine Kochbücher</h1>
      <form novalidate @submit="${this.addCookbook}">
        <input
          class="form-control form-control-lg"
          type="text"
          autofocus
          required
          id="title"
          name="title"
          placeholder="Neues Kochbuch hinzufügen"
        />
      </div>
      </form>
      <div class="cookbooks">
        ${this.cookbooks.map(
          book => html`<app-cookbook-list-item
            data-own-cookbooks="true"
            @appcookbookdetailsclick=${() => this.showDetails(book)}
            @appcookbookdeleteclick=${() => this.deleteCookbook(book)}
          >
            <span slot="title">${book.title}</span>
            <span slot="description"
              >${book.description
                ? book.description
                : 'Diesem Kochbuch wurde noch keine Beschreibung hinzugefügt.'}</span
            >
          </app-cookbook-list-item>`
        )}
      </div>
    `;
  }

  async addCookbook(event: Event) {
    event.preventDefault();

    if (this.form.checkValidity()) {
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
  }

  async deleteCookbook(bookToRemove: Cookbook) {
    try {
      await httpClient.delete(`/cookbooks/${bookToRemove.id}`);
      this.cookbooks = this.cookbooks.filter(book => book.id !== bookToRemove.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }

  async showDetails(cookbook: Cookbook) {
    router.navigate(`/cookbooks/details/${cookbook.id}?own`);
  }
}
