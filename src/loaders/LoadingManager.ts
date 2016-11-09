/**
 * @author mrdoob / http://mrdoob.com/
 */
export class LoadingManager {
  isLoading: boolean = false;
  itemsLoaded: number = 0;
  itemsTotal: number = 0;
  onStart: (url: string, itemsLoaded: number, itemsTotal: number) => void;
  onLoad: () => void;
  onProgress: (url: string, itemsLoaded: number, itemsTotal: number) => void;
  onError: (url: string) => void;
  constructor(onLoad?: () => void, onProgress?: (url: string, itemsLoaded: number, itemsTotal: number) => void, onError?: (url: string) => void) {
    this.onStart = undefined;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;
  }
  itemStart(url: string): void {
    this.itemsTotal ++;
    if (this.isLoading === false) {
      if (this.onStart !== undefined) {
        this.onStart(url, this.itemsLoaded, this.itemsTotal);
      }
    }
    this.isLoading = true;
  }
  itemEnd(url: string): void {
    this.itemsLoaded ++;
    if (this.onProgress !== undefined) {
      this.onProgress(url, this.itemsLoaded, this.itemsTotal);
    }
    if (this.itemsLoaded === this.itemsTotal) {
      this.isLoading = false;
      if (this.onLoad !== undefined) {
        this.onLoad();
      }
    }
  };
  itemError(url: string): void {
    if (this.onError !== undefined) {
      this.onError(url);
    }
  };
}
export const DefaultLoadingManager = new LoadingManager();
