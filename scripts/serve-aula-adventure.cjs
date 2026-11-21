const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..', 'dist-aula-aventura');
const port = Number(process.env.AULA_PORT || 5182);
const host = process.env.AULA_HOST || '127.0.0.1';
const apiTarget = new URL(process.env.AULA_API_PROXY || 'http://127.0.0.1:8000');
if (!['127.0.0.1', 'localhost', '[::1]'].includes(apiTarget.hostname) || apiTarget.protocol !== 'http:') throw Error('The local API proxy must target a loopback HTTP server.');
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf' };
if (!fs.existsSync(path.join(root, 'index.html'))) { console.error('Primero ejecuta: node scripts/build-aula-adventure.cjs'); process.exit(1); }
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/api/')) {
    const upstream = http.request({ hostname:apiTarget.hostname,port:apiTarget.port||80,path:req.url,method:req.method,headers:{...req.headers,host:apiTarget.host} }, response => {
      res.writeHead(response.statusCode, {...response.headers,'Cache-Control':'no-store'});response.pipe(res);
    });
    upstream.setTimeout(20000,()=>upstream.destroy());
    upstream.on('error',()=>{if(!res.headersSent)res.writeHead(502,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify({detail:'El servicio de actividades no está disponible. Inicia el backend de sesiones.'}));});
    req.on('aborted',()=>upstream.destroy());req.pipe(upstream);return;
  }
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400); res.end(); return; }
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  const relative = path.relative(root, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) { res.writeHead(403); res.end(); return; }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) { res.writeHead(404); res.end('No encontrado'); return; }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
      'Content-Length': stat.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self'; font-src 'self'; connect-src 'self'; object-src 'none'; frame-ancestors 'none'; base-uri 'none'",
    });
    if (req.method === 'HEAD') { res.end(); return; }
    const stream = fs.createReadStream(file);
    stream.on('error', () => res.destroy()); stream.pipe(res);
  });
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, host, () => console.log(`La aventura está lista en http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/`));
