/* Autor: Victor Corbet */

import { LitElement } from 'lit-element';
import './snake.component';
import { SnakeGameComponent } from './snake.component';
import { Game } from './game/game';
import { CanvasDAO } from './game/canvas';
import { Fruit } from './game/fruit';
import { Snake } from './game/snake';

describe('app-snake-game', () => {
  let element: LitElement;

  beforeEach(async () => {
    element = document.createElement('app-snake-game') as LitElement;
    document.body.appendChild(element);
    await element.updateComplete;
    spyOn(Game, 'startTheGame');
  });

  afterEach(() => {
    element.remove();
  });
  it('should call the static method "start the Game" ', () => {
    const gameComp: SnakeGameComponent = <SnakeGameComponent>element;
    gameComp.onClick();
    expect(Game.startTheGame).toHaveBeenCalledTimes(1);
  });
  it('should render the title "text-zeitvertreib"', async () => {
    const h1Elem = element.shadowRoot!.querySelector('#text-zeitvertreib') as HTMLElement;
    expect(h1Elem.innerText).toBe('Hier ein kleiner Zeitvertreib');
  });

  it('should set default value on "Normal"', async () => {
    const h1Elem = element.shadowRoot!.querySelector('option[value="250"]') as HTMLElement;
    expect(h1Elem.innerText).toBe('Normal');
  });
  it('should create only one object in RAM because "Canvas" ("Canvas" = Class Canvas = its only job is to interact with the real HTMLCanvasElement [Seperation of Concerns]) should be a singleton', async () => {
    const gameField = <HTMLElement>await element.renderRoot.querySelector('#gameField');
    spyOn(CanvasDAO, 'getInstance');
    const instanceA = CanvasDAO.getInstance(1, gameField);
    const instanceB = CanvasDAO.getInstance(6, gameField);
    expect(instanceA).not.toBeNull();
    expect(instanceA).toBe(instanceB); // Test auf Identität
    expect(CanvasDAO.getInstance).toHaveBeenCalledTimes(2);
  });
  it('should create only one object in RAM because "Fruit" should be a singleton', async () => {
    spyOn(Fruit, 'getInstance');
    const instanceA = Fruit.getInstance();
    const instanceB = Fruit.getInstance();
    expect(instanceA).not.toBeNull();
    expect(instanceA).toBe(instanceB); // Test auf Identität
    expect(Fruit.getInstance).toHaveBeenCalledTimes(2);
  });
  it('should create only one object in RAM because "Snake" should be a singleton', async () => {
    spyOn(Snake, 'getInstance');
    const instanceA = Snake.getInstance('green');
    const instanceB = Snake.getInstance('blue');
    expect(instanceA).not.toBeNull();
    expect(instanceA).toBe(instanceB); // Test auf Identität
    expect(Snake.getInstance).toHaveBeenCalledTimes(2);
  });
});
