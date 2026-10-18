const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mp3': 'audio/mpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
};

function serveFile(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const filePath = path.resolve(root, relativePath);
  if (filePath !== root && !filePath.startsWith(root + path.sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  fs.stat(filePath, (error, stats) => {
    if (error) {
      response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
      return;
    }

    const headers = {
      'Content-Type': types[path.extname(filePath)] || 'application/octet-stream',
      'Accept-Ranges': 'bytes',
    };
    const rangeHeader = request.headers.range;
    if (rangeHeader) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader);
      if (!match || (!match[1] && !match[2])) {
        response.writeHead(416, { 'Content-Range': `bytes */${stats.size}` }).end();
        return;
      }

      let start;
      let end;
      if (!match[1]) {
        const suffixLength = Number(match[2]);
        start = Math.max(0, stats.size - suffixLength);
        end = stats.size - 1;
      } else {
        start = Number(match[1]);
        end = match[2] ? Math.min(Number(match[2]), stats.size - 1) : stats.size - 1;
      }
      if (start >= stats.size || end < start) {
        response.writeHead(416, { 'Content-Range': `bytes */${stats.size}` }).end();
        return;
      }

      headers['Content-Length'] = end - start + 1;
      headers['Content-Range'] = `bytes ${start}-${end}/${stats.size}`;
      response.writeHead(206, headers);
      if (request.method === 'HEAD') response.end();
      else fs.createReadStream(filePath, { start, end }).pipe(response);
      return;
    }

    headers['Content-Length'] = stats.size;
    response.writeHead(200, headers);
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(filePath).pipe(response);
  });
}

const ipv4Server = http.createServer(serveFile);
const ipv6Server = http.createServer(serveFile);

ipv4Server.listen(8000, '127.0.0.1', () => {
  console.log('Birthday site listening on IPv4 localhost:8000');
});
ipv6Server.on('error', error => {
  console.error(`IPv6 localhost listener failed: ${error.message}`);
});
ipv6Server.listen(8000, '::1', () => {
  console.log('Birthday site listening on IPv6 localhost:8000');
});
