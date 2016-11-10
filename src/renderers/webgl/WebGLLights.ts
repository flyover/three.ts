/**
 * @author mrdoob / http://mrdoob.com/
 */
import { Color } from "../../math/Color";
import { Vector3 } from "../../math/Vector3";
import { Vector2 } from "../../math/Vector2";
import { Light } from "../../lights/Light";
export class WebGLLights {
  lights: any = {};
  get(light: Light): any {
    if (this.lights[light.id] !== undefined) {
      return this.lights[light.id];
    }
    let uniforms;
    switch (light.type) {
      case 'DirectionalLight':
        uniforms = {
          direction: new Vector3(),
          color: new Color(),
          shadow: false,
          shadowBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2()
        };
        break;
      case 'SpotLight':
        uniforms = {
          position: new Vector3(),
          direction: new Vector3(),
          color: new Color(),
          distance: 0,
          coneCos: 0,
          penumbraCos: 0,
          decay: 0,
          shadow: false,
          shadowBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2()
        };
        break;
      case 'PointLight':
        uniforms = {
          position: new Vector3(),
          color: new Color(),
          distance: 0,
          decay: 0,
          shadow: false,
          shadowBias: 0,
          shadowRadius: 1,
          shadowMapSize: new Vector2()
        };
        break;
      case 'HemisphereLight':
        uniforms = {
          direction: new Vector3(),
          skyColor: new Color(),
          groundColor: new Color()
        };
        break;
    }
    this.lights[light.id] = uniforms;
    return uniforms;
  }
}
