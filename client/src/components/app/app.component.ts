/* Autor: TODO */

import { css, customElement, html, LitElement, internalProperty, unsafeCSS } from 'lit-element';
import { router } from '../../router';
import { httpClient } from '../../http-client';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./app.component.scss');

@customElement('app-root')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class AppComponent extends LitElement {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @internalProperty()
  title = 'Koch-App';

  @internalProperty()
  linkItems = [
    { title: 'Konto erstellen', routePath: '/users/sign-up' },
    { title: 'Anmelden', routePath: '/users/sign-in' },
    { title: 'Abmelden', routePath: '/users/sign-out' },
    { title: 'Mein Profil', routePath: '/users/profile' },
    { title: 'Meine Kochbücher', routePath: '/my-cookbooks' },
    { title: 'Kochbücher', routePath: '/cookbooks' }
  ];

  constructor() {
    super();
    const port = location.protocol === 'https:' ? 3443 : location.protocol === 'https:' ? 3443 : 3000;
    httpClient.init({ baseURL: `${location.protocol}//${location.hostname}:${port}/api/` });
  }

  firstUpdated() {
    router.subscribe(() => this.requestUpdate());
  }

  renderRouterOutlet() {
    return router.select(
      {
        '/users/sign-in': () => html`<app-sign-in></app-sign-in>`,
        '/users/sign-up': () => html`<app-sign-up></app-sign-up>`,
        '/users/sign-out': () => html`<app-sign-out></app-sign-out>`,
        '/users/profile': () => html`<app-profile></app-profile>`,
        '/cookbooks/details/:id': params => html`<app-cookbook .cookbookId=${params.id}></app-cookbook>`,
        '/cookbooks': () => html`<app-cookbooks></app-cookbooks>`,
        '/cookbooks/:id': params => html`<app-cookbooks .userId=${params.id}></app-cookbooks>`,
        '/my-cookbooks': () => html`<app-my-cookbooks></app-my-cookbooks>`
      },
      () => html`<app-tasks></app-tasks>`
    );
  }

  render() {
    return html`
      <app-header title="${this.title}" .linkItems=${this.linkItems}> </app-header>
      <div class="main container">${this.renderRouterOutlet()}</div>
    `;
  }
}
