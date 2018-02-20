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

function have_typescript() {
  return typeof(ts) !== 'undefined';
}

var urls_systemjs = [
  //"../node_modules/systemjs/dist/system.js",
  "https://cdnjs.cloudflare.com/ajax/libs/systemjs/0.19.47/system.js"
];

var urls_typescript = [
  //"../node_modules/typescript/lib/typescript.js",
  "https://cdnjs.cloudflare.com/ajax/libs/typescript/2.7.1/typescript.js"
]

var module_name = window.location.pathname.split('/').pop().split('.')[0];
var transpile = !false;

var promise = Promise.resolve();
promise = promise.then(() => { return loads(have_systemjs, urls_systemjs); });
promise = promise.then(() => { return loads(have_typescript, urls_typescript); });
promise = promise.then(() => {
  console.log("SystemJS", SystemJS.version);
  if (transpile) {
    console.log("TypeScript", ts.version);
    SystemJS.config({
      transpiler: "typescript",
      typescriptOptions: {},
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
