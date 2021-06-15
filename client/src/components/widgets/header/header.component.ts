/* Autor: Victor Corbet */

import { css, customElement, html, LitElement, property, internalProperty, unsafeCSS, query } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { PageMixin } from '../../page.mixin';
import { EventEmitter } from 'events';

class HeaderEmitter extends EventEmitter {}
export const headerEmitter = new HeaderEmitter();

const sharedCSS = require('../../shared.scss');
const headerCSs = require('./header.component.scss');

@customElement('app-header')
export class HeaderComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(headerCSs)}
    `
  ];

  @query('#search-select')
  searchSelect!: HTMLSelectElement;

  @query('#search-field')
  searchInput!: HTMLInputElement;

  @property()
  title = '';

  @property()
  userId = '';

  @property()
  linkItems: Array<{ title: string; routePath: string }> = [];

  @internalProperty()
  private navbarOpen = false;

  @property()
  private exclude: string[];

  private headerEmitter;

  constructor() {
    super();
    this.userId = document.cookie;
    this.exclude = ['Konto erstellen', 'Anmelden'];
    this.headerEmitter = headerEmitter;
    this.headerEmitter.on('setId', (id: string) => {
      this.userId = id;
    });
    this.headerEmitter.on('deleteId', () => {
      this.userId = '';
    });
  }

  render() {
    return html`
      <nav class="flex-box navbar fixed-top navbar-expand-lg navbar-dark bg-success">
        <span class="flex-item main-icon"></span>
        <a class="flex-item navbar-brand" href="/"><span class="logo"></span>${this.title}</a>
        <button
          @click="${this.toggle}"
          class="flex-item navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="flex-item icon"></span>
        </button>
        <div
          class=${classMap({
            'collapse': true,
            'navbar-collapse': true,
            'justify-content-end': true,
            'show': this.navbarOpen
          })}
          id="navbarNav"
        >
          <ul class="flex-item navbar-nav">
            ${this.linkItems.map(linkItem => {
              if (document.cookie) {
                if (!this.exclude.includes(linkItem.title)) {
                  return html`
                    <li class="nav-item">
                      <a class="nav-link" href="${linkItem.routePath}" @click=${this.close}>${linkItem.title}</a>
                    </li>
                  `;
                }
              } else {
                if (this.exclude.includes(linkItem.title)) {
                  return html`
                    <li class="nav-item">
                      <a class="nav-link" href="${linkItem.routePath}" @click=${this.close}>${linkItem.title}</a>
                    </li>
                  `;
                }
              }
            })}
          </ul>
        </div>
      </nav>
    `;
  }

  toggle() {
    this.navbarOpen = !this.navbarOpen;
  }

  close() {
    this.navbarOpen = false;
  }
}
