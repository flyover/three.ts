/**
 * @author tschw
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 */
export class AnimationUtils {
  // same as Array.prototype.slice, but also works on typed arrays
  static arraySlice(array: any, from: number, to: number): any {
    if (AnimationUtils.isTypedArray(array)) {
      return new array.constructor(array.subarray(from, to));
    }
    return array.slice(from, to);
  }
  // converts an array to a specific type
  static convertArray(array: any, type: any, forceClone: boolean = false) {
    if (! array || // let 'undefined' and 'null' pass
        ! forceClone && array.constructor === type) return array;
    if (typeof type.BYTES_PER_ELEMENT === 'number') {
      return new type(array); // create typed array
    }
    return Array.prototype.slice.call(array); // create Array
  }
  static isTypedArray(object: any): boolean {
    return ArrayBuffer.isView(object) &&
        ! (object instanceof DataView);
  }
  // returns an array by which times and values can be sorted
  static getKeyframeOrder(times: number[]): number[] {
    function compareTime(i: number, j: number): number {
      return times[ i ] - times[ j ];
    }
    const n = times.length;
    const result = new Array(n);
    for (let i = 0; i !== n; ++ i) result[ i ] = i;
    result.sort(compareTime);
    return result;
  }
  // uses the array previously returned by 'getKeyframeOrder' to sort data
  static sortedArray(values: any, stride: number, order: number[]) {
    const nValues = values.length;
    const result = new values.constructor(nValues);
    for (let i = 0, dstOffset = 0; dstOffset !== nValues; ++ i) {
      const srcOffset = order[ i ] * stride;
      for (let j = 0; j !== stride; ++ j) {
        result[ dstOffset ++ ] = values[ srcOffset + j ];
      }
    }
    return result;
  }
  // function for parsing AOS keyframe formats
  static flattenJSON(jsonKeys: any, times: number[], values: any, valuePropertyName: string): void {
    let i = 1, key = jsonKeys[ 0 ];
    while (key !== undefined && key[ valuePropertyName ] === undefined) {
      key = jsonKeys[ i ++ ];
    }
    if (key === undefined) return; // no data
    let value = key[ valuePropertyName ];
    if (value === undefined) return; // no data
    if (Array.isArray(value)) {
      do {
        value = key[ valuePropertyName ];
        if (value !== undefined) {
          times.push(key.time);
          values.push.apply(values, value); // push all elements
        }
        key = jsonKeys[ i ++ ];
      } while (key !== undefined);
    } else if (value.toArray !== undefined) {
      // ...assume THREE.Math-ish
      do {
        value = key[ valuePropertyName ];
        if (value !== undefined) {
          times.push(key.time);
          value.toArray(values, values.length);
        }
        key = jsonKeys[ i ++ ];
      } while (key !== undefined);
    } else {
      // otherwise push as-is
      do {
        value = key[ valuePropertyName ];
        if (value !== undefined) {
          times.push(key.time);
          values.push(value);
        }
        key = jsonKeys[ i ++ ];
      } while (key !== undefined);
    }
  }
}
