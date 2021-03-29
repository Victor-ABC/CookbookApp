/* Autor: Victor Corbet */

import { css, customElement, internalProperty, html, LitElement, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { guard } from 'lit-html/directives/guard';
import { repeat } from 'lit-html/directives/repeat';

const sharedCSS = require('../shared.scss');
const profileCSS = require('./profile.component.scss');

interface Message {
  to: string;
  title: string;
  content: string;
  date: number;
}

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


  @internalProperty()
  private messages: Message[] = [];

  async firstUpdated() {
    try {
      const response = await httpClient.get('/message');
      this.messages = (await response.json()).results;
    } catch ({ message, statusCode }) {
      if (statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  render() {
    return html`
      <app-snake-game></app-snake-game>
      <details>
      <summary>Anderen Usern ein Kompliment machen  <button class="btn btn-success" @click="${this.refresh}">refresh</button></summary>
      <app-message-create></app-message-create>
      </details>
      ${this.renderNotification()}
      <h1>Profile</h1>
      <div class="messages">
      ${guard([this.messages] , () => html`
      ${repeat(
        this.messages,
        message => message.date,
        message => html`
          <div>${message.title}</div>
          <div>${message.content}</div>
          <div>${message.date}</div>
        `
      )}`)
      }
      </div>
    `;
  }
  async refresh () {
    try {
      const response = await httpClient.get('/message');
      this.messages = (await response.json()).results;
    } catch ({ message, statusCode }) {
      if (statusCode === 401) {
        router.navigate('/users/sign-in');
      } else {
        this.setNotification({ errorMessage: message });
      }
    }
  }
}
