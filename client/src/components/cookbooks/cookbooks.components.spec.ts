/* Autor: Felix Schaphaus */

import { LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import './cookbooks.component';

describe('app-cookbooks', () => {
  const author = 'John Doe';

  let element: LitElement;

  const cookbooks = [
    {
      id: 'book-id1',
      title: 'Buch 1',
      description: 'Beschreibung 1'
    },
    {
      id: 'book-id2',
      title: 'Buch 2',
      description: 'Beschreibung 2'
    }
  ];

  beforeEach(() => {
    element = document.createElement('app-cookbooks') as LitElement;
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

  it('should render all cookbooks', async () => {
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

    // check title
    const titleElem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(titleElem.innerText).toBe('Alle Kochbücher');

    // check app-cookbook-list-item
    const cookbookPreviewElems = element.shadowRoot!.querySelectorAll('app-cookbook-list-item');
    expect(cookbookPreviewElems.length).toBe(2);

    // check slot title
    const titleSlotElems = element.shadowRoot!.querySelectorAll('span[slot="title"]');
    expect((titleSlotElems[0] as HTMLElement).innerText).toBe(cookbooks[0].title);
    expect((titleSlotElems[1] as HTMLElement).innerText).toBe(cookbooks[1].title);

    // check slot description
    const descriptionSlotElems = element.shadowRoot!.querySelectorAll('span[slot="description"]');
    expect((descriptionSlotElems[0] as HTMLElement).innerText).toBe(cookbooks[0].description);
    expect((descriptionSlotElems[1] as HTMLElement).innerText).toBe(cookbooks[1].description);
  });

  it('should display user specific headline', async () => {
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { author, cookbooks } });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    // check title
    const titleElem = element.shadowRoot!.querySelector('h1') as HTMLElement;
    expect(titleElem.innerText).toBe(`${author}'s Kochbücher`);
  });

  it('should show details', async () => {
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

    spyOn(router, 'navigate');

    const cookbookPreviewElem = element.shadowRoot!.querySelector('app-cookbook-list-item') as HTMLElement;
    cookbookPreviewElem.dispatchEvent(new Event('appcookbookdetailsclick'));

    expect(router.navigate).toHaveBeenCalledTimes(1);
  });

  it('should fail to fetch users cookbooks', async () => {
    spyOn(httpClient, 'get').and.throwError('Error');

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    expect(httpClient.get).toThrowError();
  });

  it('should add a cookbook', async () => {
    (element as any).own = true; // enable own cookbooks

    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { author, cookbooks } });
        }
      } as Response)
    );

    const newCookbook = {
      id: 'book-id3',
      title: 'Neues Kochbuch',
      description: 'Beschreibung 3'
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

    const cookbookListItemElems = element.shadowRoot!.querySelectorAll('app-cookbook-list-item');
    expect(cookbookListItemElems.length).toBe(3);

    expect(httpClient.post).toHaveBeenCalledTimes(1);

    const titleSlotElems = element.shadowRoot!.querySelectorAll('span[slot="title"]');
    expect((titleSlotElems[2] as HTMLElement).innerText).toBe(newCookbook.title);

    const descriptionSlotElems = element.shadowRoot!.querySelectorAll('span[slot="description"]');
    expect((descriptionSlotElems[2] as HTMLElement).innerText).toBe(newCookbook.description);

    expect(titleElem.value).toBeFalsy();
  });

  it('should refuse to add an empty cookbook', async () => {
    (element as any).own = true;

    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { author, cookbooks } });
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

    const cookbookListItemElems = element.shadowRoot!.querySelectorAll('app-cookbook-list-item');
    expect(cookbookListItemElems.length).toBe(2);

    expect(httpClient.post).toHaveBeenCalledTimes(0);
  });

  it('should fail to add a cookbook', async () => {
    (element as any).own = true;

    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { author, cookbooks } });
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

    const cookbookListItemElems = element.shadowRoot!.querySelectorAll('app-cookbook-list-item');
    expect(cookbookListItemElems.length).toBe(2);

    expect(httpClient.post).toHaveBeenCalledTimes(1);
  });

  it('should delete a cookbook', async () => {
    (element as any).own = true;

    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: { author, cookbooks } });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    spyOn(httpClient, 'delete');

    const cookbookListItemElem = element.shadowRoot!.querySelector('app-cookbook-list-item') as HTMLElement;
    cookbookListItemElem.dispatchEvent(new Event('appcookbookdeleteclick'));

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const cookbookListItemElems = element.shadowRoot!.querySelectorAll('app-cookbook-list-item');
    expect(cookbookListItemElems.length).toBe(1);

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
  });
});
