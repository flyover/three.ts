import { LightShadow } from "./LightShadow";
import { OrthographicCamera } from "../cameras/OrthographicCamera";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class DirectionalLightShadow extends LightShadow {
  constructor(light?: any) {
    super(new OrthographicCamera(- 5, 5, 5, - 5, 0.5, 500));
  }
}
