/* Autor: Victor */

import { Canvas } from './canvas';
import { Fruit } from './fruit';
import { Snake } from './snake';

export class Game {
  private isCurrentlyRunning: boolean;
  private rgbVerlaufIndex: number;
  private rgbVerlauf: string[];
  private snakeColor: string;
  private snake: Snake;
  private fruit: Fruit;
  private canvas: Canvas;
  private gameInterval: NodeJS.Timeout | null = null;
  private gameField: HTMLElement;
  private scale: number;
  private constructor(scale: number, gameField: HTMLElement) {
    // Singleton - Entwurfsmuster
    this.scale = scale;
    this.gameField = gameField;
    const color = gameField.querySelector('#color-select') as HTMLSelectElement;
    this.snakeColor = color.value;
    this.snake = Snake.getInstance(this.snakeColor);
    this.fruit = Fruit.getInstance();
    this.canvas = Canvas.getInstance(scale, gameField);
    this.isCurrentlyRunning = false;
    this.rgbVerlaufIndex = 1;
    this.rgbVerlauf = [
      'rgb(0, 204, 0)',
      'rgb(0, 204, 51)',
      'rgb(0, 204, 102)',
      'rgb(0, 204, 153)',
      'rgb(0, 204, 204)',
      'rgb(0, 153, 204)',
      'rgb(0, 102, 204)',
      'rgb(0, 51, 204)',
      'rgb(0, 0, 204)',
      'rgb(51, 0, 204)',
      'rgb(102, 0, 204)',
      'rgb(153, 0, 204)',
      'rgb(204, 0, 204)',
      'rgb(204, 0, 153)',
      'rgb(204, 0, 102)',
      'rgb(204, 0, 51)',
      'rgb(204, 0, 0)',
      'rgb(204, 51, 0)',
      'rgb(204, 102, 0)',
      'rgb(204, 153, 0)',
      'rgb(204, 204, 0)',
      'rgb(153, 204, 0)',
      'rgb(102, 204, 0)',
      'rgb(51, 204, 0)'
    ];
  }
  public static startTheGame(scale: number, appSnakeGame: HTMLElement) {
    const game = new Game(scale, appSnakeGame);
    window.addEventListener('keydown', event => {
      switch (event.key) {
        case 'ArrowRight':
          if (game.getSnake().getCurrentDirection() !== 'Left') {
            game.getSnake().setCurrentDirection('Right');
            game.getSnake().setDirection(game.getCanvas().getScale(), 0);
          }
          break;
        case 'ArrowLeft':
          if (game.getSnake().getCurrentDirection() !== 'Right') {
            game.getSnake().setCurrentDirection('Left');
            game.getSnake().setDirection(-game.getCanvas().getScale(), 0);
          }
          break;
        case 'ArrowDown':
          if (game.getSnake().getCurrentDirection() !== 'Up') {
            game.getSnake().setCurrentDirection('Down');
            game.getSnake().setDirection(0, game.getCanvas().getScale());
          }
          break;
        case 'ArrowUp':
          if (game.getSnake().getCurrentDirection() !== 'Down') {
            game.getSnake().setCurrentDirection('Up');
            game.getSnake().setDirection(0, -game.getCanvas().getScale());
          }
          break;
      }
    });
    game.play();
  }
  public getSnake() {
    return this.snake;
  }
  public getCanvas() {
    return this.canvas;
  }
  private play() {
    if (!this.isCurrentlyRunning) {
      this.isCurrentlyRunning = true;
      this.fruit.setRandomColor();
      this.fruit.setRandomLocation(this.canvas, this.snake, this.scale);
      this.gameInterval = setInterval(() => {
        this.canvas.clean(); //feld freiräumen
        this.fruit.draw(this.canvas);
        this.snake.update();
        this.snake.draw(this.canvas);
        if (this.snake.inItself()) {
          this.stop();
        }
        if (this.snake.outOfMap(this.canvas)) {
          this.stop();
        }
        if (this.snake.isOnFruitCheck(this.fruit.getX(), this.fruit.getY())) {
          if (this.snakeColor === 'rainbow') {
            this.snake.addTailElement(0, 0, this.rgbVerlauf[this.rgbVerlaufIndex % this.rgbVerlauf.length]);
            this.rgbVerlaufIndex++;
          } else {
            this.snake.addTailElement(0, 0, this.snakeColor);
          }
          this.fruit.setRandomColor();
          this.fruit.setRandomLocation(this.canvas, this.snake, this.scale);
        }
      }, 250);
    }
  }
  private stop() {
    if (this.isCurrentlyRunning) {
      this.isCurrentlyRunning = false;
      clearInterval(<NodeJS.Timeout>this.gameInterval);
      this.printGameOver();
    }
  }
  private printGameOver() {
    const canvas = this.gameField.querySelector('#canvas') as HTMLCanvasElement;
    canvas.style.backgroundColor = 'green';
    setTimeout(() => {
      location.reload();
    }, 1500);
  }
}
