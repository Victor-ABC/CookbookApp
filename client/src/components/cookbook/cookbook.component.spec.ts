/* Autor: Felix Schaphaus */

import { LitElement } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import './cookbook.component';

describe('app-cookbook', () => {
  let element: LitElement;

  const details = {
    id: 'cookbook-id',
    title: 'Mein Kochbuch',
    description: 'Meine Kochbuchbeschreibung',
    author: {
      id: 'user-id',
      name: 'Benutzer'
    },
    recipes: [
      {
        id: 'recipe-id1',
        title: 'Rezept 1',
        description: 'Rezeptbeschreibung 1'
      },
      {
        id: 'recipe-id2',
        title: 'Rezept 2',
        description: 'Rezeptbeschreibung 2'
      }
    ]
  };

  beforeEach(() => {
    element = document.createElement('app-cookbook') as LitElement;
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });

  it('should fetch the cookbook details', async () => {
    spyOn(httpClient, 'get');
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(1);
  });

  it('should render the cookbook details', async () => {
    // add cookbook details
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: details });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    // check title
    const titleElem = element.shadowRoot!.querySelector('.header > h1') as HTMLElement;
    expect(titleElem.innerText).toBe(details.title);

    // check description
    const descriptionElem = element.shadowRoot!.querySelector('.header > p') as HTMLElement;
    expect(descriptionElem.innerText.substr(0, details.description.length)).toBe(details.description);

    // check author
    const authorElem = element.shadowRoot!.querySelector('.author') as HTMLElement;
    expect(authorElem.innerText).toBe(`von ${details.author.name}`);

    // check app-cookbook-details
    const detailsElems = element.shadowRoot!.querySelectorAll('app-cookbook-details');
    expect(detailsElems.length).toBe(2);

    // check slot title
    const titleSlotElems = element.shadowRoot!.querySelectorAll('span[slot="title"]');
    expect(titleSlotElems.length).toBe(2);
    expect((titleSlotElems[0] as HTMLElement).innerText).toBe(details.recipes[0].title);
    expect((titleSlotElems[1] as HTMLElement).innerText).toBe(details.recipes[1].title);

    // check slot description
    const descriptionSlotElems = element.shadowRoot!.querySelectorAll('span[slot="description"]');
    expect(descriptionSlotElems.length).toBe(2);
    expect((descriptionSlotElems[0] as HTMLElement).innerText).toBe(details.recipes[0].description);
    expect((descriptionSlotElems[1] as HTMLElement).innerText).toBe(details.recipes[1].description);
  });

  it('should delete one cookbook details element', async () => {
    // add cookbook details
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: details });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    // delete one cookbook details element
    spyOn(httpClient, 'delete');

    let detailsElems = element.shadowRoot!.querySelectorAll('app-cookbook-details');
    detailsElems[0].dispatchEvent(new Event('appcookbookdeleteclick'));

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    detailsElems = element.shadowRoot!.querySelectorAll('app-cookbook-details');
    expect(detailsElems.length).toBe(1);

    expect(httpClient.delete).toHaveBeenCalledTimes(1);
  });

  it('should update cookbook title and description', async () => {
    // add cookbook details
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: details });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    // update cookbook title and description
    spyOn(httpClient, 'patch');

    const newTitleElem = element.shadowRoot!.querySelector('input[name="new-title"]') as HTMLInputElement;
    newTitleElem.value = 'Neuer Kochbuchtitel';

    const newDescriptionElem = element.shadowRoot!.querySelector(
      'textarea[name="new-description"]'
    ) as HTMLTextAreaElement;
    newDescriptionElem.value = 'Neue Beschreibung';

    const saveElem = element.shadowRoot!.querySelector('button.btn-success') as HTMLButtonElement;
    saveElem.click();

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    const titleElem = element.shadowRoot!.querySelector('.header > h1') as HTMLElement;
    expect(titleElem.innerText).toBe('Neuer Kochbuchtitel');

    const descriptionElem = element.shadowRoot!.querySelector('span.description') as HTMLElement;
    expect(descriptionElem.innerText).toBe('Neue Beschreibung');

    expect(httpClient.patch).toHaveBeenCalledTimes(1);
  });

  it('should navigate to authors cookbooks', async () => {
    // add cookbook details
    spyOn(httpClient, 'get').and.returnValue(
      Promise.resolve({
        json() {
          return Promise.resolve({ results: details });
        }
      } as Response)
    );

    await element.updateComplete;
    element.requestUpdate();
    await element.updateComplete;

    spyOn(router, 'navigate');

    const authorElem = element.shadowRoot!.querySelector('span.author') as HTMLElement;
    authorElem.click();

    expect(router.navigate).toHaveBeenCalledTimes(1);
  });
});
