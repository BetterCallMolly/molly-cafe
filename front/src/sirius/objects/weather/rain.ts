import { getAssets, loadAssetsType } from "../../assets";
import { Velocity } from "../../interfaces/velocity.interface";
import { AssetType } from "../../types";
import { ADrawable } from "../bases/ADrawable";
import { AMovable } from "../bases/AMovable";

const N_RAINDROPS: number = 300;
let constructedRaindrops = 0;

class Raindrop extends AMovable {
    private _parentCloud: ADrawable; // rain falls from clouds, did you know?
    private _waitingForDiabling: boolean = false;
    constructor(
        sprite: HTMLImageElement,
        context: CanvasRenderingContext2D,
        initialVelocity: Velocity,
    ) {
        let clouds = window.s_Objects['weather'].filter((obj: ADrawable) => obj.type === "Cloud");
        const parentCloud = clouds[Math.floor(Math.random() * clouds.length)];
        let pos = {
            x: parentCloud.position.x + Math.random() * parentCloud.sprite.width,
            y: parentCloud.position.y + Math.random() * context.canvas.height,
        };
        super(sprite, context, pos, "Raindrop", initialVelocity);
        this._parentCloud = parentCloud;
        // Enable only if the raindrop is in the current rainIntensity
        this.enabled = (constructedRaindrops / N_RAINDROPS) < window.s_Weather.rainIntensity / 240
        constructedRaindrops++;
    }

    tick() {
        if (this.pos.y > this.context.canvas.height) {
            this.resetPosition();
            this.velocity.y = Math.random() * 2.5 + 2.5;
        }
        // Update velocity
        this.velocity.x = 0.1;
        if (this.pos.x > this.context.canvas.width + 40) {
            this.resetPosition();
        }
        // If the parent cloud is disabled, disable this raindrop
        this.enabled = this._parentCloud.enabled && this.enabled;
    }

    resetPosition() {
        if (this._waitingForDiabling) {
            this.enabled = false;
            this._waitingForDiabling = false;
            return;
        }
        this.pos.x = this._parentCloud.position.x + Math.random() * this._parentCloud.sprite.width;
        this.pos.y = this._parentCloud.position.y + this._parentCloud.sprite.height;
    }

    public disable(): void {
        this._waitingForDiabling = true;
    }
}

export async function rainInit(ctx: CanvasRenderingContext2D): Promise<Array<ADrawable>> {
    window.s_Weather.onRainIntensityChange = onRainIntensityChange;
    let raindrops: Array<Raindrop> = new Array<Raindrop>();
    return loadAssetsType(AssetType.RAINDROP).then(() => {
        let raindropSprite = getAssets(AssetType.RAINDROP);
        for (let i = 0; i < N_RAINDROPS; i++) {
            raindrops.push(
                new Raindrop(
                    raindropSprite[0],
                    ctx,
                    { x: 0, y: 2.5 }
                )
            );
        }
        return raindrops;
    });
}

/**
 * This function will get called whenever window.s_Weather.rainIntensity changes
 * It will be called with the new value of rainIntensity, allowing a smooth transition
 */
export function onRainIntensityChange(newIntensity: number) {
    let raindrops = window.s_Objects['weather'].filter((obj) => obj.type === 'Raindrop');
    // Show only newIntensity / 240
    let shownDrops: number = 0;
    for (let i = 0; i < raindrops.length; i++) {
        const raindrop = raindrops[i] as Raindrop;
        if ((shownDrops / raindrops.length) < newIntensity / 240) {
            setTimeout(() => {
                raindrop.resetPosition();
                raindrop.enable();
            }, Math.log2(i) * 1000);
            shownDrops++;
        } else {
            setTimeout(() => {
                raindrop.disable();
            }, Math.log2(i) * 1000);
        }
    }
    window.s_Weather.rainIntensity = newIntensity;
}