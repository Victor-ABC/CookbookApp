/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS, property } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { router } from '../../router';

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

  @query('#title') titleElement!: HTMLInputElement;

  @internalProperty()
  private cookbooks: Cookbook[] = [
    { id: 'id1', title: 'Mein veganes Kochbuch' },
    { id: 'id2', title: 'Gesunde Ernährung' },
    { id: 'id3', title: 'Leckere Backrezepte' },
    { id: 'id4', title: 'Die beliebtesten Gerichte Deutschlands' },
    { id: 'id5', title: 'Französische Küche mit Pierre' }
  ];

  @internalProperty()
  private isMyCookbooks: boolean = location.pathname !== '/app/cookbooks/all';

  render() {
    return html`
      ${this.renderNotification()}
      <h1>${this.isMyCookbooks ? 'Meine Kochbücher' : 'Alle Kochbücher'}</h1>
      ${this.isMyCookbooks
        ? html`<form @submit="${this.submit}">
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
            data-id="${book.id}"
            @appcookbookdetailsclick=${() => this.showDetails(book)}
            @appcookbookdeleteclick=${() => this.deleteCookbook(book)}
            ><span slot="title">${book.title}</span></app-cookbook
          >`
        )}
      </div>
    `;
  }

  async submit(event: Event) {
    event.preventDefault();
    const partialCookbook: Cookbook = { title: this.titleElement.value } as Cookbook;
    this.cookbooks = [...this.cookbooks, partialCookbook];
    this.titleElement.value = '';
  }

  async showDetails(bookToOpen: Cookbook) {
    router.navigate(`/cookbooks/details/${bookToOpen.id}`);
  }

  async deleteCookbook(bookToRemove: Cookbook) {
    this.cookbooks = this.cookbooks.filter(book => book.id !== bookToRemove.id);
    Promise.resolve();
  }
}
