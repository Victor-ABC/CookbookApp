/* Autor: Victor Corbet */

import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';
import { Game } from './game/game';
import { internalProperty } from 'lit-element';

const sharedCSS = require('../shared.scss');
const snakeCSS = require('./snake.component.scss');
@customElement('app-snake-game')
export class SnakeGameComponent extends PageMixin(LitElement) {
  static styles = [
    css`
      ${unsafeCSS(sharedCSS)}
    `,
    css`
      ${unsafeCSS(snakeCSS)}
    `
  ];

  @internalProperty()
  visible = 'visible';

  @query('#scale-select')
  scaleElement!: HTMLSelectElement;

  @query('#speed-select')
  speedElement!: HTMLSelectElement;

  render() {
    return html`
      <details>
        <summary id="summary-kuchen">
          Kuchen im Backofen? Suppe auf dem Herd?
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
            <select id="scale-select" class="game-header-item">
              <option class="item-class" value="10">Klein</option>
              <option class="item-class" value="20">Mittel</option>
              <option class="item-class" value="30">Groß</option>
              <option class="item-class" value="50">XXL</option>
            </select>
            <select id="speed-select" class="game-header-item">
              <option class="item-class" value="400">Langsam</option>
              <option class="item-class" value="250" selected>Normal</option>
              <option class="item-class" value="180">Schnell</option>
            </select>
            <button id="start" class="game-header-item btn btn-success" @click="${this.onClick}">Start</button>
            <button id="toggleVisibility" class="game-header-item btn btn-success" @click="${this.toggleVisibility}">
              show Arrows
            </button>
          </div>
          <canvas id="canvas" class="canvas" width="300" height="300"></canvas>
          <div id="flex-container-keys" value="${this.visible}">
            <div class="flex-container-keys-row">
              <div class="arrow unseen"></div>
              <div class="arrow arrow-up" @click="${this.throwKeyEventUp}"></div>
              <div class="arrow unseen"></div>
            </div>
            <div class="flex-container-keys-row">
              <div class="arrow arrow-left" @click="${this.throwKeyEventLeft}"></div>
              <div class="arrow arrow-down" @click="${this.throwKeyEventDown}"></div>
              <div class="arrow arrow-right" @click="${this.throwKeyEventRight}"></div>
            </div>
          </div>
          <details id="detail-box">
            <summary>Info</summary>
            <p id="info">
              In diesem Spiel geht es darum, so viel wie möglich zu essen. Du steuerst die Schlange mit den Pfeiltasten
            </p>
          </details>
        </div>
      </details>
    `;
  }
  async onClick() {
    Game.startTheGame(
      Number(this.scaleElement.value),
      this.renderRoot.querySelector('#gameField')!,
      Number(this.speedElement.value)
    );
    this.shadowRoot?.querySelector('#game-header-container')!.classList.add('hidden');
  }
  async toggleVisibility() {
    if (this.visible === 'visible') {
      this.visible = 'invisible';
    } else {
      this.visible = 'visible';
    }
  }
  throwKeyEventUp() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp' }));
  }
  throwKeyEventDown() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
  }
  throwKeyEventLeft() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft' }));
  }
  throwKeyEventRight() {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
  }
}
