/* Autor: Victor Corbet */

import { PageMixin } from '../page.mixin';
import { css, customElement, html, internalProperty, LitElement, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';

const sharedCSS = require('../shared.scss');
const componentCSS = require('./message-create.component.scss');

@customElement('app-message-create')
export class CreateMessageComponent extends PageMixin(LitElement) {
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
  formElement!: HTMLFormElement;

  @query('#name-check')
  messageDiv!: HTMLDivElement;

  @internalProperty()
  ready = true;

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
        <button
          @click="${this.textTemplate}"
          id="textvorlage__button"
          type="button"
          class="name-fley-item btn btn-success"
        >
          Textvorlage
        </button>
        <div class="form-group">
          <label class="control-label" for="content">Inhalt</label>
          <textarea rows="8" class="form-control" type="text" required id="content" name="content"></textarea>
          <div class="invalid-feedback">Das Textfeld sollte nicht leer sein</div>
        </div>
        <button class="btn btn-success" type="button" @click="${this.submit}">Senden</button>
      </form>
    `;
  }

  textTemplate() {
    if (this.contentElement.value === '' || this.contentElement.value === null) {
      this.contentElement.value = `Sehr geehrter Herr Müller


Ihr Rezept für Erdbeerkuchen hat mir sehr gut gefallen.
Ich hab beim zweiten mal Bananen genommen. Auch eine leckere kombination.

Liebe Grüße,
Vorname Nachname`;
    } else {
      this.setNotification({ infoMessage: 'Der Inhaltbereich muss leer sein' });
    }
  }

  async checkIfNameExists() {
    if (this.nameElement.value) {
      try {
        await httpClient
          .post('/users/exists', { name: this.nameElement.value })
          .then(() => {
            this.messageDiv.textContent = 'Benutzer existiert nicht';
            this.messageDiv.setAttribute('value', 'error');
            // this.setNotification({ errorMessage: "Benutzer existiert nicht" })
          })
          .catch(() => {
            this.messageDiv.textContent = 'Benutzer existiert';
            this.messageDiv.setAttribute('value', 'success');
            // this.setNotification({ infoMessage: "Benutzer existiert" })
          })
          .finally(() => {
            setTimeout(() => {
              this.messageDiv.textContent = 'placeHolder';
              this.messageDiv.setAttribute('value', '');
            }, 1500);
          });
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  async submit() {
    if (this.isFormValid()) {
      if (this.ready) {
        this.ready = !this.ready;
        setTimeout(() => {
          this.ready = true;
        }, 10000);
        const date = new Date();
        const dateString = `am ${date.getDate()}.${date.getMonth()}.${date.getFullYear()} um ${date.getHours()}:${date.getMinutes()} Uhr`;
        const message = {
          to: this.nameElement.value,
          title: this.titleElement.value,
          content: this.contentElement.value,
          date: dateString
        };
        try {
          await httpClient.post('/message/', message);
          this.setNotification({ successMessage: `Nachricht erfolgreich an ${message.to} versandt` });
          this.formElement.reset();
        } catch ({ message }) {
          if (message.errorMessage) {
            this.setNotification({ errorMessage: message.errorMessage });
          } else {
            this.setNotification({ infoMessage: message.infoMessage });
          }
        }
      } else {
        this.setNotification({ infoMessage: 'Sie können nur alle 10 Sekunden eine Nachricht schicken.' });
      }
    } else {
      this.formElement.classList.add('was-validated');
    }
  }

  isFormValid() {
    return this.formElement.checkValidity();
  }
}
