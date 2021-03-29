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
  id: string,
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
      <summary>Nachricht Senden  <button class="btn btn-success" @click="${this.refresh}">refresh</button></summary>
      <app-message-create></app-message-create>
      </details>
      ${this.renderNotification()}
      <h1>Meine Nachrichten</h1>
      <div id="container-all-message">
      ${guard([this.messages] , () => html`
      ${repeat(
        this.messages,
        message => message.id,
        message => html`
        <div id="container-one-message">
          <h5 class="item"> ${message.title}</h5>
          <p class="item">${message.content}</p>
          <small class="item">${message.date}</small>
          <button class="btn btn-secondary" @click="${this.deleteMessage(message)}">löschen</button>
        </div>
        `
      )}`)
      }
      </div>
    `;
  }

  async deleteMessage (message : Message) {
    try {
      await httpClient.delete('/message' + message.id);
      this.messages = this.messages.filter(m => m.id !== message.id);
    } catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }
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
