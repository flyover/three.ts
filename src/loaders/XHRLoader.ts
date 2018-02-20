import { Cache } from "./Cache";
import { LoadingManager, DefaultLoadingManager } from "./LoadingManager";
/**
 * @author mrdoob / http://mrdoob.com/
 */
export class XHRLoader {
  manager: LoadingManager;
  path: string;
  responseType: XMLHttpRequestResponseType;
  withCredentials: boolean;
  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }
  load(url: string, onLoad?: (response: string | ArrayBuffer | Blob) => void, onProgress?: (event: ProgressEvent) => void, onError?: (event: ErrorEvent) => void): XMLHttpRequest {
    if (url === undefined) url = '';
    if (this.path !== undefined) url = this.path + url;
    const scope: XHRLoader = this;
    const cached: any = Cache.get(url);
    if (cached !== undefined) {
      scope.manager.itemStart(url);
      setTimeout(function(): void {
        if (onLoad) onLoad(cached);
        scope.manager.itemEnd(url);
      }, 0);
      return cached;
    }
    let request: XMLHttpRequest;
    // Check for data: URI
    let dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;
    let dataUriRegexResult = url.match(dataUriRegex);
    // Safari can not handle Data URIs through XMLHttpRequest so process manually
    if (dataUriRegexResult) {
      let mimeType = dataUriRegexResult[1];
      let isBase64 = !!dataUriRegexResult[2];
      let data = dataUriRegexResult[3];
      data = decodeURIComponent(data);
      if (isBase64) {
        data = window.atob(data);
      }
      try {
        let response;
        let responseType = (this.responseType || '').toLowerCase();
        switch (responseType) {
          case 'arraybuffer':
          case 'blob':
             response = new ArrayBuffer(data.length);
            let view = new Uint8Array(response);
            for (let i = 0; i < data.length; i ++) {
                view[ i ] = data.charCodeAt(i);
            }
            if (responseType === 'blob') {
              response = new Blob([ response ], { "type" : mimeType });
            }
            break;
          case 'document':
            let parser = new DOMParser();
            response = parser.parseFromString(data, mimeType);
            break;
          case 'json':
            response = JSON.parse(data);
            break;
          default: // 'text' or other
            response = data;
            break;
        }
        // Wait for next browser tick
        window.setTimeout(function() {
          if (onLoad) onLoad(response);
          scope.manager.itemEnd(url);
        }, 0);
      } catch (error) {
        // Wait for next browser tick
        window.setTimeout(function() {
          if (onError) onError(error);
          scope.manager.itemError(url);
        }, 0);
      }
    } else {
      request = new XMLHttpRequest();
      request.open('GET', url, true);
      request.addEventListener('load', function(event: UIEvent) {
        const response: string = request.response;
        Cache.add(url, response);
        if (request.status === 200) {
          if (onLoad) onLoad(response);
          scope.manager.itemEnd(url);
        } else if (request.status === 0) {
          // Some browsers return HTTP Status 0 when using non-http protocol
          // e.g. 'file://' or 'data://'. Handle as success.
          console.warn('THREE.XHRLoader: HTTP Status 0 received.');
          if (onLoad) onLoad(response);
          scope.manager.itemEnd(url);
        } else {
          if (onError) onError(<any>event);
          scope.manager.itemError(url);
        }
      }, false);
      if (onProgress !== undefined) {
        request.addEventListener('progress', function(event: ProgressEvent): void {
          onProgress(event);
        }, false);
      }
      request.addEventListener('error', function(event: ErrorEvent): void {
        if (onError) onError(event);
        scope.manager.itemError(url);
      }, false);
      if (this.responseType !== undefined) request.responseType = this.responseType;
      if (this.withCredentials !== undefined) request.withCredentials = this.withCredentials;
      if (request.overrideMimeType) request.overrideMimeType('text/plain');
      request.send(null);
    }
    scope.manager.itemStart(url);
    return request;
  }
  setPath(value: string): XHRLoader {
    this.path = value;
    return this;
  }
  setResponseType(value: XMLHttpRequestResponseType): XHRLoader {
    this.responseType = value;
    return this;
  }
  setWithCredentials(value: boolean): XHRLoader {
    this.withCredentials = value;
    return this;
  }
}
