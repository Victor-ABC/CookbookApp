/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { PageMixin } from '../page.mixin';
import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';


const sharedCSS = require('../shared.scss');
const componentCSS = require('./sent.component.scss');

@customElement('app-message-create')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class CreateMessageComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @query('#name')
  nameElement!: HTMLInputElement;

  @query('#title')
  titleElement!: HTMLInputElement;

  @query('#content')
  contentElement!: HTMLInputElement;

  @query('form')
  form!: HTMLFormElement;

  @query('#name-check')
  messageDiv!: HTMLDivElement;

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Nachrichten schicken</h1>
      <form>
        <div class="form-group">
          <label class="control-label" for="name">An</label>
          <div id="name-check" value="">placeHolder</div>
          <input class="form-control" type="" autofocus required id="name" name="name" />
          <div class="invalid-feedback">Addresat ist zwingend einzutragen</div>
          <button
              @click="${this.checkIfNameExists}"
              id="name__button"
              type="button"
              class="name-fley-item btn btn-success"
            >
              Name existiert?
            </button>
        </div>
        <div class="form-group">
          <label class="control-label" for="title">Titel</label>
          <input class="form-control" type="" required id="title" name="title" />
          <div class="invalid-feedback">Titel ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="content">Inhalt</label>
          <textarea class="form-control" type="text" required id="content" name="content"></textarea>
          <div class="invalid-feedback">Das Textfeld sollte nicht leer sein</div>
        </div>
        <button class="btn btn-success" type="button" @click="${this.submit}">Senden</button>
      </form>
    `;
  }


  async checkIfNameExists() {
    if (this.nameElement.value) {
      try {
        await httpClient
          .post('/users/exists', { name: this.nameElement.value })
          .then(() => {
            this.messageDiv.textContent = 'Benutzer existiert nicht';
            this.messageDiv.setAttribute('class', 'error');
          })
          .catch(() => {
            this.messageDiv.textContent = 'Benutzer existiert';
            this.messageDiv.setAttribute('class', 'success');
          })
          .finally(() => {
            setTimeout(() => {
              this.messageDiv.textContent = 'placeHolder';
              this.messageDiv.setAttribute('class', '');
            }, 1500);
          });
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  async submit() {
    if (this.isFormValid()) {
      let date = new Date;
      let dateString = `am ${date.getDate()}.${date.getMonth()}.${date.getFullYear()} um ${date.getHours()}:${date.getMinutes()} Uhr`
      const message = {
        to: this.nameElement.value,
        title: this.titleElement.value,
        content: this.contentElement.value,
        date: dateString
      };
      try {
        await httpClient.post('/message/', message);
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }


}
