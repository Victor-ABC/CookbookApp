/* Autor: Victor */

import { LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import { CreateMessageComponent } from './message-create.component';
import './message-create.component';

describe('app-message-create', () => {
  let LitElement: LitElement;
  beforeEach(async () => {
    LitElement = document.createElement('app-message-create') as LitElement;
    document.body.appendChild(LitElement);
    await LitElement.updateComplete;
  });

  afterEach(() => {
    LitElement.remove();
  });

  it('should NOT send post request to api-server because HTMLInputElement is empty so post would be useless', async () => {
    spyOn(httpClient, 'post').and.returnValue(
      Promise.resolve(<Response>{
        json() {
          return Promise.resolve({});
        }
      })
    );
    const createMessageComponent = <CreateMessageComponent>LitElement;
    await createMessageComponent.checkIfNameExists();
    expect(createMessageComponent.shadowRoot!.querySelector('#name-check')?.innerHTML).toBe('placeHolder');
    expect(httpClient.post).toHaveBeenCalledTimes(0);
  });

  it('should send post request to api-server one time and render errorTEXT', async () => {
    const onPostSpy = spyOn(httpClient, 'post').and.returnValue(
      Promise.resolve(<Response>{
        json() {
          return Promise.resolve({});
        }
      })
    );
    const createMessageComponent = <CreateMessageComponent>LitElement;
    const nameInput = <HTMLInputElement>createMessageComponent.shadowRoot!.querySelector('#name');
    nameInput.value = 'benutzer1';
    await createMessageComponent.checkIfNameExists();
    expect(onPostSpy).toHaveBeenCalledTimes(1);
    expect(createMessageComponent.shadowRoot!.querySelector('#name-check')?.innerHTML).toBe('Benutzer existiert nicht');
  });

  it('should send one-post request to api-server one time and render successTEXT', async () => {
    const onPostSpy = spyOn(httpClient, 'post').and.returnValue(
      Promise.reject(<Response>{
        json() {
          return Promise.reject({});
        }
      })
    );
    const createMessageComponent = <CreateMessageComponent>LitElement;
    const nameInput = <HTMLInputElement>createMessageComponent.shadowRoot!.querySelector('#name');
    nameInput.value = 'benutzer1';
    await createMessageComponent.checkIfNameExists();
    expect(onPostSpy).toHaveBeenCalledTimes(1);
    expect(createMessageComponent.shadowRoot!.querySelector('#name-check')?.innerHTML).toBe('Benutzer existiert');
  });

  it('value should initially be empty', () => {
    const div = LitElement.shadowRoot!.querySelector('#name-check') as HTMLDivElement;
    expect(div.getAttribute('value')).toBe('');
  });
});
