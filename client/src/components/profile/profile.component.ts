/* Autor: Victor */

import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const profileCSS = require('./profile.component.scss');

@customElement('app-profile')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignInComponent extends PageMixin(LitElement) {
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
`;
  }


}
