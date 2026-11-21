import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const schema = JSON.parse(fs.readFileSync(path.join(root, 'assets/cms-schema.json'), 'utf8'));
const defaults = Object.fromEntries(schema.pages.map(page => [
  page.slug, Object.fromEntries(page.fields.map(field => [field.key, field.default])),
]));

const pages = {
  home: ['index.html', '#top', 'texto-del-enlace-4'],
  cree: ['cree/index.html', '../index.html#eventos', 'texto-del-enlace'],
  comparte: ['comparte/index.html', '../index.html#misiones', 'texto-del-enlace'],
  'viajes-misioneros': ['viajes-misioneros/index.html', '../index.html#misiones', 'texto-del-enlace'],
  'casas-de-vida': ['casas-de-vida/index.html', '../index.html#casas-de-vida', 'texto-del-enlace'],
  yelp: ['yoelijolapureza/index.html', '../index.html', 'texto-del-enlace-3'],
};

function escapeHtml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function footerValue(slug, key) {
  return defaults[slug][`pie-de-pagina.${key}`];
}

function footerAsset(slug, key, prefix) {
  const value = footerValue(slug, key);
  return value.startsWith('/assets/') ? prefix + value.slice(1) : value;
}

function cmsAttribute(attribute, key) {
  return ` data-cms-${attribute}="pie-de-pagina.${key}"`;
}

function altarSocials(editable) {
  return ['instagram', 'facebook-f', 'youtube'].map((brand, index) => {
    const suffix = index ? `-${index + 1}` : '';
    const urlKey = `destino-del-enlace${suffix}`;
    const textKey = `texto-del-enlace${suffix}`;
    const hrefBinding = editable ? cmsAttribute('href', urlKey) : '';
    const textBinding = editable ? cmsAttribute('text', textKey) : '';
    return `      <a href="${escapeHtml(footerValue('home', urlKey))}" target="_blank" rel="noopener noreferrer"${hrefBinding}>
        <span class="fa-${brand} altar-footer-icon" aria-hidden="true"></span>
        <span class="altar-footer-social-name"${textBinding}>${escapeHtml(footerValue('home', textKey))}</span>
        <span class="altar-footer-arrow" aria-hidden="true">↗</span>
      </a>`;
  }).join('\n');
}

function yelpDetails(prefix) {
  const links = ['', '-2'].map(suffix => {
    const urlKey = `destino-del-enlace${suffix}`;
    const labelKey = `etiqueta-accesible${suffix}`;
    const textKey = `texto-del-enlace${suffix}`;
    return `      <a href="${escapeHtml(footerValue('yelp', urlKey))}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(footerValue('yelp', labelKey))}"${cmsAttribute('href', urlKey)}${cmsAttribute('aria-label', labelKey)}${cmsAttribute('text', textKey)}>${escapeHtml(footerValue('yelp', textKey))}</a>`;
  }).join('\n');
  return `  <div class="altar-footer-event">
    <img src="${escapeHtml(footerAsset('yelp', 'imagen', prefix))}" width="391" height="351" alt="${escapeHtml(footerValue('yelp', 'texto-alternativo'))}" loading="lazy"${cmsAttribute('src', 'imagen')}${cmsAttribute('alt', 'texto-alternativo')}>
    <p${cmsAttribute('text', 'parrafo')}>${escapeHtml(footerValue('yelp', 'parrafo'))}</p>
    <nav class="altar-footer-event-links" aria-label="Redes sociales de YELP">
${links}
    </nav>
  </div>\n`;
}

function renderFooter(slug, prefix, returnUrl, returnKey) {
  const isHome = slug === 'home';
  const isYelp = slug === 'yelp';
  const logoSource = isYelp ? 'home' : slug;
  const logoBindings = isYelp ? '' : cmsAttribute('src', 'imagen') + cmsAttribute('alt', 'texto-alternativo');
  const statementBinding = isHome ? ' data-cms-text="pie-de-pagina.parrafo pie-de-pagina.parrafo-2 pie-de-pagina.parrafo-3" data-cms-combined="pie-de-pagina.lema"' : '';
  const statement = escapeHtml(footerValue('home', 'lema')).replaceAll('\n', '<br>');
  const mottoKey = isHome || isYelp ? 'texto-3' : 'parrafo';
  const motto = escapeHtml(footerValue(isYelp ? 'home' : slug, mottoKey));
  const copyright = isHome
    ? `<small class="altar-footer-copyright" data-cms-text="pie-de-pagina.texto pie-de-pagina.texto-2">${escapeHtml(footerValue('home', 'texto'))} <span id="copyright-year">2026</span> ${escapeHtml(footerValue('home', 'texto-2'))}</small>`
    : `<small class="altar-footer-copyright"${isYelp ? cmsAttribute('text', 'texto') : ''}>${isYelp ? escapeHtml(footerValue('yelp', 'texto')) : '© 2026 ALTAR · Comunidad Cristiana'}</small>`;
  return `<footer class="altar-shared-footer" id="pie-de-pagina"${isHome ? ' data-cms-visible="visibilidad.pie"' : ''}>
  <!-- Plantilla compartida en scripts/footer.mjs -->
  <div class="altar-footer-inner">
${isYelp ? yelpDetails(prefix).trimEnd().split('\n').map(line => `  ${line}`).join('\n') + '\n' : ''}    <div class="altar-footer-main">
      <a class="altar-footer-logo" href="${prefix ? '../index.html' : '#top'}" aria-label="ALTAR, volver al inicio" data-cms-media-container>
        <img src="${escapeHtml(footerAsset(logoSource, 'imagen', prefix))}" width="960" height="201" alt="${escapeHtml(footerValue(logoSource, 'texto-alternativo'))}" loading="lazy"${logoBindings}>
      </a>
      <p class="altar-footer-statement"${statementBinding}>${statement}</p>
      <nav class="altar-footer-socials" aria-label="Redes sociales de ALTAR">
${altarSocials(isHome).split('\n').map(line => `  ${line}`).join('\n')}
      </nav>
    </div>
    <div class="altar-footer-note">
      ${copyright}
      <p class="altar-footer-motto"${isYelp ? '' : cmsAttribute('text', mottoKey)}>${motto}</p>
      <div class="altar-footer-links">
${isHome ? '        <a href="/intranet/" data-intranet-link hidden>Intranet</a>\n' : ''}        <a href="${returnUrl}"${cmsAttribute('text', returnKey)}>${escapeHtml(footerValue(slug, returnKey))}${!isHome && !isYelp ? ' <span aria-hidden="true">↗</span>' : ''}</a>
      </div>
    </div>
  </div>
</footer>`;
}

const verify = process.argv.includes('--check');
for (const [slug, [file, returnUrl, returnKey]] of Object.entries(pages)) {
  const fullPath = path.join(root, file);
  const original = fs.readFileSync(fullPath, 'utf8');
  const eol = original.includes('\r\n') ? '\r\n' : '\n';
  const prefix = slug === 'home' ? '' : '../';
  const footer = /^( *)<footer\b[^>]*>[\s\S]*?<\/footer>/m;
  assert.ok(footer.test(original), `Falta el pie en ${file}`);
  let updated = original.replace(footer, (_, indent) => renderFooter(slug, prefix, returnUrl, returnKey)
    .split('\n').map(line => indent + line).join(eol));
  const stylesheet = `  <link rel="stylesheet" href="${prefix}assets/css/altar-footer.css">`;
  if (!updated.includes(stylesheet)) updated = updated.replace('</head>', `${stylesheet}${eol}</head>`);
  if (verify) assert.ok(updated === original, `Ejecuta npm run sync:footer para actualizar ${file}`);
  else if (updated !== original) fs.writeFileSync(fullPath, updated);
}
