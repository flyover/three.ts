import { ShapeUtils } from "../ShapeUtils";
import { ShapePath } from "./ShapePath";
/**
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author mrdoob / http://mrdoob.com/
 */
export class Font {
  data: any;
  readonly isFont: boolean = true;
  constructor(data: any) {
    this.data = data;
  }
  generateShapes(text: string, size: number, divisions: number): ShapePath[] {
    function createPaths(text: string) {
      let chars = String(text).split('');
      let scale = size / data.resolution;
      let offset = 0;
      let paths = [];
      for (let i = 0; i < chars.length; i ++) {
        let ret = createPath(chars[i], scale, offset);
        offset += ret.offset;
        paths.push(ret.path);
      }
      return paths;
    }
    function createPath(c: string, scale: number, offset: number): any {
      let glyph = data.glyphs[c] || data.glyphs['?'];
      if (! glyph) return;
      let path = new ShapePath();
      let pts: any[] = [], b2 = ShapeUtils.b2, b3 = ShapeUtils.b3;
      let x, y, cpx, cpy, cpx0, cpy0, cpx1, cpy1, cpx2, cpy2, laste;
      if (glyph.o) {
        let outline = glyph._cachedOutline || (glyph._cachedOutline = glyph.o.split(' '));
        for (let i = 0, l = outline.length; i < l; ) {
          let action = outline[i ++];
          switch (action) {
            case 'm': // moveTo
              x = outline[i ++] * scale + offset;
              y = outline[i ++] * scale;
              path.moveTo(x, y);
              break;
            case 'l': // lineTo
              x = outline[i ++] * scale + offset;
              y = outline[i ++] * scale;
              path.lineTo(x, y);
              break;
            case 'q': // quadraticCurveTo
              cpx  = outline[i ++] * scale + offset;
              cpy  = outline[i ++] * scale;
              cpx1 = outline[i ++] * scale + offset;
              cpy1 = outline[i ++] * scale;
              path.quadraticCurveTo(cpx1, cpy1, cpx, cpy);
              laste = pts[pts.length - 1];
              if (laste) {
                cpx0 = laste.x;
                cpy0 = laste.y;
                for (let i2 = 1; i2 <= divisions; i2 ++) {
                  let t = i2 / divisions;
                  b2(t, cpx0, cpx1, cpx);
                  b2(t, cpy0, cpy1, cpy);
                }
              }
              break;
            case 'b': // bezierCurveTo
              cpx  = outline[i ++] * scale + offset;
              cpy  = outline[i ++] * scale;
              cpx1 = outline[i ++] * scale + offset;
              cpy1 = outline[i ++] * scale;
              cpx2 = outline[i ++] * scale + offset;
              cpy2 = outline[i ++] * scale;
              path.bezierCurveTo(cpx1, cpy1, cpx2, cpy2, cpx, cpy);
              laste = pts[pts.length - 1];
              if (laste) {
                cpx0 = laste.x;
                cpy0 = laste.y;
                for (let i2 = 1; i2 <= divisions; i2 ++) {
                  let t = i2 / divisions;
                  b3(t, cpx0, cpx1, cpx2, cpx);
                  b3(t, cpy0, cpy1, cpy2, cpy);
                }
              }
              break;
          }
        }
      }
      return { offset: glyph.ha * scale, path: path };
    }
    //
    if (size === undefined) size = 100;
    if (divisions === undefined) divisions = 4;
    let data = this.data;
    let paths = createPaths(text);
    let shapes: any[] = [];
    for (let p = 0, pl = paths.length; p < pl; p ++) {
      Array.prototype.push.apply(shapes, paths[p].toShapes());
    }
    return shapes;
  }
}
