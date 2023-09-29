import * as PIXI from 'pixi.js';
/* eslint-disable @typescript-eslint/no-explicit-any */
type SlotStates = 'idle' | "active";
type SlotVariants = 'cherry' | "apple";

export type Slot = {
  x?: number;
  y?: number;
  url: string;
  type: SlotVariants;
  state?: SlotStates;
  width?: number;
  height?: number;
}

export type SlotBaseCreate = Omit<Slot, 'url' | 'type'>

export default abstract class SlotBase {
  state: SlotStates = "idle"
  width = 10;
  height = 10;
  x = 0;
  y = 0;
  url;
  type;
  sprite: PIXI.Sprite;

  constructor({ x = 0, y = 0, url, type, width = 10, height = 10}:Slot) {
    this.width = width;
    this.height = height;
    this.x = x;
    this.y = y
    this.url = url
    this.type = type
  
    this.sprite = this.createSprite(url)
    this.sprite.anchor.set(x, y);
  }

  public setTick(app: any) {
    let count = 1

    app.ticker.add(() => {
      this.sprite.scale.x = 1 + Math.sin(count) * 0.04;
      this.sprite.scale.y = 1 + Math.cos(count) * 0.04;

      count += 0.1;
    });
  }
  
  createSprite (url:string) {
    console.log(this.width, this.x, this.y)
    return PIXI.Sprite.from(url, {
      width: this.width,
      height: this.height,
    });
  }

  moveDown(app: any) {
    this.y += 168

    const ticker = app.ticker.add(() => {
      let pos = 0
      console.log(this.sprite.y, this.y)
      if (this.sprite.y < this.y ) {
        pos += 10
        this.sprite.y += pos;
      } else {
        app.ticker.remove(ticker)
      }
  });
  }
} 
