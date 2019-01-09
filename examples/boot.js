function load(url, callback) {
  var script = document.createElement('script');
  var parent = document.getElementsByTagName('script')[0];
  script.async = true;
  script.addEventListener('load', callback);
  script.src = url;
  parent.parentNode.insertBefore(script, parent);
}

function loads(test, urls) {
  var promise = Promise.resolve();
  urls.forEach((url) => {
    promise = promise.then(() => {
      return new Promise((resolve, reject) => {
        if (!test()) {
          load(url, (event) => {
            resolve();
          });
        } else {
          resolve();
        }
      });
    });
  });
  return promise;
}

function have_systemjs() {
  return typeof(SystemJS) !== 'undefined';
}

var urls_systemjs = [
  //"../node_modules/systemjs/dist/system.js",
  "https://cdn.jsdelivr.net/npm/systemjs@0.21.5/dist/system.js"
];

var module_name = window.location.pathname.split('/').pop().split('.')[0];
var transpile = !false;

var promise = Promise.resolve();
promise = promise.then(() => { return loads(have_systemjs, urls_systemjs); });
promise = promise.then(() => {
  console.log("SystemJS", SystemJS.version);
  if (transpile) {
    // typescript
    SystemJS.config({
      // map: { "typescript": "../node_modules/typescript", },
      map: { "typescript": "https://cdn.jsdelivr.net/npm/typescript@3.2.2", },
      packages: { "typescript": { main: "lib/typescript.js", meta: { "lib/typescript.js": { exports: "ts" } } } }
    });
    // plugin-typescript
    SystemJS.config({
      // map: { "plugin-typescript": "../node_modules/plugin-typescript" },
      map: { "plugin-typescript": "https://cdn.jsdelivr.net/npm/plugin-typescript@8.0.0" },
      packages: { "plugin-typescript": { main: "lib/plugin.js" } },
      transpiler: "plugin-typescript",
      typescriptOptions: { /*tsconfig: true,*/ module: "system" }
    });
    SystemJS.config({
      packages: {
        '.': { defaultExtension: 'ts' },
        '../src': { defaultExtension: 'ts' }
      }
    });
  } else {
    SystemJS.config({
      packages: {
        '.': { defaultExtension: 'js' },
        '../src': { defaultExtension: 'js' }
      }
    });
  }
  return SystemJS.import(module_name);
});
