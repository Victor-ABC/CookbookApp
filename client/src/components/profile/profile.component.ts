/* Autor: Victor */

import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const profileCSS = require('./profile.component.scss');

@customElement('app-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {
  createRenderRoot() {
    return this;
  }
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(profileCSS)}
    `
  ];

  render() {
    return html`
      ${this.renderNotification()}
      <h1>This is the Profile section</h1>
      <app-snake-game></app-snake-game>
`;
  }


}
