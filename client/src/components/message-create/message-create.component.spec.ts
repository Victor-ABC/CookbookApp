/* Autor: Victor */

import { LitElement } from 'lit-element';
import './message-create.component';

describe('app-message-create', () => {
  let element: LitElement;
  beforeEach(async () => {
    element = document.createElement('app-message-create') as LitElement;
    document.body.appendChild(element);
    await element.updateComplete;
  });

  afterEach(() => {
    element.remove();
  });

  it('should render the title "Nachrichten Schicken"', async () => {
    const h1Elem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).toBe('Nachrichten schicken');
  });

  it('value should initially be empty', () => {
    const div = element.shadowRoot!.querySelector('#name-check') as HTMLDivElement;
    expect(div.getAttribute('value')).toBe('');
  });
});
