/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { customElement, html, LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import { PageMixin } from '../page.mixin';
import { headerEmitter } from '../widgets/header/header.component';

@customElement('app-sign-out')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignOutComponent extends PageMixin(LitElement) {
  render() {
    return html` ${this.renderNotification()} `;
  }

  async firstUpdated() {
    try {
      await httpClient.delete('/users/sign-out');
      headerEmitter.emit('deleteId');
      this.setNotification({ infoMessage: 'Sie wurden erfolgreich abgemeldet!' });
      location.href = 'http://localhost:8080/app/';
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
  }
}
