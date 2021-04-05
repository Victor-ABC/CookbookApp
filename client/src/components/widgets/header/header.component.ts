/* Autor: Victor Corbet */

import { css, customElement, html, LitElement, property, internalProperty, unsafeCSS } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { PageMixin } from '../../page.mixin';

const sharedCSS = require('../../shared.scss');
const headerCSs = require('./header.component.scss');

@customElement('app-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class HeaderComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(headerCSs)}
    `
  ];

  @property()
  title = '';

  @property()
  linkItems: Array<{ title: string; routePath: string }> = [];

  @internalProperty()
  private navbarOpen = false;

  render() {
    return html`
      <nav class="flex-box navbar fixed-top navbar-expand-lg navbar-dark bg-success">
        <span class="flex-item main-icon"></span>
        <a class="flex-item navbar-brand" href="/"><span class="logo"></span>${this.title}</a>
        <form class="form-flex-box">
          <input
            id="search-field"
            class="form-item form-control"
            type="search"
            placeholder="z.B. Pizza, Pasta ..."
            aria-label="Search"
          />
          <select id="search-select" class="form-item form-select custom-select" id="inputGroupSelect01">
            <option selected>in Rezepte</option>
            <option value="1">in Kochbücher</option>
          </select>
          <button id="search-button" class="form-item btn btn-light my-2 my-sm-0" type="submit"></button>
        </form>
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
            ${this.linkItems.map(
              linkItem => html`
                <li class="nav-item">
                  <a class="nav-link" href="${linkItem.routePath}" @click=${this.close}>${linkItem.title}</a>
                </li>
              `
            )}
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
