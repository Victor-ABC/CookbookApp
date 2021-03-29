/* Autor: Victor */

import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./sign-up.component.scss');

@customElement('app-sign-up')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class SignUpComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(componentCSS)}
    `
  ];

  @query('form')
  form!: HTMLFormElement;

  @query('#name')
  nameElement!: HTMLInputElement;

  @query('#email')
  emailElement!: HTMLInputElement;

  @query('#password')
  passwordElement!: HTMLInputElement;

  @query('#password-check')
  passwordCheckElement!: HTMLInputElement;

  @query('#name-check')
  messageDiv!: HTMLDivElement;
  
  render() {
    return html`
      ${this.renderNotification()}
      <h1>Konto erstellen</h1>
      <form novalidate>
        <div class="form-group">
          <label class="control-label" for="name">User-Name</label>
          <div id="nameButton">
            <div id="name-check" value="">placeHolder</div>
            <input class="name-fley-item form-control" type="text" autofocus required id="name" name="name" />
            <div class="invalid-feedback" id="nameBemerkung">Name ist erforderlich und muss eindeutig sein</div>
            <button
              @click="${this.checkIfNameExists}"
              id="name__button"
              type="button"
              class="name-fley-item btn btn-success"
            >
              Name vergeben?
            </button>
          </div>
        </div>
        <div class="form-group">
          <label class="control-label" for="email">E-Mail</label>
          <input class="form-control" type="email" required id="email" name="email" />
          <div class="invalid-feedback">E-Mail ist erforderlich und muss gültig sein</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="password">Passwort</label>
          <input class="form-control" type="password" required minlength="10" id="password" name="password" />
          <div class="invalid-feedback">Passwort ist erforderlich und muss mind. 10 Zeichen lang sein</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="password-check">Passwort nochmals eingeben</label>
          <input
            class="form-control"
            type="password"
            required
            minlength="10"
            id="password-check"
            name="passwordCheck"
          />
          <div class="invalid-feedback">
            Eine erneute Eingabe ist erforderlich und muss mit der ersten Passworteingabe übereinstimmen
          </div>
        </div>
        <button class="btn btn-success" type="button" @click="${this.submit}">Konto erstellen</button>
      </form>
    `;
  }

  async checkIfNameExists() {
    if (this.nameElement.value) {
      try {
        await httpClient
          .post('/users/exists', { name: this.nameElement.value })
          .then(() => {
            this.messageDiv.textContent = 'Name ist noch nicht vergeben';
            this.messageDiv.setAttribute('class', 'success');
          })
          .catch(() => {
            this.messageDiv.textContent = 'Name ist bereits vergeben';
            this.messageDiv.setAttribute('class', 'error');
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
      const accountData = {
        name: this.nameElement.value,
        email: this.emailElement.value,
        password: this.passwordElement.value,
        passwordCheck: this.passwordCheckElement.value
      };
      try {
        await httpClient.post('/users/sign-up', accountData);
        router.navigate('api');
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    if (this.passwordElement.value !== this.passwordCheckElement.value) {
      this.passwordCheckElement.setCustomValidity('Passwörter müssen gleich sein');
    } else {
      this.passwordCheckElement.setCustomValidity('');
    }
    return this.form.checkValidity();
  }
}
