const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const output = path.join(root, 'dist');
const siteFiles = [
  'index.html',
  'camera.html',
  'album.html',
  'style.css',
  'script.js',
  'camera.js',
  'album.js',
  'app-frame.js',
];

function copyTree(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  for (const entry of fs.readdirSync(source, { withFileTypes: true })) {
    const from = path.join(source, entry.name);
    const to = path.join(destination, entry.name);
    if (entry.isDirectory()) copyTree(from, to);
    else if (entry.isFile()) fs.copyFileSync(from, to);
  }
}

fs.mkdirSync(output, { recursive: true });
for (const file of siteFiles) {
  fs.copyFileSync(path.join(root, file), path.join(output, file));
}
copyTree(path.join(root, 'assets'), path.join(output, 'assets'));
console.log(`Static site built in ${path.relative(root, output)}/`);
