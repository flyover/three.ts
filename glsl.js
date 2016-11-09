const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
  fs.readdir(dir, (error, list) => {
    if (error) throw error;
    list.forEach((file) => {
      fs.stat(path.join(dir, file), (error, stat) => {
        if (error) throw error;
        if (stat && stat.isDirectory()) {
          walk(path.join(dir, file), callback);
        } else {
          callback(dir, file);
        }
      });
    });
  });
}

function transform(data) {
  const lines = [];
  lines.push("export default [");
  data.split('\n').forEach((line) => {
    lines.push("\"" + line.replace(/\"/g, "\\\"") + "\",");
  });
  lines.push("].join('\\n');")
  return lines.join('\n');
}

walk(process.argv[2] || "src/renderers/shaders", (dir, file) => {
  if (path.extname(file) === ".glsl") {
    fs.readFile(path.join(dir, file), 'utf-8', (error, data) => {
      if (error) throw error;
      fs.writeFile(path.join(dir, file + ".ts"), transform(data), (error) => {
        if (error) throw error;
        console.log(path.join(dir, file));
      });
    });
  }
});
