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
      <summary id="summary-kuchen">Kuchen im Backofen? Suppe auf dem Herd?
        <small id="text-zeitvertreib">Hier ein kleiner Zeitvertreib</small>
      </summary>
      <div id="gameField">
      <div id="title-container">
      <h1>Snake - The Game</h1>
        <span class="snake-icon"></span>
      </div>
      <div id="game-header-container">
        <select id="color-select" class="game-header-item">
          <option class="item-class" value="green">Grün</option>
          <option class="item-class" value="blue">Blau</option>
          <option class="item-class" value="red">Rot</option>
          <option class="item-class" value="rainbow">Regenbogen</option>
        </select>
        <button id="start" class="game-header-item btn btn-success" @click="${this.onClick}">Start</button>
        </div>
        <canvas id="canvas" class="canvas" width="300" height="300"></canvas>
        <details id="detail-box">
          <summary>Info</summary>
          <p id="info"> In diesem Spiel geht es darum, so viel wie möglich zu essen. Du steuerst die Schlange mit den Pfeiltasten <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Arrow_keys.jpg/150px-Arrow_keys.jpg"></p>
        </details>
      </div>
    </details>
    `;
  }
  async onClick() {
    Game.startTheGame(this.renderRoot.querySelector("#gameField")!);
    this.shadowRoot?.querySelector("#game-header-container")!.classList.add("hidden");
  }
}
