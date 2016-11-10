/**
 *
 * A reference to a real property in the scene graph.
 *
 *
 * @author Ben Houston / http://clara.io/
 * @author David Sarno / http://lighthaus.us/
 * @author tschw
 */
import { AnimationObjectGroup } from "./AnimationObjectGroup";
type PropertyGetter = (targetArray: any, offset: number) => void;
type PropertySetter = (targetArray: any, offset: number) => void;
export class PropertyBinding {
  path: any;
  parsedPath: any;
  node: any;
  rootNode: any;
  targetObject: any;
  resolvedProperty: any;
  propertyIndex: any;
  propertyName: any;
  // initial state of these methods that calls 'bind'
  getValue: PropertyGetter = this._getValue_unbound;
  setValue: PropertySetter = this._setValue_unbound;
  constructor(rootNode: any, path: string, parsedPath?: string) {
    this.path = path;
    this.parsedPath = parsedPath || PropertyBinding.parseTrackName(path);
    this.node = PropertyBinding.findNode(rootNode, this.parsedPath.nodeName) || rootNode;
    this.rootNode = rootNode;
  }
  private _getValue_unbound(targetArray: any, offset: number): void {
    this.bind();
    this.getValue(targetArray, offset);
    // Note: This class uses a State pattern on a per-method basis:
    // 'bind' sets 'this.getValue' / 'setValue' and shadows the
    // prototype version of these methods with one that represents
    // the bound state. When the property is not found, the methods
    // become no-ops.
  }
  private _setValue_unbound(sourceArray: any, offset: number): void {
    this.bind();
    this.setValue(sourceArray, offset);
  }
  // create getter / setter pair for a property in the scene graph
  bind(): void {
    let targetObject = this.node;
    const parsedPath = this.parsedPath;
    const objectName = parsedPath.objectName;
    const propertyName = parsedPath.propertyName;
    let propertyIndex = parsedPath.propertyIndex;
    if (! targetObject) {
      targetObject = PropertyBinding.findNode(
          this.rootNode, parsedPath.nodeName) || this.rootNode;
      this.node = targetObject;
    }
    // set fail state so we can just 'return' on error
    this.getValue = this._getValue_unavailable;
    this.setValue = this._setValue_unavailable;
     // ensure there is a value node
    if (! targetObject) {
      console.error("  trying to update node for track: " + this.path + " but it wasn't found.");
      return;
    }
    if (objectName) {
      let objectIndex = parsedPath.objectIndex;
      // special cases were we need to reach deeper into the hierarchy to get the face materials....
      switch (objectName) {
        case 'materials':
          if (! targetObject.material) {
            console.error('  can not bind to material as node does not have a material', this);
            return;
          }
          if (! targetObject.material.materials) {
            console.error('  can not bind to material.materials as node.material does not have a materials array', this);
            return;
          }
          targetObject = targetObject.material.materials;
          break;
        case 'bones':
          if (! targetObject.skeleton) {
            console.error('  can not bind to bones as node does not have a skeleton', this);
            return;
          }
          // potential future optimization: skip this if propertyIndex is already an integer
          // and convert the integer string to a true integer.
          targetObject = targetObject.skeleton.bones;
          // support resolving morphTarget names into indices.
          for (let i = 0; i < targetObject.length; i ++) {
            if (targetObject[ i ].name === objectIndex) {
              objectIndex = i;
              break;
            }
          }
          break;
        default:
          if (targetObject[ objectName ] === undefined) {
            console.error('  can not bind to objectName of node, undefined', this);
            return;
          }
          targetObject = targetObject[ objectName ];
      }
      if (objectIndex !== undefined) {
        if (targetObject[ objectIndex ] === undefined) {
          console.error("  trying to bind to objectIndex of objectName, but is undefined:", this, targetObject);
          return;
        }
        targetObject = targetObject[ objectIndex ];
      }
    }
    // resolve property
    const nodeProperty = targetObject[ propertyName ];
    if (nodeProperty === undefined) {
      const nodeName = parsedPath.nodeName;
      console.error("  trying to update property for track: " + nodeName +
          '.' + propertyName + " but it wasn't found.", targetObject);
      return;
    }
    // determine versioning scheme
    let versioning = this.Versioning.None;
    if (targetObject.needsUpdate !== undefined) { // material
      versioning = this.Versioning.NeedsUpdate;
      this.targetObject = targetObject;
    } else if (targetObject.matrixWorldNeedsUpdate !== undefined) { // node transform
      versioning = this.Versioning.MatrixWorldNeedsUpdate;
      this.targetObject = targetObject;
    }
    // determine how the property gets bound
    let bindingType = this.BindingType.Direct;
    if (propertyIndex !== undefined) {
      // access a sub element of the property array (only primitives are supported right now)
      if (propertyName === "morphTargetInfluences") {
        // potential optimization, skip this if propertyIndex is already an integer, and convert the integer string to a true integer.
        // support resolving morphTarget names into indices.
        if (! targetObject.geometry) {
          console.error('  can not bind to morphTargetInfluences becasuse node does not have a geometry', this);
          return;
        }
        if (! targetObject.geometry.morphTargets) {
          console.error('  can not bind to morphTargetInfluences becasuse node does not have a geometry.morphTargets', this);
          return;
        }
        for (let i = 0; i < this.node.geometry.morphTargets.length; i ++) {
          if (targetObject.geometry.morphTargets[ i ].name === propertyIndex) {
            propertyIndex = i;
            break;
          }
        }
      }
      bindingType = this.BindingType.ArrayElement;
      this.resolvedProperty = nodeProperty;
      this.propertyIndex = propertyIndex;
    } else if (nodeProperty.fromArray !== undefined && nodeProperty.toArray !== undefined) {
      // must use copy for Object3D.Euler/Quaternion
      bindingType = this.BindingType.HasFromToArray;
      this.resolvedProperty = nodeProperty;
    } else if (nodeProperty.length !== undefined) {
      bindingType = this.BindingType.EntireArray;
      this.resolvedProperty = nodeProperty;
    } else {
      this.propertyName = propertyName;
    }
    // select getter / setter
    this.getValue = this.GetterByBindingType[ bindingType ];
    this.setValue = this.SetterByBindingTypeAndVersioning[ bindingType ][ versioning ];
  }
  unbind(): void {
    this.node = null;
    // back to the prototype version of getValue / setValue
    // note: avoiding to mutate the shape of 'this' via 'delete'
    this.getValue = this._getValue_unbound;
    this.setValue = this._setValue_unbound;
  }
  static Composite = class {
    _targetGroup: any;
    _bindings: any;
    constructor(targetGroup: any, path: string, optionalParsedPath: string) {
      const parsedPath = optionalParsedPath ||
          PropertyBinding.parseTrackName(path);
      this._targetGroup = targetGroup;
      this._bindings = targetGroup.subscribe_(path, parsedPath);
    }
    getValue(array: any, offset: number): void {
      this.bind(); // bind all binding
      const firstValidIndex = this._targetGroup.nCachedObjects_,
        binding = this._bindings[ firstValidIndex ];
      // and only call .getValue on the first
      if (binding !== undefined) binding.getValue(array, offset);
    }
    setValue(array: any, offset: number): void {
      const bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_,
          n = bindings.length; i !== n; ++ i) {
        bindings[ i ].setValue(array, offset);
      }
    }
    bind(): void {
      const bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_,
          n = bindings.length; i !== n; ++ i) {
        bindings[ i ].bind();
      }
    }
    unbind(): void {
      const bindings = this._bindings;
      for (let i = this._targetGroup.nCachedObjects_,
          n = bindings.length; i !== n; ++ i) {
        bindings[ i ].unbind();
      }
    }
  };
  // these are used to "bind" a nonexistent property
  private _getValue_unavailable(targetArray: any, offset: number): void {}
  private _setValue_unavailable(targetArray: any, offset: number): void {}
  BindingType = {
    Direct: 0,
    EntireArray: 1,
    ArrayElement: 2,
    HasFromToArray: 3
  };
  Versioning = {
    None: 0,
    NeedsUpdate: 1,
    MatrixWorldNeedsUpdate: 2
  };
  GetterByBindingType: PropertyGetter[] = [
    this.getValue_direct,
    this.getValue_array,
    this.getValue_arrayElement,
    this.getValue_toArray
  ];
  private getValue_direct(buffer: any, offset: number): void {
    buffer[ offset ] = this.node[ this.propertyName ];
  }
  private getValue_array(buffer: any, offset: number): void {
    const source = this.resolvedProperty;
    for (let i = 0, n = source.length; i !== n; ++ i) {
      buffer[ offset ++ ] = source[ i ];
    }
  }
  private getValue_arrayElement(buffer: any, offset: number): void {
    buffer[ offset ] = this.resolvedProperty[ this.propertyIndex ];
  }
  private getValue_toArray(buffer: any, offset: number): void {
    this.resolvedProperty.toArray(buffer, offset);
  }
  SetterByBindingTypeAndVersioning: PropertySetter[][] = [
    [
      // Direct
      this.setValue_direct,
      this.setValue_direct_setNeedsUpdate,
      this.setValue_direct_setMatrixWorldNeedsUpdate
    ], [
      // EntireArray
      this.setValue_array,
      this.setValue_array_setNeedsUpdate,
      this.setValue_array_setMatrixWorldNeedsUpdate
    ], [
      // ArrayElement
      this.setValue_arrayElement,
      this.setValue_arrayElement_setNeedsUpdate,
      this.setValue_arrayElement_setMatrixWorldNeedsUpdate
    ], [
      // HasToFromArray
      this.setValue_fromArray,
      this.setValue_fromArray_setNeedsUpdate,
      this.setValue_fromArray_setMatrixWorldNeedsUpdate
    ]
  ];
  // Direct
  private setValue_direct(buffer: any, offset: number): void {
    this.node[ this.propertyName ] = buffer[ offset ];
  }
  private setValue_direct_setNeedsUpdate(buffer: any, offset: number): void {
    this.node[ this.propertyName ] = buffer[ offset ];
    this.targetObject.needsUpdate = true;
  }
  private setValue_direct_setMatrixWorldNeedsUpdate(buffer: any, offset: number): void {
    this.node[ this.propertyName ] = buffer[ offset ];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  // EntireArray
  private setValue_array(buffer: any, offset: number): void {
    const dest = this.resolvedProperty;
    for (let i = 0, n = dest.length; i !== n; ++ i) {
      dest[ i ] = buffer[ offset ++ ];
    }
  }
  private setValue_array_setNeedsUpdate(buffer: any, offset: number): void {
    const dest = this.resolvedProperty;
    for (let i = 0, n = dest.length; i !== n; ++ i) {
      dest[ i ] = buffer[ offset ++ ];
    }
    this.targetObject.needsUpdate = true;
  }
  private setValue_array_setMatrixWorldNeedsUpdate(buffer: any, offset: number): void {
    const dest = this.resolvedProperty;
    for (let i = 0, n = dest.length; i !== n; ++ i) {
      dest[ i ] = buffer[ offset ++ ];
    }
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  // ArrayElement
  private setValue_arrayElement(buffer: any, offset: number): void {
    this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];
  }
  private setValue_arrayElement_setNeedsUpdate(buffer: any, offset: number): void {
    this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];
    this.targetObject.needsUpdate = true;
  }
  private setValue_arrayElement_setMatrixWorldNeedsUpdate(buffer: any, offset: number) {
    this.resolvedProperty[ this.propertyIndex ] = buffer[ offset ];
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  // HasToFromArray
  private setValue_fromArray(buffer: any, offset: number): void {
    this.resolvedProperty.fromArray(buffer, offset);
  }
  private setValue_fromArray_setNeedsUpdate(buffer: any, offset: number): void {
    this.resolvedProperty.fromArray(buffer, offset);
    this.targetObject.needsUpdate = true;
  }
  private setValue_fromArray_setMatrixWorldNeedsUpdate(buffer: any, offset: number): void {
    this.resolvedProperty.fromArray(buffer, offset);
    this.targetObject.matrixWorldNeedsUpdate = true;
  }
  static create(root: any, path: any, parsedPath: any): any {
    if (! ((root && root instanceof AnimationObjectGroup))) {
      return new PropertyBinding(root, path, parsedPath);
    } else {
      return new PropertyBinding.Composite(root, path, parsedPath);
    }
  }
  static parseTrackName(trackName: string): any {
    // matches strings in the form of:
    //    nodeName.property
    //    nodeName.property[accessor]
    //    nodeName.material.property[accessor]
    //    uuid.property[accessor]
    //    uuid.objectName[objectIndex].propertyName[propertyIndex]
    //    parentName/nodeName.property
    //    parentName/parentName/nodeName.property[index]
    //    .bone[Armature.DEF_cog].position
    //    scene:helium_balloon_model:helium_balloon_model.position
    // created and tested via https://regex101.com/#javascript
    const re: RegExp = /^((?:\w+[\/:])*)(\w+)?(?:\.(\w+)(?:\[(.+)\])?)?\.(\w+)(?:\[(.+)\])?$/;
    const matches = re.exec(trackName);
    if (! matches) {
      throw new Error("cannot parse trackName at all: " + trackName);
    }
    const results = {
      // directoryName: matches[ 1 ], // (tschw) currently unused
      nodeName: matches[ 2 ],   // allowed to be null, specified root node.
      objectName: matches[ 3 ],
      objectIndex: matches[ 4 ],
      propertyName: matches[ 5 ],
      propertyIndex: matches[ 6 ]  // allowed to be null, specifies that the whole property is set.
    };
    if (results.propertyName === null || results.propertyName.length === 0) {
      throw new Error("can not parse propertyName from trackName: " + trackName);
    }
    return results;
  }
  static findNode(root: any, nodeName: string | number): any {
    if (! nodeName || nodeName === "" || nodeName === "root" || nodeName === "." || nodeName === -1 || nodeName === root.name || nodeName === root.uuid) {
      return root;
    }
    // search into skeleton bones.
    if (root.skeleton) {
      const searchSkeleton = function(skeleton: any) {
        for (let i = 0; i < skeleton.bones.length; i ++) {
          const bone = skeleton.bones[ i ];
          if (bone.name === nodeName) {
            return bone;
          }
        }
        return null;
      };
      const bone = searchSkeleton(root.skeleton);
      if (bone) {
        return bone;
      }
    }
    // search into node subtree.
    if (root.children) {
      const searchNodeSubtree = function(children: any): any {
        for (let i = 0; i < children.length; i ++) {
          const childNode = children[ i ];
          if (childNode.name === nodeName || childNode.uuid === nodeName) {
            return childNode;
          }
          const result = searchNodeSubtree(childNode.children);
          if (result) return result;
        }
        return null;
      };
      const subTreeNode = searchNodeSubtree(root.children);
      if (subTreeNode) {
        return subTreeNode;
      }
    }
    return null;
  }
}
