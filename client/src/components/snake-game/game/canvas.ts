/* Autor: Victor Corbet */

export class Canvas {
  private static instance: Canvas | null = null;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private scale: number;
  private constructor(scale: number, gameField: HTMLElement) {
    this.canvas = gameField.querySelector('#canvas') as HTMLCanvasElement;
    this.canvas.focus();
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D;
    this.scale = scale;
  }
  public static getInstance(scale: number, gameField: HTMLElement) {
    if (!this.instance) {
      this.instance = new Canvas(scale, gameField);
      return this.instance;
    } else {
      return this.instance;
    }
  }
  public draw(x: number, y: number, color: string) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(x, y, this.scale, this.scale);
  }
  public clean() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  // public drawImage(image: any, x: number, y: number, height: number, width: number) {
  //   this.ctx.drawImage(image, x, y, height, width);
  // }
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
