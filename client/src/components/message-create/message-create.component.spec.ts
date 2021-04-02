/* Autor: Victor */

import { LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import './sign-in.component';

describe('app-message-create', () => {
  let MessageCreateElement: LitElement;

  beforeEach(async () => {
    MessageCreateElement = document.createElement('app-message-create') as LitElement;
    document.body.appendChild(MessageCreateElement);
    await MessageCreateElement.updateComplete;
  });

  afterEach(() => {
    MessageCreateElement.remove();
  });

  it('should render the title "Anmelden"', async () => {
    // const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    // expect(h1Elem.innerText).toBe('Anmelden');
    const tasks = [
        { id: 1, title: 'Aufgabe 1', status: 'done' },
        { id: 2, title: 'Aufgabe 2', status: 'open' }
      ];
    spyOn(httpClient, 'get').and.returnValue(
        Promise.resolve({
          json() {
            return Promise.resolve({ results: tasks });
          }
        } as Response)
      );
  });
});
