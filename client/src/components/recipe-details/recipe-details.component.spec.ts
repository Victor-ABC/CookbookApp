/* Autor: Arne Hegemann */

import { LitElement } from "lit-element";
import { exception } from "node:console";
import { httpClient } from "../../http-client";
import './recipe-details.component';

describe('app-recipes', () => {
  let element: LitElement;

  const recipeNew = {
    id: 'new',
    title: 'Drölfte Rezept',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.',
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC",
    ingredients: [
      {
        name: "Kartoffel",
        quantity: 10,
        unit: "gram"
      },
      {
        name: "Wasser",
        quantity: 10,
        unit: "milliliter"
      },
      {
        name: "Möhre",
        quantity: 5,
        unit: "piece"
      },
      {
        name: "Salz",
        quantity: 0,
        unit: ""
      }
    ]
  };

  const recipe = {
    id: 'recipe2',
    title: 'Drölfte Rezept',
    description: 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Maecenas porttitor congue massa. Fusce posuere, magna sed pulvinar ultricies, purus lectus malesuada libero, sit amet commodo magna eros quis urna. Nunc viverra imperdiet enim. Fusce est. Vivamus a tellus.',
    image: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAD0lEQVQIHQEEAPv/AP8AAAMBAQDHBpJvAAAAAElFTkSuQmCC",
    ingredients: [
      {
        name: "Kartoffel",
        quantity: 10,
        unit: "gram"
      },
      {
        name: "Wasser",
        quantity: 10,
        unit: "milliliter"
      },
      {
        name: "Möhre",
        quantity: 5,
        unit: "piece"
      },
      {
        name: "Salz",
        quantity: 0,
        unit: ""
      }
    ]
  };  
  
  const cookbooks = [
    {
      id: 'book1',
      title: 'Erste Buch',
      description: 'Buch 1'
    },
    {
      id: 'book2',
      title: 'Zweite Buch',
      description: 'Buch 2'
    },
    {
      id: 'boo42',
      title: 'Zweiundvierzigste Buch',
      description: 'Buch 42'
    }
  ];

  beforeEach(() => {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 10000;
    element = document.createElement('app-recipe-details') as LitElement;      
    document.body.appendChild(element);
  });

  afterEach(() => {
    element.remove();
  });    

  it('should get the recipe details', async () => {
    element.setAttribute('recipeId', 'recipe2');

    spyOn(httpClient, 'get');
    await element.requestUpdate();
    await element.updateComplete;
    expect(httpClient.get).toHaveBeenCalledTimes(2);
  });

  // it('should render the recipe details', async () => {

    // spyOn(httpClient, 'get').and.returnValues(
    //   Promise.resolve({ json() { return Promise.resolve({ results: cookbooks }); } } as Response), 
    //   Promise.resolve({ json() { return Promise.resolve({ results: recipe }); } } as Response)
    // );

    // await element.updateComplete;
    // element.requestUpdate();
    // await element.updateComplete;

    // //header
    // const headerElement = element.shadowRoot!.getElementById('recipeName') as HTMLElement;
    // expect(headerElement.innerText).toBe("Ihr Rezept \"" + recipe.title + "\"");

    // //title
    // const titleElement = element.shadowRoot!.getElementById('title') as HTMLInputElement
    // expect(titleElement.value).toBe(recipe.title);

    // //description
    // const descriptionElement = element.shadowRoot!.getElementById('description') as HTMLInputElement;
    // expect(descriptionElement.value).toBe(recipe.description);

    // //selectedImage
    // const imageElement = element.shadowRoot!.getElementById('selectedImage') as HTMLImageElement;
    // expect(imageElement.src).toBe(recipe.image);

    // //selectedImageCopy
    // const imageCopyElement = element.shadowRoot!.getElementById('selectedImageCopy') as HTMLImageElement;
    // expect(imageCopyElement.src).toBe(recipe.image);

    // //ingredients count
    // const ingredientElements = element.shadowRoot!.querySelectorAll('app-ingredient');
    // expect(ingredientElements.length).toBe(4);

    //   /*TODO: Figure out the code below.
    //    * This doesn't work and I don't know why. 
    //    * Somehow there seems to be no Shadowtree inside the ingredients (undefined).
    //    * But manual testing in the browser proves that there is indeed a Shadowtree.
    //    * Otherwise the "recipe-details" wouldn't even work as the code is using the fact that there is a Shadowtree.
    //    */

    //   //ingredient0
    //   // const ingredient0 = ingredientElements[1];
    //   // expect((<HTMLInputElement>ingredient0!.shadowRoot!.getElementById('ingredient')).value).toBe(recipe.ingredients[0].name);
    //   // expect((<HTMLInputElement>ingredient0!.shadowRoot!.getElementById('quantity')).value).toBe(recipe.ingredients[0].quantity.toString());
    //   // expect((<HTMLInputElement>ingredient0!.shadowRoot!.getElementById('unit')).value).toBe(recipe.ingredients[0].unit);

    //   // //ingredient1
    //   // const ingredient1 = ingredientElements[2];
    //   // expect((<HTMLInputElement>ingredient1!.shadowRoot!.getElementById('name')).value).toBe(recipe.ingredients[0].name);
    //   // expect((<HTMLInputElement>ingredient1!.shadowRoot!.getElementById('quantity')).value).toBe(recipe.ingredients[0].quantity.toString());
    //   // expect((<HTMLInputElement>ingredient1!.shadowRoot!.getElementById('unit')).value).toBe(recipe.ingredients[0].unit);

    //   // //ingredient2
    //   // const ingredient2 = ingredientElements[3];
    //   // expect((<HTMLInputElement>ingredient2!.shadowRoot!.getElementById('name')).value).toBe(recipe.ingredients[0].name);
    //   // expect((<HTMLInputElement>ingredient2!.shadowRoot!.getElementById('quantity')).value).toBe(recipe.ingredients[0].quantity.toString());
    //   // expect((<HTMLInputElement>ingredient2!.shadowRoot!.getElementById('unit')).value).toBe(recipe.ingredients[0].unit);

    //   // //ingredient3
    //   // const ingredient3 = ingredientElements[4];
    //   // expect((<HTMLInputElement>ingredient3!.shadowRoot!.getElementById('name')).value).toBe(recipe.ingredients[0].name);
  // });

  // it('should delete a recipe', async () => {
  //   spyOn(httpClient, 'get').and.returnValue(
  //     Promise.resolve({
  //       json() {
  //         return Promise.resolve({ results: recipe });
  //       }
  //     } as Response)
  //   );
      
  //   await element.updateComplete;
  //   element.requestUpdate();
  //   await element.updateComplete;

  //   spyOn(httpClient, 'delete');

  //   // delete recipe
  //   let deleteButton = element.shadowRoot!.getElementById('delete');
  //   (<HTMLElement> deleteButton).dispatchEvent(new Event('click'));

  //   expect(httpClient.delete).toHaveBeenCalledTimes(1);
  // });

  // it('should post a recipe', async () => {
  //   spyOn(httpClient, 'get').and.returnValue(
  //     Promise.resolve({
  //       json() {
  //         return Promise.resolve({ results: recipeNew });
  //       }
  //     } as Response)
  //   );
      
  //   await element.updateComplete;
  //   element.requestUpdate();
  //   await element.updateComplete;

  //   spyOn(httpClient, 'post');

  //   // save(post) recipe
  //   let form = element.shadowRoot!.getElementById('form');
  //   (<HTMLElement> form).dispatchEvent(new Event('submit'));

  //   expect(httpClient.post).toHaveBeenCalledTimes(1);  
  // });

  // it('should patch a recipe', async () => {
  //   spyOn(httpClient, 'get').and.returnValue(
  //     Promise.resolve({
  //       json() {
  //         return Promise.resolve({ results: recipe });
  //       }
  //     } as Response)
  //   );
      
  //   await element.updateComplete;
  //   element.requestUpdate();
  //   await element.updateComplete;

  //   spyOn(httpClient, 'patch');

  //   // save(patch) recipe
  //   let form = element.shadowRoot!.getElementById('form');
  //   (<HTMLElement> form).dispatchEvent(new Event('submit'));

  //   expect(httpClient.patch).toHaveBeenCalledTimes(1);      
  // });
})