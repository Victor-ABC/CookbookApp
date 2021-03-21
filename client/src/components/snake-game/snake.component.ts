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
    <details>
      <summary>Kuchen im Backofen? Suppe auf dem Herd?</summary>
      <div id="gameField">
      <div id="title-container">
      <h1>Snake - The Game</h1>
        <span class="snake-icon"></span>
      </div>
        <select id="color-select">
          <option class="item-class item-green" value="green">Grün</option>
          <option class="item-class item-blue" value="blue">Blau</option>
          <option class="item-class item-red" value="red">Rot</option>
          <option class="item-class item-rainbow" value="rainbow">Regenbogen</option>
        </select>
        <button id="start" class="btn btn-success" @click="${this.onClick}">Start</button>
        <canvas id="canvas" class="canvas" width="300" height="300"></canvas>
      </div>
    </details>
    `;
  }
  async onClick() {
    Game.startTheGame(this.renderRoot.querySelector("#gameField")!);
  }
}
