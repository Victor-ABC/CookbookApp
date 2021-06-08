/* Autor: Arne Hegemann */

import { LitElement } from "lit-element";
import { httpClient } from "../../http-client";
import './recipes.component';
import { router } from '../../router';

describe('app-recipes', () => {
    let element: LitElement;

    const recipes = [
        {
          id: 'recipe1',
          title: 'Erste Rezept',
          description: 'Suspendisse dui purus, scelerisque at, vulputate vitae, pretium mattis, nunc. Mauris eget neque at sem venenatis eleifend. Ut nonummy.',
          image: "https://www.iana.org/_img/2013.1/rir-map.svg"
        },
        {
          id: 'recipe2',
          title: 'Drölfte Rezept',
          description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.',
          image: "https://www.iana.org/_img/2013.1/rir-map.svg"
        }
      ];

    beforeEach(() => {
      element = document.createElement('app-recipes') as LitElement;
      document.body.appendChild(element);
    });

    afterEach(() => {
      element.remove();
    });

    it('should get the recipes', async () => {
      spyOn(httpClient, 'get');
      await element.updateComplete;
      expect(httpClient.get).toHaveBeenCalledTimes(1);
    });

    it('should render the recipes', async () => {
      spyOn(httpClient, 'get').and.returnValue(
        Promise.resolve({
          json() {
            return Promise.resolve({ results: { recipes } });
          }
        } as Response)
      );
          
      await element.updateComplete;
      element.requestUpdate();
      await element.updateComplete;

      //header
      const titleElem = element.shadowRoot!.querySelector('h1') as HTMLElement;
      expect(titleElem.innerText).toBe('Rezepte');

      //recipes count
      const recipesElements = element.shadowRoot!.querySelectorAll('app-recipe-list-item');
      expect(recipesElements.length).toBe(2);

      //images
      const imageElements = element.shadowRoot!.querySelectorAll('img[slot="image"]');
      expect((imageElements[0] as HTMLImageElement).src).toBe(recipes[0].image);
      expect((imageElements[1] as HTMLImageElement).src).toBe(recipes[1].image);
      
      //titles
      const titleElements = element.shadowRoot!.querySelectorAll('span[slot="title"]');
      expect((titleElements[0] as HTMLElement).innerText).toBe(recipes[0].title);
      expect((titleElements[1] as HTMLElement).innerText).toBe(recipes[1].title);

      //descriptions
      const descriptionElements = element.shadowRoot!.querySelectorAll('span[slot="description"]');
      expect((descriptionElements[0] as HTMLElement).innerText).toBe(recipes[0].description);
      expect((descriptionElements[1] as HTMLElement).innerText).toBe(recipes[1].description.substring(0, 250) + "...");
    });

    it('should render user recipes header', async () => {
      element.setAttribute('own', 'true');

      spyOn(httpClient, 'get');
      await element.updateComplete;
      expect(httpClient.get).toHaveBeenCalledTimes(1);

      //header
      const titleElem = element.shadowRoot!.querySelector('h1') as HTMLElement;
      expect(titleElem.innerText).toBe('Deine Rezepte');
    });

    it('should navigate to a recipe', async () => {
      spyOn(httpClient, 'get').and.returnValue(
        Promise.resolve({
          json() {
            return Promise.resolve({ results: { recipes } });
          }
        } as Response)
      );
          
      await element.updateComplete;
      element.requestUpdate();
      await element.updateComplete;      

      spyOn(router, 'navigate');

      //Get and check existence of recipe element 
      const recipesElements = element.shadowRoot!.querySelectorAll('app-recipe-list-item');
      expect(recipesElements.length).toBe(2);

      //Click a recipe element 
      (recipesElements[0] as HTMLElement).dispatchEvent(new Event('apprecipedetailsclick'))
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });

    it('should navigate to a new recipe', async () => {
      element.setAttribute('own', 'true');
      
      spyOn(httpClient, 'get');
      await element.updateComplete;
      expect(httpClient.get).toHaveBeenCalledTimes(1);      
      
      spyOn(router, 'navigate');

      //Click "Neues Rezept"-Button
      let newButton = element.shadowRoot!.querySelector('button[id="newRecipe"]');
      (newButton as HTMLElement).dispatchEvent(new Event('click'));
      expect(router.navigate).toHaveBeenCalledTimes(1);
    });
});
