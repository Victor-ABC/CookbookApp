/* Autor: Felix Schaphaus */

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

  @property()
  userId!: string;

  @internalProperty()
  cookbooks: Cookbook[] = [];

  @internalProperty()
  headline!: string;

  async firstUpdated() {
    try {
      const url = this.userId ? `/cookbooks/${this.userId}` : '/cookbooks';
      const resp = await httpClient.get(url);
      const json = (await resp.json()).results;
      this.cookbooks = json.cookbooks;
      this.headline = json.author ? `${json.author}'s Kochbücher` : 'Alle Kochbücher';
    } catch ({ message }) {
      router.navigate('/cookbooks');
    }
  }

  render() {
    return html`
      ${this.renderNotification()}
      <h1>${this.headline}</h1>
      <div class="cookbooks">
        ${this.cookbooks.map(
          book => html`<app-cookbook-list-item
            ?data-own-cookbooks=${false}
            @appcookbookdetailsclick=${() => this.showDetails(book)}
          >
            <span slot="title">${book.title}</span>
            <span slot="description"
              >${book.description || 'Diesem Kochbuch wurde noch keine Beschreibung hinzugefügt.'}</span
            >
          </app-cookbook-list-item>`
        )}
      </div>
    `;
  }

  async showDetails(cookbook: Cookbook) {
    router.navigate(`/cookbooks/details/${cookbook.id}`);
  }
}
