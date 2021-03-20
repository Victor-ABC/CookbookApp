import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { Game } from "./game/game";

const sharedCSS = require('../shared.scss');
const snakeCSS = require('./snake.component.scss');

@customElement('app-snake-game')
class SignInComponent extends PageMixin(LitElement) {
  createRenderRoot() {
    return this;
  }
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(snakeCSS)}
    `
  ];
  render() {
    return html`
      ${this.renderNotification()}
      <h1>Snake - The Game</h1>
      <div id="gameField">
        <select id="color-select">
          <option class="item-class" value="green">grün</option>
          <option class="item-class" value="blue">blau</option>
          <option class="item-class" value="red">rot</option>
        </select>
        <button id="start" @click="${this.onClick}">Start</button>
        <canvas style="background-color : grey;" id="canvas" class="canvas" width="300" height="300"></canvas>
      </div>
    `;
  }
  async onClick() {
    Game.startTheGame();
  }
}
