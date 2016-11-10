import { Object3D } from "../core/Object3D";
import { BlendingMode } from "../constants";
import { Color } from "../math/Color";
import { Vector3 } from "../math/Vector3";
import { Texture } from "../textures/Texture";
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 */
export class LensFlare extends Object3D {
  lensFlares: any[] = [];
  positionScreen: Vector3 = new Vector3();
  customUpdateCallback: (flare: any) => void;
  readonly isLensFlare: boolean = true;
  constructor(texture: Texture, size: number, distance: number, blending: BlendingMode, color: Color) {
    super();
    if (texture !== undefined) {
      this.addFlare(texture, size, distance, blending, color);
    }
  }
  copy(source: this): this {
    super.copy(source);
    this.positionScreen.copy(source.positionScreen);
    this.customUpdateCallback = source.customUpdateCallback;
    for (let i = 0, l = source.lensFlares.length; i < l; i ++) {
      this.lensFlares.push(source.lensFlares[i]);
    }
    return this;
  }
  add(object: Object3D): Object3D {
    if (object instanceof Texture) {
      console.warn("LensFlare:add is now LensFlare:addFlare");
      return this.addFlare.call(this, arguments);
    }
    return super.add(object);
  }
  addFlare(texture: Texture, size: number = -1, distance: number = 0, blending: BlendingMode = BlendingMode.Normal, color: Color = new Color(0xffffff), opacity: number = 1): void {
    distance = Math.min(distance, Math.max(0, distance));
    this.lensFlares.push({
      texture: texture,  // THREE.Texture
      size: size,     // size in pixels (-1 = use texture.width)
      distance: distance,   // distance (0-1) from light source (0=at light source)
      x: 0, y: 0, z: 0,  // screen position (-1 => 1) z = 0 is in front z = 1 is back
      scale: 1,     // scale
      rotation: 0,     // rotation
      opacity: opacity,  // opacity
      color: color,    // color
      blending: blending  // blending
    });
  }
  /*
   * Update lens flares update positions on all flares based on the screen position
   * Set myLensFlare.customUpdateCallback to alter the flares in your project specific way.
   */
  updateLensFlares(): void {
    let f, fl = this.lensFlares.length;
    let flare;
    let vecX = - this.positionScreen.x * 2;
    let vecY = - this.positionScreen.y * 2;
    for (f = 0; f < fl; f ++) {
      flare = this.lensFlares[f];
      flare.x = this.positionScreen.x + vecX * flare.distance;
      flare.y = this.positionScreen.y + vecY * flare.distance;
      flare.wantedRotation = flare.x * Math.PI * 0.25;
      flare.rotation += (flare.wantedRotation - flare.rotation) * 0.25;
    }
  }
}
