import { Snake } from "./snake";
import { Canvas } from "./canvas";

export class Fruit {
  private x: number = 0;
  private y: number = 0;
  private colorArray: string[] = ["red", "blue", "yellow", "purple"];
  private color: string = "green";
  private static instance : Fruit | null = null;
  private constructor() {} // Singelton
  public static getInstance () : Fruit {
    if(!this.instance){
      this.instance = new Fruit();
      return this.instance;
    }
    else {
      return this.instance;
    }
  }
  public setRandomColor() {
    this.color = this.colorArray[
      Math.floor(Math.random() * this.colorArray.length)
    ];
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
    canvas.draw(this.x, this.y, this.color);
  }
  public getX() {
    return this.x;
  }
  public getY() {
    return this.y;
  }
}
