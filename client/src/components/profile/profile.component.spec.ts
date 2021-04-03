/* Autor: Victor Corbet */

import { httpClient } from '../../http-client';
import { LitElement } from 'lit-element';
import './profile.component';

describe('app-profile', () => {
  let profileElement: LitElement;


  beforeEach(() => {
    profileElement = document.createElement('app-profile') as LitElement;
    document.body.appendChild(profileElement);
  });

  afterEach(() => {
    profileElement.remove();
  });

  it('should render 3 messages after get-request and do no post request', async () => {
    const messages = [
      { title: 'Deine Rezepte sind Super', content: 'Hallo,  Ich habe letztens dein Pfannenkuchenrezept ausprobiert und es war super!!! Danke', date: 'am 20.10.2021 um 18:40 Uhr' },
      { title: 'Kuchen angebrannt', content: 'Hallo,  Ich habe dein Kuchenrezept nachgekocht und die backzeit ist viieel zu hoch :( ', date: 'am 12.11.2021 um 14:17 Uhr' },
      { title: 'Verbesserungsvorschlag', content: 'Moin moin, Wenn man in deine Pfannenkuchen noch Vanillezucker machen würde, waeren sie nicht so langweilig.', date: 'am 17.11.2021 um 12:56 Uhr' }
    ];
    spyOn(httpClient, 'get').and.returnValue(
        Promise.resolve(<Response>{
          json() {
            return Promise.resolve({ results: messages });
          }
        })
    );
    spyOn(httpClient, 'post');

    await profileElement.updateComplete;
    profileElement.requestUpdate();
    await profileElement.updateComplete;

    const titleElements = profileElement.shadowRoot!.querySelectorAll('.title');
    expect(titleElements.length).toBe(3);
    expect(httpClient.post).toHaveBeenCalledTimes(0);
  });
});

