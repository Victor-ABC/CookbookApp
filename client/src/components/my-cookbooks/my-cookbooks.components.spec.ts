/* Autor: Felix Schaphaus */

import { LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import './my-cookbooks.component';

describe('app-my-cookbooks', () => {
  let element: LitElement;

  const cookbooks = [
    {
      id: 'book-id1',
      title: 'Buch 1'
    },
    {
      id: 'book-id2',
      title: 'Buch 2'
    }
  ];

  beforeEach(() => {
    element = document.createElement('app-my-cookbooks') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should fetch the cookbooks', async () => {
    spyOn(httpClient, 'get');
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should add a cookbook', async () => {
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { cookbooks } });
        }
      } as Response)
    );

    const newCookbook = {
      id: 'book-id3',
      title: 'Neues Kochbuch'
    };

    spyOn(httpClient, 'post').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve(newCookbook);
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const titleElem = element.shadowRoot!.querySelector('input[name="title"]') as HTMLInputElement;
    titleElem.value = newCookbook.title;
    const formElem = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    formElem.dispatchEvent(new Event('submit'));

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const cookbookPreviewElems = element.shadowRoot!.querySelectorAll('app-cookbook-preview');
    expect(cookbookPreviewElems.length).toBe(3);

    expect(httpClient.post).toHaveBeenCalledTimes(1);

    const titleSlotElems = element.shadowRoot!.querySelectorAll('span[slot="title"]');
    expect((titleSlotElems[2] as HTMLElement).innerText).toBe(newCookbook.title);

    expect(titleElem.value).toBeFalsy();
  });

  it('should refuse to add an empty cookbook', async () => {
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { cookbooks } });
        }
      } as Response)
    );

    spyOn(httpClient, 'post');

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    // submit without setting title
    const formElem = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    formElem.dispatchEvent(new Event('submit'));

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const cookbookPreviewElems = element.shadowRoot!.querySelectorAll('app-cookbook-preview');
    expect(cookbookPreviewElems.length).toBe(2);

    expect(httpClient.post).toHaveBeenCalledTimes(0);
  });

  it('should fail to add a cookbook', async () => {
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { cookbooks } });
        }
      } as Response)
    );

    spyOn(httpClient, 'post').and.throwError;

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const titleElem = element.shadowRoot!.querySelector('input[name="title"]') as HTMLInputElement;
    titleElem.value = 'Neues Kochbuch';
    const formElem = element.shadowRoot!.querySelector('form') as HTMLFormElement;
    formElem.dispatchEvent(new Event('submit'));

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const cookbookPreviewElems = element.shadowRoot!.querySelectorAll('app-cookbook-preview');
    expect(cookbookPreviewElems.length).toBe(2);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should delete a cookbook', async () => {
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { cookbooks } });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    spyOn(httpClient, 'delete');

    const cookbookPreviewElem = element.shadowRoot!.querySelector('app-cookbook-preview') as HTMLElement;
    cookbookPreviewElem.dispatchEvent(new Event('appcookbookdeleteclick'));

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const cookbookPreviewElems = element.shadowRoot!.querySelectorAll('app-cookbook-preview');
    expect(cookbookPreviewElems.length).toBe(1);

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
  });
});
