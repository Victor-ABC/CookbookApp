/* Autor: Victor Corbet */

import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import { ProfileComponent, Message } from './profile.component';
import './profile.component';

describe('app-profile', () => {
  let LitElement: LitElement;

  beforeEach(() => {
    LitElement = document.createElement('app-profile') as LitElement;
    document.body.appendChild(LitElement);
  });

  afterEach(() => {
    LitElement.remove();
  });

  it('should render three messages after GET-request and do no POST request', async () => {
    const messages = [
      {
        to: 'me',
        id: '1',
        title: 'Deine Rezepte sind Super',
        content: 'Hallo,  Ich habe letztens dein Pfannenkuchenrezept ausprobiert und es war super!!! Danke',
        date: 'am 20.10.2021 um 18:40 Uhr'
      },
      {
        to: 'me',
        id: '2',
        title: 'Kuchen angebrannt',
        content: 'Hallo,  Ich habe dein Kuchenrezept nachgekocht und die backzeit ist viieel zu hoch :( ',
        date: 'am 12.11.2021 um 14:17 Uhr'
      },
      {
        to: 'me',
        id: '3',
        title: 'Verbesserungsvorschlag',
        content:
          'Moin moin, Wenn man in deine Pfannenkuchen noch Vanillezucker machen würde, waeren sie nicht so langweilig.',
        date: 'am 17.11.2021 um 12:56 Uhr'
      }
    ];
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve(<Response>{
        json() {
          return Promise.resolve({ results: messages });
        }
      })
    );
    spyOn(httpClient, 'post');

    await LitElement.updateComplete;
    LitElement.requestUpdate();
    await LitElement.updateComplete;

    const titleElements = LitElement.shadowRoot!.querySelectorAll('.title');
    expect(titleElements.length).toBe(3);
    expect(httpClient.post).toHaveBeenCalledTimes(0);
  });

  it('should delete one message', async () => {
    const messages = [
      {
        to: 'me',
        id: '1',
        title: 'Deine Rezepte sind Super',
        content: 'Hallo,  Ich habe letztens dein Pfannenkuchenrezept ausprobiert und es war super!!! Danke',
        date: 'am 20.10.2021 um 18:40 Uhr'
      },
      {
        to: 'me',
        id: '2',
        title: 'Kuchen angebrannt',
        content: 'Hallo,  Ich habe dein Kuchenrezept nachgekocht und die backzeit ist viieel zu hoch :( ',
        date: 'am 12.11.2021 um 14:17 Uhr'
      },
      {
        to: 'me',
        id: '3',
        title: 'Verbesserungsvorschlag',
        content:
          'Moin moin, Wenn man in deine Pfannenkuchen noch Vanillezucker machen würde, waeren sie nicht so langweilig.',
        date: 'am 17.11.2021 um 12:56 Uhr'
      }
    ];
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve(<Response>{
        json() {
          return Promise.resolve({ results: messages });
        }
      })
    );
    await LitElement.updateComplete;
    LitElement.requestUpdate();
    await LitElement.updateComplete;

    let titleElements = LitElement.shadowRoot!.querySelectorAll('.title');
    expect(titleElements.length).toBe(3);
    spyOn(httpClient, 'delete').and.returnValue(
      Promise.resolve(<Response>{ status: 200 }) // Return value not important -> just dont throw error
    );
    const profileComponent: ProfileComponent = <ProfileComponent>LitElement;
    await profileComponent.deleteMessage(<Message>messages[0]);
    titleElements = LitElement.shadowRoot!.querySelectorAll('.title');
    expect(titleElements.length).toBe(2);
  });
});
