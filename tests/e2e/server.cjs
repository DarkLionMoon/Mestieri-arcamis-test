const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '../..');

http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
  if (file.endsWith(path.sep)) file = path.join(file, 'index.html');
  fs.readFile(file, (error, data) => {
    if (error) {
      res.statusCode = 404;
      res.end('Not found');
      return;
    }
    res.end(data);
  });
}).listen(Number(process.argv[2]) || 4174, '127.0.0.1');
