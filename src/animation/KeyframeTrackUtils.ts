import { KeyframeTrack } from "./KeyframeTrack";
import { StringKeyframeTrack } from "./tracks/StringKeyframeTrack";
import { BooleanKeyframeTrack } from "./tracks/BooleanKeyframeTrack";
import { QuaternionKeyframeTrack } from "./tracks/QuaternionKeyframeTrack";
import { ColorKeyframeTrack } from "./tracks/ColorKeyframeTrack";
import { VectorKeyframeTrack } from "./tracks/VectorKeyframeTrack";
import { NumberKeyframeTrack } from "./tracks/NumberKeyframeTrack";
import { AnimationUtils } from "./AnimationUtils";
export class KeyframeTrackUtils {
  // Static methods:
  // Serialization (in static context, because of constructor invocation
  // and automatic invocation of .toJSON):
  static parse(json: any): KeyframeTrack {
    if (json.type === undefined) {
      throw new Error("track type undefined, can not parse");
    }
    let trackType: any = KeyframeTrackUtils._getTrackTypeForValueTypeName(json.type);
    if (json.times === undefined) {
      let times: any[] = [], values: any[] = [];
      AnimationUtils.flattenJSON(json.keys, times, values, 'value');
      json.times = times;
      json.values = values;
    }
    // derived classes can define a static parse method
    if (trackType.parse !== undefined) {
      return trackType.parse(json);
    } else {
      // by default, we asssume a constructor compatible with the base
      return new trackType(
          json.name, json.times, json.values, json.interpolation);
    }
  }
  static toJSON(track: KeyframeTrack): any {
    let trackType: any = track.constructor;
    let json: any;
    // derived classes can define a static toJSON method
    if (trackType.toJSON !== undefined) {
      json = trackType.toJSON(track);
    } else {
      // by default, we assume the data can be serialized as-is
      json = {
        'name': track.name,
        'times': AnimationUtils.convertArray(track.times, Array),
        'values': AnimationUtils.convertArray(track.values, Array)
      };
      let interpolation = track.getInterpolation();
      if (interpolation !== track.DefaultInterpolation) {
        json.interpolation = interpolation;
      }
    }
    json.type = track.ValueTypeName; // mandatory
    return json;
  }
  private static _getTrackTypeForValueTypeName(typeName: string): any {
    switch (typeName.toLowerCase()) {
      case "scalar":
      case "double":
      case "float":
      case "number":
      case "integer":
        return NumberKeyframeTrack;
      case "vector":
      case "vector2":
      case "vector3":
      case "vector4":
        return VectorKeyframeTrack;
      case "color":
        return ColorKeyframeTrack;
      case "quaternion":
        return QuaternionKeyframeTrack;
      case "bool":
      case "boolean":
        return BooleanKeyframeTrack;
      case "string":
        return StringKeyframeTrack;
    }
    throw new Error("Unsupported typeName: " + typeName);
  }
}
