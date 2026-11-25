import http from 'node:http';
import https from 'node:https';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const apiOrigin = new URL(process.env.ALTAR_DEV_ORIGIN || `http://127.0.0.1:${process.env.ALTAR_DOCKER_WEB_PORT || 8180}`);
if (!['http:', 'https:'].includes(apiOrigin.protocol) || !['127.0.0.1', 'localhost', '[::1]'].includes(apiOrigin.hostname)
    || apiOrigin.pathname !== '/' || apiOrigin.search || apiOrigin.hash || apiOrigin.username || apiOrigin.password) {
  throw new Error('ALTAR_DEV_ORIGIN debe ser el origen HTTP o HTTPS de una API local.');
}
const apiTransport = apiOrigin.protocol === 'https:' ? https : http;
const visitorRoutes = new Map([
  ['/api/public/visitor-form', 'GET'],
  ['/api/public/visitors', 'POST'],
]);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject' };
const pageSlugs = ['yoelijolapureza', 'cree', 'comparte', 'viajes-misioneros', 'casas-de-vida', 'nuestro-legado', 'pastores', 'libreria'];
const pages = new Set(['index.html', ...pageSlugs.flatMap(slug => [`${slug}.html`, path.join(slug, 'index.html')])]);

function selectHeaders(headers, names) {
  return Object.fromEntries(names.filter(name => headers[name] !== undefined).map(name => [name, headers[name]]));
}

function proxyVisitorRequest(request, response, pathname) {
  const headers = selectHeaders(request.headers, ['host', 'origin', 'cookie', 'content-type', 'content-length', 'accept', 'x-visitor-token']);
  // PHP compares the browser's Origin with Host and uses a cookie for the form token.
  const upstream = apiTransport.request(new URL(pathname, apiOrigin), { method: request.method, headers }, incoming => {
    response.writeHead(incoming.statusCode, selectHeaders(incoming.headers, ['content-type', 'set-cookie', 'cache-control', 'x-content-type-options', 'referrer-policy', 'retry-after']));
    incoming.on('error', () => response.destroy());
    incoming.pipe(response);
  });
  upstream.setTimeout(10000, () => upstream.destroy());
  upstream.on('error', () => {
    if (response.destroyed) return;
    if (response.headersSent) { response.destroy(); return; }
    response.writeHead(502, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
    response.end(JSON.stringify({ error: 'El servicio de registro no está disponible.' }));
  });
  response.on('close', () => {
    if (!response.writableFinished) upstream.destroy();
  });
  request.pipe(upstream);
}

const server = http.createServer((request, response) => {
  let url;
  let pathname;
  try {
    url = new URL(request.url, 'http://localhost');
    pathname = decodeURIComponent(url.pathname);
  }
  catch { response.writeHead(400); response.end('Solicitud inválida'); return; }
  if (visitorRoutes.has(pathname)) {
    const method = visitorRoutes.get(pathname);
    if (request.method !== method) { response.writeHead(405, { Allow: method }); response.end(); return; }
    proxyVisitorRequest(request, response, pathname);
    return;
  }
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  if (pageSlugs.includes(pathname.slice(1))) {
    response.writeHead(308, { Location: `${pathname}/${url.search}` }); response.end(); return;
  }
  const target = path.resolve(root, `.${pathname.endsWith('/') ? `${pathname}index.html` : pathname}`);
  const relative = path.relative(root, target);
  // Serve public pages and resources; keep development and content notes private.
  if (relative.startsWith('..') || path.isAbsolute(relative) || !(pages.has(relative) || relative.startsWith(`assets${path.sep}`))) {
    response.writeHead(404); response.end('No encontrado'); return;
  }
  fs.stat(target, (error, stat) => {
    if (error || !stat.isFile()) { response.writeHead(404); response.end('No encontrado'); return; }
    const headers = { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
    if (path.extname(target) === '.pdf') headers['Content-Disposition'] = `attachment; filename="${path.basename(target)}"`;
    let status = 200;
    let streamOptions;
    if (headers['Content-Type'].startsWith('video/')) {
      headers['Accept-Ranges'] = 'bytes';
      const range = request.method === 'GET' && /^bytes=(\d*)-(\d*)$/.exec(request.headers.range || '');
      if (range && (range[1] || range[2])) {
        const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
        const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
        if (start > end) {
          response.writeHead(416, { 'Content-Range': `bytes */${stat.size}` });
          response.end();
          return;
        }
        status = 206;
        streamOptions = { start, end };
        headers['Content-Range'] = `bytes ${start}-${end}/${stat.size}`;
        headers['Content-Length'] = end - start + 1;
      }
    }
    response.writeHead(status, headers);
    if (request.method === 'HEAD') response.end();
    else fs.createReadStream(target, streamOptions).pipe(response);
  });
});
server.listen(port, '127.0.0.1', () => console.log(`ALTAR local: http://127.0.0.1:${port}`));
server.on('error', error => { console.error(error.code === 'EADDRINUSE' ? `El puerto ${port} está ocupado. Usa otra variable PORT.` : error.message); process.exitCode = 1; });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
