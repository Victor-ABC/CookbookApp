/* Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster) */

import { router } from '../../router';
import { PageMixin } from '../page.mixin';
import { css, customElement, html, internalProperty, LitElement, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { headerEmitter } from '../widgets/header/header.component';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./sign-in.component.scss');

@customElement('app-sign-in')
export class SignInComponent extends PageMixin(LitElement) {
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

  @query('#password')
  passwordElement!: HTMLInputElement;

  @query('form')
  form!: HTMLFormElement;

  @internalProperty()
  versuche = 5;

  @internalProperty()
  waitTime = 30;

  @internalProperty()
  isCountdownRunning = false;

  render() {
    return html`
      ${this.renderNotification()}
      <h1>Anmelden</h1>
      <form>
        <div class="form-group">
          <label class="control-label" for="name">Name</label>
          <input maxlength="30" class="form-control" type="" autofocus required id="name" name="name" />
          <div class="invalid-feedback">Name ist erforderlich</div>
        </div>
        <div class="form-group">
          <label class="control-label" for="password">Passwort</label>
          <input
            maxlength="30"
            minlength="10"
            class="form-control"
            type="password"
            required
            id="password"
            name="password"
          />
          <div class="invalid-feedback">Passwort ist erforderlich</div>
        </div>
        <button class="btn btn-success" type="button" @click="${this.submit}">Anmelden</button>
      </form>
    `;
  }

  async submit() {
    if (this.isFormValid()) {
      if (this.versuche > 0) {
        this.versuche--;
        const authData = {
          name: this.nameElement.value,
          password: this.passwordElement.value
        };
        try {
          const response = await httpClient.post('/users/sign-in', authData);
          const json = await response.json();
          headerEmitter.emit('setId', json.id);
          router.navigate('/my-recipes');
        } catch ({ message }) {
          this.setNotification({ errorMessage: message });
        }
      } else {
        if (!this.isCountdownRunning) {
          this.isCountdownRunning = !this.isCountdownRunning;
          const interval = setInterval(() => {
            if (this.waitTime <= 0) {
              this.waitTime = 30;
              this.versuche = 5;
              this.isCountdownRunning = !this.isCountdownRunning;
              clearInterval(interval);
            } else {
              this.waitTime--;
            }
          }, 1000);
        }
        this.setNotification({
          errorMessage: `Maximale Anzahl Versuche Erreicht. Versuchen sie es in ${this.waitTime} Sekunden erneut.`
        });
      }
    } else {
      this.form.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.form.checkValidity();
  }
}
