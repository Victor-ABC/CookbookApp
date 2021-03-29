/* Autor: Victor Corbet */

import { Snake } from './snake';
import { Canvas } from './canvas';

export class Fruit {
  private static instance: Fruit | null = null;
  private x;
  private y;
  private colorArray: string[];
  private color;
  private constructor() {
    this.x = 0;
    this.y = 0;
    this.colorArray = ['red', 'blue', 'yellow', 'purple'];
    this.color = 'green';
  } // Singleton - Entwurfsmuster
  public static getInstance(): Fruit {
    if (!this.instance) {
      this.instance = new Fruit();
      return this.instance;
    } else {
      return this.instance;
    }
  }
  public setRandomColor() {
    this.color = this.colorArray[Math.floor(Math.random() * this.colorArray.length)];
  }
  public setRandomLocation(canvas: Canvas, snake: Snake, scale: number) {
    this.x = Math.floor((Math.random() * canvas.getWidth()) / scale) * scale;
    this.y = Math.floor((Math.random() * canvas.getHeight()) / scale) * scale;
    // Check if it spawned in snake
    if (snake.fruitPlacedSuccessfully(this.x, this.y) == false) {
      this.setRandomLocation(canvas, snake, scale);
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
