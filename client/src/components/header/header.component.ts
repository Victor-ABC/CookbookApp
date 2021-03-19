/* Autor: Victor */

import { css, customElement, html, LitElement, property, internalProperty, unsafeCSS } from 'lit-element';
import { classMap } from 'lit-html/directives/class-map';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const headerCSs = require('./header.component.scss');

@customElement('app-header')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(headerCSs)}
    `
  ];


  render() {
    return html`
<header id="flex-container-box">
    <div class="flex-item">
        
    </div>
    <nav class="navbar navbar-light bg-light justify-content-between flex-item">
        <form class="form-inline">
        <input class="form-control mr-sm-2" type="search" placeholder="z.B. Pasta, Suppe ..." aria-label="Search">
        <button class="btn btn-success my-2 my-sm-0" type="submit">Search</button>
        </form>
    </nav>
</header>
    `;
  }


}
