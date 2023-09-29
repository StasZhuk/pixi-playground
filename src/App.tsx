/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
// import { Loader  } from '@pixi/loaders';
// import { Application } from '@pixi/app';
// import { extensions } from '@pixi/core';
// import Cherry from './models/slots/cherry';
// import Apple from './models/slots/apple';

// extensions.add(AppLoaderPlugin);

const slotTextures = [
  PIXI.Texture.from('https://pixijs.com/assets/eggHead.png'),
  PIXI.Texture.from('https://pixijs.com/assets/flowerTop.png'),
  PIXI.Texture.from('https://pixijs.com/assets/helmlok.png'),
  PIXI.Texture.from('https://pixijs.com/assets/skully.png'),
];

type Reel = {
  container: PIXI.Container,
  symbols: PIXI.Sprite[],
  position: number,
  previousPosition: number,
  blur: PIXI.BlurFilter,
}

type TweenObject = {
  [x: string]: any;
  container?: PIXI.Container<PIXI.DisplayObject> | undefined;
  symbols?: PIXI.Sprite[] | undefined;
  position?: number | undefined;
  previousPosition?: number | undefined;
  blur?: PIXI.BlurFilter | undefined;
}

type OnChange = (() => void) | null

type Tween = {
  object: TweenObject,
  property: string,
  propertyBeginValue: string,
  target: number,
  easing: any,
  time: number,
  change: OnChange,
  complete: OnChange,
  start: number,
}

const REEL_WIDTH = 200;
const SYMBOL_SIZE = 150;

// const ALL_SLOTS = [
//   Apple,
//   Cherry,
//   // "clever": {
//   //   type: "clever",
//   //       url: "/img/slots/clever.png",
//   // },
//   // "bell": {
//   //   type: "bell",
//   //       url: "/img/slots/bell.png",
//   // },
//   // "plum": {
//   //   type: "plum",
//   //       url: "/img/slots/plum.png",
//   // },
//   // "bar": {
//   //   type: "bar",
//   //       url: "/img/slots/bar.png",
//   // },
//   // "apple": {
//   //   type: "apple",
//   //   url: "/img/slots/apple_2x.png",
//   // },
//   // "coin": {
//   //   type: "coin",
//   //       url: "/img/slots/coin.png",
//   // },
//   // "lemon": {
//   //   type: "lemon",
//   //       url: "/img/slots/lemon.png",
//   // },
//   // "grape": {
//   //   type: "grape",
//   //       url: "/img/slots/grape.png",
//   // },
//   // "diamond": {
//   //   type: "diamond",
//   //       url: "/img/slots/diamond.png",
//   // },
//   // "apricot": {
//   //   type: "apricot",
//   //       url: "/img/slots/apricot.png",
//   // },
//   // "horseshoe": {
//   //   type: "horseshoe",
//   //       url: "/img/slots/horseshoe.png",
//   // },
//   // "seven": {
//   //   type: "seven",
//   //       url: "/img/slots/seven.png",
//   // },
//   // "surprise": {
//   //   type: "surprise",
//   //       url: "/img/slots/surprise.png",
//   // },
//   // "watermelon": {
//   //   type: "watermelon",
//   //       url: "/img/slots/watermelon.png",
//   // },
//   // "heart": {
//   //   type: "heart",
//   //       url: "/img/slots/heart.png",
//   // },
// ]

class AppPixi {
  app = new PIXI.Application({
    antialias: true,
    resizeTo: window,
    backgroundColor: 0x000000
  });
  reelContainer = new PIXI.Container();
  reels:Array<Reel> = [];
  tweening:Array<Tween> = [];
  running = false;
  
  constructor(root:HTMLBaseElement) {
    root.appendChild(this.app.view as unknown as Node);

    PIXI.Assets.load([
      'https://i.ibb.co/17s2qDT/diamond.png',
      'https://i.ibb.co/6vNj1Zm/seven.png',
      'https://i.ibb.co/5GPNX9M/ace-of-spades.png',
      'https://i.ibb.co/tx36668/heart.png',
    ]).then(() => this.onAssetsLoaded())
  }

  onAssetsLoaded() {
    // this.reelContainer = new PIXI.Container();

    for (let i = 0; i < 1; i++) {
      const rc = new PIXI.Container();
      rc.x = i * REEL_WIDTH;
      this.reelContainer.addChild(rc);

      const reel: Reel = {
          container: rc,
          symbols: [],
          position: 0,
          previousPosition: 0,
          blur: new PIXI.BlurFilter(),
      };
      reel.blur.blurX = 0;
      reel.blur.blurY = 0;
      rc.filters = [reel.blur];

      // Build the symbols
      for (let j = 0; j < Math.ceil(this.app.screen.width / REEL_WIDTH); j++) {
          const symbol = new PIXI.Sprite(slotTextures[Math.floor(Math.random() * slotTextures.length)]);
          // Scale the symbol to fit symbol area.
          symbol.x = j * REEL_WIDTH;
          symbol.scale.y = symbol.scale.x = Math.min(SYMBOL_SIZE / symbol.height, SYMBOL_SIZE / symbol.width);
          symbol.y = Math.round((SYMBOL_SIZE - symbol.height) / 2);
          reel.symbols.push(symbol);
          rc.addChild(symbol);
      }
      this.reels.push(reel);
    }
    this.app.stage.addChild(this.reelContainer);

    const margin = REEL_WIDTH;
    this.reelContainer.y = this.app.screen.height / 2 - REEL_WIDTH / 2;
    this.reelContainer.x = Math.round(margin);

    const left = new PIXI.Graphics();
    left.beginFill(0, 9);
    left.drawRect(0, 0, margin, this.app.screen.height);

    const right = new PIXI.Graphics();
    right.beginFill(0, 9);
    right.drawRect(this.app.screen.width - REEL_WIDTH, 0, this.app.screen.width, this.app.screen.height);

    const bottom = new PIXI.Graphics();
    // bottom.beginFill(0, 1);
    // bottom.drawRect(0, SYMBOL_SIZE * 3 + margin, this.app.screen.width, margin);

    // Add play text
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'normal',
        fontWeight: 'bold',
        fill: ['#fce1e4', '#b76e79'], // gradient
        stroke: '#323232',
        strokeThickness: 2,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440,
    });

    const playText = new PIXI.Text('Free spin', style);
    playText.x = Math.round((this.app.screen.width - playText.width) / 2);
    playText.y = this.app.screen.height / 2 - margin;
    bottom.addChild(playText);

    // Add header text
    // const headerText = new PIXI.Text('PIXI SLOTS TEST', style);
    // headerText.x = Math.round((top.width - headerText.width) / 2);
    // headerText.y = Math.round((margin - headerText.height) / 2);
    // top.addChild(headerText);

    this.app.stage.addChild(left);
    this.app.stage.addChild(right);
    this.app.stage.addChild(bottom);

    // Set the interactivity.
    bottom.eventMode = 'static';
    bottom.cursor = 'pointer';
    bottom.addListener('pointerdown', () => {
        this.startPlay();
    });
        
    // Listen for animate update.
    this.app.ticker.add(() => {
      // Update the slots.
          for (let i = 0; i < this.reels.length; i++)
          {
              const r = this.reels[i];
              // Update blur filter y amount based on speed.
              // This would be better if calculated with time in mind also. Now blur depends on frame rate.
  
              r.blur.blurY = (r.position - r.previousPosition) * 8;
              r.previousPosition = r.position;
  
              // Update symbol positions on reel.
              for (let j = 0; j < r.symbols.length; j++)
              {
                  const s = r.symbols[j];
                  const prevx = s.x;
  
                  s.x = ((r.position + j) % r.symbols.length) * SYMBOL_SIZE - SYMBOL_SIZE;
                  if (s.x < 0 && prevx > SYMBOL_SIZE)
                  {
                      // Detect going over and swap a texture.
                      // This should in proper product be determined from some logical reel.
                      s.texture = slotTextures[Math.floor(Math.random() * slotTextures.length)];
                      s.scale.y = s.scale.x = Math.min(SYMBOL_SIZE / s.texture.width, SYMBOL_SIZE / s.texture.height);
                      s.y = Math.round((SYMBOL_SIZE - s.height) / 2);
                  }
              }
          }
    });

    // Listen for animate update.
    this.app.ticker.add(() =>
    {
        const now = Date.now();
        const remove = [];

        for (let i = 0; i < this.tweening.length; i++)
        {
            const t = this.tweening[i];
            const phase = Math.min(1, (now - t.start) / t.time);

            t.object[t.property] = this.lerp(t.propertyBeginValue, t.target, t.easing(phase));
            if (t.change) t.change(t);
            if (phase === 1)
            {
                t.object[t.property] = t.target;
                if (t.complete) t.complete(t);
                remove.push(t);
            }
        }
        for (let i = 0; i < remove.length; i++)
        {
            this.tweening.splice(this.tweening.indexOf(remove[i]), 1);
        }
    });
  }

  // Function to start playing.
  startPlay() {
    if (this.running) return;
    this.running = true;

    for (let i = 0; i < this.reels.length; i++) {
        const r = this.reels[i];
        const extra = Math.floor(Math.random() * 3);
        const target = r.position + 10 + i * 5 + extra;
        const time = 2500 + i * 600 + extra * 600;

        this.tweenTo(r, 'position', target, time, this.backout(0.5), null, i === this.reels.length - 1 ? this.reelsComplete.bind(this) : null);
    }
  }

    // Reels done handler.
  reelsComplete() {
    console.log('finish', this)
    this.running = false;
    this.tweening = []
  }

  // Basic lerp funtion.
  lerp(a1:string, a2:number, t:number) {
    return Number(a1) * (1 - t) + a2 * t;
  }

  // Backout function from tweenjs.
  // https://github.com/CreateJS/TweenJS/blob/master/src/tweenjs/Ease.js
  backout(amount:number) {
    return (t:number) => (--t * t * ((amount + 1) * t + amount) + 1);
  }

  
 tweenTo(
  object: TweenObject,
  property: string,
  target: number,
  time: number,
  easing: any,
  onchange: null,
  oncomplete: OnChange
) {
    const tween:Tween = {
        object,
        property,
        propertyBeginValue: object[property],
        target,
        easing,
        time,
        change: onchange,
        complete: oncomplete,
        start: Date.now(),
    };

    this.tweening.push(tween);
    return tween;
}
}

const App = () => {
  const appRef = useRef(null)

  useEffect(() => {
    if (appRef.current) {
      new AppPixi(appRef.current)
    }
  }, [])

  return <div>
      <div ref={appRef}></div>
    </div>
}

export default App
