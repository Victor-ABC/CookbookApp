/* Autor: Felix Schaphaus */

import { nothing } from 'lit-html';
import { css, customElement, html, LitElement, internalProperty, query, unsafeCSS, property } from 'lit-element';
import { PageMixin } from '../page.mixin';

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

  @property()
  cookbookId!: string;

  render() {
    return html`<h1>Cookbook Details for ${this.cookbookId}</h1>`;
  }
}
