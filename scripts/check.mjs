import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pageSlugs = ['yoelijolapureza', 'cree', 'comparte', 'viajes-misioneros', 'casas-de-vida'];
const pages = ['index.html', ...pageSlugs.flatMap(slug => [`${slug}/index.html`, `${slug}.html`])];
const cms = JSON.parse(fs.readFileSync(path.join(root, 'assets/cms-schema.json'), 'utf8'));
const checkedCss = new Set();
const isExternal = value => /^(?:https?:|mailto:|tel:|data:|\/\/)/i.test(value);

function localTarget(file, reference) {
  const value = decodeURIComponent(reference.split(/[?#]/)[0]);
  let target = value.startsWith('/') ? path.join(root, value) : path.resolve(path.dirname(file), value);
  assert.ok(!path.relative(root, target).startsWith('..'), `Recurso fuera del sitio: ${reference}`);
  assert.ok(fs.existsSync(target), `Recurso inexistente en ${path.relative(root, file)}: ${reference}`);
  if (fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  assert.ok(fs.existsSync(target), `Falta index en la ruta: ${reference}`);
  return target;
}

function checkCss(file) {
  if (checkedCss.has(file)) return;
  checkedCss.add(file);
  for (const [, raw] of fs.readFileSync(file, 'utf8').matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    if (!raw || isExternal(raw) || raw.startsWith('#')) continue;
    const target = localTarget(file, raw);
    if (target.endsWith('.css')) checkCss(target);
  }
}

for (const page of pages) {
  const file = path.join(root, page);
  const html = fs.readFileSync(file, 'utf8');
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(ids.length, new Set(ids).size, `IDs duplicados en ${page}`);
  assert.ok(html.includes('lang="es-PE"'), `Idioma ausente en ${page}`);
  assert.ok(!/Lorem ipsum|Jane Garsia|Buy Template|Your Company/i.test(html), `Contenido de demo en ${page}`);
  for (const [, reference] of html.matchAll(/\s(?:src|href|poster)="([^"]+)"/g)) {
    if (isExternal(reference)) continue;
    if (page === 'index.html' && reference === '/intranet/') continue;
    const [resource, id] = reference.split('#');
    const target = resource ? localTarget(file, resource) : file;
    if (id && target.endsWith('.html')) {
      const targetHtml = fs.readFileSync(target, 'utf8');
      const targetIds = [...targetHtml.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert.ok(targetIds.includes(decodeURIComponent(id)), `Ancla inexistente en ${page}: ${reference}`);
    }
    if (target.endsWith('.css')) checkCss(target);
  }
  for (const [, id] of html.matchAll(/aria-(?:controls|labelledby|describedby)="([^"]+)"/g)) {
    for (const token of id.split(' ')) assert.ok(ids.includes(token), `Referencia accesible inexistente en ${page}: ${token}`);
  }
  for (const [, tag] of html.matchAll(/(<a\b[^>]*target="_blank"[^>]*>)/g)) {
    assert.ok(/rel="[^"]*noopener/.test(tag), `Falta noopener en ${page}`);
  }
}

assert.equal(cms.pages.length, pageSlugs.length + 1, 'El CMS debe cubrir todas las páginas completas');
for (const page of cms.pages) {
  const file = localTarget(path.join(root, 'index.html'), page.path);
  const html = fs.readFileSync(file, 'utf8');
  const keys = new Set(page.fields.map(field => field.key));
  assert.equal(keys.size, page.fields.length, `Campos repetidos en el CMS de ${page.slug}`);
  assert.ok(html.includes(`data-page="${page.slug}"`), `Falta conectar el CMS de ${page.slug}`);
  if (page.sections) {
    assert.ok(page.sections.every(section => section.title && section.groups.length), `Sección incompleta del CMS de ${page.slug}`);
    const groups = page.sections.flatMap(section => section.groups);
    assert.equal(new Set(groups).size, groups.length, `Apartados repetidos en ${page.slug}`);
    assert.deepEqual(new Set(groups), new Set(page.fields.map(field => field.group)), `Apartados sin asignar en ${page.slug}`);
  }
  for (const field of page.fields) {
    assert.ok(field.label && field.group && typeof field.default === 'string', `Campo incompleto: ${page.slug}/${field.key}`);
    if (['image', 'url', 'video', 'pdf'].includes(field.type) && field.default.startsWith('/assets/')) localTarget(file, field.default);
    if (field.textParts) {
      assert.ok(field.textParts.length > 1 && field.textParts.every(part => part.key !== field.key && keys.has(part.key)),
        `Fragmentos inválidos: ${page.slug}/${field.key}`);
      assert.ok(html.includes(`data-cms-combined="${field.key}"`), `Falta el bloque unificado: ${page.slug}/${field.key}`);
    }
  }
  for (const [, value] of html.matchAll(/\sdata-cms-(?:text|combined|srcset|src|alt|href|poster|content|aria-label|background(?:-mobile)?|rich|visible|color|font-size)="([^"]+)"/g)) {
    for (const key of value.split(' ')) assert.ok(keys.has(key), `Campo ausente del catálogo: ${page.slug}/${key}`);
  }
  const downloadable = new Set(page.fields.filter(field => ['video', 'pdf'].includes(field.type)).map(field => field.key));
  for (const [tag, key] of html.matchAll(/<a\b[^>]*\bdata-cms-href="([^"]+)"[^>]*>/g)) {
    if (downloadable.has(key)) assert.match(tag, /\sdata-cms-clear-href(?:[\s=>])/, `Falta habilitar la eliminación del archivo: ${page.slug}/${key}`);
  }
}

const pdfDownloads = [
  'el-camino-del-discipulo.pdf',
  'yelp-pequenos-valientes.pdf',
  'yelp-escape.pdf',
  'el-amor-vino-y-se-quedo.pdf',
  'semillas-de-sanidad.pdf',
];
for (const name of pdfDownloads) {
  const buffer = fs.readFileSync(path.join(root, 'assets', 'downloads', name));
  assert.ok(buffer.subarray(0, 5).equals(Buffer.from('%PDF-')), `Firma PDF inválida: ${name}`);
  assert.ok(buffer.subarray(-2048).includes(Buffer.from('%%EOF')), `PDF incompleto: ${name}`);
}

const files = [];
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) { if (!['vendor', '.qa', 'node_modules', '.git'].includes(entry.name)) walk(full); }
    else if (/\.(html|css|js|mjs|md|json|txt)$/.test(entry.name)) files.push(full);
  }
}
walk(root);
for (const file of files) {
  assert.ok(!/[A-Z]:[\\/](?:Users|Proyectos)[\\/]/i.test(fs.readFileSync(file, 'utf8')), `Ruta personal en ${path.relative(root, file)}`);
}
console.log(`Correcto: ${pages.length} HTML, recursos y anclas, ${pdfDownloads.length} PDF completos y ${files.length} archivos propios sin rutas personales.`);
