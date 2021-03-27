/* Autor: Victor */

import { Canvas } from './canvas.js';

export class TailElement {
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
