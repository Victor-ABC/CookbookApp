/* Autor: Victor Corbet */

import { Canvas } from './canvas.js';
import { TailElement } from './TailElement';

export class Snake {
  private static instance: Snake | null = null;
  private x: number;
  private y: number;
  private moveX: number;
  private moveY: number;
  private currentDirection: string;
  private tailIndex;
  private tailElems: TailElement[];
  private oneDirectionPerCicle: boolean;
  private color: string;
  private constructor(color: string) {
    // Singleton - Entwurfsmuster
    this.color = color;
    this.x = 0;
    this.y = 0;
    this.moveX = 0;
    this.moveY = 0;
    this.currentDirection = 'Right';
    this.tailIndex = 0;
    this.tailElems = [];
    this.oneDirectionPerCicle = true;
  }
  public static getInstance(color: string): Snake {
    if (!this.instance) {
      this.instance = new Snake(color);
      return this.instance;
    } else {
      return this.instance;
    }
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
    if (this.color === 'rainbow') {
      canvas.draw(this.x, this.y, 'rgb(0, 204, 0)'); //Kopf
    } else {
      canvas.draw(this.x, this.y, this.color); //Kopf
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
    if (this.isOnFruit(fruitPosX, fruitPosY)) {
      // Snake head
      return false;
    }
    for (let i = 0; i < this.tailIndex; i++) {
      if (fruitPosX === this.tailElems[i].getX() && fruitPosY === this.tailElems[i].getY()) {
        return false;
      }
    }
    return true;
  }
  public isOnFruit(fruitPosX: number, fruitPosY: number) {
    if (this.x === fruitPosX && this.y === fruitPosY) {
      // Snake head
      return true;
    }
    return false;
  }
}
