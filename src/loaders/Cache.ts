/**
 * @author mrdoob / http://mrdoob.com/
 */
export class Cache {
  static enabled: boolean = false;
  static files = {};
  static add(key: string, file: any): void {
    if (Cache.enabled === false) return;
    // console.log('THREE.Cache', 'Adding key:', key);
    Cache.files[key] = file;
  }
  static get(key: string): any {
    if (Cache.enabled === false) return;
    // console.log('THREE.Cache', 'Checking key:', key);
    return Cache.files[key];
  }
  static remove(key: string): void {
    delete Cache.files[key];
  }
  static clear(): void {
    Cache.files = {};
  }
}
