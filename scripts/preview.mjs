import http from 'node:http';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const port = Number(process.env.PORT || 4173);
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.eot': 'application/vnd.ms-fontobject' };
const pageSlugs = ['yoelijolapureza', 'cree', 'comparte', 'viajes-misioneros', 'casas-de-vida'];
const pages = new Set(['index.html', ...pageSlugs.flatMap(slug => [`${slug}.html`, path.join(slug, 'index.html')])]);
const server = http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return; }
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end('Solicitud inválida'); return; }
  if (pageSlugs.includes(pathname.slice(1))) {
    response.writeHead(308, { Location: `${pathname}/${new URL(request.url, 'http://localhost').search}` }); response.end(); return;
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
