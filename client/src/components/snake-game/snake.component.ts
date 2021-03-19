import { css, customElement, html, LitElement, query, unsafeCSS } from 'lit-element';
import { PageMixin } from '../page.mixin';

// import './game/snake';
// import './game/main';
// import './game/fruit';
// import './game/canvas';

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
        <canvas id="canvas" class="canvas" width="300" height="300"></canvas>
      </div>
    `;
  }
  async onClick() {
    class Canvas {
      private canvas: HTMLCanvasElement;
      private ctx: CanvasRenderingContext2D;
      private scale: number;
      constructor(scale: number) {
        this.canvas = document.querySelector('.canvas') as HTMLCanvasElement;
        this.canvas.focus();
        this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
        this.scale = scale;
      }
      public draw(x: number, y: number, color: string) {
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.scale, this.scale);
      }
      public clean() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      }
      public drawImage(image: any, x: number, y: number, height: number, width: number) {
        this.ctx.drawImage(image, x, y, height, width);
      }
      public getWidth(): number {
        return this.canvas.width;
      }
      public getHeight(): number {
        return this.canvas.height;
      }
      public getCanvas() {
        return this.canvas;
      }
      public getScale() {
        return this.scale;
      }
    }
    class Fruit {
      private x: number = 0;
      private y: number = 0;
      private colorArray: string[] = ['red', 'blue', 'yellow', 'purple'];
      private color: string = 'green';
      constructor() {}
      public setRandomColor() {
        this.color = this.colorArray[Math.floor(Math.random() * this.colorArray.length)];
      }
      public setRandomLocation(canvas: Canvas, snake: Snake) {
        this.x = Math.floor((Math.random() * canvas.getWidth()) / 10) * 10;
        this.y = Math.floor((Math.random() * canvas.getHeight()) / 10) * 10;
        // Check if it spawned in snake
        if (!snake.fruitPlacedSuccessfully(this.x, this.y)) {
          // Snake head
          this.setRandomLocation(canvas, snake);
        }
      }
      public draw(canvas: Canvas) {
        canvas.draw(this.y, this.y, this.color);
      }
      public getX() {
        return this.x;
      }
      public getY() {
        return this.y;
      }
    }

    class Game {
      private isCurrentlyRunning: boolean;
      private rgbVerlaufIndex: number;
      private rgbVerlauf: string[];
      private color: string;
      private score: number;
      private snake: Snake;
      private fruit: Fruit;
      private canvas: Canvas;
      private gameInterval: any;
      constructor(scale: number) {
        this.snake = new Snake();
        this.fruit = new Fruit();
        this.canvas = new Canvas(scale);
        this.isCurrentlyRunning = false;
        this.rgbVerlaufIndex = 0;
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
        this.color = 'green';
        this.score = 0;
      }
      public play() {
        if (!this.isCurrentlyRunning) {
          this.isCurrentlyRunning = true;

          this.fruit.setRandomColor();
          this.fruit.setRandomLocation(this.canvas, this.snake);
          // hide color while playing
          document.getElementById('color-select')!.style.visibility = 'hidden';

          this.gameInterval = setInterval(() => {
            this.canvas.clean(); //feld freiräumen
            this.fruit.draw(this.canvas);
            this.snake.update();
            this.snake.draw(this.canvas);
            if (this.snake.inItself()) {
              //inItself = "Selbstgefressen"
              this.stop();
            }
            if (this.snake.outOfMap(this.canvas)) {
              this.stop();
            }
            if (this.snake.isOnFruitCheck(this.fruit.getX(), this.fruit.getY())) {
              this.snake.addTailElement(0, 0, this.color); // !Hier nochmal schauen, ob ohne x, y geht
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
        let gameOver: HTMLHeadingElement = document.createElement('h1');
        gameOver.classList.add('game-over');
        this.canvas.getCanvas().appendChild(gameOver);
        setTimeout(() => {
          gameOver.remove();
        }, 2000);
        setTimeout(() => {
          location.reload();
        }, 3000);
      }
      public getSnake() {
        return this.snake;
      }
      public getCanvas() {
        return this.canvas;
      }
    }

    function startTheGame() {
      const game = new Game(10);
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
    setTimeout(() => {
      startTheGame();
    }, 2000);

    class Snake {
      private x: number;
      private y: number;
      private moveX: number;
      private moveY: number;
      private currentDirection: string;
      private tailIndex;
      private tailElems: TailElement[];
      private oneDirectionPerCicle: boolean;
      constructor() {
        this.x = 0;
        this.y = 0;
        this.moveX = 0;
        this.moveY = 0;
        this.currentDirection = 'Right';
        this.tailIndex = 0;
        this.tailElems = [];
        this.oneDirectionPerCicle = true;
      }
      public getCurrentDirection() {
        return this.currentDirection;
      }
      public setCurrentDirection(newDirection: string) {
        this.currentDirection = newDirection;
      }
      public update() {
        for (let i = this.tailIndex - 2; i >= 0; i--) {
          this.tailElems[i + 1].setX(this.tailElems[i].getX());
          this.tailElems[i + 1].setY(this.tailElems[i].getY());
        }
        //shift für Array[pos0]
        if (this.tailIndex > 0) {
          this.tailElems[0].setX(this.x);
          this.tailElems[0].setY(this.y);
        }
        this.x += this.moveX;
        this.y += this.moveY;
        this.oneDirectionPerCicle = true; //dont touch
      }
      public inItself() {
        for (let i = 0; i < this.tailIndex; i++) {
          if (this.x === this.tailElems[i].getX() && this.y === this.tailElems[i].getY()) {
            return true;
          }
        }
        return false;
      }
      public draw(canvas: Canvas) {
        if (false) {
          canvas.draw(this.x, this.y, 'rgb(51, 204, 0)'); //Kopf
        } else {
          canvas.draw(this.x, this.y, 'green'); //Kopf
        }
        for (let i = 0; i < this.tailIndex; i++) {
          this.tailElems[i].drawTailElement(canvas);
        }
      }
      public setDirection(x: number, y: number) {
        if (this.oneDirectionPerCicle) {
          this.moveX = x;
          this.moveY = y;
          this.oneDirectionPerCicle = false;
        }
      }
      public addTailElement(x: number, y: number, color: string) {
        this.tailIndex++;
        this.tailElems[this.tailIndex - 1] = new TailElement(x, y, color);
      }
      public outOfMap(canvas: Canvas) {
        if (this.x > canvas.getWidth()) {
          return true;
        }
        if (this.x < 0) {
          return true;
        }
        if (this.y > canvas.getHeight()) {
          return true;
        }
        if (this.y < 0) {
          return true;
        }
        return false;
      }
      public fruitPlacedSuccessfully(fruitPosX: number, fruitPosY: number) {
        if (this.isOnFruitCheck(fruitPosX, fruitPosY)) {
          // Snake head
          return false;
        }
        this.tailElems.forEach(e => {
          // Snake body
          if (e.getX() === fruitPosX && e.getY() === fruitPosY) {
            return false;
          }
        });
        return true;
      }
      public isOnFruitCheck(fruitPosX: number, fruitPosY: number) {
        if (this.x === fruitPosX && this.y === fruitPosY) {
          // Snake head
          return true;
        }
        return false;
      }
    }

    class TailElement {
      private x: number;
      private y: number;
      private color: string;
      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.color = color;
      }
      public drawTailElement(canvas: Canvas) {
        canvas.draw(this.x, this.y, this.color);
      }
      public getX() {
        return this.x;
      }
      public getY() {
        return this.y;
      }
      public setX(newX: number) {
        this.x = newX;
      }
      public setY(newY: number) {
        this.y = newY;
      }
    }
  }
}
