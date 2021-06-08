/* Autor: Arne Hegemann */

import { css, customElement, html, internalProperty, LitElement, property, query, unsafeCSS } from 'lit-element';
import { httpClient } from '../../http-client';
import { router } from '../../router';
import { PageMixin } from '../page.mixin';

interface Ingredient {
  name: string;
  unit: string;
  quantity: number;
}

interface Cookbook {
  id: string;
  title: string;
  description: string;
}

const sharedCSS = require('../shared.scss');
const recipeCSS = require('./recipe-details.component.scss');

var ingredientCount = 0;

@customElement('app-recipe-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class RecipeDetailsComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(recipeCSS)}
    `
  ];

  //Workaround for "updateComplete" (Autor: Prof. Dr. Norman Lahme-Hütig (FH Münster))
  public initializeComplete = new Promise<boolean>(resolve => {
    this.resolveInitialized = resolve;
  });

  private resolveInitialized!: (value: boolean) => void;
  //Workaround for "updateComplete" - End

  @property()
  recipeId!: string;

  @query('form')
  form!: HTMLFormElement;

  @query('#recipeName')
  recipeNameElement!: HTMLElement;

  @query('#title')
  titleElement!: HTMLInputElement;

  @query('#description')
  descriptionElement!: HTMLInputElement;

  @query('#cookbook')
  cookbookElement!: HTMLSelectElement;

  @query('#selectImage')
  imageSelectorElement!: HTMLInputElement;

  @query('#selectedImage')
  imageElement!: HTMLImageElement;

  @query('#selectedImageCopy')
  imageCopyElement!: HTMLImageElement;
  
  @query('#addLine')
  addLineElement!: HTMLElement;

  @property()
  title: string = "";

  @property()
  description: string = "";

  @property()
  image: string = "";

  @property()
  ingredients: Ingredient[] = [];

  @property()
  cookbooks: Cookbook[] = [];

  @property()
  cookbookId!: string;

  async firstUpdated() {

    try {
      const respC = await httpClient.get(`/cookbooks/own`);
      const jsonC = (await respC.json()).results;

      this.cookbooks = jsonC.cookbooks;
    }
    catch ({ message }) {
      this.setNotification({ errorMessage: message });
    }

    if (this.recipeId !== "new") {
      try {
        const respR = await httpClient.get(`/recipes/details/${this.recipeId}`);
        const jsonR = (await respR.json()).results;
        
        this.recipeId = jsonR.id;
        this.title = jsonR.title;
        this.description = jsonR.description;
        this.image = jsonR.image;
        this.ingredients = jsonR.ingredients;
      }
      catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    }    

    this.resolveInitialized(true);  
  }

  render() {
    ingredientCount = 0;
    const rVal = html`
      ${this.renderNotification()}
      <h1 id="recipeName">Ihr Rezept${this.title!=="" ? " \"" + this.title + "\"" : ""}</h1>
      <form id="form" @submit="${this.submit}">
      
        <div class="row">
          <input 
            class="form-control form-control-lg" 
            type="text" 
            id="title" 
            name="title" 
            placeholder="Ihr neues Rezept"
            spellcheck="true" 
            autofocus 
            required 
            @change="${this.title_change}" 
            .value=${this.title} 
          />
        </div>
      
        <div class="row">
          <textarea 
            class="form-control form-control-lg" 
            id="description" 
            name="description"
            placeholder="Beschreiben Sie hier Ihr neues Rezept" 
            spellcheck="true" 
            rows="5" 
            required
            .value=${this.description}>
          </textarea>
        </div>

        <div class="row">
          <select 
            class="form-control form-control-lg" 
            id="cookbook" 
            name="cookbook" 
            .value="${this.cookbookId}"
          >
            <option value=""></option>
            ${this.cookbooks.map(
              cookbook => html`
                <option value="${cookbook.id}">${cookbook.title}</option>
              `
            )}
          </select>
        </div>
      
        <div class="row">
          <input 
            class="form-control-file" 
            type="file" 
            id="selectImage" 
            name="selectImage" 
            accept=".jpg,.png"
            style="display: none;" 
            @change="${this.selectImage_change}"
          >
      
          <button 
            class="btn btn-success" 
            type="button" 
            id="selectImageMock" 
            name="selectImageMock"
            @click="${this.selectImageMock_Click}"
          >Durchsuchen...</button>
        </div>
      
        <div class="row">
          <label>
            <input 
              class="imgZoomCheck" 
              type="checkbox" 
              id="imgZoomed" 
              .value="false"
            >

            <img 
              class="imgOriginal" 
              id="selectedImage" 
              src=${this.image}
            >

            <img 
              class="imgCopy" 
              id="selectedImageCopy"              
              src=${this.image}              
            >
          </label>
        </div>
      
          ${this.ingredients.map(
              ingredient => html`
                <app-ingredient 
                  id="ingredient${ingredientCount++}" 
                  .name="${ingredient.name}" 
                  .quantity="${ingredient.quantity}" 
                  .unit="${ingredient.unit}"
                />
              `
          )}
      
        <div class="row">
          <button 
            class="btn btn-success" 
            type="button" 
            id="addLine" 
            name="addLine" 
            @click="${this.addLine_Click}"
          >Zutat hinzufügen</button>
        </div>
      
        <div class="row">
          <button 
            class="btn btn-success" 
            id="save" 
            name="save"
          >Speichern</button>
      
          <button 
            class="btn btn-success" 
            type="button" 
            id="delete" 
            name="delete" 
            @click="${this.delete}"
          >Löschen</button>
        </div>
      </form>
    `;

    return rVal;
  }

  title_change() {
    if (this.titleElement.value) {
      this.recipeNameElement.innerText = `Ihr Rezept "${this.titleElement.value}"`;
    }
    else {
      this.recipeNameElement.innerText = `Ihr Rezept`;
    }
  }

  selectImage_change() {
    let file = this.imageSelectorElement.files?.item(0);

    if (file) {
      let img = this.imageElement;
      let imgCopy = this.imageCopyElement;
      let reader = new FileReader();

      reader.onloadend = function (e) {
        let binary = <string>e.target?.result

        if (binary) {
          img.src = binary;
          imgCopy.src = binary;
        }

      }
      reader.readAsDataURL(file);
    }
  }

  selectImageMock_Click() {
    this.imageSelectorElement.click();
  }

  addLine_Click() {
    const ingredient = document.createElement('app-ingredient');
    ingredient.setAttribute('id', `ingredient${ingredientCount++}`)

    this.addLineElement!.parentElement!.insertAdjacentElement('beforebegin', ingredient);
  }

  async submit(event: Event) {
    event.preventDefault();
    if (this.form.checkValidity()) 
    {
      const recipe = {
        id: ''
        , title: this.titleElement.value
        , description: this.descriptionElement.value
        , image: this.imageElement.src
        , ingredients: this.ingredientsToArray()
      };
      
      try {
        if (this.recipeId === "new") {
          const response = await httpClient.post('/recipes', recipe);
          const json = await response.json();
          this.recipeId = json.id;
        }
        else {
          recipe.id = this.recipeId;
          const response = await httpClient.patch(`/recipes/${this.recipeId}`, recipe);
        }

      } 
      catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }

      if(this.cookbookElement.value) {
        try {
          await httpClient.patch(`/cookbooks/${this.cookbookElement.value}/${this.recipeId}`, {});
        } 
        catch ({ message }) {
          this.setNotification({ errorMessage: message });
        }    
      }
      
      router.navigate(`/recipes/details/${this.recipeId}`);
    }
    else {
      this.form.classList.add('was-validated');
    }
  }

  async delete() {
    if (this.recipeId) {
      try {
        await httpClient.delete(`/recipes/${this.recipeId}`);
        router.navigate(`/my-recipes`);
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  ingredientsToArray() {
    let ingredients = []
    let ingredientElements = this.shadowRoot!.querySelectorAll('app-ingredient');

    for(let i = 0; i < ingredientElements.length; ++i){
      let name = (<HTMLInputElement>ingredientElements[i].shadowRoot!.getElementById('ingredient')).value
      let quantity = (<HTMLInputElement>ingredientElements[i].shadowRoot!.getElementById('quantity')).valueAsNumber;
      let unit = (<HTMLInputElement>ingredientElements[i].shadowRoot!.getElementById('unit')).value;

      let ingredient = { name: name, quantity: quantity, unit: unit };
      ingredients.push(ingredient);
    }

    return ingredients;
  }
}