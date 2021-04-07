/* Autor: Felix Schaphaus */

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

  async firstUpdated() {
    await this.fetchCookbooks(this.userId);
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>${this.title}</h1>
      <div class="cookbooks">
        ${this.cookbooks.map(
          book => html`<app-cookbook-preview
            data-own-cookbooks="false"
            data-id="${book.id}"
            @appcookbookdetailsclick=${() => this.showDetails(book)}
            ><span slot="title">${book.title}</span></app-cookbook-preview
          >`
        )}
      </div>
    `;
  }

  async fetchCookbooks(userId?: string) {
    const url = userId ? `/cookbooks/${userId}` : '/cookbooks';
    try {
      const resp = await httpClient.get(url);
      const json = (await resp.json()).results;
      this.cookbooks = json.cookbooks;
      this.title = userId ? `${json.creator}'s Kochbücher` : 'Alle Kochbücher';
    } catch ({ message }) {
      this.setNotification({
        errorMessage: 'Der Benutzer existiert nicht. Du wirst zur Liste aller Kochbücher weitergeleitet.'
      });
      setTimeout(() => router.navigate('/cookbooks'), 3000);
    }
  }

  async showDetails(cookbook: Cookbook) {
    router.navigate(`/cookbooks/details/${cookbook.id}`);
  }
}
