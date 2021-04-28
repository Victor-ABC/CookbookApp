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

const sharedCSS = require('../shared.scss');
const recipeCSS = require('./recipe-details.component.scss');

var ingredientCount = 0;

@customElement('app-recipe-details')
// eslint-disable-next-line @typescript-eslint/no-unused-vars
class RecipeDetailsComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(recipeCSS)}
    `
  ];

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

  @query('#selectImage')
  imageSelectorElement!: HTMLInputElement;

  @query('#selectedImage')
  imageElement!: HTMLImageElement;
  
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

  async firstUpdated() {
    if (this.recipeId !== "new") {
      try {
        const resp = await httpClient.get(`/recipes/details/${this.recipeId}`);
        const json = (await resp.json()).results;

        this.title = json.title;
        this.description = json.description;
        this.image = json.image;
        this.ingredients = json.ingredients;
      }
      catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  render() {
    //TODO Not-Owner UI
    let page = html`
      ${this.renderNotification()}
      <h1 id="recipeName">Ihr Rezept${this.title!=="" ? " \"" + this.title + "\"" : ""}</h1>
      <form id="form" @submit="${this.submit}">
      
        <div class="row">
          <input class="form-control form-control-lg" type="text" id="title" name="title" placeholder="Ihr neues Rezept"
            spellcheck="true" autofocus required @change="${this.title_change}" .value=${this.title} />
        </div>
      
        <div class="row">
          <textarea class="form-control form-control-lg" id="description" name="description"
            placeholder="Beschreiben Sie hier Ihr neues Rezept" spellcheck="true" rows="5" required
            .value=${this.description}></textarea>
        </div>
      
        <div class="row">
          <input class="form-control-file" type="file" id="selectImage" name="selectImage" accept=".jpg,.png"
            style="display: none;" @change="${this.selectImage_change}">
      
          <button class="btn btn-success" type="button" id="selectImageMock" name="selectImageMock"
            @click="${this.selectImageMock_Click}">Durchsuchen...</button>
        </div>
      
        <div class="row">
          <img id="selectedImage" src="" height="200" src=${this.image}>
        </div>
      
          ${this.ingredients.map(
              ingredient => html`
                <app-ingredient id="ingredient${ingredientCount++}" .name="${ingredient.name}" .quantity="${ingredient.quantity}" .unit="${ingredient.unit}"/>
              `
          )}
      
        <div class="row">
          <button class="btn btn-success" type="button" id="addLine" name="addLine" @click="${this.addLine_Click}">Zutat
            hinzufügen</button>
        </div>
      
        <div class="row">
          <button class="btn btn-success" id="save" name="save">Speichern</button>
      
          <button class="btn btn-success" type="button" id="delete" name="delete" @click="${this.delete}">Löschen</button>
        </div>
`;
    return page;
  }

  title_change() {
    if (this.titleElement.value) {
      this.recipeNameElement.innerText = `Your Recipe "${this.titleElement.value}"`;
    }
    else {
      this.recipeNameElement.innerText = `Your Recipe`;
    }
  }

  selectImage_change() {
    var file = this.imageSelectorElement.files?.item(0);

    if (file) {
      var img = this.imageElement;
      var reader = new FileReader();

      reader.onloadend = function (e) {
        var binary = <string>e.target?.result

        if (binary) {
          img.src = binary;
          img.height = 200;
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
    if (this.form.checkValidity()) {
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
          router.navigate(`/recipe/${json.id}`);
        }
        else {
          recipe.id = this.recipeId;
          const response = await httpClient.patch(`/recipes/${this.recipeId}`, recipe);
          router.navigate(`/recipe/${this.recipeId}`);
        }

      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    }
    else {
      this.form.classList.add('was-validated');
    }
  }

  async delete() {
    if (this.recipeId) {
      try {
        await httpClient.delete(`/recipes/${this.recipeId}`);
      } catch ({ message }) {
        this.setNotification({ errorMessage: message });
      }
    }
  }

  ingredientsToArray() {
    var ingredients = []
    for (let index = 0; index <= ingredientCount; index++) {
      var ingredientNode = this.shadowRoot?.getElementById(`ingredient${index}`);
      if (ingredientNode) {
        var name = (<HTMLInputElement>ingredientNode.shadowRoot?.getElementById('ingredient')).value;
        var quantity = (<HTMLInputElement>ingredientNode.shadowRoot?.getElementById('quantity')).valueAsNumber;
        var unit = (<HTMLInputElement>ingredientNode.shadowRoot?.getElementById('unit')).value;

        var ingredient = { name: name, quantity: quantity, unit: unit };
        ingredients.push(ingredient);
      }
    }

    return ingredients;
  }
}