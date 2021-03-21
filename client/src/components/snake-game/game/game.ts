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
  private gameInterval: any;
  private gameField: HTMLElement;
  private constructor(scale: number, gameField: HTMLElement) {
    // Singleton - Entwurfsmuster
    this.gameField = gameField;
    let color = gameField.querySelector('#color-select') as HTMLSelectElement;
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
  private play() {
    if (!this.isCurrentlyRunning) {
      this.isCurrentlyRunning = true;
      this.fruit.setRandomColor();
      this.fruit.setRandomLocation(this.canvas, this.snake);
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
          this.fruit.setRandomLocation(this.canvas, this.snake);
        }
      }, 250);
    }
  }
  private stop() {
    if (this.isCurrentlyRunning) {
      this.isCurrentlyRunning = false;
      clearInterval(this.gameInterval);
      this.printGameOver();
    }
  }
  private printGameOver() {
    let canvas = this.gameField.querySelector('#canvas') as HTMLCanvasElement;
    canvas.style.backgroundColor = 'green';
    setTimeout(() => {
      location.reload();
    }, 1500);
  }
  public getSnake() {
    return this.snake;
  }
  public getCanvas() {
    return this.canvas;
  }
  public static startTheGame(appSnakeGame: HTMLElement) {
    const game = new Game(10, appSnakeGame);
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
}
