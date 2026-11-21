(() => {
  'use strict';

  const slug = document.currentScript.dataset.page;
  const root = new URL('../../', document.currentScript.src);
  const splitTemplates = new Map();

  function publicUrl(value, allowContact = false) {
    if (typeof value !== 'string' || !value.trim() || /[\u0000-\u001f\u007f]/.test(value)) return null;
    try {
      const url = new URL(value, root);
      if (url.username || url.password) return null;
      if (url.protocol === 'https:' || (url.protocol === 'http:' && url.origin === root.origin)) return url.href;
      if (allowContact && ['mailto:', 'tel:'].includes(url.protocol)) return url.href;
    } catch { /* Keep the original resource for invalid URLs. */ }
    return null;
  }

  function richInline(value, options = {}) {
    const { emphasis, link } = options;
    const tokens = ['\\*\\*(?<bold>[^*\\n]+)\\*\\*', '\\*(?<italic>[^*\\n]+)\\*', '\\n'];
    if (['statement', 'italic', 'unit'].includes(emphasis)) tokens.push('==(?<highlight>[^=\\n]+)==');
    if (link) tokens.push('\\[(?<linkText>[^\\[\\]\\n]+)\\]');
    const content = document.createDocumentFragment();
    let cursor = 0;
    for (const match of value.matchAll(new RegExp(tokens.join('|'), 'g'))) {
      const { bold, italic, highlight, linkText } = match.groups;
      content.append(value.slice(cursor, match.index));
      cursor = match.index + match[0].length;
      if (match[0] === '\n') {
        content.append(document.createElement('br'));
      } else if (linkText !== undefined) {
        const anchor = link.cloneNode(false);
        anchor.removeAttribute('id');
        anchor.removeAttribute('data-cms-text');
        anchor.append(richInline(linkText, { emphasis }));
        content.append(anchor);
      } else {
        const tag = bold ? 'strong' : italic || emphasis === 'italic' ? 'em' : 'span';
        const node = document.createElement(tag);
        if (highlight && emphasis === 'statement') node.className = 'statement-emphasis';
        node.append(richInline(bold ?? italic ?? highlight, options));
        content.append(node);
      }
    }
    content.append(value.slice(cursor));
    return content;
  }

  function richBlocks(value) {
    const content = document.createDocumentFragment();
    let paragraph = [];
    let list;
    function flushParagraph() {
      if (!paragraph.length) return;
      const element = document.createElement('p');
      element.append(richInline(paragraph.join('\n')));
      content.append(element);
      paragraph = [];
    }
    for (const line of value.replace(/\r/g, '').split('\n')) {
      const item = line.match(/^\s*(-|\d+\.)\s+(.+)$/);
      if (item) {
        flushParagraph();
        const type = item[1] === '-' ? 'ul' : 'ol';
        if (list?.localName !== type) {
          list = document.createElement(type);
          content.append(list);
        }
        const entry = document.createElement('li');
        entry.append(richInline(item[2]));
        list.append(entry);
      } else {
        list = undefined;
        if (line.trim()) paragraph.push(line);
        else flushParagraph();
      }
    }
    flushParagraph();
    return content;
  }

  function replaceText(element, keys, fields) {
    const rollovers = element.querySelectorAll(':scope > .btn-animate-y > span, :scope > .link-strong, :scope > .btn-ellipse-inner > span');
    const rich = element.dataset.cmsFormat === 'inline';
    for (const target of rollovers.length ? rollovers : [element]) {
      const textNodes = [...target.childNodes].filter(node => node.nodeType === Node.TEXT_NODE && node.data.trim());
      if (!textNodes.length && keys.length === 1 && typeof fields[keys[0]] === 'string') {
        target.prepend(rich ? richInline(fields[keys[0]]) : fields[keys[0]]);
      }
      textNodes.forEach((node, index) => {
        const value = fields[keys[index]];
        if (typeof value !== 'string') return;
        const text = node.data.match(/^\s*/)[0] + value + node.data.match(/\s*$/)[0];
        if (rich) node.replaceWith(richInline(text));
        else node.data = text;
      });
    }
  }

  function replaceCombinedText(fields) {
    document.querySelectorAll('[data-cms-combined]').forEach(element => {
      const value = fields[element.dataset.cmsCombined];
      if (typeof value !== 'string') return;
      const emphasis = element.dataset.cmsCombinedEmphasis;
      const link = element.hasAttribute('data-cms-combined-link') ? element.querySelector('a') : null;
      element.replaceChildren(richInline(value, { emphasis, link }));
    });
  }

  function applyHomePresentation(fields) {
    const pages = [root.pathname, new URL('index.html', root).pathname];
    document.querySelectorAll('[data-cms-visible]').forEach(element => {
      const value = fields[element.dataset.cmsVisible];
      if (value === 'true' || value === 'false') element.hidden = value === 'false';
    });
    document.querySelectorAll('a[href*="#"]').forEach(link => {
      const url = new URL(link.href, root);
      if (!url.hash || url.origin !== root.origin || !pages.includes(url.pathname)) return;
      let section;
      try { section = document.getElementById(decodeURIComponent(url.hash.slice(1))); } catch { return; }
      if (section?.closest('[data-cms-visible][hidden]')) {
        const item = link.closest('.inner-nav li') ?? link;
        item.setAttribute('data-cms-hidden-link', '');
        item.hidden = true;
      }
    });
    document.querySelectorAll('[data-cms-color], [data-cms-font-size]').forEach(element => {
      const color = fields[element.dataset.cmsColor];
      if (typeof color === 'string' && /^#[0-9a-f]{6}$/i.test(color)) element.style.color = color;
      const size = Number(fields[element.dataset.cmsFontSize]);
      if (Number.isInteger(size) && size >= 10 && size <= 120) {
        const min = Math.max(10, Math.round(size * 0.64));
        element.style.fontSize = `clamp(${min}px, ${(size / 12).toFixed(2)}vw, ${size}px)`;
        element.style.overflowWrap = 'anywhere';
      }
    });
  }

  function renderTestimonials(fields) {
    const grid = document.querySelector('[data-cms-testimonials]');
    if (!grid) return;
    const fieldGroup = grid.dataset.cmsTestimonials || 'testimonios';
    for (let index = 1; index <= 3; index += 1) {
      const prefix = `${fieldGroup}.testimonio-${index}`;
      const quote = fields[`${prefix}.cita`];
      const name = fields[`${prefix}.nombre`];
      const detail = fields[`${prefix}.detalle`];
      if (typeof quote !== 'string' || !quote.trim() || typeof name !== 'string' || !name.trim()) continue;
      const figure = document.createElement('figure');
      figure.className = 'testimony';
      const blockquote = document.createElement('blockquote');
      blockquote.textContent = `“${quote}”`;
      const caption = document.createElement('figcaption');
      caption.textContent = name;
      if (typeof detail === 'string' && detail.trim()) {
        const detailText = document.createElement('span');
        detailText.textContent = detail;
        caption.append(detailText);
      }
      figure.append(blockquote, caption);
      grid.append(figure);
      grid.hidden = false;
    }
    const pending = document.getElementById('testimonials-pending');
    if (!grid.hidden && pending) pending.hidden = true;
  }

  function removeMediaBinding(element, attribute, pictures) {
    if (attribute === 'href') {
      if (!element.hasAttribute('data-cms-clear-href')) return;
      element.removeAttribute('href');
      if (element.dataset.cmsClearHref === 'hide') element.setAttribute('data-cms-media-removed', '');
      return;
    }
    if (attribute === 'content' && element.getAttribute('property') === 'og:image') {
      element.remove();
      return;
    }
    if (!['src', 'srcset', 'poster'].includes(attribute)) return;
    element.removeAttribute(attribute);
    if (attribute === 'poster') return;

    const picture = element.closest('picture');
    if (picture) {
      pictures.add(picture);
      return;
    }
    if (attribute === 'srcset' || element.localName === 'source') return;
    if (element instanceof HTMLMediaElement) {
      element.querySelectorAll('source[src]').forEach(source => source.removeAttribute('src'));
      element.load();
    }
    element.setAttribute('data-cms-media-removed', '');
    element.closest('[data-cms-media-container]')?.setAttribute('data-cms-media-removed', '');
  }

  function updatePicture(picture) {
    if (picture.querySelector('img[src], img[srcset]')) return;
    const sources = [...picture.querySelectorAll('source[srcset]')].map(source => (
      source.media ? window.matchMedia(source.media) : null
    ));
    const syncVisibility = () => {
      picture.toggleAttribute('data-cms-media-removed', !sources.some(query => !query || query.matches));
    };
    syncVisibility();
    sources.forEach(query => query?.addEventListener('change', syncVisibility));
  }

  function apply(page) {
    if (typeof page.title === 'string' && page.title.trim()) document.title = page.title;
    const fields = page.fields && typeof page.fields === 'object' ? page.fields : {};
    const changedSplits = [];
    for (const [element, { children, keys }] of splitTemplates) {
      if (!element.classList.contains('splitting') || !keys.some(key => typeof fields[key] === 'string')) continue;
      element.replaceChildren(...children);
      changedSplits.push(element);
    }

    document.querySelectorAll('[data-cms-text]').forEach(element => replaceText(element, element.dataset.cmsText.split(' '), fields));
    replaceCombinedText(fields);
    const pictures = new Set();
    for (const attribute of ['src', 'srcset', 'alt', 'href', 'poster', 'content', 'aria-label']) {
      const binding = `data-cms-${attribute}`;
      document.querySelectorAll(`[${binding}]`).forEach(element => {
        const value = fields[element.getAttribute(binding)];
        const isUrl = ['src', 'srcset', 'href', 'poster'].includes(attribute) || element.getAttribute('property') === 'og:image';
        if (isUrl && value === '') {
          removeMediaBinding(element, attribute, pictures);
          return;
        }
        const content = isUrl ? publicUrl(value, attribute === 'href') : value;
        if (typeof content === 'string') element.setAttribute(attribute, content);
      });
    }
    pictures.forEach(updatePicture);

    for (const property of ['background', 'background-mobile']) {
      const binding = `data-cms-${property}`;
      document.querySelectorAll(`[${binding}]`).forEach(element => {
        const value = fields[element.getAttribute(binding)];
        const url = publicUrl(value);
        if (value === '') element.style.setProperty(`--cms-${property}`, 'none');
        else if (url) element.style.setProperty(`--cms-${property}`, `url(${JSON.stringify(url)})`);
      });
    }
    document.querySelectorAll('[data-cms-rich]').forEach(element => {
      const value = fields[element.dataset.cmsRich];
      if (typeof value === 'string') element.replaceChildren(richBlocks(value));
    });
    if (slug === 'home') applyHomePresentation(fields);

    changedSplits.forEach(target => window.Splitting?.({ target, force: true }));
    renderTestimonials(fields);
    return fields;
  }

  document.querySelectorAll('[data-splitting]').forEach(element => {
    const bindings = '[data-cms-text], [data-cms-combined]';
    const editable = [...element.querySelectorAll(bindings)];
    if (element.matches(bindings)) editable.push(element);
    const keys = editable.flatMap(node => [
      ...(node.dataset.cmsText?.split(' ') ?? []),
      ...(node.dataset.cmsCombined ? [node.dataset.cmsCombined] : [])
    ]);
    if (keys.length) splitTemplates.set(element, { children: [...element.childNodes].map(node => node.cloneNode(true)), keys });
  });

  async function readPublic(route) {
    if (!['http:', 'https:'].includes(root.protocol)) return null;
    try {
      const response = await fetch(new URL(route, root), {
        credentials: 'omit',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000)
      });
      return response.ok && response.headers.get('content-type')?.includes('application/json') ? await response.json() : null;
    } catch { return null; }
  }

  const ready = readPublic(`api/public/pages/${slug}`)
    .then(result => result?.page?.slug === slug ? apply(result.page) : {})
    .catch(() => ({}));
  window.ALTAR_CMS = { ready, publicUrl };

  const intranetLink = document.querySelector('[data-intranet-link]');
  if (intranetLink) {
    readPublic('api/health').then(result => {
      if (result?.status === 'ok') intranetLink.hidden = false;
    });
  }
})();
