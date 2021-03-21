import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { Game } from "./game/game";

const sharedCSS = require('../shared.scss');
const snakeCSS = require('./snake.component.scss');

@customElement('app-snake-game')
class SignInComponent extends PageMixin(LitElement) {
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
      <div id="gameField">
      <h1>Snake - The Game</h1>
        <select id="color-select">
          <option class="item-class" value="green">Grün</option>
          <option class="item-class" value="blue">Blau</option>
          <option class="item-class" value="red">Rot</option>
          <option class="item-class" value="rainbow">Regenbogen</option>
        </select>
        <button id="start" @click="${this.onClick}">Start</button>
        <canvas id="canvas" class="canvas" width="300" height="300"></canvas>
      </div>
    `;
  }
  async onClick() {
    Game.startTheGame(this.renderRoot.querySelector("#gameField")!);
  }
}
