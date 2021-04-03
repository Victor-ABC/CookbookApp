/* Autor: Victor Corbet */

import { LitElement } from 'lit-element';
import { SignInComponent } from './sign-in.component';
import './sign-in.component';

describe('app-sign-in', () => {
  let litElement: LitElement;

  beforeEach(async () => {
    litElement = document.createElement('app-sign-in') as LitElement;
    document.body.appendChild(litElement);
    await litElement.updateComplete;
  });

  afterEach(() => {
    litElement.remove();
  });

  it('should render the title "Anmelden"', async () => {
    const h1Elem = litElement.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(h1Elem.innerText).toBe('Anmelden');
  });
});